// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { GenerateProfileParams } from '../../../src/api/requests/testdata/GenerateProfileParams';
import { SearchOrder } from '../../../src/api/enums/SearchOrder';
import { BidDataValue } from '../../../src/api/enums/BidDataValue';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';

describe('BidSendCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const bidCommand =  Commands.BID_ROOT.commandName;
    const bidSendCommand =  Commands.BID_SEND.commandName;
    const bidSearchCommand =  Commands.BID_SEARCH.commandName;
    const itemCommand = Commands.ITEM_ROOT.commandName;
    const itemGetCommand = Commands.ITEM_GET.commandName;

    let defaultMarket: resources.Market;
    let defaultProfile: resources.Profile;
    let sellerProfile: resources.Profile;

    let listingItem1: resources.ListingItem;
    let listingItem2: resources.ListingItem;

    const PAGE = 0;
    const PAGE_LIMIT = 10;
    const ORDERING = SearchOrder.ASC;

    beforeAll(async () => {

        await testUtil.cleanDb();

        // get default profile and market
        defaultProfile = await testUtil.getDefaultProfile();
        defaultMarket = await testUtil.getDefaultMarket();

        // generate local seller profile
        const generateProfileParams = new GenerateProfileParams([true, true]).toParamsArray();
        const profiles = await testUtil.generateData(
            CreatableModel.PROFILE, // what to generate
            1,              // how many to generate
            true,        // return model
            generateProfileParams   // what kind of data to generate
        ) as resources.ListingItemTemplates[];
        sellerProfile = profiles[0];

        // generate ListingItemTemplate with ListingItem
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            true,   // generateShippingDestinations
            false,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            false,  // generateListingItemObjects
            false,  // generateObjectDatas
            sellerProfile.id, // profileId
            true,   // generateListingItem
            defaultMarket.id  // marketId
        ]).toParamsArray();
        const listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            2,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplates[];

        // expect template is related to correct profile and listingitem posted to correct market
        expect(listingItemTemplates[0].Profile.id).toBe(sellerProfile.id);
        expect(listingItemTemplates[0].ListingItems[0].marketId).toBe(defaultMarket.id);

        // expect template hash created on the server matches what we create here
        const generatedTemplateHash = ObjectHashDEPRECATED.getHash(listingItemTemplates[0], HashableObjectTypeDeprecated.LISTINGITEMTEMPLATE);
        expect(listingItemTemplates[0].hash).toBe(generatedTemplateHash);

        // expect the item hash generated at the same time as template, matches with the templates one
        expect(listingItemTemplates[0].hash).toBe(listingItemTemplates[0].ListingItems[0].hash);

        // get the listingItem
        let listingItemRes = await testUtil.rpc(itemCommand, [itemGetCommand, listingItemTemplates[0].ListingItems[0].hash]);
        listingItemRes.expectJson();
        listingItemRes.expectStatusCode(200);
        listingItem1 = listingItemRes.getBody()['result'];

        // get the second listingItem
        listingItemRes = await testUtil.rpc(itemCommand, [itemGetCommand, listingItemTemplates[1].ListingItems[0].hash]);
        listingItemRes.expectJson();
        listingItemRes.expectStatusCode(200);
        listingItem2 = listingItemRes.getBody()['result'];

    });

    test('Should post Bid for a ListingItem with addressId', async () => {

        const bidSendCommandParams = [
            bidSendCommand,
            listingItem1.hash,
            defaultProfile.id,
            defaultProfile.ShippingAddresses[0].id,
            'colour',
            'black',
            'size',
            'xl'
        ];

        const res: any = await testUtil.rpc(bidCommand, bidSendCommandParams);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        log.debug('result', result);
        expect(result.result).toBe('Sent.');
    });

    test('Should post a Bid with address from bidData without addressId', async () => {

        const bidSendCommandParams = [
            bidSendCommand,
            listingItem2.hash,
            defaultProfile.id,
            false,
            BidDataValue.SHIPPING_ADDRESS_FIRST_NAME,
            'Johnny',
            BidDataValue.SHIPPING_ADDRESS_LAST_NAME,
            'Depp',
            BidDataValue.SHIPPING_ADDRESS_ADDRESS_LINE1,
            '123 6th St',
            BidDataValue.SHIPPING_ADDRESS_ADDRESS_LINE2,
            'Melbourne, FL 32904',
            BidDataValue.SHIPPING_ADDRESS_CITY,
            'Melbourne',
            BidDataValue.SHIPPING_ADDRESS_STATE,
            'Mel State',
            BidDataValue.SHIPPING_ADDRESS_ZIP_CODE,
            'Finland',
            BidDataValue.SHIPPING_ADDRESS_COUNTRY,
            '85001'
        ];

        const res: any = await testUtil.rpc(bidCommand, bidSendCommandParams);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        log.debug('result', result);
        expect(result.result).toBe('Sent.');
    });


    test('Should not create bid with address from bidData without addressLine1', async () => {

        const bidSendCommandParams = [
            bidSendCommand,
            listingItem1.hash,
            defaultProfile.id,
            false,
            BidDataValue.SHIPPING_ADDRESS_FIRST_NAME,
            'Johnny',
            BidDataValue.SHIPPING_ADDRESS_LAST_NAME,
            'Depp',
            BidDataValue.SHIPPING_ADDRESS_ADDRESS_LINE2,
            'Melbourne, FL 32904',
            BidDataValue.SHIPPING_ADDRESS_CITY,
            'Melbourne',
            BidDataValue.SHIPPING_ADDRESS_STATE,
            'Mel State',
            BidDataValue.SHIPPING_ADDRESS_ZIP_CODE,
            'Finland',
            BidDataValue.SHIPPING_ADDRESS_COUNTRY,
            '85001'
        ];

        const res: any = await testUtil.rpc(bidCommand, bidSendCommandParams);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Missing required param: ' + BidDataValue.SHIPPING_ADDRESS_ADDRESS_LINE1);
    });

    test('Should throw exception for invalid profile', async () => {
        const invalidProfileId = 0;
        const bidSendCommandParams = [
            bidSendCommand,
            listingItem1.hash,
            invalidProfileId,
            defaultProfile.ShippingAddresses[0].id,
            'colour',
            'black',
            'size',
            'xl'
        ];

        const res: any = await testUtil.rpc(bidCommand, bidSendCommandParams);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Profile not found.');
    });

    test('Should find Bid after posting', async () => {

        await testUtil.waitFor(5);

        const bidSearchCommandParams = [
            bidSearchCommand,
            PAGE, PAGE_LIMIT, ORDERING,
            listingItem1.hash,
            MPAction.MPA_BID,
            '*',
            defaultProfile.address
        ];

        const res: any = await testUtil.rpc(bidCommand, bidSearchCommandParams);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        // log.debug('bid searchBy result:', JSON.stringify(result, null, 2));
        expect(result[0].ListingItem.hash).toBe(listingItem1.hash);
        expect(result[0].action).toBe(MPAction.MPA_BID);
        expect(result[0].bidder).toBe(defaultProfile.address);
    });

});
