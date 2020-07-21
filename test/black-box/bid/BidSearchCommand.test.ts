// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { GenerateBidParams } from '../../../src/api/requests/testdata/GenerateBidParams';
import { SearchOrder } from '../../../src/api/enums/SearchOrder';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { BidSearchOrderField } from '../../../src/api/enums/SearchOrderField';

describe('BidSearchCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtilSellerNode = new BlackBoxTestUtil(randomBoolean ? 0 : 1);
    const testUtilBuyerNode = new BlackBoxTestUtil(randomBoolean ? 1 : 0);

    const bidCommand =  Commands.BID_ROOT.commandName;
    const bidSearchCommand = Commands.BID_SEARCH.commandName;

    let sellerMarket: resources.Market;
    let sellerProfile: resources.Profile;

    let buyerProfile: resources.Profile;
    let buyerMarket: resources.Market;

    let listingItem: resources.ListingItem;
    let mpaBid: resources.Bid;
    let acceptBid: resources.Bid;

    const PAGE = 0;
    const PAGE_LIMIT = 10;
    const SEARCHORDER = SearchOrder.ASC;
    const BID_SEARCHORDERFIELD = BidSearchOrderField.CREATED_AT;

    beforeAll(async () => {
        await testUtilSellerNode.cleanDb();
        await testUtilBuyerNode.cleanDb();

        // get default sellerProfile and sellerMarket
        sellerProfile = await testUtilSellerNode.getDefaultProfile();
        expect(sellerProfile.id).toBeDefined();
        sellerMarket = await testUtilSellerNode.getDefaultMarket(sellerProfile.id);
        expect(sellerMarket.id).toBeDefined();

        buyerProfile = await testUtilBuyerNode.getDefaultProfile();
        log.debug('buyerProfile: ', JSON.stringify(buyerProfile, null, 2));
        buyerMarket = await testUtilBuyerNode.getDefaultMarket(buyerProfile.id);
        expect(buyerMarket.id).toBeDefined();

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
            sellerProfile.id,     // profileId
            true,           // generateListingItem
            sellerMarket.id       // soldOnMarketId
        ]).toParamsArray();

        const listingItemTemplates: resources.ListingItemTemplate[] = await testUtilSellerNode.generateData(
            CreatableModel.LISTINGITEMTEMPLATE,
            2,
            true,
            generateListingItemTemplateParams
        );
        listingItem = listingItemTemplates[0].ListingItems[0];

        // log.debug('listingItem: ', JSON.stringify(listingItem, null, 2));

    });

    test('Should return empty result because Bids do not exist for the given ListingItem', async () => {
        const res: any = await testUtilSellerNode.rpc(bidCommand, [bidSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, BID_SEARCHORDERFIELD,
            listingItem.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.length).toBe(0);
    });

    test('Should fail to searchBy for Bids because invalid ListingItemId', async () => {
        const res: any = await testUtilSellerNode.rpc(bidCommand, [bidSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, BID_SEARCHORDERFIELD,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('listingItemId', 'number').getMessage());
    });

    test('Should generate a Bid (MPA_BID)', async () => {
        expect(listingItem).toBeDefined();
        const bidGenerateParams = new GenerateBidParams([
            false,                          // generateListingItemTemplate
            false,                          // generateListingItem
            listingItem.id,                 // listingItem.id
            MPAction.MPA_BID,               // type
            buyerMarket.Identity.address,    // bidder
            sellerMarket.Identity.address,   // seller
            undefined                       // parentBidId
        ]).toParamsArray();

        const bids: resources.Bid[] = await testUtilSellerNode.generateData(
            CreatableModel.BID,
            1,
            true,
            bidGenerateParams);
        mpaBid = bids[0];
    });

    test('Should find the generated Bid when searching by listingItemId', async () => {

        expect(mpaBid).toBeDefined();

        const res: any = await testUtilSellerNode.rpc(bidCommand, [bidSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, BID_SEARCHORDERFIELD,
            listingItem.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.Bid[] = res.getBody()['result'];

        // log.debug('result: ', JSON.stringify(result, null, 2));
        mpaBid = result[0];
        expect(result.length).toBe(1);
        expect(result[0].type).toBe(MPAction.MPA_BID);
    });

    test('Should generate accept Bid (MPA_ACCEPT)', async () => {
        expect(listingItem).toBeDefined();
        const bidGenerateParams = new GenerateBidParams([
            false,                              // generateListingItemTemplate
            false,                              // generateListingItem
            listingItem.id,                     // listingItem.id
            MPAction.MPA_ACCEPT,                // type
            buyerMarket.Identity.address,       // bidder
            sellerMarket.Identity.address,      // seller
            mpaBid.id                           // parentBidId
        ]).toParamsArray();

        const bids: resources.Bid[] = await testUtilSellerNode.generateData(
            CreatableModel.BID,
            1,
            true,
            bidGenerateParams);
        acceptBid = bids[0];
    });

    test('Should return two Bids when searching by listingItemId', async () => {

        expect(mpaBid).toBeDefined();
        expect(acceptBid).toBeDefined();

        const res: any = await testUtilSellerNode.rpc(bidCommand, [bidSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, BID_SEARCHORDERFIELD,
            listingItem.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Bid[] = res.getBody()['result'];
        expect(result.length).toBe(2);
        expect(result[0].type).toBe(MPAction.MPA_BID);
        expect(result[0].ListingItem.id).toBe(listingItem.id);
        expect(result[1].type).toBe(MPAction.MPA_ACCEPT);
        expect(result[1].ListingItem.id).toBe(listingItem.id);
    });

    test('Should fail to searchBy for Bids because invalid type', async () => {
        const res: any = await testUtilSellerNode.rpc(bidCommand, [bidSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, BID_SEARCHORDERFIELD,
            listingItem.id,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('type', 'MPAction').getMessage());
    });

    test('Should return one Bid when searching by listingItemId and type ', async () => {

        expect(mpaBid).toBeDefined();
        expect(acceptBid).toBeDefined();

        const res: any = await testUtilSellerNode.rpc(bidCommand, [bidSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, BID_SEARCHORDERFIELD,
            listingItem.id,
            MPAction.MPA_ACCEPT
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Bid[] = res.getBody()['result'];
        log.debug('result: ', JSON.stringify(result, null, 2));
        expect(result.length).toBe(1);
        expect(result[0].type).toBe(MPAction.MPA_ACCEPT);
        expect(result[0].ListingItem.id).toBe(listingItem.id);
    });

/*
    test('Should return all two Bids when searching without any params', async () => {
        const res: any = await testUtilSellerNode.rpc(bidCommand, [bidSearchCommand]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.length).toBe(2);
        expect(result[0].type).toBe(MPAction.MPA_ACCEPT);
        expect(result[0].ListingItem.hash).toBe(listingItems[0].hash);
        expect(result[1].type).toBe(MPAction.MPA_BID);
        expect(result[1].ListingItem.hash).toBe(listingItems[0].hash);
    });

    // TODO: add test where bids are searched using bid.OrderItems status
    test('Should searchBy Bids by ListingItem.hash and Bid.status and find one', async () => {
        const res: any = await testUtilSellerNode.rpc(bidCommand, [bidSearchCommand,
            PAGE, PAGE_LIMIT, ORDERING,
            listingItems[0].hash,
            MPAction.MPA_BID
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].type).toBe(MPAction.MPA_BID);
        expect(result[0].ListingItem.hash).toBe(listingItems[0].hash);
    });

    test('Should searchBy Bids by ListingItem.hash, Bid.status and Bid.bidder and find one', async () => {
        const bidSearchCommandParams = [
            bidSearchCommand,
            PAGE, PAGE_LIMIT, ORDERING,
            listingItems[0].hash,
            MPAction.MPA_BID,
            '*',
            sellerProfile.address
        ];

        const res: any = await testUtilSellerNode.rpc(bidCommand, bidSearchCommandParams);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].type).toBe(MPAction.MPA_BID);
        expect(result[0].ListingItem.hash).toBe(listingItems[0].hash);
    });

    test('Should fail to searchBy Bids because invalid MPAction enum', async () => {
        // searchBy bid by item hash
        const res: any = await testUtilSellerNode.rpc(bidCommand, [bidSearchCommand,
            PAGE, PAGE_LIMIT, ORDERING,
            listingItems[0].hash,
            'INVALID STATUS'
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('Invalid status.');
    });

    test('Should return empty searchBy result because Bid with status MPA_REJECT does not exist', async () => {
        // searchBy bid by item hash
        const res: any = await testUtilSellerNode.rpc(bidCommand, [bidSearchCommand,
            PAGE, PAGE_LIMIT, ORDERING,
            listingItems[0].hash,
            MPAction.MPA_REJECT
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.length).toBe(0);
    });


    // TODO: missing tests for OrderItemStatus
    // TODO: missing tests for searching using searchString
    // TODO: missing tests for searching using bidder
    // TODO: missing tests for searching using multiple bidders
*/
});
