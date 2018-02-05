import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Commands } from '../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../src/api/enums/CreatableModel';

describe('/ItemInformationUpdateCommand', () => {
    const testUtil = new BlackBoxTestUtil();
    const itemInformationService = null;
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
        const itemCategoryList: any = await rpc(Commands.CATEGORY_ROOT.commandName, [Commands.CATEGORY_LIST.commandName]);
        const categories: any = itemCategoryList.getBody()['result'];
        testDataListingItemTemplate.itemInformation.itemCategory.id = categories.id;
        testData.itemCategory.id = categories.id;

        // create listing item
        testDataListingItemTemplate.profile_id = profileId;
        const addListingItemTemplate: any = await testUtil.addData(CreatableModel.LISTINGITEMTEMPLATE, testDataListingItemTemplate);
        const addListingItemTemplateResult = addListingItemTemplate;
        createdListingItemTemplateId = addListingItemTemplateResult.id;

        const testDataListingItemTemplate2 = testDataListingItemTemplate;
        delete testDataListingItemTemplate2.itemInformation;
        const addListingItemTemplate2: any = await testUtil.addData(CreatableModel.LISTINGITEMTEMPLATE, testDataListingItemTemplate2);
        const addListingItemTemplateResult2 = addListingItemTemplate2;
        createdListingItemTemplateId2 = addListingItemTemplateResult2.id;
    });

    test('Should fail because we want to update an iteminformation with embty body', async () => {
        const res = await rpc(method, [subCommand, createdListingItemTemplateId]);
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('Should fail because we want to update an iteminformation without title', async () => {
        const res = await rpc(method, [subCommand,
            createdListingItemTemplateId, null, testData.shortDescription, testData.longDescription, testData.itemCategory.id]);
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('Should fail because we want to update an iteminformation without shortDescription', async () => {
        const res = await rpc(method, [subCommand, createdListingItemTemplateId, testData.title, null, testData.longDescription, testData.itemCategory.id]);
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('Should fail because we want to update an iteminformation without longDescription', async () => {
        const res = await rpc(method, [subCommand, createdListingItemTemplateId, testData.title, testData.shortDescription, null, testData.itemCategory.id]);
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('Should fail because we want to update an iteminformation without category id', async () => {
        const res = await rpc(method, [subCommand, createdListingItemTemplateId, testData.title, testData.shortDescription, testData.longDescription, null]);
        res.expectJson();
        res.expectStatusCode(400);
    });


    test('Should update Item Information by RPC', async () => {
        // update item information

        const getDataRes: any = await rpc(method, [subCommand, createdListingItemTemplateId,
            testData.title, testData.shortDescription, testData.longDescription, testData.itemCategory.id]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.title).toBe(testData.title);
        expect(result.shortDescription).toBe(testData.shortDescription);
        expect(result.longDescription).toBe(testData.longDescription);
        expect(result.ItemCategory.id).toBe(testData.itemCategory.id);
    });

    test('Should fail update Item Information, item-information is not related with item-template', async () => {
        const getDataRes: any = await rpc(method, [subCommand, createdListingItemTemplateId2,
            testData.title, testData.shortDescription, testData.longDescription, testData.itemCategory.id]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(404);
    });
});
