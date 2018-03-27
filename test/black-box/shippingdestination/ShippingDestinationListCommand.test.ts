import { rpc, api } from '../lib/api';
import { ShippingAvailability } from '../../../src/api/enums/ShippingAvailability';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { ListingItemTemplateCreateRequest } from '../../../src/api/requests/ListingItemTemplateCreateRequest';
import { PaymentType } from '../../../src/api/enums/PaymentType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { ShippingCountries } from '../../../src/core/helpers/ShippingCountries';
import {GenerateListingItemTemplateParams} from '../../../src/api/requests/params/GenerateListingItemTemplateParams';
import {ListingItemTemplate} from '../../../src/api/models/ListingItemTemplate';
import {GenerateListingItemParams} from '../../../src/api/requests/params/GenerateListingItemParams';
import {ListingItem} from '../../../src/api/models/ListingItem';

describe('ShippingDestinationListCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const method = Commands.SHIPPINGDESTINATION_ROOT.commandName;
    const subCommand = Commands.SHIPPINGDESTINATION_LIST.commandName;

    let createdListingItemTemplateId;
    let createdListingItemId;

    beforeAll(async () => {
        await testUtil.cleanDb();

        // create template without shipping destinations and store its id for testing
        const listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE,                 // what to generate
            1,                                          // how many to generate
            true,                                   // return model
            new GenerateListingItemParams().toParamsArray()     // all true -> generate everything
        ) as ListingItemTemplate[];
        createdListingItemTemplateId = listingItemTemplates[0].id;

        // create listing item with shipping destinations (1-5) and store its id for testing
        const listingItems = await testUtil.generateData(
            CreatableModel.LISTINGITEM,                         // generate listing item
            1,                                          // just one
            true,                                    // return model
            new GenerateListingItemParams().toParamsArray()     // all true -> generate everything
        ) as ListingItem[];
        createdListingItemId = listingItems[0].id;
    });

    test('Should list shipping destinations for template', async () => {
        const response: any = await rpc(method, [subCommand, 'template', createdListingItemTemplateId]);
        response.expectJson();
        response.expectStatusCode(200);
        const result: any = response.getBody()['result'];
        expect(result.length).toBeGreaterThan(0);
    });

    test('Should list shipping destinations for item', async () => {
        const response: any = await rpc(method, [subCommand, 'item', createdListingItemId]);
        response.expectJson();
        response.expectStatusCode(200);
        const result: any = response.getBody()['result'];
        expect(result.length).toBeGreaterThan(0);
    });

    test('Should fail to list shipping destination for unexisting template', async () => {
        const response: any = await rpc(method, [subCommand, 'template', createdListingItemTemplateId + 1000]);

        response.expectJson();
        response.expectStatusCode(404);
    });

    test('Should fail to list shipping destination for unexisting item', async () => {
        const response: any = await rpc(method, [subCommand, 'item', createdListingItemId + 1000]);

        response.expectJson();
        response.expectStatusCode(404);
    });

});



