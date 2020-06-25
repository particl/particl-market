// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { ModelNotModifiableException } from '../../../src/api/exceptions/ModelNotModifiableException';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';

describe('ItemLocationUpdateCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const itemLocationCommand = Commands.ITEMLOCATION_ROOT.commandName;
    const itemLocationUpdateCommand = Commands.ITEMLOCATION_UPDATE.commandName;

    let listingItemTemplate: resources.ListingItemTemplate;
    let profile: resources.Profile;
    let market: resources.Market;

    beforeAll(async () => {
        await testUtil.cleanDb();

        // get default profile and market
        profile = await testUtil.getDefaultProfile();
        market = await testUtil.getDefaultMarket(profile.id);

        // create ListingItemTemplate
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,           // generateItemInformation
            true,           // generateItemLocation
            true,           // generateShippingDestinations
            false,          // generateItemImages
            true,           // generatePaymentInformation
            true,           // generateEscrow
            true,           // generateItemPrice
            true,           // generateMessagingInformation
            false,          // generateListingItemObjects
            false,          // generateObjectDatas
            profile.id,     // profileId
            false,          // generateListingItem
            market.id       // soldOnMarketId
        ]).toParamsArray();

        const listingItemTemplates: resources.ListingItemTemplate[] = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE,
            1,
            true,
            generateListingItemTemplateParams
        );
        listingItemTemplate = listingItemTemplates[0];

    });

    test('Should fail because missing listingItemTemplateId', async () => {
        const res = await testUtil.rpc(itemLocationCommand, [itemLocationUpdateCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('listingItemTemplateId').getMessage());
    });

    test('Should fail because missing country', async () => {
        const res = await testUtil.rpc(itemLocationCommand, [itemLocationUpdateCommand,
            listingItemTemplate.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('country').getMessage());
    });

    test('Should fail because invalid listingItemTemplateId', async () => {

        const res = await testUtil.rpc(itemLocationCommand, [itemLocationUpdateCommand,
            false,                      // listingItemTemplateId
            'FI',                       // country (country/countryCode)
            'Helsinki address',         // address, optional
            'marker title',             // gpsMarkerTitle, optional
            'marker description',       // gpsMarkerDescription, optional
            11.11,                      // gpsMarkerLatitude, optional
            22.22                       // gpsMarkerLongitude, optional
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('listingItemTemplateId', 'number').getMessage());
    });

    test('Should fail because invalid country', async () => {

        const res = await testUtil.rpc(itemLocationCommand, [itemLocationUpdateCommand,
            listingItemTemplate.id,     // listingItemTemplateId
            false,                      // country (country/countryCode)
            'Helsinki address',         // address, optional
            'marker title',             // gpsMarkerTitle, optional
            'marker description',       // gpsMarkerDescription, optional
            11.11,                      // gpsMarkerLatitude, optional
            22.22                       // gpsMarkerLongitude, optional
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('country', 'string').getMessage());
    });

    test('Should fail because invalid address', async () => {

        const res = await testUtil.rpc(itemLocationCommand, [itemLocationUpdateCommand,
            listingItemTemplate.id,     // listingItemTemplateId
            'FI',                       // country (country/countryCode)
            false,                      // address, optional
            'marker title',             // gpsMarkerTitle, optional
            'marker description',       // gpsMarkerDescription, optional
            11.11,                      // gpsMarkerLatitude, optional
            22.22                       // gpsMarkerLongitude, optional
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('address', 'string').getMessage());
    });

    test('Should fail because invalid gpsMarkerTitle', async () => {

        const res = await testUtil.rpc(itemLocationCommand, [itemLocationUpdateCommand,
            listingItemTemplate.id,     // listingItemTemplateId
            'FI',                       // country (country/countryCode)
            'Helsinki address',         // address, optional
            false,                      // gpsMarkerTitle, optional
            'marker description',       // gpsMarkerDescription, optional
            11.11,                      // gpsMarkerLatitude, optional
            22.22                       // gpsMarkerLongitude, optional
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('gpsMarkerTitle', 'string').getMessage());
    });

    test('Should fail because invalid gpsMarkerDescription', async () => {

        const res = await testUtil.rpc(itemLocationCommand, [itemLocationUpdateCommand,
            listingItemTemplate.id,     // listingItemTemplateId
            'FI',                       // country (country/countryCode)
            'Helsinki address',         // address, optional
            'marker title',             // gpsMarkerTitle, optional
            false,                      // gpsMarkerDescription, optional
            11.11,                      // gpsMarkerLatitude, optional
            22.22                       // gpsMarkerLongitude, optional
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('gpsMarkerDescription', 'string').getMessage());
    });

    test('Should fail because invalid gpsMarkerLatitude', async () => {

        const res = await testUtil.rpc(itemLocationCommand, [itemLocationUpdateCommand,
            listingItemTemplate.id,     // listingItemTemplateId
            'FI',                       // country (country/countryCode)
            'Helsinki address',         // address, optional
            'marker title',             // gpsMarkerTitle, optional
            'marker description',       // gpsMarkerDescription, optional
            false,                      // gpsMarkerLatitude, optional
            22.22                       // gpsMarkerLongitude, optional
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('gpsMarkerLatitude', 'number').getMessage());
    });

    test('Should fail because invalid gpsMarkerLongitude', async () => {

        const res = await testUtil.rpc(itemLocationCommand, [itemLocationUpdateCommand,
            listingItemTemplate.id,     // listingItemTemplateId
            'FI',                       // country (country/countryCode)
            'Helsinki address',         // address, optional
            'marker title',             // gpsMarkerTitle, optional
            'marker description',       // gpsMarkerDescription, optional
            11.11,                      // gpsMarkerLatitude, optional
            false                       // gpsMarkerLongitude, optional
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('gpsMarkerLongitude', 'number').getMessage());
    });

    test('Should update ItemLocation with country', async () => {

        const country = 'FI';

        const res: any = await testUtil.rpc(itemLocationCommand, [itemLocationUpdateCommand,
            listingItemTemplate.id,
            country
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.country).toBe(country);
    });

    test('Should update ItemLocation with country and address', async () => {

        const country = 'FI';
        const address = 'Helsinki address';

        const res: any = await testUtil.rpc(itemLocationCommand, [itemLocationUpdateCommand,
            listingItemTemplate.id,
            country,
            address
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.country).toBe(country);
        expect(result.address).toBe(address);
    });

    test('Should update ItemLocation with LocationMarker fields', async () => {

        const country = 'FI';
        const address = 'Helsinki address';
        const marketTitle = 'Marker title';
        const marketDescription = 'Marker desc';
        const latitude = 25.7;
        const longitude = 22.77;

        const res: any = await testUtil.rpc(itemLocationCommand, [itemLocationUpdateCommand,
            listingItemTemplate.id,
            country,
            address,
            marketTitle,
            marketDescription,
            latitude,
            longitude
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.country).toBe(country);
        expect(result.address).toBe(address);
        expect(result.LocationMarker.title).toBe(marketTitle);
        expect(result.LocationMarker.description).toBe(marketDescription);
        expect(result.LocationMarker.lat).toBe(latitude);
        expect(result.LocationMarker.lng).toBe(longitude);
    });

    test('Should fail to update ItemLocation because the ListingItemTemplate has been published', async () => {

        // create ListingItemTemplate with ListingItem
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,           // generateItemInformation
            true,           // generateItemLocation
            true,           // generateShippingDestinations
            false,          // generateItemImages
            true,           // generatePaymentInformation
            true,           // generateEscrow
            true,           // generateItemPrice
            true,           // generateMessagingInformation
            false,          // generateListingItemObjects
            false,          // generateObjectDatas
            profile.id,     // profileId
            true,           // generateListingItem
            market.id       // soldOnMarketId
        ]).toParamsArray();

        const listingItemTemplates: resources.ListingItemTemplate[] = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE,
            1,
            true,
            generateListingItemTemplateParams
        );
        listingItemTemplate = listingItemTemplates[0];

        const result = await testUtil.rpc(itemLocationCommand, [itemLocationUpdateCommand,
            listingItemTemplate.id,
            'FI',
            'Helsinki address',
            'Marker title', 'Marker desc', 25.7, 22.77
        ]);
        result.expectJson();
        result.expectStatusCode(400);

        expect(result.error.error.message).toBe(new ModelNotModifiableException('ListingItemTemplate').getMessage());
    });

});
