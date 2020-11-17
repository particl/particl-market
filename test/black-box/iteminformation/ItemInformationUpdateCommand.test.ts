// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';
import { MarketType } from '../../../src/api/enums/MarketType';
import {ModelNotModifiableException} from '../../../src/api/exceptions/ModelNotModifiableException';


describe('ItemInformationUpdateCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const itemInformationCommand = Commands.ITEMINFORMATION_ROOT.commandName;
    const itemInformationUpdateCommand = Commands.ITEMINFORMATION_UPDATE.commandName;
    const templateCommand = Commands.TEMPLATE_ROOT.commandName;
    const templateCloneCommand = Commands.TEMPLATE_CLONE.commandName;
    const categoryCommand = Commands.CATEGORY_ROOT.commandName;
    const categoryAddCommand = Commands.CATEGORY_ADD.commandName;
    const categoryListCommand = Commands.CATEGORY_LIST.commandName;

    let profile: resources.Profile;
    let market: resources.Market;
    let storefront: resources.Market;

    let listingItemTemplate: resources.ListingItemTemplate;
    let clonedListingItemTemplate: resources.ListingItemTemplate;
    let randomCategory: resources.ItemCategory;
    let newCategoryOnStorefront: resources.ItemCategory;

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
            false,                          // generateImages
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

        const listingItemTemplates: resources.ListingItemTemplate[] = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE,
            1,
            true,
            generateListingItemTemplateParams
        );
        listingItemTemplate = listingItemTemplates[0];

        log.debug('listingItemTemplate: ', JSON.stringify(listingItemTemplate, null, 2));

    });

    test('Should fail because missing listingItemTemplateId', async () => {
        const res: any = await testUtil.rpc(itemInformationCommand, [itemInformationUpdateCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('listingItemTemplateId').getMessage());
    });

    test('Should fail because missing title', async () => {
        const res: any = await testUtil.rpc(itemInformationCommand, [itemInformationUpdateCommand,
            listingItemTemplate.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('title').getMessage());
    });

    test('Should fail because missing shortDescription', async () => {
        const res: any = await testUtil.rpc(itemInformationCommand, [itemInformationUpdateCommand,
            listingItemTemplate.id,
            'new title'
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('shortDescription').getMessage());
    });

    test('Should fail because missing longDescription', async () => {
        const res: any = await testUtil.rpc(itemInformationCommand, [itemInformationUpdateCommand,
            listingItemTemplate.id,
            'new title',
            'new short description'
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('longDescription').getMessage());
    });


    test('Should fail because invalid listingItemTemplateId', async () => {
        const res: any = await testUtil.rpc(itemInformationCommand, [itemInformationUpdateCommand,
            false, // listingItemTemplate.id,
            'new title',
            'new short description',
            'new long description',
            randomCategory.id
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(new InvalidParamException('listingItemTemplateId', 'number').getMessage());
    });

    test('Should fail because invalid title', async () => {
        const res: any = await testUtil.rpc(itemInformationCommand, [itemInformationUpdateCommand,
            listingItemTemplate.id,
            false,
            'new short description',
            'new long description',
            randomCategory.id
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('title', 'string').getMessage());
    });

    test('Should fail because invalid shortDescription', async () => {
        const res: any = await testUtil.rpc(itemInformationCommand, [itemInformationUpdateCommand,
            listingItemTemplate.id,
            'new title',
            false,
            'new long description',
            randomCategory.id
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('shortDescription', 'string').getMessage());
    });

    test('Should fail because invalid longDescription', async () => {
        const res: any = await testUtil.rpc(itemInformationCommand, [itemInformationUpdateCommand,
            listingItemTemplate.id,
            'new title',
            'new short description',
            false,
            randomCategory.id
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('longDescription', 'string').getMessage());
    });

    test('Should fail because invalid itemCategoryId', async () => {
        const res: any = await testUtil.rpc(itemInformationCommand, [itemInformationUpdateCommand,
            listingItemTemplate.id,
            'new title',
            'new short description',
            'new long description',
            false
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('itemCategoryId', 'number').getMessage());
    });


    test('Should fail because missing ListingItemTemplate', async () => {
        const res: any = await testUtil.rpc(itemInformationCommand, [itemInformationUpdateCommand,
            0,
            'new title',
            'new short description',
            'new long description',
            randomCategory.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('ListingItemTemplate').getMessage());
    });

    test('Should fail because missing ItemInformation', async () => {

        // create ListingItemTemplate
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            false,              // generateItemInformation
            false,              // generateItemLocation
            false,              // generateShippingDestinations
            false,              // generateImages
            false,              // generatePaymentInformation
            false,              // generateEscrow
            false,              // generateItemPrice
            false,              // generateMessagingInformation
            false,              // generateListingItemObjects
            false,              // generateObjectDatas
            profile.id,         // profileId
            false,              // generateListingItem
            market.id           // soldOnMarketId
        ]).toParamsArray();

        const templatesWithoutItemInformation: resources.ListingItemTemplate[] = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE,
            1,
            true,
            generateListingItemTemplateParams
        );
        const template = templatesWithoutItemInformation[0];

        const res: any = await testUtil.rpc(itemInformationCommand, [itemInformationUpdateCommand,
            template.id,
            'new title',
            'new short description',
            'new long description',
            randomCategory.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(new ModelNotFoundException('ItemInformation').getMessage());
    });

    test('Should fail because missing ItemCategory', async () => {
        const res: any = await testUtil.rpc(itemInformationCommand, [itemInformationUpdateCommand,
            listingItemTemplate.id,
            'new title',
            'new short description',
            'new long description',
            0
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('ItemCategory').getMessage());
    });


    test('Should update ItemInformation', async () => {
        const title = 'new title';
        const shortDescription = 'new short description';
        const longDescription = 'new long description';

        const res: any = await testUtil.rpc(itemInformationCommand, [itemInformationUpdateCommand,
            listingItemTemplate.id,
            title,
            shortDescription,
            longDescription,
            randomCategory.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        expect(result.title).toBe(title);
        expect(result.shortDescription).toBe(shortDescription);
        expect(result.longDescription).toBe(longDescription);
        expect(result.ItemCategory.id).toBe(randomCategory.id);
    });


    test('Should create a STOREFRONT_ADMIN Market, a custom ItemCategory and clone MarketTemplate to the Storefront', async () => {
        // create a storefront
        storefront = await testUtil.createMarketplace(MarketType.STOREFRONT_ADMIN, profile.id, market.Identity.id);
        expect(storefront.id).toBeDefined();

        // get the storefront root category
        let res = await testUtil.rpc(categoryCommand, [categoryListCommand,
            storefront.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const rootCategory: resources.ItemCategory = res.getBody()['result'];
        expect(rootCategory.id).not.toBeUndefined();

        // add a new category under the root
        res = await testUtil.rpc(categoryCommand, [categoryAddCommand,
            storefront.id,
            'Test Category',
            'Test Category description',
            rootCategory.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        newCategoryOnStorefront = res.getBody()['result'];
        expect(newCategoryOnStorefront.id).not.toBeUndefined();
        expect(newCategoryOnStorefront.ParentItemCategory.id).toBe(rootCategory.id);

        // then finally clone the template
        res = await testUtil.rpc(templateCommand, [templateCloneCommand,
            listingItemTemplate.id,
            storefront.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        clonedListingItemTemplate = res.getBody()['result'];

        log.debug('clonedTemplate:', JSON.stringify(clonedListingItemTemplate, null, 2));
        expect(clonedListingItemTemplate).not.toBeUndefined();
        expect(clonedListingItemTemplate.ItemInformation).not.toBeUndefined();
        expect(clonedListingItemTemplate.ItemInformation.ItemCategory).toBeUndefined();
    });

    test('Should update cloned ListingItemTemplates ItemInformation on STOREFRONT to have custom ItemCategory', async () => {
        const title = 'new title';
        const shortDescription = 'new short description';
        const longDescription = 'new long description';

        const res: any = await testUtil.rpc(itemInformationCommand, [itemInformationUpdateCommand,
            clonedListingItemTemplate.id,
            title,
            shortDescription,
            longDescription,
            newCategoryOnStorefront.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        expect(result.title).toBe(title);
        expect(result.shortDescription).toBe(shortDescription);
        expect(result.longDescription).toBe(longDescription);
        expect(result.ItemCategory.id).toBe(newCategoryOnStorefront.id);
    });


    test('Should fail because the ListingItemTemplate has been published', async () => {

        // create ListingItemTemplate with ListingItem
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,           // generateItemInformation
            true,           // generateItemLocation
            true,           // generateShippingDestinations
            false,          // generateImages
            true,           // generatePaymentInformation
            true,           // generateEscrow
            true,           // generateItemPrice
            true,           // generateMessagingInformation
            false,          // generateListingItemObjects
            false,          // generateObjectDatas
            profile.id,     // profileId
            true,           // generateListingItem
            market.id       // soldOnMarketId
        ]).toParamsArray();

        const listingItemTemplates: resources.ListingItemTemplate[] = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE,
            2,
            true,
            generateListingItemTemplateParams
        );
        listingItemTemplate = listingItemTemplates[0];

        // then try to update
        const result = await testUtil.rpc(itemInformationCommand, [itemInformationUpdateCommand,
            listingItemTemplate.id,
            'ASDF title',
            'ASDF short description',
            'ASDF long description',
            randomCategory.id
        ]);
        result.expectJson();
        result.expectStatusCode(400);

        expect(result.error.error.message).toBe(new ModelNotModifiableException('ListingItemTemplate').getMessage());
    });

});
