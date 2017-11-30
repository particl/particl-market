import { rpc, api } from './lib/api';
import { Currency } from '../../src/api/enums/Currency';
import { CryptocurrencyAddressType } from '../../src/api/enums/CryptocurrencyAddressType';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';

describe('/removeItemLocation', () => {
    const testUtil = new BlackBoxTestUtil();
    const method = 'removeitemlocation';

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

    let createdTemplateId;

    beforeAll(async () => {
        await testUtil.cleanDb();
        // create profile
        const addProfileRes: any = await testUtil.addData('profile', { name: 'TESTING-PROFILE-NAME' });
        testDataListingItemTemplate.profile_id = addProfileRes.getBody()['result'].id;

        // create item template
        const addListingItemTempRes: any = await testUtil.addData('listingitemtemplate', testDataListingItemTemplate);
        createdTemplateId = addListingItemTempRes.getBody()['result'].id;

    });

    test('Should not remove item location because item information is related with listing item', async () => {

        // set listing item id in item information
        testDataListingItemTemplate.itemInformation.listingItemId = 1;

        // create new  item template
        const newListingItemTemplate = await testUtil.addData('listingitemtemplate', testDataListingItemTemplate);
        const newTemplateId = newListingItemTemplate.getBody()['result'].id;

        // remove item location
        const addDataRes: any = await rpc(method, [newTemplateId]);

        addDataRes.expectJson();
        addDataRes.expectStatusCode(200);
        const result: any = addDataRes.getBody()['result'];
        expect(result.region).toBe('NEWYARK');
        expect(result.address).toBe('USA');
    });

    test('Should remove item location', async () => {
        // remove item location
        const addDataRes: any = await rpc(method, [createdTemplateId]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(200);
        const result: any = addDataRes.getBody();
    });

    test('Should fail remove item location because item location already removed', async () => {
        // remove item location
        const addDataRes: any = await rpc(method, [createdTemplateId]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(404);
    });
});


