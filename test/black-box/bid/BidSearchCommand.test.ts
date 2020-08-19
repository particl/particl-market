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
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';

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

    let listingItemOnSellerNode: resources.ListingItem;
    let mpaBid: resources.Bid;
    let acceptBid: resources.Bid;

    const PAGE = 0;
    const PAGE_LIMIT = 10;
    const SEARCHORDER = SearchOrder.ASC;
    const BID_SEARCHORDERFIELD = BidSearchOrderField.CREATED_AT;

    beforeAll(async () => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

        await testUtilSellerNode.cleanDb();
        await testUtilBuyerNode.cleanDb();

        log.debug('SELLER IS NODE' + (randomBoolean ? 1 : 2));
        log.debug('BUYER IS NODE' + (randomBoolean ? 2 : 1));

        sellerProfile = await testUtilSellerNode.getDefaultProfile();
        buyerProfile = await testUtilBuyerNode.getDefaultProfile();
        expect(sellerProfile.id).toBeDefined();
        expect(buyerProfile.id).toBeDefined();
        // log.debug('sellerProfile: ', JSON.stringify(sellerProfile, null, 2));
        // log.debug('buyerProfile: ', JSON.stringify(buyerProfile, null, 2));

        sellerMarket = await testUtilSellerNode.getDefaultMarket(sellerProfile.id);
        buyerMarket = await testUtilBuyerNode.getDefaultMarket(buyerProfile.id);
        expect(sellerMarket.id).toBeDefined();
        expect(buyerMarket.id).toBeDefined();
        // log.debug('sellerMarket: ', JSON.stringify(sellerMarket, null, 2));
        // log.debug('buyerMarket: ', JSON.stringify(buyerMarket, null, 2));

        // create ListingItemTemplate with ListingItem
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,                   // generateItemInformation
            true,                   // generateItemLocation
            true,                   // generateShippingDestinations
            false,                  // generateItemImages
            true,                   // generatePaymentInformation
            true,                   // generateEscrow
            true,                   // generateItemPrice
            true,                   // generateMessagingInformation
            false,                  // generateListingItemObjects
            false,                  // generateObjectDatas
            sellerProfile.id,       // profileId
            true,                   // generateListingItem
            sellerMarket.id         // soldOnMarketId
        ]).toParamsArray();

        const listingItemTemplates: resources.ListingItemTemplate[] = await testUtilSellerNode.generateData(
            CreatableModel.LISTINGITEMTEMPLATE,
            1,
            true,
            generateListingItemTemplateParams
        );
        listingItemOnSellerNode = listingItemTemplates[0].ListingItems[0];

        // log.debug('listingItemOnSellerNode: ', JSON.stringify(listingItemOnSellerNode, null, 2));

    });


    test('Should fail to search because invalid ListingItemId', async () => {
        const res: any = await testUtilSellerNode.rpc(bidCommand, [bidSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, BID_SEARCHORDERFIELD,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('listingItemId', 'number').getMessage());
    });


    test('Should fail to search because ListingItem not found', async () => {
        const res: any = await testUtilSellerNode.rpc(bidCommand, [bidSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, BID_SEARCHORDERFIELD,
            0
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('ListingItem').getMessage());
    });


    test('Should return empty result because Bids do not exist for the given ListingItem', async () => {
        const res: any = await testUtilSellerNode.rpc(bidCommand, [bidSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, BID_SEARCHORDERFIELD,
            listingItemOnSellerNode.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.length).toBe(0);
    });


    test('Should generate a Bid (MPA_BID)', async () => {
        expect(listingItemOnSellerNode).toBeDefined();
        const bidGenerateParams = new GenerateBidParams([
            false,                          // generateListingItemTemplate
            false,                          // generateListingItem
            true,                           // generateOrder
            listingItemOnSellerNode.id,     // listingItemOnSellerNode.id
            MPAction.MPA_BID,               // type
            buyerMarket.Identity.address,   // bidder
            sellerMarket.Identity.address,  // seller
            undefined                       // parentBidId
        ]).toParamsArray();

        const bids: resources.Bid[] = await testUtilSellerNode.generateData(
            CreatableModel.BID,
            1,
            true,
            bidGenerateParams);
        mpaBid = bids[0];

        expect(mpaBid.type).toBe(MPAction.MPA_BID);
        expect(mpaBid.OrderItem).toBeDefined();
        expect(mpaBid.OrderItem.Order).toBeDefined();
        expect(mpaBid.ListingItem).toBeDefined();
        expect(mpaBid.ListingItem.id).toBe(listingItemOnSellerNode.id);
    });


    test('Should find the generated Bid when searching by listingItemId', async () => {

        expect(mpaBid).toBeDefined();

        const res: any = await testUtilSellerNode.rpc(bidCommand, [bidSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, BID_SEARCHORDERFIELD,
            listingItemOnSellerNode.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.Bid[] = res.getBody()['result'];

        // log.debug('result: ', JSON.stringify(result, null, 2));
        mpaBid = result[0];
        expect(result.length).toBe(1);
        expect(result[0].type).toBe(MPAction.MPA_BID);
        expect(result[0].bidder).toBe(buyerMarket.Identity.address);
        expect(result[0].ListingItem.hash).toBe(listingItemOnSellerNode.hash);
        expect(result[0].ListingItem.seller).toBe(sellerMarket.Identity.address);
    });


    test('Should generate accept Bid (MPA_ACCEPT)', async () => {
        expect(listingItemOnSellerNode).toBeDefined();
        const bidGenerateParams = new GenerateBidParams([
            false,                              // generateListingItemTemplate
            false,                              // generateListingItem
            false,                              // generateOrder
            listingItemOnSellerNode.id,         // listingItemOnSellerNode.id
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
            listingItemOnSellerNode.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Bid[] = res.getBody()['result'];
        expect(result.length).toBe(2);
        expect(result[0].type).toBe(MPAction.MPA_BID);
        expect(result[0].ListingItem.id).toBe(listingItemOnSellerNode.id);
        expect(result[1].type).toBe(MPAction.MPA_ACCEPT);
        expect(result[1].ListingItem.id).toBe(listingItemOnSellerNode.id);
    });


    test('Should fail to search because invalid type', async () => {
        expect(mpaBid).toBeDefined();
        expect(acceptBid).toBeDefined();

        const res: any = await testUtilSellerNode.rpc(bidCommand, [bidSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, BID_SEARCHORDERFIELD,
            listingItemOnSellerNode.id,
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
            listingItemOnSellerNode.id,
            MPAction.MPA_ACCEPT
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Bid[] = res.getBody()['result'];
        // log.debug('result: ', JSON.stringify(result, null, 2));
        expect(result.length).toBe(1);
        expect(result[0].type).toBe(MPAction.MPA_ACCEPT);
        expect(result[0].ListingItem.id).toBe(listingItemOnSellerNode.id);
    });


    test('Should fail to search because invalid searchString', async () => {
        expect(mpaBid).toBeDefined();
        expect(acceptBid).toBeDefined();

        const res: any = await testUtilSellerNode.rpc(bidCommand, [bidSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, BID_SEARCHORDERFIELD,
            listingItemOnSellerNode.id,
            MPAction.MPA_ACCEPT,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('searchString', 'string').getMessage());
    });


    test('Should return one Bid when searching by type and searchString', async () => {
        expect(mpaBid).toBeDefined();
        expect(acceptBid).toBeDefined();
        const searchStr = listingItemOnSellerNode.ItemInformation.longDescription.substring(0, 10);

        const res: any = await testUtilSellerNode.rpc(bidCommand, [bidSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, BID_SEARCHORDERFIELD,
            '*',
            MPAction.MPA_ACCEPT,
            searchStr
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Bid[] = res.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].type).toBe(MPAction.MPA_ACCEPT);
        expect(result[0].ListingItem.id).toBe(listingItemOnSellerNode.id);
    });


    test('Should fail to search because invalid market', async () => {
        const searchStr = listingItemOnSellerNode.ItemInformation.longDescription.substring(0, 10);
        const res: any = await testUtilSellerNode.rpc(bidCommand, [bidSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, BID_SEARCHORDERFIELD,
            listingItemOnSellerNode.id,
            MPAction.MPA_ACCEPT,
            searchStr,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('market', 'string').getMessage());
    });


    test('Should fail to search because Market not found', async () => {
        const searchStr = listingItemOnSellerNode.ItemInformation.longDescription.substring(0, 10);
        const res: any = await testUtilSellerNode.rpc(bidCommand, [bidSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, BID_SEARCHORDERFIELD,
            listingItemOnSellerNode.id,
            MPAction.MPA_ACCEPT,
            searchStr,
            sellerMarket.receiveAddress + 'x'
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('Market').getMessage());
    });


    test('Should return one Bid when searching by listingItemId, type and market', async () => {
        expect(mpaBid).toBeDefined();
        expect(acceptBid).toBeDefined();
        const searchStr = listingItemOnSellerNode.ItemInformation.longDescription.substring(0, 10);

        const res: any = await testUtilSellerNode.rpc(bidCommand, [bidSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, BID_SEARCHORDERFIELD,
            listingItemOnSellerNode.id,
            MPAction.MPA_ACCEPT,
            '*',
            sellerMarket.receiveAddress
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Bid[] = res.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].type).toBe(MPAction.MPA_ACCEPT);
        expect(result[0].ListingItem.id).toBe(listingItemOnSellerNode.id);
    });


    test('Should return no Bids when searching by listingItemId and market and type which doesnt exist', async () => {
        expect(mpaBid).toBeDefined();
        expect(acceptBid).toBeDefined();
        const searchStr = listingItemOnSellerNode.ItemInformation.longDescription.substring(0, 10);

        const res: any = await testUtilSellerNode.rpc(bidCommand, [bidSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, BID_SEARCHORDERFIELD,
            listingItemOnSellerNode.id,
            MPAction.MPA_REJECT,
            '*',
            sellerMarket.receiveAddress
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Bid[] = res.getBody()['result'];
        expect(result.length).toBe(0);
    });


    test('Should return two Bids when searching by listingItemId, market and bidder', async () => {
        expect(mpaBid).toBeDefined();
        expect(acceptBid).toBeDefined();
        const searchStr = listingItemOnSellerNode.ItemInformation.longDescription.substring(0, 10);

        const res: any = await testUtilSellerNode.rpc(bidCommand, [bidSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, BID_SEARCHORDERFIELD,
            listingItemOnSellerNode.id,
            '*',
            '*',
            sellerMarket.receiveAddress,
            buyerMarket.Identity.address
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Bid[] = res.getBody()['result'];
        expect(result.length).toBe(2);
        expect(result[0].type).toBe(MPAction.MPA_BID);
        expect(result[0].ListingItem.id).toBe(listingItemOnSellerNode.id);
        expect(result[1].type).toBe(MPAction.MPA_ACCEPT);
        expect(result[1].ListingItem.id).toBe(listingItemOnSellerNode.id);
    });


    test('Should return all two Bids when searching without any params', async () => {
        const res: any = await testUtilSellerNode.rpc(bidCommand, [bidSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, BID_SEARCHORDERFIELD
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.length).toBe(2);
        expect(result[0].type).toBe(MPAction.MPA_BID);
        expect(result[0].ListingItem.id).toBe(listingItemOnSellerNode.id);
        expect(result[1].type).toBe(MPAction.MPA_ACCEPT);
        expect(result[1].ListingItem.id).toBe(listingItemOnSellerNode.id);
    });

});
