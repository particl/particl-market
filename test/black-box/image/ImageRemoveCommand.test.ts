// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemParams } from '../../../src/api/requests/testdata/GenerateListingItemParams';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { ModelNotModifiableException } from '../../../src/api/exceptions/ModelNotModifiableException';

describe('ImageRemoveCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const imageCommand = Commands.IMAGE_ROOT.commandName;
    const imageRemoveCommand = Commands.IMAGE_REMOVE.commandName;

    let profile: resources.Profile;
    let market: resources.Market;
    let listingItemTemplate: resources.ListingItemTemplate;
    let listingItem: resources.ListingItem;
    let randomCategory: resources.ItemCategory;


    beforeAll(async () => {
        await testUtil.cleanDb();

        profile = await testUtil.getDefaultProfile();
        expect(profile.id).toBeDefined();
        market = await testUtil.getDefaultMarket(profile.id);
        expect(market.id).toBeDefined();

        randomCategory = await testUtil.getRandomCategory();

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,                           // generateItemInformation
            true,                           // generateItemLocation
            true,                           // generateShippingDestinations
            true,                           // generateImages
            true,                           // generatePaymentInformation
            true,                           // generateEscrow
            true,                           // generateItemPrice
            true,                           // generateMessagingInformation
            false,                          // generateListingItemObjects
            false,                          // generateObjectDatas
            profile.id,                     // profileId
            false,                          // generateListingItem
            market.id,                      // soldOnMarketId
            randomCategory.id               // categoryId
        ]).toParamsArray();

        const listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                    // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplate[];
        listingItemTemplate = listingItemTemplates[0];

    });

    test('Should fail to remove because missing itemImageId', async () => {
        const result: any = await testUtil.rpc(imageCommand, [imageRemoveCommand]);
        result.expectJson();
        result.expectStatusCode(404);
        expect(result.error.error.message).toBe(new MissingParamException('itemImageId').getMessage());
    });

    test('Should fail to remove because invalid itemImageId', async () => {
        const result: any = await testUtil.rpc(imageCommand, [imageRemoveCommand,
            true
        ]);
        result.expectJson();
        result.expectStatusCode(400);
        expect(result.error.error.message).toBe(new InvalidParamException('itemImageId', 'number').getMessage());
    });

    test('Should remove Image', async () => {
        const result: any = await testUtil.rpc(imageCommand, [imageRemoveCommand,
            listingItemTemplate.ItemInformation.Images[0].id
        ]);
        result.expectJson();
        result.expectStatusCode(200);
    });

    test('Should fail to remove because Image has already been removed', async () => {
        const result: any = await testUtil.rpc(imageCommand, [imageRemoveCommand,
            listingItemTemplate.ItemInformation.Images[0].id
        ]);
        result.expectJson();
        result.expectStatusCode(404);
    });

    test('Should fail to remove because the ListingItemTemplate has been published', async () => {

        const generateListingItemParams = new GenerateListingItemParams([
            true,                           // generateItemInformation
            true,                           // generateItemLocation
            true,                           // generateShippingDestinations
            true,                           // generateImages
            true,                           // generatePaymentInformation
            true,                           // generateEscrow
            true,                           // generateItemPrice
            false,                          // generateMessagingInformation
            false,                          // generateListingItemObjects
            false,                          // generateObjectDatas
            listingItemTemplate.hash,       // listingItemTemplateHash
            market.Identity.address,        // seller
            randomCategory.id,              // categoryId
            market.id                       // soldOnMarketId
        ]).toParamsArray();

        const listingItems = await testUtil.generateData(
            CreatableModel.LISTINGITEM,     // what to generate
            1,                      // how many to generate
            true,                // return model
            generateListingItemParams       // what kind of data to generate
        ) as resources.ListingItem[];
        listingItem = listingItems[0];

        const result: any = await testUtil.rpc(imageCommand, [imageRemoveCommand,
            listingItem.ItemInformation.Images[0].id
        ]);
        result.expectJson();
        result.expectStatusCode(400);
        expect(result.error.error.message).toBe(new ModelNotModifiableException('ListingItemTemplate').getMessage());
    });

});
