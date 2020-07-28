// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import * as _ from 'lodash';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { SearchOrder } from '../../../src/api/enums/SearchOrder';
import { OrderSearchOrderField } from '../../../src/api/enums/SearchOrderField';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';
import { GenerateBidParams } from '../../../src/api/requests/testdata/GenerateBidParams';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { OrderItemStatus } from '../../../src/api/enums/OrderItemStatus';
import { OrderStatus } from '../../../src/api/enums/OrderStatus';

describe('OrderSearchCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtilSellerNode = new BlackBoxTestUtil(randomBoolean ? 0 : 1);
    const testUtilBuyerNode = new BlackBoxTestUtil(randomBoolean ? 1 : 0);

    const orderCommand = Commands.ORDER_ROOT.commandName;
    const orderSearchCommand = Commands.ORDER_SEARCH.commandName;

    let sellerMarket: resources.Market;
    let sellerProfile: resources.Profile;

    let buyerProfile: resources.Profile;
    let buyerMarket: resources.Market;

    let listingItem: resources.ListingItem;
    let order: resources.Order;
    let bid: resources.Bid;

    const PAGE = 0;
    const PAGE_LIMIT = 10;
    const SEARCHORDER = SearchOrder.ASC;
    const ORDER_SEARCHORDERFIELD = OrderSearchOrderField.CREATED_AT;

    beforeAll(async () => {
        await testUtilSellerNode.cleanDb();

        sellerProfile = await testUtilSellerNode.getDefaultProfile();
        expect(sellerProfile.id).toBeDefined();
        sellerMarket = await testUtilSellerNode.getDefaultMarket(sellerProfile.id);
        expect(sellerMarket.id).toBeDefined();

        buyerProfile = await testUtilBuyerNode.getDefaultProfile();
        expect(buyerProfile.id).toBeDefined();
        buyerMarket = await testUtilBuyerNode.getDefaultMarket(buyerProfile.id);
        expect(buyerMarket.id).toBeDefined();

        // TODO: add 'identity add' command to create a new identity
        // use that identity to bid for the same item creating two orders
        // then confirm that the search works when theres multiple orders on the sellers side

        // generate ListingItemTemplate with ListingItem
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,                   // generateItemInformation
            true,                   // generateItemLocation
            true,                   // generateShippingDestinations
            false,                  // generateItemImages
            true,                   // generatePaymentInformation
            true,                   // generateEscrow
            true,                   // generateItemPrice
            false,                  // generateMessagingInformation
            false,                  // generateListingItemObjects
            false,                  // generateObjectDatas
            sellerProfile.id,       // profileId
            true,                   // generateListingItem
            sellerMarket.id         // soldOnMarketId
        ]).toParamsArray();

        const listingItemTemplates = await testUtilSellerNode.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplate[];

        listingItem = listingItemTemplates[0].ListingItems[0];
    });


    test('Should return empty result because Orders do not exist for the given ListingItem', async () => {
        const res: any = await testUtilSellerNode.rpc(orderCommand, [orderSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, ORDER_SEARCHORDERFIELD,
            listingItem.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.length).toBe(0);
    });


    test('Should fail to search because invalid ListingItemId', async () => {
        const res: any = await testUtilSellerNode.rpc(orderCommand, [orderSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, ORDER_SEARCHORDERFIELD,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('listingItemId', 'number').getMessage());
    });


    test('Should fail to search because ListingItem not found', async () => {
        const res: any = await testUtilSellerNode.rpc(orderCommand, [orderSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, ORDER_SEARCHORDERFIELD,
            0
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('ListingItem').getMessage());
    });


    test('Should generate a Bid (MPA_BID) with an Order and OrderItem', async () => {
        expect(listingItem).toBeDefined();
        const bidGenerateParams = new GenerateBidParams([
            false,                          // generateListingItemTemplate
            false,                          // generateListingItem
            true,                           // generateOrder
            listingItem.id,                 // listingItem.id
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
        bid = bids[0];

        // log.debug('bid: ', JSON.stringify(bid, null, 2));

        expect(bid.type).toBe(MPAction.MPA_BID);
        expect(bid.OrderItem).toBeDefined();
        expect(bid.OrderItem.Order).toBeDefined();
        expect(bid.ListingItem).toBeDefined();
        expect(bid.ListingItem.id).toBe(listingItem.id);
    });


    test('Should find the generated Order when searching by listingItemId', async () => {
        expect(bid).toBeDefined();

        const res: any = await testUtilSellerNode.rpc(orderCommand, [orderSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, ORDER_SEARCHORDERFIELD,
            listingItem.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.Bid[] = res.getBody()['result'];

        // log.debug('result: ', JSON.stringify(result, null, 2));
        order = result[0];
        expect(result.length).toBe(1);
        expect(result[0].buyer).toBe(buyerMarket.Identity.address);
        expect(result[0].seller).toBe(sellerMarket.Identity.address);
        expect(result[0].OrderItems).toBeDefined();
        expect(result[0].OrderItems[0].Bid.id).toBe(bid.id);
    });


    test('Should fail to search because invalid status', async () => {
        expect(bid).toBeDefined();
        expect(order).toBeDefined();

        const res: any = await testUtilSellerNode.rpc(orderCommand, [orderSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, ORDER_SEARCHORDERFIELD,
            listingItem.id,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('status', 'string').getMessage());
    });


    test('Should fail to search because invalid status', async () => {
        expect(bid).toBeDefined();
        expect(order).toBeDefined();

        const res: any = await testUtilSellerNode.rpc(orderCommand, [orderSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, ORDER_SEARCHORDERFIELD,
            listingItem.id,
            'INVALID'
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('status', 'OrderStatus|OrderItemStatus').getMessage());
    });


    test('Should return one Order when searching by listingItemId and status (OrderItemStatus) ', async () => {
        expect(bid).toBeDefined();
        expect(order).toBeDefined();

        const res: any = await testUtilSellerNode.rpc(orderCommand, [orderSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, ORDER_SEARCHORDERFIELD,
            listingItem.id,
            OrderItemStatus.BIDDED
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Bid[] = res.getBody()['result'];
        log.debug('result: ', JSON.stringify(result, null, 2));
        expect(result.length).toBe(1);
        expect(result[0].status).toBe(OrderStatus.PROCESSING);
        expect(result[0].buyer).toBe(buyerMarket.Identity.address);
        expect(result[0].seller).toBe(sellerMarket.Identity.address);
        expect(result[0].OrderItems).toBeDefined();
        expect(result[0].OrderItems[0].Bid.id).toBe(bid.id);
        expect(result[0].OrderItems[0].status).toBe(OrderItemStatus.BIDDED);
    });

    // TODO: generate second Order with MPA_ACCEPT

    test('Should return one Order when searching by listingItemId and status (OrderStatus) ', async () => {
        expect(bid).toBeDefined();
        expect(order).toBeDefined();

        const res: any = await testUtilSellerNode.rpc(orderCommand, [orderSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, ORDER_SEARCHORDERFIELD,
            listingItem.id,
            OrderStatus.PROCESSING
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Bid[] = res.getBody()['result'];
        log.debug('result: ', JSON.stringify(result, null, 2));
        expect(result.length).toBe(1);
        expect(result[0].status).toBe(OrderStatus.PROCESSING);
        expect(result[0].buyer).toBe(buyerMarket.Identity.address);
        expect(result[0].seller).toBe(sellerMarket.Identity.address);
        expect(result[0].OrderItems).toBeDefined();
        expect(result[0].OrderItems[0].Bid.id).toBe(bid.id);
        expect(result[0].OrderItems[0].status).toBe(OrderItemStatus.BIDDED);
    });


    test('Should fail to search because invalid buyerAddress', async () => {
        expect(bid).toBeDefined();
        expect(order).toBeDefined();

        const res: any = await testUtilSellerNode.rpc(orderCommand, [orderSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, ORDER_SEARCHORDERFIELD,
            listingItem.id,
            OrderStatus.PROCESSING,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('buyerAddress', 'string').getMessage());
    });


    test('Should return one Order when searching by buyerAddress', async () => {
        expect(bid).toBeDefined();
        expect(order).toBeDefined();

        const res: any = await testUtilSellerNode.rpc(orderCommand, [orderSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, ORDER_SEARCHORDERFIELD,
            '*',
            '*',
            buyerMarket.Identity.address
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Bid[] = res.getBody()['result'];
        log.debug('result: ', JSON.stringify(result, null, 2));
        expect(result.length).toBe(1);
        expect(result[0].status).toBe(OrderStatus.PROCESSING);
        expect(result[0].buyer).toBe(buyerMarket.Identity.address);
        expect(result[0].seller).toBe(sellerMarket.Identity.address);
        expect(result[0].OrderItems).toBeDefined();
        expect(result[0].OrderItems[0].Bid.id).toBe(bid.id);
        expect(result[0].OrderItems[0].status).toBe(OrderItemStatus.BIDDED);
    });


    test('Should fail to search because invalid sellerAddress', async () => {
        expect(bid).toBeDefined();
        expect(order).toBeDefined();

        const res: any = await testUtilSellerNode.rpc(orderCommand, [orderSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, ORDER_SEARCHORDERFIELD,
            listingItem.id,
            OrderStatus.PROCESSING,
            buyerMarket.Identity.address,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('sellerAddress', 'string').getMessage());
    });


    test('Should return one Order when searching by buyerAddress and sellerAddress', async () => {
        expect(bid).toBeDefined();
        expect(order).toBeDefined();

        const res: any = await testUtilSellerNode.rpc(orderCommand, [orderSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, ORDER_SEARCHORDERFIELD,
            '*',
            '*',
            buyerMarket.Identity.address,
            sellerMarket.Identity.address
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Bid[] = res.getBody()['result'];
        log.debug('result: ', JSON.stringify(result, null, 2));
        expect(result.length).toBe(1);
        expect(result[0].status).toBe(OrderStatus.PROCESSING);
        expect(result[0].buyer).toBe(buyerMarket.Identity.address);
        expect(result[0].seller).toBe(sellerMarket.Identity.address);
        expect(result[0].OrderItems).toBeDefined();
        expect(result[0].OrderItems[0].Bid.id).toBe(bid.id);
        expect(result[0].OrderItems[0].status).toBe(OrderItemStatus.BIDDED);
    });


    test('Should fail to search because invalid market', async () => {
        expect(bid).toBeDefined();
        expect(order).toBeDefined();

        const res: any = await testUtilSellerNode.rpc(orderCommand, [orderSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, ORDER_SEARCHORDERFIELD,
            listingItem.id,
            OrderStatus.PROCESSING,
            buyerMarket.Identity.address,
            sellerMarket.Identity.address,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('market', 'string').getMessage());
    });


    test('Should fail to search because Market not found', async () => {
        const res: any = await testUtilSellerNode.rpc(orderCommand, [orderSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, ORDER_SEARCHORDERFIELD,
            listingItem.id,
            OrderStatus.PROCESSING,
            buyerMarket.Identity.address,
            sellerMarket.Identity.address,
            'ADDRESS_NOT_FOUND'
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('Market').getMessage());
    });


    test('Should return one Order when searching by buyerAddress and sellerAddress and market', async () => {
        expect(bid).toBeDefined();
        expect(order).toBeDefined();

        const res: any = await testUtilSellerNode.rpc(orderCommand, [orderSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, ORDER_SEARCHORDERFIELD,
            '*',
            '*',
            buyerMarket.Identity.address,
            sellerMarket.Identity.address,
            sellerMarket.address
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Bid[] = res.getBody()['result'];
        log.debug('result: ', JSON.stringify(result, null, 2));
        expect(result.length).toBe(1);
        expect(result[0].status).toBe(OrderStatus.PROCESSING);
        expect(result[0].buyer).toBe(buyerMarket.Identity.address);
        expect(result[0].seller).toBe(sellerMarket.Identity.address);
        expect(result[0].OrderItems).toBeDefined();
        expect(result[0].OrderItems[0].Bid.id).toBe(bid.id);
        expect(result[0].OrderItems[0].status).toBe(OrderItemStatus.BIDDED);
    });

});
