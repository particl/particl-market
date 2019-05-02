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

describe('ItemLocationUpdateCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const itemLocationCommand = Commands.ITEMLOCATION_ROOT.commandName;
    const itemLocationUpdateCommand = Commands.ITEMLOCATION_UPDATE.commandName;

    let listingItemTemplate: resources.ListingItemTemplate;

    beforeAll(async () => {
        await testUtil.cleanDb();

        // profile & market
        const defaultProfile: resources.Profile = await testUtil.getDefaultProfile();
        const defaultMarket: resources.Market = await testUtil.getDefaultMarket();

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

        console.log('listingItemTemplate:', listingItemTemplate);

    });

    test('Should update ItemLocation without location marker fields', async () => {

        const testData = [itemLocationUpdateCommand,
            listingItemTemplate.id,
            'FI',
            'Helsinki address'
        ];

        const res: any = await testUtil.rpc(itemLocationCommand, testData);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.country).toBe(testData[2]);
        expect(result.address).toBe(testData[3]);
    });

    test('Should update ItemLocation', async () => {
        const testData = [itemLocationUpdateCommand,
            listingItemTemplate.id,
            'FI',
            'Helsinki address',
            'Marker title', 'Marker desc', 25.7, 22.77
        ];

        const res: any = await testUtil.rpc(itemLocationCommand, testData);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.country).toBe(testData[2]);
        expect(result.address).toBe(testData[3]);
        expect(result.LocationMarker.markerTitle).toBe(testData[4]);
        expect(result.LocationMarker.markerText).toBe(testData[5]);
        expect(result.LocationMarker.lat).toBe(testData[6]);
        expect(result.LocationMarker.lng).toBe(testData[7]);
    });

    test('Should fail because we want to update without Country code', async () => {
        const testData = [itemLocationUpdateCommand,
            listingItemTemplate.id
        ];

        const res: any = await testUtil.rpc(itemLocationCommand, [itemLocationUpdateCommand, testData]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Country code can\'t be blank.');
    });

});
