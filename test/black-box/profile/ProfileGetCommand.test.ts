// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as _ from 'lodash';
import { api, rpc } from '../lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { Logger as LoggerType } from '../../../src/core/Logger';
import * as resources from 'resources';

describe('ProfileGetCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const profileCommand = Commands.PROFILE_ROOT.commandName;
    const profileGetCommand = Commands.PROFILE_GET.commandName;

    let defaultMarket: resources.Market;
    let defaultProfile: resources.Profile;

    beforeAll(async () => {
        await testUtil.cleanDb();

        defaultMarket = await testUtil.getDefaultMarket();
        defaultProfile = await testUtil.getDefaultProfile();

    });

    test('Should return one Profile by id', async () => {
        const res = await rpc(profileCommand, [profileGetCommand, defaultProfile.id]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Profile = res.getBody()['result'];
        expect(result.id).toBe(defaultProfile.id);
        expect(result.name).toBe(defaultProfile.name);
        expect(result.address).toBe(defaultProfile.address);
        expect(result.CryptocurrencyAddresses).toBeDefined();
        expect(result.FavoriteItems).toBeDefined();
        expect(result.ShippingAddresses).toBeDefined();
        expect(result.ShoppingCart).toBeDefined();
    });

    test('Should return one Profile by name', async () => {
        const res = await rpc(profileCommand, [profileGetCommand, defaultProfile.name]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        expect(result.id).toBe(defaultProfile.id);
        expect(result.name).toBe(defaultProfile.name);
        expect(result.address).toBe(defaultProfile.address);
        expect(result.CryptocurrencyAddresses).toBeDefined();
        expect(result.FavoriteItems).toBeDefined();
        expect(result.ShippingAddresses).toBeDefined();
        expect(result.ShoppingCart).toBeDefined();
    });

    test('Should fail to return Profile with invalid name', async () => {
        const res = await rpc(profileCommand, [profileGetCommand, 'invalid_profile_name']);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(`Entity with identifier invalid_profile_name does not exist`);
   });

    test('Should fail to return Profile with invalid id', async () => {
        const res = await rpc(profileCommand, [profileGetCommand, 123123]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(`Entity with identifier 123123 does not exist`);
    });

});
