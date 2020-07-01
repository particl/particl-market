// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { SearchOrder } from '../../../src/api/enums/SearchOrder';
import { ListingItemTemplateSearchOrderField } from '../../../src/api/enums/SearchOrderField';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';

describe('ListingItemTemplateSearchCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const templateCommand = Commands.TEMPLATE_ROOT.commandName;
    const templateSearchCommand = Commands.TEMPLATE_SEARCH.commandName;

    let profile: resources.Profile;
    let market: resources.Market;

    let templatesWithoutItems: resources.ListingItemTemplate[];
    let templatesWithItems: resources.ListingItemTemplate[];

    beforeAll(async () => {
        await testUtil.cleanDb();

        profile = await testUtil.getDefaultProfile();
        expect(profile.id).toBeDefined();
        market = await testUtil.getDefaultMarket(profile.id);
        expect(market.id).toBeDefined();

        // create templates without listingitems
        let generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
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
            profile.id,         // profileId
            false,              // generateListingItem
            market.id           // marketId
        ]).toParamsArray();

        templatesWithoutItems = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            2,                          // how many to generate
            true,                    // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplate[];
        // 2 base templates + 2 market templates

        // create templates with listingitems
        generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
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
            profile.id,         // profileId
            true,               // generateListingItem
            market.id           // marketId
        ]).toParamsArray();

        templatesWithItems = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            2,                          // how many to generate
            true,                    // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplate[];
        // 2 base templates + 2 market templates + 2 listingitems

        // log.debug('templatesWithoutItems:', JSON.stringify(templatesWithoutItems, null, 2));
        // log.debug('templatesWithItems:', JSON.stringify(templatesWithItems, null, 2));

    });

    test('Should fail because we searchBy without order', async () => {
        const res: any = await testUtil.rpc(templateCommand, [templateSearchCommand,
            0,
            2
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('order').getMessage());
    });

    test('Should fail because we searchBy without orderField', async () => {
        const res: any = await testUtil.rpc(templateCommand, [templateSearchCommand,
            0,
            2,
            SearchOrder.ASC
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('orderField').getMessage());
    });

    test('Should get all ListingItemTemplates for Profile', async () => {
        const res: any = await testUtil.rpc(templateCommand, [templateSearchCommand,
            0,
            10,
            SearchOrder.ASC,
            ListingItemTemplateSearchOrderField.UPDATED_AT,
            profile.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.ListingItemTemplate[] = res.getBody()['result'];
        expect(result).toHaveLength(8);
    });

    test('Should return empty ListingItemTemplates array if invalid pagination', async () => {
        const res: any = await testUtil.rpc(templateCommand, [templateSearchCommand,
            2,  // page 2
            4,  // 4 results per page
            SearchOrder.ASC,
            ListingItemTemplateSearchOrderField.UPDATED_AT,
            profile.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.ListingItemTemplate[] = res.getBody()['result'];
        expect(result).toHaveLength(0);
    });

    test('Should get only first ListingItemTemplate using pagination (page 0) for Profile', async () => {
        const res: any = await testUtil.rpc(templateCommand, [templateSearchCommand,
            0,
            1,
            SearchOrder.ASC,
            ListingItemTemplateSearchOrderField.UPDATED_AT,
            profile.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.ListingItemTemplate[] = res.getBody()['result'];
        expect(result).toHaveLength(1);
        expect(result[0].Profile.id).toBe(profile.id);
    });

    test('Should get second ListingItemTemplate using pagination (page 1) for Profile', async () => {
        const res: any = await testUtil.rpc(templateCommand, [templateSearchCommand,
            1,
            1,
            SearchOrder.ASC,
            ListingItemTemplateSearchOrderField.UPDATED_AT,
            profile.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.ListingItemTemplate[] = res.getBody()['result'];
        expect(result).toHaveLength(1);
        expect(result[0].Profile.id).toBe(profile.id);
    });

    test('Should searchBy base ListingItemTemplates by ItemCategory key', async () => {
        const sameCategory = (templatesWithoutItems[0].ItemInformation.ItemCategory.key === templatesWithoutItems[1].ItemInformation.ItemCategory.key);

        const res: any = await testUtil.rpc(templateCommand, [templateSearchCommand,
            0,
            2,
            SearchOrder.ASC,
            ListingItemTemplateSearchOrderField.UPDATED_AT,
            profile.id,                                                     // profileId
            '*',                                                            // searchString
            [templatesWithoutItems[0].ItemInformation.ItemCategory.key],    // categories
            true                                                            // isBaseTemplate
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.ListingItemTemplate = res.getBody()['result'];
        expect(result.length).toBeGreaterThan(sameCategory ? 1 : 0);
        expect(result[0].ItemInformation.ItemCategory.key).toBe(templatesWithoutItems[0].ItemInformation.ItemCategory.key);
        expect(result[0].ParentListingItemTemplate).toBeUndefined();

    });

    test('Should searchBy base ListingItemTemplates by ItemCategory id', async () => {
        const res: any = await testUtil.rpc(templateCommand, [templateSearchCommand,
            0,
            2,
            SearchOrder.ASC,
            ListingItemTemplateSearchOrderField.UPDATED_AT,
            profile.id,                                                     // profileId
            '*',                                                            // searchString
            [templatesWithoutItems[0].ItemInformation.ItemCategory.id],     // categories
            true                                                            // isBaseTemplate
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.ListingItemTemplate = res.getBody()['result'];
        expect(result.length).toBeGreaterThan(0);
        expect(result[0].ItemInformation.ItemCategory.id).toBe(templatesWithoutItems[0].ItemInformation.ItemCategory.id);
        expect(result[0].ParentListingItemTemplate).toBeUndefined();
    });

    test('Should searchBy base ListingItemTemplates by ItemInformation title', async () => {
        const res: any = await testUtil.rpc(templateCommand, [templateSearchCommand,
            0,
            2,
            SearchOrder.ASC,
            ListingItemTemplateSearchOrderField.UPDATED_AT,
            profile.id,                                                     // profileId
            templatesWithoutItems[0].ItemInformation.title,                 // searchString
            [],                                                             // categories
            true                                                            // isBaseTemplate
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.ListingItemTemplate = res.getBody()['result'];
        expect(result).toHaveLength(1);
        expect(result[0].ItemInformation.title).toBe(templatesWithoutItems[0].ItemInformation.title);
        expect(result[0].ParentListingItemTemplate).toBeUndefined();
    });

    test('Should return market ListingItemTemplates NOT having published ListingItems', async () => {
        const res: any = await testUtil.rpc(templateCommand, [templateSearchCommand,
            0,
            10,
            SearchOrder.ASC,
            ListingItemTemplateSearchOrderField.UPDATED_AT,
            profile.id,
            '*',                // searchString
            [],                 // categories
            false,              // isBaseTemplate
            '*',                // marketReceiveAddress
            false               // hasItems
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.ListingItemTemplate[] = res.getBody()['result'];
        // log.debug('result:', JSON.stringify(result, null, 2));
        expect(result).toHaveLength(2);
        expect(result[0].ListingItems.length).toBe(0);
    });

    test('Should return market ListingItemTemplates for specified market NOT having published ListingItems', async () => {
        const res: any = await testUtil.rpc(templateCommand, [templateSearchCommand,
            0,
            10,
            SearchOrder.ASC,
            ListingItemTemplateSearchOrderField.UPDATED_AT,
            profile.id,
            '*',                                // searchString
            [],                                 // categories
            false,                              // isBaseTemplate
            templatesWithoutItems[0].market,    // marketReceiveAddress
            false                               // hasItems
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.ListingItemTemplate[] = res.getBody()['result'];
        // log.debug('result:', JSON.stringify(result, null, 2));
        expect(result).toHaveLength(2);
        expect(result[0].ListingItems.length).toBe(0);
    });

    test('Should return market ListingItemTemplates having published ListingItems', async () => {
        const res: any = await testUtil.rpc(templateCommand, [templateSearchCommand,
            0,
            10,
            SearchOrder.ASC,
            ListingItemTemplateSearchOrderField.UPDATED_AT,
            profile.id,
            '*',                // searchString
            [],                 // categories
            false,              // isBaseTemplate
            '*',                // marketReceiveAddress
            true                // hasItems
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.ListingItemTemplate[] = res.getBody()['result'];
        // log.debug('result:', JSON.stringify(result, null, 2));
        expect(result).toHaveLength(2);
        expect(result[0].ListingItems.length).toBe(1);
    });



});

