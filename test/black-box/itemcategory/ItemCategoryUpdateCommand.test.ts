// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';

describe('ItemCategoryUpdateCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const categoryCommand = Commands.CATEGORY_ROOT.commandName;
    const categoryAddCommand = Commands.CATEGORY_ADD.commandName;
    const categoryUpdateCommand = Commands.CATEGORY_UPDATE.commandName;
    const categoryListCommand = Commands.CATEGORY_LIST.commandName;

    let market: resources.Market;
    let profile: resources.Profile;

    let rootCategory: resources.ItemCategory;
    let childCategory1: resources.ItemCategory;
    let childCategory2: resources.ItemCategory;
    let childCategory11: resources.ItemCategory;
    let defaultCategory: resources.ItemCategory;

    beforeAll(async () => {
        await testUtil.cleanDb();

        market = await testUtil.getDefaultMarket();
        profile = await testUtil.getDefaultProfile();

        // first get the rootCategory
        const res = await testUtil.rpc(categoryCommand, [categoryListCommand]);
        res.expectJson();
        res.expectStatusCode(200);
        rootCategory = res.getBody()['result'];

        // add child1 category
        let response = await testUtil.rpc(categoryCommand, [categoryAddCommand,
            market.id,
            'child1',           // name
            'description',      // description
            rootCategory.id     // parent key/id
        ]);
        response.expectJson();
        response.expectStatusCode(200);
        childCategory1 = response.getBody()['result'];

        // add child2 category
        response = await testUtil.rpc(categoryCommand, [categoryAddCommand,
            market.id,
            'child2',           // name
            'description',      // description
            rootCategory.id     // parent key/id
        ]);
        response.expectJson();
        response.expectStatusCode(200);
        childCategory2 = response.getBody()['result'];

        // add child1_1 category
        response = await testUtil.rpc(categoryCommand, [categoryAddCommand,
            market.id,
            'child1_1',         // name
            'description',      // description
            childCategory1.id   // parent key/id
        ]);
        response.expectJson();
        response.expectStatusCode(200);
        childCategory11 = response.getBody()['result'];

        defaultCategory = await testUtil.addData(CreatableModel.ITEMCATEGORY, {
            market: market.receiveAddress,
            key: 'cat_DEFAULT',
            name: 'default category',
            description: 'default description',
            parent_item_category_id: childCategory2.id
        });

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

        const res = await testUtil.rpc(categoryCommand, [categoryUpdateCommand,
            childCategory11.id,
            'newname',
            'newdesc',
            childCategory2.id
        ]);
        res.expectJson();
        // res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.name).toBe('newname');
        expect(result.description).toBe('newdesc');
        expect(result.ParentItemCategory.id).toBe(childCategory2.id);
        expect(result.ParentItemCategory.name).toBe(childCategory2.name);
    });

});
