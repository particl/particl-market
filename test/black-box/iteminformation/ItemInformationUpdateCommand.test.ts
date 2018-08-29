// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { rpc, api } from '../lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';

describe('ItemInformationUpdateCommand', () => {
    const testUtil = new BlackBoxTestUtil();
    const method = Commands.ITEMINFORMATION_ROOT.commandName;
    const subCommand = Commands.ITEMINFORMATION_UPDATE.commandName;

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
    const testData = {
        title: 'Item Information',
        shortDescription: 'Item short description',
        longDescription: 'Item long description',
        itemCategory: {
            id: ''
        }
    };

    let createdListingItemTemplateId;
    let createdListingItemTemplateId2;
    beforeAll(async () => {
        await testUtil.cleanDb();
        const defaultProfile = await testUtil.getDefaultProfile();
        const profileId = defaultProfile.id;

        // get category
        const itemCategoryList: any = await testUtil.rpc(Commands.CATEGORY_ROOT.commandName, [Commands.CATEGORY_LIST.commandName]);
        const categories: any = itemCategoryList.getBody()['result'];
        testDataListingItemTemplate.itemInformation.itemCategory.id = categories.id;
        testData.itemCategory.id = categories.id;

        // create listing item
        testDataListingItemTemplate.profile_id = profileId;
        // TODO: use generate
        const addListingItemTemplate: any = await testUtil.addData(CreatableModel.LISTINGITEMTEMPLATE, testDataListingItemTemplate);
        const addListingItemTemplateResult = addListingItemTemplate;
        createdListingItemTemplateId = addListingItemTemplateResult.id;

        const testDataListingItemTemplate2 = testDataListingItemTemplate;
        delete testDataListingItemTemplate2.itemInformation;
        // TODO: use generate
        const addListingItemTemplate2: any = await testUtil.addData(CreatableModel.LISTINGITEMTEMPLATE, testDataListingItemTemplate2);
        const addListingItemTemplateResult2 = addListingItemTemplate2;
        createdListingItemTemplateId2 = addListingItemTemplateResult2.id;
    });

    test('Should fail because we want to create an ItemInformation without category id.', async () => {
        const res: any = await testUtil.rpc(method, [
            subCommand,
            createdListingItemTemplateId,
            testData.title,
            testData.shortDescription,
            testData.longDescription,
            null
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Category id must be numeric.');
    });

    test('Should fail because we want to create an ItemInformation without title.', async () => {
        const res: any = await testUtil.rpc(method, [
            subCommand,
            createdListingItemTemplateId,
            null,
            testData.shortDescription,
            testData.longDescription,
            testData.itemCategory.id
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Request body is not valid');
    });

    test('Should fail because we want to create an ItemInformation without shortDescription.', async () => {
        const res: any = await testUtil.rpc(method, [
            subCommand,
            createdListingItemTemplateId,
            testData.title,
            null,
            testData.longDescription,
            testData.itemCategory.id
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Request body is not valid');
    });

    test('Should fail because we want to create an ItemInformation without longDescription.', async () => {
        const res: any = await testUtil.rpc(method, [
            subCommand,
            createdListingItemTemplateId,
            testData.title,
            testData.longDescription,
            null,
            testData.itemCategory.id
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Request body is not valid');
    });

    test('Should fail because missing 1 arg.', async () => {
        const res: any = await testUtil.rpc(method, [
            subCommand,
            createdListingItemTemplateId,
            testData.title,
            testData.shortDescription,
            testData.longDescription
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Not enough args.');
    });

    test('Should fail because missing 2 args.', async () => {
        const res: any = await testUtil.rpc(method, [
            subCommand,
            createdListingItemTemplateId,
            testData.title,
            testData.shortDescription
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Not enough args.');
    });

    test('Should fail because missing 3 args.', async () => {
        const res: any = await testUtil.rpc(method, [
            subCommand,
            createdListingItemTemplateId,
            testData.title
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Not enough args.');
    });

    test('Should fail because missing 3 args.', async () => {
        const res: any = await testUtil.rpc(method, [
            subCommand,
            createdListingItemTemplateId
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Not enough args.');
    });

    test('Should fail because missing 3 args.', async () => {
        const res: any = await testUtil.rpc(method, [
            subCommand
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Not enough args.');
    });

    test('Should fail because listing template id is non-numeric.', async () => {
        // create item information
        const res: any = await testUtil.rpc(method, [
            subCommand,
            '<invalid listing template id>',
            testData.title,
            testData.shortDescription,
            testData.longDescription,
            testData.itemCategory.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Listing template id must be numeric.');
    });

    test('Should fail because category id is non-numeric.', async () => {
        // create item information
        const res: any = await testUtil.rpc(method, [
            subCommand,
            createdListingItemTemplateId,
            testData.title,
            testData.shortDescription,
            testData.longDescription,
            '<invalid category id>'
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Category id must be numeric.');
    });

    test('Should update ItemInformation', async () => {
        // update item information

        const getDataRes: any = await testUtil.rpc(method, [subCommand, createdListingItemTemplateId,
            testData.title, testData.shortDescription, testData.longDescription, testData.itemCategory.id]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.title).toBe(testData.title);
        expect(result.shortDescription).toBe(testData.shortDescription);
        expect(result.longDescription).toBe(testData.longDescription);
        expect(result.ItemCategory.id).toBe(testData.itemCategory.id);
    });

    test('Should fail update ItemInformation, since its not related with ListingItemTemplate', async () => {
        const getDataRes: any = await testUtil.rpc(method, [subCommand, createdListingItemTemplateId2,
            testData.title, testData.shortDescription, testData.longDescription, testData.itemCategory.id]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(404);
    });
});
