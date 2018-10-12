// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/params/GenerateListingItemTemplateParams';
import * as resources from 'resources';

describe('ItemLocationAddCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const itemLocationCommand = Commands.ITEMLOCATION_ROOT.commandName;
    const itemLocationAddCommand = Commands.ITEMLOCATION_ADD.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;
    let createdTemplate: resources.ListingItemTemplate;

    const countryCode = 'CN';
    const address = 'USA';
    const markerTitle = 'TITLE';
    const markerDesc = 'DESCRIPTION';
    const markerLat = 25.7;
    const markerLng = 22.77;

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
        createdTemplate = listingItemTemplates[0];

        expect(listingItemTemplates.length).toBe(1);

    });

    test('Should not create ItemLocation without country', async () => {
        const res: any = await testUtil.rpc(itemLocationCommand, [itemLocationAddCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('Missing params.');
    });

    test('Should create ItemLocation', async () => {

        const res: any = await testUtil.rpc(itemLocationCommand, [itemLocationAddCommand,
            createdTemplate.id,
            countryCode,
            address,
            markerTitle,
            markerDesc,
            markerLat,
            markerLng
        ]);
        res.expectJson();
        log.debug('result:', JSON.stringify(res, null, 2));
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        expect(result.LocationMarker).toBeDefined();
        expect(result.region).toBe(countryCode);
        expect(result.address).toBe(address);
        expect(result.LocationMarker.markerTitle).toBe(markerTitle);
        expect(result.LocationMarker.markerText).toBe(markerDesc);
        expect(result.LocationMarker.lat).toBe(markerLat);
        expect(result.LocationMarker.lng).toBe(markerLng);
    });

    test('Should create ItemLocation if ItemLocation already exist for listingItemtemplate', async () => {
        const res: any = await testUtil.rpc(itemLocationCommand, [itemLocationAddCommand,
            createdTemplate.id,
            countryCode,
            address,
            markerTitle,
            markerDesc,
            markerLat,
            markerLng
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(`ItemLocation for the listingItemTemplateId=${createdTemplate.id} already exists!`);
    });

});
