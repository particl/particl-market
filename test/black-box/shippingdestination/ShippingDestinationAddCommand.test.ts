import { rpc, api } from '../lib/api';
import { ShippingAvailability } from '../../../src/api/enums/ShippingAvailability';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { ShippingCountries } from '../../../src/core/helpers/ShippingCountries';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/params/GenerateListingItemTemplateParams';
import { ListingItemTemplate } from '../../../src/api/models/ListingItemTemplate';

describe('ShippingDestinationAddCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const method = Commands.SHIPPINGDESTINATION_ROOT.commandName;
    const subCommand = Commands.SHIPPINGDESTINATION_ADD.commandName;

    const shippingCountry = 'South Africa';
    const invalidShippingCountry = 'INVALID-COUNTRY-NAME-OR-CODE';
    const invalidShippingAvailability = 'INVALID-SHIPPING-AVAILABILITY';

    let createdListingItemTemplate;
    let createdShippingDestinationId;

    beforeAll(async () => {
        await testUtil.cleanDb();

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            false,  // generateShippingDestinations
            false,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            true    // generateListingItemObjects
        ]).toParamsArray();

        // create template without shipping destinations and store its id for testing
        const listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE,     // what to generate
            1,                              // how many to generate
            true,                        // return model
            generateListingItemTemplateParams       // what kind of data to generate
        ) as ListingItemTemplate[];
        createdListingItemTemplate = listingItemTemplates[0];

    });

    test('Should add shipping destination converting country name to code in the process', async () => {
        const response: any = await rpc(method, [subCommand, createdListingItemTemplate.id, shippingCountry, ShippingAvailability.SHIPS]);
        response.expectJson();
        response.expectStatusCode(200);
        const result: any = response.getBody()['result'];
        createdShippingDestinationId = result.id;

        expect(result.country).toBe(ShippingCountries.getCountryCode(shippingCountry));
        expect(result.shippingAvailability).toBe(ShippingAvailability.SHIPS);
        expect(result.itemInformationId).toBe(createdListingItemTemplate.ItemInformation.id);
    });

    test('Should fail adding shipping destination again for the same country and shipping availability', async () => {
        const response: any = await rpc(method, [subCommand, createdListingItemTemplate.id, shippingCountry, ShippingAvailability.SHIPS]);
        response.expectJson();
        response.expectStatusCode(404);
        expect(response.error.error.success).toBe(false);
        expect(response.error.error.message).toBe('Shipping destination allready exists.');
    });

    test('Should fail to add shipping destination for invalid country', async () => {
        const response: any = await rpc(method, [subCommand, createdListingItemTemplate.id, invalidShippingCountry, ShippingAvailability.SHIPS]);
        response.expectJson();
        response.expectStatusCode(404);
        expect(response.error.error.success).toBe(false);
        expect(response.error.error.message).toBe('Entity with identifier Country code <' + invalidShippingCountry + '> was not valid! does not exist');
    });

    test('Should fail to add shipping destination using invalid ShippingAvailability', async () => {
        const response: any = await rpc(method, [subCommand, createdListingItemTemplate.id, shippingCountry, invalidShippingAvailability]);
        response.expectJson();
        response.expectStatusCode(404);
        expect(response.error.error.success).toBe(false);
        expect(response.error.error.message).toBe('Shipping Availability <' + invalidShippingAvailability + '> was not valid!');
    });

    test('Should fail to add shipping destination for invalid item template id', async () => {
        const response: any = await rpc(method, [subCommand, createdListingItemTemplate.id + 100, shippingCountry, ShippingAvailability.SHIPS]);
        response.expectJson();
        response.expectStatusCode(404);
        expect(response.error.error.success).toBe(false);
        expect(response.error.error.message).toBe('Entity with identifier ' + (createdListingItemTemplate.id + 100) + ' does not exist');
    });
});



