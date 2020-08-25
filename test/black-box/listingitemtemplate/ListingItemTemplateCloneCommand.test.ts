// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import * as Faker from 'faker';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';
import { SearchOrder } from '../../../src/api/enums/SearchOrder';
import { ListingItemSearchOrderField, ListingItemTemplateSearchOrderField } from '../../../src/api/enums/SearchOrderField';
import { MessageException } from '../../../src/api/exceptions/MessageException';

describe('ListingItemTemplateCloneCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtilSellerNode = new BlackBoxTestUtil(randomBoolean ? 0 : 1);
    const testUtilBuyerNode = new BlackBoxTestUtil(randomBoolean ? 1 : 0);

    const templateCommand = Commands.TEMPLATE_ROOT.commandName;
    const templateCloneCommand = Commands.TEMPLATE_CLONE.commandName;
    const templateSearchCommand = Commands.TEMPLATE_SEARCH.commandName;
    const templatePostCommand = Commands.TEMPLATE_POST.commandName;
    const templateGetCommand = Commands.TEMPLATE_GET.commandName;
    const listingItemCommand = Commands.ITEM_ROOT.commandName;
    const listingItemSearchCommand = Commands.ITEM_SEARCH.commandName;
    const itemInformationCommand = Commands.ITEMINFORMATION_ROOT.commandName;
    const itemInformationUpdateCommand = Commands.ITEMINFORMATION_UPDATE.commandName;
    const categoryCommand = Commands.CATEGORY_ROOT.commandName;
    const categoryListCommand = Commands.CATEGORY_LIST.commandName;

    let profile: resources.Profile;
    let market: resources.Market;
    let baseTemplate: resources.ListingItemTemplate;
    let marketTemplate: resources.ListingItemTemplate;
    let marketV1Template: resources.ListingItemTemplate;
    let marketV2Template: resources.ListingItemTemplate;
    let secondBaseTemplate: resources.ListingItemTemplate;
    let thirdBaseTemplate: resources.ListingItemTemplate;
    let itemCategory: resources.ItemCategory;

    const PAGE = 0;
    const PAGE_LIMIT = 10;
    const SEARCHORDER = SearchOrder.ASC;
    const LISTINGITEM_SEARCHORDERFIELD = ListingItemSearchOrderField.CREATED_AT;
    const DAYS_RETENTION = 1;
    let sent = false;

    beforeAll(async () => {
        await testUtilSellerNode.cleanDb();
        await testUtilBuyerNode.cleanDb();

        // get default profile and market
        profile = await testUtilSellerNode.getDefaultProfile();
        market = await testUtilSellerNode.getDefaultMarket(profile.id);

        // generate ListingItemTemplate
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
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
            false               // generateListingItem
            // market.id        // soldOnMarketId
            // categoryId
        ]).toParamsArray();

        const listingItemTemplates = await testUtilSellerNode.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                    // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplate[];

        baseTemplate = listingItemTemplates[0];

        const res = await testUtilSellerNode.rpc(categoryCommand, [categoryListCommand]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        expect(result.key).toBeDefined();
        expect(result.name).toBe('ROOT');
        expect(result.market).toBeNull();
        expect(result.ParentItemCategory).not.toBeDefined();

        const childItemCategories = result.ChildItemCategories;
        expect(childItemCategories.length).toBeGreaterThan(0);

        const childCat: resources.ItemCategory = Faker.random.arrayElement(result.ChildItemCategories);
        itemCategory = Faker.random.arrayElement(childCat.ChildItemCategories);

    });


    test('Should fail because missing listingItemTemplateId', async () => {
        const res: any = await testUtilSellerNode.rpc(templateCommand, [templateCloneCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('listingItemTemplateId').getMessage());
    });


    test('Should fail because invalid listingItemTemplateId', async () => {
        const res: any = await testUtilSellerNode.rpc(templateCommand, [templateCloneCommand,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('listingItemTemplateId', 'number').getMessage());
    });


    test('Should fail because invalid marketId', async () => {
        const res: any = await testUtilSellerNode.rpc(templateCommand, [templateCloneCommand,
            baseTemplate.id,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('marketId', 'number').getMessage());
    });


    test('Should fail because ListingItemTemplate not found', async () => {
        const res: any = await testUtilSellerNode.rpc(templateCommand, [templateCloneCommand,
            0,
            market.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('ListingItemTemplate').getMessage());
    });


    test('Should fail because Market not found', async () => {
        const res: any = await testUtilSellerNode.rpc(templateCommand, [templateCloneCommand,
            baseTemplate.id,
            0
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('Market').getMessage());
    });


    test('Should clone a new Market ListingItemTemplate from the Base ListingItemTemplate (no category)', async () => {

        expect(baseTemplate.id).toBeDefined();

        const res: any = await testUtilSellerNode.rpc(templateCommand, [templateCloneCommand,
            baseTemplate.id,
            market.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.ListingItemTemplate = res.getBody()['result'];
        // log.debug('clonedListingItemTemplate: ', JSON.stringify(result, null, 2));

        expect(result).hasOwnProperty('Profile');
        expect(result).hasOwnProperty('ItemInformation');
        expect(result).hasOwnProperty('PaymentInformation');
        expect(result).hasOwnProperty('MessagingInformation');
        expect(result).hasOwnProperty('ListingItemObjects');
        expect(result).hasOwnProperty('ListingItems');

        expect(result.ParentListingItemTemplate.id).toBe(baseTemplate.id); // market template

        expect(result.Profile.id).toBe(baseTemplate.Profile.id);
        expect(result.ItemInformation.title).toBe(baseTemplate.ItemInformation.title);
        expect(result.ItemInformation.shortDescription).toBe(baseTemplate.ItemInformation.shortDescription);
        expect(result.ItemInformation.longDescription).toBe(baseTemplate.ItemInformation.longDescription);
        expect(result.ItemInformation.ItemCategory).toBeUndefined();
        expect(result.PaymentInformation.type).toBe(baseTemplate.PaymentInformation.type);
        expect(result.PaymentInformation.ItemPrice.currency).toBe(baseTemplate.PaymentInformation.ItemPrice.currency);
        expect(result.PaymentInformation.ItemPrice.basePrice).toBe(baseTemplate.PaymentInformation.ItemPrice.basePrice);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.domestic).toBe(baseTemplate.PaymentInformation.ItemPrice.ShippingPrice.domestic);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.international)
            .toBe(baseTemplate.PaymentInformation.ItemPrice.ShippingPrice.international);

        marketTemplate = result;
    });


    test('Should get all ListingItemTemplates for Profile', async () => {
        expect(marketTemplate).toBeDefined();

        const res: any = await testUtilSellerNode.rpc(templateCommand, [templateSearchCommand,
            0,
            10,
            SearchOrder.ASC,
            ListingItemTemplateSearchOrderField.UPDATED_AT,
            profile.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.ListingItemTemplate[] = res.getBody()['result'];
        expect(result).toHaveLength(2);
        // log.debug('templates: ', JSON.stringify(result, null, 2));
    });


    test('Should update Market ListingItemTemplates ItemCategory', async () => {
        const res: any = await testUtilSellerNode.rpc(itemInformationCommand, [itemInformationUpdateCommand,
            marketTemplate.id,
            marketTemplate.ItemInformation.title,
            marketTemplate.ItemInformation.shortDescription,
            marketTemplate.ItemInformation.longDescription,
            itemCategory.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.ItemInformation = res.getBody()['result'];
        expect(result.title).toBe(marketTemplate.ItemInformation.title);
        expect(result.shortDescription).toBe(marketTemplate.ItemInformation.shortDescription);
        expect(result.longDescription).toBe(marketTemplate.ItemInformation.longDescription);
        expect(result.ItemCategory.id).toBe(itemCategory.id);
    });


    test('Should fail because latest version has not been published yet', async () => {
        expect(marketTemplate).toBeDefined();

        const res: any = await testUtilSellerNode.rpc(templateCommand, [templateCloneCommand,
            marketTemplate.id,
            market.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MessageException('New version cannot be created until the ListingItemTemplate has been posted.').getMessage());
    });


    test('Should post MPA_LISTING_ADD from SELLER node', async () => {
        expect(marketTemplate.id).toBeDefined();

        const res = await testUtilSellerNode.rpc(templateCommand, [templatePostCommand,
            marketTemplate.id,
            DAYS_RETENTION
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        // make sure we got the expected result from posting the template
        const result: any = res.getBody()['result'];
        sent = result.result === 'Sent.';
        if (!sent) {
            log.debug(JSON.stringify(result, null, 2));
        }
        expect(result.result).toBe('Sent.');
    });


    test('Should have updated ListingItemTemplate hash on SELLER node', async () => {
        expect(sent).toBeTruthy();
        expect(marketTemplate.id).toBeDefined();

        const res: any = await testUtilSellerNode.rpc(templateCommand, [templateGetCommand,
            marketTemplate.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        marketTemplate = res.getBody()['result'];
        expect(marketTemplate.hash).toBeDefined();
    });


    test('Should clone a new version of Market ListingItemTemplate from the Market ListingItemTemplate', async () => {

        expect(marketTemplate.id).toBeDefined();

        const res: any = await testUtilSellerNode.rpc(templateCommand, [templateCloneCommand,
            marketTemplate.id,
            market.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.ListingItemTemplate = res.getBody()['result'];
        // log.debug('clonedListingItemTemplate: ', JSON.stringify(result, null, 2));

        expect(result).hasOwnProperty('Profile');
        expect(result).hasOwnProperty('ItemInformation');
        expect(result).hasOwnProperty('PaymentInformation');
        expect(result).hasOwnProperty('MessagingInformation');
        expect(result).hasOwnProperty('ListingItemObjects');
        expect(result).hasOwnProperty('ListingItems');

        expect(result.ParentListingItemTemplate.id).toBe(marketTemplate.id); // market template

        expect(result.Profile.id).toBe(marketTemplate.Profile.id);
        expect(result.ItemInformation.title).toBe(marketTemplate.ItemInformation.title);
        expect(result.ItemInformation.shortDescription).toBe(marketTemplate.ItemInformation.shortDescription);
        expect(result.ItemInformation.longDescription).toBe(marketTemplate.ItemInformation.longDescription);
        expect(result.ItemInformation.ItemCategory.key).toBe(marketTemplate.ItemInformation.ItemCategory.key);
        expect(result.PaymentInformation.type).toBe(marketTemplate.PaymentInformation.type);
        expect(result.PaymentInformation.ItemPrice.currency).toBe(marketTemplate.PaymentInformation.ItemPrice.currency);
        expect(result.PaymentInformation.ItemPrice.basePrice).toBe(marketTemplate.PaymentInformation.ItemPrice.basePrice);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.domestic).toBe(marketTemplate.PaymentInformation.ItemPrice.ShippingPrice.domestic);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.international)
            .toBe(marketTemplate.PaymentInformation.ItemPrice.ShippingPrice.international);

        marketV1Template = result;
    });


    test('Should post MPA_LISTING_ADD from SELLER node', async () => {
        expect(marketTemplate.id).toBeDefined();

        const res = await testUtilSellerNode.rpc(templateCommand, [templatePostCommand,
            marketV1Template.id,
            DAYS_RETENTION
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        // make sure we got the expected result from posting the template
        const result: any = res.getBody()['result'];
        sent = result.result === 'Sent.';
        if (!sent) {
            log.debug(JSON.stringify(result, null, 2));
        }
        expect(result.result).toBe('Sent.');
    });


    test('Should have updated ListingItemTemplate hash on SELLER node', async () => {
        expect(sent).toBeTruthy();
        expect(marketTemplate.id).toBeDefined();
        expect(marketV1Template.id).toBeDefined();

        const res: any = await testUtilSellerNode.rpc(templateCommand, [templateGetCommand,
            marketV1Template.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result = res.getBody()['result'];
        expect(result.hash).toBeDefined();
    });


    test('Should clone a new version of Market ListingItemTemplate from the previous version of Market ListingItemTemplate', async () => {
        expect(sent).toBeTruthy();
        expect(marketTemplate.id).toBeDefined();
        expect(marketV1Template.id).toBeDefined();

        const res: any = await testUtilSellerNode.rpc(templateCommand, [templateCloneCommand,
            marketV1Template.id,
            market.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.ListingItemTemplate = res.getBody()['result'];
        // log.debug('clonedListingItemTemplate: ', JSON.stringify(result, null, 2));

        expect(result).hasOwnProperty('Profile');
        expect(result).hasOwnProperty('ItemInformation');
        expect(result).hasOwnProperty('PaymentInformation');
        expect(result).hasOwnProperty('MessagingInformation');
        expect(result).hasOwnProperty('ListingItemObjects');
        expect(result).hasOwnProperty('ListingItems');

        expect(result.ParentListingItemTemplate.id).toBe(marketTemplate.id); // market template

        expect(result.Profile.id).toBe(marketTemplate.Profile.id);
        expect(result.ItemInformation.title).toBe(marketTemplate.ItemInformation.title);
        expect(result.ItemInformation.shortDescription).toBe(marketTemplate.ItemInformation.shortDescription);
        expect(result.ItemInformation.longDescription).toBe(marketTemplate.ItemInformation.longDescription);
        expect(result.ItemInformation.ItemCategory.key).toBe(marketTemplate.ItemInformation.ItemCategory.key);
        expect(result.PaymentInformation.type).toBe(marketTemplate.PaymentInformation.type);
        expect(result.PaymentInformation.ItemPrice.currency).toBe(marketTemplate.PaymentInformation.ItemPrice.currency);
        expect(result.PaymentInformation.ItemPrice.basePrice).toBe(marketTemplate.PaymentInformation.ItemPrice.basePrice);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.domestic).toBe(marketTemplate.PaymentInformation.ItemPrice.ShippingPrice.domestic);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.international)
            .toBe(marketTemplate.PaymentInformation.ItemPrice.ShippingPrice.international);

        marketV2Template = result;
    });


    test('Should clone a new base ListingItemTemplate from the latest Market ListingItemTemplate', async () => {
        expect(sent).toBeTruthy();
        expect(marketTemplate.id).toBeDefined();
        expect(marketV1Template.id).toBeDefined();
        expect(marketV2Template.id).toBeDefined();

        const res: any = await testUtilSellerNode.rpc(templateCommand, [templateCloneCommand,
            marketV2Template.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.ListingItemTemplate = res.getBody()['result'];
        // log.debug('clonedListingItemTemplate: ', JSON.stringify(result, null, 2));

        expect(result).hasOwnProperty('Profile');
        expect(result).hasOwnProperty('ItemInformation');
        expect(result).hasOwnProperty('PaymentInformation');
        expect(result).hasOwnProperty('MessagingInformation');
        expect(result).hasOwnProperty('ListingItemObjects');
        expect(result).hasOwnProperty('ListingItems');

        expect(result.ParentListingItemTemplate).not.toBeDefined();

        expect(result.Profile.id).toBe(marketTemplate.Profile.id);
        expect(result.ItemInformation.title).toBe(marketTemplate.ItemInformation.title);
        expect(result.ItemInformation.shortDescription).toBe(marketTemplate.ItemInformation.shortDescription);
        expect(result.ItemInformation.longDescription).toBe(marketTemplate.ItemInformation.longDescription);
        expect(result.ItemInformation.ItemCategory.key).toBe(marketTemplate.ItemInformation.ItemCategory.key);
        expect(result.PaymentInformation.type).toBe(marketTemplate.PaymentInformation.type);
        expect(result.PaymentInformation.ItemPrice.currency).toBe(marketTemplate.PaymentInformation.ItemPrice.currency);
        expect(result.PaymentInformation.ItemPrice.basePrice).toBe(marketTemplate.PaymentInformation.ItemPrice.basePrice);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.domestic).toBe(marketTemplate.PaymentInformation.ItemPrice.ShippingPrice.domestic);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.international)
            .toBe(marketTemplate.PaymentInformation.ItemPrice.ShippingPrice.international);

        secondBaseTemplate = result;
    });


    test('Should clone a new Base ListingItemTemplate from the Base ListingItemTemplate (no category)', async () => {

        expect(baseTemplate.id).toBeDefined();

        const res: any = await testUtilSellerNode.rpc(templateCommand, [templateCloneCommand,
            baseTemplate.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.ListingItemTemplate = res.getBody()['result'];
        // log.debug('clonedListingItemTemplate: ', JSON.stringify(result, null, 2));

        expect(result).hasOwnProperty('Profile');
        expect(result).hasOwnProperty('ItemInformation');
        expect(result).hasOwnProperty('PaymentInformation');
        expect(result).hasOwnProperty('MessagingInformation');
        expect(result).hasOwnProperty('ListingItemObjects');

        expect(result.ParentListingItemTemplate).not.toBeDefined(); // base template

        expect(result.Profile.id).toBe(baseTemplate.Profile.id);
        expect(result.ItemInformation.title).toBe(baseTemplate.ItemInformation.title);
        expect(result.ItemInformation.shortDescription).toBe(baseTemplate.ItemInformation.shortDescription);
        expect(result.ItemInformation.longDescription).toBe(baseTemplate.ItemInformation.longDescription);
        expect(result.ItemInformation.ItemCategory).toBeUndefined();
        expect(result.PaymentInformation.type).toBe(baseTemplate.PaymentInformation.type);
        expect(result.PaymentInformation.ItemPrice.currency).toBe(baseTemplate.PaymentInformation.ItemPrice.currency);
        expect(result.PaymentInformation.ItemPrice.basePrice).toBe(baseTemplate.PaymentInformation.ItemPrice.basePrice);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.domestic).toBe(baseTemplate.PaymentInformation.ItemPrice.ShippingPrice.domestic);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.international)
            .toBe(baseTemplate.PaymentInformation.ItemPrice.ShippingPrice.international);

        thirdBaseTemplate = result;
    });


    test('Should get all base ListingItemTemplates for Profile', async () => {
        expect(marketTemplate).toBeDefined();

        const res: any = await testUtilSellerNode.rpc(templateCommand, [templateSearchCommand,
            0,
            10,
            SearchOrder.ASC,
            ListingItemTemplateSearchOrderField.UPDATED_AT,
            profile.id,
            '*',
            [],
            true
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.ListingItemTemplate[] = res.getBody()['result'];
        expect(result).toHaveLength(3);
        // log.debug('templates: ', JSON.stringify(result, null, 2));

        expect(result[0].hash).toBeNull();
        expect(result[0].market).toBeNull();
        expect(result[0].ChildListingItemTemplates).toHaveLength(1);
        expect(result[0].ChildListingItemTemplates[0].id).toBe(marketTemplate.id);
        expect(result[0].ChildListingItemTemplates[0].ChildListingItemTemplates).toHaveLength(2);
        expect(result[0].ChildListingItemTemplates[0].ChildListingItemTemplates[0].id).toBe(marketV1Template.id);
        expect(result[0].ChildListingItemTemplates[0].ChildListingItemTemplates[1].id).toBe(marketV2Template.id);

        expect(result[1].hash).toBeNull();
        expect(result[1].market).toBeNull();
        expect(result[1].ChildListingItemTemplates).toHaveLength(0);

    });

});
