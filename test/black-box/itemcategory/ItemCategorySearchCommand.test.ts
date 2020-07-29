// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { MarketType } from '../../../src/api/enums/MarketType';
import { PrivateKey, Networks } from 'particl-bitcore-lib';
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';

describe('ItemCategorySearchCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const categoryCommand = Commands.CATEGORY_ROOT.commandName;
    const categorySearchCommand = Commands.CATEGORY_SEARCH.commandName;
    const categoryListCommand = Commands.CATEGORY_LIST.commandName;
    const categoryAddCommand = Commands.CATEGORY_ADD.commandName;
    const marketCommand = Commands.MARKET_ROOT.commandName;
    const marketAddCommand = Commands.MARKET_ADD.commandName;

    let market: resources.Market;
    let profile: resources.Profile;
    let storefront: resources.Market;

    let defaultRootCategory: resources.ItemCategory;
    let storefrontRootCategory: resources.ItemCategory;
    let customStorefrontCategory: resources.ItemCategory;

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

        // first get the defaultRootCategory
        let res = await testUtil.rpc(categoryCommand, [categoryListCommand]);
        res.expectJson();
        res.expectStatusCode(200);
        defaultRootCategory = res.getBody()['result'];

        const network = Networks.testnet;
        let privateKey: PrivateKey = PrivateKey.fromRandom(Networks.testnet);

        privateKey = PrivateKey.fromRandom(network);
        storeFrontAdminData.receiveKey = privateKey.toWIF();
        privateKey = PrivateKey.fromRandom(network);
        storeFrontAdminData.publishKey = privateKey.toWIF();    // but different
        storeFrontAdminData.name = storeFrontAdminData.receiveKey;

    });


    test('Should create a new storefront (STOREFRONT_ADMIN)', async () => {
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


    test('Should create custom ItemCategory on the new storefront', async () => {

        let res = await testUtil.rpc(categoryCommand, [categoryListCommand,
            storefront.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        storefrontRootCategory = res.getBody()['result'];

        res = await testUtil.rpc(categoryCommand, [categoryAddCommand,
            storefront.id,
            'customcategoryname',
            'description',
            storefrontRootCategory.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        customStorefrontCategory = res.getBody()['result'];

        expect(customStorefrontCategory.name).toBe('customcategoryname');
        expect(customStorefrontCategory.description).toBe('description');
        expect(customStorefrontCategory.ParentItemCategory.id).toBe(storefrontRootCategory.id);
    });


    test('Should fail because missing search string', async () => {
        const res = await testUtil.rpc(categoryCommand, [categorySearchCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('name').getMessage());
    });


    test('Should fail because missing marketId', async () => {
        const res = await testUtil.rpc(categoryCommand, [categorySearchCommand,
            'customcategoryname'
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('marketId').getMessage());
    });


    test('Should fail because invalid search string', async () => {
        const res = await testUtil.rpc(categoryCommand, [categorySearchCommand,
            true,
            storefront.id
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('name', 'string').getMessage());
    });


    test('Should fail because invalid marketId', async () => {
        const res = await testUtil.rpc(categoryCommand, [categorySearchCommand,
            'customcategoryname',
            true
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('marketId', 'number').getMessage());
    });


    test('Should fail because Market not found', async () => {
        const res = await testUtil.rpc(categoryCommand, [categorySearchCommand,
            'customcategoryname',
            0
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('Market').getMessage());
    });


    test('Should not find any ItemCategories when the search string doesnt match', async () => {
        const res = await testUtil.rpc(categoryCommand, [categorySearchCommand,
            'NOTFOUNDCATEGORY',
            storefront.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.length).toBe(0);
    });

    test('Should find ItemCategories, when search string matches', async () => {
        const res = await testUtil.rpc(categoryCommand, [categorySearchCommand,
            'customcategoryname',
            storefront.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.ItemCategory[] = res.getBody()['result'];
        expect(result.length).not.toBe(0);
        expect(result[0].name).toBe('customcategoryname');
        expect(result[0].description).toBe('description');
    });

    test('Should find ItemCategories, when search string partially matches', async () => {
        const res = await testUtil.rpc(categoryCommand, [categorySearchCommand,
            'custom',
            storefront.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.ItemCategory[] = res.getBody()['result'];
        expect(result.length).not.toBe(0);
        expect(result[0].name).toBe('customcategoryname');
        expect(result[0].description).toBe('description');
    });

});
