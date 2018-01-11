import { rpc, api } from './lib/api';
import { Country } from '../../src/api/enums/Country';
import { ShippingAvailability } from '../../src/api/enums/ShippingAvailability';
import { Currency } from '../../src/api/enums/Currency';
import { PaymentType } from '../../src/api/enums/PaymentType';
import { CryptocurrencyAddressType } from '../../src/api/enums/CryptocurrencyAddressType';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { ListingItemTemplateCreateRequest } from '../../src/api/requests/ListingItemTemplateCreateRequest';
import { ObjectHash } from '../../src/core/helpers/ObjectHash';
import { Logger } from '../../src/core/Logger';
import { ShippingDestinationRemoveCommand } from '../../src/api/commands/shippingdestination/ShippingDestinationRemoveCommand';
import { ShippingDestinationAddCommand } from '../../src/api/commands/shippingdestination/ShippingDestinationAddCommand';

describe('/ShippingDestinationRemoveCommand', () => {
    const testUtil = new BlackBoxTestUtil();
    const shippingDestinationService = null;
    const listingItemTemplateService = null;

    const method =  new ShippingDestinationRemoveCommand(shippingDestinationService, listingItemTemplateService, Logger).name;
    const addShippingMethod =  new ShippingDestinationAddCommand(shippingDestinationService, listingItemTemplateService, Logger).name;

    const testDataListingItemTemplate = {
        profile_id: 0,
        hash: '',
        paymentInformation: {
            type: PaymentType.SALE
        },
        itemInformation: {
            listingItemId: null,
            title: 'Item Information with Templates',
            shortDescription: 'Item short description with Templates',
            longDescription: 'Item long description with Templates',
            itemCategory: {
                key: 'cat_high_luxyry_items'
            }
        }
    } as ListingItemTemplateCreateRequest;

    let createdTemplateId;
    let createdlistingItemsId;
    let createdItemInformationId;
    let createdShippingDestinationId;

    beforeAll(async () => {
        await testUtil.cleanDb();
        // create profile
        const defaultProfile = await testUtil.getDefaultProfile();
        // set profile
        testDataListingItemTemplate.profile_id = defaultProfile.id;

        // set hash
        testDataListingItemTemplate.hash = ObjectHash.getHash(testDataListingItemTemplate);

        // create item template
        const addListingItemTempRes: any = await testUtil.addData('listingitemtemplate', testDataListingItemTemplate);
        const result: any = addListingItemTempRes.getBody()['result'];
        createdTemplateId = result.id;
        createdItemInformationId = result.ItemInformation.id;

        // create shipping destination
        const addDataRes: any = await rpc(addShippingMethod, [createdTemplateId, Country.SOUTH_AFRICA, ShippingAvailability.SHIPS]);

        addDataRes.expectJson();
        addDataRes.expectStatusCode(200);
        createdShippingDestinationId = addDataRes.getBody()['result'].id;

        // create listing item
        const listingItems = await testUtil.generateData('listingitem', 1);
        createdlistingItemsId = listingItems[0]['id'];
    });

    test('Should fail to remove shipping destination for invalid country', async () => {
        // remove shipping destination
        const addDataRes: any = await rpc(method, [createdTemplateId, 'IND', ShippingAvailability.SHIPS]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(404);
        expect(addDataRes.error.error.success).toBe(false);
        expect(addDataRes.error.error.message).toBe('Country or shipping availability was not valid!');
    });

    test('Should fail to remove shipping destination for invalid ShippingAvailability', async () => {
        // remove shipping destination
        const addDataRes: any = await rpc(method, [createdTemplateId, Country.SOUTH_AFRICA, 'TEST']);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(404);
        expect(addDataRes.error.error.success).toBe(false);
        expect(addDataRes.error.error.message).toBe('Country or shipping availability was not valid!');
    });

    test('Should fail to remove shipping destination for invalid item template id', async () => {
        // remove shipping destination
        const addDataRes: any = await rpc(method, [0, Country.SOUTH_AFRICA, ShippingAvailability.SHIPS]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(404);
        expect(addDataRes.error.error.success).toBe(false);
        expect(addDataRes.error.error.message).toBe('Entity with identifier 0 does not exist');
    });

    test('Should remove shipping destination', async () => {
        // remove shipping destination
        const addDataRes: any = await rpc(method, [createdTemplateId, Country.SOUTH_AFRICA, ShippingAvailability.SHIPS]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(200);

    });

    test('Should fail remove shipping destination because it already removed', async () => {
        // remove shipping destination
        const addDataRes: any = await rpc(method, [createdTemplateId, Country.SOUTH_AFRICA, ShippingAvailability.SHIPS]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(404);
    });

    test('Should fail to remove if there is a ListingItem related to ItemInformation. (the item has allready been posted)', async () => {

        // set listing item id
        testDataListingItemTemplate.itemInformation.listingItemId = createdlistingItemsId;

        // set hash in listingItemTemplate
        testDataListingItemTemplate.hash = ObjectHash.getHash(testDataListingItemTemplate);

        // create item template information with listing item id
        const addListingItemTempRes: any = await testUtil.addData('listingitemtemplate', testDataListingItemTemplate as ListingItemTemplateCreateRequest);
        const newTemplateId = addListingItemTempRes.getBody()['result'].id;

        // remove shipping destination
        const addDataRes: any = await rpc(method, [newTemplateId, Country.SOUTH_AFRICA, ShippingAvailability.SHIPS]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(404);
        expect(addDataRes.error.error.success).toBe(false);
        expect(addDataRes.error.error.message).toBe('Can\'t delete shipping destination because the item has allready been posted!');
    });

});



