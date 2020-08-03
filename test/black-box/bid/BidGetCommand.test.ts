// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';
import {GenerateListingItemTemplateParams} from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import {CreatableModel} from '../../../src/api/enums/CreatableModel';
import {SearchOrder} from '../../../src/api/enums/SearchOrder';
import {BidSearchOrderField} from '../../../src/api/enums/SearchOrderField';
import {GenerateBidParams} from '../../../src/api/requests/testdata/GenerateBidParams';
import {MPAction} from 'omp-lib/dist/interfaces/omp-enums';

describe('BidGetCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtilSellerNode = new BlackBoxTestUtil(randomBoolean ? 0 : 1);
    const testUtilBuyerNode = new BlackBoxTestUtil(randomBoolean ? 1 : 0);

    const bidCommand =  Commands.BID_ROOT.commandName;
    const bidGetCommand = Commands.BID_GET.commandName;
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
        log.debug('sellerProfile: ', JSON.stringify(sellerProfile, null, 2));
        log.debug('buyerProfile: ', JSON.stringify(buyerProfile, null, 2));

        sellerMarket = await testUtilSellerNode.getDefaultMarket(sellerProfile.id);
        buyerMarket = await testUtilBuyerNode.getDefaultMarket(buyerProfile.id);
        expect(sellerMarket.id).toBeDefined();
        expect(buyerMarket.id).toBeDefined();
        log.debug('sellerMarket: ', JSON.stringify(sellerMarket, null, 2));
        log.debug('buyerMarket: ', JSON.stringify(buyerMarket, null, 2));

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


    test('Should fail because missing id', async () => {
        const res = await testUtilSellerNode.rpc(bidCommand, [bidGetCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('bidId').getMessage());
    });


    test('Should fail because invalid id', async () => {
        const res = await testUtilSellerNode.rpc(bidCommand, [bidGetCommand,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('bidId', 'number').getMessage());
    });


    test('Should fail because Bid not found', async () => {
        const res = await testUtilSellerNode.rpc(bidCommand, [bidGetCommand,
            0
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('Bid').getMessage());
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


    test('Should find Bid by id', async () => {
        const res = await testUtilSellerNode.rpc(bidCommand, [bidGetCommand,
            mpaBid.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.id).toBe(mpaBid.id);
        expect(mpaBid.type).toBe(MPAction.MPA_BID);
        expect(mpaBid.OrderItem).toBeDefined();
        expect(mpaBid.OrderItem.Order).toBeDefined();
        expect(mpaBid.ListingItem).toBeDefined();
        expect(mpaBid.ListingItem.id).toBe(listingItemOnSellerNode.id);
    });

});
