// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { Logger as LoggerType } from '../../../src/core/Logger';
import * as resources from 'resources';

describe('AddressUpdateCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const addressCommand = Commands.ADDRESS_ROOT.commandName;
    const addressUpdateCommand = Commands.ADDRESS_UPDATE.commandName;
    const addressAddCommand = Commands.ADDRESS_ADD.commandName;

    const testData = {
        firstName: 'Johnny',
        lastName: 'Depp',
        title: 'Work',
        addressLine1: '123 6th St',
        addressLine2: 'Melbourne, FL 32904',
        city: 'Melbourne',
        state: 'Mel State',
        country: 'Finland',
        zipCode: '85001'
    };

    const testDataUpdated = {
        firstName: 'Robert',
        lastName: 'Downey',
        title: 'Work',
        addressLine1: '123 6th St',
        addressLine2: 'Melbourne, FL 32904',
        city: 'Melbourne',
        state: 'test state updated',
        country: 'FI',
        zipCode: '85001'
    };

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;
    let createdAddress: resources.Address;

    beforeAll(async () => {
        await testUtil.cleanDb();

        // get default profile and market
        defaultProfile = await testUtil.getDefaultProfile();
        defaultMarket = await testUtil.getDefaultMarket();

        // add address
        const res = await testUtil.rpc(addressCommand, [addressAddCommand,
            defaultProfile.id,
            testData.title,
            testData.firstName,
            testData.lastName,
            testData.addressLine1,
            testData.addressLine2,
            testData.city,
            testData.state,
            testData.country,
            testData.zipCode
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        createdAddress = res.getBody()['result'];
    });

    test('Should update the Address', async () => {

        const res = await testUtil.rpc(addressCommand, [addressUpdateCommand,
            createdAddress.id,
            testDataUpdated.title,
            testDataUpdated.firstName,
            testDataUpdated.lastName,
            testDataUpdated.addressLine1,
            testDataUpdated.addressLine2,
            testDataUpdated.city,
            testDataUpdated.state,
            testDataUpdated.country,
            testDataUpdated.zipCode
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Address = res.getBody()['result'];
        expect(result.title).toBe(testDataUpdated.title);
        expect(result.firstName).toBe(testDataUpdated.firstName);
        expect(result.lastName).toBe(testDataUpdated.lastName);
        expect(result.addressLine1).toBe(testDataUpdated.addressLine1);
        expect(result.addressLine2).toBe(testDataUpdated.addressLine2);
        expect(result.city).toBe(testDataUpdated.city);
        expect(result.state).toBe(testDataUpdated.state);
        expect(result.country).toBe(testDataUpdated.country);
        expect(result.zipCode).toBe(testDataUpdated.zipCode);

    });

    test('Should fail because we want to update without required fields', async () => {
        const res = await testUtil.rpc(addressCommand, [addressUpdateCommand,
            testDataUpdated.title,
            testDataUpdated.firstName,
            testDataUpdated.lastName,
            testDataUpdated.addressLine1,
            testDataUpdated.addressLine2,
            testDataUpdated.city,
            testDataUpdated.state,
            testDataUpdated.country,
            'test'
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(`Invalid addressId.`);
    });

    test('Should fail because we want to update with null state field', async () => {
        const res = await testUtil.rpc(addressCommand, [addressUpdateCommand,
            createdAddress.id,
            testDataUpdated.title,
            testDataUpdated.firstName,
            testDataUpdated.lastName,
            testDataUpdated.addressLine1,
            testDataUpdated.addressLine2,
            testDataUpdated.city,
            null,
            testDataUpdated.country,
            testDataUpdated.zipCode
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(`Invalid state.`);
    });

    test('Should fail because we want to update with undefined state field', async () => {
        const res = await testUtil.rpc(addressCommand, [addressUpdateCommand,
            createdAddress.id,
            testDataUpdated.title,
            testDataUpdated.firstName,
            testDataUpdated.lastName,
            testDataUpdated.addressLine1,
            testDataUpdated.addressLine2,
            testDataUpdated.city,
            undefined,
            testDataUpdated.country,
            testDataUpdated.zipCode
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(`Invalid state.`);
    });

    test('Should update the address with blank state field', async () => {
        // update address
        const res = await testUtil.rpc(addressCommand, [addressUpdateCommand,
            createdAddress.id,
            testDataUpdated.title,
            testDataUpdated.firstName,
            testDataUpdated.lastName,
            testDataUpdated.addressLine1,
            testDataUpdated.addressLine2,
            testDataUpdated.city,
            '',
            testDataUpdated.country,
            testDataUpdated.zipCode
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.title).toBe(testDataUpdated.title);
        expect(result.firstName).toBe(testDataUpdated.firstName);
        expect(result.lastName).toBe(testDataUpdated.lastName);
        expect(result.addressLine1).toBe(testDataUpdated.addressLine1);
        expect(result.addressLine2).toBe(testDataUpdated.addressLine2);
        expect(result.city).toBe(testDataUpdated.city);
        expect(result.state).toBe('');
        expect(result.country).toBe(testDataUpdated.country);
        expect(result.zipCode).toBe(testDataUpdated.zipCode);
    });

    test('Should check countryCode validation', async () => {
        const res = await testUtil.rpc(addressCommand, [addressUpdateCommand,
            createdAddress.id,
            testDataUpdated.title,
            testDataUpdated.firstName,
            testDataUpdated.lastName,
            testDataUpdated.addressLine1,
            testDataUpdated.addressLine2,
            testDataUpdated.city,
            testDataUpdated.state,
            'WW',
            testDataUpdated.zipCode
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(`Country code WW was not found!`);
    });


    test('Should check countryName validation', async () => {
        const res = await testUtil.rpc(addressCommand, [addressUpdateCommand,
            createdAddress.id,
            testDataUpdated.title,
            testDataUpdated.firstName,
            testDataUpdated.lastName,
            testDataUpdated.addressLine1,
            testDataUpdated.addressLine2,
            testDataUpdated.city,
            testDataUpdated.state,
            'Atlantida',
            testDataUpdated.zipCode
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(`Country code ATLANTIDA was not found!`);
    });

});
