// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
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
import { ModelNotModifiableException } from '../../../src/api/exceptions/ModelNotModifiableException';

describe('ItemInformationUpdateCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const itemInformationCommand = Commands.ITEMINFORMATION_ROOT.commandName;
    const itemInformationUpdateCommand = Commands.ITEMINFORMATION_UPDATE.commandName;
    let profile: resources.Profile;
    let market: resources.Market;

    let listingItemTemplate: resources.ListingItemTemplate;
    let itemCategory: resources.ItemCategory;

    beforeAll(async () => {
        await testUtil.cleanDb();

        profile = await testUtil.getDefaultProfile();
        expect(profile.id).toBeDefined();
        market = await testUtil.getDefaultMarket(profile.id);
        expect(market.id).toBeDefined();

        // create ListingItemTemplate
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,           // generateItemInformation
            true,           // generateItemLocation
            true,           // generateShippingDestinations
            false,          // generateItemImages
            true,           // generatePaymentInformation
            true,           // generateEscrow
            true,           // generateItemPrice
            true,           // generateMessagingInformation
            false,          // generateListingItemObjects
            false,          // generateObjectDatas
            profile.id,     // profileId
            false,          // generateListingItem
            market.id       // soldOnMarketId
        ]).toParamsArray();

        const listingItemTemplates: resources.ListingItemTemplate[] = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE,
            1,
            true,
            generateListingItemTemplateParams
        );
        listingItemTemplate = listingItemTemplates[0];
        itemCategory = listingItemTemplate.ItemInformation.ItemCategory;

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
            itemCategory.id
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
            itemCategory.id
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
            itemCategory.id
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
            itemCategory.id
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('longDescription', 'string').getMessage());
    });

    test('Should fail because invalid categoryId', async () => {
        const res: any = await testUtil.rpc(itemInformationCommand, [itemInformationUpdateCommand,
            listingItemTemplate.id,
            'new title',
            'new short description',
            'new long description',
            false
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('categoryId', 'number').getMessage());
    });

    test('Should fail because missing ListingItemTemplate', async () => {
        const res: any = await testUtil.rpc(itemInformationCommand, [itemInformationUpdateCommand,
            0,
            'new title',
            'new short description',
            'new long description',
            itemCategory.id
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
            false,              // generateItemImages
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
            itemCategory.id
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
            itemCategory.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        expect(result.title).toBe(title);
        expect(result.shortDescription).toBe(shortDescription);
        expect(result.longDescription).toBe(longDescription);
        expect(result.ItemCategory.id).toBe(itemCategory.id);
    });

    test('Should fail because the ListingItemTemplate has been published', async () => {

        // create ListingItemTemplate with ListingItem
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,           // generateItemInformation
            true,           // generateItemLocation
            true,           // generateShippingDestinations
            false,          // generateItemImages
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
            itemCategory.id
        ]);
        result.expectJson();
        result.expectStatusCode(400);

        expect(result.error.error.message).toBe(new ModelNotModifiableException('ListingItemTemplate').getMessage());
    });


});
