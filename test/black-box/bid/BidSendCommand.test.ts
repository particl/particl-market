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
import { SearchOrder } from '../../../src/api/enums/SearchOrder';


describe('BidSendCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtilSellerNode = new BlackBoxTestUtil(randomBoolean ? 0 : 1);
    const testUtilBuyerNode = new BlackBoxTestUtil(randomBoolean ? 1 : 0);

    const bidCommand =  Commands.BID_ROOT.commandName;
    const bidSendCommand =  Commands.BID_SEND.commandName;
    const bidSearchCommand =  Commands.BID_SEARCH.commandName;
    const itemCommand = Commands.ITEM_ROOT.commandName;
    const itemGetCommand = Commands.ITEM_GET.commandName;

    let sellerMarket: resources.Market;
    let sellerProfile: resources.Profile;
    let buyerMarket: resources.Market;
    let buyerProfile: resources.Profile;

    let listingItemTemplate: resources.ListingItemTemplate;
    let listingItem: resources.ListingItem;

    const PAGE = 0;
    const PAGE_LIMIT = 10;
    const ORDERING = SearchOrder.ASC;

    beforeAll(async () => {

        await testUtilSellerNode.cleanDb();
        await testUtilBuyerNode.cleanDb();

        // get default profile and market
        sellerMarket = await testUtilSellerNode.getDefaultMarket();
        sellerProfile = await testUtilSellerNode.getDefaultProfile();

        buyerMarket = await testUtilBuyerNode.getDefaultMarket();
        buyerProfile = await testUtilBuyerNode.getDefaultProfile();

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
            sellerMarket.id  // marketId
        ]).toParamsArray();

        const listingItemTemplates = await testUtilSellerNode.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplates[];

        listingItemTemplate = listingItemTemplates[0];
        listingItem = listingItemTemplates[0].ListingItems[0];

        // expect template is related to correct Profile and ListingItem posted to correct Market
        expect(listingItemTemplate.Profile.id).toBe(sellerProfile.id);
        expect(listingItemTemplate.ListingItems[0].Market.id).toBe(sellerMarket.id);

        // expect the item hash generated at the same time as template, matches with the templates one
        expect(listingItemTemplate.hash).toBe(listingItem.hash);

    });

    test('Should post Bid for a ListingItem using Profiles existing ShippingAddress', async () => {

        const bidSendCommandParams = [bidSendCommand,
            listingItem.hash,
            sellerProfile.id,
            sellerProfile.ShippingAddresses[0].id,
            'colour',
            'black',
            'size',
            'xl'
        ];

        const res: any = await testUtilSellerNode.rpc(bidCommand, bidSendCommandParams);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        log.debug('result', result);
        expect(result.result).toBe('Sent.');
    });
/*
    test('Should post a Bid with address from bidData without addressId', async () => {

        const bidSendCommandParams = [bidSendCommand,
            listingItem.hash,
            sellerProfile.id,
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

        const res: any = await testUtilSellerNode.rpc(bidCommand, bidSendCommandParams);
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
            sellerProfile.id,
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

        const res: any = await testUtilSellerNode.rpc(bidCommand, bidSendCommandParams);
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
            sellerProfile.ShippingAddresses[0].id,
            'colour',
            'black',
            'size',
            'xl'
        ];

        const res: any = await testUtilSellerNode.rpc(bidCommand, bidSendCommandParams);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Profile not found.');
    });

    test('Should find Bid after posting', async () => {

        await testUtilSellerNode.waitFor(5);

        const bidSearchCommandParams = [
            bidSearchCommand,
            PAGE, PAGE_LIMIT, ORDERING,
            listingItem1.hash,
            MPAction.MPA_BID,
            '*',
            sellerProfile.address
        ];

        const res: any = await testUtilSellerNode.rpc(bidCommand, bidSearchCommandParams);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        // log.debug('bid searchBy result:', JSON.stringify(result, null, 2));
        expect(result[0].ListingItem.hash).toBe(listingItem1.hash);
        expect(result[0].action).toBe(MPAction.MPA_BID);
        expect(result[0].bidder).toBe(sellerProfile.address);
    });
*/
});
