// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { rpc, api } from '../lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { ShippingCountries } from '../../../src/core/helpers/ShippingCountries';
import { AddressType } from '../../../src/api/enums/AddressType';

describe('AddressAddCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const addressCommand = Commands.ADDRESS_ROOT.commandName;
    const addCommand = Commands.ADDRESS_ADD.commandName;

    let defaultProfileId;

    const testData = {
        title: 'Work',
        firstName: 'Johnny',
        lastName: 'Depp',
        addressLine1: '123 6th St',
        addressLine2: 'Melbourne, FL 32904',
        city: 'Melbourne',
        state: 'Mel State',
        country: 'Finland',
        zipCode: '85001',
        type: AddressType.SHIPPING_OWN
    };

    let defaultProfile;

    beforeAll(async () => {
        await testUtil.cleanDb();
        defaultProfile = await testUtil.getDefaultProfile();
        defaultProfileId = defaultProfile.id;
    });

    test('Should create a new Address for Profile', async () => {

        const res = await testUtil.rpc(addressCommand, [addCommand,
            defaultProfileId,
            testData.title,
            testData.firstName,
            testData.lastName,
            testData.addressLine1, testData.addressLine2,
            testData.city, testData.state, testData.country, testData.zipCode]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        expect(result.title).toBe(testData.title);
        expect(result.firstName).toBe(testData.firstName);
        expect(result.lastName).toBe(testData.lastName);
        expect(result.addressLine1).toBe(testData.addressLine1);
        expect(result.addressLine2).toBe(testData.addressLine2);
        expect(result.city).toBe(testData.city);
        expect(result.state).toBe(testData.state);
        expect(result.country).toBe(ShippingCountries.getCountryCode(testData.country));
        expect(result.zipCode).toBe(testData.zipCode);
    });

    test('Should fail because we want to create an empty Address without required fields', async () => {
        const res = await testUtil.rpc(addressCommand, [addCommand,
            testData.title,
            testData.firstName,
            testData.lastName,
            testData.addressLine1, testData.addressLine2,
            testData.city,
            testData.state,
            testData.country,
            'test'
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(`Entity with identifier Country code <TEST> was not valid! does not exist`);
    });

    test('Should fail to create Address because state is null', async () => {
        const res = await testUtil.rpc(addressCommand, [addCommand,
            defaultProfileId,
            testData.title,
            testData.firstName,
            testData.lastName,
            testData.addressLine1, testData.addressLine2,
            testData.city,
            null,
            testData.country,
            testData.zipCode
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.success).toBe(false);
        // TODO: better errors
        expect(res.error.error.message).toBe(`Request body is not valid`);
    });

    test('Should fail to create Address because state is undefined', async () => {
        const res = await testUtil.rpc(addressCommand, [addCommand,
            defaultProfileId,
            testData.title,
            testData.firstName,
            testData.lastName,
            testData.addressLine1, testData.addressLine2,
            testData.city, undefined, testData.country, testData.zipCode]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.success).toBe(false);
        // TODO: better errors
        expect(res.error.error.message).toBe(`Request body is not valid`);
    });

    test('Should create a new Address with blank state', async () => {

        const res = await testUtil.rpc(addressCommand, [addCommand,
            defaultProfileId,
            testData.title,
            testData.firstName,
            testData.lastName,
            testData.addressLine1, testData.addressLine2,
            testData.city, '', testData.country, testData.zipCode]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        expect(result.title).toBe(testData.title);
        expect(result.firstName).toBe(testData.firstName);
        expect(result.lastName).toBe(testData.lastName);
        expect(result.addressLine1).toBe(testData.addressLine1);
        expect(result.addressLine2).toBe(testData.addressLine2);
        expect(result.city).toBe(testData.city);
        expect(result.state).toBe('');
        expect(result.country).toBe(ShippingCountries.getCountryCode(testData.country));
        expect(result.zipCode).toBe(testData.zipCode);
    });

    // todo: why are we just testing the state here, I'd expect the country field to cause more trouble
});
