// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { MarketType } from '../../../src/api/enums/MarketType';
import { PrivateKey, Networks } from 'particl-bitcore-lib';

describe('ItemCategoryListCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const categoryCommand = Commands.CATEGORY_ROOT.commandName;
    const categoryListCommand = Commands.CATEGORY_LIST.commandName;
    const marketCommand = Commands.MARKET_ROOT.commandName;
    const marketAddCommand = Commands.MARKET_ADD.commandName;

    let market: resources.Market;
    let profile: resources.Profile;
    let storefront: resources.Market;

    const storeFrontAdminData = {
        name: 'TEST-2',
        type: MarketType.STOREFRONT_ADMIN,
        receiveKey: 'receiveKey',
        publishKey: 'publishKey'
        // receiveKey !== publishKey
    };

    beforeAll(async () => {
        await testUtil.cleanDb();

        profile = await testUtil.getDefaultProfile();
        expect(profile.id).toBeDefined();
        market = await testUtil.getDefaultMarket(profile.id);
        expect(market.id).toBeDefined();

        // storefront admin
        const network = Networks.testnet;
        let privateKey: PrivateKey = PrivateKey.fromRandom(Networks.testnet);

        privateKey = PrivateKey.fromRandom(network);
        storeFrontAdminData.receiveKey = privateKey.toWIF();
        privateKey = PrivateKey.fromRandom(network);
        storeFrontAdminData.publishKey = privateKey.toWIF();    // but different
        storeFrontAdminData.name = storeFrontAdminData.receiveKey;
        log.debug('storeFrontAdminData: ', JSON.stringify(storeFrontAdminData, null, 2));

    });

    test('Should return default ItemCategories', async () => {
        const res = await testUtil.rpc(categoryCommand, [categoryListCommand]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        expect(result.key).toBeDefined();
        expect(result.name).toBe('ROOT');
        expect(result.market).toBeNull();
        expect(result.ParentItemCategory).not.toBeDefined();

        const childItemCategories = result.ChildItemCategories;
        expect(childItemCategories.length).toBeGreaterThan(0);
        const childChildItemCategories = childItemCategories[0].ChildItemCategories;
        expect(childChildItemCategories.length).toBeGreaterThan(0);
    });

    test('Should create a new market (STOREFRONT_ADMIN)', async () => {
        const res = await testUtil.rpc(marketCommand, [marketAddCommand,
            profile.id,
            storeFrontAdminData.name,
            storeFrontAdminData.type,
            storeFrontAdminData.receiveKey,
            storeFrontAdminData.publishKey,
            market.Identity.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.Market = res.getBody()['result'];
        expect(result.name).toBe(storeFrontAdminData.name);
        expect(result.type).toBe(storeFrontAdminData.type);
        expect(result.receiveKey).toBe(storeFrontAdminData.receiveKey);
        expect(result.receiveAddress).toBeDefined();
        expect(result.publishKey).toBe(storeFrontAdminData.publishKey);
        expect(result.publishAddress).toBeDefined();
        expect(result.receiveKey).not.toBe(result.publishKey);

        storefront = result;
    });

    test('Should return storefront ItemCategories', async () => {
        const res = await testUtil.rpc(categoryCommand, [categoryListCommand,
            storefront.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        expect(result.key).toBeDefined();
        expect(result.name).toBe('ROOT');
        expect(result.market).toBe(storefront.receiveAddress);
        expect(result.ParentItemCategory).not.toBeDefined();
    });

});
