// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { CountryCodeNotFoundException } from '../../../src/api/exceptions/CountryCodeNotFoundException';

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

    test('Should fail to update because missing addressId', async () => {
        const res = await testUtil.rpc(addressCommand, [addressUpdateCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('addressId').getMessage());
    });

    test('Should fail to update because missing title', async () => {
        const res = await testUtil.rpc(addressCommand, [addressUpdateCommand,
            defaultProfile.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('title').getMessage());
    });

    test('Should fail to update because missing firstName', async () => {
        const res = await testUtil.rpc(addressCommand, [addressUpdateCommand,
            defaultProfile.id,
            testData.title
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('firstName').getMessage());
    });

    test('Should fail to update because missing lastName', async () => {
        const res = await testUtil.rpc(addressCommand, [addressUpdateCommand,
            defaultProfile.id,
            testData.title,
            testData.firstName
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('lastName').getMessage());
    });

    test('Should fail to update because missing addressLine1', async () => {
        const res = await testUtil.rpc(addressCommand, [addressUpdateCommand,
            defaultProfile.id,
            testData.title,
            testData.firstName,
            testData.lastName
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('addressLine1').getMessage());
    });

    test('Should fail to update because missing addressLine2', async () => {
        const res = await testUtil.rpc(addressCommand, [addressUpdateCommand,
            defaultProfile.id,
            testData.title,
            testData.firstName,
            testData.lastName,
            testData.addressLine1
        ]);
        res.expectJson();
        res.expectStatusCode(404);
         expect(res.error.error.message).toBe(new MissingParamException('addressLine2').getMessage());
    });

    test('Should fail to update because missing city', async () => {
        const res = await testUtil.rpc(addressCommand, [addressUpdateCommand,
            defaultProfile.id,
            testData.title,
            testData.firstName,
            testData.lastName,
            testData.addressLine1,
            testData.addressLine2
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('city').getMessage());
    });

    test('Should fail to update because missing state', async () => {
        const res = await testUtil.rpc(addressCommand, [addressUpdateCommand,
            defaultProfile.id,
            testData.title,
            testData.firstName,
            testData.lastName,
            testData.addressLine1,
            testData.addressLine2,
            testData.city
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('state').getMessage());
    });

    test('Should fail to update because missing country', async () => {
        const res = await testUtil.rpc(addressCommand, [addressUpdateCommand,
            defaultProfile.id,
            testData.title,
            testData.firstName,
            testData.lastName,
            testData.addressLine1,
            testData.addressLine2,
            testData.city,
            testData.state
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('country').getMessage());
    });

    test('Should fail to update because missing zipCode', async () => {
        const res = await testUtil.rpc(addressCommand, [addressUpdateCommand,
            defaultProfile.id,
            testData.title,
            testData.firstName,
            testData.lastName,
            testData.addressLine1,
            testData.addressLine2,
            testData.city,
            testData.state,
            testData.country
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('zipCode').getMessage());
    });

    // TODO: missing invalid param tests

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

    test('Should update the Address with blank state field', async () => {
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

    test('Should fail to update because invalid countryCode', async () => {
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
        expect(res.error.error.message).toBe(new CountryCodeNotFoundException('WW').getMessage());
    });

    test('Should fail to update because invalid country', async () => {
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
        expect(res.error.error.message).toBe(new CountryCodeNotFoundException('ATLANTIDA').getMessage());
    });

});
