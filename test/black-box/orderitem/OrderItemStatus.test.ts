// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

// tslint:disable:max-line-length
import * from 'jest';
import * as resources from 'resources';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { OrderItemStatus } from '../../../src/api/enums/OrderItemStatus';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { SearchOrder } from '../../../src/api/enums/SearchOrder';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import {OrderItemStatusResponse} from '../../../src/core/helpers/OrderItemStatusResponse';
// tslint:enable:max-line-length

describe('OrderItemStatus', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtilSellerNode = new BlackBoxTestUtil(randomBoolean ? 0 : 1);  // SELLER
    const testUtilBuyerNode = new BlackBoxTestUtil(randomBoolean ? 1 : 0);

    const templateCommand = Commands.TEMPLATE_ROOT.commandName;
    const templatePostCommand = Commands.TEMPLATE_POST.commandName;
    const templateGetCommand = Commands.TEMPLATE_GET.commandName;
    const listingItemCommand = Commands.ITEM_ROOT.commandName;
    const listingItemGetCommand = Commands.ITEM_GET.commandName;
    const bidCommand = Commands.BID_ROOT.commandName;
    const bidSendCommand = Commands.BID_SEND.commandName;
    const bidSearchCommand = Commands.BID_SEARCH.commandName;
    const bidAcceptCommand = Commands.BID_ACCEPT.commandName;
    const orderCommand = Commands.ORDER_ROOT.commandName;
    const orderSearchCommand = Commands.ORDER_SEARCH.commandName;
    const orderItemCommand = Commands.ORDERITEM_ROOT.commandName;
    const orderItemStatusCommand = Commands.ORDERITEM_STATUS.commandName;

    let sellerProfile: resources.Profile;
    let buyerProfile: resources.Profile;
    let sellerMarket: resources.Market;
    let buyerMarket: resources.Market;

    let listingItemTemplateSellerNode: resources.ListingItemTemplate;
    let listingItemReceivedSellerNode: resources.ListingItem;
    let listingItemReceivedBuyerNode: resources.ListingItem;

    let bidOnBuyerNode: resources.Bid;
    let bidOnSellerNode: resources.Bid;

    let orderOnSellerNode: resources.Order;
    let orderOnBuyerNode: resources.Order;

    const PAGE = 0;
    const PAGE_LIMIT = 10;
    const ORDERING = SearchOrder.ASC;
    const DAYS_RETENTION = 2;

    let sent = false;

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
        log.debug('sellerProfile: ', sellerProfile.address);
        log.debug('buyerProfile: ', buyerProfile.address);

        sellerMarket = await testUtilSellerNode.getDefaultMarket();
        buyerMarket = await testUtilBuyerNode.getDefaultMarket();
        expect(sellerMarket.id).toBeDefined();
        expect(buyerMarket.id).toBeDefined();
        log.debug('sellerMarket: ', JSON.stringify(sellerMarket, null, 2));
        log.debug('buyerMarket: ', JSON.stringify(buyerMarket, null, 2));

        // generate ListingItemTemplate
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,               // generateItemInformation
            true,               // generateItemLocation
            true,               // generateShippingDestinations
            false,              // generateItemImages
            true,               // generatePaymentInformation
            true,               // generateEscrow
            true,               // generateItemPrice
            true,               // generateMessagingInformation
            false,              // generateListingItemObjects
            false,              // generateObjectDatas
            sellerProfile.id,   // profileId
            false,              // generateListingItem
            sellerMarket.id     // marketId
        ]).toParamsArray();

        const listingItemTemplatesSellerNode = await testUtilSellerNode.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplate[];

        listingItemTemplateSellerNode = listingItemTemplatesSellerNode[0];
        expect(listingItemTemplateSellerNode.id).toBeDefined();
        expect(listingItemTemplateSellerNode.hash).toBeDefined();

        // we should be also able to get the ListingItemTemplate
        const res: any = await testUtilSellerNode.rpc(templateCommand, [templateGetCommand,
            listingItemTemplateSellerNode.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.ListingItemTemplate = res.getBody()['result'];
        log.debug('listingItemTemplate.hash:', listingItemTemplateSellerNode.hash);
        log.debug('result.hash:', result.hash);
        expect(result.hash).toBe(listingItemTemplatesSellerNode[0].hash);

        log.debug('==> Setup DONE.');

    });


    test('Should post ListingItem from SELLER node', async () => {

        expect(listingItemTemplateSellerNode).toBeDefined();

        // Post ListingItemTemplate to create ListingItem
        const res = await testUtilSellerNode.rpc(templateCommand, [templatePostCommand,
            listingItemTemplateSellerNode.id,
            DAYS_RETENTION,
            sellerMarket.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        // make sure we got the expected result from posting the template
        const result: any = res.getBody()['result'];
        sent = result.result === 'Sent.';
        if (!sent) {
            log.debug(JSON.stringify(result, null, 2));
        }
        expect(result.result).toBe('Sent.');

        log.debug('==> ListingItemTemplate posted.');
/*
        // wait for ListingItem to be received on the seller node
        res = await testUtilSellerNode.rpcWaitFor(
            listingItemCommand,
            [listingItemGetCommand, listingItemTemplateSellerNode.hash],
            60 * 60,
            200,
            'hash',
            listingItemTemplateSellerNode.hash
        );
        res.expectJson();
        res.expectStatusCode(200);
        listingItemReceivedSellerNode = res.getBody()['result'];

        log.debug('==> ListingItem received on seller node.');

        // wait for ListingItem to be received on the buyer node
        res = await testUtilBuyerNode.rpcWaitFor(
            listingItemCommand,
            [listingItemGetCommand, listingItemTemplateSellerNode.hash],
            60 * 60,
            200,
            'hash',
            listingItemTemplateSellerNode.hash
        );
        res.expectJson();
        res.expectStatusCode(200);
        listingItemReceivedBuyerNode = res.getBody()['result'];

        log.debug('==> ListingItem received on buyer node.');
*/
    }, 600000); // timeout to 600s

    test('Should get the updated ListingItemTemplate with the hash', async () => {
        const res: any = await testUtilSellerNode.rpc(templateCommand, [templateGetCommand,
            listingItemTemplateSellerNode.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        listingItemTemplateSellerNode = res.getBody()['result'];

        expect(listingItemTemplateSellerNode.hash).toBeDefined();
        log.debug('listingItemTemplateSellerNode.hash: ', listingItemTemplateSellerNode.hash);

    });

    test('Should have received ListingItem (MPA_LISTING_ADD) on SELLER node, ListingItem is created', async () => {

        // sending should have succeeded for this test to work
        expect(sent).toBeTruthy();

        log.debug('========================================================================================');
        log.debug('SELLER RECEIVES MPA_LISTING_ADD posted from sellers node, ListingItem is created and matched with the existing ListingItemTemplate');
        log.debug('========================================================================================');

        let response: any = await testUtilSellerNode.rpcWaitFor(listingItemCommand,
            [listingItemGetCommand, listingItemTemplateSellerNode.hash],
            15 * 60,
            200,
            'hash',
            listingItemTemplateSellerNode.hash
        );
        response.expectJson();
        response.expectStatusCode(200);

        // sometimes result.ListingItemTemplate is undefined, this is likely because we
        // just received the ListingItem and it hasn't been linked with the ListingItemTemplate yet.
        // so, we wait some time and fetch it again..
        await testUtilSellerNode.waitFor(5);

        response = await testUtilSellerNode.rpc(listingItemCommand, [listingItemGetCommand,
            listingItemTemplateSellerNode.hash
        ]);
        response.expectJson();
        response.expectStatusCode(200);

        const result: resources.ListingItem = response.getBody()['result'];
        expect(result).toBeDefined();
        log.debug('result.hash: ', result.hash);
        log.debug('listingItemTemplatesSellerNode[0].hash: ', listingItemTemplateSellerNode.hash);
        log.debug('result.ListingItemTemplate.hash: ', listingItemTemplateSellerNode.hash);
        expect(result.hash).toBe(listingItemTemplateSellerNode.hash);
        expect(result.ListingItemTemplate.hash).toBe(listingItemTemplateSellerNode.hash);

        // store ListingItem for later tests
        listingItemReceivedSellerNode = result;

        log.debug('==> SELLER received MPA_LISTING_ADD.');

    }, 600000); // timeout to 600s


    test('Should have received ListingItem (MPA_LISTING_ADD) on BUYER node, ListingItem is created', async () => {

        // ListingItem should have been received on seller node
        expect(listingItemReceivedSellerNode).toBeDefined();

        // sending should have succeeded for this test to work
        expect(sent).toBeTruthy();

        log.debug('========================================================================================');
        log.debug('BUYER RECEIVES MPA_LISTING_ADD posted from sellers node, ListingItem is created');
        log.debug('========================================================================================');

        let response: any = await testUtilBuyerNode.rpcWaitFor(
            listingItemCommand,
            [listingItemGetCommand, listingItemTemplateSellerNode.hash],
            15 * 60,
            200,
            'hash',
            listingItemTemplateSellerNode.hash
        );
        response.expectJson();
        response.expectStatusCode(200);

        // seller node allready received this, but wait a while, and refetch, just in case
        await testUtilBuyerNode.waitFor(5);

        response = await testUtilBuyerNode.rpc(listingItemCommand, [listingItemGetCommand,
            listingItemTemplateSellerNode.hash
        ]);
        response.expectJson();
        response.expectStatusCode(200);

        const result: resources.ListingItem = response.getBody()['result'];
        expect(result).toBeDefined();
        expect(result.hash).toBe(listingItemTemplateSellerNode.hash);

        // store ListingItem for later tests
        listingItemReceivedBuyerNode = result;

        log.debug('==> BUYER received MPA_LISTING_ADD.');

    }, 600000); // timeout to 600s


    test('Should return an empty OrderItemStatus list since there are no Bids or Orders yet', async () => {

        expect(listingItemReceivedBuyerNode).toBeDefined();

        // wait for some time to make sure the Bid has been created
        await testUtilBuyerNode.waitFor(5);

        const res = await testUtilBuyerNode.rpc(orderItemCommand, [
            orderItemStatusCommand
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const myOrderItems = res.getBody()['result'];
        expect(myOrderItems.length).toBe(0);

        log.debug('==> Got empty result.');

    });


    test('Should post Bid (MPA_BID) from BUYER node', async () => {

        expect(listingItemReceivedBuyerNode).toBeDefined();
        sent = false;

        const res = await testUtilBuyerNode.rpc(bidCommand, [bidSendCommand,
            listingItemReceivedBuyerNode.hash,
            buyerProfile.id,
            buyerProfile.ShippingAddresses[0].id,
            'colour',
            'black',
            'size',
            'xl'
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        sent = result.result === 'Sent.';
        if (!sent) {
            log.debug(JSON.stringify(result, null, 2));
        }
        expect(result.result).toBe('Sent.');

        log.debug('==> Bid posted.');

    });


    test('Should have created Bid on BUYER node after posting the MPA_BID', async () => {

        expect(sent).toBeTruthy();
        expect(listingItemReceivedBuyerNode).toBeDefined();

        // wait for some time to make sure the Bid has been created
        await testUtilBuyerNode.waitFor(5);

        const res: any = await testUtilBuyerNode.rpc(bidCommand, [bidSearchCommand,
            PAGE, PAGE_LIMIT, ORDERING,
            listingItemReceivedBuyerNode.hash,
            MPAction.MPA_BID,
            '*',
            buyerProfile.address
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Bid = res.getBody()['result'];

        log.debug('result: ', JSON.stringify(result, null, 2));
        expect(result.length).toBe(1);
        expect(result[0].type).toBe(MPAction.MPA_BID);
        expect(result[0].ListingItem.hash).toBe(listingItemReceivedBuyerNode.hash);
        expect(result[0].bidder).toBe(buyerProfile.address);
        expect(result[0].ListingItem.seller).toBe(sellerProfile.address);

        // there should be no relation to template on the buyer side
        expect(result[0].ListingItem.ListingItemTemplate).not.toBeDefined();
        bidOnBuyerNode = result[0];

        // expect Order and OrderItem to be created
        expect(result[0].OrderItem.id).toBeDefined();
        expect(result[0].OrderItem.Order.id).toBeDefined();

        log.debug('==> Bid found on buyer node.');

    }, 600000); // timeout to 600s


    test('Should have received Bid (MPA_BID) on SELLER node', async () => {

        expect(sent).toBeTruthy();

        // Bid should have been created on buyer node
        expect(bidOnBuyerNode).toBeDefined();

        log.debug('========================================================================================');
        log.debug('SELLER RECEIVES MPA_BID posted from buyers node');
        log.debug('========================================================================================');

        // wait for some time to make sure the Bid has been created
        await testUtilSellerNode.waitFor(5);

        const res: any = await testUtilSellerNode.rpcWaitFor(
            bidCommand,
            [
                bidSearchCommand,
                PAGE, PAGE_LIMIT, ORDERING,
                listingItemReceivedBuyerNode.hash,
                MPAction.MPA_BID,
                '*',
                buyerProfile.address
            ],
            8 * 60,
            200,
            '[0].type',
            MPAction.MPA_BID.toString()
        );
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Bid = res.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].type).toBe(MPAction.MPA_BID);
        expect(result[0].bidder).toBe(buyerProfile.address);
        expect(result[0].ListingItem).toBeDefined();
        expect(result[0].ListingItem.seller).toBe(sellerProfile.address);
        expect(result[0].ListingItem.hash).toBe(listingItemReceivedSellerNode.hash);

        // there should be a relation to template on the seller side
        expect(result[0].ListingItem.ListingItemTemplate).toBeDefined();

        // the relation should match the hash of the template that was created earlier on seller node
        expect(result[0].ListingItem.ListingItemTemplate.hash).toBe(listingItemTemplateSellerNode.hash);

        // todo: check for correct biddata
        bidOnSellerNode = result[0];
        log.debug('bidOnSellerNode: ', JSON.stringify(bidOnSellerNode, null, 2));

        // expect Order and OrderItem to be created
        expect(result[0].OrderItem.id).toBeDefined();
        expect(result[0].OrderItem.Order.id).toBeDefined();

        log.debug('==> SELLER received MPA_BID.');

    }, 600000); // timeout to 600s


    test('Should get OrderItemStatus from BUYER node (bidtype=MPA_BID)', async () => {

        expect(sent).toBeTruthy();
        expect(bidOnBuyerNode).toBeDefined();

        // wait for some time to make sure the Bid has been created
        await testUtilBuyerNode.waitFor(5);

        const orderItemStatusRes = await testUtilBuyerNode.rpc(orderItemCommand, [
            orderItemStatusCommand
        ]);

        orderItemStatusRes.expectJson();
        orderItemStatusRes.expectStatusCode(200);

        const myOrderItems: OrderItemStatusResponse[] = orderItemStatusRes.getBody()['result'];

        // Check we receive order that was bid upon
        expect(myOrderItems.length).toBe(1);
        expect(myOrderItems[0].listingItemHash).toBe(listingItemReceivedBuyerNode.hash);
        expect(myOrderItems[0].bidType).toBe(MPAction.MPA_BID);
        expect(myOrderItems[0].buyer).toBe(buyerProfile.address);
        expect(myOrderItems[0].seller).toBe(sellerProfile.address);

        log.debug('==> Correct status got from buyer node.');

    });


    test('Should get OrderItemStatus from SELLER node (bidtype=MPA_BID)', async () => {

        expect(sent).toBeTruthy();
        expect(bidOnSellerNode).toBeDefined();

        // wait for some time to make sure the Bid has been created
        await testUtilSellerNode.waitFor(5);

        const orderItemStatusRes = await testUtilSellerNode.rpc(orderItemCommand, [
            orderItemStatusCommand
        ]);

        orderItemStatusRes.expectJson();
        orderItemStatusRes.expectStatusCode(200);

        const myOrderItems: OrderItemStatusResponse[] = orderItemStatusRes.getBody()['result'];

        // Check we receive order that was bid upon
        expect(myOrderItems.length).toBe(1);
        expect(myOrderItems[0].listingItemHash).toBe(listingItemReceivedBuyerNode.hash);
        expect(myOrderItems[0].bidType).toBe(MPAction.MPA_BID);
        expect(myOrderItems[0].buyer).toBe(buyerProfile.address);
        expect(myOrderItems[0].seller).toBe(sellerProfile.address);

        // log.debug('myOrderItems: ', JSON.stringify(myOrderItems, null, 2));
        log.debug('==> Correct status: MPA_BID got from seller node.');

    });


    test('Should post MPA_ACCEPT from SELLER node', async () => {

        // Bid should have been created on seller node
        expect(bidOnSellerNode).toBeDefined();
        sent = false;

        await testUtilSellerNode.waitFor(5);

        const response: any = await testUtilSellerNode.rpc(bidCommand, [bidAcceptCommand,
            bidOnSellerNode.id
        ]);
        response.expectJson();
        response.expectStatusCode(200);

        // make sure we got the expected result from posting the bid
        const result: any = response.getBody()['result'];
        sent = result.result === 'Sent.';
        if (!sent) {
            log.debug(JSON.stringify(result, null, 2));
        }
        expect(result.result).toBe('Sent.');

        log.debug('==[ accept Bid /// seller (node1) -> buyer (node2) ]=============================');
        log.debug('msgid: ' + result.msgid);
        log.debug('item.hash: ' + bidOnSellerNode.ListingItem.hash);
        log.debug('bid.id: ' + bidOnSellerNode.id);
        log.debug('bid.bidder: ' + bidOnSellerNode.bidder);
        log.debug('bid.ListingItem.seller: ' + bidOnSellerNode.ListingItem.seller);
        log.debug('=================================================================================');

    }, 600000); // timeout to 600s


    test('Should find MPA_ACCEPT on SELLER node after posting the MPA_ACCEPT', async () => {

        expect(sent).toBeTruthy();

        log.debug('========================================================================================');
        log.debug('Bid should have been updated on seller node after posting the MPA_ACCEPT');
        log.debug('========================================================================================');

        // wait for some time to make sure the Bid has been updated
        await testUtilSellerNode.waitFor(5);

        const res: any = await testUtilSellerNode.rpcWaitFor(
            bidCommand,
            [
                bidSearchCommand,
                PAGE, PAGE_LIMIT, ORDERING,
                bidOnSellerNode.ListingItem.hash,
                MPAction.MPA_ACCEPT,
                '*',
                buyerProfile.address
            ],
            8 * 60,
            200,
            '[0].type',
            MPAction.MPA_ACCEPT.toString()
        );
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Bid = res.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].type).toBe(MPAction.MPA_ACCEPT);
        expect(result[0].ListingItem.hash).toBe(bidOnSellerNode.ListingItem.hash);
        expect(result[0].bidder).toBe(buyerProfile.address);
        expect(result[0].ListingItem.seller).toBe(sellerProfile.address);

        // there should be a relation to template on the seller side
        expect(result[0].ListingItem.ListingItemTemplate.hash).toBe(listingItemTemplateSellerNode.hash);

        bidOnSellerNode = result[0];

        log.debug('==> Bid updated on SELLER node.');
    });


    test('Should get OrderItemStatus from SELLER node (bidtype=MPA_ACCEPT, orderStatus=AWAITING_ESCROW)', async () => {

        expect(sent).toBeTruthy();
        expect(bidOnSellerNode).toBeDefined();

        // wait for some time to make sure the Bid has been created
        await testUtilSellerNode.waitFor(5);

        const orderItemStatusRes = await testUtilSellerNode.rpc(orderItemCommand, [
            orderItemStatusCommand
        ]);

        orderItemStatusRes.expectJson();
        orderItemStatusRes.expectStatusCode(200);

        const myOrderItems: OrderItemStatusResponse[] = orderItemStatusRes.getBody()['result'];

        log.debug('myOrderItems: ', JSON.stringify(myOrderItems, null, 2));
        // Check we receive order that was bid upon
        expect(myOrderItems.length).toBe(1);
        expect(myOrderItems[0].listingItemHash).toBe(listingItemReceivedBuyerNode.hash);
        expect(myOrderItems[0].bidType).toBe(MPAction.MPA_ACCEPT);
        expect(myOrderItems[0].orderStatus).toBe(OrderItemStatus.AWAITING_ESCROW);
        expect(myOrderItems[0].buyer).toBe(buyerProfile.address);
        expect(myOrderItems[0].seller).toBe(sellerProfile.address);

        // log.debug('myOrderItems: ', JSON.stringify(myOrderItems, null, 2));

        log.debug('==> Correct status: MPA_ACCEPT got from seller node.');

    });


    test('Order should have been created on SELLER node after posting the MPA_ACCEPT', async () => {

        expect(sent).toBeTruthy();
        expect(bidOnSellerNode).toBeDefined();

        // wait for some time to make sure the Order has been created
        await testUtilSellerNode.waitFor(5);

        const res: any = await testUtilSellerNode.rpc(orderCommand, [orderSearchCommand,
            bidOnSellerNode.ListingItem.hash,
            OrderItemStatus.AWAITING_ESCROW,
            buyerProfile.address,
            sellerProfile.address,
            SearchOrder.ASC
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Order = res.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].hash).toBeDefined(); // TODO: should match bidOnSellerNode.BidDatas[orderHash]
        expect(result[0].buyer).toBe(buyerProfile.address);
        expect(result[0].seller).toBe(sellerProfile.address);
        expect(result[0].OrderItems).toHaveLength(1);
        expect(result[0].OrderItems[0].status).toBe(OrderItemStatus.AWAITING_ESCROW);
        expect(result[0].OrderItems[0].itemHash).toBe(bidOnSellerNode.ListingItem.hash);

        orderOnSellerNode = result[0];

        log.debug('==> Order created on SELLER node.');

    }, 600000); // timeout to 600s


    test('Should receive MPA_ACCEPT on BUYER node after posting the MPA_ACCEPT', async () => {

        expect(sent).toBeTruthy();
        expect(bidOnSellerNode).toBeDefined();
        expect(orderOnSellerNode).toBeDefined();

        await testUtilBuyerNode.waitFor(5);

        // TODO: when we first get the template hash, store it in originalTemplateHash
        // and use that for searches and expects
        // same for other similar cases...
        const res: any = await testUtilBuyerNode.rpcWaitFor(
            bidCommand,
            [
                bidSearchCommand,
                PAGE, PAGE_LIMIT, ORDERING,
                bidOnBuyerNode.ListingItem.hash,
                MPAction.MPA_ACCEPT,
                '*',
                buyerProfile.address
            ],
            8 * 60,
            200,
            '[0].type',
            MPAction.MPA_ACCEPT.toString()
        );
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Bid = res.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].type).toBe(MPAction.MPA_ACCEPT);
        expect(result[0].bidder).toBe(buyerProfile.address);
        expect(result[0].ListingItem.seller).toBe(sellerProfile.address);
        expect(result[0].ListingItem.hash).toBe(listingItemReceivedSellerNode.hash);

        // there should be no relation to template on the buyer side
        expect(result[0].ListingItem.ListingItemTemplate).not.toBeDefined();

        bidOnBuyerNode = result[0];

        log.debug('==> BUYER received MPA_ACCEPT.');
    }, 600000); // timeout to 600s


    test('Should have created Order on BUYER node after posting the MPA_ACCEPT', async () => {

        expect(sent).toBeTruthy();
        expect(bidOnSellerNode.type).toBe(MPAction.MPA_ACCEPT);
        expect(orderOnSellerNode).toBeDefined();
        expect(bidOnBuyerNode.type).toBe(MPAction.MPA_ACCEPT);

        // wait for some time to make sure the Order has been created
        await testUtilBuyerNode.waitFor(5);

        const res: any = await testUtilBuyerNode.rpc(orderCommand, [orderSearchCommand,
            bidOnBuyerNode.ListingItem.hash,
            OrderItemStatus.AWAITING_ESCROW,
            buyerProfile.address,
            sellerProfile.address,
            SearchOrder.ASC
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Order = res.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].hash).toBeDefined(); // TODO: bidNode1.BidDatas[orderHash]
        expect(result[0].buyer).toBe(buyerProfile.address);
        expect(result[0].seller).toBe(sellerProfile.address);
        expect(result[0].OrderItems).toHaveLength(1);
        expect(result[0].OrderItems[0].status).toBe(OrderItemStatus.AWAITING_ESCROW);
        expect(result[0].OrderItems[0].itemHash).toBe(bidOnSellerNode.ListingItem.hash);

        orderOnBuyerNode = result[0];

        log.debug('==> Order created on BUYER node.');
    });

    test('Should get OrderItemStatus from BUYER node (bidtype=MPA_ACCEPT, orderStatus=AWAITING_ESCROW)', async () => {

        expect(sent).toBeTruthy();
        expect(bidOnSellerNode.type).toBe(MPAction.MPA_ACCEPT);
        expect(orderOnSellerNode).toBeDefined();
        expect(bidOnBuyerNode.type).toBe(MPAction.MPA_ACCEPT);

        // wait for some time to make sure the Bid has been created
        await testUtilSellerNode.waitFor(5);

        const res = await testUtilSellerNode.rpc(orderItemCommand, [
            orderItemStatusCommand
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const myOrderItems: OrderItemStatusResponse[] = res.getBody()['result'];

        // Check we receive order that was bid upon
        expect(myOrderItems.length).toBe(1);
        expect(myOrderItems[0].listingItemHash).toBe(listingItemReceivedBuyerNode.hash);
        expect(myOrderItems[0].bidType).toBe(MPAction.MPA_ACCEPT);
        expect(myOrderItems[0].orderStatus).toBe(OrderItemStatus.AWAITING_ESCROW);
        expect(myOrderItems[0].buyer).toBe(buyerProfile.address);
        expect(myOrderItems[0].seller).toBe(sellerProfile.address);

        // log.debug('myOrderItems: ', JSON.stringify(myOrderItems, null, 2));
        log.debug('==> Correct status got from seller node.');

    });

});
