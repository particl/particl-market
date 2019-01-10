// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { ShippingAvailability } from '../../../src/api/enums/ShippingAvailability';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { ShippingCountries } from '../../../src/core/helpers/ShippingCountries';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/params/GenerateListingItemTemplateParams';
import { ListingItemTemplate } from '../../../src/api/models/ListingItemTemplate';
import { Logger as LoggerType } from '../../../src/core/Logger';
import * as resources from 'resources';

describe('ShippingDestinationAddCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const shippingDestinationCommand = Commands.SHIPPINGDESTINATION_ROOT.commandName;
    const shippingDestinationAddCommand = Commands.SHIPPINGDESTINATION_ADD.commandName;

    const shippingCountry = 'South Africa';
    const invalidShippingCountry = 'INVALID-COUNTRY-NAME-OR-CODE';
    const invalidShippingAvailability = 'INVALID-SHIPPING-AVAILABILITY';

    let createdListingItemTemplate: resources.ListingItemTemplate;
    let createdShippingDestination: resources.ShippingDestination;

    beforeAll(async () => {
        await testUtil.cleanDb();

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
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

    test('Should add ShippingDestination converting country name to code in the process', async () => {
        const res: any = await testUtil.rpc(shippingDestinationCommand, [shippingDestinationAddCommand,
            createdListingItemTemplate.id,
            shippingCountry,
            ShippingAvailability.SHIPS
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.ShippingDestination = res.getBody()['result'];
        createdShippingDestination = result;
        expect(result.country).toBe(ShippingCountries.getCountryCode(shippingCountry));
        expect(result.shippingAvailability).toBe(ShippingAvailability.SHIPS);
        expect(result.ItemInformation.id).toBe(createdListingItemTemplate.ItemInformation.id);
    });

    test('Should fail adding ShippingDestination again for the same country and shipping availability', async () => {
        const res: any = await testUtil.rpc(shippingDestinationCommand, [shippingDestinationAddCommand,
            createdListingItemTemplate.id,
            shippingCountry,
            ShippingAvailability.SHIPS
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('Shipping destination allready exists.');
    });

    test('Should fail to add ShippingDestination for invalid country', async () => {
        const res: any = await testUtil.rpc(shippingDestinationCommand, [shippingDestinationAddCommand,
            createdListingItemTemplate.id,
            invalidShippingCountry,
            ShippingAvailability.SHIPS
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(`Country code ` + invalidShippingCountry + ` was not found!`);
    });

    test('Should fail to add ShippingDestination using invalid ShippingAvailability', async () => {
        const res: any = await testUtil.rpc(shippingDestinationCommand, [shippingDestinationAddCommand,
            createdListingItemTemplate.id,
            shippingCountry,
            invalidShippingAvailability
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('Shipping Availability <' + invalidShippingAvailability + '> was not valid!');
    });

    test('Should fail to add ShippingDestination for invalid item template id', async () => {
        const res: any = await testUtil.rpc(shippingDestinationCommand, [shippingDestinationAddCommand,
            createdListingItemTemplate.id + 100,
            shippingCountry,
            ShippingAvailability.SHIPS
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('Entity with identifier ' + (createdListingItemTemplate.id + 100) + ' does not exist');
    });
});



