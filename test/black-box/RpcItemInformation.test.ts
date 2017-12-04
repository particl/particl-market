import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';

describe('/RpcItemInformation', () => {
    const testUtil = new BlackBoxTestUtil();
    const method = 'createiteminformation';

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
    beforeAll(async () => {
        await testUtil.cleanDb();
        const addProfileRes: any = await testUtil.addData('profile', { name: 'TESTING-PROFILE-NAME' });
        const profileId = addProfileRes.getBody()['result'].id;
        // create listing item
        testDataListingItemTemplate.profile_id = profileId;
        const addListingItemTemplate: any = await testUtil.addData('listingitemtemplate', testDataListingItemTemplate);
        const addListingItemTemplateResult = addListingItemTemplate.getBody()['result'];
        createdListingItemTemplateId = addListingItemTemplateResult.id;
    });

    test('Should create a new Item Information by RPC', async () => {
        // create item information
        const getDataRes: any = await rpc(method, [createdListingItemTemplateId,
            testDataListingItemTemplate.itemInformation.title,
            testDataListingItemTemplate.itemInformation.shortDescription,
            testDataListingItemTemplate.itemInformation.longDescription,
            testDataListingItemTemplate.itemInformation.itemCategory.key]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.title).toBe(testDataListingItemTemplate.itemInformation.title);
        expect(result.shortDescription).toBe(testDataListingItemTemplate.itemInformation.shortDescription);
        expect(result.longDescription).toBe(testDataListingItemTemplate.itemInformation.longDescription);
        expect(result.ItemCategory.key).toBe(testDataListingItemTemplate.itemInformation.itemCategory.key);
    });
});
