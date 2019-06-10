// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { ShippingAvailability } from '../../../src/api/enums/ShippingAvailability';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { ShippingCountries } from '../../../src/core/helpers/ShippingCountries';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { ListingItemTemplate } from '../../../src/api/models/ListingItemTemplate';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { ModelNotModifiableException } from '../../../src/api/exceptions/ModelNotModifiableException';

describe('ShippingDestinationAddCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const shippingDestinationCommand = Commands.SHIPPINGDESTINATION_ROOT.commandName;
    const shippingDestinationAddCommand = Commands.SHIPPINGDESTINATION_ADD.commandName;
    const templateCommand = Commands.TEMPLATE_ROOT.commandName;
    const templatePostCommand = Commands.TEMPLATE_POST.commandName;

    const shippingCountry = 'South Africa';
    const invalidShippingCountry = 'INVALID-COUNTRY-NAME-OR-CODE';
    const invalidShippingAvailability = 'INVALID-SHIPPING-AVAILABILITY';

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;

    let listingItemTemplate: resources.ListingItemTemplate;
    let shippingDestination: resources.ShippingDestination;

    beforeAll(async () => {
        await testUtil.cleanDb();

        // get default profile and market
        defaultProfile = await testUtil.getDefaultProfile();
        defaultMarket = await testUtil.getDefaultMarket();

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            false,  // generateShippingDestinations
            false,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            false,  // generateListingItemObjects
            false,  // generateObjectDatas
            defaultProfile.id, // profileId
            false,  // generateListingItem
            defaultMarket.id   // marketId
        ]).toParamsArray();

        // create template without shipping destinations and store its id for testing
        const listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE,     // what to generate
            1,                              // how many to generate
            true,                        // return model
            generateListingItemTemplateParams       // what kind of data to generate
        ) as ListingItemTemplate[];
        listingItemTemplate = listingItemTemplates[0];
    });

    test('Should add ShippingDestination converting country name to code in the process', async () => {
        const res: any = await testUtil.rpc(shippingDestinationCommand, [shippingDestinationAddCommand,
            listingItemTemplate.id,
            shippingCountry,
            ShippingAvailability.SHIPS
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.ShippingDestination = res.getBody()['result'];
        shippingDestination = result;
        expect(result.country).toBe(ShippingCountries.getCountryCode(shippingCountry));
        expect(result.shippingAvailability).toBe(ShippingAvailability.SHIPS);
        expect(result.ItemInformation.id).toBe(listingItemTemplate.ItemInformation.id);
    });

    test('Should fail adding ShippingDestination again for the same country and shippingAvailability', async () => {
        const res: any = await testUtil.rpc(shippingDestinationCommand, [shippingDestinationAddCommand,
            listingItemTemplate.id,
            shippingCountry,
            ShippingAvailability.SHIPS
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('Shipping destination already exists.');
    });

    test('Should fail to add ShippingDestination for invalid country', async () => {
        const res: any = await testUtil.rpc(shippingDestinationCommand, [shippingDestinationAddCommand,
            listingItemTemplate.id,
            invalidShippingCountry,
            ShippingAvailability.SHIPS
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(`Country code ` + invalidShippingCountry + ` was not found!`);
    });

    test('Should fail to add ShippingDestination because invalid listingitemTemplateId', async () => {
        const res: any = await testUtil.rpc(shippingDestinationCommand, [shippingDestinationAddCommand,
            'INVALID',
            shippingCountry,
            ShippingAvailability.SHIPS
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('listingItemTemplateId', 'number').getMessage());
    });

    test('Should fail to add ShippingDestination because invalid shippingAvailability', async () => {
        const res: any = await testUtil.rpc(shippingDestinationCommand, [shippingDestinationAddCommand,
            listingItemTemplate.id,
            shippingCountry,
            invalidShippingAvailability
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('Shipping Availability <' + invalidShippingAvailability + '> was not valid!');
    });

    test('Should not add the ShippingDestination because the ListingItemTemplate has been published', async () => {

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            true,   // generateShippingDestinations
            false,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            false,    // generateListingItemObjects
            false,
            null,
            true,
            defaultMarket.id
        ]).toParamsArray();

        // generate listingItemTemplate
        const listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplates[];
        listingItemTemplate = listingItemTemplates[0];

        // post template
        const daysRetention = 4;
        let res = await testUtil.rpc(templateCommand, [templatePostCommand,
            listingItemTemplates[0].id,
            daysRetention,
            defaultMarket.id
        ]);
        res.expectJson();

        // make sure we got the expected result from posting the template
        const result: any = res.getBody()['result'];
        log.debug('result:', JSON.stringify(result, null, 2));
        const sent = result.result === 'Sent.';
        if (!sent) {
            log.debug(JSON.stringify(result, null, 2));
        }
        expect(result.result).toBe('Sent.');

        res = await testUtil.rpc(shippingDestinationCommand, [shippingDestinationAddCommand,
            listingItemTemplate.id,
            shippingCountry,
            ShippingAvailability.SHIPS
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new ModelNotModifiableException('ListingItemTemplate').getMessage());
    });

});



