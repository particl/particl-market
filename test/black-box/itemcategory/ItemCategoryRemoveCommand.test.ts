// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { rpc, api } from '../lib/api';
import * as crypto from 'crypto-js';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';

describe('ItemCategoryRemoveCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const method = Commands.CATEGORY_ROOT.commandName;
    const subCommand = Commands.CATEGORY_REMOVE.commandName;
    const makretMethod = Commands.MARKET_ROOT.commandName;
    const subCommandMarket = Commands.MARKET_ADD.commandName;

    const parentCategory = {
        id: 0,
        key: 'cat_high_real_estate'
    };

    let newCategory;
    let profileId;
    let marketId;
    let rootItemCategory;

    beforeAll(async () => {
        await testUtil.cleanDb();

        // create category
        const res = await rpc(method, [Commands.CATEGORY_ADD.commandName, parentCategory.key, '', 'cat_ROOT']);
        const categoryResult: any = res.getBody()['result'];
        rootItemCategory = categoryResult.ParentItemCategory;
        parentCategory.id = categoryResult.id;
        const addCategoryRes: any = await testUtil.addData(CreatableModel.ITEMCATEGORY, {
            name: 'sample category',
            description: 'sample category description',
            parent_item_category_id: parentCategory.id
        });
        newCategory = addCategoryRes;
        // profile
        const defaultProfile = await testUtil.getDefaultProfile();
        profileId = defaultProfile.id;

        // market
        const resMarket = await rpc(makretMethod, [subCommandMarket, 'Test Market', 'privateKey', 'Market Address']);
        const resultMarket: any = resMarket.getBody()['result'];
        marketId = resultMarket.id;
    });

    test('Should delete the ItemCategory', async () => {
        const res = await rpc(method, [subCommand, newCategory.id]);
        res.expectJson();
        res.expectStatusCode(200);
    });

    test('Should not delete the default ItemCategory', async () => {
        const res = await rpc(method, [subCommand, rootItemCategory.id]);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('Should not delete the ItemCategory if theres ListingItem related with ItemCategory', async () => {
        // create category
        const addCategoryRes: any = await testUtil.addData(CreatableModel.ITEMCATEGORY, {
            name: 'sample category 2',
            description: 'sample category description 2',
            parent_item_category_id: parentCategory.id
        });
        newCategory = addCategoryRes;

        const hash = crypto.SHA256(new Date().getTime().toString()).toString();
        const listingitemData = {
            market_id: marketId,
            hash,
            seller: 'seller',
            itemInformation: {
                title: 'item title',
                shortDescription: 'item short desc',
                longDescription: 'item long desc',
                itemCategory: {
                    id: newCategory.id
                }
            }
        };
        const listingItems = await testUtil.addData(CreatableModel.LISTINGITEM, listingitemData);
        const res = await rpc(method, [subCommand, newCategory.id]);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('Should not delete the ItemCategory if theres ListingItemTemplate related with ItemCategory', async () => {
        // create category
        const addCategoryRes: any = await testUtil.addData(CreatableModel.ITEMCATEGORY, {
            name: 'sample category 3',
            description: 'sample category description 3',
            parent_item_category_id: parentCategory.id
        });
        newCategory = addCategoryRes;
        // create listing-item-template with category
        const listingItemTemplate = {
            profile_id: profileId,
            itemInformation: {
                title: 'Item Information',
                shortDescription: 'Item short description',
                longDescription: 'Item long description',
                itemCategory: {
                    id: newCategory.id
                }
            }
        };
        const listingItems = await testUtil.addData(CreatableModel.LISTINGITEMTEMPLATE, listingItemTemplate);
        const res = await rpc(method, [subCommand, newCategory.id]);
        res.expectJson();
        res.expectStatusCode(404);
    });

});
