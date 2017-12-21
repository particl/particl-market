import { rpc, api } from './lib/api';
import { Country } from '../../src/api/enums/Country';
import { ShippingAvailability } from '../../src/api/enums/ShippingAvailability';
import { Currency } from '../../src/api/enums/Currency';
import { CryptocurrencyAddressType } from '../../src/api/enums/CryptocurrencyAddressType';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';

describe('/addShippingDestination', () => {
    const testUtil = new BlackBoxTestUtil();
    const method = 'addshippingdestination';

    const testDataListingItemTemplate = {
        profile_id: 0,
        itemInformation: {
            title: 'Item Information with Templates',
            shortDescription: 'Item short description with Templates',
            longDescription: 'Item long description with Templates',
            itemCategory: {
                key: 'cat_high_luxyry_items'
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
                cryptocurrencyAddress: {
                    type: CryptocurrencyAddressType.STEALTH,
                    address: 'This is temp address.'
                }
            }
        }
    };

    let createdProfileId;
    let createdTemplateId;
    let createdItemInformationId;
    let createdShippingDestinationId;

    beforeAll(async () => {
        await testUtil.cleanDb();
        // create profile
        const addProfileRes: any = await testUtil.addData('profile', { name: 'TESTING-PROFILE-NAME' });
        createdProfileId = addProfileRes.getBody()['result'].id;
        testDataListingItemTemplate.profile_id = createdProfileId;

        // create item template
        const addListingItemTempRes: any = await testUtil.addData('listingitemtemplate', testDataListingItemTemplate);
        const result: any = addListingItemTempRes.getBody()['result'];
        createdTemplateId = result.id;
        createdItemInformationId = result.ItemInformation.id;

    });

    test('Should add shipping destination', async () => {
        // add shipping destination
        const addDataRes: any = await rpc(method, [createdTemplateId, Country.SOUTH_AFRICA, ShippingAvailability.SHIPS]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(200);
        const result: any = addDataRes.getBody()['result'];
        createdShippingDestinationId = result.id;
        expect(Country.SOUTH_AFRICA).toBe(result.country);
        expect(ShippingAvailability.SHIPS).toBe(result.shippingAvailability);
        expect(Country.SOUTH_AFRICA).toBe(result.country);
        expect(createdItemInformationId).toBe(result.itemInformationId);
    });

    test('Should not add shipping destination again for the same country and shipping availability', async () => {
        // add shipping destination
        const addDataRes: any = await rpc(method, [createdTemplateId, Country.SOUTH_AFRICA, ShippingAvailability.SHIPS]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(200);
        const result: any = addDataRes.getBody()['result'];
        expect(createdShippingDestinationId).toBe(result.id);
        expect(Country.SOUTH_AFRICA).toBe(result.country);
        expect(ShippingAvailability.SHIPS).toBe(result.shippingAvailability);
        expect(Country.SOUTH_AFRICA).toBe(result.country);
        expect(createdItemInformationId).toBe(result.itemInformationId);
    });


    test('Should fail to add shipping destination for invalid country', async () => {
        // add shipping destination
        const addDataRes: any = await rpc(method, [createdTemplateId, 'IND', ShippingAvailability.SHIPS]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(404);
        expect(addDataRes.error.error.success).toBe(false);
        expect(addDataRes.error.error.message).toBe('Country or shipping availability was not valid!');
    });

    test('Should fail to add shipping destination for invalid ShippingAvailability', async () => {
        // add shipping destination
        const addDataRes: any = await rpc(method, [createdTemplateId, Country.SOUTH_AFRICA, 'TEST']);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(404);
        expect(addDataRes.error.error.success).toBe(false);
        expect(addDataRes.error.error.message).toBe('Country or shipping availability was not valid!');
    });

    test('Should fail to add shipping destination for invalid item template id', async () => {
        // add shipping destination
        const addDataRes: any = await rpc(method, [0, Country.SOUTH_AFRICA, ShippingAvailability.SHIPS]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(404);
        expect(addDataRes.error.error.success).toBe(false);
        expect(addDataRes.error.error.message).toBe('Entity with identifier 0 does not exist');
    });
});



