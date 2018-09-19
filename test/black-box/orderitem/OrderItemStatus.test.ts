// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

// tslint:disable:max-line-length
import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import * as resources from 'resources';
import { BidMessageType } from '../../../src/api/enums/BidMessageType';
import { OrderStatus } from '../../../src/api/enums/OrderStatus';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/params/GenerateListingItemTemplateParams';
import { SearchOrder } from '../../../src/api/enums/SearchOrder';
import { Logger as LoggerType } from '../../../src/core/Logger';
// tslint:enable:max-line-length

describe('OrderItemStatus', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtilSellerNode = new BlackBoxTestUtil(randomBoolean ? 0 : 1);  // SELLER
    const testUtilBuyerNode = new BlackBoxTestUtil(randomBoolean ? 1 : 0);

    const templateCommand = Commands.TEMPLATE_ROOT.commandName;
    const templatePostCommand = Commands.TEMPLATE_POST.commandName;

    const itemCommand = Commands.ITEM_ROOT.commandName;
    const itemGetCommand = Commands.ITEM_GET.commandName;

    const bidCommand = Commands.BID_ROOT.commandName;
    const bidSendCommand = Commands.BID_SEND.commandName;
    const bidSearchCommand = Commands.BID_SEARCH.commandName;
    const bidAcceptCommand = Commands.BID_ACCEPT.commandName;

    const orderCommand = Commands.ORDER_ROOT.commandName;
    const orderSearchCommand = Commands.ORDER_SEARCH.commandName;

    const orderItemCommand = Commands.ORDERITEM_ROOT.commandName;
    const orderItemStatusCommand = Commands.ORDERITEM_STATUS.commandName;

    let listingItemTemplateSellerNode: resources.ListingItemTemplate;
    let listingItemReceivedSellerNode: resources.ListingItem;
    let listingItemReceivedBuyerNode: resources.ListingItem;

    let sellerProfile: resources.Profile;
    let buyerProfile: resources.Profile;
    let sellerMarket: resources.Market;
    let buyerMarket: resources.Market;

    let bidOnBuyerNode: resources.Bid;
    let bidOnSellerNode: resources.Bid;

    let orderOnSellerNode: resources.Order;
    let orderOnBuyerNode: resources.Order;

    const PAGE = 0;
    const PAGE_LIMIT = 10;
    const ORDERING = SearchOrder.ASC;

    beforeAll(async () => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

        await testUtilSellerNode.cleanDb();
        await testUtilBuyerNode.cleanDb();

        sellerProfile = await testUtilSellerNode.getDefaultProfile();
        sellerMarket = await testUtilSellerNode.getDefaultMarket();

        // testUtil will add one shipping address to it unless one allready exists
        buyerProfile = await testUtilBuyerNode.getDefaultProfile();
        buyerMarket = await testUtilBuyerNode.getDefaultMarket();

        // Create template
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,       // generateItemInformation
            true,       // generateShippingDestinations
            false,      // generateItemImages
            true,       // generatePaymentInformation
            true,       // generateEscrow
            true,       // generateItemPrice
            true,       // generateMessagingInformation
            false,              // generateListingItemObjects
            false,              // generateObjectDatas
            sellerProfile.id, // profileId
            false,              // generateListingItem
            sellerMarket.id   // marketId
        ]).toParamsArray();

        // generate ListingItemTemplate
        const listingItemTemplatesSellerNode = await testUtilSellerNode.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplate[];

        listingItemTemplateSellerNode = listingItemTemplatesSellerNode[0];
        expect(listingItemTemplateSellerNode.id).toBeDefined();
        expect(listingItemTemplateSellerNode.hash).toBeDefined();

        log.debug('==> Setup DONE.');

    });


    test('Post ListingItemTemplate to create ListingItem', async () => {

        expect(listingItemTemplateSellerNode).toBeDefined();

        // Post ListingItemTemplate to create ListingItem
        const templatePostRes: any = await testUtilSellerNode.rpc(templateCommand, [templatePostCommand, listingItemTemplateSellerNode.id, sellerMarket.id]);
        templatePostRes.expectJson();
        templatePostRes.expectStatusCode(200);
        const postResult: any = templatePostRes.getBody()['result'];
        expect(postResult.result).toBe('Sent.');

        log.debug('==> ListingItemTemplate posted.');

        // wait for ListingItem to be received on the seller node
        const response = await testUtilSellerNode.rpcWaitFor(
            itemCommand,
            [itemGetCommand, listingItemTemplateSellerNode.hash],
            60 * 60,
            200,
            'hash',
            listingItemTemplateSellerNode.hash
        );
        response.expectJson();
        response.expectStatusCode(200);
        listingItemReceivedSellerNode = response.getBody()['result'];

        log.debug('==> ListingItem received on seller node.');

        // wait for ListingItem to be received on the buyer node
        listingItemReceivedBuyerNode = await testUtilBuyerNode.rpcWaitFor(
            itemCommand,
            [itemGetCommand, listingItemTemplateSellerNode.hash],
            60 * 60,
            200,
            'hash',
            listingItemTemplateSellerNode.hash
        );
        response.expectJson();
        response.expectStatusCode(200);
        listingItemReceivedBuyerNode = response.getBody()['result'];

        log.debug('==> ListingItem received on buyer node.');

    }, 600000); // timeout to 600s


    test('Should return an empty list since there are no bids or orders yet', async () => {

        expect(listingItemReceivedBuyerNode).toBeDefined();

        // wait for some time to make sure the Bid has been created
        await testUtilBuyerNode.waitFor(5);

        const orderItemStatusRes = await testUtilBuyerNode.rpc(orderItemCommand, [
            orderItemStatusCommand
        ]);

        orderItemStatusRes.expectJson();
        orderItemStatusRes.expectStatusCode(200);
        const myOrderItems = orderItemStatusRes.getBody()['result'];
        expect(myOrderItems.length).toBe(0);

        log.debug('==> Got empty result.');

    });

    test('Should post a Bid for a ListingItem', async () => {

        expect(listingItemReceivedBuyerNode).toBeDefined();

        let bidSendRes = await testUtilBuyerNode.rpc(bidCommand, [
            bidSendCommand,
            listingItemReceivedBuyerNode.hash,
            buyerProfile.id,
            buyerProfile.ShippingAddresses[0].id,
            'colour',
            'black',
            'size',
            'xl'
        ]);
        bidSendRes.expectJson();
        bidSendRes.expectStatusCode(200);
        bidSendRes = bidSendRes.getBody()['result'];
        expect(bidSendRes.result).toBe('Sent.');

        log.debug('==> Bid posted.');

    });

    test('Bid should have been created on buyer node after posting the MPA_BID, BidMessageType.MPA_BID', async () => {

        expect(listingItemReceivedBuyerNode).toBeDefined();

        // wait for some time to make sure the Bid has been created
        await testUtilBuyerNode.waitFor(5);

        const bidSearchCommandParams = [
            bidSearchCommand,
            PAGE, PAGE_LIMIT, ORDERING,
            listingItemReceivedBuyerNode.hash,
            BidMessageType.MPA_BID,
            '*',
            buyerProfile.address
        ];

        const bidSearchRes: any = await testUtilBuyerNode.rpcWaitFor(
            bidCommand,
            bidSearchCommandParams,
            8 * 60,
            200,
            '[0].action',
            BidMessageType.MPA_BID.toString()
        );
        bidSearchRes.expectJson();
        bidSearchRes.expectStatusCode(200);

        const result: resources.Bid = bidSearchRes.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].action).toBe(BidMessageType.MPA_BID);
        expect(result[0].ListingItem.hash).toBe(listingItemReceivedBuyerNode.hash);
        expect(result[0].bidder).toBe(buyerProfile.address);
        expect(result[0].ListingItem.seller).toBe(sellerProfile.address);

        // there should be no relation to template on the buyer side
        expect(result[0].ListingItem.ListingItemTemplate).toEqual({});

        bidOnBuyerNode = result[0];

        log.debug('==> Bid found on buyer node.');

    }, 600000); // timeout to 600s


    test('Should get OrderItemStatus from buyer node (bidtype=MPA_BID)', async () => {

        expect(bidOnBuyerNode).toBeDefined();

        // wait for some time to make sure the Bid has been created
        await testUtilBuyerNode.waitFor(5);

        const orderItemStatusRes = await testUtilBuyerNode.rpc(orderItemCommand, [
            orderItemStatusCommand
        ]);

        orderItemStatusRes.expectJson();
        orderItemStatusRes.expectStatusCode(200);

        const myOrderItems = orderItemStatusRes.getBody()['result'];

        // Check we receive order that was bid upon
        expect(myOrderItems.length).toBe(1);
        expect(myOrderItems[0].listingItemHash).toBe(listingItemReceivedBuyerNode.hash);
        expect(myOrderItems[0].bidType).toBe(BidMessageType.MPA_BID);
        expect(myOrderItems[0].buyer).toBe(buyerProfile.address);
        expect(myOrderItems[0].seller).toBe(sellerProfile.address);

        log.debug('myOrderItems: ', JSON.stringify(myOrderItems, null, 2));
/*
myOrderItems:  0=[[
  {
    "listingItemHash": "6f946aa36fc78047e904f497b3ec8561d849fa1c1e8c74f3dd11ce09c4ea8d5f",
    "bidType": "MPA_BID",
    "orderStatus": "",
    "buyer": "ppUFRUL576kMr9pG41BtjXAy3ZN9fiEBTK",
    "seller": "pXqEPTgARKWDyvVZ5qtjQB4ujthPQ1K7K7"
  }
]]
*/
        log.debug('==> Correct status got from buyer node.');

    });


    test('SELLER RECEIVES MPA_BID posted from buyers node, BidMessageType.MPA_BID', async () => {

        // wait for some time to make sure the Bid has been created
        await testUtilSellerNode.waitFor(5);

        const bidSearchCommandParams = [
            bidSearchCommand,
            PAGE, PAGE_LIMIT, ORDERING,
            listingItemReceivedBuyerNode.hash,
            BidMessageType.MPA_BID,
            '*',
            buyerProfile.address
        ];

        const bidSearchRes: any = await testUtilSellerNode.rpcWaitFor(
            bidCommand,
            bidSearchCommandParams,
            8 * 60,
            200,
            '[0].action',
            BidMessageType.MPA_BID.toString()
        );
        bidSearchRes.expectJson();
        bidSearchRes.expectStatusCode(200);

        const result: resources.Bid = bidSearchRes.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].action).toBe(BidMessageType.MPA_BID);
        expect(result[0].bidder).toBe(buyerProfile.address);
        expect(result[0].ListingItem).toBeDefined();
        expect(result[0].ListingItem.seller).toBe(sellerProfile.address);
        expect(result[0].ListingItem.hash).toBe(listingItemReceivedSellerNode.hash);

        // there should be a relation to template on the seller side
        expect(result[0].ListingItem.ListingItemTemplate).toBeDefined();

        // the relation should match the hash of the template that was created earlier on node1
        expect(result[0].ListingItem.ListingItemTemplate.hash).toBe(listingItemTemplateSellerNode.hash);
        bidOnSellerNode = result[0];

        log.debug('==> Bid found on seller node.');

    }, 600000); // timeout to 600s

    test('Should get OrderItemStatus from seller node (bidtype=MPA_BID)', async () => {

        expect(bidOnSellerNode).toBeDefined();

        // wait for some time to make sure the Bid has been created
        await testUtilSellerNode.waitFor(5);

        const orderItemStatusRes = await testUtilSellerNode.rpc(orderItemCommand, [
            orderItemStatusCommand
        ]);

        orderItemStatusRes.expectJson();
        orderItemStatusRes.expectStatusCode(200);

        const myOrderItems = orderItemStatusRes.getBody()['result'];

        // Check we receive order that was bid upon
        expect(myOrderItems.length).toBe(1);
        expect(myOrderItems[0].listingItemHash).toBe(listingItemReceivedBuyerNode.hash);
        expect(myOrderItems[0].bidType).toBe(BidMessageType.MPA_BID);
        expect(myOrderItems[0].buyer).toBe(buyerProfile.address);
        expect(myOrderItems[0].seller).toBe(sellerProfile.address);

        log.debug('myOrderItems: ', JSON.stringify(myOrderItems, null, 2));
        log.debug('==> Correct status: MPA_BID got from seller node.');

    });

    test('SELLER POSTS MPA_ACCEPT', async () => {

        await testUtilSellerNode.waitFor(5);

        expect(bidOnSellerNode).toBeDefined();

        const bidAcceptCommandParams = [
            bidAcceptCommand,
            bidOnSellerNode.ListingItem.hash,
            bidOnSellerNode.id
        ];

        const response: any = await testUtilSellerNode.rpc(bidCommand, bidAcceptCommandParams);
        log.debug('response:', JSON.stringify(response, null, 2));

        response.expectJson();
        response.expectStatusCode(200);

        // make sure we got the expected result from sending the bid
        const result: any = response.getBody()['result'];
        log.debug('result:', JSON.stringify(result, null, 2));
        expect(result.result).toBe('Sent.');

        log.debug('==[ accept Bid /// seller (node1) -> buyer (node2) ]=============================');
        log.debug('msgid: ' + result.msgid);
        log.debug('item.hash: ' + bidOnSellerNode.ListingItem.hash);
        log.debug('bid.id: ' + bidOnSellerNode.id);
        log.debug('bid.bidder: ' + bidOnSellerNode.bidder);
        log.debug('bid.ListingItem.seller: ' + bidOnSellerNode.ListingItem.seller);
        log.debug('=================================================================================');

    }, 600000); // timeout to 600s


    test('Should get OrderItemStatus from seller node (bidtype=MPA_ACCEPT, orderStatus=AWAITING_ESCROW)', async () => {

        expect(bidOnSellerNode).toBeDefined();

        // wait for some time to make sure the Bid has been created
        await testUtilSellerNode.waitFor(5);

        const orderItemStatusRes = await testUtilSellerNode.rpc(orderItemCommand, [
            orderItemStatusCommand
        ]);

        orderItemStatusRes.expectJson();
        orderItemStatusRes.expectStatusCode(200);

        const myOrderItems = orderItemStatusRes.getBody()['result'];

        // Check we receive order that was bid upon
        expect(myOrderItems.length).toBe(1);
        expect(myOrderItems[0].listingItemHash).toBe(listingItemReceivedBuyerNode.hash);
        expect(myOrderItems[0].bidType).toBe(BidMessageType.MPA_ACCEPT);
        expect(myOrderItems[0].orderStatus).toBe(OrderStatus.AWAITING_ESCROW);
        expect(myOrderItems[0].buyer).toBe(buyerProfile.address);
        expect(myOrderItems[0].seller).toBe(sellerProfile.address);

        log.debug('myOrderItems: ', JSON.stringify(myOrderItems, null, 2));
/*
        2018-08-29T18:12:35.500Z - debug: [/home/juha/Work/particl/particl-market/test/black-box/orderItem/OrderItemStatus.test] myOrderItems:  0=[[
            {
                "listingItemHash": "3ebfd8df240974460b608d999eddb3231860b429a03695af9b5531d31aacc4c8",
                "bidType": "MPA_ACCEPT",
                "orderStatus": "AWAITING_ESCROW",
                "buyer": "pdFPsUzpqtoMKsZGwQsRqWbRuJbxvwfcdk",
                "seller": "pc6CdRG5fGZugUsxbaZuVxbo6HxkxCJaB7"
            }
        ]]
*/
        log.debug('==> Correct status: MPA_ACCEPT got from seller node.');

    });

    test('Order should have been created on seller node after posting the MPA_ACCEPT', async () => {

        // wait for some time to make sure the Order has been created
        await testUtilSellerNode.waitFor(10);

        log.debug('bidOnSellerNode: ', JSON.stringify(bidOnSellerNode, null, 2));
        const orderSearchCommandParams = [
            orderSearchCommand,
            bidOnSellerNode.ListingItem.hash,
            OrderStatus.AWAITING_ESCROW,
            buyerProfile.address,
            sellerProfile.address,
            SearchOrder.ASC
        ];

        const orderSearchRes: any = await testUtilSellerNode.rpcWaitFor(
            orderCommand,
            orderSearchCommandParams,
            8 * 60,
            200,
            '[0].OrderItems[0].status',
            OrderStatus.AWAITING_ESCROW.toString()
        );
        orderSearchRes.expectJson();
        orderSearchRes.expectStatusCode(200);

        const result: resources.Order = orderSearchRes.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].hash).toBeDefined(); // TODO: should match bidOnSellerNode.BidDatas[orderHash]
        expect(result[0].buyer).toBe(buyerProfile.address);
        expect(result[0].seller).toBe(sellerProfile.address);
        expect(result[0].OrderItems).toHaveLength(1);
        expect(result[0].OrderItems[0].status).toBe(OrderStatus.AWAITING_ESCROW);
        expect(result[0].OrderItems[0].itemHash).toBe(bidOnSellerNode.ListingItem.hash);

        orderOnSellerNode = result[0];

        log.debug('==> Order created on SELLER node.');

    }, 600000); // timeout to 600s


    test('BUYER RECEIVES MPA_ACCEPT posted from sellers node, BidMessageType.MPA_ACCEPT', async () => {

        expect(orderOnSellerNode).toBeDefined();

        await testUtilBuyerNode.waitFor(10);

        // TODO: when we first get the template hash, store it in originalTemplateHash and use that for searches and expects
        // same for other similar cases...

        const bidSearchCommandParams = [
            bidSearchCommand,
            PAGE, PAGE_LIMIT, ORDERING,
            bidOnBuyerNode.ListingItem.hash,
            BidMessageType.MPA_ACCEPT,
            '*',
            buyerProfile.address
        ];

        const bidSearchRes: any = await testUtilBuyerNode.rpcWaitFor(
            bidCommand,
            bidSearchCommandParams,
            8 * 60,
            200,
            '[0].action',
            BidMessageType.MPA_ACCEPT.toString()
        );
        bidSearchRes.expectJson();
        bidSearchRes.expectStatusCode(200);

        const result: resources.Bid = bidSearchRes.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].action).toBe(BidMessageType.MPA_ACCEPT);
        expect(result[0].bidder).toBe(buyerProfile.address);
        expect(result[0].ListingItem.seller).toBe(sellerProfile.address);
        expect(result[0].ListingItem.hash).toBe(listingItemReceivedSellerNode.hash);

        // there should be no relation to template on the buyer side
        expect(result[0].ListingItem.ListingItemTemplate).toEqual({});

        bidOnBuyerNode = result[0];

        log.debug('==> BUYER received MPA_ACCEPT.');
    }, 600000); // timeout to 600s


    test('Order should have been created on buyer node after receiving the MPA_ACCEPT, OrderStatus.AWAITING_ESCROW', async () => {

        expect(bidOnBuyerNode.action).toBe(BidMessageType.MPA_ACCEPT);

        // wait for some time to make sure the Order has been created
        await testUtilBuyerNode.waitFor(5);

        const orderSearchCommandParams = [
            orderSearchCommand,
            bidOnBuyerNode.ListingItem.hash,
            OrderStatus.AWAITING_ESCROW,
            buyerProfile.address,
            sellerProfile.address,
            SearchOrder.ASC
        ];

        const orderSearchRes: any = await testUtilBuyerNode.rpc(orderCommand, orderSearchCommandParams);
        orderSearchRes.expectJson();
        orderSearchRes.expectStatusCode(200);

        const result: resources.Order = orderSearchRes.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].hash).toBeDefined(); // TODO: bidNode1.BidDatas[orderHash]
        expect(result[0].buyer).toBe(buyerProfile.address);
        expect(result[0].seller).toBe(sellerProfile.address);
        expect(result[0].OrderItems).toHaveLength(1);
        expect(result[0].OrderItems[0].status).toBe(OrderStatus.AWAITING_ESCROW);
        expect(result[0].OrderItems[0].itemHash).toBe(bidOnSellerNode.ListingItem.hash);

        orderOnBuyerNode = result[0];

        log.debug('==> Order created on BUYER node.');
    });

    test('Should get OrderItemStatus from buyer node (bidtype=MPA_ACCEPT, orderStatus=AWAITING_ESCROW)', async () => {

        expect(bidOnSellerNode).toBeDefined();

        // wait for some time to make sure the Bid has been created
        await testUtilSellerNode.waitFor(5);

        const orderItemStatusRes = await testUtilSellerNode.rpc(orderItemCommand, [
            orderItemStatusCommand
        ]);

        orderItemStatusRes.expectJson();
        orderItemStatusRes.expectStatusCode(200);

        const myOrderItems = orderItemStatusRes.getBody()['result'];

        // Check we receive order that was bid upon
        expect(myOrderItems.length).toBe(1);
        expect(myOrderItems[0].listingItemHash).toBe(listingItemReceivedBuyerNode.hash);
        expect(myOrderItems[0].bidType).toBe(BidMessageType.MPA_ACCEPT);
        expect(myOrderItems[0].orderStatus).toBe(OrderStatus.AWAITING_ESCROW);
        expect(myOrderItems[0].buyer).toBe(buyerProfile.address);
        expect(myOrderItems[0].seller).toBe(sellerProfile.address);

        log.debug('myOrderItems: ', JSON.stringify(myOrderItems, null, 2));
        log.debug('==> Correct status got from seller node.');

    });
});
