// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { AddressType } from '../../../src/api/enums/AddressType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import * as resources from 'resources';
import { GenerateProfileParams } from '../../../src/api/requests/params/GenerateProfileParams';
import { Logger as LoggerType } from '../../../src/core/Logger';

describe('AddressListCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const addressCommand = Commands.ADDRESS_ROOT.commandName;
    const addressListCommand = Commands.ADDRESS_LIST.commandName;
    const addressAddCommand = Commands.ADDRESS_ADD.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;

    const testData = {
        firstName: 'Johnny',
        lastName: 'Depp',
        title: 'Work',
        addressLine1: '123 6th St',
        addressLine2: 'Melbourne, FL 32904',
        city: 'Melbourne',
        state: 'Mel State',
        country: 'Finland',
        zipCode: '85001',
        type: AddressType.SHIPPING_OWN
    };

    const testDataNotOwn = {
        firstName: 'Johnny',
        lastName: 'Depp',
        title: 'Work',
        addressLine1: '123 6th St',
        addressLine2: 'Melbourne, FL 32904',
        city: 'Melbourne',
        state: 'Mel State',
        country: 'Finland',
        zipCode: '85001',
        type: AddressType.SHIPPING_ORDER
    };

    beforeAll(async () => {
        await testUtil.cleanDb();

        // get default profile and market
        defaultProfile = await testUtil.getDefaultProfile(false);
        defaultMarket = await testUtil.getDefaultMarket();
    });

    test('Should list empty address list for default profile id', async () => {
        const res = await testUtil.rpc(addressCommand, [addressListCommand, defaultProfile.id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.Address[] = res.getBody()['result'];
        expect(result.length).toBe(0);
    });

    test('Should return code 500 when no profile is given', async () => {
        const res = await testUtil.rpc(addressCommand, [addressListCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(`Missing profileId.`);
    });

    test('Should list one address for default profile id', async () => {

        let res = await testUtil.rpc(addressCommand, [addressAddCommand,
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

        // list created addresses
        res = await testUtil.rpc(addressCommand, [addressListCommand, defaultProfile.id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.Address[] = res.getBody()['result'];
        expect(result.length).toBe(1);

    });

    test('Should list two addresses for default profile id', async () => {
        // add address
        let res = await testUtil.rpc(addressCommand, [addressAddCommand,
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

        // list created addresses
        res = await testUtil.rpc(addressCommand, [addressListCommand, defaultProfile.id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.Address[] = res.getBody()['result'];
        expect(result.length).toBe(2);
    });

    test('Check against SHIPPING_OWN - should list two addresses by default and one otherwise', async () => {
        // add address
        let res = await testUtil.rpc(addressCommand, [addressAddCommand,
            defaultProfile.id,
            testDataNotOwn.title,
            testDataNotOwn.firstName,
            testDataNotOwn.lastName,
            testDataNotOwn.addressLine1,
            testDataNotOwn.addressLine2,
            testDataNotOwn.city,
            testDataNotOwn.state,
            testDataNotOwn.country,
            testDataNotOwn.zipCode,
            testDataNotOwn.type]);
        res.expectJson();
        res.expectStatusCode(200);

        // list created addresses
        res = await testUtil.rpc(addressCommand, [addressListCommand, defaultProfile.id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.Address[] = res.getBody()['result'];
        expect(result.length).toBe(2);

        res = await testUtil.rpc(addressCommand, [addressListCommand, defaultProfile.id, AddressType.SHIPPING_ORDER]);
        res.expectJson();
        res.expectStatusCode(200);
        const resultOrder: resources.Address[] = res.getBody()['result'];
        expect(resultOrder.length).toBe(1);
    });

    test('Should return only for a particular Profile', async () => {

        const generateProfileParams = new GenerateProfileParams([
            false,
            false
        ]).toParamsArray();

        const profiles = await testUtil.generateData(
            CreatableModel.PROFILE,
            1,
            true,
            generateProfileParams
        ) as resources.Profile[];

        let res = await testUtil.rpc(addressCommand, [addressAddCommand,
            profiles[0].id,
            testDataNotOwn.title,
            testDataNotOwn.firstName,
            testDataNotOwn.lastName,
            testDataNotOwn.addressLine1,
            testDataNotOwn.addressLine2,
            testDataNotOwn.city,
            testDataNotOwn.state,
            testDataNotOwn.country,
            testDataNotOwn.zipCode
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        // list created addresses
        res = await testUtil.rpc(addressCommand, [addressListCommand, profiles[0].id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.Address[] = res.getBody()['result'];
        expect(result.length).toBe(1);
    });
});
