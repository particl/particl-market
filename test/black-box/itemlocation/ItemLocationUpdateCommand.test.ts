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
import { ModelNotModifiableException } from '../../../src/api/exceptions/ModelNotModifiableException';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import {SaleType} from 'omp-lib/dist/interfaces/omp-enums';
import {Cryptocurrency} from 'omp-lib/dist/interfaces/crypto';
import {InvalidParamException} from '../../../src/api/exceptions/InvalidParamException';

describe('ItemLocationUpdateCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const itemLocationCommand = Commands.ITEMLOCATION_ROOT.commandName;
    const itemLocationUpdateCommand = Commands.ITEMLOCATION_UPDATE.commandName;
    const templateCommand = Commands.TEMPLATE_ROOT.commandName;
    const templatePostCommand = Commands.TEMPLATE_POST.commandName;

    let listingItemTemplate: resources.ListingItemTemplate;
    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;

    beforeAll(async () => {
        await testUtil.cleanDb();

        // get default profile and market
        defaultProfile = await testUtil.getDefaultProfile();
        defaultMarket = await testUtil.getDefaultMarket();

        // create ListingItemTemplate
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            true,   // generateShippingDestinations
            false,  // generateItemImages
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

        const listingItemTemplates: resources.ListingItemTemplate[] = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE,
            2,
            true,
            generateListingItemTemplateParams
        );
        listingItemTemplate = listingItemTemplates[0];

    });

    test('Should fail to update because missing listingItemTemplateId', async () => {
        const res = await testUtil.rpc(itemLocationCommand, [itemLocationUpdateCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('listingItemTemplateId').getMessage());
    });

    test('Should fail to update because missing country', async () => {
        const res = await testUtil.rpc(itemLocationCommand, [itemLocationUpdateCommand,
            listingItemTemplate.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('country').getMessage());
    });

    test('Should fail to update because invalid listingItemTemplateId', async () => {

        const res = await testUtil.rpc(itemLocationCommand, [itemLocationUpdateCommand,
            'INVALID',                  // listingItemTemplateId
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

    test('Should fail to update because invalid country', async () => {

        const res = await testUtil.rpc(itemLocationCommand, [itemLocationUpdateCommand,
            listingItemTemplate.id,     // listingItemTemplateId
            0,                          // country (country/countryCode)
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

    test('Should fail to update because invalid address', async () => {

        const res = await testUtil.rpc(itemLocationCommand, [itemLocationUpdateCommand,
            listingItemTemplate.id,     // listingItemTemplateId
            'FI',                       // country (country/countryCode)
            0,                          // address, optional
            'marker title',             // gpsMarkerTitle, optional
            'marker description',       // gpsMarkerDescription, optional
            11.11,                      // gpsMarkerLatitude, optional
            22.22                       // gpsMarkerLongitude, optional
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('address', 'string').getMessage());
    });

    test('Should fail to update because invalid gpsMarkerTitle', async () => {

        const res = await testUtil.rpc(itemLocationCommand, [itemLocationUpdateCommand,
            listingItemTemplate.id,     // listingItemTemplateId
            'FI',                       // country (country/countryCode)
            'Helsinki address',         // address, optional
            0,                          // gpsMarkerTitle, optional
            'marker description',       // gpsMarkerDescription, optional
            11.11,                      // gpsMarkerLatitude, optional
            22.22                       // gpsMarkerLongitude, optional
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('gpsMarkerTitle', 'string').getMessage());
    });

    test('Should fail to update because invalid gpsMarkerDescription', async () => {

        const res = await testUtil.rpc(itemLocationCommand, [itemLocationUpdateCommand,
            listingItemTemplate.id,     // listingItemTemplateId
            'FI',                       // country (country/countryCode)
            'Helsinki address',         // address, optional
            'marker title',             // gpsMarkerTitle, optional
            0,                          // gpsMarkerDescription, optional
            11.11,                      // gpsMarkerLatitude, optional
            22.22                       // gpsMarkerLongitude, optional
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('gpsMarkerDescription', 'string').getMessage());
    });

    test('Should fail to update because invalid gpsMarkerLatitude', async () => {

        const res = await testUtil.rpc(itemLocationCommand, [itemLocationUpdateCommand,
            listingItemTemplate.id,     // listingItemTemplateId
            'FI',                       // country (country/countryCode)
            'Helsinki address',         // address, optional
            'marker title',             // gpsMarkerTitle, optional
            'marker description',       // gpsMarkerDescription, optional
            'INVALID',                  // gpsMarkerLatitude, optional
            22.22                       // gpsMarkerLongitude, optional
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('gpsMarkerLatitude', 'number').getMessage());
    });

    test('Should fail to update because invalid gpsMarkerLongitude', async () => {

        const res = await testUtil.rpc(itemLocationCommand, [itemLocationUpdateCommand,
            listingItemTemplate.id,     // listingItemTemplateId
            'FI',                       // country (country/countryCode)
            'Helsinki address',         // address, optional
            'marker title',             // gpsMarkerTitle, optional
            'marker description',       // gpsMarkerDescription, optional
            11.11,                      // gpsMarkerLatitude, optional
            'INVALID'                   // gpsMarkerLongitude, optional
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('gpsMarkerLongitude', 'number').getMessage());
    });

    test('Should update ItemLocation without LocationMarker fields', async () => {

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

        // create ListingItemTemplate
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            true,   // generateShippingDestinations
            false,  // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            false,  // generateListingItemObjects
            false,  // generateObjectDatas
            defaultProfile.id, // profileId
            true,  // generateListingItem
            defaultMarket.id   // marketId
        ]).toParamsArray();

        const listingItemTemplates: resources.ListingItemTemplate[] = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE,
            2,
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
