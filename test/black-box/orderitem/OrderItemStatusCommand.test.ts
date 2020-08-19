// Copyright (c) 2017-2020, The Particl Market developers
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
import { OrderItemStatusResponse } from '../../../src/core/helpers/OrderItemStatusResponse';
import { BidSearchOrderField, ListingItemSearchOrderField, OrderSearchOrderField } from '../../../src/api/enums/SearchOrderField';
import { OrderStatus } from '../../../src/api/enums/OrderStatus';
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
    const listingItemSearchCommand = Commands.ITEM_SEARCH.commandName;
    const listingItemGetCommand = Commands.ITEM_GET.commandName;
    const bidCommand = Commands.BID_ROOT.commandName;
    const bidSendCommand = Commands.BID_SEND.commandName;
    const bidSearchCommand = Commands.BID_SEARCH.commandName;
    const bidAcceptCommand = Commands.BID_ACCEPT.commandName;
    const orderCommand = Commands.ORDER_ROOT.commandName;
    const orderSearchCommand = Commands.ORDER_SEARCH.commandName;
    const orderItemCommand = Commands.ORDERITEM_ROOT.commandName;
    const orderItemStatusCommand = Commands.ORDERITEM_STATUS.commandName;
    const daemonCommand = Commands.DAEMON_ROOT.commandName;

    let sellerProfile: resources.Profile;
    let buyerProfile: resources.Profile;
    let sellerMarket: resources.Market;
    let buyerMarket: resources.Market;

    let listingItemTemplateOnSellerNode: resources.ListingItemTemplate;
    let listingItemReceivedOnSellerNode: resources.ListingItem;
    let listingItemReceivedOnBuyerNode: resources.ListingItem;

    let mpaBidOnBuyerNode: resources.Bid;
    let mpaBidOnSellerNode: resources.Bid;

    let mpaAcceptOnBuyerNode: resources.Bid;
    let mpaAcceptOnSellerNode: resources.Bid;

    let orderOnSellerNode: resources.Order;
    let orderOnBuyerNode: resources.Order;

    const PAGE = 0;
    const PAGE_LIMIT = 10;
    const SEARCHORDER = SearchOrder.ASC;
    const LISTINGITEM_SEARCHORDERFIELD = ListingItemSearchOrderField.CREATED_AT;
    const BID_SEARCHORDERFIELD = BidSearchOrderField.CREATED_AT;
    const ORDER_SEARCHORDERFIELD = OrderSearchOrderField.CREATED_AT;

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
        // log.debug('sellerProfile: ', JSON.stringify(sellerProfile, null, 2));
        // log.debug('buyerProfile: ', JSON.stringify(buyerProfile, null, 2));

        sellerMarket = await testUtilSellerNode.getDefaultMarket(sellerProfile.id);
        buyerMarket = await testUtilBuyerNode.getDefaultMarket(buyerProfile.id);
        expect(sellerMarket.id).toBeDefined();
        expect(buyerMarket.id).toBeDefined();
        // log.debug('sellerMarket: ', JSON.stringify(sellerMarket, null, 2));
        // log.debug('buyerMarket: ', JSON.stringify(buyerMarket, null, 2));

        // generate ListingItemTemplate
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,               // generateItemInformation
            true,               // generateItemLocation
            true,               // generateShippingDestinations
            false,              // generateItemImages
            true,               // generatePaymentInformation
            true,               // generateEscrow
            true,               // generateItemPrice
            false,              // generateMessagingInformation
            false,              // generateListingItemObjects
            false,              // generateObjectDatas
            sellerProfile.id,   // profileId
            false,              // generateListingItem
            sellerMarket.id     // soldOnMarketId
        ]).toParamsArray();

        const listingItemTemplatesSellerNode = await testUtilSellerNode.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplate[];

        listingItemTemplateOnSellerNode = listingItemTemplatesSellerNode[0];
        expect(listingItemTemplateOnSellerNode.id).toBeDefined();

        // we should be also able to get the ListingItemTemplate
        const res: any = await testUtilSellerNode.rpc(templateCommand, [templateGetCommand,
            listingItemTemplateOnSellerNode.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.ListingItemTemplate = res.getBody()['result'];
        // log.debug('listingItemTemplate.id:', listingItemTemplateOnSellerNode.id);
        // log.debug('result.id:', result.id);
        expect(result.id).toBe(listingItemTemplatesSellerNode[0].id);

        log.debug('==> Setup DONE.');
    });

    test('Should unlock the possibly locked outputs left from other tests', async () => {
        await testUtilSellerNode.unlockLockedOutputs(sellerMarket.Identity.wallet);
        await testUtilBuyerNode.unlockLockedOutputs(buyerMarket.Identity.wallet);
    }, 600000); // timeout to 600s

    test('Should post ListingItem from SELLER node', async () => {

        log.debug('========================================================================================');
        log.debug('SELLER POSTS MPA_LISTING_ADD');
        log.debug('========================================================================================');

        await testUtilSellerNode.waitFor(5);
        expect(listingItemTemplateOnSellerNode.id).toBeDefined();

        // Post ListingItemTemplate to create ListingItem
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

        log.debug('==> ListingItemTemplate posted.');

    }, 600000); // timeout to 600s


    test('Should get the updated ListingItemTemplate with the hash', async () => {
        const res: any = await testUtilSellerNode.rpc(templateCommand, [templateGetCommand,
            listingItemTemplateOnSellerNode.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        listingItemTemplateOnSellerNode = res.getBody()['result'];

        expect(listingItemTemplateOnSellerNode.hash).toBeDefined();
        log.debug('listingItemTemplateOnSellerNode.hash: ', listingItemTemplateOnSellerNode.hash);
    });


    test('Should have received ListingItem (MPA_LISTING_ADD) on SELLER node, ListingItem is created', async () => {

        // sending should have succeeded for this test to work
        expect(sent).toBeTruthy();

        log.debug('========================================================================================');
        log.debug('SELLER RECEIVES MPA_LISTING_ADD posted from sellers node, ListingItem is created and matched with the existing ListingItemTemplate');
        log.debug('========================================================================================');

        let response: any = await testUtilSellerNode.rpcWaitFor(
            listingItemCommand,
            [listingItemSearchCommand,
                PAGE, PAGE_LIMIT, SEARCHORDER, LISTINGITEM_SEARCHORDERFIELD,
                buyerMarket.receiveAddress,
                [],
                '*',
                null,
                null,
                null,
                null,
                null,
                null,
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

        // sometimes result.ListingItemTemplate is undefined, this is likely because we
        // just received the ListingItem and it hasn't been linked with the ListingItemTemplate yet.
        // so, we wait some time and fetch it again..
        await testUtilSellerNode.waitFor(5);

        response = await testUtilSellerNode.rpc(listingItemCommand, [listingItemGetCommand,
            results[0].id
        ]);
        response.expectJson();
        response.expectStatusCode(200);

        const result: resources.ListingItem = response.getBody()['result'];
        expect(result).toBeDefined();
        log.debug('result.hash: ', result.hash);
        log.debug('listingItemTemplatesSellerNode[0].hash: ', listingItemTemplateOnSellerNode.hash);
        log.debug('result.ListingItemTemplate.hash: ', listingItemTemplateOnSellerNode.hash);
        expect(result.hash).toBe(listingItemTemplateOnSellerNode.hash);
        expect(result.ListingItemTemplate.hash).toBe(listingItemTemplateOnSellerNode.hash);

        // store ListingItem for later tests
        listingItemReceivedOnSellerNode = result;

        log.debug('==> SELLER received MPA_LISTING_ADD.');
    }, 600000); // timeout to 600s


    test('Should have received ListingItem (MPA_LISTING_ADD) on BUYER node, ListingItem is created', async () => {

        // ListingItem should have been received on seller node
        expect(listingItemReceivedOnSellerNode).toBeDefined();

        // sending should have succeeded for this test to work
        expect(sent).toBeTruthy();

        log.debug('========================================================================================');
        log.debug('BUYER RECEIVES MPA_LISTING_ADD posted from sellers node, ListingItem is created');
        log.debug('========================================================================================');

        let response: any = await testUtilBuyerNode.rpcWaitFor(
            listingItemCommand,
            [listingItemSearchCommand,
                PAGE, PAGE_LIMIT, SEARCHORDER, LISTINGITEM_SEARCHORDERFIELD,
                buyerMarket.receiveAddress,
                [],
                '*',
                null,
                null,
                null,
                null,
                null,
                null,
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

        // seller node already received this, but wait a while, and refetch, just in case
        await testUtilBuyerNode.waitFor(5);

        response = await testUtilBuyerNode.rpc(listingItemCommand, [listingItemGetCommand,
            results[0].id
        ]);
        response.expectJson();
        response.expectStatusCode(200);

        const result: resources.ListingItem = response.getBody()['result'];
        expect(result).toBeDefined();
        expect(result.hash).toBe(listingItemTemplateOnSellerNode.hash);

        // store ListingItem for later tests
        listingItemReceivedOnBuyerNode = result;

        log.debug('==> BUYER received MPA_LISTING_ADD.');
    }, 600000); // timeout to 600s


    test('Should return an empty OrderItemStatus list since there are no Bids or Orders yet', async () => {

        expect(listingItemReceivedOnBuyerNode).toBeDefined();

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

        expect(listingItemReceivedOnBuyerNode).toBeDefined();
        sent = false;

        const res = await testUtilBuyerNode.rpc(bidCommand, [bidSendCommand,
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

        const result: any = res.getBody()['result'];
        sent = result.result === 'Sent.';
        if (!sent) {
            log.debug(JSON.stringify(result, null, 2));
        }
        expect(result.result).toBe('Sent.');
        log.debug('result: ', JSON.stringify(result, null, 2));
        log.debug('==> Bid posted.');
    });


    test('Should have created Bid on BUYER node after posting the MPA_BID', async () => {

        expect(sent).toBeTruthy();
        expect(listingItemReceivedOnBuyerNode).toBeDefined();

        // wait for some time to make sure the Bid has been created
        await testUtilBuyerNode.waitFor(5);

        const res: any = await testUtilBuyerNode.rpc(bidCommand, [bidSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, BID_SEARCHORDERFIELD,
            listingItemReceivedOnBuyerNode.id             // listingItemId
            // MPAction.MPA_BID,                        // type
            // '*',                                     // search string
            // '*',                                     // market
            // buyerMarket.Identity.address             // bidder
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Bid[] = res.getBody()['result'];
        // log.debug('result: ', JSON.stringify(result, null, 2));
        expect(result.length).toBe(1);
        expect(result[0].type).toBe(MPAction.MPA_BID);
        expect(result[0].bidder).toBe(buyerMarket.Identity.address);
        expect(result[0].ListingItem.hash).toBe(listingItemReceivedOnBuyerNode.hash);
        expect(result[0].ListingItem.seller).toBe(sellerMarket.Identity.address);

        // there should be no relation to template on the buyer side
        expect(result[0].ListingItem.ListingItemTemplate).not.toBeDefined();
        mpaBidOnBuyerNode = result[0];

        // expect Order and OrderItem to be created
        expect(result[0].OrderItem.id).toBeDefined();
        expect(result[0].OrderItem.Order.id).toBeDefined();

        log.debug('==> Bid found on buyer node.');

    }, 600000); // timeout to 600s


    test('Should have received Bid (MPA_BID) on SELLER node', async () => {

        expect(sent).toBeTruthy();
        expect(listingItemReceivedOnSellerNode).toBeDefined();

        // Bid should have been created on buyer node
        expect(mpaBidOnBuyerNode).toBeDefined();

        log.debug('========================================================================================');
        log.debug('SELLER RECEIVES MPA_BID posted from buyers node');
        log.debug('========================================================================================');

        // wait for some time to make sure the Bid has been created
        await testUtilSellerNode.waitFor(5);

        const res: any = await testUtilSellerNode.rpcWaitFor(bidCommand, [bidSearchCommand,
                PAGE, PAGE_LIMIT, SEARCHORDER, BID_SEARCHORDERFIELD,
                listingItemReceivedOnSellerNode.id,
                MPAction.MPA_BID                            // type
                // '*',                                     // search string
                // '*',                                     // market
                // buyerMarket.Identity.address             // bidder
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
        expect(result[0].bidder).toBe(buyerMarket.Identity.address);
        expect(result[0].ListingItem).toBeDefined();
        expect(result[0].ListingItem.seller).toBe(sellerMarket.Identity.address);
        expect(result[0].ListingItem.hash).toBe(listingItemReceivedOnSellerNode.hash);

        // there should be a relation to template on the seller side
        expect(result[0].ListingItem.ListingItemTemplate).toBeDefined();

        // the relation should match the hash of the template that was created earlier on seller node
        expect(result[0].ListingItem.ListingItemTemplate.hash).toBe(listingItemTemplateOnSellerNode.hash);

        // todo: check for correct biddata
        mpaBidOnSellerNode = result[0];
        // log.debug('mpaBidOnSellerNode: ', JSON.stringify(mpaBidOnSellerNode, null, 2));

        // expect Order and OrderItem to be created
        expect(result[0].OrderItem.id).toBeDefined();
        expect(result[0].OrderItem.Order.id).toBeDefined();

        log.debug('==> SELLER received MPA_BID.');
    }, 600000); // timeout to 600s


    test('Should get OrderItemStatus from BUYER node (bidtype=MPA_BID)', async () => {

        expect(sent).toBeTruthy();
        expect(mpaBidOnBuyerNode).toBeDefined();
        expect(mpaBidOnSellerNode).toBeDefined();

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
        expect(myOrderItems[0].listingItemHash).toBe(listingItemReceivedOnBuyerNode.hash);
        expect(myOrderItems[0].bidType).toBe(MPAction.MPA_BID);
        expect(myOrderItems[0].buyer).toBe(buyerMarket.Identity.address);
        expect(myOrderItems[0].seller).toBe(sellerMarket.Identity.address);

        log.debug('==> Correct status got from buyer node.');
    });


    test('Should get OrderItemStatus from SELLER node (bidtype=MPA_BID)', async () => {

        expect(sent).toBeTruthy();
        expect(mpaBidOnSellerNode).toBeDefined();

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
        expect(myOrderItems[0].listingItemHash).toBe(listingItemReceivedOnBuyerNode.hash);
        expect(myOrderItems[0].bidType).toBe(MPAction.MPA_BID);
        expect(myOrderItems[0].buyer).toBe(buyerMarket.Identity.address);
        expect(myOrderItems[0].seller).toBe(sellerMarket.Identity.address);

        // log.debug('myOrderItems: ', JSON.stringify(myOrderItems, null, 2));
        log.debug('==> Correct status: MPA_BID got from seller node.');
    });


    test('Should post MPA_ACCEPT from SELLER node', async () => {

        // Bid should have been created on seller node
        expect(mpaBidOnSellerNode).toBeDefined();
        sent = false;

        await testUtilSellerNode.waitFor(5);

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

        log.debug('==[ accept Bid /// seller (node1) -> buyer (node2) ]=============================');
        log.debug('msgid: ' + result.msgid);
        log.debug('item.hash: ' + mpaBidOnSellerNode.ListingItem.hash);
        log.debug('bid.id: ' + mpaBidOnSellerNode.id);
        log.debug('bid.bidder: ' + mpaBidOnSellerNode.bidder);
        log.debug('bid.ListingItem.seller: ' + mpaBidOnSellerNode.ListingItem.seller);
        log.debug('=================================================================================');
    }, 600000); // timeout to 600s


    test('Should find MPA_ACCEPT on SELLER node after posting the MPA_ACCEPT', async () => {
        expect(sent).toBeTruthy();

        log.debug('========================================================================================');
        log.debug('Bid should have been updated on seller node after posting the MPA_ACCEPT');
        log.debug('========================================================================================');

        // wait for some time to make sure the Bid has been updated
        await testUtilSellerNode.waitFor(5);

        const res: any = await testUtilSellerNode.rpcWaitFor(bidCommand, [bidSearchCommand,
                PAGE, PAGE_LIMIT, SEARCHORDER, BID_SEARCHORDERFIELD,
                listingItemReceivedOnSellerNode.id,
                MPAction.MPA_ACCEPT                         // type
                // '*',                                     // search string
                // '*',                                     // market
                // buyerMarket.Identity.address             // bidder
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
        expect(result[0].ListingItem.hash).toBe(mpaBidOnSellerNode.ListingItem.hash);
        expect(result[0].bidder).toBe(buyerMarket.Identity.address);
        expect(result[0].ListingItem.seller).toBe(sellerMarket.Identity.address);

        // there should be a relation to template on the seller side
        expect(result[0].ListingItem.ListingItemTemplate.hash).toBe(listingItemTemplateOnSellerNode.hash);

        mpaAcceptOnSellerNode = result[0];

        log.debug('==> Bid updated on SELLER node.');
    });

    test('Order should have been created on SELLER node after posting the MPA_ACCEPT', async () => {
        expect(sent).toBeTruthy();
        expect(mpaBidOnSellerNode).toBeDefined();
        expect(mpaAcceptOnSellerNode).toBeDefined();

        // wait for some time to make sure the Order has been created
        await testUtilSellerNode.waitFor(5);

        const res = await testUtilSellerNode.rpc(orderCommand, [orderSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, ORDER_SEARCHORDERFIELD,
            listingItemReceivedOnSellerNode.id,
            OrderItemStatus.AWAITING_ESCROW             // status (AWAITING_ESCROW = seller has accepted buyers bid, waiting for buyer payment)
            // '*',                                     // search string
            // '*',                                     // market
            // buyerMarket.Identity.address             // bidder
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Order = res.getBody()['result'];
        // log.debug(JSON.stringify(result, null, 2));
        expect(result.length).toBe(1);
        expect(result[0].hash).toBeDefined();
        expect(result[0].buyer).toBe(buyerMarket.Identity.address);
        expect(result[0].seller).toBe(sellerMarket.Identity.address);
        expect(result[0].status).toBe(OrderStatus.PROCESSING);
        expect(result[0].OrderItems).toHaveLength(1);
        expect(result[0].OrderItems[0].status).toBe(OrderItemStatus.AWAITING_ESCROW);
        expect(result[0].OrderItems[0].itemHash).toBe(mpaBidOnSellerNode.ListingItem.hash);

        orderOnSellerNode = result[0];

        log.debug('==> Order created on SELLER node.');

    }, 600000); // timeout to 600s


    test('Should get OrderItemStatus from SELLER node (bidtype=MPA_ACCEPT, orderStatus=AWAITING_ESCROW)', async () => {

        expect(sent).toBeTruthy();
        expect(mpaBidOnSellerNode).toBeDefined();
        expect(mpaAcceptOnSellerNode).toBeDefined();
        expect(orderOnSellerNode).toBeDefined();

        // wait for some time to make sure the Bid has been created
        await testUtilSellerNode.waitFor(5);

        const orderItemStatusRes = await testUtilSellerNode.rpc(orderItemCommand, [orderItemStatusCommand,
            '*',        // itemHash
            '*',        // buyer
            '*'         // seller
        ]);
        orderItemStatusRes.expectJson();
        orderItemStatusRes.expectStatusCode(200);
        const myOrderItems: OrderItemStatusResponse[] = orderItemStatusRes.getBody()['result'];
        // log.debug('myOrderItems: ', JSON.stringify(myOrderItems, null, 2));

        // Check we receive order that was bid upon
        expect(myOrderItems.length).toBe(1);
        expect(myOrderItems[0].listingItemHash).toBe(listingItemReceivedOnBuyerNode.hash);
        expect(myOrderItems[0].bidType).toBe(MPAction.MPA_ACCEPT);
        expect(myOrderItems[0].orderStatus).toBe(OrderItemStatus.AWAITING_ESCROW);
        expect(myOrderItems[0].buyer).toBe(buyerMarket.Identity.address);
        expect(myOrderItems[0].seller).toBe(sellerMarket.Identity.address);

        log.debug('==> Correct status: MPA_ACCEPT got from seller node.');

    });


    test('Should receive MPA_ACCEPT on BUYER node after posting the MPA_ACCEPT', async () => {
        expect(sent).toBeTruthy();
        expect(mpaBidOnSellerNode).toBeDefined();
        expect(orderOnSellerNode).toBeDefined();

        await testUtilBuyerNode.waitFor(5);

        const res: any = await testUtilBuyerNode.rpcWaitFor(bidCommand, [bidSearchCommand,
                PAGE, PAGE_LIMIT, SEARCHORDER, BID_SEARCHORDERFIELD,
                listingItemReceivedOnBuyerNode.id,
                MPAction.MPA_ACCEPT                        // type
                // '*',                                     // search string
                // '*',                                     // market
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
        expect(result[0].bidder).toBe(buyerMarket.Identity.address);
        expect(result[0].ListingItem.seller).toBe(sellerMarket.Identity.address);
        expect(result[0].ListingItem.hash).toBe(listingItemReceivedOnSellerNode.hash);

        // there should be no relation to template on the buyer side
        expect(result[0].ListingItem.ListingItemTemplate).not.toBeDefined();

        mpaAcceptOnBuyerNode = result[0];

        log.debug('==> BUYER received MPA_ACCEPT.');
    }, 600000); // timeout to 600s


    test('Should have created Order on BUYER node after receiving the MPA_ACCEPT', async () => {

        expect(sent).toBeTruthy();
        expect(mpaBidOnSellerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaAcceptOnSellerNode.type).toBe(MPAction.MPA_ACCEPT);
        expect(orderOnSellerNode.status).toBe(OrderStatus.PROCESSING);
        expect(orderOnSellerNode.OrderItems[0].status).toBe(OrderItemStatus.AWAITING_ESCROW);

        expect(mpaBidOnBuyerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaAcceptOnBuyerNode.type).toBe(MPAction.MPA_ACCEPT);

        // wait for some time to make sure the Order has been created
        await testUtilBuyerNode.waitFor(5);

        log.debug('listingItemReceivedOnBuyerNode.id: ', listingItemReceivedOnBuyerNode.id);

        const res = await testUtilBuyerNode.rpc(orderCommand, [orderSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, ORDER_SEARCHORDERFIELD,
            listingItemReceivedOnBuyerNode.id,
            OrderItemStatus.AWAITING_ESCROW             // status (AWAITING_ESCROW = seller has accepted buyers bid, waiting for buyer payment)
            // '*',                                     // search string
            // '*',                                     // market
            // buyerMarket.Identity.address             // bidder
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Order = res.getBody()['result'];
        // log.debug(JSON.stringify(result, null, 2));
        expect(result.length).toBe(1);
        expect(result[0].hash).toBeDefined(); // TODO: bidNode1.BidDatas[orderHash]
        expect(result[0].buyer).toBe(buyerMarket.Identity.address);
        expect(result[0].seller).toBe(sellerMarket.Identity.address);
        expect(result[0].status).toBe(OrderStatus.PROCESSING);
        expect(result[0].OrderItems).toHaveLength(1);
        expect(result[0].OrderItems[0].status).toBe(OrderItemStatus.AWAITING_ESCROW);
        expect(result[0].OrderItems[0].itemHash).toBe(mpaBidOnSellerNode.ListingItem.hash);

        orderOnBuyerNode = result[0];

        log.debug('==> Order created on BUYER node.');
    });


    test('Should get OrderItemStatus from BUYER node (bidtype=MPA_ACCEPT, orderStatus=AWAITING_ESCROW)', async () => {

        expect(sent).toBeTruthy();

        expect(mpaBidOnSellerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaAcceptOnSellerNode.type).toBe(MPAction.MPA_ACCEPT);
        expect(orderOnSellerNode.status).toBe(OrderStatus.PROCESSING);
        expect(orderOnSellerNode.OrderItems[0].status).toBe(OrderItemStatus.AWAITING_ESCROW);

        expect(mpaBidOnBuyerNode.type).toBe(MPAction.MPA_BID);
        expect(mpaAcceptOnBuyerNode.type).toBe(MPAction.MPA_ACCEPT);
        expect(orderOnBuyerNode.status).toBe(OrderStatus.PROCESSING);
        expect(orderOnBuyerNode.OrderItems[0].status).toBe(OrderItemStatus.AWAITING_ESCROW);

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
        expect(myOrderItems[0].listingItemHash).toBe(listingItemReceivedOnBuyerNode.hash);
        expect(myOrderItems[0].bidType).toBe(MPAction.MPA_ACCEPT);
        expect(myOrderItems[0].orderStatus).toBe(OrderItemStatus.AWAITING_ESCROW);
        expect(myOrderItems[0].buyer).toBe(buyerMarket.Identity.address);
        expect(myOrderItems[0].seller).toBe(sellerMarket.Identity.address);

        // log.debug('myOrderItems: ', JSON.stringify(myOrderItems, null, 2));
        log.debug('==> Correct status got from seller node.');
    });

});
