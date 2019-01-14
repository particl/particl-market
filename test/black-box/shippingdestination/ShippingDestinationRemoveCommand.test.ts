// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { ShippingAvailability } from '../../../src/api/enums/ShippingAvailability';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/params/GenerateListingItemTemplateParams';
import * as countryList from 'iso3166-2-db/countryList/en.json';
import { Logger as LoggerType } from '../../../src/core/Logger';
import * as resources from 'resources';

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

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const shippingDestinationCommand = Commands.SHIPPINGDESTINATION_ROOT.commandName;
    const shippingDestinationRemoveCommand = Commands.SHIPPINGDESTINATION_REMOVE.commandName;
    const shippingDestinationAddCommand = Commands.SHIPPINGDESTINATION_ADD.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;
    let listingItemTemplate: resources.ListingItemTemplate;
    let listingItemTemplateWithListingItem: resources.ListingItemTemplate;
    let createdShippingDestination: resources.ShippingDestination;

    beforeAll(async () => {
        await testUtil.cleanDb();

        // get default profile and market
        defaultProfile = await testUtil.getDefaultProfile();
        defaultMarket = await testUtil.getDefaultMarket();

        let generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,               // generateItemInformation
            true,               // generateItemLocation
            false,              // generateShippingDestinations
            false,              // generateItemImages
            true,               // generatePaymentInformation
            true,               // generateEscrow
            true,               // generateItemPrice
            true,               // generateMessagingInformation
            true,               // generateListingItemObjects
            true,               // generateObjectDatas
            defaultProfile.id,  // profileId
            false,              // generateListingItem
            defaultMarket.id,   // marketId
            null                // categoryId
        ]).toParamsArray();

        // create template without shipping destinations and listingitems
        let listingItemTemplates: resources.ListingItemTemplate[] = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE,     // what to generate
            1,                              // how many to generate
            true,                        // return model
            generateListingItemTemplateParams       // what kind of data to generate
        ) as resources.ListingItemTemplate[];
        listingItemTemplate = listingItemTemplates[0];

        // create one shipping destination for the previously generated template
        // we are shipping to south africa
        const res: any = await testUtil.rpc(shippingDestinationCommand, [shippingDestinationAddCommand,
            listingItemTemplate.id,
            countryList.ZA.iso,
            ShippingAvailability.SHIPS
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        createdShippingDestination = res.getBody()['result'];

        generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,               // generateItemInformation
            true,               // generateItemLocation
            true,               // generateShippingDestinations
            false,              // generateItemImages
            true,               // generatePaymentInformation
            true,               // generateEscrow
            true,               // generateItemPrice
            true,               // generateMessagingInformation
            true,               // generateListingItemObjects
            true,               // generateObjectDatas
            defaultProfile.id,  // profileId
            true,               // generateListingItem
            defaultMarket.id,   // marketId
            null                // categoryId
        ]).toParamsArray();

        // create template with shipping destinations listingitem
        listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE,     // what to generate
            1,                              // how many to generate
            true,                        // return model
            generateListingItemTemplateParams       // what kind of data to generate
        ) as resources.ListingItemTemplate[];
        listingItemTemplateWithListingItem = listingItemTemplates[0];

    });

    test('Should fail to remove ShippingDestination using invalid country', async () => {
        const res: any = await testUtil.rpc(shippingDestinationCommand, [shippingDestinationRemoveCommand,
            listingItemTemplate.id,
            'invalid-country-code'
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(`Country code INVALID-COUNTRY-CODE was not found!`);
    });

    test('Should fail to remove ShippingDestination using invalid itemTemplateId', async () => {
        const invalidTemplateId = 0;
        const res: any = await testUtil.rpc(shippingDestinationCommand, [shippingDestinationRemoveCommand,
            invalidTemplateId,
            countryList.ZA.iso
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('Entity with identifier 0 does not exist');
    });

    test('Should remove ShippingDestination from ListingItemTemplate', async () => {
        const res: any = await testUtil.rpc(shippingDestinationCommand, [shippingDestinationRemoveCommand,
            listingItemTemplate.id,
            countryList.ZA.iso
        ]);
        res.expectJson();
        res.expectStatusCode(200);
    });

    test('Should fail to remove ShippingDestination from ListingItemTemplate because it already removed', async () => {
        const res: any = await testUtil.rpc(shippingDestinationCommand, [shippingDestinationRemoveCommand,
            listingItemTemplate.id,
            countryList.ZA.iso
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('ShippingDestination not found.');
    });

    test('Should fail to remove ShippingDestination because ListingItem exists', async () => {
        const res: any = await testUtil.rpc(shippingDestinationCommand, [shippingDestinationRemoveCommand,
            listingItemTemplateWithListingItem.id,
            listingItemTemplateWithListingItem.ListingItems[0].ItemInformation.ShippingDestinations[0].country
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('Can\'t delete ShippingDestination, because the ListingItemTemplate has allready been posted!');
    });

});



