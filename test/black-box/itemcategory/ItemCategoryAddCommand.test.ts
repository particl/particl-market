// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { NotFoundException } from '../../../src/api/exceptions/NotFoundException';
import { MessageException } from '../../../src/api/exceptions/MessageException';
import { MarketType } from '../../../src/api/enums/MarketType';
import { PrivateKey, Networks } from 'particl-bitcore-lib';

describe('ItemCategoryAddCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const categoryCommand = Commands.CATEGORY_ROOT.commandName;
    const categoryAddCommand = Commands.CATEGORY_ADD.commandName;
    const categoryListCommand = Commands.CATEGORY_LIST.commandName;
    const marketCommand = Commands.MARKET_ROOT.commandName;
    const marketAddCommand = Commands.MARKET_ADD.commandName;

    let market: resources.Market;
    let profile: resources.Profile;
    let parentCategory: resources.ItemCategory;
    let storefront: resources.Market;

    const categoryData = {
        name: 'Sample Category 1',
        description: 'Sample Category Description 1'
    };

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

        const res = await testUtil.rpc(categoryCommand, [categoryListCommand,
            market.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        parentCategory = res.getBody()['result'];

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

    test('Should fail to create the ItemCategory because missing marketId', async () => {
        const res = await testUtil.rpc(categoryCommand, [categoryAddCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('marketId').getMessage());
    });

    test('Should fail to create the ItemCategory because missing categoryName', async () => {
        const res = await testUtil.rpc(categoryCommand, [categoryAddCommand,
            market.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('categoryName').getMessage());
    });

    test('Should fail to create the ItemCategory because missing description', async () => {
        const res = await testUtil.rpc(categoryCommand, [categoryAddCommand,
            market.id,
            categoryData.name
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('description').getMessage());
    });

    test('Should fail to create the ItemCategory because missing parentCategoryId', async () => {
        const res = await testUtil.rpc(categoryCommand, [categoryAddCommand,
            market.id,
            categoryData.name,
            categoryData.description
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('parentItemCategoryId').getMessage());
    });

    test('Should fail to create the ItemCategory because non-existing parentCategoryId', async () => {
        const res = await testUtil.rpc(categoryCommand, [categoryAddCommand,
            market.id,
            categoryData.name,
            categoryData.description,
            0
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new NotFoundException(0).getMessage());
    });

    test('Should fail to create the ItemCategory because invalid parentCategoryId', async () => {
        const res = await testUtil.rpc(categoryCommand, [categoryAddCommand,
            market.id,
            categoryData.name,
            categoryData.description,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('parentItemCategoryId', 'number').getMessage());
    });

    test('Should fail to create the ItemCategory because invalid categoryName', async () => {
        const res = await testUtil.rpc(categoryCommand, [categoryAddCommand,
            market.id,
            true,
            categoryData.description,
            parentCategory.id
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('categoryName', 'string').getMessage());
    });

    test('Should fail to create the ItemCategory because invalid description', async () => {
        const res = await testUtil.rpc(categoryCommand, [categoryAddCommand,
            market.id,
            categoryData.name,
            true,
            parentCategory.id
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('description', 'string').getMessage());
    });

    test('Should fail to create the ItemCategory because market is not a storefront', async () => {
        const res = await testUtil.rpc(categoryCommand, [categoryAddCommand,
            market.id,
            categoryData.name,
            categoryData.description,
            parentCategory.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(
            new MessageException('You can only add ItemCategories on Storefronts if you have the publish rights.').getMessage());
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

    test('Should fail to create the ItemCategory because parent ItemCategory belongs to different Market', async () => {
        const res = await testUtil.rpc(categoryCommand, [categoryAddCommand,
            storefront.id,
            categoryData.name,
            categoryData.description,
            parentCategory.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(
            new MessageException('Parent ItemCategory belongs to different Market.').getMessage());
    });

    test('Should create the ItemCategory under parentCategory', async () => {
        let res = await testUtil.rpc(categoryCommand, [categoryListCommand,
            storefront.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        parentCategory = res.getBody()['result'];

        res = await testUtil.rpc(categoryCommand, [categoryAddCommand,
            storefront.id,
            categoryData.name,
            categoryData.description,
            parentCategory.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.ItemCategory = res.getBody()['result'];
        expect(result.name).toBe(categoryData.name);
        expect(result.description).toBe(categoryData.description);
        expect(result.ParentItemCategory.id).toBe(parentCategory.id);
    });

});
