// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as _ from 'lodash';
import * as resources from 'resources';
import { Logger as LoggerType } from '../../src/core/Logger';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Commands } from '../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { GenerateListingItemTemplateParams } from '../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { SearchOrder } from '../../src/api/enums/SearchOrder';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { OrderItemStatus } from '../../src/api/enums/OrderItemStatus';
import { BidDataValue } from '../../src/api/enums/BidDataValue';
import { OrderStatus } from '../../src/api/enums/OrderStatus';
import { BidSearchOrderField, ListingItemSearchOrderField, OrderSearchOrderField } from '../../src/api/enums/SearchOrderField';
import { MPActionExtended } from '../../src/api/enums/MPActionExtended';

describe('Happy Buy Flow', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtilSellerNode = new BlackBoxTestUtil(randomBoolean ? 0 : 1);  // SELLER
    const testUtilBuyerNode = new BlackBoxTestUtil(randomBoolean ? 1 : 0);  // BUYER

    const templateCommand = Commands.TEMPLATE_ROOT.commandName;
    const templatePostCommand = Commands.TEMPLATE_POST.commandName;
    const templateGetCommand = Commands.TEMPLATE_GET.commandName;
    const listingItemCommand = Commands.ITEM_ROOT.commandName;
    const listingItemSearchCommand = Commands.ITEM_SEARCH.commandName;
    const bidCommand = Commands.BID_ROOT.commandName;
    const bidSendCommand = Commands.BID_SEND.commandName;
    const bidSearchCommand = Commands.BID_SEARCH.commandName;
    const bidGetCommand = Commands.BID_GET.commandName;
    const bidAcceptCommand = Commands.BID_ACCEPT.commandName;
    const orderCommand = Commands.ORDER_ROOT.commandName;
    const orderSearchCommand = Commands.ORDER_SEARCH.commandName;
    const escrowCommand = Commands.ESCROW_ROOT.commandName;
    const escrowLockCommand = Commands.ESCROW_LOCK.commandName;
    const escrowReleaseCommand = Commands.ESCROW_RELEASE.commandName;
    const escrowCompleteCommand = Commands.ESCROW_COMPLETE.commandName;
    const orderItemCommand = Commands.ORDERITEM_ROOT.commandName;
    const orderItemShipCommand = Commands.ORDERITEM_SHIP.commandName;
    const daemonCommand = Commands.DAEMON_ROOT.commandName;

    let sellerProfile: resources.Profile;
    let buyerProfile: resources.Profile;
    let sellerMarket: resources.Market;
    let buyerMarket: resources.Market;

    let listingItemTemplateOnSellerNode: resources.ListingItemTemplate;
    let listingItemReceivedOnSellerNode: resources.ListingItem;
    let listingItemReceivedOnBuyerNode: resources.ListingItem;

    let mpaBidOnSellerNode: resources.Bid;
    let mpaBidOnBuyerNode: resources.Bid;
    let mpaAcceptOnSellerNode: resources.Bid;
    let mpaAcceptOnBuyerNode: resources.Bid;
    let mpaLockOnSellerNode: resources.Bid;
    let mpaLockOnBuyerNode: resources.Bid;
    let mpaCompleteOnSellerNode: resources.Bid;
    let mpaCompleteOnBuyerNode: resources.Bid;
    let mpaShipOnSellerNode: resources.Bid;
    let mpaShipOnBuyerNode: resources.Bid;
    let mpaReleaseOnSellerNode: resources.Bid;
    let mpaReleaseOnBuyerNode: resources.Bid;

    let orderOnSellerNode: resources.Order;
    let orderOnBuyerNode: resources.Order;

    const PAGE = 0;
    const PAGE_LIMIT = 10;
    const SEARCHORDER = SearchOrder.ASC;
    const LISTINGITEM_SEARCHORDERFIELD = ListingItemSearchOrderField.CREATED_AT;
    const BID_SEARCHORDERFIELD = BidSearchOrderField.CREATED_AT;
    const ORDER_SEARCHORDERFIELD = OrderSearchOrderField.CREATED_AT;
    const DAYS_RETENTION = 1;

    const DELIVERY_CONTACT_PHONE = '+3584512345678';
    const DELIVERY_CONTACT_EMAIL = 'test@test.com';
    const DELIVERY_TRACKING_ID = 'trackingid #12345';

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

        sellerMarket = await testUtilSellerNode.getDefaultMarket(sellerProfile.id);
        buyerMarket = await testUtilBuyerNode.getDefaultMarket(buyerProfile.id);
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
            sellerMarket.id     // soldOnMarketId
        ]).toParamsArray();

        const listingItemTemplates = await testUtilSellerNode.generateData(
            CreatableModel.LISTINGITEMTEMPLATE,     // what to generate
            1,                              // how many to generate
            true,                       // return model
            generateListingItemTemplateParams       // what kind of data to generate
        ) as resources.ListingItemTemplates[];

        expect(listingItemTemplates[0].id).toBeDefined();

        listingItemTemplateOnSellerNode = listingItemTemplates[0];
    });


    test('Should unlock the possibly locked outputs left from other tests', async () => {
        await testUtilSellerNode.unlockLockedOutputs(sellerMarket.Identity.wallet);
        await testUtilBuyerNode.unlockLockedOutputs(buyerMarket.Identity.wallet);
    }, 600000); // timeout to 600s


    test('===> MPA_LISTING_ADD <==================================================================', async () => {
        expect(true).toBe(true);
    }, 600000); // timeout to 600s


    test('Should post MPA_LISTING_ADD from SELLER node', async () => {

        log.debug('========================================================================================');
        log.debug('SELLER POSTS MPA_LISTING_ADD');
        log.debug('========================================================================================');

        await testUtilSellerNode.waitFor(5);
        expect(listingItemTemplateOnSellerNode.id).toBeDefined();

        const res = await testUtilSellerNode.rpc(templateCommand, [templatePostCommand,
            listingItemTemplateOnSellerNode.id,
            DAYS_RETENTION
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
        // expect(result.txid).toBeDefined();
        // expect(result.fee).toBeGreaterThan(0);

        log.debug('==[ posted ListingItemTemplate /// seller -> market ]================================');
        log.debug('result.msgid: ' + result.msgid);
        log.debug('item.id: ' + listingItemTemplateOnSellerNode.id);
        log.debug('item.hash: ' + listingItemTemplateOnSellerNode.hash);
        log.debug('item.title: ' + listingItemTemplateOnSellerNode.ItemInformation.title);
        log.debug('item.desc: ' + listingItemTemplateOnSellerNode.ItemInformation.shortDescription);
        log.debug('item.category: [' + listingItemTemplateOnSellerNode.ItemInformation.ItemCategory.id + '] '
            + listingItemTemplateOnSellerNode.ItemInformation.ItemCategory.name);
        log.debug('========================================================================================');
    });


    test('Should have updated ListingItemTemplate hash on SELLER node', async () => {
        // sending should have succeeded for this test to work
        expect(sent).toBeTruthy();

        const res: any = await testUtilSellerNode.rpc(templateCommand, [templateGetCommand,
            listingItemTemplateOnSellerNode.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        listingItemTemplateOnSellerNode = res.getBody()['result'];
        expect(listingItemTemplateOnSellerNode.hash).toBeDefined();
    });


    test('Should have received MPA_LISTING_ADD on SELLER node', async () => {

        // sending should have succeeded for this test to work
        expect(sent).toBeTruthy();

        log.debug('========================================================================================');
        log.debug('SELLER RECEIVES MPA_LISTING_ADD');
        log.debug('========================================================================================');

        const response: any = await testUtilSellerNode.rpcWaitFor(
            listingItemCommand,
            [listingItemSearchCommand,
                PAGE, PAGE_LIMIT, SEARCHORDER, LISTINGITEM_SEARCHORDERFIELD,
                buyerMarket.receiveAddress,
                [],
                '*',
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                listingItemTemplateOnSellerNode.hash
            ],
            15 * 60,
            200,
            '[0].hash',
            listingItemTemplateOnSellerNode.hash
        );

        const results: resources.ListingItem[] = response.getBody()['result'];
        expect(results.length).toBe(1);
        expect(results[0].hash).toBe(listingItemTemplateOnSellerNode.hash);

        // store ListingItem for later tests
        listingItemReceivedOnSellerNode = results[0];

        log.debug('==> SELLER received MPA_LISTING_ADD.');

    }, 600000); // timeout to 600s


    test('Should have received MPA_LISTING_ADD on BUYER node', async () => {

        // ListingItem should have been received on seller node
        expect(listingItemReceivedOnSellerNode).toBeDefined();

        // sending should have succeeded for this test to work
        expect(sent).toBeTruthy();

        log.debug('========================================================================================');
        log.debug('BUYER RECEIVES MPA_LISTING_ADD');
        log.debug('========================================================================================');

        const response: any = await testUtilBuyerNode.rpcWaitFor(listingItemCommand, [listingItemSearchCommand,
                PAGE, PAGE_LIMIT, SEARCHORDER, LISTINGITEM_SEARCHORDERFIELD,
                buyerMarket.receiveAddress,
                [],
                '*',
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                listingItemTemplateOnSellerNode.hash
            ],
            15 * 60,
            200,
            '[0].hash',
            listingItemTemplateOnSellerNode.hash
        );
        response.expectJson();
        response.expectStatusCode(200);

        const results: resources.ListingItem[] = response.getBody()['result'];
        expect(results.length).toBe(1);
        expect(results[0].hash).toBe(listingItemTemplateOnSellerNode.hash);

        // store ListingItem for later tests
        listingItemReceivedOnBuyerNode = results[0];

        log.debug('==> BUYER received MPA_LISTING_ADD.');

    }, 600000); // timeout to 600s


    test('===> MPA_BID <==========================================================================', async () => {
        expect(true).toBe(true);
    }, 600000); // timeout to 600s


    test('Should post MPA_BID from BUYER node (BidData: order.hash, market.address)', async () => {

        expect(listingItemReceivedOnBuyerNode).toBeDefined();
        expect(listingItemReceivedOnSellerNode).toBeDefined();
        sent = false;

        await testUtilBuyerNode.waitFor(2);

        log.debug('========================================================================================');
        log.debug('BUYER POSTS MPA_BID');
        log.debug('========================================================================================');

        const res: any = await testUtilBuyerNode.rpc(bidCommand, [bidSendCommand,
            listingItemReceivedOnBuyerNode.id,
            buyerMarket.Identity.id,
            buyerProfile.ShippingAddresses[0].id,
            'colour',
            'black',
            'size',
            'xl'
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        // TODO: make sure created template/item has the posted options and test that these end up in the Order

        const result: any = res.getBody()['result'];
        sent = result.result === 'Sent.';
        if (!sent) {
            log.debug(JSON.stringify(result, null, 2));
        }
        expect(result.result).toBe('Sent.');

        log.debug('==[ sent Bid /// buyer node -> seller node ]===================================');
        log.debug('msgid: ' + result.msgid);
        log.debug('item.hash: ' + listingItemReceivedOnBuyerNode.hash);
        log.debug('item.seller: ' + listingItemReceivedOnBuyerNode.seller);
        log.debug('bid.bidder: ' + buyerProfile.address);
        log.debug('===============================================================================');
    });


    test('Should have created MPA_BID on BUYER node', async () => {

        expect(sent).toBeTruthy();
        expect(listingItemReceivedOnBuyerNode).toBeDefined();
        expect(listingItemReceivedOnSellerNode).toBeDefined();

        log.debug('========================================================================================');
        log.debug('Bid should have been created on buyer node after posting the MPA_BID');
        log.debug('========================================================================================');

        // wait for some time to make sure the Bid has been created
        await testUtilBuyerNode.waitFor(2);

        let response: any = await testUtilBuyerNode.rpcWaitFor(bidCommand, [bidSearchCommand,
                PAGE, PAGE_LIMIT, SEARCHORDER, BID_SEARCHORDERFIELD,
                listingItemReceivedOnBuyerNode.id,          // listingItemId
                MPAction.MPA_BID                            // type
                // '*',                                     // search string
                // '*',                                     // market
                // buyerMarket.Identity.address             // bidder
            ],
            15 * 60,
            200,
            '[0].ListingItem.id',
            listingItemReceivedOnBuyerNode.id
        );
        response.expectJson();
        response.expectStatusCode(200);
        const results: resources.Bid[] = response.getBody()['result'];
        expect(results.length).toBe(1);

        await testUtilBuyerNode.waitFor(2);

        response = await testUtilBuyerNode.rpc(bidCommand, [bidGetCommand,
            results[0].id
        ]);
        response.expectJson();
        response.expectStatusCode(200);
        const result: resources.Bid = response.getBody()['result'];

        expect(result.type).toBe(MPAction.MPA_BID);
        expect(result.bidder).toBe(buyerMarket.Identity.address);
        expect(result.ListingItem.hash).toBe(listingItemReceivedOnBuyerNode.hash);
        expect(result.ListingItem.seller).toBe(sellerMarket.Identity.address);

        // there should be no relation to template on the buyer side
        expect(result.ListingItem.ListingItemTemplate).not.toBeDefined();

        // expect Order and OrderItem to be created
        expect(result.OrderItem.id).toBeDefined();
        expect(result.OrderItem.Order.id).toBeDefined();

        // make sure the Order/OrderItem statuses are correct
        expect(result.OrderItem.status).toBe(OrderItemStatus.BIDDED);
        expect(result.OrderItem.Order.status).toBe(OrderStatus.SENT);

        mpaBidOnBuyerNode = result;
        // log.debug('mpaBidOnBuyerNode: ', JSON.stringify(mpaBidOnBuyerNode, null, 2));

        log.debug('==> Bid created on BUYER node.');

    }, 600000); // timeout to 600s


    test('Should have created Order on BUYER node: OrderItemStatus.BIDDED, OrderStatus.SENT', async () => {

        expect(sent).toBeTruthy();
        expect(listingItemReceivedOnBuyerNode).toBeDefined();
        expect(listingItemReceivedOnSellerNode).toBeDefined();
        expect(mpaBidOnBuyerNode.type).toBe(MPAction.MPA_BID);

        log.debug('========================================================================================');
        log.debug('Order created on BUYER node after posting the MPA_BID, OrderItemStatus.BIDDED, OrderStatus.SENT');
        log.debug('========================================================================================');

        // wait for some time to make sure the Order has been created
        await testUtilBuyerNode.waitFor(2);

        const res: any = await testUtilBuyerNode.rpc(orderCommand, [orderSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, ORDER_SEARCHORDERFIELD,
            mpaBidOnBuyerNode.ListingItem.id,
            OrderItemStatus.BIDDED,
            buyerMarket.Identity.address,
            sellerMarket.Identity.address,
            sellerMarket.address
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Order = res.getBody()['result'];
        // log.debug('result:', JSON.stringify(result, null, 2));
        expect(result.length).toBe(1);
        expect(result[0].buyer).toBe(buyerMarket.Identity.address);
        expect(result[0].seller).toBe(sellerMarket.Identity.address);
        expect(result[0].status).toBe(OrderStatus.SENT);
        expect(result[0].OrderItems).toHaveLength(1);
        expect(result[0].OrderItems[0].status).toBe(OrderItemStatus.BIDDED);
        expect(result[0].OrderItems[0].itemHash).toBe(mpaBidOnBuyerNode.ListingItem.hash);
        expect(result[0].OrderItems[0].Bid.BidDatas).toHaveLength(2);

        orderOnBuyerNode = result[0];

        log.debug('==> Order created on BUYER node.');
    });


    test('Should have received MPA_BID on SELLER node', async () => {

        expect(sent).toBeTruthy();

        // Bid should have been created on buyer node
        expect(listingItemReceivedOnBuyerNode).toBeDefined();
        expect(listingItemReceivedOnSellerNode).toBeDefined();
        expect(mpaBidOnBuyerNode.type).toBe(MPAction.MPA_BID);
        expect(orderOnBuyerNode.status).toBe(OrderStatus.SENT);
        expect(orderOnBuyerNode.OrderItems[0].status).toBe(OrderItemStatus.BIDDED);

        log.debug('========================================================================================');
        log.debug('SELLER RECEIVES MPA_BID posted from buyer node');
        log.debug('========================================================================================');

        // wait for some time to make sure the Bid has been created
        await testUtilSellerNode.waitFor(4);

        let response: any = await testUtilSellerNode.rpcWaitFor(bidCommand, [bidSearchCommand,
                PAGE, PAGE_LIMIT, SEARCHORDER, BID_SEARCHORDERFIELD,
                listingItemReceivedOnSellerNode.id,         // listingItemId
                MPAction.MPA_BID                            // type
                // '*',                                     // search string
                // '*',                                     // market
                // buyerMarket.Identity.address             // bidder
            ],
            15 * 60,
            200,
            '[0].ListingItem.id',
            listingItemReceivedOnSellerNode.id
        );
        response.expectJson();
        response.expectStatusCode(200);
        const results: resources.Bid[] = response.getBody()['result'];
        expect(results.length).toBe(1);

        await testUtilSellerNode.waitFor(2);

        response = await testUtilSellerNode.rpc(bidCommand, [bidGetCommand,
            results[0].id
        ]);
        response.expectJson();
        response.expectStatusCode(200);
        const result: resources.Bid = response.getBody()['result'];

        expect(result.type).toBe(MPAction.MPA_BID);
        expect(result.bidder).toBe(buyerMarket.Identity.address);
        expect(result.ListingItem.hash).toBe(listingItemReceivedOnBuyerNode.hash);
        expect(result.ListingItem.seller).toBe(sellerMarket.Identity.address);

        // the relation should match the hash of the template that was created earlier on seller node
        expect(result.ListingItem.ListingItemTemplate.hash).toBe(listingItemTemplateOnSellerNode.hash);

        // expect Order and OrderItem to be created
        expect(result.OrderItem.id).toBeDefined();
        expect(result.OrderItem.Order.id).toBeDefined();

        // make sure the Order/OrderItem statuses are correct
        expect(result.OrderItem.status).toBe(OrderItemStatus.BIDDED);
        expect(result.OrderItem.Order.status).toBe(OrderStatus.RECEIVED);

        mpaBidOnSellerNode = result;

        log.debug('==> SELLER received MPA_BID.');

    }, 600000); // timeout to 600s


    test('Should have created Order on SELLER node: OrderItemStatus.BIDDED, OrderStatus.RECEIVED', async () => {

        expect(sent).toBeTruthy();
        expect(listingItemReceivedOnBuyerNode).toBeDefined();
        expect(listingItemReceivedOnSellerNode).toBeDefined();
        expect(mpaBidOnBuyerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaBidOnSellerNode.type).toBe(MPAction.MPA_BID);
        expect(orderOnBuyerNode.status).toBe(OrderStatus.SENT);
        expect(orderOnBuyerNode.OrderItems[0].status).toBe(OrderItemStatus.BIDDED);

        log.debug('========================================================================================');
        log.debug('Order should have been created on SELLER node after receiving the MPA_BID');
        log.debug('========================================================================================');

        // wait for some time to make sure the Order has been created
        await testUtilSellerNode.waitFor(2);

        const res: any = await testUtilSellerNode.rpc(orderCommand, [orderSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, ORDER_SEARCHORDERFIELD,
            mpaBidOnSellerNode.ListingItem.id,
            OrderStatus.RECEIVED,
            buyerMarket.Identity.address,
            sellerMarket.Identity.address,
            sellerMarket.address
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Order = res.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].hash).toBeDefined(); // TODO: should match mpaBidOnSellerNode.BidDatas[orderHash]
        expect(result[0].buyer).toBe(buyerMarket.Identity.address);
        expect(result[0].seller).toBe(sellerMarket.Identity.address);
        expect(result[0].status).toBe(OrderStatus.RECEIVED);
        expect(result[0].OrderItems).toHaveLength(1);
        expect(result[0].OrderItems[0].status).toBe(OrderItemStatus.BIDDED);
        expect(result[0].OrderItems[0].itemHash).toBe(mpaBidOnSellerNode.ListingItem.hash);
        expect(result[0].OrderItems[0].Bid.BidDatas).toHaveLength(2);

        orderOnSellerNode = result[0];

        log.debug('==> Order created on SELLER node.');

    }, 600000); // timeout to 600s


    test('===> MPA_ACCEPT <=======================================================================', async () => {
        expect(true).toBe(true);
    }, 600000); // timeout to 600s


    test('Should post MPA_ACCEPT from SELLER node', async () => {

        // Bid should have been created on seller node
        expect(listingItemReceivedOnBuyerNode).toBeDefined();
        expect(listingItemReceivedOnSellerNode).toBeDefined();
        expect(mpaBidOnBuyerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaBidOnSellerNode.type).toBe(MPAction.MPA_BID);
        expect(orderOnSellerNode.status).toBe(OrderStatus.RECEIVED);
        expect(orderOnSellerNode.OrderItems[0].status).toBe(OrderItemStatus.BIDDED);
        expect(orderOnBuyerNode.status).toBe(OrderStatus.SENT);
        expect(orderOnBuyerNode.OrderItems[0].status).toBe(OrderItemStatus.BIDDED);

        sent = false;

        log.debug('========================================================================================');
        log.debug('SELLER POSTS MPA_ACCEPT');
        log.debug('========================================================================================');

        const response: any = await testUtilSellerNode.rpc(bidCommand, [bidAcceptCommand,
            mpaBidOnSellerNode.id,
            sellerMarket.Identity.id
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
        log.debug('item.hash: ' + mpaBidOnSellerNode.ListingItem.hash);
        log.debug('item.id: ' + mpaBidOnSellerNode.ListingItem.id);
        log.debug('bid.id: ' + mpaBidOnSellerNode.id);
        log.debug('bid.bidder: ' + mpaBidOnSellerNode.bidder);
        log.debug('bid.ListingItem.seller: ' + mpaBidOnSellerNode.ListingItem.seller);
        log.debug('=================================================================================');

    }, 600000); // timeout to 600s


    test('Should have created MPA_ACCEPT on SELLER node', async () => {

        expect(sent).toBeTruthy();
        expect(listingItemReceivedOnBuyerNode).toBeDefined();
        expect(listingItemReceivedOnSellerNode).toBeDefined();
        expect(mpaBidOnBuyerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaBidOnSellerNode.type).toBe(MPAction.MPA_BID);
        expect(orderOnSellerNode.status).toBe(OrderStatus.RECEIVED);
        expect(orderOnSellerNode.OrderItems[0].status).toBe(OrderItemStatus.BIDDED);
        expect(orderOnBuyerNode.status).toBe(OrderStatus.SENT);
        expect(orderOnBuyerNode.OrderItems[0].status).toBe(OrderItemStatus.BIDDED);

        log.debug('========================================================================================');
        log.debug('BID should have been updated on SELLER node after posting the MPA_ACCEPT');
        log.debug('========================================================================================');

        // wait for some time to make sure the Bid has been updated
        await testUtilSellerNode.waitFor(2);

        let response: any = await testUtilSellerNode.rpcWaitFor(bidCommand, [bidSearchCommand,
                PAGE, PAGE_LIMIT, SEARCHORDER, BID_SEARCHORDERFIELD,
                listingItemReceivedOnSellerNode.id,         // listingItemId
                MPAction.MPA_ACCEPT,                        // type
                '*',                                        // search string
                sellerMarket.receiveAddress,                // market
                buyerMarket.Identity.address                // bidder
            ],
            15 * 60,
            200,
            '[0].ListingItem.id',
            listingItemReceivedOnSellerNode.id
        );
        response.expectJson();
        response.expectStatusCode(200);
        const results: resources.Bid[] = response.getBody()['result'];
        expect(results.length).toBe(1);

        await testUtilSellerNode.waitFor(2);

        response = await testUtilSellerNode.rpc(bidCommand, [bidGetCommand,
            results[0].id
        ]);
        response.expectJson();
        response.expectStatusCode(200);
        const result: resources.Bid = response.getBody()['result'];

        expect(result.type).toBe(MPAction.MPA_ACCEPT);
        expect(result.bidder).toBe(buyerMarket.Identity.address);
        expect(result.ListingItem.hash).toBe(mpaBidOnSellerNode.ListingItem.hash);
        expect(result.ListingItem.seller).toBe(sellerMarket.Identity.address );

        // there should be a relation to template on the seller side
        expect(result.ListingItem.ListingItemTemplate.hash).toBe(listingItemTemplateOnSellerNode.hash);

        // make sure the Order/OrderItem statuses are correct
        expect(result.ParentBid.OrderItem.status).toBe(OrderItemStatus.AWAITING_ESCROW);
        expect(result.ParentBid.OrderItem.Order.status).toBe(OrderStatus.PROCESSING);

        mpaAcceptOnSellerNode = result;

        log.debug('==> Bid updated on SELLER node.');
    });


    test('Should have updated Order on SELLER node: OrderItemStatus.AWAITING_ESCROW, OrderStatus.PROCESSING', async () => {

        expect(sent).toBeTruthy();

        expect(listingItemReceivedOnBuyerNode).toBeDefined();
        expect(listingItemReceivedOnSellerNode).toBeDefined();
        expect(mpaBidOnBuyerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaBidOnSellerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaAcceptOnSellerNode.type).toBe(MPAction.MPA_ACCEPT);
        expect(orderOnSellerNode.status).toBe(OrderStatus.RECEIVED);
        expect(orderOnSellerNode.OrderItems[0].status).toBe(OrderItemStatus.BIDDED);
        expect(orderOnBuyerNode.status).toBe(OrderStatus.SENT);
        expect(orderOnBuyerNode.OrderItems[0].status).toBe(OrderItemStatus.BIDDED);

        log.debug('========================================================================================');
        log.debug('ORDER should have been updated on SELLER node after posting the MPA_ACCEPT');
        log.debug('========================================================================================');

        // wait for some time to make sure the Order has been created
        await testUtilSellerNode.waitFor(2);

        const res: any = await testUtilSellerNode.rpc(orderCommand, [orderSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, ORDER_SEARCHORDERFIELD,
            mpaBidOnSellerNode.ListingItem.id,
            OrderItemStatus.AWAITING_ESCROW,
            buyerMarket.Identity.address,
            sellerMarket.Identity.address,
            sellerMarket.address
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Order = res.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].hash).toBeDefined(); // TODO: should match mpaBidOnSellerNode.BidDatas[orderHash]
        expect(result[0].buyer).toBe(buyerMarket.Identity.address);
        expect(result[0].seller).toBe(sellerMarket.Identity.address);
        expect(result[0].status).toBe(OrderStatus.PROCESSING);
        expect(result[0].OrderItems).toHaveLength(1);
        expect(result[0].OrderItems[0].status).toBe(OrderItemStatus.AWAITING_ESCROW);
        expect(result[0].OrderItems[0].itemHash).toBe(mpaBidOnSellerNode.ListingItem.hash);
        expect(result[0].OrderItems[0].Bid.BidDatas).toHaveLength(2);

        orderOnSellerNode = result[0];

        log.debug('==> Order updated on SELLER node.');

    }, 600000); // timeout to 600s


    test('Should have received MPA_ACCEPT on BUYER node', async () => {

        expect(sent).toBeTruthy();
        expect(listingItemReceivedOnBuyerNode).toBeDefined();
        expect(listingItemReceivedOnSellerNode).toBeDefined();
        expect(mpaBidOnBuyerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaBidOnSellerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaAcceptOnSellerNode.type).toBe(MPAction.MPA_ACCEPT);
        expect(mpaAcceptOnBuyerNode).not.toBeDefined();
        expect(orderOnSellerNode.status).toBe(OrderStatus.PROCESSING);
        expect(orderOnSellerNode.OrderItems[0].status).toBe(OrderItemStatus.AWAITING_ESCROW);
        expect(orderOnBuyerNode.status).toBe(OrderStatus.SENT);
        expect(orderOnBuyerNode.OrderItems[0].status).toBe(OrderItemStatus.BIDDED);

        log.debug('========================================================================================');
        log.debug('BUYER RECEIVES MPA_ACCEPT posted from sellers node, MPAction.MPA_ACCEPT');
        log.debug('========================================================================================');

        await testUtilBuyerNode.waitFor(4);

        let response: any = await testUtilBuyerNode.rpcWaitFor(bidCommand, [bidSearchCommand,
                PAGE, PAGE_LIMIT, SEARCHORDER, BID_SEARCHORDERFIELD,
                listingItemReceivedOnBuyerNode.id,          // listingItemId
                MPAction.MPA_ACCEPT,                        // type
                '*',                                        // search string
                buyerMarket.receiveAddress,                 // market
                buyerMarket.Identity.address                // bidder
            ],
            15 * 60,
            200,
            '[0].ListingItem.id',
            listingItemReceivedOnBuyerNode.id
        );
        response.expectJson();
        response.expectStatusCode(200);
        const results: resources.Bid[] = response.getBody()['result'];
        expect(results.length).toBe(1);

        await testUtilBuyerNode.waitFor(2);

        response = await testUtilBuyerNode.rpc(bidCommand, [bidGetCommand,
            results[0].id
        ]);
        response.expectJson();
        response.expectStatusCode(200);
        const result: resources.Bid = response.getBody()['result'];

        expect(result.type).toBe(MPAction.MPA_ACCEPT);
        expect(result.bidder).toBe(buyerMarket.Identity.address);
        expect(result.ListingItem.seller).toBe(sellerMarket.Identity.address);
        expect(result.ListingItem.hash).toBe(listingItemReceivedOnBuyerNode.hash);

        // there should be no relation to template on the buyer side
        expect(result.ListingItem.ListingItemTemplate).not.toBeDefined();

        // todo: check for correct biddata

        // make sure the Order/OrderItem statuses are correct
        expect(result.ParentBid.OrderItem.status).toBe(OrderItemStatus.AWAITING_ESCROW);
        expect(result.ParentBid.OrderItem.Order.status).toBe(OrderStatus.PROCESSING);

        mpaAcceptOnBuyerNode = result;

        log.debug('==> BUYER received MPA_ACCEPT.');
    }, 600000); // timeout to 600s


    test('Should have updated Order on BUYER node: OrderItemStatus.AWAITING_ESCROW, OrderStatus.PROCESSING', async () => {

        expect(sent).toBeTruthy();
        expect(listingItemReceivedOnBuyerNode).toBeDefined();
        expect(listingItemReceivedOnSellerNode).toBeDefined();
        expect(mpaBidOnBuyerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaBidOnSellerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaAcceptOnSellerNode.type).toBe(MPAction.MPA_ACCEPT);
        expect(mpaAcceptOnBuyerNode.type).toBe(MPAction.MPA_ACCEPT);
        expect(orderOnSellerNode.status).toBe(OrderStatus.PROCESSING);
        expect(orderOnSellerNode.OrderItems[0].status).toBe(OrderItemStatus.AWAITING_ESCROW);
        expect(orderOnBuyerNode.status).toBe(OrderStatus.SENT);
        expect(orderOnBuyerNode.OrderItems[0].status).toBe(OrderItemStatus.BIDDED);

        log.debug('========================================================================================');
        log.debug('Order should have been updated on BUYER node after receiving the MPA_ACCEPT, OrderItemStatus.AWAITING_ESCROW, OrderStatus.PROCESSING');
        log.debug('========================================================================================');

        // wait for some time to make sure the Order has been created
        await testUtilBuyerNode.waitFor(4);

        const res: any = await testUtilBuyerNode.rpc(orderCommand, [orderSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, ORDER_SEARCHORDERFIELD,
            mpaBidOnBuyerNode.ListingItem.id,
            OrderItemStatus.AWAITING_ESCROW,
            buyerMarket.Identity.address,
            sellerMarket.Identity.address,
            sellerMarket.address
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Order = res.getBody()['result'];

        log.debug('result:', JSON.stringify(result, null, 2));

        expect(result.length).toBe(1);
        expect(result[0].hash).toBe(orderOnBuyerNode.hash);
        expect(result[0].buyer).toBe(buyerMarket.Identity.address);
        expect(result[0].seller).toBe(sellerMarket.Identity.address);
        expect(result[0].status).toBe(OrderStatus.PROCESSING);
        expect(result[0].OrderItems).toHaveLength(1);
        expect(result[0].OrderItems[0].status).toBe(OrderItemStatus.AWAITING_ESCROW);
        expect(result[0].OrderItems[0].itemHash).toBe(mpaBidOnBuyerNode.ListingItem.hash);
        expect(result[0].OrderItems[0].Bid.BidDatas).toHaveLength(2);

        orderOnBuyerNode = result[0];

        log.debug('==> Order created on BUYER node.');
    });


    test('===> MPA_LOCK <=========================================================================', async () => {
        expect(true).toBe(true);
    }, 600000); // timeout to 600s


    test('Should post MPA_LOCK from BUYER node (BidData: delivery.email, delivery.phone)', async () => {

        expect(sent).toBeTruthy();
        expect(listingItemReceivedOnBuyerNode).toBeDefined();
        expect(listingItemReceivedOnSellerNode).toBeDefined();
        expect(mpaBidOnBuyerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaBidOnSellerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaAcceptOnSellerNode.type).toBe(MPAction.MPA_ACCEPT);
        expect(mpaAcceptOnBuyerNode.type).toBe(MPAction.MPA_ACCEPT);
        expect(orderOnSellerNode.status).toBe(OrderStatus.PROCESSING);
        expect(orderOnSellerNode.OrderItems[0].status).toBe(OrderItemStatus.AWAITING_ESCROW);
        expect(orderOnBuyerNode.status).toBe(OrderStatus.PROCESSING);
        expect(orderOnBuyerNode.OrderItems[0].status).toBe(OrderItemStatus.AWAITING_ESCROW);

        sent = false;

        log.debug('========================================================================================');
        log.debug('BUYER POSTS MPA_LOCK');
        log.debug('========================================================================================');

        const res: any = await testUtilBuyerNode.rpc(escrowCommand, [escrowLockCommand,
            orderOnBuyerNode.OrderItems[0].id,
            BidDataValue.DELIVERY_CONTACT_EMAIL,
            DELIVERY_CONTACT_EMAIL,
            BidDataValue.DELIVERY_CONTACT_PHONE,
            DELIVERY_CONTACT_PHONE
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


    test('Should have created MPA_LOCK on BUYER node', async () => {

        expect(sent).toBeTruthy();
        expect(listingItemReceivedOnBuyerNode).toBeDefined();
        expect(listingItemReceivedOnSellerNode).toBeDefined();
        expect(mpaBidOnBuyerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaBidOnSellerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaAcceptOnSellerNode.type).toBe(MPAction.MPA_ACCEPT);
        expect(mpaAcceptOnBuyerNode.type).toBe(MPAction.MPA_ACCEPT);
        expect(orderOnSellerNode.status).toBe(OrderStatus.PROCESSING);
        expect(orderOnSellerNode.OrderItems[0].status).toBe(OrderItemStatus.AWAITING_ESCROW);
        expect(orderOnBuyerNode.status).toBe(OrderStatus.PROCESSING);
        expect(orderOnBuyerNode.OrderItems[0].status).toBe(OrderItemStatus.AWAITING_ESCROW);

        log.debug('========================================================================================');
        log.debug('Bid should have been created on BUYER node after posting the MPA_LOCK');
        log.debug('========================================================================================');

        // wait for some time to make sure the Bid has been created
        await testUtilBuyerNode.waitFor(4);

        let response: any = await testUtilBuyerNode.rpcWaitFor(bidCommand, [bidSearchCommand,
                PAGE, PAGE_LIMIT, SEARCHORDER, BID_SEARCHORDERFIELD,
                listingItemReceivedOnBuyerNode.id,          // listingItemId
                MPAction.MPA_LOCK                           // type
                // '*',                                     // search string
                // '*',                                     // market
                // buyerMarket.Identity.address             // bidder
            ],
            15 * 60,
            200,
            '[0].ListingItem.id',
            listingItemReceivedOnBuyerNode.id
        );
        response.expectJson();
        response.expectStatusCode(200);
        const results: resources.Bid[] = response.getBody()['result'];
        expect(results.length).toBe(1);

        await testUtilBuyerNode.waitFor(2);

        response = await testUtilBuyerNode.rpc(bidCommand, [bidGetCommand,
            results[0].id
        ]);
        response.expectJson();
        response.expectStatusCode(200);
        const result: resources.Bid = response.getBody()['result'];

        expect(result.type).toBe(MPAction.MPA_LOCK);
        expect(result.bidder).toBe(buyerMarket.Identity.address);
        expect(result.ListingItem.hash).toBe(listingItemReceivedOnBuyerNode.hash);
        expect(result.ListingItem.seller).toBe(sellerMarket.Identity.address);

        // there should be no relation to template on the buyer side
        expect(result.ListingItem.ListingItemTemplate).not.toBeDefined();

        // expect Order and OrderItem to be created
        expect(result.ParentBid.OrderItem.id).toBeDefined();
        expect(result.ParentBid.OrderItem.Order.id).toBeDefined();

        // make sure the Order/OrderItem statuses are correct
        expect(result.ParentBid.OrderItem.status).toBe(OrderItemStatus.ESCROW_LOCKED);
        expect(result.ParentBid.OrderItem.Order.status).toBe(OrderStatus.PROCESSING);

        mpaLockOnBuyerNode = result;

        log.debug('==> Bid created on BUYER node.');

    }, 600000); // timeout to 600s


    test('Should have updated Order on BUYER node: OrderItemStatus.ESCROW_LOCKED, OrderStatus.PROCESSING', async () => {

        expect(sent).toBeTruthy();

        expect(listingItemReceivedOnBuyerNode).toBeDefined();
        expect(listingItemReceivedOnSellerNode).toBeDefined();
        expect(mpaBidOnBuyerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaBidOnSellerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaAcceptOnSellerNode.type).toBe(MPAction.MPA_ACCEPT);
        expect(mpaAcceptOnBuyerNode.type).toBe(MPAction.MPA_ACCEPT);
        expect(mpaLockOnBuyerNode.type).toBe(MPAction.MPA_LOCK);
        expect(orderOnSellerNode.status).toBe(OrderStatus.PROCESSING);
        expect(orderOnSellerNode.OrderItems[0].status).toBe(OrderItemStatus.AWAITING_ESCROW);
        expect(orderOnBuyerNode.status).toBe(OrderStatus.PROCESSING);
        expect(orderOnBuyerNode.OrderItems[0].status).toBe(OrderItemStatus.AWAITING_ESCROW);


        log.debug('========================================================================================');
        log.debug('Order should have been updated on BUYER node after posting the MPA_LOCK, OrderItemStatus.ESCROW_LOCKED');
        log.debug('========================================================================================');

        await testUtilBuyerNode.waitFor(5);

        const res: any = await testUtilBuyerNode.rpc(orderCommand, [orderSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, ORDER_SEARCHORDERFIELD,
            mpaBidOnBuyerNode.ListingItem.id,
            OrderItemStatus.ESCROW_LOCKED,
            buyerMarket.Identity.address,
            sellerMarket.Identity.address,
            sellerMarket.address
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Order[] = res.getBody()['result'];

        // log.debug('order on BUYER node after MPA_LOCK: ', JSON.stringify(result, null, 2));

        expect(result.length).toBe(1);
        expect(result[0].hash).toBeDefined(); // TODO: bidNode1.BidDatas[orderHash]
        expect(result[0].buyer).toBe(buyerMarket.Identity.address);
        expect(result[0].seller).toBe(sellerMarket.Identity.address);
        expect(result[0].OrderItems).toHaveLength(1);
        expect(result[0].OrderItems[0].Bid.ChildBids).toHaveLength(2);

        expect(result[0].OrderItems[0].status).toBe(OrderItemStatus.ESCROW_LOCKED);
        expect(result[0].status).toBe(OrderStatus.PROCESSING);
        expect(result[0].OrderItems[0].Bid.BidDatas).toHaveLength(2);

        const lockBid: resources.Bid = _.find(result[0].OrderItems[0].Bid.ChildBids, (value: resources.Bid) => {
            return value.type === MPAction.MPA_LOCK;
        });
        log.debug('lockBid.BidDatas: ', JSON.stringify(lockBid.BidDatas, null, 2));

        expect(lockBid.BidDatas).toHaveLength(4);

        orderOnBuyerNode = result[0];

        log.debug('==> Updated Order found on BUYER node.');
    });


    test('Should have received MPA_LOCK on SELLER node', async () => {

        expect(sent).toBeTruthy();

        expect(listingItemReceivedOnBuyerNode).toBeDefined();
        expect(listingItemReceivedOnSellerNode).toBeDefined();
        expect(mpaBidOnBuyerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaBidOnSellerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaAcceptOnSellerNode.type).toBe(MPAction.MPA_ACCEPT);
        expect(mpaAcceptOnBuyerNode.type).toBe(MPAction.MPA_ACCEPT);
        expect(mpaLockOnBuyerNode.type).toBe(MPAction.MPA_LOCK);
        expect(mpaLockOnSellerNode).not.toBeDefined();
        expect(orderOnSellerNode.status).toBe(OrderStatus.PROCESSING);
        expect(orderOnSellerNode.OrderItems[0].status).toBe(OrderItemStatus.AWAITING_ESCROW);
        expect(orderOnBuyerNode.status).toBe(OrderStatus.PROCESSING);
        expect(orderOnBuyerNode.OrderItems[0].status).toBe(OrderItemStatus.ESCROW_LOCKED);

        log.debug('========================================================================================');
        log.debug('SELLER RECEIVES MPA_LOCK posted from BUYER node');
        log.debug('========================================================================================');

        // wait for some time to make sure the Bid has been created
        await testUtilSellerNode.waitFor(2);

        let response: any = await testUtilSellerNode.rpcWaitFor(bidCommand, [bidSearchCommand,
                PAGE, PAGE_LIMIT, SEARCHORDER, BID_SEARCHORDERFIELD,
                listingItemReceivedOnSellerNode.id,         // listingItemId
                MPAction.MPA_LOCK                           // type
                // '*',                                     // search string
                // '*',                                     // market
                // buyerMarket.Identity.address             // bidder
            ],
            15 * 60,
            200,
            '[0].ListingItem.id',
            listingItemReceivedOnSellerNode.id
        );
        response.expectJson();
        response.expectStatusCode(200);
        const results: resources.Bid[] = response.getBody()['result'];
        expect(results.length).toBe(1);

        await testUtilSellerNode.waitFor(2);

        response = await testUtilSellerNode.rpc(bidCommand, [bidGetCommand,
            results[0].id
        ]);
        response.expectJson();
        response.expectStatusCode(200);
        const result: resources.Bid = response.getBody()['result'];

        expect(result.type).toBe(MPAction.MPA_LOCK);
        expect(result.bidder).toBe(buyerMarket.Identity.address);
        expect(result.ListingItem.hash).toBe(listingItemReceivedOnBuyerNode.hash);
        expect(result.ListingItem.seller).toBe(sellerMarket.Identity.address);

        // the relation should match the hash of the template that was created earlier on seller node
        expect(result.ListingItem.ListingItemTemplate.hash).toBe(listingItemTemplateOnSellerNode.hash);

        // expect Order and OrderItem to be created
        expect(result.ParentBid.OrderItem.id).toBeDefined();
        expect(result.ParentBid.OrderItem.Order.id).toBeDefined();

        // make sure the Order/OrderItem statuses are correct
        expect(result.ParentBid.OrderItem.status).toBe(OrderItemStatus.ESCROW_LOCKED);
        expect(result.ParentBid.OrderItem.Order.status).toBe(OrderStatus.PROCESSING);

        mpaLockOnSellerNode = result;
        // log.debug('mpaBidOnSellerNode: ', JSON.stringify(mpaBidOnSellerNode, null, 2));

        log.debug('==> SELLER received MPA_LOCK.');

    }, 600000); // timeout to 600s


    test('Should have updated Order on SELLER node: OrderItemStatus.ESCROW_LOCKED, OrderStatus.PROCESSING', async () => {

        expect(sent).toBeTruthy();

        expect(mpaBidOnBuyerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaBidOnSellerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaAcceptOnSellerNode.type).toBe(MPAction.MPA_ACCEPT);
        expect(mpaAcceptOnBuyerNode.type).toBe(MPAction.MPA_ACCEPT);
        expect(mpaLockOnBuyerNode.type).toBe(MPAction.MPA_LOCK);
        expect(mpaLockOnSellerNode.type).toBe(MPAction.MPA_LOCK);
        expect(orderOnSellerNode.status).toBe(OrderStatus.PROCESSING);
        expect(orderOnSellerNode.OrderItems[0].status).toBe(OrderItemStatus.AWAITING_ESCROW);
        expect(orderOnBuyerNode.status).toBe(OrderStatus.PROCESSING);
        expect(orderOnBuyerNode.OrderItems[0].status).toBe(OrderItemStatus.ESCROW_LOCKED);

        log.debug('========================================================================================');
        log.debug('Order should have been updated on SELLER node after posting the MPA_LOCK, OrderItemStatus.ESCROW_LOCKED');
        log.debug('========================================================================================');

        const res: any = await testUtilSellerNode.rpcWaitFor(orderCommand, [orderSearchCommand,
                PAGE, PAGE_LIMIT, SEARCHORDER, ORDER_SEARCHORDERFIELD,
                mpaBidOnSellerNode.ListingItem.id,
                OrderItemStatus.ESCROW_LOCKED,
                buyerMarket.Identity.address,
                sellerMarket.Identity.address,
                sellerMarket.address
            ],
            8 * 60,
            200,
            '[0].OrderItems[0].status',
            OrderItemStatus.ESCROW_LOCKED.toString()
        );
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Order[] = res.getBody()['result'];
        // log.debug('order on SELLER node after MPA_LOCK: ', JSON.stringify(result, null, 2));
        expect(result.length).toBe(1);
        expect(result[0].buyer).toBe(buyerMarket.Identity.address);
        expect(result[0].seller).toBe(sellerMarket.Identity.address);
        expect(result[0].OrderItems).toHaveLength(1);
        expect(result[0].OrderItems[0].Bid.ChildBids).toHaveLength(2);
        expect(result[0].OrderItems[0].Bid.BidDatas).toHaveLength(2);

        const lockBid: resources.Bid = _.find(result[0].OrderItems[0].Bid.ChildBids, (value: resources.Bid) => {
            return value.type === MPAction.MPA_LOCK;
        });
        expect(lockBid.BidDatas).toHaveLength(4);
        expect(result[0].OrderItems[0].status).toBe(OrderItemStatus.ESCROW_LOCKED);
        expect(result[0].OrderItems[0].itemHash).toBe(mpaBidOnSellerNode.ListingItem.hash);

        orderOnSellerNode = result[0];

        log.debug('==> SELLER received MPA_LOCK.');

    }, 600000); // timeout to 600s


    test('===> MPA_COMPLETE <=====================================================================', async () => {
        expect(true).toBe(true);
    }, 600000); // timeout to 600s


    test('Should post MPA_COMPLETE from SELLER node (BidData: txid.complete)', async () => {

        expect(sent).toBeTruthy();

        expect(mpaBidOnBuyerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaBidOnSellerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaAcceptOnSellerNode.type).toBe(MPAction.MPA_ACCEPT);
        expect(mpaAcceptOnBuyerNode.type).toBe(MPAction.MPA_ACCEPT);
        expect(mpaLockOnBuyerNode.type).toBe(MPAction.MPA_LOCK);
        expect(mpaLockOnSellerNode).not.toBe(MPAction.MPA_LOCK);
        expect(mpaCompleteOnSellerNode).not.toBeDefined();
        expect(mpaCompleteOnBuyerNode).not.toBeDefined();
        expect(orderOnSellerNode.status).toBe(OrderStatus.PROCESSING);
        expect(orderOnSellerNode.OrderItems[0].status).toBe(OrderItemStatus.ESCROW_LOCKED);
        expect(orderOnBuyerNode.status).toBe(OrderStatus.PROCESSING);
        expect(orderOnBuyerNode.OrderItems[0].status).toBe(OrderItemStatus.ESCROW_LOCKED);

        sent = false;

        log.debug('========================================================================================');
        log.debug('SELLER POSTS MPA_COMPLETE, completing the escrow');
        log.debug('========================================================================================');

        await testUtilSellerNode.waitFor(5);

        const res: any = await testUtilSellerNode.rpc(escrowCommand, [
            escrowCompleteCommand,
            orderOnSellerNode.OrderItems[0].id
            // 'tracking1234'
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        sent = result.result === 'Sent.';
        if (!sent) {
            log.debug(JSON.stringify(result, null, 2));
        }
        expect(result.result).toBe('Sent.');

        log.debug('==[ complete Escrow /// seller (node1) -> buyer (node2) ]=========================');
        log.debug('msgid: ' + result.msgid);
        log.debug('order.hash: ' + orderOnSellerNode.hash);
        log.debug('order.buyer: ' + orderOnSellerNode.buyer);
        log.debug('order.seller: ' + orderOnSellerNode.seller);
        log.debug('order.id: ' + orderOnSellerNode.id);
        log.debug('order.orderItem.id: ' + orderOnSellerNode.OrderItems[0].id);
        log.debug('=================================================================================');
    });


    test('Should have created MPA_COMPLETE on SELLER node', async () => {

        expect(sent).toBeTruthy();

        expect(listingItemReceivedOnBuyerNode).toBeDefined();
        expect(listingItemReceivedOnSellerNode).toBeDefined();
        expect(mpaBidOnBuyerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaBidOnSellerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaAcceptOnSellerNode.type).toBe(MPAction.MPA_ACCEPT);
        expect(mpaAcceptOnBuyerNode.type).toBe(MPAction.MPA_ACCEPT);
        expect(mpaLockOnBuyerNode.type).toBe(MPAction.MPA_LOCK);
        expect(mpaLockOnSellerNode.type).toBe(MPAction.MPA_LOCK);
        expect(mpaCompleteOnSellerNode).not.toBeDefined();
        expect(mpaCompleteOnBuyerNode).not.toBeDefined();
        expect(orderOnSellerNode.status).toBe(OrderStatus.PROCESSING);
        expect(orderOnSellerNode.OrderItems[0].status).toBe(OrderItemStatus.ESCROW_LOCKED);
        expect(orderOnBuyerNode.status).toBe(OrderStatus.PROCESSING);
        expect(orderOnBuyerNode.OrderItems[0].status).toBe(OrderItemStatus.ESCROW_LOCKED);

        log.debug('========================================================================================');
        log.debug('SELLER CREATED MPA_COMPLETE');
        log.debug('========================================================================================');

        // wait for some time to make sure the Bid has been created
        await testUtilSellerNode.waitFor(4);

        let response: any = await testUtilSellerNode.rpcWaitFor(bidCommand, [bidSearchCommand,
                PAGE, PAGE_LIMIT, SEARCHORDER, BID_SEARCHORDERFIELD,
                listingItemReceivedOnSellerNode.id,         // listingItemId
                MPActionExtended.MPA_COMPLETE               // type
                // '*',                                     // search string
                // '*',                                     // market
                // buyerMarket.Identity.address             // bidder
            ],
            15 * 60,
            200,
            '[0].ListingItem.id',
            listingItemReceivedOnSellerNode.id
        );
        response.expectJson();
        response.expectStatusCode(200);
        const results: resources.Bid[] = response.getBody()['result'];
        expect(results.length).toBe(1);

        await testUtilSellerNode.waitFor(2);

        response = await testUtilSellerNode.rpc(bidCommand, [bidGetCommand,
            results[0].id
        ]);
        response.expectJson();
        response.expectStatusCode(200);
        const result: resources.Bid = response.getBody()['result'];

        expect(result.type).toBe(MPActionExtended.MPA_COMPLETE);
        expect(result.bidder).toBe(buyerMarket.Identity.address);
        expect(result.ListingItem.hash).toBe(listingItemReceivedOnBuyerNode.hash);
        expect(result.ListingItem.seller).toBe(sellerMarket.Identity.address);

        // the relation should match the hash of the template that was created earlier on seller node
        expect(result.ListingItem.ListingItemTemplate.hash).toBe(listingItemTemplateOnSellerNode.hash);

        // expect Order and OrderItem to be created
        expect(result.ParentBid.OrderItem.id).toBeDefined();
        expect(result.ParentBid.OrderItem.Order.id).toBeDefined();

        // make sure the Order/OrderItem statuses are correct
        expect(result.ParentBid.OrderItem.status).toBe(OrderItemStatus.ESCROW_COMPLETED);
        expect(result.ParentBid.OrderItem.Order.status).toBe(OrderStatus.PROCESSING);

        mpaCompleteOnSellerNode = result;
        // log.debug('mpaBidOnSellerNode: ', JSON.stringify(mpaBidOnSellerNode, null, 2));

        log.debug('==> SELLER created MPA_COMPLETE.');

    }, 600000); // timeout to 600s


    test('Should have updated Order on SELLER node: OrderItemStatus.ESCROW_COMPLETED, OrderStatus.PROCESSING', async () => {

        expect(sent).toBeTruthy();

        expect(listingItemReceivedOnBuyerNode).toBeDefined();
        expect(listingItemReceivedOnSellerNode).toBeDefined();
        expect(mpaBidOnBuyerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaBidOnSellerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaAcceptOnSellerNode.type).toBe(MPAction.MPA_ACCEPT);
        expect(mpaAcceptOnBuyerNode.type).toBe(MPAction.MPA_ACCEPT);
        expect(mpaLockOnBuyerNode.type).toBe(MPAction.MPA_LOCK);
        expect(mpaLockOnSellerNode.type).toBe(MPAction.MPA_LOCK);
        expect(mpaCompleteOnSellerNode.type).toBe(MPActionExtended.MPA_COMPLETE);
        expect(mpaCompleteOnBuyerNode).not.toBeDefined();
        expect(orderOnSellerNode.status).toBe(OrderStatus.PROCESSING);
        expect(orderOnSellerNode.OrderItems[0].status).toBe(OrderItemStatus.ESCROW_LOCKED);
        expect(orderOnBuyerNode.status).toBe(OrderStatus.PROCESSING);
        expect(orderOnBuyerNode.OrderItems[0].status).toBe(OrderItemStatus.ESCROW_LOCKED);

        log.debug('========================================================================================');
        log.debug('Order should have been updated on seller node after sending the MPA_COMPLETE, OrderItemStatus.ESCROW_COMPLETED');
        log.debug('========================================================================================');

        await testUtilSellerNode.waitFor(5);

        const res: any = await testUtilSellerNode.rpcWaitFor(orderCommand, [orderSearchCommand,
                PAGE, PAGE_LIMIT, SEARCHORDER, ORDER_SEARCHORDERFIELD,
                mpaBidOnSellerNode.ListingItem.id,
                OrderItemStatus.ESCROW_COMPLETED,
                buyerMarket.Identity.address,
                sellerMarket.Identity.address,
                sellerMarket.address
            ],
            8 * 60,
            200,
            '[0].OrderItems[0].status',
            OrderItemStatus.ESCROW_COMPLETED.toString()
        );
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Order = res.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].hash).toBeDefined(); // TODO: bidNode1.BidDatas[orderHash]
        expect(result[0].buyer).toBe(buyerMarket.Identity.address);
        expect(result[0].seller).toBe(sellerMarket.Identity.address);
        expect(result[0].OrderItems).toHaveLength(1);
        expect(result[0].OrderItems[0].status).toBe(OrderItemStatus.ESCROW_COMPLETED);
        expect(result[0].OrderItems[0].itemHash).toBe(mpaBidOnSellerNode.ListingItem.hash);
        expect(result[0].OrderItems[0].Bid.BidDatas).toHaveLength(2);

        const completeBid: resources.Bid = _.find(result[0].OrderItems[0].Bid.ChildBids, (value: resources.Bid) => {
            return value.type === MPActionExtended.MPA_COMPLETE;
        });
        expect(completeBid.BidDatas).toHaveLength(5);

        orderOnSellerNode = result[0];

        log.debug('==> Order updated on SELLER node.');

    }, 600000); // timeout to 600s


    test('Should have received MPA_COMPLETE on BUYER node', async () => {

        expect(sent).toBeTruthy();

        expect(listingItemReceivedOnBuyerNode).toBeDefined();
        expect(listingItemReceivedOnSellerNode).toBeDefined();
        expect(mpaBidOnBuyerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaBidOnSellerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaAcceptOnSellerNode.type).toBe(MPAction.MPA_ACCEPT);
        expect(mpaAcceptOnBuyerNode.type).toBe(MPAction.MPA_ACCEPT);
        expect(mpaLockOnBuyerNode.type).toBe(MPAction.MPA_LOCK);
        expect(mpaLockOnSellerNode.type).toBe(MPAction.MPA_LOCK);
        expect(mpaCompleteOnSellerNode.type).toBe(MPActionExtended.MPA_COMPLETE);
        expect(mpaCompleteOnBuyerNode).not.toBeDefined();
        expect(orderOnSellerNode.status).toBe(OrderStatus.PROCESSING);
        expect(orderOnSellerNode.OrderItems[0].status).toBe(OrderItemStatus.ESCROW_COMPLETED);
        expect(orderOnBuyerNode.status).toBe(OrderStatus.PROCESSING);
        expect(orderOnBuyerNode.OrderItems[0].status).toBe(OrderItemStatus.ESCROW_LOCKED);


        log.debug('========================================================================================');
        log.debug('BUYER RECEIVES MPA_COMPLETE posted from sellers node, MPActionExtended.MPA_COMPLETE');
        log.debug('========================================================================================');

        await testUtilBuyerNode.waitFor(4);

        let response: any = await testUtilBuyerNode.rpcWaitFor(bidCommand, [bidSearchCommand,
                PAGE, PAGE_LIMIT, SEARCHORDER, BID_SEARCHORDERFIELD,
                listingItemReceivedOnBuyerNode.id,          // listingItemId
                MPActionExtended.MPA_COMPLETE,              // type
                '*',                                        // search string
                buyerMarket.receiveAddress,                 // market
                buyerMarket.Identity.address                // bidder
            ],
            15 * 60,
            200,
            '[0].ListingItem.id',
            listingItemReceivedOnBuyerNode.id
        );
        response.expectJson();
        response.expectStatusCode(200);
        const results: resources.Bid[] = response.getBody()['result'];
        expect(results.length).toBe(1);

        await testUtilBuyerNode.waitFor(2);

        response = await testUtilBuyerNode.rpc(bidCommand, [bidGetCommand,
            results[0].id
        ]);
        response.expectJson();
        response.expectStatusCode(200);
        const result: resources.Bid = response.getBody()['result'];

        expect(result.type).toBe(MPActionExtended.MPA_COMPLETE);
        expect(result.bidder).toBe(buyerMarket.Identity.address);
        expect(result.ListingItem.seller).toBe(sellerMarket.Identity.address);
        expect(result.ListingItem.hash).toBe(listingItemReceivedOnBuyerNode.hash);

        // there should be no relation to template on the buyer side
        expect(result.ListingItem.ListingItemTemplate).not.toBeDefined();

        // todo: check for correct biddata

        // make sure the Order/OrderItem statuses are correct
        expect(result.ParentBid.OrderItem.status).toBe(OrderItemStatus.ESCROW_COMPLETED);
        expect(result.ParentBid.OrderItem.Order.status).toBe(OrderStatus.PROCESSING);

        mpaCompleteOnBuyerNode = result;

        log.debug('==> BUYER received MPA_COMPLETE.');
    }, 600000); // timeout to 600s


    test('Should have updated Order on BUYER node: OrderItemStatus.ESCROW_COMPLETED, OrderStatus.PROCESSING', async () => {

        expect(sent).toBeTruthy();

        expect(listingItemReceivedOnBuyerNode).toBeDefined();
        expect(listingItemReceivedOnSellerNode).toBeDefined();
        expect(mpaBidOnBuyerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaBidOnSellerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaAcceptOnSellerNode.type).toBe(MPAction.MPA_ACCEPT);
        expect(mpaAcceptOnBuyerNode.type).toBe(MPAction.MPA_ACCEPT);
        expect(mpaLockOnBuyerNode.type).toBe(MPAction.MPA_LOCK);
        expect(mpaLockOnSellerNode.type).toBe(MPAction.MPA_LOCK);
        expect(mpaCompleteOnSellerNode.type).toBe(MPActionExtended.MPA_COMPLETE);
        expect(mpaCompleteOnBuyerNode.type).toBe(MPActionExtended.MPA_COMPLETE);
        expect(orderOnSellerNode.status).toBe(OrderStatus.PROCESSING);
        expect(orderOnSellerNode.OrderItems[0].status).toBe(OrderItemStatus.ESCROW_COMPLETED);
        expect(orderOnBuyerNode.status).toBe(OrderStatus.PROCESSING);
        expect(orderOnBuyerNode.OrderItems[0].status).toBe(OrderItemStatus.ESCROW_LOCKED);

        log.debug('========================================================================================');
        log.debug('BUYER RECEIVES MPA_COMPLETE posted from sellers node, OrderItemStatus.ESCROW_COMPLETED');
        log.debug('========================================================================================');

        await testUtilBuyerNode.waitFor(2);

        const res: any = await testUtilBuyerNode.rpcWaitFor(orderCommand, [orderSearchCommand,
                PAGE, PAGE_LIMIT, SEARCHORDER, ORDER_SEARCHORDERFIELD,
                mpaBidOnBuyerNode.ListingItem.id,
                OrderItemStatus.ESCROW_COMPLETED,
                buyerMarket.Identity.address,
                sellerMarket.Identity.address,
                sellerMarket.address
            ],
            8 * 60,
            200,
            '[0].OrderItems[0].status',
            OrderItemStatus.ESCROW_COMPLETED.toString()
        );
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Order = res.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].OrderItems[0].status).toBe(OrderItemStatus.ESCROW_COMPLETED);
        expect(result[0].buyer).toBe(buyerMarket.Identity.address);
        expect(result[0].seller).toBe(sellerMarket.Identity.address);

        expect(result[0].OrderItems[0].Bid.BidDatas).toHaveLength(2);

        const completeBid: resources.Bid = _.find(result[0].OrderItems[0].Bid.ChildBids, (value: resources.Bid) => {
            return value.type === MPActionExtended.MPA_COMPLETE;
        });
        expect(completeBid.BidDatas).toHaveLength(5);

        orderOnBuyerNode = result[0];

        // log.debug('orderOnBuyerNode: ', JSON.stringify(orderOnBuyerNode, null, 2));

        log.debug('==> BUYER received MPA_COMPLETE.');

    }, 600000); // timeout to 600s


    test('===> MPA_SHIP <=========================================================================', async () => {
        expect(true).toBe(true);
    }, 600000); // timeout to 600s


    test('Should post MPA_SHIP from SELLER node (BidData: shipping.memo)', async () => {

        expect(sent).toBeTruthy();

        expect(listingItemReceivedOnBuyerNode).toBeDefined();
        expect(listingItemReceivedOnSellerNode).toBeDefined();
        expect(mpaBidOnBuyerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaBidOnSellerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaAcceptOnSellerNode.type).toBe(MPAction.MPA_ACCEPT);
        expect(mpaAcceptOnBuyerNode.type).toBe(MPAction.MPA_ACCEPT);
        expect(mpaLockOnBuyerNode.type).toBe(MPAction.MPA_LOCK);
        expect(mpaLockOnSellerNode.type).toBe(MPAction.MPA_LOCK);
        expect(mpaCompleteOnSellerNode.type).toBe(MPActionExtended.MPA_COMPLETE);
        expect(mpaCompleteOnBuyerNode.type).toBe(MPActionExtended.MPA_COMPLETE);
        expect(orderOnSellerNode.status).toBe(OrderStatus.PROCESSING);
        expect(orderOnSellerNode.OrderItems[0].status).toBe(OrderItemStatus.ESCROW_COMPLETED);
        expect(orderOnBuyerNode.status).toBe(OrderStatus.PROCESSING);
        expect(orderOnBuyerNode.OrderItems[0].status).toBe(OrderItemStatus.ESCROW_COMPLETED);

        sent = false;

        log.debug('========================================================================================');
        log.debug('SELLER POSTS MPA_SHIP, indicating that the item has been sent');
        log.debug('========================================================================================');

        await testUtilSellerNode.waitFor(5);

        const res: any = await testUtilSellerNode.rpc(orderItemCommand, [orderItemShipCommand,
            orderOnSellerNode.OrderItems[0].id,
            DELIVERY_TRACKING_ID
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        sent = result.result === 'Sent.';
        if (!sent) {
            log.debug(JSON.stringify(result, null, 2));
        }
        expect(result.result).toBe('Sent.');

        log.debug('==[ ship OrderItem /// seller (node1) -> buyer (node2) ]=========================');
        log.debug('msgid: ' + result.msgid);
        log.debug('order.hash: ' + orderOnSellerNode.hash);
        log.debug('order.buyer: ' + orderOnSellerNode.buyer);
        log.debug('order.seller: ' + orderOnSellerNode.seller);
        log.debug('order.id: ' + orderOnSellerNode.id);
        log.debug('order.orderItem.id: ' + orderOnSellerNode.OrderItems[0].id);
        log.debug('=================================================================================');
    });


    test('Should have created MPA_SHIP on SELLER node', async () => {

        expect(sent).toBeTruthy();

        expect(listingItemReceivedOnBuyerNode).toBeDefined();
        expect(listingItemReceivedOnSellerNode).toBeDefined();
        expect(mpaBidOnBuyerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaBidOnSellerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaAcceptOnSellerNode.type).toBe(MPAction.MPA_ACCEPT);
        expect(mpaAcceptOnBuyerNode.type).toBe(MPAction.MPA_ACCEPT);
        expect(mpaLockOnBuyerNode.type).toBe(MPAction.MPA_LOCK);
        expect(mpaLockOnSellerNode.type).toBe(MPAction.MPA_LOCK);
        expect(mpaCompleteOnSellerNode.type).toBe(MPActionExtended.MPA_COMPLETE);
        expect(mpaCompleteOnBuyerNode.type).toBe(MPActionExtended.MPA_COMPLETE);
        expect(mpaShipOnSellerNode).not.toBeDefined();
        expect(mpaShipOnBuyerNode).not.toBeDefined();
        expect(orderOnSellerNode.status).toBe(OrderStatus.PROCESSING);
        expect(orderOnSellerNode.OrderItems[0].status).toBe(OrderItemStatus.ESCROW_COMPLETED);
        expect(orderOnBuyerNode.status).toBe(OrderStatus.PROCESSING);
        expect(orderOnBuyerNode.OrderItems[0].status).toBe(OrderItemStatus.ESCROW_COMPLETED);

        log.debug('========================================================================================');
        log.debug('SELLER CREATED MPA_SHIP');
        log.debug('========================================================================================');

        // wait for some time to make sure the Bid has been created
        await testUtilSellerNode.waitFor(4);

        let response: any = await testUtilSellerNode.rpcWaitFor(bidCommand, [bidSearchCommand,
                PAGE, PAGE_LIMIT, SEARCHORDER, BID_SEARCHORDERFIELD,
                listingItemReceivedOnSellerNode.id,         // listingItemId
                MPActionExtended.MPA_SHIP                   // type
                // '*',                                     // search string
                // '*',                                     // market
                // buyerMarket.Identity.address             // bidder
            ],
            15 * 60,
            200,
            '[0].ListingItem.id',
            listingItemReceivedOnSellerNode.id
        );
        response.expectJson();
        response.expectStatusCode(200);
        const results: resources.Bid[] = response.getBody()['result'];
        expect(results.length).toBe(1);

        await testUtilSellerNode.waitFor(2);

        response = await testUtilSellerNode.rpc(bidCommand, [bidGetCommand,
            results[0].id
        ]);
        response.expectJson();
        response.expectStatusCode(200);
        const result: resources.Bid = response.getBody()['result'];
        expect(result.type).toBe(MPActionExtended.MPA_SHIP);
        expect(result.bidder).toBe(buyerMarket.Identity.address);
        expect(result.ListingItem.hash).toBe(listingItemReceivedOnBuyerNode.hash);
        expect(result.ListingItem.seller).toBe(sellerMarket.Identity.address);

        // the relation should match the hash of the template that was created earlier on seller node
        expect(result.ListingItem.ListingItemTemplate.hash).toBe(listingItemTemplateOnSellerNode.hash);

        // expect Order and OrderItem to be created
        expect(result.ParentBid.OrderItem.id).toBeDefined();
        expect(result.ParentBid.OrderItem.Order.id).toBeDefined();

        // make sure the Order/OrderItem statuses are correct
        expect(result.ParentBid.OrderItem.status).toBe(OrderItemStatus.SHIPPING);
        expect(result.ParentBid.OrderItem.Order.status).toBe(OrderStatus.SHIPPING);

        mpaShipOnSellerNode = result;
        // log.debug('mpaBidOnSellerNode: ', JSON.stringify(mpaBidOnSellerNode, null, 2));

        log.debug('==> SELLER created MPA_COMPLETE.');

    }, 600000); // timeout to 600s


    test('Should have updated Order on SELLER node: OrderItemStatus.SHIPPING, OrderStatus.PROCESSING', async () => {

        expect(sent).toBeTruthy();

        expect(listingItemReceivedOnBuyerNode).toBeDefined();
        expect(listingItemReceivedOnSellerNode).toBeDefined();
        expect(mpaBidOnBuyerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaBidOnSellerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaAcceptOnSellerNode.type).toBe(MPAction.MPA_ACCEPT);
        expect(mpaAcceptOnBuyerNode.type).toBe(MPAction.MPA_ACCEPT);
        expect(mpaLockOnBuyerNode.type).toBe(MPAction.MPA_LOCK);
        expect(mpaLockOnSellerNode.type).toBe(MPAction.MPA_LOCK);
        expect(mpaCompleteOnSellerNode.type).toBe(MPActionExtended.MPA_COMPLETE);
        expect(mpaCompleteOnBuyerNode.type).toBe(MPActionExtended.MPA_COMPLETE);
        expect(mpaShipOnSellerNode.type).toBe(MPActionExtended.MPA_SHIP);
        expect(mpaShipOnBuyerNode).not.toBeDefined();
        expect(orderOnSellerNode.status).toBe(OrderStatus.PROCESSING);
        expect(orderOnSellerNode.OrderItems[0].status).toBe(OrderItemStatus.ESCROW_COMPLETED);
        expect(orderOnBuyerNode.status).toBe(OrderStatus.PROCESSING);
        expect(orderOnBuyerNode.OrderItems[0].status).toBe(OrderItemStatus.ESCROW_COMPLETED);

        log.debug('========================================================================================');
        log.debug('Order should have been updated on seller node after sending the MPA_SHIP, OrderItemStatus.SHIPPING');
        log.debug('========================================================================================');

        await testUtilSellerNode.waitFor(5);

        const res: any = await testUtilSellerNode.rpcWaitFor(orderCommand, [orderSearchCommand,
                PAGE, PAGE_LIMIT, SEARCHORDER, ORDER_SEARCHORDERFIELD,
                mpaBidOnSellerNode.ListingItem.id,
                OrderItemStatus.SHIPPING,
                buyerMarket.Identity.address,
                sellerMarket.Identity.address,
                sellerMarket.address
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
        expect(result[0].hash).toBeDefined(); // TODO: bidNode1.BidDatas[orderHash]
        expect(result[0].buyer).toBe(buyerMarket.Identity.address);
        expect(result[0].seller).toBe(sellerMarket.Identity.address);
        expect(result[0].OrderItems).toHaveLength(1);
        expect(result[0].OrderItems[0].status).toBe(OrderItemStatus.SHIPPING);
        expect(result[0].OrderItems[0].itemHash).toBe(mpaBidOnSellerNode.ListingItem.hash);

        const completeBid: resources.Bid = _.find(result[0].OrderItems[0].Bid.ChildBids, (value: resources.Bid) => {
            return value.type === MPActionExtended.MPA_SHIP;
        });
        expect(completeBid.BidDatas).toHaveLength(6);

        orderOnSellerNode = result[0];

        log.debug('==> Order updated on SELLER node.');

    }, 600000); // timeout to 600s


    test('Should have received MPA_SHIP on BUYER node', async () => {

        expect(sent).toBeTruthy();

        expect(listingItemReceivedOnBuyerNode).toBeDefined();
        expect(listingItemReceivedOnSellerNode).toBeDefined();
        expect(mpaBidOnBuyerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaBidOnSellerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaAcceptOnSellerNode.type).toBe(MPAction.MPA_ACCEPT);
        expect(mpaAcceptOnBuyerNode.type).toBe(MPAction.MPA_ACCEPT);
        expect(mpaLockOnBuyerNode.type).toBe(MPAction.MPA_LOCK);
        expect(mpaLockOnSellerNode.type).toBe(MPAction.MPA_LOCK);
        expect(mpaCompleteOnSellerNode.type).toBe(MPActionExtended.MPA_COMPLETE);
        expect(mpaCompleteOnBuyerNode.type).toBe(MPActionExtended.MPA_COMPLETE);
        expect(mpaShipOnSellerNode.type).toBe(MPActionExtended.MPA_SHIP);
        expect(mpaShipOnBuyerNode).not.toBeDefined();
        expect(orderOnSellerNode.status).toBe(OrderStatus.SHIPPING);
        expect(orderOnSellerNode.OrderItems[0].status).toBe(OrderItemStatus.SHIPPING);
        expect(orderOnBuyerNode.status).toBe(OrderStatus.PROCESSING);
        expect(orderOnBuyerNode.OrderItems[0].status).toBe(OrderItemStatus.ESCROW_COMPLETED);


        log.debug('========================================================================================');
        log.debug('BUYER RECEIVES MPA_SHIP posted from sellers node, MPActionExtended.MPA_SHIP');
        log.debug('========================================================================================');

        await testUtilBuyerNode.waitFor(4);

        let response: any = await testUtilBuyerNode.rpcWaitFor(bidCommand, [bidSearchCommand,
                PAGE, PAGE_LIMIT, SEARCHORDER, BID_SEARCHORDERFIELD,
                listingItemReceivedOnBuyerNode.id,          // listingItemId
                MPActionExtended.MPA_SHIP,                  // type
                '*',                                        // search string
                buyerMarket.receiveAddress,                 // market
                buyerMarket.Identity.address                // bidder
            ],
            15 * 60,
            200,
            '[0].ListingItem.id',
            listingItemReceivedOnBuyerNode.id
        );
        response.expectJson();
        response.expectStatusCode(200);
        const results: resources.Bid[] = response.getBody()['result'];
        expect(results.length).toBe(1);

        await testUtilBuyerNode.waitFor(2);

        response = await testUtilBuyerNode.rpc(bidCommand, [bidGetCommand,
            results[0].id
        ]);
        response.expectJson();
        response.expectStatusCode(200);
        const result: resources.Bid = response.getBody()['result'];

        expect(result.type).toBe(MPActionExtended.MPA_SHIP);
        expect(result.bidder).toBe(buyerMarket.Identity.address);
        expect(result.ListingItem.seller).toBe(sellerMarket.Identity.address);
        expect(result.ListingItem.hash).toBe(listingItemReceivedOnBuyerNode.hash);

        // there should be no relation to template on the buyer side
        expect(result.ListingItem.ListingItemTemplate).not.toBeDefined();

        // todo: check for correct biddata

        // make sure the Order/OrderItem statuses are correct
        expect(result.ParentBid.OrderItem.status).toBe(OrderItemStatus.SHIPPING);
        expect(result.ParentBid.OrderItem.Order.status).toBe(OrderStatus.SHIPPING);

        mpaShipOnBuyerNode = result;

        log.debug('==> BUYER received MPA_SHIP.');
    }, 600000); // timeout to 600s


    test('Should have updated Order on BUYER node: OrderItemStatus.SHIPPING, OrderStatus.PROCESSING', async () => {

        expect(sent).toBeTruthy();

        expect(listingItemReceivedOnBuyerNode).toBeDefined();
        expect(listingItemReceivedOnSellerNode).toBeDefined();
        expect(mpaBidOnBuyerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaBidOnSellerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaAcceptOnSellerNode.type).toBe(MPAction.MPA_ACCEPT);
        expect(mpaAcceptOnBuyerNode.type).toBe(MPAction.MPA_ACCEPT);
        expect(mpaLockOnBuyerNode.type).toBe(MPAction.MPA_LOCK);
        expect(mpaLockOnSellerNode.type).toBe(MPAction.MPA_LOCK);
        expect(mpaCompleteOnSellerNode.type).toBe(MPActionExtended.MPA_COMPLETE);
        expect(mpaCompleteOnBuyerNode.type).toBe(MPActionExtended.MPA_COMPLETE);
        expect(mpaShipOnSellerNode.type).toBe(MPActionExtended.MPA_SHIP);
        expect(mpaShipOnBuyerNode.type).toBe(MPActionExtended.MPA_SHIP);
        expect(orderOnSellerNode.status).toBe(OrderStatus.SHIPPING);
        expect(orderOnSellerNode.OrderItems[0].status).toBe(OrderItemStatus.SHIPPING);
        expect(orderOnBuyerNode.status).toBe(OrderStatus.PROCESSING);
        expect(orderOnBuyerNode.OrderItems[0].status).toBe(OrderItemStatus.ESCROW_COMPLETED);

        log.debug('========================================================================================');
        log.debug('BUYER RECEIVES MPA_SHIP posted from sellers node, OrderItemStatus.SHIPPING');
        log.debug('========================================================================================');

        await testUtilBuyerNode.waitFor(2);

        const res: any = await testUtilBuyerNode.rpcWaitFor(orderCommand, [orderSearchCommand,
                PAGE, PAGE_LIMIT, SEARCHORDER, ORDER_SEARCHORDERFIELD,
                mpaBidOnBuyerNode.ListingItem.id,
                OrderItemStatus.SHIPPING,
                buyerMarket.Identity.address,
                sellerMarket.Identity.address,
                sellerMarket.address
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
        expect(result[0].buyer).toBe(buyerMarket.Identity.address);
        expect(result[0].seller).toBe(sellerMarket.Identity.address);

        const completeBid: resources.Bid = _.find(result[0].OrderItems[0].Bid.ChildBids, (value: resources.Bid) => {
            return value.type === MPActionExtended.MPA_SHIP;
        });
        expect(completeBid.BidDatas).toHaveLength(6);

        orderOnBuyerNode = result[0];
        // log.debug('orderOnBuyerNode: ', JSON.stringify(orderOnBuyerNode, null, 2));

        log.debug('==> BUYER received MPA_SHIP.');

    }, 600000); // timeout to 600s


    test('===> MPA_RELEASE <======================================================================', async () => {
        expect(true).toBe(true);
    }, 600000); // timeout to 600s


    test('Should post MPA_RELEASE from BUYER node (BidData: txid.release)', async () => {

        expect(sent).toBeTruthy();

        expect(listingItemReceivedOnBuyerNode).toBeDefined();
        expect(listingItemReceivedOnSellerNode).toBeDefined();
        expect(mpaBidOnBuyerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaBidOnSellerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaAcceptOnSellerNode.type).toBe(MPAction.MPA_ACCEPT);
        expect(mpaAcceptOnBuyerNode.type).toBe(MPAction.MPA_ACCEPT);
        expect(mpaLockOnBuyerNode.type).toBe(MPAction.MPA_LOCK);
        expect(mpaLockOnSellerNode.type).toBe(MPAction.MPA_LOCK);
        expect(mpaCompleteOnSellerNode.type).toBe(MPActionExtended.MPA_COMPLETE);
        expect(mpaCompleteOnBuyerNode.type).toBe(MPActionExtended.MPA_COMPLETE);
        expect(mpaShipOnSellerNode.type).toBe(MPActionExtended.MPA_SHIP);
        expect(mpaShipOnBuyerNode.type).toBe(MPActionExtended.MPA_SHIP);
        expect(mpaReleaseOnSellerNode).not.toBeDefined();
        expect(mpaReleaseOnBuyerNode).not.toBeDefined();
        expect(orderOnSellerNode.status).toBe(OrderStatus.SHIPPING);
        expect(orderOnSellerNode.OrderItems[0].status).toBe(OrderItemStatus.SHIPPING);
        expect(orderOnBuyerNode.status).toBe(OrderStatus.SHIPPING);
        expect(orderOnBuyerNode.OrderItems[0].status).toBe(OrderItemStatus.SHIPPING);

        sent = false;

        log.debug('========================================================================================');
        log.debug('BUYER POSTS MPA_RELEASE, indicating that the item has been received');
        log.debug('========================================================================================');

        await testUtilBuyerNode.waitFor(5);

        const res: any = await testUtilBuyerNode.rpc(escrowCommand, [escrowReleaseCommand,
            orderOnBuyerNode.OrderItems[0].id,
            'kthanxbye'
        ]);
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


    test('Should have created MPA_RELEASE on BUYER node', async () => {

        expect(sent).toBeTruthy();

        expect(listingItemReceivedOnBuyerNode).toBeDefined();
        expect(listingItemReceivedOnSellerNode).toBeDefined();
        expect(mpaBidOnBuyerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaBidOnSellerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaAcceptOnSellerNode.type).toBe(MPAction.MPA_ACCEPT);
        expect(mpaAcceptOnBuyerNode.type).toBe(MPAction.MPA_ACCEPT);
        expect(mpaLockOnBuyerNode.type).toBe(MPAction.MPA_LOCK);
        expect(mpaLockOnSellerNode.type).toBe(MPAction.MPA_LOCK);
        expect(mpaCompleteOnSellerNode.type).toBe(MPActionExtended.MPA_COMPLETE);
        expect(mpaCompleteOnBuyerNode.type).toBe(MPActionExtended.MPA_COMPLETE);
        expect(mpaShipOnSellerNode.type).toBe(MPActionExtended.MPA_SHIP);
        expect(mpaShipOnBuyerNode.type).toBe(MPActionExtended.MPA_SHIP);
        expect(mpaReleaseOnSellerNode).not.toBeDefined();
        expect(mpaReleaseOnBuyerNode).not.toBeDefined();
        expect(orderOnSellerNode.status).toBe(OrderStatus.SHIPPING);
        expect(orderOnSellerNode.OrderItems[0].status).toBe(OrderItemStatus.SHIPPING);
        expect(orderOnBuyerNode.status).toBe(OrderStatus.SHIPPING);
        expect(orderOnBuyerNode.OrderItems[0].status).toBe(OrderItemStatus.SHIPPING);

        log.debug('========================================================================================');
        log.debug('Bid should have been created on BUYER node after posting the MPA_RELEASE');
        log.debug('========================================================================================');

        // wait for some time to make sure the Bid has been created
        await testUtilBuyerNode.waitFor(4);

        let response: any = await testUtilBuyerNode.rpcWaitFor(bidCommand, [bidSearchCommand,
                PAGE, PAGE_LIMIT, SEARCHORDER, BID_SEARCHORDERFIELD,
                listingItemReceivedOnBuyerNode.id,          // listingItemId
                MPActionExtended.MPA_RELEASE                // type
                // '*',                                     // search string
                // '*',                                     // market
                // buyerMarket.Identity.address             // bidder
            ],
            15 * 60,
            200,
            '[0].ListingItem.id',
            listingItemReceivedOnBuyerNode.id
        );
        response.expectJson();
        response.expectStatusCode(200);
        const results: resources.Bid[] = response.getBody()['result'];
        expect(results.length).toBe(1);

        await testUtilBuyerNode.waitFor(2);

        response = await testUtilBuyerNode.rpc(bidCommand, [bidGetCommand,
            results[0].id
        ]);
        response.expectJson();
        response.expectStatusCode(200);
        const result: resources.Bid = response.getBody()['result'];

        expect(result.type).toBe(MPActionExtended.MPA_RELEASE);
        expect(result.bidder).toBe(buyerMarket.Identity.address);
        expect(result.ListingItem.hash).toBe(listingItemReceivedOnBuyerNode.hash);
        expect(result.ListingItem.seller).toBe(sellerMarket.Identity.address);

        // there should be no relation to template on the buyer side
        expect(result.ListingItem.ListingItemTemplate).not.toBeDefined();

        // expect Order and OrderItem to be created
        expect(result.ParentBid.OrderItem.id).toBeDefined();
        expect(result.ParentBid.OrderItem.Order.id).toBeDefined();

        // make sure the Order/OrderItem statuses are correct
        expect(result.ParentBid.OrderItem.status).toBe(OrderItemStatus.COMPLETE);
        expect(result.ParentBid.OrderItem.Order.status).toBe(OrderStatus.COMPLETE);

        mpaReleaseOnBuyerNode = result;

        log.debug('==> Bid created on BUYER node.');

    }, 600000); // timeout to 600s


    test('Should have updated Order on BUYER node: OrderItemStatus.COMPLETE, OrderStatus.COMPLETE', async () => {

        expect(sent).toBeTruthy();

        expect(listingItemReceivedOnBuyerNode).toBeDefined();
        expect(listingItemReceivedOnSellerNode).toBeDefined();
        expect(mpaBidOnBuyerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaBidOnSellerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaAcceptOnSellerNode.type).toBe(MPAction.MPA_ACCEPT);
        expect(mpaAcceptOnBuyerNode.type).toBe(MPAction.MPA_ACCEPT);
        expect(mpaLockOnBuyerNode.type).toBe(MPAction.MPA_LOCK);
        expect(mpaLockOnSellerNode.type).toBe(MPAction.MPA_LOCK);
        expect(mpaCompleteOnSellerNode.type).toBe(MPActionExtended.MPA_COMPLETE);
        expect(mpaCompleteOnBuyerNode.type).toBe(MPActionExtended.MPA_COMPLETE);
        expect(mpaShipOnSellerNode.type).toBe(MPActionExtended.MPA_SHIP);
        expect(mpaShipOnBuyerNode.type).toBe(MPActionExtended.MPA_SHIP);
        expect(mpaReleaseOnSellerNode).not.toBeDefined();
        expect(mpaReleaseOnBuyerNode.type).toBe(MPActionExtended.MPA_RELEASE);
        expect(orderOnSellerNode.status).toBe(OrderStatus.SHIPPING);
        expect(orderOnSellerNode.OrderItems[0].status).toBe(OrderItemStatus.SHIPPING);
        expect(orderOnBuyerNode.status).toBe(OrderStatus.SHIPPING);
        expect(orderOnBuyerNode.OrderItems[0].status).toBe(OrderItemStatus.SHIPPING);

        log.debug('========================================================================================');
        log.debug('Order should have been updated on buyer node after sending the MPA_RELEASE, OrderItemStatus.COMPLETE');
        log.debug('========================================================================================');

        await testUtilBuyerNode.waitFor(5);

        const res: any = await testUtilBuyerNode.rpc(orderCommand, [orderSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, ORDER_SEARCHORDERFIELD,
            mpaBidOnBuyerNode.ListingItem.id,
            OrderItemStatus.COMPLETE,
            buyerMarket.Identity.address,
            sellerMarket.Identity.address,
            sellerMarket.address
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Order = res.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].hash).toBeDefined(); // TODO: bidNode1.BidDatas[orderHash]
        expect(result[0].buyer).toBe(buyerMarket.Identity.address);
        expect(result[0].seller).toBe(sellerMarket.Identity.address);
        expect(result[0].OrderItems).toHaveLength(1);
        expect(result[0].OrderItems[0].status).toBe(OrderItemStatus.COMPLETE);
        expect(result[0].OrderItems[0].itemHash).toBe(mpaBidOnBuyerNode.ListingItem.hash);

        const releaseBid: resources.Bid = _.find(result[0].OrderItems[0].Bid.ChildBids, (value: resources.Bid) => {
            return value.type === MPActionExtended.MPA_RELEASE;
        });
        expect(releaseBid.BidDatas).toHaveLength(7);

        orderOnBuyerNode = result[0];

        log.debug('==> Order updated on BUYER node.');

    });


    test('Should have received MPA_RELEASE on SELLER node', async () => {

        expect(sent).toBeTruthy();

        expect(listingItemReceivedOnBuyerNode).toBeDefined();
        expect(listingItemReceivedOnSellerNode).toBeDefined();
        expect(mpaBidOnBuyerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaBidOnSellerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaAcceptOnSellerNode.type).toBe(MPAction.MPA_ACCEPT);
        expect(mpaAcceptOnBuyerNode.type).toBe(MPAction.MPA_ACCEPT);
        expect(mpaLockOnBuyerNode.type).toBe(MPAction.MPA_LOCK);
        expect(mpaLockOnSellerNode.type).toBe(MPAction.MPA_LOCK);
        expect(mpaCompleteOnSellerNode.type).toBe(MPActionExtended.MPA_COMPLETE);
        expect(mpaCompleteOnBuyerNode.type).toBe(MPActionExtended.MPA_COMPLETE);
        expect(mpaShipOnSellerNode.type).toBe(MPActionExtended.MPA_SHIP);
        expect(mpaShipOnBuyerNode.type).toBe(MPActionExtended.MPA_SHIP);
        expect(mpaReleaseOnSellerNode).not.toBeDefined();
        expect(mpaReleaseOnBuyerNode.type).toBe(MPActionExtended.MPA_RELEASE);
        expect(orderOnSellerNode.status).toBe(OrderStatus.SHIPPING);
        expect(orderOnSellerNode.OrderItems[0].status).toBe(OrderItemStatus.SHIPPING);
        expect(orderOnBuyerNode.status).toBe(OrderStatus.COMPLETE);
        expect(orderOnBuyerNode.OrderItems[0].status).toBe(OrderItemStatus.COMPLETE);

        log.debug('========================================================================================');
        log.debug('SELLER RECEIVES MPA_RELEASE posted from BUYER node');
        log.debug('========================================================================================');

        // wait for some time to make sure the Bid has been created
        await testUtilSellerNode.waitFor(2);

        let response: any = await testUtilSellerNode.rpcWaitFor(bidCommand, [bidSearchCommand,
                PAGE, PAGE_LIMIT, SEARCHORDER, BID_SEARCHORDERFIELD,
                listingItemReceivedOnSellerNode.id,         // listingItemId
                MPActionExtended.MPA_RELEASE                // type
                // '*',                                     // search string
                // '*',                                     // market
                // buyerMarket.Identity.address             // bidder
            ],
            15 * 60,
            200,
            '[0].ListingItem.id',
            listingItemReceivedOnSellerNode.id
        );
        response.expectJson();
        response.expectStatusCode(200);
        const results: resources.Bid[] = response.getBody()['result'];
        expect(results.length).toBe(1);

        await testUtilSellerNode.waitFor(2);

        response = await testUtilSellerNode.rpc(bidCommand, [bidGetCommand,
            results[0].id
        ]);
        response.expectJson();
        response.expectStatusCode(200);
        const result: resources.Bid = response.getBody()['result'];

        expect(result.type).toBe(MPActionExtended.MPA_RELEASE);
        expect(result.bidder).toBe(buyerMarket.Identity.address);
        expect(result.ListingItem.hash).toBe(listingItemReceivedOnBuyerNode.hash);
        expect(result.ListingItem.seller).toBe(sellerMarket.Identity.address);

        // the relation should match the hash of the template that was created earlier on seller node
        expect(result.ListingItem.ListingItemTemplate.hash).toBe(listingItemTemplateOnSellerNode.hash);

        // expect Order and OrderItem to be created
        expect(result.ParentBid.OrderItem.id).toBeDefined();
        expect(result.ParentBid.OrderItem.Order.id).toBeDefined();

        // make sure the Order/OrderItem statuses are correct
        expect(result.ParentBid.OrderItem.status).toBe(OrderItemStatus.COMPLETE);
        expect(result.ParentBid.OrderItem.Order.status).toBe(OrderStatus.COMPLETE);

        mpaReleaseOnSellerNode = result;
        // log.debug('mpaBidOnSellerNode: ', JSON.stringify(mpaBidOnSellerNode, null, 2));

        log.debug('==> SELLER received MPA_RELEASE.');

    }, 600000); // timeout to 600s


    test('Should have updated Order on SELLER node: OrderItemStatus.COMPLETE, OrderStatus.COMPLETE', async () => {

        expect(sent).toBeTruthy();

        expect(listingItemReceivedOnBuyerNode).toBeDefined();
        expect(listingItemReceivedOnSellerNode).toBeDefined();
        expect(mpaBidOnBuyerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaBidOnSellerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaAcceptOnSellerNode.type).toBe(MPAction.MPA_ACCEPT);
        expect(mpaAcceptOnBuyerNode.type).toBe(MPAction.MPA_ACCEPT);
        expect(mpaLockOnBuyerNode.type).toBe(MPAction.MPA_LOCK);
        expect(mpaLockOnSellerNode.type).toBe(MPAction.MPA_LOCK);
        expect(mpaCompleteOnSellerNode.type).toBe(MPActionExtended.MPA_COMPLETE);
        expect(mpaCompleteOnBuyerNode.type).toBe(MPActionExtended.MPA_COMPLETE);
        expect(mpaShipOnSellerNode.type).toBe(MPActionExtended.MPA_SHIP);
        expect(mpaShipOnBuyerNode.type).toBe(MPActionExtended.MPA_SHIP);
        expect(mpaReleaseOnSellerNode.type).toBe(MPActionExtended.MPA_RELEASE);
        expect(mpaReleaseOnBuyerNode.type).toBe(MPActionExtended.MPA_RELEASE);
        expect(orderOnSellerNode.status).toBe(OrderStatus.SHIPPING);
        expect(orderOnSellerNode.OrderItems[0].status).toBe(OrderItemStatus.SHIPPING);
        expect(orderOnBuyerNode.status).toBe(OrderStatus.COMPLETE);
        expect(orderOnBuyerNode.OrderItems[0].status).toBe(OrderItemStatus.COMPLETE);

        log.debug('========================================================================================');
        log.debug('SELLER RECEIVES MPA_RELEASE posted from buyers node, OrderItemStatus.COMPLETE');
        log.debug('========================================================================================');

        const res: any = await testUtilSellerNode.rpcWaitFor(orderCommand, [orderSearchCommand,
                PAGE, PAGE_LIMIT, SEARCHORDER, ORDER_SEARCHORDERFIELD,
                mpaBidOnSellerNode.ListingItem.id,
                OrderItemStatus.COMPLETE,
                buyerMarket.Identity.address,
                sellerMarket.Identity.address,
                sellerMarket.address
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
        expect(result[0].buyer).toBe(buyerMarket.Identity.address);
        expect(result[0].seller).toBe(sellerMarket.Identity.address);

        const releaseBid: resources.Bid = _.find(result[0].OrderItems[0].Bid.ChildBids, (value: resources.Bid) => {
            return value.type === MPActionExtended.MPA_RELEASE;
        });
        expect(releaseBid.BidDatas).toHaveLength(7);

        orderOnSellerNode = result[0];

        log.debug('==> SELLER received MPA_RELEASE.');

    }, 600000); // timeout to 600s


    test('Should have no locked outputs left', async () => {

        expect(sent).toBeTruthy();

        expect(listingItemReceivedOnBuyerNode).toBeDefined();
        expect(listingItemReceivedOnSellerNode).toBeDefined();
        expect(mpaBidOnBuyerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaBidOnSellerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaAcceptOnSellerNode.type).toBe(MPAction.MPA_ACCEPT);
        expect(mpaAcceptOnBuyerNode.type).toBe(MPAction.MPA_ACCEPT);
        expect(mpaLockOnBuyerNode.type).toBe(MPAction.MPA_LOCK);
        expect(mpaLockOnSellerNode.type).toBe(MPAction.MPA_LOCK);
        expect(mpaCompleteOnSellerNode.type).toBe(MPActionExtended.MPA_COMPLETE);
        expect(mpaCompleteOnBuyerNode.type).toBe(MPActionExtended.MPA_COMPLETE);
        expect(mpaShipOnSellerNode.type).toBe(MPActionExtended.MPA_SHIP);
        expect(mpaShipOnBuyerNode.type).toBe(MPActionExtended.MPA_SHIP);
        expect(mpaReleaseOnSellerNode.type).toBe(MPActionExtended.MPA_RELEASE);
        expect(mpaReleaseOnBuyerNode.type).toBe(MPActionExtended.MPA_RELEASE);

        expect(orderOnSellerNode.status).toBe(OrderStatus.COMPLETE);
        expect(orderOnSellerNode.OrderItems[0].status).toBe(OrderItemStatus.COMPLETE);
        expect(orderOnBuyerNode.status).toBe(OrderStatus.COMPLETE);
        expect(orderOnBuyerNode.OrderItems[0].status).toBe(OrderItemStatus.COMPLETE);

        let response: any = await testUtilSellerNode.rpc(daemonCommand, [
            sellerMarket.Identity.wallet,
            'listlockunspent'
        ]);
        response.expectJson();
        response.expectStatusCode(200);
        let result = response.getBody()['result'];
        expect(result.length).toBe(0);

        response = await testUtilBuyerNode.rpc(daemonCommand, [
            buyerMarket.Identity.wallet,
            'listlockunspent'
        ]);
        response.expectJson();
        response.expectStatusCode(200);
        result = response.getBody()['result'];
        expect(result.length).toBe(0);

        log.debug('==> No locked outputs left.');

    }, 600000); // timeout to 600s

});
