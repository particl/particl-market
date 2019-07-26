// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemParams } from '../../../src/api/requests/testdata/GenerateListingItemParams';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';

describe('ItemCategoryRemoveCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const categoryCommand = Commands.CATEGORY_ROOT.commandName;
    const categoryAddCommand = Commands.CATEGORY_ADD.commandName;
    const categoryListCommand = Commands.CATEGORY_LIST.commandName;
    const categoryRemoveCommand = Commands.CATEGORY_REMOVE.commandName;

    let market: resources.Market;
    let profile: resources.Profile;

    let rootCategory: resources.ItemCategory;
    let customCategory: resources.ItemCategory;

    beforeAll(async () => {
        await testUtil.cleanDb();

        market = await testUtil.getDefaultMarket();
        profile = await testUtil.getDefaultProfile();

        // first get the rootCategory
        let res = await testUtil.rpc(categoryCommand, [categoryListCommand]);
        res.expectJson();
        res.expectStatusCode(200);
        rootCategory = res.getBody()['result'];

        // create a custom category
        res = await testUtil.rpc(categoryCommand, [categoryAddCommand,
            market.id,
            'customcategoryname',
            'description',
            rootCategory.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        customCategory = res.getBody()['result'];

        expect(customCategory.ParentItemCategory.id).toBe(rootCategory.id);

        log.debug('createdCategory.id: ', customCategory.id);
        log.debug('rootCategory.id: ', rootCategory.id);

        // TODO: categories should be related to market
    });

    test('Should fail to remove ItemCategory because missing categoryId', async () => {
        const res = await testUtil.rpc(categoryCommand, [categoryRemoveCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('categoryId').getMessage());
    });

    test('Should fail to delete ItemCategory because invalid categoryId', async () => {
        const res = await testUtil.rpc(categoryCommand, [categoryRemoveCommand,
            'INVALID_CATEGORY_DOESNT_EXIST'
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('categoryId', 'number').getMessage());
    });

    test('Should not delete ItemCategory because it cant be found', async () => {
        const res = await testUtil.rpc(categoryCommand, [categoryRemoveCommand,
            0
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('ItemCategory').getMessage());
    });

    test('Should delete the ItemCategory', async () => {
        const res = await testUtil.rpc(categoryCommand, [categoryRemoveCommand,
            customCategory.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
    });

    test('Should not delete the default/root ItemCategory', async () => {
        const res = await testUtil.rpc(categoryCommand, [categoryRemoveCommand, rootCategory.id]);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('Should not delete the ItemCategory if theres ListingItem related with ItemCategory', async () => {

        let res = await testUtil.rpc(categoryCommand, [categoryAddCommand,
            market.id,
            'customcategoryname2',
            'description',
            rootCategory.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        customCategory = res.getBody()['result'];

        expect(customCategory.ParentItemCategory.id).toBe(rootCategory.id);

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
            customCategory.id  // categoryId
        ]).toParamsArray();

        // create listing item for testing
        const listingItems = await testUtil.generateData(
            CreatableModel.LISTINGITEM,     // what to generate
            1,                      // how many to generate
            true,                // return model
            generateListingItemParams           // what kind of data to generate
        );

        res = await testUtil.rpc(categoryCommand, [categoryRemoveCommand, customCategory.id]);
        res.expectJson();
        res.expectStatusCode(404);
    });

    // TODO: Should not delete the ItemCategory if theres ListingItemTemplate related with ItemCategory

});
