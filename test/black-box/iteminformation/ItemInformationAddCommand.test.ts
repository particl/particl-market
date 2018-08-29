// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { rpc, api } from '../lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';

describe('ItemInformationAddCommand', () => {
    const testUtil = new BlackBoxTestUtil();
    const method = Commands.ITEMINFORMATION_ROOT.commandName;
    const subCommand = Commands.ITEMINFORMATION_ADD.commandName;

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
        const defaultProfile = await testUtil.getDefaultProfile();
        const profileId = defaultProfile.id;

        // get category
        const itemCategoryList: any = await rpc(Commands.CATEGORY_ROOT.commandName, [Commands.CATEGORY_LIST.commandName]);
        const categories: any = itemCategoryList.getBody()['result'];
        testDataListingItemTemplate.itemInformation.itemCategory.id = categories.id;

        // create listing item
        testDataListingItemTemplate.profile_id = profileId;
        // TODO: use generate
        const addListingItemTemplate: any = await testUtil.addData(CreatableModel.LISTINGITEMTEMPLATE, testDataListingItemTemplate);
        const addListingItemTemplateResult = addListingItemTemplate;
        createdListingItemTemplateId = addListingItemTemplateResult.id;
    });

    test('Should fail because we want to create an ItemInformation with empty body.', async () => {
        const res = await rpc(method, [subCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Category id must be numeric.');
    });

    test('Should fail because we want to create an ItemInformation without category id.', async () => {
        const res: any = await testUtil.rpc(method, [
            subCommand,
            createdListingItemTemplateId,
            testDataListingItemTemplate.itemInformation.title,
            testDataListingItemTemplate.itemInformation.shortDescription,
            testDataListingItemTemplate.itemInformation.longDescription,
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
        const res: any = await testUtil.rpc(method, [
            subCommand,
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
        const res: any = await testUtil.rpc(method, [
            subCommand,
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

    test('Should fail because missing 1 arg.', async () => {
        const res: any = await testUtil.rpc(method, [
            subCommand,
            createdListingItemTemplateId,
            testDataListingItemTemplate.itemInformation.title,
            testDataListingItemTemplate.itemInformation.shortDescription,
            testDataListingItemTemplate.itemInformation.longDescription
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
            testDataListingItemTemplate.itemInformation.title,
            testDataListingItemTemplate.itemInformation.shortDescription
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
            testDataListingItemTemplate.itemInformation.title
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
            testDataListingItemTemplate.itemInformation.title,
            testDataListingItemTemplate.itemInformation.shortDescription,
            testDataListingItemTemplate.itemInformation.longDescription,
            testDataListingItemTemplate.itemInformation.itemCategory.id
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
            testDataListingItemTemplate.itemInformation.title,
            testDataListingItemTemplate.itemInformation.shortDescription,
            testDataListingItemTemplate.itemInformation.longDescription,
            '<invalid category id>'
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Category id must be numeric.');
    });

    test('Should create a new ItemInformation.', async () => {
        // create item information
        const getDataRes: any = await testUtil.rpc(method, [
            subCommand,
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
