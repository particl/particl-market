import { rpc, api } from './lib/api';
import { ShippingAvailability } from '../../src/api/enums/ShippingAvailability';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { ListingItemTemplateCreateRequest } from '../../src/api/requests/ListingItemTemplateCreateRequest';
import { ObjectHash } from '../../src/core/helpers/ObjectHash';
import { ShippingDestinationRemoveCommand } from '../../src/api/commands/shippingdestination/ShippingDestinationRemoveCommand';
import { Commands } from '../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { GenerateListingItemTemplateParams } from '../../src/api/requests/params/GenerateListingItemTemplateParams';
import { ShippingCountries } from '../../src/core/helpers/ShippingCountries';
import * as countryList from 'iso3166-2-db/countryList/en.json';
import { JsonRpc2Response} from '../../src/core/api/jsonrpc';
import { ListingItem, ListingItemTemplate } from 'resources';
import { Logger } from '../../src/core/Logger';

/**
 * shipping destination can be removed using following params:
 * [0]: shippingDestinationId
 * or
 * [0]: listing_item_template_id
 * [1]: country/countryCode
 * [2]: shipping availability (ShippingAvailability enum)
 *
 * TODO: why do we have shipping availability there? if user wants to remove the shipping destinations availability,
 * then shouldn't templateid + country code be enough information to remove that? there's always only one availability
 * for one country, you can't ship and not_ship at the same time.
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
        createdShippingDestinationId = addShippingResult.getBody<JsonRpc2Response>().result.id;

        // create listing item with shipping destinations (1-5) and store its id for testing
        const listingItems = await testUtil.generateData(
            CreatableModel.LISTINGITEM,                             // generate listing item
            1,                                                      // just one
            true,                                                   // return model
            new GenerateListingItemTemplateParams().toParamsArray() // all true -> generate everything
        ) as ListingItem[];
        createdListingItemId = listingItems[0].id;

        // store the items first shipping destionations id for testing
        createdListingItemsShippingDestinationId = listingItems[0].ItemInformation.ShippingDestinations[0].id;

    });

    // TODO: missing tests that delete using shipping destination id

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

    test('Should fail to remove shipping destination for invalid itemtemplate id', async () => {
        const removeShippingResult: any = await rpc(method, subCommands.concat(
            [createdListingItemTemplateId + 100, countryList.ZA.iso, ShippingAvailability.SHIPS]
        ));

        removeShippingResult.expectJson();
        removeShippingResult.expectStatusCode(404);
        expect(removeShippingResult.error.error.success).toBe(false);
        expect(removeShippingResult.error.error.message).toBe('Entity with identifier ' + (createdListingItemTemplateId + 100) + ' does not exist');
    });

    test('Should remove shipping destination', async () => {
        const removeShippingResult: any = await rpc(method, subCommands.concat(
            [createdListingItemTemplateId, countryList.ZA.iso, ShippingAvailability.SHIPS]
        ));

        removeShippingResult.expectJson();
        removeShippingResult.expectStatusCode(200);
    });

    test('Should fail remove shipping destination because it already removed', async () => {
        const removeShippingResult: any = await rpc(method, subCommands.concat(
            [createdListingItemTemplateId, countryList.ZA.iso, ShippingAvailability.SHIPS]
        ));

        removeShippingResult.expectJson();
        removeShippingResult.expectStatusCode(404);
    });

    test('Should fail to remove shipping destination from listing item (listing items have allready been posted)', async () => {
        const removeShippingResult: any = await rpc(method, subCommands.concat(
            [createdListingItemsShippingDestinationId]
        ));

        removeShippingResult.expectJson();
        removeShippingResult.expectStatusCode(404);
        expect(removeShippingResult.error.error.success).toBe(false);
        expect(removeShippingResult.error.error.message).toBe('Can\'t delete shipping destination because the item has allready been posted!');
    });

});



