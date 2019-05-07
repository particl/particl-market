// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import {MissingParamException} from '../../../src/api/exceptions/MissingParamException';

describe('ItemLocationAddCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const itemLocationCommand = Commands.ITEMLOCATION_ROOT.commandName;
    const itemLocationAddCommand = Commands.ITEMLOCATION_ADD.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;
    let listingItemTemplate: resources.ListingItemTemplate;

    beforeAll(async () => {
        await testUtil.cleanDb();

        // get default profile and market
        defaultProfile = await testUtil.getDefaultProfile();
        defaultMarket = await testUtil.getDefaultMarket();

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,                   // generateItemInformation
            false,                  // generateItemLocation
            true,                   // generateShippingDestinations
            false,                  // generateItemImages
            true,                   // generatePaymentInformation
            true,                   // generateEscrow
            true,                   // generateItemPrice
            true,                   // generateMessagingInformation
            false,                  // generateListingItemObjects
            false,                  // generateObjectDatas
            defaultProfile.id,      // profileId
            false,                  // generateListingItem
            defaultMarket.id        // marketId
        ]).toParamsArray();

        // generate listingItemTemplate
        const listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplates[];
        listingItemTemplate = listingItemTemplates[0];

        expect(listingItemTemplates.length).toBe(1);

    });

    const country = 'FI';
    const address = 'Mannerheimintie, 00100 Helsinki';
    const gpsMarkerTitle = 'TITLE';
    const gpsMarkerDescription = 'DESCRIPTION';
    const gpsMarkerLatitude = 25.7;
    const gpsMarkerLongitude = 22.77;

    test('Should fail to add ItemLocation because of missing listingItemTemplateId', async () => {
        const res: any = await testUtil.rpc(itemLocationCommand, [itemLocationAddCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('listingItemTemplateId').getMessage());
    });

    test('Should fail to add ItemLocation because of missing countryCode', async () => {
        const testData = [itemLocationAddCommand,
            listingItemTemplate.id
        ];

        const res: any = await testUtil.rpc(itemLocationCommand, testData);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('country').getMessage());
    });

    test('Should fail to add ItemLocation because of missing gpsMarkerDescription', async () => {
        const testData = [itemLocationAddCommand,
            listingItemTemplate.id,
            country,
            address,
            gpsMarkerTitle
        ];

        const res: any = await testUtil.rpc(itemLocationCommand, testData);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('gpsMarkerDescription').getMessage());
    });

    test('Should fail to add ItemLocation because of missing gpsMarkerLatitude', async () => {
        const testData = [itemLocationAddCommand,
            listingItemTemplate.id,
            country,
            address,
            gpsMarkerTitle,
            gpsMarkerDescription
        ];

        const res: any = await testUtil.rpc(itemLocationCommand, testData);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('gpsMarkerLatitude').getMessage());
    });

    test('Should fail to add ItemLocation because of missing gpsMarkerLongitude', async () => {
        const testData = [itemLocationAddCommand,
            listingItemTemplate.id,
            country,
            address,
            gpsMarkerTitle,
            gpsMarkerDescription,
            gpsMarkerLatitude
        ];

        const res: any = await testUtil.rpc(itemLocationCommand, testData);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('gpsMarkerLongitude').getMessage());
    });

    // TODO: should not create because invalid params...

    // TODO: should not create because ListingItemTemplate doesnt exist
    // TODO: should not create because ItemLocation already exists

    test('Should create ItemLocation', async () => {

        const testData = [itemLocationAddCommand,
            listingItemTemplate.id,
            country,
            address,
            gpsMarkerTitle,
            gpsMarkerDescription,
            gpsMarkerLatitude,
            gpsMarkerLongitude
        ];

        const res: any = await testUtil.rpc(itemLocationCommand, testData);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        expect(result.LocationMarker).toBeDefined();
        expect(result.country).toBe(country);
        expect(result.address).toBe(address);
        expect(result.LocationMarker.title).toBe(gpsMarkerTitle);
        expect(result.LocationMarker.description).toBe(gpsMarkerDescription);
        expect(result.LocationMarker.lat).toBe(gpsMarkerLatitude);
        expect(result.LocationMarker.lng).toBe(gpsMarkerLongitude);
    });


});
