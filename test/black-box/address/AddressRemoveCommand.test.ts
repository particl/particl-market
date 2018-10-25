// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import * as _ from 'lodash';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { NotFoundException } from '../../../src/api/exceptions/NotFoundException';
import * as resources from 'resources';

describe('AddressRemoveCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const addressCommand = Commands.ADDRESS_ROOT.commandName;
    const addressRemoveCommand = Commands.ADDRESS_REMOVE.commandName;
    const addressAddCommand = Commands.ADDRESS_ADD.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;
    let createdAddress: resources.Address;

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

    test('Should fail because we want to remove an invalid address id', async () => {
        const res = await testUtil.rpc(addressCommand, [addressRemoveCommand, 0]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new NotFoundException(0).getMessage());
    });

    test('Should remove Address', async () => {
        const res = await testUtil.rpc(addressCommand, [addressRemoveCommand, createdAddress.id]);
        res.expectJson();
        res.expectStatusCode(200);
    });

    test('Should fail to remove Address because it was already removed', async () => {
        // remove address
        const res = await testUtil.rpc(addressCommand, [addressRemoveCommand, createdAddress.id]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new NotFoundException(createdAddress.id).getMessage());
    });

});
