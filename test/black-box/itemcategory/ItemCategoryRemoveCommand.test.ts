// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import * as resources from 'resources';
import { GenerateListingItemParams } from '../../../src/api/requests/params/GenerateListingItemParams';

describe('ItemCategoryRemoveCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const categoryCommand = Commands.CATEGORY_ROOT.commandName;
    const categoryAddCommand = Commands.CATEGORY_ADD.commandName;
    const categoryListCommand = Commands.CATEGORY_LIST.commandName;
    const categoryRemoveCommand = Commands.CATEGORY_REMOVE.commandName;

    let defaultMarket: resources.Market;
    let defaultProfile: resources.Profile;

    let rootCategory: resources.ItemCategory;
    let createdCategory: resources.ItemCategory;

    beforeAll(async () => {
        await testUtil.cleanDb();

        defaultMarket = await testUtil.getDefaultMarket();
        defaultProfile = await testUtil.getDefaultProfile();

        // first get the rootCategory
        let res = await testUtil.rpc(categoryCommand, [categoryListCommand]);
        res.expectJson();
        res.expectStatusCode(200);
        rootCategory = res.getBody()['result'];

        // create a custom category
        res = await testUtil.rpc(categoryCommand, [categoryAddCommand,
            'customcategoryname',
            'description',
            rootCategory.key
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        createdCategory = res.getBody()['result'];

        expect(createdCategory.ParentItemCategory.id).toBe(rootCategory.id);

        log.debug('createdCategory.id: ', createdCategory.id);
        log.debug('rootCategory.id: ', rootCategory.id);

        // TODO: categories should be related to market
    });

    test('Should delete the ItemCategory', async () => {
        const res = await testUtil.rpc(categoryCommand, [categoryRemoveCommand, createdCategory.id]);
        res.expectJson();
        res.expectStatusCode(200);
        expect(res.error.error.message).toBe(`Category not found`);
    });

    test('Should not delete the default/root ItemCategory', async () => {
        const res = await testUtil.rpc(categoryCommand, [categoryRemoveCommand, rootCategory.id]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(`Category not found`);
    });

    test('Should not delete the ItemCategory if theres ListingItem related with ItemCategory', async () => {
        // create a custom category
        let res = await testUtil.rpc(categoryCommand, [categoryAddCommand,
            'customcategoryname2',
            'description',
            rootCategory.key
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        createdCategory = res.getBody()['result'];

        expect(createdCategory.ParentItemCategory.id).toBe(rootCategory.id);

        // create listing item
        const generateListingItemParams = new GenerateListingItemParams([
            true,               // generateItemInformation
            true,               // generateItemLocation
            true,               // generateShippingDestinations
            false,              // generateItemImages
            true,               // generatePaymentInformation
            true,               // generateEscrow
            true,               // generateItemPrice
            true,               // generateMessagingInformation
            false,              // generateListingItemObjects
            false,              // generateObjectDatas
            null,               // listingItemTemplateHash
            null,               // seller
            createdCategory.id  // categoryId
        ]).toParamsArray();


        // create listing item for testing
        const listingItems = await testUtil.generateData(
            CreatableModel.LISTINGITEM,     // what to generate
            1,                      // how many to generate
            true,                // return model
            generateListingItemParams           // what kind of data to generate
        );

        res = await testUtil.rpc(categoryCommand, [categoryRemoveCommand, createdCategory.id]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(`Cant delete category with something something`);
    });

    test('Should not delete the ItemCategory if theres ListingItemTemplate related with ItemCategory', async () => {
        // create category
        const addCategoryRes: any = await testUtil.addData(CreatableModel.ITEMCATEGORY, {
            name: 'sample category 3',
            description: 'sample category description 3',
            parent_item_category_id: rootCategory.id
        });
        createdCategory = addCategoryRes;
        // create listing-item-template with category
        const listingItemTemplate = {
            profile_id: defaultProfile.id,
            itemInformation: {
                title: 'Item Information',
                shortDescription: 'Item short description',
                longDescription: 'Item long description',
                itemCategory: {
                    id: createdCategory.id
                }
            }
        };
        const listingItems = await testUtil.addData(CreatableModel.LISTINGITEMTEMPLATE, listingItemTemplate);
        const res = await testUtil.rpc(categoryCommand, [categoryRemoveCommand, createdCategory.id]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(`Cant delete cateogry with something something`);
    });

});
