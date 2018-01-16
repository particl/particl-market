import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Logger } from '../../src/core/Logger';
import { ItemInformationUpdateCommand } from '../../src/api/commands/iteminformation/ItemInformationUpdateCommand';

describe('/ItemInformationUpdateCommand', () => {
    const testUtil = new BlackBoxTestUtil();
    const itemInformationService = null;
    const method =  new ItemInformationUpdateCommand(itemInformationService, Logger).name;

    const testDataListingItemTemplate = {
        profile_id: 0,
        itemInformation: {
            title: 'Item Information with Templates First',
            shortDescription: 'Item short description with Templates First',
            longDescription: 'Item long description with Templates First',
            itemCategory: {
                key: 'cat_high_luxyry_items'
            }
        }
    };
    let createdListingItemTemplateId;
    let createdListingItemTemplateId2;
    beforeAll(async () => {
        await testUtil.cleanDb();
        const defaultProfile = await testUtil.getDefaultProfile();
        const profileId = defaultProfile.id;
        // create listing item
        testDataListingItemTemplate.profile_id = profileId;
        const addListingItemTemplate: any = await testUtil.addData('listingitemtemplate', testDataListingItemTemplate);
        const addListingItemTemplateResult = addListingItemTemplate.getBody()['result'];
        createdListingItemTemplateId = addListingItemTemplateResult.id;

        const testDataListingItemTemplate2 = testDataListingItemTemplate;
        delete testDataListingItemTemplate2.itemInformation;
        const addListingItemTemplate2: any = await testUtil.addData('listingitemtemplate', testDataListingItemTemplate2);
        const addListingItemTemplateResult2 = addListingItemTemplate2.getBody()['result'];
        createdListingItemTemplateId2 = addListingItemTemplateResult2.id;
    });

    const testData = {
        title: 'Item Information',
        shortDescription: 'Item short description',
        longDescription: 'Item long description',
        itemCategory: {
            key: 'cat_high_luxyry_items'
        }
    };

    test('Should update Item Information by RPC', async () => {
        // update item information
        const getDataRes: any = await rpc(method, [createdListingItemTemplateId,
            testData.title, testData.shortDescription, testData.longDescription, testData.itemCategory.key]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.title).toBe(testData.title);
        expect(result.shortDescription).toBe(testData.shortDescription);
        expect(result.longDescription).toBe(testData.longDescription);
        expect(result.ItemCategory.key).toBe(testData.itemCategory.key);
    });

    test('Should fail update Item Information, item-information is not related with item-template', async () => {
        const getDataRes: any = await rpc(method, [createdListingItemTemplateId2,
            testData.title, testData.shortDescription, testData.longDescription, testData.itemCategory.key]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(404);
    });
});
