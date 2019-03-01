// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemParams } from '../../../src/api/requests/params/GenerateListingItemParams';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/params/GenerateListingItemTemplateParams';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';

describe('ItemImageRemoveCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const itemImageCommand = Commands.ITEMIMAGE_ROOT.commandName;
    const itemImageRemoveCommand = Commands.ITEMIMAGE_REMOVE.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;
    let listingItemTemplate: resources.ListingItemTemplate;
    let listingItem: resources.ListingItem;


    beforeAll(async () => {
        await testUtil.cleanDb();

        defaultProfile = await testUtil.getDefaultProfile();
        defaultMarket = await testUtil.getDefaultMarket();

        // generate ListingItemTemplate
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            true,   // generateShippingDestinations
            true,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            false,  // generateListingItemObjects
            false,  // generateObjectDatas
            defaultProfile.id, // profileId
            false,   // generateListingItem
            defaultMarket.id  // marketId
        ]).toParamsArray();

        const listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                    // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplate[];
        listingItemTemplate = listingItemTemplates[0];

    });

    test('Should fail to remove ItemImage because missing itemImageId', async () => {
        const result: any = await testUtil.rpc(itemImageCommand, [itemImageRemoveCommand]);
        result.expectJson();
        result.expectStatusCode(404);
        expect(result.error.error.message).toBe(new MissingParamException('itemImageId').getMessage());
    });

    test('Should fail to remove ItemImage because invalid itemImageId', async () => {
        const result: any = await testUtil.rpc(itemImageCommand, [itemImageRemoveCommand,
            'INVALIDID'
        ]);
        result.expectJson();
        result.expectStatusCode(404);
        expect(result.error.error.message).toBe(new InvalidParamException('itemImageId', 'number').getMessage());
    });

    test('Should remove ItemImage', async () => {
        // remove item image
        const result: any = await testUtil.rpc(itemImageCommand, [itemImageRemoveCommand,
            listingItemTemplate.ItemInformation.ItemImages[0].id
        ]);
        result.expectJson();
        result.expectStatusCode(200);
    });

    test('Should fail to remove ItemImage because itemImage already been removed', async () => {
        const result: any = await testUtil.rpc(itemImageCommand, [itemImageRemoveCommand,
            listingItemTemplate.ItemInformation.ItemImages[0].id
        ]);
        result.expectJson();
        result.expectStatusCode(404);
    });

    test('Should fail to remove ItemImage because there is a ListingItem related to ItemInformation.', async () => {

        const generateListingItemParams = new GenerateListingItemParams([
            true,                       // generateItemInformation
            true,                       // generateItemLocation
            true,                       // generateShippingDestinations
            true,                       // generateItemImages
            true,                       // generatePaymentInformation
            true,                       // generateEscrow
            true,                       // generateItemPrice
            true,                       // generateMessagingInformation
            false,                      // generateListingItemObjects
            false,                      // generateObjectDatas
            listingItemTemplate.hash,   // listingItemTemplateHash
            defaultProfile.address,     // seller
            null                        // categoryId
        ]).toParamsArray();

        // create ListingItem for testing
        const listingItems = await testUtil.generateData(
            CreatableModel.LISTINGITEM,     // what to generate
            1,                      // how many to generate
            true,                // return model
            generateListingItemParams       // what kind of data to generate
        ) as resources.ListingItem[];
        listingItem = listingItems[0];

        const result: any = await testUtil.rpc(itemImageCommand, [itemImageRemoveCommand,
            listingItem.ItemInformation.ItemImages[0].id
        ]);
        result.expectJson();
        result.expectStatusCode(404);
        expect(result.error.error.message).toBe('Can\'t delete ItemImage because the ListingItemTemplate has already been posted!');
    });


});
