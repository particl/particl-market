// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { MessageException } from '../../../src/api/exceptions/MessageException';
import { NotFoundException } from '../../../src/api/exceptions/NotFoundException';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException'

describe('ItemCategoryUpdateCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const categoryCommand = Commands.CATEGORY_ROOT.commandName;
    const categoryAddCommand = Commands.CATEGORY_ADD.commandName;
    const categoryUpdateCommand = Commands.CATEGORY_UPDATE.commandName;

    let rootCategory: resources.ItemCategory;
    let childCategory1: resources.ItemCategory;
    let childCategory2: resources.ItemCategory;
    let childCategory11: resources.ItemCategory;
    let defaultCategory: resources.ItemCategory;

    beforeAll(async () => {
        await testUtil.cleanDb();

        rootCategory = await testUtil.addData(CreatableModel.ITEMCATEGORY, {
            key: 'cat_DEFAULT_TESTING_CATEGORY',
            name: 'ROOT CATEGORY NAME',
            description: 'root category description',
            parent_item_category_id: 0
        });

        // add child1 category
        let response = await testUtil.rpc(categoryCommand, [categoryAddCommand,
            'child1',           // name
            'description',      // description
            rootCategory.id     // parent key/id
        ]);
        response.expectJson();
        response.expectStatusCode(200);
        childCategory1 = response.getBody()['result'];

        // add child2 category
        response = await testUtil.rpc(categoryCommand, [categoryAddCommand,
            'child2',           // name
            'description',      // description
            rootCategory.id     // parent key/id
        ]);
        response.expectJson();
        response.expectStatusCode(200);
        childCategory2 = response.getBody()['result'];

        // add child1_1 category
        response = await testUtil.rpc(categoryCommand, [categoryAddCommand,
            'child1_1',         // name
            'description',      // description
            childCategory1.id   // parent key/id
        ]);
        response.expectJson();
        response.expectStatusCode(200);
        childCategory11 = response.getBody()['result'];

        defaultCategory = await testUtil.addData(CreatableModel.ITEMCATEGORY, {
            key: 'cat_DEFAULT',
            name: 'default category',
            description: 'default description',
            parent_item_category_id: childCategory2.id
        });

    });

    test('Should update the ItemCategory with new name, description and parent using id', async () => {

        const res = await testUtil.rpc(categoryCommand, [categoryUpdateCommand,
            childCategory11.id,
            'newname',
            'newdesc',
            childCategory2.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.name).toBe('newname');
        expect(result.description).toBe('newdesc');
        expect(result.parentItemCategoryId).toBe(childCategory2.id);
        expect(result.ParentItemCategory.name).toBe(childCategory2.name);
    });

    test('Should fail to update ItemCategory, because its a default ItemCategory', async () => {
        const res = await testUtil.rpc(categoryCommand, [categoryUpdateCommand,
            defaultCategory.id,
            'newname',
            'newdesc'
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('Default category can\'t be updated or deleted.');
    });

    test('Should fail to update ItemCategory, because its a default ItemCategory', async () => {
        const res = await testUtil.rpc(categoryCommand, [categoryUpdateCommand,
            defaultCategory.id,
            'newname',
            'newdesc',
            childCategory2.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('Default category can\'t be updated or deleted.');
    });

    test('Should fail to update ItemCategory, because missing description', async () => {
        const tmpUpdateData = {
            categoryId: defaultCategory.id,
            categoryName: 'NEW_CATEGORY_NAME',
        };
        const res = await testUtil.rpc(categoryCommand, [categoryUpdateCommand,
            tmpUpdateData.categoryId,
            tmpUpdateData.categoryName
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('description').getMessage());
    });

    test('Should fail to update ItemCategory, because missing categoryName', async () => {
        const tmpUpdateData = {
            categoryId: defaultCategory.id,
        };
        const res = await testUtil.rpc(categoryCommand, [categoryUpdateCommand,
            tmpUpdateData.categoryId,
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('categoryName').getMessage());
    });

    test('Should fail to update ItemCategory, because missing categoryId', async () => {
        const tmpUpdateData = {
        };
        const res = await testUtil.rpc(categoryCommand, [categoryUpdateCommand,
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('categoryId').getMessage());
    });

    test('Should fail to update ItemCategory, because invalid categoryId', async () => {
        const tmpUpdateData = {
            categoryId: null,
            categoryName: 'NEW_CATEGORY_NAME',
            description: 'NEW_DESCRIPTION',
            parentItemCategoryKey: childCategory2.id
        };
        const res = await testUtil.rpc(categoryCommand, [categoryUpdateCommand,
            tmpUpdateData.categoryId,
            tmpUpdateData.categoryName,
            tmpUpdateData.description,
            tmpUpdateData.parentItemCategoryKey
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new InvalidParamException('categoryId', 'number').getMessage());
    });

    test('Should fail to update ItemCategory, because invalid categoryId', async () => {
        const tmpUpdateData = {
            categoryId: 'INVALID_CATEGORY_ID',
            categoryName: 'NEW_CATEGORY_NAME',
            description: 'NEW_DESCRIPTION',
            parentItemCategoryKey: childCategory2.id
        };
        const res = await testUtil.rpc(categoryCommand, [categoryUpdateCommand,
            tmpUpdateData.categoryId,
            tmpUpdateData.categoryName,
            tmpUpdateData.description,
            tmpUpdateData.parentItemCategoryKey
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new InvalidParamException('categoryId', 'number').getMessage());
    });

    test('Should fail to update ItemCategory, because invalid categoryId', async () => {
        const tmpUpdateData = {
            categoryId: -1,
            categoryName: 'NEW_CATEGORY_NAME',
            description: 'NEW_DESCRIPTION',
            parentItemCategoryKey: childCategory2.id
        };
        const res = await testUtil.rpc(categoryCommand, [categoryUpdateCommand,
            tmpUpdateData.categoryId,
            tmpUpdateData.categoryName,
            tmpUpdateData.description,
            tmpUpdateData.parentItemCategoryKey
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new InvalidParamException('categoryId', 'number').getMessage());
    });

    test('Should fail to update ItemCategory, because invalid categoryName', async () => {
        const tmpUpdateData = {
            categoryId: defaultCategory.id,
            categoryName: null,
            description: 'NEW_DESCRIPTION',
            parentItemCategoryKey: childCategory2.id
        };
        const res = await testUtil.rpc(categoryCommand, [categoryUpdateCommand,
            tmpUpdateData.categoryId,
            tmpUpdateData.categoryName,
            tmpUpdateData.description,
            tmpUpdateData.parentItemCategoryKey
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new InvalidParamException('categoryName', 'string').getMessage());
    });

    test('Should fail to update ItemCategory, because invalid description', async () => {
        const tmpUpdateData = {
            categoryId: defaultCategory.id,
            categoryName: 'NEW_CATEGORY_NAME',
            description: null,
            parentItemCategoryKey: childCategory2.id
        };
        const res = await testUtil.rpc(categoryCommand, [categoryUpdateCommand,
            tmpUpdateData.categoryId,
            tmpUpdateData.categoryName,
            tmpUpdateData.description,
            tmpUpdateData.parentItemCategoryKey
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new InvalidParamException('description', 'string').getMessage());
    });
});
