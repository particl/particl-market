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
import { AddressType } from '../../../src/api/enums/AddressType';
import { OrderStatus } from '../../../src/api/enums/OrderStatus';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/params/GenerateListingItemTemplateParams';
import { SearchOrder } from '../../../src/api/enums/SearchOrder';
import { Logger as LoggerType } from '../../../src/core/Logger';
// tslint:enable:max-line-length

describe('OrderItemStatus', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtilSellerNode = new BlackBoxTestUtil(randomBoolean ? 1 : 2);  // SELLER
    const testUtilBuyerNode = new BlackBoxTestUtil(randomBoolean ? 2 : 1);

    const lockCommand = Commands.ESCROW_LOCK.commandName;

    const categoryCommand = Commands.CATEGORY_ROOT.commandName;
    const categorySearchSubCommand = Commands.CATEGORY_SEARCH.commandName;

    const templateCommand = Commands.TEMPLATE_ROOT.commandName;
    const templateAddCommand = Commands.TEMPLATE_ADD.commandName;
    const templateGetCommand = Commands.TEMPLATE_GET.commandName;
    const templatePostCommand = Commands.TEMPLATE_POST.commandName;

    const itemCommand = Commands.ITEM_ROOT.commandName;
    const itemGetCommand = Commands.ITEM_GET.commandName;

    const addressCommand = Commands.ADDRESS_ROOT.commandName;
    const addressAddCommand = Commands.ADDRESS_ADD.commandName;

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

        // Post ListingItemTemplate to create ListingItem
        const templatePostRes: any = await testUtilSellerNode.rpc(templateCommand, [templatePostCommand, listingItemTemplateSellerNode.id, sellerMarket.id]);
        templatePostRes.expectJson();
        templatePostRes.expectStatusCode(200);
        const postResult: any = templatePostRes.getBody()['result'];
        expect(postResult.result).toBe('Sent.');

        // wait for ListingItem to be received on the seller node
        let response = await testUtilSellerNode.rpcWaitFor(
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

    });

    test('Should return an empty list since there are no bids or orders yet', async () => {
        const orderItemStatusRes = await testUtilBuyerNode.rpc(orderItemCommand, [
            orderItemStatusCommand
        ]);

        orderItemStatusRes.expectJson();
        orderItemStatusRes.expectStatusCode(200);
        const myOrderItems = orderItemStatusRes.getBody()['result'];
        expect(myOrderItems.length).toBe(0);
    });

    test('Should post a Bid for a ListingItem', async () => {

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

    });

    test('Bid should have been created on buyer node after posting the MPA_BID, BidMessageType.MPA_BID', async () => {

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

    }, 600000); // timeout to 600s


    test('Should get OrderItemStatus from buyer node', async () => {

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
    });


    test('SELLER RECEIVES MPA_BID posted from buyers node, BidMessageType.MPA_BID', async () => {

        // wait for some time to make sure the Bid has been created
        // await testUtilBuyerNode.waitFor(5);

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

    }, 600000); // timeout to 600s


/*
    test('Should show order that has been accepted', async () => {
        // Create an order from the bid
        const myOrderSend = await testUtilSellerNode.rpc(bidCommand, [
            bidAcceptCommand,
            myTemplate.hash,
            myBid.id
        ]);
        myOrderSend.expectJson();
        myOrderSend.expectStatusCode(200);

        myOrder = await testUtilBuyerNode.rpcWaitFor(orderCommand, [
                orderSearchCommand,
                myTemplate.hash,
                OrderStatus.AWAITING_ESCROW,
                buyerProfile.address,
                sellerProfile.address,
                SearchOrder.ASC
            ],
            60 * 60,
            200,
            // '[0].hash',
            // OrderStatus.AWAITING_ESCROW.toString()
            '[0].OrderItems[0].itemHash',
             myTemplate.hash
        );

        myOrder.expectJson();
        myOrder.expectStatusCode(200);
        myOrder = myOrder.getBody()['result'][0];

        const orderItemStatusRes = await testUtilBuyerNode.rpc(orderItemCommand, [
            orderItemStatusCommand
        ]);

        orderItemStatusRes.expectJson();
        orderItemStatusRes.expectStatusCode(200);
        const myOrderItems = orderItemStatusRes.getBody()['result'];

        // Check we receive order that was accepted
        expect(myOrderItems.length).toBe(1);
        expect(myOrderItems[0].listingItemHash).toBe(myTemplate.hash);
        expect(myOrderItems[0].bidType).toBe(BidMessageType.MPA_ACCEPT);
    });

*/
});
