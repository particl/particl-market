import { rpc, api } from './lib/api';
import { Currency } from '../../src/api/enums/Currency';
import { CryptocurrencyAddressType } from '../../src/api/enums/CryptocurrencyAddressType';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';

describe('/updateItemLocation', () => {
    const testUtil = new BlackBoxTestUtil();
    const method = 'updateitemlocation';

    const testDataListingItemTemplate = {
        profile_id: 0,
        itemInformation: {
            title: 'Item Information with Templates',
            shortDescription: 'Item short description with Templates',
            longDescription: 'Item long description with Templates',
            listingItemId: null,
            itemCategory: {
                key: 'cat_high_luxyry_items'
            },
            itemLocation: {
                region: 'NEWYARK',
                address: 'USA'
            }
        },
        paymentInformation: {
            type: 'payment',
            itemPrice: {
                currency: Currency.PARTICL,
                basePrice: 12,
                shippingPrice: {
                    domestic: 5,
                    international: 7
                },
                address: {
                    type: CryptocurrencyAddressType.STEALTH,
                    address: 'This is temp address.'
                }
            }
        }
    };

    const testDataUpdated = ['NEWYARK', 'USA', 'TITLE', 'TEST DESCRIPTION', 25.7, 22.77];

    let createdTemplateId;

    beforeAll(async () => {
        await testUtil.cleanDb();
        // create profile
        const addProfileRes: any = await testUtil.addData('profile', { name: 'TESTING-PROFILE-NAME' });
        testDataListingItemTemplate.profile_id = addProfileRes.getBody()['result'].id;

        // create item template
        const addListingItemTempRes: any = await testUtil.addData('listingitemtemplate', testDataListingItemTemplate);
        createdTemplateId = addListingItemTempRes.getBody()['result'].id;
        testDataUpdated.unshift(createdTemplateId);

    });

    test('Should update item location', async () => {
        // update item location
        const addDataRes: any = await rpc(method, testDataUpdated);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(200);
        const result: any = addDataRes.getBody()['result'];
        expect(result.region).toBe(testDataUpdated[1]);
        expect(result.address).toBe(testDataUpdated[2]);
        expect(result.itemInformationId).toBe(testDataUpdated[0]);
        expect(result.LocationMarker.markerTitle).toBe(testDataUpdated[3]);
        expect(result.LocationMarker.markerText).toBe(testDataUpdated[4]);
        expect(result.LocationMarker.lat).toBe(testDataUpdated[5]);
        expect(result.LocationMarker.lng).toBe(testDataUpdated[6]);
    });


    test('Should update item location and set null location marker fields', async () => {
        // update item location
        const addDataRes: any = await rpc(method, [createdTemplateId, testDataUpdated[1], testDataUpdated[2]]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(200);
        const result: any = addDataRes.getBody()['result'];

        expect(result.region).toBe(testDataUpdated[1]);
        expect(result.address).toBe(testDataUpdated[2]);
        expect(result.itemInformationId).toBe(testDataUpdated[0]);
        expect(result.LocationMarker.markerTitle).toBe(null);
        expect(result.LocationMarker.markerText).toBe(null);
        expect(result.LocationMarker.lat).toBe(null);
        expect(result.LocationMarker.lng).toBe(null);

    });

    test('Should fail because we want to update without reason', async () => {
        const addDataRes: any = await rpc(method, [createdTemplateId]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(400);
        expect(addDataRes.error.error.message).toBe('Request body is not valid');
    });

    test('Should fail because we want to update without address', async () => {
        const addDataRes: any = await rpc(method, [createdTemplateId, 'USA']);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(400);
        expect(addDataRes.error.error.message).toBe('Request body is not valid');
    });

    // ItemLocation cannot be updated if there's a ListingItem related to ItemInformations ItemLocation. (the item has allready been posted)
    test('Should not update item location because item information is related with listing item', async () => {

        // set listing item id in item information
        testDataListingItemTemplate.itemInformation.listingItemId = 1;

        // create new  item template
        const newListingItemTemplate = await testUtil.addData('listingitemtemplate', testDataListingItemTemplate);
        const newTemplateId = newListingItemTemplate.getBody()['result'].id;

        // update item location
        const addDataRes: any = await rpc(method, [newTemplateId, 'NEW REASON', 'TEST ADDRESS', 'TEST TITLE', 'TEST DESC', 55.6, 60.8]);

        addDataRes.expectJson();
        addDataRes.expectStatusCode(404);
        expect(addDataRes.error.error.success).toBe(false);
        expect(addDataRes.error.error.message).toBe('ItemLocation cannot be updated because the item has allready been posted!');
    });

    // test('Should fail because we want to update without item template', async () => {
    //     // remove item tempplate id
    //     testDataUpdated.shift();

    //     const addDataRes: any = await rpc(method, testDataUpdated);
    //     addDataRes.expectJson();
    //     addDataRes.expectStatusCode(404);
    // });

});


