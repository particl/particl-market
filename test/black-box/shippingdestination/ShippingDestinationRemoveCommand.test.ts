import { rpc, api } from '../lib/api';
import { ShippingAvailability } from '../../../src/api/enums/ShippingAvailability';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { ShippingDestinationRemoveCommand } from '../../../src/api/commands/shippingdestination/ShippingDestinationRemoveCommand';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/params/GenerateListingItemTemplateParams';
import * as countryList from 'iso3166-2-db/countryList/en.json';
import { ListingItem, ListingItemTemplate } from 'resources';
import { GenerateListingItemParams } from '../../../src/api/requests/params/GenerateListingItemParams';

/**
 * shipping destination can be removed using following params:
 * [0]: shippingDestinationId
 * or
 * [0]: listing_item_template_id
 * [1]: country/countryCode
 * [2]: shipping availability (ShippingAvailability enum)
 *
 */
describe('ShippingDestinationRemoveCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const testUtil = new BlackBoxTestUtil();
    const method = Commands.TEMPLATE_ROOT.commandName;
    const subCommands = [Commands.SHIPPINGDESTINATION_ROOT.commandName, Commands.SHIPPINGDESTINATION_REMOVE.commandName] as any[];

    let createdListingItemTemplateId;
    let createdShippingDestinationId;

    let createdListingItemId;
    let createdListingItemsShippingDestinationId;

    beforeAll(async () => {
        await testUtil.cleanDb();

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            false,  // generateShippingDestinations
            true,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            true    // generateListingItemObjects
        ]).toParamsArray();

        /// TEMPLATE
        // create template without shipping destinations and store its id for testing
        const listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                                  // how many to generate
            true,                               // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as ListingItemTemplate[];
        createdListingItemTemplateId = listingItemTemplates[0].id;

        // create one shipping destination for the previously generated template and store its id for testing,
        // we are shipping to south africa
        const addShippingSubCommands = [Commands.SHIPPINGDESTINATION_ROOT.commandName, Commands.SHIPPINGDESTINATION_ADD.commandName] as any[];
        const addShippingResult = await rpc(method, addShippingSubCommands.concat(
            [createdListingItemTemplateId, countryList.ZA.iso, ShippingAvailability.SHIPS]));
        createdShippingDestinationId = addShippingResult.getBody().result.id;

        // LISTING ITEM
        // create listing item with shipping destinations (1-5) and store its id for testing
        const listingItems = await testUtil.generateData(
            CreatableModel.LISTINGITEM,                         // generate listing item
            1,                                          // just one
            true,                                    // return model
            new GenerateListingItemParams().toParamsArray()     // all true -> generate everything
        ) as ListingItem[];
        createdListingItemId = listingItems[0].id;

        // store the items first shipping destionations id for testing
        createdListingItemsShippingDestinationId = listingItems[0].ItemInformation.ShippingDestinations[0].id;

    });

    test('Should fail to remove shipping destination using invalid country', async () => {

        const removeShippingResult: any = await rpc(method, subCommands.concat(
            [createdListingItemTemplateId, 'invalid-country-code', ShippingAvailability.SHIPS]
        ));

        removeShippingResult.expectJson();
        removeShippingResult.expectStatusCode(404);
        expect(removeShippingResult.error.error.success).toBe(false);
        // expect(removeShippingResult.error.error.message).toBe('Country or shipping availability was not valid!');
        expect(removeShippingResult.error.error.message).toBe('Entity with identifier Country code <INVALID-COUNTRY-CODE> was not valid! does not exist');
    });

    test('Should fail to remove shipping destination using invalid ShippingAvailability', async () => {
        const removeShippingResult: any = await rpc(method, subCommands.concat(
            [createdListingItemTemplateId, countryList.ZA.iso, ShippingAvailability.DOES_NOT_SHIP]
        ));

        removeShippingResult.expectJson();
        removeShippingResult.expectStatusCode(404);
        expect(removeShippingResult.error.error.success).toBe(false);
        // expect(removeShippingResult.error.error.message).toBe('Country or shipping availability was not valid!');
        expect(removeShippingResult.error.error.message).toBe('Entity with identifier ' + createdListingItemTemplateId + ' does not exist');
    });

    test('Should fail to remove shipping destination using invalid itemtemplate id', async () => {
        const removeShippingResult: any = await rpc(method, subCommands.concat(
            [createdListingItemTemplateId + 100, countryList.ZA.iso, ShippingAvailability.SHIPS]
        ));

        removeShippingResult.expectJson();
        removeShippingResult.expectStatusCode(404);
        expect(removeShippingResult.error.error.success).toBe(false);
        expect(removeShippingResult.error.error.message).toBe('Entity with identifier ' + (createdListingItemTemplateId + 100) + ' does not exist');
    });

    test('Should remove shipping destination from template', async () => {
        const removeShippingResult: any = await rpc(method, subCommands.concat(
            [createdListingItemTemplateId, countryList.ZA.iso, ShippingAvailability.SHIPS]
        ));

        removeShippingResult.expectJson();
        removeShippingResult.expectStatusCode(200);
    });

    test('Should fail to remove shipping destination from template because it already removed', async () => {
        const removeShippingResult: any = await rpc(method, subCommands.concat(
            [createdListingItemTemplateId, countryList.ZA.iso, ShippingAvailability.SHIPS]
        ));

        removeShippingResult.expectJson();
        removeShippingResult.expectStatusCode(404);
    });

    test('Should fail to remove shipping destination from listing item (listing items have allready been posted, so they cant be modified)', async () => {
        const removeShippingResult: any = await rpc(method, subCommands.concat(
            [createdListingItemsShippingDestinationId]
        ));

        removeShippingResult.expectJson();
        removeShippingResult.expectStatusCode(404);
        expect(removeShippingResult.error.error.success).toBe(false);
        expect(removeShippingResult.error.error.message).toBe('Can\'t delete shipping destination, because the item has allready been posted!');
    });

    test('Should remove shipping destination by id', async () => {

        const addShippingSubCommands = [Commands.SHIPPINGDESTINATION_ROOT.commandName, Commands.SHIPPINGDESTINATION_ADD.commandName] as any[];
        const addShippingResult = await rpc(method, addShippingSubCommands.concat(
            [createdListingItemTemplateId, countryList.ZA.iso, ShippingAvailability.SHIPS]));
        createdShippingDestinationId = addShippingResult.getBody().result.id;

        const removeShippingResult: any = await rpc(method, subCommands.concat(
            [createdShippingDestinationId]
        ));
        removeShippingResult.expectJson();
        removeShippingResult.expectStatusCode(200);
    });

});



