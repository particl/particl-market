// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import * as countryList from 'iso3166-2-db/countryList/en.json';
import { ShippingAvailability } from '../../../src/api/enums/ShippingAvailability';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { ModelNotModifiableException } from '../../../src/api/exceptions/ModelNotModifiableException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import {MissingParamException} from '../../../src/api/exceptions/MissingParamException';
import {CountryCodeNotFoundException} from '../../../src/api/exceptions/CountryCodeNotFoundException';

describe('ShippingDestinationRemoveCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const shippingDestinationCommand = Commands.SHIPPINGDESTINATION_ROOT.commandName;
    const shippingDestinationRemoveCommand = Commands.SHIPPINGDESTINATION_REMOVE.commandName;
    const shippingDestinationAddCommand = Commands.SHIPPINGDESTINATION_ADD.commandName;

    let profile: resources.Profile;
    let market: resources.Market;

    let listingItemTemplate: resources.ListingItemTemplate;
    let listingItemTemplateWithListingItem: resources.ListingItemTemplate;
    let createdShippingDestination: resources.ShippingDestination;

    beforeAll(async () => {
        await testUtil.cleanDb();

        profile = await testUtil.getDefaultProfile();
        expect(profile.id).toBeDefined();
        market = await testUtil.getDefaultMarket(profile.id);
        expect(market.id).toBeDefined();

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
            profile.id,         // profileId
            false,              // generateListingItem
            market.id,          // marketId
            null                // categoryId
        ]).toParamsArray();

        // create ListingItemTemplate without ShippingDestinations and ListingItems
        let listingItemTemplates: resources.ListingItemTemplate[] = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE,     // what to generate
            1,                              // how many to generate
            true,                        // return model
            generateListingItemTemplateParams       // what kind of data to generate
        ) as resources.ListingItemTemplate[];
        listingItemTemplate = listingItemTemplates[0];

        // create one ShippingDestination for the previously generated ListingItemTemplate
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
            profile.id,         // profileId
            true,               // generateListingItem
            market.id,          // marketId
            null                // categoryId
        ]).toParamsArray();

        // create ListingItemTemplate with ShippingDestinations and ListingItem
        listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE,     // what to generate
            1,                              // how many to generate
            true,                        // return model
            generateListingItemTemplateParams       // what kind of data to generate
        ) as resources.ListingItemTemplate[];
        listingItemTemplateWithListingItem = listingItemTemplates[0];

    });

    test('Should fail because missing listingItemTemplateId', async () => {
        const res: any = await testUtil.rpc(shippingDestinationCommand, [shippingDestinationAddCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('listingItemTemplateId').getMessage());
    });

    test('Should fail because missing country', async () => {
        const res: any = await testUtil.rpc(shippingDestinationCommand, [shippingDestinationAddCommand,
            listingItemTemplate.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('country').getMessage());
    });

    test('Should fail to remove ShippingDestination using invalid listingItemTemplateId', async () => {
        const res: any = await testUtil.rpc(shippingDestinationCommand, [shippingDestinationRemoveCommand,
            false,
            countryList.ZA.iso
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('listingItemTemplateId', 'number').getMessage());
    });

    test('Should fail to remove ShippingDestination using invalid country', async () => {
        const res: any = await testUtil.rpc(shippingDestinationCommand, [shippingDestinationRemoveCommand,
            listingItemTemplate.id,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('country', 'string').getMessage());
    });

    test('Should fail to remove ShippingDestination using country thats not found', async () => {
        const res: any = await testUtil.rpc(shippingDestinationCommand, [shippingDestinationRemoveCommand,
            listingItemTemplate.id,
            'INVALID-COUNTRY-CODE'
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new CountryCodeNotFoundException('INVALID-COUNTRY-CODE').getMessage());
    });

    test('Should remove ShippingDestination from ListingItemTemplate', async () => {
        const res: any = await testUtil.rpc(shippingDestinationCommand, [shippingDestinationRemoveCommand,
            listingItemTemplate.id,
            countryList.ZA.iso
        ]);
        res.expectJson();
        res.expectStatusCode(200);
    });

    test('Should fail to remove ShippingDestination from ListingItemTemplate because its already removed', async () => {
        const res: any = await testUtil.rpc(shippingDestinationCommand, [shippingDestinationRemoveCommand,
            listingItemTemplate.id,
            countryList.ZA.iso
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('ShippingDestination not found.');
    });

    test('Should fail to remove the ShippingDestination because the ListingItemTemplate has been published', async () => {

        const res: any = await testUtil.rpc(shippingDestinationCommand, [shippingDestinationAddCommand,
            listingItemTemplateWithListingItem.id,
            'South Africa',
            ShippingAvailability.SHIPS
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new ModelNotModifiableException('ListingItemTemplate').getMessage());
    });
});



