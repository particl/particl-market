// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { NotFoundException } from '../../../src/api/exceptions/NotFoundException';

describe('ProfileGetCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const profileCommand = Commands.PROFILE_ROOT.commandName;
    const profileGetCommand = Commands.PROFILE_GET.commandName;

    let market: resources.Market;
    let profile: resources.Profile;

    beforeAll(async () => {
        await testUtil.cleanDb();

        profile = await testUtil.getDefaultProfile();
        expect(profile.id).toBeDefined();
        market = await testUtil.getDefaultMarket(profile.id);
        expect(market.id).toBeDefined();

    });

    test('Should return one Profile by id', async () => {
        const res = await testUtil.rpc(profileCommand, [profileGetCommand, profile.id]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Profile = res.getBody()['result'];
        expect(result.id).toBe(profile.id);
        expect(result.name).toBe(profile.name);
        expect(result.address).toBe(profile.address);
        expect(result.CryptocurrencyAddresses).toBeDefined();
        expect(result.FavoriteItems).toBeDefined();
        expect(result.ShippingAddresses).toBeDefined();
        expect(result.ShoppingCart).toBeDefined();
    });

    test('Should return one Profile by name', async () => {
        const res = await testUtil.rpc(profileCommand, [profileGetCommand, profile.name]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        expect(result.id).toBe(profile.id);
        expect(result.name).toBe(profile.name);
        expect(result.address).toBe(profile.address);
        expect(result.CryptocurrencyAddresses).toBeDefined();
        expect(result.FavoriteItems).toBeDefined();
        expect(result.ShippingAddresses).toBeDefined();
        expect(result.ShoppingCart).toBeDefined();
    });

    test('Should fail to return Profile with invalid name', async () => {
        const badProfileName = 'invalid_profile_name';
        const res = await testUtil.rpc(profileCommand, [profileGetCommand, badProfileName]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new NotFoundException(badProfileName).getMessage());
   });

    test('Should fail to return Profile with invalid id', async () => {
        const badProfileId = 123123;
        const res = await testUtil.rpc(profileCommand, [profileGetCommand, badProfileId]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new NotFoundException(badProfileId).getMessage());
    });

});
