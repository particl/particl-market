// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { Logger as LoggerType } from '../../src/core/Logger';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Commands } from '../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { GenerateListingItemTemplateParams } from '../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { SearchOrder } from '../../src/api/enums/SearchOrder';
import { OrderItemStatus } from 'OrderItemStatus.ts';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';

describe('Happy Buy Flow', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    // const testUtilNode0 = new BlackBoxTestUtil(0);
    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtilSellerNode = new BlackBoxTestUtil(randomBoolean ? 0 : 1);  // SELLER
    const testUtilBuyerNode = new BlackBoxTestUtil(randomBoolean ? 1 : 0);  // BUYER

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
    const escrowCommand = Commands.ESCROW_ROOT.commandName;
    const escrowLockCommand = Commands.ESCROW_LOCK.commandName;
    const escrowReleaseCommand = Commands.ESCROW_RELEASE.commandName;
    const daemonCommand = Commands.DAEMON_ROOT.commandName;

    let sellerProfile: resources.Profile;
    let buyerProfile: resources.Profile;

    let sellerMarket: resources.Market;
    let buyerMarket: resources.Market;

    let listingItemTemplatesSellerNode: resources.ListingItemTemplate[];
    let listingItemReceivedSellerNode: resources.ListingItem;
    let listingItemReceivedBuyerNode: resources.ListingItem;

    let bidOnSellerNode: resources.Bid;
    let bidOnBuyerNode: resources.Bid;

    let orderOnSellerNode: resources.Order;
    let orderOnBuyerNode: resources.Order;

    const PAGE = 0;
    const PAGE_LIMIT = 10;
    const ORDERING = SearchOrder.ASC;
    const DAYS_RETENTION = 2;

    let sent = false;

    beforeAll(async () => {

        await testUtilSellerNode.cleanDb();
        await testUtilBuyerNode.cleanDb();

        log.debug('SELLER IS NODE' + (randomBoolean ? 1 : 2));
        log.debug('BUYER IS NODE' + (randomBoolean ? 2 : 1));

        // get seller and buyer profiles
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
        listingItemTemplatesSellerNode = await testUtilSellerNode.generateData(
            CreatableModel.LISTINGITEMTEMPLATE,     // what to generate
            1,                              // how many to generate
            true,                       // return model
            generateListingItemTemplateParams       // what kind of data to generate
        ) as resources.ListingItemTemplates[];
        expect(listingItemTemplatesSellerNode[0].id).toBeDefined();
        expect(listingItemTemplatesSellerNode[0].hash).toBeDefined();

        // we should be also able to get the ListingItemTemplate
        let res: any = await testUtilSellerNode.rpc(templateCommand, [templateGetCommand,
            listingItemTemplatesSellerNode[0].id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.ListingItemTemplate = res.getBody()['result'];
        log.debug('listingItemTemplates[0].hash:', listingItemTemplatesSellerNode[0].hash);
        log.debug('result.hash:', result.hash);
        expect(result.hash).toBe(listingItemTemplatesSellerNode[0].hash);

        // start with clean outputs in case something went wrong earlier
        res = await testUtilSellerNode.rpc(daemonCommand, ['lockunspent', true]);
        res.expectJson();
        res.expectStatusCode(200);

        res = await testUtilBuyerNode.rpc(daemonCommand, ['lockunspent', true]);
        res.expectJson();
        res.expectStatusCode(200);

    });

    test('Should post ListingItem from SELLER node', async () => {

        log.debug('========================================================================================');
        log.debug('SELLER POSTS MPA_LISTING_ADD');
        log.debug('========================================================================================');

        await testUtilSellerNode.waitFor(5);

        const res: any = await testUtilSellerNode.rpc(templateCommand, [templatePostCommand,
            listingItemTemplatesSellerNode[0].id,
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

        log.debug('==[ posted ListingItemTemplate /// seller -> market ]================================');
        log.debug('result.msgid: ' + result.msgid);
        log.debug('item.id: ' + listingItemTemplatesSellerNode[0].id);
        log.debug('item.hash: ' + listingItemTemplatesSellerNode[0].hash);
        log.debug('item.title: ' + listingItemTemplatesSellerNode[0].ItemInformation.title);
        log.debug('item.desc: ' + listingItemTemplatesSellerNode[0].ItemInformation.shortDescription);
        log.debug('item.category: [' + listingItemTemplatesSellerNode[0].ItemInformation.ItemCategory.id + '] '
            + listingItemTemplatesSellerNode[0].ItemInformation.ItemCategory.name);
        log.debug('========================================================================================');

    });

    test('Should have received ListingItem (MPA_LISTING_ADD) on SELLER node, ListingItem is created', async () => {

        // sending should have succeeded for this test to work
        expect(sent).toBeTruthy();

        log.debug('========================================================================================');
        log.debug('SELLER RECEIVES MPA_LISTING_ADD posted from sellers node, ListingItem is created and matched with the existing ListingItemTemplate');
        log.debug('========================================================================================');

        let response: any = await testUtilSellerNode.rpcWaitFor(listingItemCommand,
            [listingItemGetCommand, listingItemTemplatesSellerNode[0].hash],
            15 * 60,
            200,
            'hash',
            listingItemTemplatesSellerNode[0].hash
        );
        response.expectJson();
        response.expectStatusCode(200);

        // sometimes result.ListingItemTemplate is undefined, this is likely because we
        // just received the ListingItem and it hasn't been linked with the ListingItemTemplate yet.
        // so, we wait some time and fetch it again..
        await testUtilSellerNode.waitFor(5);

        response = await testUtilSellerNode.rpc(listingItemCommand, [listingItemGetCommand,
            listingItemTemplatesSellerNode[0].hash
        ]);
        response.expectJson();
        response.expectStatusCode(200);

        const result: resources.ListingItem = response.getBody()['result'];
        expect(result).toBeDefined();
        log.debug('result.hash: ', result.hash);
        log.debug('listingItemTemplatesSellerNode[0].hash: ', listingItemTemplatesSellerNode[0].hash);
        log.debug('result.ListingItemTemplate.hash: ', listingItemTemplatesSellerNode[0].hash);
        expect(result.hash).toBe(listingItemTemplatesSellerNode[0].hash);
        expect(result.ListingItemTemplate.hash).toBe(listingItemTemplatesSellerNode[0].hash);

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
            [listingItemGetCommand, listingItemTemplatesSellerNode[0].hash],
            15 * 60,
            200,
            'hash',
            listingItemTemplatesSellerNode[0].hash
        );
        response.expectJson();
        response.expectStatusCode(200);

        // seller node allready received this, but wait a while, and refetch, just in case
        await testUtilBuyerNode.waitFor(5);

        response = await testUtilBuyerNode.rpc(listingItemCommand, [listingItemGetCommand,
            listingItemTemplatesSellerNode[0].hash
        ]);
        response.expectJson();
        response.expectStatusCode(200);

        const result: resources.ListingItem = response.getBody()['result'];
        expect(result).toBeDefined();
        expect(result.hash).toBe(listingItemTemplatesSellerNode[0].hash);

        // store ListingItem for later tests
        listingItemReceivedBuyerNode = result;

        log.debug('==> BUYER received MPA_LISTING_ADD.');

    }, 600000); // timeout to 600s

    test('Should post Bid (MPA_BID) from BUYER node', async () => {

        // ListingItem should have been received on buyer node
        expect(listingItemReceivedBuyerNode).toBeDefined();
        sent = false;

        log.debug('========================================================================================');
        log.debug('BUYER POSTS MPA_BID for the ListingItem to the seller');
        log.debug('========================================================================================');

        const res: any = await testUtilBuyerNode.rpc(bidCommand, [bidSendCommand,
            listingItemReceivedBuyerNode.hash,
            buyerProfile.id,
            buyerProfile.ShippingAddresses[0].id,
            'colour',   // TODO: make sure created template/item has these options and test that these end up in the Order
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

        log.debug('==[ sent Bid /// buyer node -> seller node ]===================================');
        log.debug('msgid: ' + result.msgid);
        log.debug('item.hash: ' + listingItemReceivedBuyerNode.hash);
        log.debug('item.seller: ' + listingItemReceivedBuyerNode.seller);
        log.debug('bid.bidder: ' + buyerProfile.address);
        log.debug('===============================================================================');

    });

    test('Should have created Bid on BUYER node after posting the MPA_BID', async () => {

        expect(sent).toBeTruthy();

        log.debug('========================================================================================');
        log.debug('Bid should have been created on buyer node after posting the MPA_BID');
        log.debug('========================================================================================');

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
        expect(result.length).toBe(1);
        expect(result[0].action).toBe(MPAction.MPA_BID);
        expect(result[0].ListingItem.hash).toBe(listingItemReceivedBuyerNode.hash);
        expect(result[0].bidder).toBe(buyerProfile.address);
        expect(result[0].ListingItem.seller).toBe(sellerProfile.address);

        // there should be no relation to template on the buyer side
        expect(result[0].ListingItem.ListingItemTemplate).not.toBeDefined();

        bidOnBuyerNode = result[0];

        log.debug('==> Bid created on BUYER node.');

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
            '[0].action',
            MPAction.MPA_BID.toString()
        );
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Bid = res.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].action).toBe(MPAction.MPA_BID);
        expect(result[0].bidder).toBe(buyerProfile.address);
        expect(result[0].ListingItem).toBeDefined();
        expect(result[0].ListingItem.seller).toBe(sellerProfile.address);
        expect(result[0].ListingItem.hash).toBe(listingItemReceivedSellerNode.hash);

        // there should be a relation to template on the seller side
        expect(result[0].ListingItem.ListingItemTemplate).toBeDefined();

        // the relation should match the hash of the template that was created earlier on seller node
        expect(result[0].ListingItem.ListingItemTemplate.hash).toBe(listingItemTemplatesSellerNode[0].hash);

        // todo: check for correct biddata
        bidOnSellerNode = result[0];

        log.debug('==> SELLER received MPA_BID.');

    }, 600000); // timeout to 600s

    test('Should post MPA_ACCEPT from SELLER node', async () => {

        // Bid should have been created on seller node
        expect(bidOnSellerNode).toBeDefined();
        sent = false;

        log.debug('========================================================================================');
        log.debug('SELLER POSTS MPA_ACCEPT');
        log.debug('========================================================================================');

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

        log.debug('==[ sent accept Bid /// seller (node1) -> buyer (node2) ]=============================');
        log.debug('msgid: ' + result.msgid);
        log.debug('item.hash: ' + bidOnSellerNode.ListingItem.hash);
        log.debug('bid.id: ' + bidOnSellerNode.id);
        log.debug('bid.bidder: ' + bidOnSellerNode.bidder);
        log.debug('bid.ListingItem.seller: ' + bidOnSellerNode.ListingItem.seller);
        log.debug('=================================================================================');

    }, 600000); // timeout to 600s

    test('Should have updated Bid on SELLER node after posting the MPA_ACCEPT', async () => {

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
            '[0].action',
            MPAction.MPA_ACCEPT.toString()
        );
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Bid = res.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].action).toBe(MPAction.MPA_ACCEPT);
        expect(result[0].ListingItem.hash).toBe(bidOnSellerNode.ListingItem.hash);
        expect(result[0].bidder).toBe(buyerProfile.address);
        expect(result[0].ListingItem.seller).toBe(sellerProfile.address);

        // there should be a relation to template on the seller side
        expect(result[0].ListingItem.ListingItemTemplate.hash).toBe(listingItemTemplatesSellerNode[0].hash);

        bidOnSellerNode = result[0];

        log.debug('==> Bid updated on SELLER node.');
    });

    test('Should have created Order on SELLER node after posting the MPA_ACCEPT', async () => {

        expect(sent).toBeTruthy();
        expect(bidOnSellerNode).toBeDefined();

        log.debug('========================================================================================');
        log.debug('Order should have been created on seller node after posting the MPA_ACCEPT');
        log.debug('========================================================================================');

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

    test('Should have updated Bid on BUYER node after posting the MPA_ACCEPT', async () => {

        expect(sent).toBeTruthy();
        expect(bidOnSellerNode).toBeDefined();
        expect(orderOnSellerNode).toBeDefined();

        log.debug('========================================================================================');
        log.debug('BUYER RECEIVES MPA_ACCEPT posted from sellers node, MPAction.MPA_ACCEPT');
        log.debug('========================================================================================');

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
            '[0].action',
            MPAction.MPA_ACCEPT.toString()
        );
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Bid = res.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].action).toBe(MPAction.MPA_ACCEPT);
        expect(result[0].bidder).toBe(buyerProfile.address);
        expect(result[0].ListingItem.seller).toBe(sellerProfile.address);
        expect(result[0].ListingItem.hash).toBe(listingItemReceivedSellerNode.hash);

        // there should be no relation to template on the buyer side
        expect(result[0].ListingItem.ListingItemTemplate).not.toBeDefined();

        // todo: check for correct biddata
        bidOnBuyerNode = result[0];

        log.debug('==> BUYER received MPA_ACCEPT.');
    }, 600000); // timeout to 600s

    test('Should have created Order on BUYER node after posting the MPA_ACCEPT', async () => {

        expect(sent).toBeTruthy();
        expect(bidOnSellerNode).toBeDefined();
        expect(orderOnSellerNode).toBeDefined();
        expect(bidOnBuyerNode).toBeDefined();

        log.debug('========================================================================================');
        log.debug('Order should have been created on buyer node after receiving the MPA_ACCEPT, OrderItemStatus.AWAITING_ESCROW');
        log.debug('========================================================================================');

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

    test('Should find Bids on BUYER node using the OrderItemStatus.AWAITING_ESCROW', async () => {

        expect(sent).toBeTruthy();
        expect(bidOnSellerNode).toBeDefined();
        expect(orderOnSellerNode).toBeDefined();
        expect(bidOnBuyerNode).toBeDefined();
        expect(orderOnBuyerNode).toBeDefined();

        log.debug('========================================================================================');
        log.debug('Bid should now be found using OrderItemStatus');
        log.debug('========================================================================================');

        // wait for some time to make sure the Order has been created
        await testUtilBuyerNode.waitFor(5);

        const response: any = await testUtilBuyerNode.rpc(bidCommand, [bidSearchCommand,
            PAGE, PAGE_LIMIT, ORDERING,
            bidOnBuyerNode.ListingItem.hash,
            OrderItemStatus.AWAITING_ESCROW
        ]);
        response.expectJson();
        response.expectStatusCode(200);

        const result: any = response.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].action).toBe(MPAction.MPA_ACCEPT);
        expect(result[0].ListingItem.hash).toBe(bidOnBuyerNode.ListingItem.hash);
        expect(result[0].OrderItem.status).toBe(OrderItemStatus.AWAITING_ESCROW);

        bidOnBuyerNode = result[0];

        log.debug('==> Updated Bid found on BUYER node.');
    });

    test('Should post MPA_LOCK from BUYER node', async () => {

        expect(bidOnBuyerNode.OrderItem.status).toBe(OrderItemStatus.AWAITING_ESCROW);
        sent = false;

        log.debug('========================================================================================');
        log.debug('BUYER POSTS MPA_LOCK');
        log.debug('========================================================================================');

        const res: any = await testUtilBuyerNode.rpc(escrowCommand, [escrowLockCommand,
            orderOnBuyerNode.OrderItems[0].id,
            'random-nonce-nse',
            'WANTITPLEASETAKEMYMONEYS!'
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        // make sure we got the expected result from posting the bid
        const result: any = res.getBody()['result'];
        sent = result.result === 'Sent.';
        if (!sent) {
            log.debug(JSON.stringify(result, null, 2));
        }
        expect(result.result).toBe('Sent.');

        log.debug('==[ lock Escrow /// buyer (node2) -> seller (node1) ]============================');
        log.debug('msgid: ' + result.msgid);
        log.debug('order.hash: ' + orderOnBuyerNode.hash);
        log.debug('order.buyer: ' + orderOnBuyerNode.buyer);
        log.debug('order.seller: ' + orderOnBuyerNode.seller);
        log.debug('order.id: ' + orderOnBuyerNode.id);
        log.debug('order.orderItem.id: ' + orderOnBuyerNode.OrderItems[0].id);
        log.debug('=================================================================================');

    });

    test('Should have updated Order on BUYER node after posting the MPA_LOCK, OrderItemStatus.ESCROW_LOCKED', async () => {

        expect(sent).toBeTruthy();

        log.debug('========================================================================================');
        log.debug('Order should have been updated on buyer node after posting the MPA_LOCK, OrderItemStatus.ESCROW_LOCKED');
        log.debug('========================================================================================');

        await testUtilBuyerNode.waitFor(5);

        const res: any = await testUtilBuyerNode.rpc(orderCommand, [orderSearchCommand,
            bidOnBuyerNode.ListingItem.hash,
            OrderItemStatus.ESCROW_LOCKED,
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
        expect(result[0].OrderItems[0].status).toBe(OrderItemStatus.ESCROW_LOCKED);
        expect(result[0].OrderItems[0].itemHash).toBe(bidOnSellerNode.ListingItem.hash);

        orderOnBuyerNode = result[0];

        log.debug('==> Updated Bid found on BUYER node.');
    });

    test('Should have updated Order on SELLER node after receiving MPA_LOCK, OrderItemStatus.ESCROW_LOCKED', async () => {

        expect(sent).toBeTruthy();
        expect(orderOnBuyerNode).toBeDefined();
        expect(orderOnBuyerNode.OrderItems[0].status).toBe(OrderItemStatus.ESCROW_LOCKED);

        log.debug('========================================================================================');
        log.debug('SELLER RECEIVES MPA_LOCK posted from buyers node, OrderItemStatus.ESCROW_LOCKED');
        log.debug('========================================================================================');

        const res: any = await testUtilSellerNode.rpcWaitFor(
            orderCommand,
            [
                orderSearchCommand,
                bidOnSellerNode.ListingItem.hash,
                OrderItemStatus.ESCROW_LOCKED,
                buyerProfile.address,
                sellerProfile.address,
                SearchOrder.ASC
            ],
            8 * 60,
            200,
            '[0].OrderItems[0].status',
            OrderItemStatus.ESCROW_LOCKED.toString()
        );
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Order = res.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].OrderItems[0].status).toBe(OrderItemStatus.ESCROW_LOCKED);
        expect(result[0].buyer).toBe(buyerProfile.address);
        expect(result[0].seller).toBe(sellerProfile.address);

        orderOnSellerNode = result[0];

        log.debug('==> SELLER received MPA_LOCK.');

    }, 600000); // timeout to 600s

    test('Should post MPA_RELEASE from SELLER node, indicating that the item has been sent', async () => {

        expect(sent).toBeTruthy();
        expect(orderOnBuyerNode.OrderItems[0].status).toBe(OrderItemStatus.ESCROW_LOCKED);
        expect(orderOnSellerNode.OrderItems[0].status).toBe(OrderItemStatus.ESCROW_LOCKED);
        sent = false;

        log.debug('========================================================================================');
        log.debug('SELLER POSTS MPA_RELEASE, indicating that the item has been sent');
        log.debug('========================================================================================');

        await testUtilSellerNode.waitFor(5);

        const res: any = await testUtilSellerNode.rpc(escrowCommand, [
            escrowReleaseCommand,
            orderOnSellerNode.OrderItems[0].id,
            'tracking1234'
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        sent = result.result === 'Sent.';
        if (!sent) {
            log.debug(JSON.stringify(result, null, 2));
        }
        expect(result.result).toBe('Sent.');

        log.debug('==[ release Escrow /// seller (node1) -> buyer (node2) ]=========================');
        log.debug('msgid: ' + result.msgid);
        log.debug('order.hash: ' + orderOnBuyerNode.hash);
        log.debug('order.buyer: ' + orderOnBuyerNode.buyer);
        log.debug('order.seller: ' + orderOnBuyerNode.seller);
        log.debug('order.id: ' + orderOnBuyerNode.id);
        log.debug('order.orderItem.id: ' + orderOnBuyerNode.OrderItems[0].id);
        log.debug('=================================================================================');

    });


    test('Should have updated Order on SELLER node after sending MPA_RELEASE, OrderItemStatus.SHIPPING', async () => {

        expect(sent).toBeTruthy();

        log.debug('========================================================================================');
        log.debug('Order should have been updated on seller node after sending the MPA_RELEASE, OrderItemStatus.SHIPPING');
        log.debug('========================================================================================');

        await testUtilSellerNode.waitFor(5);

        const res: any = await testUtilSellerNode.rpc(orderCommand, [orderSearchCommand,
            bidOnSellerNode.ListingItem.hash,
            OrderItemStatus.SHIPPING,
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
        expect(result[0].OrderItems[0].status).toBe(OrderItemStatus.SHIPPING);
        expect(result[0].OrderItems[0].itemHash).toBe(bidOnSellerNode.ListingItem.hash);

        orderOnSellerNode = result[0];

        log.debug('==> Order updated on SELLER node.');

    });

    test('Should have updated Order on BUYER node after receiving MPA_RELEASE, OrderItemStatus.SHIPPING', async () => {

        expect(sent).toBeTruthy();
        expect(orderOnSellerNode.OrderItems[0].status).toBe(OrderItemStatus.SHIPPING);

        log.debug('========================================================================================');
        log.debug('BUYER RECEIVES MPA_RELEASE posted from sellers node, OrderItemStatus.SHIPPING');
        log.debug('========================================================================================');

        await testUtilBuyerNode.waitFor(5);

        const res: any = await testUtilBuyerNode.rpcWaitFor(
            orderCommand,
            [
                orderSearchCommand,
                bidOnBuyerNode.ListingItem.hash,
                OrderItemStatus.SHIPPING,
                buyerProfile.address,
                sellerProfile.address,
                SearchOrder.ASC
            ],
            8 * 60,
            200,
            '[0].OrderItems[0].status',
            OrderItemStatus.SHIPPING.toString()
        );
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Order = res.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].OrderItems[0].status).toBe(OrderItemStatus.SHIPPING);
        expect(result[0].buyer).toBe(buyerProfile.address);
        expect(result[0].seller).toBe(sellerProfile.address);

        orderOnBuyerNode = result[0];

        log.debug('==> BUYER received MPA_RELEASE.');

    }, 600000); // timeout to 600s

    test('Should post MPA_RELEASE from BUYER node, indicating that the item has been received', async () => {

        expect(sent).toBeTruthy();
        expect(orderOnSellerNode.OrderItems[0].status).toBe(OrderItemStatus.SHIPPING);
        expect(orderOnBuyerNode.OrderItems[0].status).toBe(OrderItemStatus.SHIPPING);
        sent = false;

        log.debug('========================================================================================');
        log.debug('BUYER POSTS MPA_RELEASE, indicating that the item has been received');
        log.debug('========================================================================================');

        await testUtilBuyerNode.waitFor(5);

        const escrowReleaseCommandParams = [
            escrowReleaseCommand,
            orderOnBuyerNode.OrderItems[0].id,
            'kthanxbye'
        ];

        const res: any = await testUtilBuyerNode.rpc(escrowCommand, escrowReleaseCommandParams);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        sent = result.result === 'Sent.';
        if (!sent) {
            log.debug(JSON.stringify(result, null, 2));
        }
        expect(result.result).toBe('Sent.');

        log.debug('==[ release Escrow /// buyer (node2) -> seller (node1) ]=========================');
        log.debug('msgid: ' + result.msgid);
        log.debug('order.hash: ' + orderOnBuyerNode.hash);
        log.debug('order.buyer: ' + orderOnBuyerNode.buyer);
        log.debug('order.seller: ' + orderOnBuyerNode.seller);
        log.debug('order.id: ' + orderOnBuyerNode.id);
        log.debug('order.orderItem.id: ' + orderOnBuyerNode.OrderItems[0].id);
        log.debug('=================================================================================');

    });

    test('Should have updated Order on BUYER node after sending MPA_RELEASE, OrderItemStatus.COMPLETE', async () => {

        expect(sent).toBeTruthy();

        log.debug('========================================================================================');
        log.debug('Order should have been updated on buyer node after sending the MPA_RELEASE, OrderItemStatus.COMPLETE');
        log.debug('========================================================================================');

        await testUtilBuyerNode.waitFor(5);

        const res: any = await testUtilBuyerNode.rpc(orderCommand, [orderSearchCommand,
            bidOnBuyerNode.ListingItem.hash,
            OrderItemStatus.COMPLETE,
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
        expect(result[0].OrderItems[0].status).toBe(OrderItemStatus.COMPLETE);
        expect(result[0].OrderItems[0].itemHash).toBe(bidOnBuyerNode.ListingItem.hash);

        orderOnSellerNode = result[0];

        log.debug('==> Order updated on BUYER node.');

    });

    test('Should have updated Order on SELLER node after receiving MPA_RELEASE, OrderItemStatus.COMPLETE', async () => {

        expect(sent).toBeTruthy();
        expect(orderOnSellerNode.OrderItems[0].status).toBe(OrderItemStatus.COMPLETE);

        log.debug('========================================================================================');
        log.debug('SELLER RECEIVES MPA_RELEASE posted from buyers node, OrderItemStatus.COMPLETE');
        log.debug('========================================================================================');

        const res: any = await testUtilBuyerNode.rpcWaitFor(
            orderCommand,
            [
                orderSearchCommand,
                bidOnSellerNode.ListingItem.hash,
                OrderItemStatus.COMPLETE,
                buyerProfile.address,
                sellerProfile.address,
                SearchOrder.ASC
            ],
            8 * 60,
            200,
            '[0].OrderItems[0].status',
            OrderItemStatus.COMPLETE.toString()
        );
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Order = res.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].OrderItems[0].status).toBe(OrderItemStatus.COMPLETE);
        expect(result[0].buyer).toBe(buyerProfile.address);
        expect(result[0].seller).toBe(sellerProfile.address);

        orderOnBuyerNode = result[0];

        log.debug('==> SELLER received MPA_RELEASE.');

    }, 600000); // timeout to 600s


    test('Should have no locked outputs left', async () => {

        expect(sent).toBeTruthy();
        expect(orderOnSellerNode.OrderItems[0].status).toBe(OrderItemStatus.COMPLETE);
        expect(orderOnBuyerNode.OrderItems[0].status).toBe(OrderItemStatus.COMPLETE);

        // incase something went wrong.. unlock the locked outputs
        let response: any = await testUtilSellerNode.rpc(daemonCommand, [
            'listlockunspent'
        ]);
        response.expectJson();
        response.expectStatusCode(200);
        let result = response.getBody()['result'];
        expect(result.length).toBe(0);

        response = await testUtilBuyerNode.rpc(daemonCommand, [
            'listlockunspent'
        ]);
        response.expectJson();
        response.expectStatusCode(200);
        result = response.getBody()['result'];
        expect(result.length).toBe(0);

        log.debug('==> No locked outputs left.');

    }, 600000); // timeout to 600s

});
