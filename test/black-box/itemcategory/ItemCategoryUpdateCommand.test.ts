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
import { MarketType } from '../../../src/api/enums/MarketType';
import { hash } from 'omp-lib/dist/hasher/hash';

describe('ItemCategoryUpdateCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const categoryCommand = Commands.CATEGORY_ROOT.commandName;
    const categoryAddCommand = Commands.CATEGORY_ADD.commandName;
    const categoryUpdateCommand = Commands.CATEGORY_UPDATE.commandName;
    const categoryListCommand = Commands.CATEGORY_LIST.commandName;
    const marketCommand = Commands.MARKET_ROOT.commandName;
    const marketAddCommand = Commands.MARKET_ADD.commandName;

    let profile: resources.Profile;
    let market: resources.Market;
    let storefront: resources.Market

    let rootCategory: resources.ItemCategory;
    let childCategory1: resources.ItemCategory;
    let childCategory2: resources.ItemCategory;
    let childCategory11: resources.ItemCategory;

    beforeAll(async () => {
        await testUtil.cleanDb();

        profile = await testUtil.getDefaultProfile();
        expect(profile.id).toBeDefined();
        market = await testUtil.getDefaultMarket(profile.id);
        expect(market.id).toBeDefined();

        // categories can be only added to storefronts, so we need another market besides the default one
        let res = await testUtil.rpc(marketCommand, [marketAddCommand,
            profile.id,
            'MARKET-1',
            MarketType.STOREFRONT_ADMIN,
            '7p4YxUUqihJcC7KTvSe9zZPH9ByERDdfJvvoMLozJv8jnSUXARSj', // market.receiveKey,
            '7sfQkyrFSG7FSeynGTeLQXvBX2guB99t5ivCr9YPkEpmSwhYDA3w', // market.publishKey,
            market.Identity.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        storefront = res.getBody()['result'];
        expect(storefront.id).toBeDefined();
        expect(storefront.receiveAddress).toBe('pggehqLZXQs4QDP1g4wwRS9ou8fJK4Wteq');
        expect(storefront.publishAddress).toBe('pbN4jtNhbh5TEHBgbcHwWBBsABQfvi1gsx');

        log.debug('storefront:', JSON.stringify(storefront, null, 2));

        // first get the rootCategory
        res = await testUtil.rpc(categoryCommand, [categoryListCommand,
            storefront.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        rootCategory = res.getBody()['result'];

        // add child1 category
        res = await testUtil.rpc(categoryCommand, [categoryAddCommand,
            storefront.id,
            'child1',           // name
            'description',      // description
            rootCategory.id     // parent key/id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        childCategory1 = res.getBody()['result'];

        // add child2 category
        res = await testUtil.rpc(categoryCommand, [categoryAddCommand,
            storefront.id,
            'child2',           // name
            'description',      // description
            rootCategory.id     // parent key/id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        childCategory2 = res.getBody()['result'];

        // add child1_1 category
        res = await testUtil.rpc(categoryCommand, [categoryAddCommand,
            storefront.id,
            'child1_1',         // name
            'description',      // description
            childCategory1.id   // parent key/id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        childCategory11 = res.getBody()['result'];

        res = await testUtil.rpc(categoryCommand, [categoryListCommand,
            storefront.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        rootCategory = res.getBody()['result'];
        log.debug('root: ', JSON.stringify(rootCategory, null, 2));
    });

    test('Should fail to update, because missing categoryId', async () => {
        const res = await testUtil.rpc(categoryCommand, [categoryUpdateCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('categoryId').getMessage());
    });

    test('Should fail to update, because missing categoryName', async () => {
        const res = await testUtil.rpc(categoryCommand, [categoryUpdateCommand,
            childCategory11.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('categoryName').getMessage());
    });

    test('Should fail to update, because missing description', async () => {
        const res = await testUtil.rpc(categoryCommand, [categoryUpdateCommand,
            childCategory11.id,
            'newname'
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('description').getMessage());
    });

    test('Should not update ItemCategory, because invalid categoryId', async () => {
        const res = await testUtil.rpc(categoryCommand, [categoryUpdateCommand,
            'INVALIDID',
            'newname',
            'newdesc'
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('categoryId', 'number').getMessage());
    });

    test('Should not update ItemCategory, because invalid categoryName', async () => {
        const res = await testUtil.rpc(categoryCommand, [categoryUpdateCommand,
            childCategory11.id,
            0,
            'newdesc'
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('categoryName', 'string').getMessage());
    });

    test('Should not update ItemCategory, because invalid description', async () => {
        const res = await testUtil.rpc(categoryCommand, [categoryUpdateCommand,
            childCategory11.id,
            'newname',
            true
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('description', 'string').getMessage());
    });

    test('Should not update ItemCategory, because invalid parentCategoryId', async () => {
        const res = await testUtil.rpc(categoryCommand, [categoryUpdateCommand,
            childCategory11.id,
            'newname',
            'newdesc',
            'INVALID_ID'
        ]);
        res.expectJson();
        // res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('parentCategoryId', 'number').getMessage());
    });

    test('Should update the ItemCategory with new name, description and parent using id', async () => {

        let res = await testUtil.rpc(categoryCommand, [categoryUpdateCommand,
            childCategory11.id,
            'newname',
            'newdesc',
            childCategory2.id
        ]);
        res.expectJson();
        // res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        const path = [rootCategory.name, childCategory2.name, 'newname'];
        log.debug('path: ', path);
        log.debug('path.hash: ', hash(path.toString()));


        expect(result.name).toBe('newname');
        expect(result.description).toBe('newdesc');
        expect(result.key).toBe(hash(path.toString()));
        expect(result.ParentItemCategory.id).toBe(childCategory2.id);
        expect(result.ParentItemCategory.name).toBe(childCategory2.name);

        res = await testUtil.rpc(categoryCommand, [categoryListCommand,
            storefront.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        rootCategory = res.getBody()['result'];
        // log.debug('root: ', JSON.stringify(rootCategory, null, 2));

    });



});
