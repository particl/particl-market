import { rpc, api } from '../lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { PaymentType } from '../../../src/api/enums/PaymentType';
import { ListingItemTemplateCreateRequest } from '../../../src/api/requests/ListingItemTemplateCreateRequest';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemParams } from '../../../src/api/requests/params/GenerateListingItemParams';
import { ListingItem } from 'resources';
import { HashableObjectType } from '../../../src/api/enums/HashableObjectType';

describe('/ItemLocationUpdateCommand', () => {
    const testUtil = new BlackBoxTestUtil();

    const method = Commands.ITEMLOCATION_ROOT.commandName;
    const subCommand = Commands.ITEMLOCATION_UPDATE.commandName;

    const testDataListingItemTemplate = {
        profile_id: 0,
        hash: '',
        itemInformation: {
            title: 'Item Information with Templates',
            shortDescription: 'Item short description with Templates',
            longDescription: 'Item long description with Templates',
            listingItemId: null,
            itemCategory: {
                key: 'cat_high_luxyry_items'
            },
            itemLocation: {
                region: 'CN',
                address: 'USA'
            }
        },
        paymentInformation: {
            type: PaymentType.SALE
        }
    } as ListingItemTemplateCreateRequest;

    const testDataUpdated = ['CN', 'USA', 'TITLE', 'TEST DESCRIPTION', 25.7, 22.77];

    let createdTemplateId;
    let createdItemInformationId;

    const generateListingItemParams = new GenerateListingItemParams([
        false,   // generateItemInformation
        false,   // generateShippingDestinations
        false,   // generateItemImages
        false,   // generatePaymentInformation
        false,   // generateEscrow
        false,   // generateItemPrice
        false,   // generateMessagingInformation
        false    // generateListingItemObjects
    ]).toParamsArray();

    beforeAll(async () => {
        await testUtil.cleanDb();

        // profile
        const defaultProfile = await testUtil.getDefaultProfile();
        testDataListingItemTemplate.profile_id = defaultProfile.id;

        // set hash
        testDataListingItemTemplate.hash = ObjectHash.getHash(testDataListingItemTemplate, HashableObjectType.LISTINGITEMTEMPLATE);
        // create item template
        const addListingItemTempRes: any = await testUtil.addData(CreatableModel.LISTINGITEMTEMPLATE, testDataListingItemTemplate);
        const result: any = addListingItemTempRes;
        createdTemplateId = result.id;
        createdItemInformationId = result.ItemInformation.id;
        testDataUpdated.unshift(createdTemplateId);

    });

    test('Should update item location and set null location marker fields', async () => {
        // update item location
        const addDataRes: any = await rpc(method, [subCommand, createdTemplateId, testDataUpdated[1], testDataUpdated[2]]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(200);
        const result: any = addDataRes.getBody()['result'];

        expect(result.region).toBe(testDataUpdated[1]);
        expect(result.address).toBe(testDataUpdated[2]);
        expect(result.itemInformationId).toBe(createdItemInformationId);
    });

    test('Should update item location', async () => {
        // update item location
        const testDataUpdated2 = testDataUpdated;
        testDataUpdated2.unshift(subCommand);
        const addDataRes: any = await rpc(method, testDataUpdated2);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(200);
        const result: any = addDataRes.getBody()['result'];
        expect(result.region).toBe(testDataUpdated2[2]);
        expect(result.address).toBe(testDataUpdated2[3]);
        expect(result.itemInformationId).toBe(createdItemInformationId);
        expect(result.LocationMarker.markerTitle).toBe(testDataUpdated2[4]);
        expect(result.LocationMarker.markerText).toBe(testDataUpdated2[5]);
        expect(result.LocationMarker.lat).toBe(testDataUpdated2[6]);
        expect(result.LocationMarker.lng).toBe(testDataUpdated2[7]);
    });

    test('Should fail because we want to update without reason', async () => {
        const addDataRes: any = await rpc(method, [subCommand, createdTemplateId]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(404);
        expect(addDataRes.error.error.success).toBe(false);
        expect(addDataRes.error.error.message).toBe('Country code can\'t be blank.');
    });

    test('Should fail because we want to update without address not valid', async () => {
        const addDataRes: any = await rpc(method, [subCommand, createdTemplateId, 'USA']);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(404);
        expect(addDataRes.error.error.success).toBe(false);
        expect(addDataRes.error.error.message).toBe('Entity with identifier Country code <USA> was not valid! does not exist');
    });

    // ItemLocation cannot be updated if there's a ListingItem related to ItemInformations ItemLocation. (the item has allready been posted)
    test('Should not update item location because item information is related with listing item', async () => {
        // generate listing item
        const listingItems = await testUtil.generateData(
            CreatableModel.LISTINGITEM, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemParams   // what kind of data to generate
        ) as ListingItem[];

        const listingItemId = listingItems[0]['id'];
        // set listing item id in item information
        testDataListingItemTemplate.itemInformation.listingItemId = listingItemId;

        // set hash
        testDataListingItemTemplate.hash = ObjectHash.getHash(testDataListingItemTemplate, HashableObjectType.LISTINGITEMTEMPLATE);

        // create new item template
        const newListingItemTemplate = await testUtil.addData(CreatableModel.LISTINGITEMTEMPLATE, testDataListingItemTemplate);
        const newTemplateId = newListingItemTemplate.id;

        // update item location
        const addDataRes: any = await rpc(method, [subCommand, newTemplateId, 'China', 'TEST ADDRESS', 'TEST TITLE', 'TEST DESC', 55.6, 60.8]);

        addDataRes.expectJson();
        addDataRes.expectStatusCode(404);
        expect(addDataRes.error.error.success).toBe(false);
        expect(addDataRes.error.error.message).toBe('ItemLocation cannot be updated because the item has allready been posted!');
    });

});
