import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Commands } from '../../src/api/commands/CommandEnumType';

describe('/ItemLocationRemoveCommand', () => {
    const testUtil = new BlackBoxTestUtil();
    const method = Commands.ITEMLOCATION_ROOT.commandName;
    const subCommand = Commands.ITEMLOCATION_REMOVE.commandName;

    const testDataListingItemTemplate = {
        profile_id: 0,
        itemInformation: {
            title: 'Item Information with Templates First',
            shortDescription: 'Item short description with Templates First',
            longDescription: 'Item long description with Templates First',
            itemCategory: {
                key: 'cat_high_luxyry_items'
            },
            listingItemId: null,
            itemLocation: {
                region: 'South Africa',
                address: 'asdf, asdf, asdf',
                locationMarker: {
                    markerTitle: 'Helsinki',
                    markerText: 'Helsinki',
                    lat: 12.1234,
                    lng: 23.2314
                }
            }
        }
    };

    let createdTemplateId;
    let createdlistingitemId;

    beforeAll(async () => {
        await testUtil.cleanDb();
        // get profile
        const defaultProfile = await testUtil.getDefaultProfile();
        testDataListingItemTemplate.profile_id = defaultProfile.id;

        // create item template
        const addListingItemTempRes: any = await testUtil.addData('listingitemtemplate', testDataListingItemTemplate);
        createdTemplateId = addListingItemTempRes.getBody()['result'].id;
        // create listing item
        const listingItems = await testUtil.generateData('listingitem', 1);
        createdlistingitemId = listingItems[0]['id'];
    });

    test('Should remove item location', async () => {
        // remove item location
        const addDataRes: any = await rpc(method, [subCommand, createdTemplateId]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(200);
    });

    test('Should fail to remove item location because item location already removed', async () => {
        // remove item location
        const addDataRes: any = await rpc(method, [subCommand, createdTemplateId]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(404);
    });

    test('Should not remove item location because item information is related with listing item', async () => {
        // set listing item id in item information
        testDataListingItemTemplate.itemInformation.listingItemId = createdlistingitemId;
        // create new item template
        const newListingItemTemplate = await testUtil.addData('listingitemtemplate', testDataListingItemTemplate);
        const newTemplateId = newListingItemTemplate.getBody()['result'].id;
        // remove item location
        const addDataRes: any = await rpc(method, [subCommand, newTemplateId]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(404);
        expect(addDataRes.error.error.success).toBe(false);
        expect(addDataRes.error.error.message).toBe('ItemLocation cannot be removed because the item has allready been posted!');
    });

    test('Should fail to remove item location if Item-information not exist', async () => {
        // create new item template
        delete testDataListingItemTemplate.itemInformation;
        const addListingItemTempRes: any = await testUtil.addData('listingitemtemplate', testDataListingItemTemplate);
        const templateId = addListingItemTempRes.getBody()['result'].id;
        // remove item location
        const addDataRes: any = await rpc(method, [subCommand, templateId]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(404);
        expect(addDataRes.error.error.success).toBe(false);
        expect(addDataRes.error.error.message).toBe('Item Information or Item Location with the listing template id=' + templateId + ' was not found!');
    });

});
