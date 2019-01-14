// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { BidMessageType } from '../../../src/api/enums/BidMessageType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { GenerateBidParams } from '../../../src/api/requests/params/GenerateBidParams';
import * as resources from 'resources';
import { GenerateListingItemParams } from '../../../src/api/requests/params/GenerateListingItemParams';
import { SearchOrder } from '../../../src/api/enums/SearchOrder';

describe('BidSearchCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const bidCommand =  Commands.BID_ROOT.commandName;
    const bidSearchCommand = Commands.BID_SEARCH.commandName;

    let defaultMarket: resources.Market;
    let defaultProfile: resources.Profile;
    let listingItems: resources.ListingItem[];

    const PAGE = 0;
    const PAGE_LIMIT = 10;
    const ORDERING = SearchOrder.ASC;

    beforeAll(async () => {
        await testUtil.cleanDb();

        // get default profile and market
        defaultProfile = await testUtil.getDefaultProfile();
        defaultMarket = await testUtil.getDefaultMarket();

       // create listing item
        const generateListingItemParams = new GenerateListingItemParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            true,   // generateShippingDestinations
            false,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            false    // generateListingItemObjects
        ]).toParamsArray();

        // create listing item for testing
        listingItems = await testUtil.generateData(
            CreatableModel.LISTINGITEM,     // what to generate
            1,                      // how many to generate
            true,                // return model
            generateListingItemParams           // what kind of data to generate
        );

    });

    test('Should return empty result because Bids do not exist for the given ListingItem', async () => {
        const res: any = await testUtil.rpc(bidCommand, [bidSearchCommand,
            PAGE, PAGE_LIMIT, ORDERING,
            listingItems[0].hash
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.length).toBe(0);
    });

    test('Should fail to search for Bids because invalid ListingItem.hash', async () => {
        // search bid by item hash
        const res: any = await testUtil.rpc(bidCommand, [bidSearchCommand,
            PAGE, PAGE_LIMIT, ORDERING,
            'INVALID HASH'
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('Entity with identifier INVALID HASH does not exist');
    });

    test('Should fail to search for Bids because invalid paging params', async () => {
        // search bid by item hash
        const res: any = await testUtil.rpc(bidCommand, [bidSearchCommand, 'invalid page']);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('parameter page should be a number.');
    });

    test('Should generate a Bid and return one Bid when searched by ListingItem.hash', async () => {

        const bidGenerateParams = new GenerateBidParams([
            false,                       // generateListingItemTemplate
            false,                       // generateListingItem
            listingItems[0].hash,       // listingItem.hash
            BidMessageType.MPA_BID,     // action
            defaultProfile.address      // bidder
        ]).toParamsArray();

        // generate bid
        const bids: any = await testUtil.generateData(
            CreatableModel.BID,
            1,
            true,
            bidGenerateParams);

        // log.debug('bids: ', JSON.stringify(bids, null, 2));

        // search bid by item hash
        const res: any = await testUtil.rpc(bidCommand, [bidSearchCommand, PAGE, PAGE_LIMIT, ORDERING, bids[0].ListingItem.hash]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(1);
        expect(result[0].action).toBe(BidMessageType.MPA_BID);

    });

    test('Should generate a second Bid and return two Bids when search by ListingItem.hash', async () => {
        // create second bid
        const bidGenerateParams = new GenerateBidParams([
            false,                       // generateListingItemTemplate
            false,                       // generateListingItem
            listingItems[0].hash,       // listingItemhash
            BidMessageType.MPA_ACCEPT,  // action
            defaultProfile.address      // bidder
        ]).toParamsArray();

        // generate bid
        const bids: any = await testUtil.generateData(
            CreatableModel.BID,
            1,
            true,
            bidGenerateParams);

        const res: any = await testUtil.rpc(bidCommand, [bidSearchCommand,
            PAGE, PAGE_LIMIT, ORDERING,
            listingItems[0].hash
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.length).toBe(2);
        expect(result[0].action).toBe(BidMessageType.MPA_BID);
        expect(result[0].ListingItem.hash).toBe(listingItems[0].hash);
    });

    test('Should return all two Bids when searching without any params', async () => {
        const res: any = await testUtil.rpc(bidCommand, [bidSearchCommand]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.length).toBe(2);
        expect(result[0].action).toBe(BidMessageType.MPA_ACCEPT);
        expect(result[0].ListingItem.hash).toBe(listingItems[0].hash);
        expect(result[1].action).toBe(BidMessageType.MPA_BID);
        expect(result[1].ListingItem.hash).toBe(listingItems[0].hash);
    });

    // TODO: add test where bids are searched using bid.OrderItems status
    test('Should search Bids by ListingItem.hash and Bid.status and find one', async () => {
        const res: any = await testUtil.rpc(bidCommand, [bidSearchCommand,
            PAGE, PAGE_LIMIT, ORDERING,
            listingItems[0].hash,
            BidMessageType.MPA_BID
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].action).toBe(BidMessageType.MPA_BID);
        expect(result[0].ListingItem.hash).toBe(listingItems[0].hash);
    });

    test('Should search Bids by ListingItem.hash, Bid.status and Bid.bidder and find one', async () => {
        const bidSearchCommandParams = [
            bidSearchCommand,
            PAGE, PAGE_LIMIT, ORDERING,
            listingItems[0].hash,
            BidMessageType.MPA_BID,
            '*',
            defaultProfile.address
        ];

        const res: any = await testUtil.rpc(bidCommand, bidSearchCommandParams);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].action).toBe(BidMessageType.MPA_BID);
        expect(result[0].ListingItem.hash).toBe(listingItems[0].hash);
    });

    test('Should fail to search Bids because invalid BidMessageType enum', async () => {
        // search bid by item hash
        const res: any = await testUtil.rpc(bidCommand, [bidSearchCommand,
            PAGE, PAGE_LIMIT, ORDERING,
            listingItems[0].hash,
            'INVALID STATUS'
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('Invalid status.');
    });

    test('Should return empty search result because Bid with status MPA_REJECT does not exist', async () => {
        // search bid by item hash
        const res: any = await testUtil.rpc(bidCommand, [bidSearchCommand,
            PAGE, PAGE_LIMIT, ORDERING,
            listingItems[0].hash,
            BidMessageType.MPA_REJECT
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.length).toBe(0);
    });


    // TODO: missing tests for OrderStatus
    // TODO: missing tests for searching using searchString
    // TODO: missing tests for searching using bidder
    // TODO: missing tests for searching using multiple bidders

});
