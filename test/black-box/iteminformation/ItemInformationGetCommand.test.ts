import { rpc, api } from '../lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';

describe('/ItemInformationGetCommand', () => {
    const testUtil = new BlackBoxTestUtil();
    const method = Commands.ITEMINFORMATION_ROOT.commandName;
    const subCommand = Commands.ITEMINFORMATION_GET.commandName;

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
        // create listing item
        testDataListingItemTemplate.profile_id = profileId;

        // get category
        const itemCategoryList: any = await rpc(Commands.CATEGORY_ROOT.commandName, [Commands.CATEGORY_LIST.commandName]);
        const categories: any = itemCategoryList.getBody()['result'];
        testDataListingItemTemplate.itemInformation.itemCategory.id = categories.id;

        // add item template
        const addListingItemTemplate: any = await testUtil.addData(CreatableModel.LISTINGITEMTEMPLATE, testDataListingItemTemplate);
        const addListingItemTemplateResult = addListingItemTemplate;
        createdListingItemTemplateId = addListingItemTemplateResult.id;
    });

    test('Should get a ListingItemInformation by listingItemTemplateId RPC', async () => {
        // get listingItemInformation by listingItemTemplateId
        const getDataRes: any = await rpc(method, [subCommand, createdListingItemTemplateId]);

        const result: any = getDataRes.getBody()['result'];
        expect(result.title).toBe(testDataListingItemTemplate.itemInformation.title);
        expect(result.shortDescription).toBe(testDataListingItemTemplate.itemInformation.shortDescription);
        expect(result.longDescription).toBe(testDataListingItemTemplate.itemInformation.longDescription);
        expect(result.ItemCategory.id).toBe(testDataListingItemTemplate.itemInformation.itemCategory.id);
    });
});
