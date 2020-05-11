// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import * as resources from 'resources';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { SearchOrder } from '../../../src/api/enums/SearchOrder';
import { SearchOrderField } from '../../../src/api/enums/SearchOrderField';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';

describe('ListingItemTemplateSearchCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const templateCommand = Commands.TEMPLATE_ROOT.commandName;
    const templateSearchCommand = Commands.TEMPLATE_SEARCH.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;

    let listingItemTemplate1: resources.ListingItemTemplate;
    let listingItemTemplate2: resources.ListingItemTemplate;

    let templatesWithoutItems: resources.ListingItemTemplate[];
    let templatesWithItems: resources.ListingItemTemplate[];

    beforeAll(async () => {
        await testUtil.cleanDb();

        defaultProfile = await testUtil.getDefaultProfile();
        defaultMarket = await testUtil.getDefaultMarket();

        // create templates without listingitems
        let generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            true,   // generateShippingDestinations
            false,   // generateItemImages
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

        templatesWithoutItems = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            2,                          // how many to generate
            true,                    // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplate[];

        listingItemTemplate1 = templatesWithoutItems[0];
        listingItemTemplate2 = templatesWithoutItems[1];

        // create templates with listingitems
        generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            true,   // generateShippingDestinations
            false,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            false,  // generateListingItemObjects
            false,  // generateObjectDatas
            defaultProfile.id, // profileId
            true,   // generateListingItem
            defaultMarket.id  // marketId
        ]).toParamsArray();

        templatesWithItems = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            2,                          // how many to generate
            true,                    // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplate[];

        // log.debug('templatesWithoutItems:', JSON.stringify(templatesWithoutItems, null, 2));
        // log.debug('templatesWithItems:', JSON.stringify(templatesWithItems, null, 2));

    });

    test('Should get all ListingItemTemplates for Profile', async () => {
        const res: any = await testUtil.rpc(templateCommand, [
            templateSearchCommand,
            0,
            10,
            SearchOrder.ASC,
            SearchOrderField.DATE,
            defaultProfile.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.ListingItemTemplate = res.getBody()['result'];
        expect(result).toHaveLength(4);
    });

    test('Should get only first ListingItemTemplate using pagination (page 0) for Profile', async () => {
        const res: any = await testUtil.rpc(templateCommand, [
            templateSearchCommand,
            0,
            1,
            SearchOrder.ASC,
            SearchOrderField.DATE,
            defaultProfile.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.ListingItemTemplate[] = res.getBody()['result'];
        expect(result).toHaveLength(1);
        expect(result[0].ItemInformation.title).toBe(listingItemTemplate1.ItemInformation.title);
        expect(result[0].ItemInformation.shortDescription).toBe(listingItemTemplate1.ItemInformation.shortDescription);
        expect(result[0].ItemInformation.longDescription).toBe(listingItemTemplate1.ItemInformation.longDescription);
        expect(result[0].Profile.id).toBe(defaultProfile.id);
    });

    test('Should get second ListingItemTemplate using pagination (page 1) for Profile', async () => {
        const res: any = await testUtil.rpc(templateCommand, [
            templateSearchCommand,
            1,
            1,
            SearchOrder.ASC,
            SearchOrderField.DATE,
            defaultProfile.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.ListingItemTemplate[] = res.getBody()['result'];
        expect(result).toHaveLength(1);
        expect(result[0].ItemInformation.title).toBe(listingItemTemplate2.ItemInformation.title);
        expect(result[0].ItemInformation.shortDescription).toBe(listingItemTemplate2.ItemInformation.shortDescription);
        expect(result[0].ItemInformation.longDescription).toBe(listingItemTemplate2.ItemInformation.longDescription);
        expect(result[0].Profile.id).toBe(defaultProfile.id);
    });

    test('Should return empty ListingItemTemplates array if invalid pagination', async () => {
        const res: any = await testUtil.rpc(templateCommand, [
            templateSearchCommand,
            2,
            2,
            SearchOrder.ASC,
            SearchOrderField.DATE,
            defaultProfile.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.ListingItemTemplate = res.getBody()['result'];
        expect(result).toHaveLength(0);
    });

    test('Should searchBy ListingItemTemplates by ItemCategory key', async () => {
        const res: any = await testUtil.rpc(templateCommand, [
            templateSearchCommand,
            0,
            2,
            SearchOrder.ASC,
            SearchOrderField.DATE,
            defaultProfile.id,
            undefined,
            listingItemTemplate1.ItemInformation.ItemCategory.key
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.ListingItemTemplate = res.getBody()['result'];
        expect(result.length).toBeGreaterThan(0);
        expect(result[0].ItemInformation.ItemCategory.key).toBe(listingItemTemplate1.ItemInformation.ItemCategory.key);
    });

    test('Should searchBy ListingItemTemplates by ItemCategory id', async () => {
        const res: any = await testUtil.rpc(templateCommand, [
            templateSearchCommand,
            0,
            2,
            SearchOrder.ASC,
            SearchOrderField.DATE,
            defaultProfile.id,
            undefined,
            listingItemTemplate1.ItemInformation.ItemCategory.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.ListingItemTemplate = res.getBody()['result'];
        expect(result.length).toBeGreaterThan(0);
        expect(result[0].ItemInformation.ItemCategory.id).toBe(listingItemTemplate1.ItemInformation.ItemCategory.id);
    });

    test('Should searchBy ListingItemTemplates by ItemInformation title', async () => {
        const res: any = await testUtil.rpc(templateCommand, [
            templateSearchCommand,
            0,
            2,
            SearchOrder.ASC,
            SearchOrderField.DATE,
            defaultProfile.id,
            listingItemTemplate1.ItemInformation.title
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.ListingItemTemplate = res.getBody()['result'];
        expect(result).toHaveLength(1);
        expect(result[0].ItemInformation.title).toBe(listingItemTemplate1.ItemInformation.title);
    });

    test('Should fail because we searchBy without order', async () => {
        const res: any = await testUtil.rpc(templateCommand, [
            templateSearchCommand,
            0,
            2
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('order').getMessage());
    });

    test('Should fail because we searchBy without orderField', async () => {
        const res: any = await testUtil.rpc(templateCommand, [
            templateSearchCommand,
            0,
            2,
            SearchOrder.ASC
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('orderField').getMessage());
    });

    test('Should return ListingItemTemplates NOT having published ListingItems', async () => {
        const res: any = await testUtil.rpc(templateCommand, [
            templateSearchCommand,
            0,
            10,
            SearchOrder.ASC,
            SearchOrderField.DATE,
            defaultProfile.id,
            undefined,
            undefined,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.ListingItemTemplate[] = res.getBody()['result'];
        // log.debug('result:', JSON.stringify(result, null, 2));
        expect(result).toHaveLength(2);
        expect(result[0].ListingItems.length).toBe(0);
    });

    test('Should return ListingItemTemplates having published ListingItems', async () => {
        const res: any = await testUtil.rpc(templateCommand, [
            templateSearchCommand,
            0,
            10,
            SearchOrder.ASC,
            SearchOrderField.DATE,
            defaultProfile.id,
            undefined,
            undefined,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.ListingItemTemplate[] = res.getBody()['result'];
        // log.debug('result:', JSON.stringify(result, null, 2));
        expect(result).toHaveLength(2);
        expect(result[0].ListingItems.length).toBe(1);
    });

});
