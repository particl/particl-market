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
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';

describe('ItemInformationGetCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const itemInfoRootCommand = Commands.ITEMINFORMATION_ROOT.commandName;
    const itemInfoGetSubCommand = Commands.ITEMINFORMATION_GET.commandName;

    let profile: resources.Profile;
    let market: resources.Market;

    let listingItemTemplate: resources.ListingItemTemplate;

    beforeAll(async () => {
        await testUtil.cleanDb();

        profile = await testUtil.getDefaultProfile();
        expect(profile.id).toBeDefined();
        market = await testUtil.getDefaultMarket(profile.id);
        expect(market.id).toBeDefined();

        // create ListingItemTemplate
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            true,   // generateShippingDestinations
            false,  // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            false,  // generateListingItemObjects
            false,  // generateObjectDatas
            profile.id, // profileId
            false,  // generateListingItem
            market.id   // marketId
        ]).toParamsArray();

        const listingItemTemplates: resources.ListingItemTemplate[] = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE,
            2,
            true,
            generateListingItemTemplateParams
        );
        listingItemTemplate = listingItemTemplates[0];
    });

    test('Should fail because of missing listingItemTemplateId', async () => {
        const res: any = await testUtil.rpc(itemInfoRootCommand, [itemInfoGetSubCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(new MissingParamException('listingItemTemplateId').getMessage());
    });

    test('Should fail because of invalid listingItemTemplateId', async () => {
        const res: any = await testUtil.rpc(itemInfoRootCommand, [itemInfoGetSubCommand,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(new InvalidParamException('listingItemTemplateId', 'number').getMessage());
    });

    test('Should fail because of a non-existent listingItemTemplate', async () => {
        const res: any = await testUtil.rpc(itemInfoRootCommand, [itemInfoGetSubCommand,
            0
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(new ModelNotFoundException('ListingItemTemplate').getMessage());
    });

    test('Should fail because ItemInformation doesnt exist', async () => {

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

        const res: any = await testUtil.rpc(itemInfoRootCommand, [itemInfoGetSubCommand,
            template.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(new ModelNotFoundException('ItemInformation').getMessage());
    });

    test('Should get a ItemInformation using listingItemTemplateId', async () => {
        // get listingItemInformation by listingItemTemplateId
        const getDataRes: any = await testUtil.rpc(itemInfoRootCommand, [itemInfoGetSubCommand, listingItemTemplate.id]);

        const result: any = getDataRes.getBody()['result'];
        expect(result.title).toBe(listingItemTemplate.ItemInformation.title);
        expect(result.shortDescription).toBe(listingItemTemplate.ItemInformation.shortDescription);
        expect(result.longDescription).toBe(listingItemTemplate.ItemInformation.longDescription);
        expect(result.ItemCategory.id).toBe(listingItemTemplate.ItemInformation.itemCategoryId);
    });
});
