// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { rpc, api } from '../lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemTemplateParams as GenerateParams } from '../../../src/api/requests/params/GenerateListingItemTemplateParams';
import * as resources from 'resources';

describe('ItemInformationAddCommand', () => {
    const testUtil = new BlackBoxTestUtil();
    const itemInfoRootCommand = Commands.ITEMINFORMATION_ROOT.commandName;
    const itemInfoAddSubCommand = Commands.ITEMINFORMATION_ADD.commandName;

    const testDataListingItemTemplate = {
        profile_id: 0,
        itemInformation: {
            title: 'Item Information with Templates First',
            shortDescription: 'Item short description with Templates First',
            longDescription: 'Item long description with Templates First',
            itemCategory: {
                id: null
            }
        }
    };
    let createdListingItemTemplateId;

    beforeAll(async () => {
        await testUtil.cleanDb();
        const defaultProfile: resources.Profile = await testUtil.getDefaultProfile();
        const profileId = defaultProfile.id;

        const defaultMarket: resources.Market = await testUtil.getDefaultMarket();
        const marketId = defaultMarket.id;

        // get category
        const itemCategoryList: any = await rpc(Commands.CATEGORY_ROOT.commandName, [Commands.CATEGORY_LIST.commandName]);
        const categories: any = itemCategoryList.getBody()['result'];
        testDataListingItemTemplate.itemInformation.itemCategory.id = categories.id;

        // create listing item
        const generateListingItemTemplateParams = new GenerateParams([
            true,   // generateItemInformation
            true,   // generateShippingDestinations
            false,  // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            false,  // generateListingItemObjects
            false,  // generateObjectDatas
            profileId, // profileId
            false,  // generateListingItem
            marketId   // marketId
        ]).toParamsArray();
        const listingItemTemplates: resources.ListingItemTemplate[] = await testUtil.generateData(CreatableModel.LISTINGITEMTEMPLATE, 2, true, generateListingItemTemplateParams);
        createdListingItemTemplateId = listingItemTemplates[0].id;
    });

    test('Should fail because we want to create an ItemInformation without category ID.', async () => {
        const res: any = await testUtil.rpc(itemInfoRootCommand, [
            itemInfoAddSubCommand,
            createdListingItemTemplateId,
            testDataListingItemTemplate.itemInformation.title,
            testDataListingItemTemplate.itemInformation.shortDescription,
            testDataListingItemTemplate.itemInformation.longDescription,
            null
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Category ID must be numeric.');
    });

    test('Should fail because we want to create an ItemInformation without title.', async () => {
        const res: any = await testUtil.rpc(itemInfoRootCommand, [
            itemInfoAddSubCommand,
            createdListingItemTemplateId,
            null,
            testDataListingItemTemplate.itemInformation.shortDescription,
            testDataListingItemTemplate.itemInformation.longDescription,
            testDataListingItemTemplate.itemInformation.itemCategory.id
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Request body is not valid');
    });

    test('Should fail because we want to create an ItemInformation without shortDescription.', async () => {
        const res: any = await testUtil.rpc(itemInfoRootCommand, [
            itemInfoAddSubCommand,
            createdListingItemTemplateId,
            testDataListingItemTemplate.itemInformation.title,
            null,
            testDataListingItemTemplate.itemInformation.longDescription,
            testDataListingItemTemplate.itemInformation.itemCategory.id
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Request body is not valid');
    });

    test('Should fail because we want to create an ItemInformation without longDescription.', async () => {
        const res: any = await testUtil.rpc(itemInfoRootCommand, [
            itemInfoAddSubCommand,
            createdListingItemTemplateId,
            testDataListingItemTemplate.itemInformation.title,
            testDataListingItemTemplate.itemInformation.longDescription,
            null,
            testDataListingItemTemplate.itemInformation.itemCategory.id
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Request body is not valid');
    });

    test('Should fail because missing categoryID arg.', async () => {
        const res: any = await testUtil.rpc(itemInfoRootCommand, [
            itemInfoAddSubCommand,
            createdListingItemTemplateId,
            testDataListingItemTemplate.title,
            testDataListingItemTemplate.shortDescription,
            testDataListingItemTemplate.longDescription
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Not enough args.');
    });

    test('Should fail because missing categoryID, & longDescription args.', async () => {
        const res: any = await testUtil.rpc(itemInfoRootCommand, [
            itemInfoAddSubCommand,
            createdListingItemTemplateId,
            testDataListingItemTemplate.title,
            testDataListingItemTemplate.shortDescription
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Not enough args.');
    });

    test('Should fail because missing categoryID, longDescription, & shortDescription args.', async () => {
        const res: any = await testUtil.rpc(itemInfoRootCommand, [
            itemInfoAddSubCommand,
            createdListingItemTemplateId,
            testDataListingItemTemplate.title
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Not enough args.');
    });

    test('Should fail because missing categoryID, longDescription, shortDescription, & title args.', async () => {
        const res: any = await testUtil.rpc(itemInfoRootCommand, [
            itemInfoAddSubCommand,
            createdListingItemTemplateId
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Not enough args.');
    });

    test('Should fail because missing  categoryID, longDescription, shortDescription, title, & listingItemTemplateID args.', async () => {
        const res: any = await testUtil.rpc(itemInfoRootCommand, [
            itemInfoAddSubCommand
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Not enough args.');
    });

    test('Should fail because ListingItemTemplate ID is non-numeric.', async () => {
        // create item information
        const res: any = await testUtil.rpc(itemInfoRootCommand, [
            itemInfoAddSubCommand,
            '<invalid listing template id>',
            testDataListingItemTemplate.itemInformation.title,
            testDataListingItemTemplate.itemInformation.shortDescription,
            testDataListingItemTemplate.itemInformation.longDescription,
            testDataListingItemTemplate.itemInformation.itemCategory.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('ListingItemTemplate ID must be numeric.');
    });

    test('Should fail because category ID is non-numeric.', async () => {
        // create item information
        const res: any = await testUtil.rpc(itemInfoRootCommand, [
            itemInfoAddSubCommand,
            createdListingItemTemplateId,
            testDataListingItemTemplate.itemInformation.title,
            testDataListingItemTemplate.itemInformation.shortDescription,
            testDataListingItemTemplate.itemInformation.longDescription,
            '<invalid category id>'
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Category ID must be numeric.');
    });

    test('Should create a new ItemInformation.', async () => {
        // create item information
        const getDataRes: any = await testUtil.rpc(itemInfoRootCommand, [
            itemInfoAddSubCommand,
            createdListingItemTemplateId,
            testDataListingItemTemplate.itemInformation.title,
            testDataListingItemTemplate.itemInformation.shortDescription,
            testDataListingItemTemplate.itemInformation.longDescription,
            testDataListingItemTemplate.itemInformation.itemCategory.id
        ]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.title).toBe(testDataListingItemTemplate.itemInformation.title);
        expect(result.shortDescription).toBe(testDataListingItemTemplate.itemInformation.shortDescription);
        expect(result.longDescription).toBe(testDataListingItemTemplate.itemInformation.longDescription);
        expect(result.ItemCategory.id).toBe(testDataListingItemTemplate.itemInformation.itemCategory.id);
    });

});
