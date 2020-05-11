// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { ListingItemTemplate } from '../../../src/api/models/ListingItemTemplate';
import { GenerateListingItemParams } from '../../../src/api/requests/testdata/GenerateListingItemParams';

describe('ItemImageListCommand', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const testUtil = new BlackBoxTestUtil();
    const itemImageCommand = Commands.ITEMIMAGE_ROOT.commandName;
    const itemImageListCommand = Commands.ITEMIMAGE_LIST.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;

    let listingItemTemplate: resources.ListingItemTemplate;
    let listingItem: resources.ListingItem;

    beforeAll(async () => {
        await testUtil.cleanDb();

        // get default profile and market
        defaultProfile = await testUtil.getDefaultProfile();
        defaultMarket = await testUtil.getDefaultMarket();

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,       // generateItemInformation
            true,       // generateItemLocation
            true,       // generateShippingDestinations
            true,       // generateItemImages
            true,       // generatePaymentInformation
            true,       // generateEscrow
            true,       // generateItemPrice
            false,      // generateMessagingInformation
            false       // generateListingItemObjects
        ]).toParamsArray();

        const listingItemTemplates: resources.ListingItemTemplate = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as ListingItemTemplate[];
        listingItemTemplate = listingItemTemplates[0];

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
    });

    test('Should list all ListingItemTemplate Images', async () => {
        const res: any = await testUtil.rpc(itemImageCommand, [itemImageListCommand, 'template', listingItemTemplate.id]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.ItemImage[] = res.getBody()['result'];
        log.debug('result:', JSON.stringify(result, null, 2));
        expect(result.length).toBeGreaterThan(0); // should be 1 or 2
    });

    test('Should list all ListingItem Images', async () => {
        const res: any = await testUtil.rpc(itemImageCommand, [itemImageListCommand, 'item', listingItem.id]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.ItemImage[] = res.getBody()['result'];
        expect(result.length).toBeGreaterThan(0); // should be 1 or 2
    });

});
