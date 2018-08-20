// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { rpc, api } from '../lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { HashableObjectType } from '../../../src/api/enums/HashableObjectType';
import {ObjectHash} from '../../../src/core/helpers/ObjectHash';
import * as resources from 'resources';

describe('ItemCategoryUpdateCommand', () => {

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

/*
        // add root category
        let response = await testUtil.rpc(categoryCommand, [categoryAddCommand,
            'ROOT CATEGORY NAME',           // name
            'root category description',    // description
            0                               // parent key/id
        ]);
        response.expectJson();
        response.expectStatusCode(200);
        rootCategory = response.getBody()['result'];
*/

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

    test('Should not update ItemCategory, because missing params', async () => {
        const res = await testUtil.rpc(categoryCommand, [categoryUpdateCommand,
            defaultCategory.id,
            'newname',
            'newdesc'
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Missing parameters.');
    });

    test('Should not update ItemCategory, because its a default ItemCategory', async () => {
        const res = await testUtil.rpc(categoryCommand, [categoryUpdateCommand,
            defaultCategory.id,
            'newname',
            'newdesc',
            childCategory2.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Default category can\'t be updated or deleted.');
    });

});
