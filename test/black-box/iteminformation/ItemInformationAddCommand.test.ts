import { rpc, api } from '../lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';

describe('/ItemInformationAddCommand', () => {
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
        const addListingItemTemplate: any = await testUtil.addData(CreatableModel.LISTINGITEMTEMPLATE, testDataListingItemTemplate);
        const addListingItemTemplateResult = addListingItemTemplate;
        createdListingItemTemplateId = addListingItemTemplateResult.id;
    });

    test('Should fail because we want to create an iteminformation with embty body', async () => {
        const res = await rpc(method, [subCommand]);
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('Should fail because we want to create an iteminformation without   category id', async () => {
        const res: any = await rpc(method, [subCommand, createdListingItemTemplateId,
            testDataListingItemTemplate.itemInformation.title,
            testDataListingItemTemplate.itemInformation.shortDescription,
            testDataListingItemTemplate.itemInformation.longDescription, null]);
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('Should fail because we want to create an iteminformation without title', async () => {
        const res: any = await rpc(method, [subCommand, createdListingItemTemplateId,
            null,
            testDataListingItemTemplate.itemInformation.shortDescription,
            testDataListingItemTemplate.itemInformation.longDescription,
            testDataListingItemTemplate.itemInformation.itemCategory.id]);
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('Should fail because we want to create an iteminformation without shortDescription', async () => {
        const res: any = await rpc(method, [subCommand, createdListingItemTemplateId,
            testDataListingItemTemplate.itemInformation.title,
            null,
            testDataListingItemTemplate.itemInformation.longDescription,
            testDataListingItemTemplate.itemInformation.itemCategory.id]);
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('Should fail because we want to create an iteminformation without longDescription', async () => {
        const res: any = await rpc(method, [subCommand, createdListingItemTemplateId,
            testDataListingItemTemplate.itemInformation.title,
            testDataListingItemTemplate.itemInformation.longDescription,
            null,
            testDataListingItemTemplate.itemInformation.itemCategory.id
            ]);
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('Should create a new Item Information by RPC', async () => {
        // create item information
        const getDataRes: any = await rpc(method, [subCommand, createdListingItemTemplateId,
            testDataListingItemTemplate.itemInformation.title,
            testDataListingItemTemplate.itemInformation.shortDescription,
            testDataListingItemTemplate.itemInformation.longDescription,
            testDataListingItemTemplate.itemInformation.itemCategory.id]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.title).toBe(testDataListingItemTemplate.itemInformation.title);
        expect(result.shortDescription).toBe(testDataListingItemTemplate.itemInformation.shortDescription);
        expect(result.longDescription).toBe(testDataListingItemTemplate.itemInformation.longDescription);
        expect(result.ItemCategory.id).toBe(testDataListingItemTemplate.itemInformation.itemCategory.id);
    });

});
