import { rpc, api } from './lib/api';
import { ShippingAvailability } from '../../src/api/enums/ShippingAvailability';
import { Currency } from '../../src/api/enums/Currency';
import { CryptocurrencyAddressType } from '../../src/api/enums/CryptocurrencyAddressType';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { ListingItemTemplateCreateRequest } from '../../src/api/requests/ListingItemTemplateCreateRequest';
import { ObjectHash } from '../../src/core/helpers/ObjectHash';
import { PaymentType } from '../../src/api/enums/PaymentType';
import { Logger } from '../../src/core/Logger';
import { ShippingDestinationAddCommand } from '../../src/api/commands/shippingdestination/ShippingDestinationAddCommand';

describe('/ShippingDestinationAddCommand', () => {
    const testUtil = new BlackBoxTestUtil();
    const shippingDestinationService = null;
    const listingItemTemplateService = null;

    const method =  new ShippingDestinationAddCommand(shippingDestinationService, listingItemTemplateService, Logger).name;


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
                region: 'China',
                address: 'USA'
            }
        },
        paymentInformation: {
            type: PaymentType.SALE
        }
    } as ListingItemTemplateCreateRequest;

    let createdTemplateId;
    let createdItemInformationId;
    let createdShippingDestinationId;

    beforeAll(async () => {
        await testUtil.cleanDb();
        // create profile
        const defaultProfile = await testUtil.getDefaultProfile();
        const profileId = defaultProfile.id;
        testDataListingItemTemplate.profile_id = profileId;

         // set hash
        testDataListingItemTemplate.hash = ObjectHash.getHash(testDataListingItemTemplate);

        // create item template
        const addListingItemTempRes: any = await testUtil.addData('listingitemtemplate', testDataListingItemTemplate);
        const result: any = addListingItemTempRes.getBody()['result'];
        createdTemplateId = result.id;
        createdItemInformationId = result.ItemInformation.id;

    });

    test('Should add shipping destination', async () => {
        // add shipping destination
        const addDataRes: any = await rpc(method, [createdTemplateId, 'South Africa', ShippingAvailability.SHIPS]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(200);
        const result: any = addDataRes.getBody()['result'];
        createdShippingDestinationId = result.id;
        expect('South Africa').toBe(result.country);
        expect(ShippingAvailability.SHIPS).toBe(result.shippingAvailability);
        expect('South Africa').toBe(result.country);
        expect(createdItemInformationId).toBe(result.itemInformationId);
    });

    test('Should not add shipping destination again for the same country and shipping availability', async () => {
        // add shipping destination
        const addDataRes: any = await rpc(method, [createdTemplateId, 'South Africa', ShippingAvailability.SHIPS]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(200);
        const result: any = addDataRes.getBody()['result'];
        expect(createdShippingDestinationId).toBe(result.id);
        expect('South Africa').toBe(result.country);
        expect(ShippingAvailability.SHIPS).toBe(result.shippingAvailability);
        expect('South Africa').toBe(result.country);
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
        const addDataRes: any = await rpc(method, [createdTemplateId, 'South Africa', 'TEST']);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(404);
        expect(addDataRes.error.error.success).toBe(false);
        expect(addDataRes.error.error.message).toBe('Country or shipping availability was not valid!');
    });

    test('Should fail to add shipping destination for invalid item template id', async () => {
        // add shipping destination
        const addDataRes: any = await rpc(method, [0, 'South Africa', ShippingAvailability.SHIPS]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(404);
        expect(addDataRes.error.error.success).toBe(false);
        expect(addDataRes.error.error.message).toBe('Entity with identifier 0 does not exist');
    });
});



