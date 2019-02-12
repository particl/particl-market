// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemTemplateParams as GenerateParams } from '../../../src/api/requests/params/GenerateListingItemTemplateParams';
import * as resources from 'resources';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { MessageException } from '../../../src/api/exceptions/MessageException';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';
import { NotFoundException } from '../../../src/api/exceptions/NotFoundException';

describe('ItemInformationUpdateCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const itemInfoRootCommand = Commands.ITEMINFORMATION_ROOT.commandName;
    const itemInfoUpdateSubCommand = Commands.ITEMINFORMATION_UPDATE.commandName;

    const testDataListingItemTemplate = {
        title: 'Item Information',
        shortDescription: 'Item short description',
        longDescription: 'Item long description',
        itemCategory: {
            id: ''
        }
    };

    let createdListingItemTemplateId: resources.ListingItemTemplate;
    let createdListingItemTemplateId2: resources.ListingItemTemplate;

    beforeAll(async () => {
        await testUtil.cleanDb();

        const defaultProfile: resources.Profile = await testUtil.getDefaultProfile();
        const defaultMarket: resources.Market = await testUtil.getDefaultMarket();

        // get category
        const itemCategoryList: any = await testUtil.rpc(Commands.CATEGORY_ROOT.commandName, [Commands.CATEGORY_LIST.commandName]);
        const categories: any = itemCategoryList.getBody()['result'];
        testDataListingItemTemplate.itemCategory.id = categories.id;

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
            defaultProfile.id, // profileId
            false,  // generateListingItem
            defaultMarket.id   // marketId
        ]).toParamsArray();

        const listingItemTemplates: resources.ListingItemTemplate[] = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE,
            2,
            true,
            generateListingItemTemplateParams
        );
        createdListingItemTemplateId = listingItemTemplates[0].id;
        createdListingItemTemplateId2 = listingItemTemplates[1].id;
    });

    test('Should fail because we want to create an ItemInformation without category ID.', async () => {
        const res: any = await testUtil.rpc(itemInfoRootCommand, [
            itemInfoUpdateSubCommand,
            createdListingItemTemplateId,
            testDataListingItemTemplate.title,
            testDataListingItemTemplate.shortDescription,
            testDataListingItemTemplate.longDescription,
            null
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new InvalidParamException('categoryId', 'number').getMessage());
    });

    test('Should fail because we want to create an ItemInformation without title.', async () => {
        const res: any = await testUtil.rpc(itemInfoRootCommand, [
            itemInfoUpdateSubCommand,
            createdListingItemTemplateId,
            null,
            testDataListingItemTemplate.shortDescription,
            testDataListingItemTemplate.longDescription,
            testDataListingItemTemplate.itemCategory.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new InvalidParamException('title', 'string').getMessage());
    });

    test('Should fail because we want to create an ItemInformation without shortDescription.', async () => {
        const res: any = await testUtil.rpc(itemInfoRootCommand, [
            itemInfoUpdateSubCommand,
            createdListingItemTemplateId,
            testDataListingItemTemplate.title,
            null,
            testDataListingItemTemplate.longDescription,
            testDataListingItemTemplate.itemCategory.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new InvalidParamException('shortDescription', 'string').getMessage());
    });

    test('Should fail because we want to create an ItemInformation without longDescription.', async () => {
        const res: any = await testUtil.rpc(itemInfoRootCommand, [
            itemInfoUpdateSubCommand,
            createdListingItemTemplateId,
            testDataListingItemTemplate.title,
            testDataListingItemTemplate.shortDescription,
            null,
            testDataListingItemTemplate.itemCategory.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new InvalidParamException('longDescription', 'string').getMessage());
    });

    test('Should fail because missing categoryID arg.', async () => {
        const res: any = await testUtil.rpc(itemInfoRootCommand, [
            itemInfoUpdateSubCommand,
            createdListingItemTemplateId,
            testDataListingItemTemplate.title,
            testDataListingItemTemplate.shortDescription,
            testDataListingItemTemplate.longDescription,
            null
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new InvalidParamException('categoryId', 'number').getMessage());
    });

    test('Should fail because missing categoryID arg.', async () => {
        const res: any = await testUtil.rpc(itemInfoRootCommand, [
            itemInfoUpdateSubCommand,
            createdListingItemTemplateId,
            testDataListingItemTemplate.title,
            testDataListingItemTemplate.shortDescription,
            testDataListingItemTemplate.longDescription,
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('categoryId').getMessage());
    });

    test('Should fail because missing categoryID, & longDescription args.', async () => {
        const res: any = await testUtil.rpc(itemInfoRootCommand, [
            itemInfoUpdateSubCommand,
            createdListingItemTemplateId,
            testDataListingItemTemplate.title,
            testDataListingItemTemplate.shortDescription
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('longDescription').getMessage());
    });

    test('Should fail because missing categoryID, longDescription, & shortDescription args.', async () => {
        const res: any = await testUtil.rpc(itemInfoRootCommand, [
            itemInfoUpdateSubCommand,
            createdListingItemTemplateId,
            testDataListingItemTemplate.title
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('shortDescription').getMessage());
    });

    test('Should fail because missing categoryID, longDescription, shortDescription, & title args.', async () => {
        const res: any = await testUtil.rpc(itemInfoRootCommand, [
            itemInfoUpdateSubCommand,
            createdListingItemTemplateId
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('title').getMessage());
    });

    test('Should fail because missing  categoryID, longDescription, shortDescription, title, & listingItemTemplateID args.', async () => {
        const res: any = await testUtil.rpc(itemInfoRootCommand, [
            itemInfoUpdateSubCommand
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('listingItemTemplateId').getMessage());
    });

    test('Should fail because ListingItemTemplate ID is non-numeric.', async () => {
        // create item information
        const res: any = await testUtil.rpc(itemInfoRootCommand, [
            itemInfoUpdateSubCommand,
            '<invalid listing template id>',
            testDataListingItemTemplate.title,
            testDataListingItemTemplate.shortDescription,
            testDataListingItemTemplate.longDescription,
            testDataListingItemTemplate.itemCategory.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new InvalidParamException('listingItemTemplateId', 'number').getMessage());
    });

    test('Should fail because category ID is non-numeric.', async () => {
        // create item information
        const res: any = await testUtil.rpc(itemInfoRootCommand, [
            itemInfoUpdateSubCommand,
            createdListingItemTemplateId,
            testDataListingItemTemplate.title,
            testDataListingItemTemplate.shortDescription,
            testDataListingItemTemplate.longDescription,
            '<invalid category id>'
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new InvalidParamException('categoryId', 'number').getMessage());
    });

    test('Should fail to update ItemInformation because non-existent id', async () => {
        // update item information
        const fakeId = 12345678909987654321; // Too large to be real
        const res: any = await testUtil.rpc(itemInfoRootCommand, [
            itemInfoUpdateSubCommand,
            fakeId,
            testDataListingItemTemplate.title,
            testDataListingItemTemplate.shortDescription,
            testDataListingItemTemplate.longDescription,
            testDataListingItemTemplate.itemCategory.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new NotFoundException(fakeId).getMessage());
    });

    test('Should fail to update ItemInformation because non-existent categoryId', async () => {
        // update item information
        const fakeId = 12345678909987654321; // Too large to be real
        const res: any = await testUtil.rpc(itemInfoRootCommand, [
            itemInfoUpdateSubCommand,
            createdListingItemTemplateId,
            testDataListingItemTemplate.title,
            testDataListingItemTemplate.shortDescription,
            testDataListingItemTemplate.longDescription,
            fakeId
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new NotFoundException(fakeId).getMessage());
    });

    test('Should update ItemInformation', async () => {
        // update item information

        const getDataRes: any = await testUtil.rpc(itemInfoRootCommand, [
            itemInfoUpdateSubCommand,
            createdListingItemTemplateId,
            testDataListingItemTemplate.title,
            testDataListingItemTemplate.shortDescription,
            testDataListingItemTemplate.longDescription,
            testDataListingItemTemplate.itemCategory.id
        ]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.title).toBe(testDataListingItemTemplate.title);
        expect(result.shortDescription).toBe(testDataListingItemTemplate.shortDescription);
        expect(result.longDescription).toBe(testDataListingItemTemplate.longDescription);
        expect(result.ItemCategory.id).toBe(testDataListingItemTemplate.itemCategory.id);
    });
});
