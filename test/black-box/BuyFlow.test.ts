///<reference path="../../node_modules/@types/jest/index.d.ts"/>
// tslint:disable:max-line-length
import { Logger as LoggerType } from '../../src/core/Logger';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Commands } from '../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { GenerateListingItemTemplateParams } from '../../src/api/requests/params/GenerateListingItemTemplateParams';
import * as resources from 'resources';
import { BidMessageType } from '../../src/api/enums/BidMessageType';
import { SearchOrder } from '../../src/api/enums/SearchOrder';
import {OrderStatus} from '../../src/api/enums/OrderStatus';
// tslint:enable:max-line-length

describe('Happy BuyFlow', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    // const testUtilNode0 = new BlackBoxTestUtil(0);
    const testUtilNode1 = new BlackBoxTestUtil(1);  // SELLER
    const testUtilNode2 = new BlackBoxTestUtil(2);  // BUYER

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

    let sellerProfile: resources.Profile;
    let buyerProfile: resources.Profile;
    let defaultMarket: resources.Market;

    let listingItemTemplatesNode1: resources.ListingItemTemplate[];
    let listingItemReceivedNode1: resources.ListingItem;
    let listingItemReceivedNode2: resources.ListingItem;

    let bidNode1: resources.Bid;
    let bidNode2: resources.Bid;

    let orderNode1: resources.Order;
    let orderNode2: resources.Order;

    beforeAll(async () => {

        // await testUtilNode0.cleanDb();
        await testUtilNode1.cleanDb();
        await testUtilNode2.cleanDb();

        // get seller and buyer profiles
        sellerProfile = await testUtilNode1.getDefaultProfile();
        expect(sellerProfile.id).toBeDefined();

        buyerProfile = await testUtilNode2.getDefaultProfile();
        expect(buyerProfile.id).toBeDefined();

        log.debug('sellerProfile: ', JSON.stringify(sellerProfile, null, 2));
        log.debug('buyerProfile: ', JSON.stringify(buyerProfile, null, 2));

        defaultMarket = await testUtilNode1.getDefaultMarket();
        expect(defaultMarket.id).toBeDefined();

        log.debug('defaultMarket: ', JSON.stringify(defaultMarket, null, 2));

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateShippingDestinations
            false,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            false,    // generateListingItemObjects
            false,  // generateObjectDatas
            sellerProfile.id,    // profileId
            false,   // generateListingItem
            defaultMarket.id     // marketId
        ]).toParamsArray();

        // generate listingItemTemplate
        listingItemTemplatesNode1 = await testUtilNode1.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplates[];

        expect(listingItemTemplatesNode1[0].id).toBeDefined();

        // we should be also able to get the template
        const templateGetRes: any = await testUtilNode1.rpc(templateCommand, [templateGetCommand, listingItemTemplatesNode1[0].id]);
        templateGetRes.expectJson();
        templateGetRes.expectStatusCode(200);
        const result: resources.ListingItemTemplate = templateGetRes.getBody()['result'];

        log.debug('listingItemTemplates[0].hash:', listingItemTemplatesNode1[0].hash);
        log.debug('result.hash:', result.hash);
        expect(result.hash).toBe(listingItemTemplatesNode1[0].hash);

    });

    test('Should post a ListingItemTemplate (ListingItemMessage, MP_ITEM_ADD) to the default marketplace from node1', async () => {

        // log.debug('listingItemTemplates[0]:', listingItemTemplatesNode0[0]);

        const templatePostRes: any = await testUtilNode1.rpc(templateCommand, [templatePostCommand, listingItemTemplatesNode1[0].id, defaultMarket.id]);
        templatePostRes.expectJson();
        templatePostRes.expectStatusCode(200);

        // make sure we got the expected result from posting the template
        const result: any = templatePostRes.getBody()['result'];
        expect(result.result).toBe('Sent.');
        // smsgservice.sendsmsg skips paid messages when development or test environment flag is set
        // expect(result.txid).toBeDefined();
        // expect(result.fee).toBeGreaterThan(0);

        log.debug('==[ post ListingItemTemplate /// seller (node1) -> marketplace ]========================');
        log.debug('item.id: ' + listingItemTemplatesNode1[0].id);
        log.debug('item.hash: ' + listingItemTemplatesNode1[0].hash);
        log.debug('item.title: ' + listingItemTemplatesNode1[0].ItemInformation.title);
        log.debug('item.desc: ' + listingItemTemplatesNode1[0].ItemInformation.shortDescription);
        log.debug('item.category: [' + listingItemTemplatesNode1[0].ItemInformation.ItemCategory.id + '] '
            + listingItemTemplatesNode1[0].ItemInformation.ItemCategory.name);
        log.debug('========================================================================================');

    });

    test('Should receive ListingItemMessage (MP_ITEM_ADD) posted from sellers node1 as ListingItem on bidders node2', async () => {

        log.debug('WAIT FOR: MP_ITEM_ADD on bidder node2');
        const itemGetRes: any = await testUtilNode2.rpcWaitFor(
            listingItemCommand,
            [listingItemGetCommand, listingItemTemplatesNode1[0].hash],
            8 * 60,
            200,
            'hash',
            listingItemTemplatesNode1[0].hash
        );
        itemGetRes.expectJson();
        itemGetRes.expectStatusCode(200);

        const result: resources.ListingItem = itemGetRes.getBody()['result'];
        expect(result.hash).toBe(listingItemTemplatesNode1[0].hash);

        // store ListingItem for later tests
        listingItemReceivedNode2 = result;

    }, 600000); // timeout to 600s

// tslint:disable:max-line-length
    test('Should receive ListingItemMessage (MP_ITEM_ADD) posted from sellers node1 as ListingItem on sellers node1 and match it with the existing ListingItemTemplate', async () => {

        log.debug('WAIT FOR: MP_ITEM_ADD on seller node1');
        const itemGetRes: any = await testUtilNode1.rpcWaitFor(
            listingItemCommand,
            [listingItemGetCommand, listingItemTemplatesNode1[0].hash],
            8 * 60,
            200,
            'hash',
            listingItemTemplatesNode1[0].hash
        );
        itemGetRes.expectJson();
        itemGetRes.expectStatusCode(200);

        // make sure we got the expected result from seller node
        // -> meaning item hash was matched with the existing template hash
        const result: resources.ListingItem = itemGetRes.getBody()['result'];

        log.debug('ListingItem on seller node1: ', result);
        expect(result.hash).toBe(listingItemTemplatesNode1[0].hash);
        expect(result.ListingItemTemplate.hash).toBe(listingItemTemplatesNode1[0].hash);

        // store ListingItem for later tests
        listingItemReceivedNode1 = result;

    }, 600000); // timeout to 600s
// tslint:enable:max-line-length

    test('Should send BidMessage (MPA_BID) for the ListingItem from bidders node2 to the sellers node1', async () => {

        const bidSendCommandParams = [
            bidSendCommand,
            listingItemReceivedNode2.hash,
            buyerProfile.id,
            buyerProfile.ShippingAddresses[0].id,
            'colour',   // TODO: make sure created template/item has these options and test that these end up in the Order
            'black',
            'size',
            'xl'
        ];

        const bidSendRes: any = await testUtilNode2.rpc(bidCommand, bidSendCommandParams);
        bidSendRes.expectJson();
        bidSendRes.expectStatusCode(200);

        const result: any = bidSendRes.getBody()['result'];
        log.debug('result', result);
        expect(result.result).toBe('Sent.');

        log.debug('==[ send Bid /// buyer (node2) -> seller (node1) ]=============================');
        log.debug('msgid: ' + result.msgid);
        log.debug('item.hash: ' + listingItemReceivedNode2.hash);
        log.debug('item.seller: ' + listingItemReceivedNode2.seller);
        log.debug('bid.bidder: ' + buyerProfile.address);
        log.debug('===============================================================================');

    });

    test('Should be able to find the Bid from bidders node2 after posting the BidMessage (MPA_BID)', async () => {

        const bidSearchCommandParams = [
            bidSearchCommand,
            listingItemReceivedNode2.hash,
            BidMessageType.MPA_BID,
            SearchOrder.ASC,
            buyerProfile.address
        ];

        const bidSearchRes: any = await testUtilNode2.rpc(bidCommand, bidSearchCommandParams);
        bidSearchRes.expectJson();
        bidSearchRes.expectStatusCode(200);

        const result: resources.Bid = bidSearchRes.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].action).toBe(BidMessageType.MPA_BID);
        expect(result[0].ListingItem.hash).toBe(listingItemReceivedNode2.hash);
        expect(result[0].bidder).toBe(buyerProfile.address);
        expect(result[0].ListingItem.seller).toBe(sellerProfile.address);

        // there should be no relation to template on the buyer side
        expect(result[0].ListingItem.ListingItemTemplate).toEqual({});

        bidNode2 = result[0];
    });

    test('Should receive BidMessage (MPA_BID) posted from bidders node2 on sellers node1', async () => {

        const bidSearchCommandParams = [
            bidSearchCommand,
            listingItemReceivedNode2.hash,
            BidMessageType.MPA_BID,
            SearchOrder.ASC,
            buyerProfile.address
        ];

        log.debug('WAIT FOR: MPA_BID on seller node1');

        const bidSearchRes: any = await testUtilNode1.rpcWaitFor(
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
        expect(result[0].ListingItem.seller).toBe(sellerProfile.address);
        expect(result[0].ListingItem.hash).toBe(listingItemReceivedNode1.hash);

        // there should be a relation to template on the seller side
        expect(result[0].ListingItem.ListingItemTemplate).toBeDefined();

        // the relation should match the hash of the template that was created earlier on node1
        expect(result[0].ListingItem.ListingItemTemplate.hash).toBe(listingItemTemplatesNode1[0].hash);

        // todo: check for correct biddata
        bidNode1 = result[0];

        // log.debug('Bid on seller node1 waiting to be accepted: ', JSON.stringify(result, null, 2));

    }, 600000); // timeout to 600s

    test('Should send BidMessage (MPA_ACCEPT) from sellers node1 to the bidders node2 and create an Order', async () => {

        const bidAcceptCommandParams = [
            bidAcceptCommand,
            bidNode1.ListingItem.hash,
            bidNode1.id
        ];

        const bidAcceptRes: any = await testUtilNode1.rpc(bidCommand, bidAcceptCommandParams);
        bidAcceptRes.expectJson();
        bidAcceptRes.expectStatusCode(200);

        // make sure we got the expected result from sending the bid
        const result: any = bidAcceptRes.getBody()['result'];
        log.debug('result', result);
        expect(result.result).toBe('Sent.');

        log.debug('==[ accept Bid /// seller (node1) -> buyer (node2) ]=============================');
        log.debug('msgid: ' + result.msgid);
        log.debug('item.hash: ' + bidNode1.ListingItem.hash);
        log.debug('bid.id: ' + bidNode1.id);
        log.debug('bid.bidder: ' + bidNode1.bidder);
        log.debug('bid.ListingItem.seller: ' + bidNode1.ListingItem.seller);
        log.debug('=================================================================================');

    });

    test('Should be able to find the Bid having BidMessageType.MPA_ACCEPT from sellers node1 after posting the BidMessage', async () => {

        const bidSearchCommandParams = [
            bidSearchCommand,
            bidNode1.ListingItem.hash,
            BidMessageType.MPA_ACCEPT,
            SearchOrder.ASC,
            buyerProfile.address
        ];

        const bidSearchRes: any = await testUtilNode1.rpc(bidCommand, bidSearchCommandParams);
        bidSearchRes.expectJson();
        bidSearchRes.expectStatusCode(200);

        const result: resources.Bid = bidSearchRes.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].action).toBe(BidMessageType.MPA_ACCEPT);
        expect(result[0].ListingItem.hash).toBe(bidNode1.ListingItem.hash);
        expect(result[0].bidder).toBe(buyerProfile.address);
        expect(result[0].ListingItem.seller).toBe(sellerProfile.address);

        // there should be a relation to template on the seller side
        expect(result[0].ListingItem.ListingItemTemplate.hash).toBe(listingItemTemplatesNode1[0].hash);

        bidNode1 = result[0];
    });

    test('Should be able to find the Order from sellers node1 after posting the BidMessage (MPA_ACCEPT)', async () => {

        const orderSearchCommandParams = [
            orderSearchCommand,
            bidNode1.ListingItem.hash,
            OrderStatus.AWAITING_ESCROW,
            buyerProfile.address,
            sellerProfile.address,
            SearchOrder.ASC
        ];

        const orderSearchRes: any = await testUtilNode1.rpc(orderCommand, orderSearchCommandParams);
        orderSearchRes.expectJson();
        orderSearchRes.expectStatusCode(200);

        const result: resources.Order = orderSearchRes.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].hash).toBeDefined(); // TODO: bidNode1.BidDatas[orderHash]
        expect(result[0].buyer).toBe(buyerProfile.address);
        expect(result[0].seller).toBe(sellerProfile.address);
        expect(result[0].OrderItems).toHaveLength(1);
        expect(result[0].OrderItems[0].status).toBe(OrderStatus.AWAITING_ESCROW);
        expect(result[0].OrderItems[0].itemHash).toBe(bidNode1.ListingItem.hash);

        orderNode1 = result[0];
    });

    test('Should receive BidMessage (MPA_ACCEPT) posted from sellers node1 on buyers node2 and create an Order', async () => {

        // TODO: when we first get the template hash, store it in originalTemplateHash and use that for searches and expects
        // same for other similar cases...

        const bidSearchCommandParams = [
            bidSearchCommand,
            bidNode2.ListingItem.hash,
            BidMessageType.MPA_ACCEPT,
            SearchOrder.ASC,
            buyerProfile.address
        ];

        log.debug('WAIT FOR: MPA_ACCEPT on buyer node2');

        const bidSearchRes: any = await testUtilNode2.rpcWaitFor(
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
        expect(result[0].ListingItem.hash).toBe(listingItemReceivedNode1.hash);

        // there should be no relation to template on the buyer side
        expect(result[0].ListingItem.ListingItemTemplate).toEqual({});

        // todo: check for correct biddata
        bidNode2 = result[0];

    }, 600000); // timeout to 600s

    test('Should be able to find the Order OrderStatus.AWAITING_ESCROW from buyers node2 after receiving the BidMessage (MPA_ACCEPT)', async () => {

        const orderSearchCommandParams = [
            orderSearchCommand,
            bidNode2.ListingItem.hash,
            OrderStatus.AWAITING_ESCROW,
            buyerProfile.address,
            sellerProfile.address,
            SearchOrder.ASC
        ];

        const orderSearchRes: any = await testUtilNode2.rpc(orderCommand, orderSearchCommandParams);
        orderSearchRes.expectJson();
        orderSearchRes.expectStatusCode(200);

        const result: resources.Order = orderSearchRes.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].hash).toBeDefined(); // TODO: bidNode1.BidDatas[orderHash]
        expect(result[0].buyer).toBe(buyerProfile.address);
        expect(result[0].seller).toBe(sellerProfile.address);
        expect(result[0].OrderItems).toHaveLength(1);
        expect(result[0].OrderItems[0].status).toBe(OrderStatus.AWAITING_ESCROW);
        expect(result[0].OrderItems[0].itemHash).toBe(bidNode1.ListingItem.hash);

        orderNode2 = result[0];
    });


    test('Should send EscrowMessage (MPA_LOCK) from buyers node2 to the sellers node1', async () => {

        const escrowLockCommandParams = [
            escrowLockCommand,
            orderNode2.OrderItems[0].id,
            'random-nonce-nse',
            'WANTITPLEASETAKEMYMONEYS!'
        ];

        const escrowLockRes: any = await testUtilNode2.rpc(escrowCommand, escrowLockCommandParams);
        escrowLockRes.expectJson();
        escrowLockRes.expectStatusCode(200);

        // make sure we got the expected result from sending the bid
        const result: any = escrowLockRes.getBody()['result'];
        log.debug('result', result);
        expect(result.result).toBe('Sent.');

        log.debug('==[ lock Escrow /// buyer (node2) -> seller (node1) ]============================');
        log.debug('msgid: ' + result.msgid);
        log.debug('order.hash: ' + orderNode2.hash);
        log.debug('order.buyer: ' + orderNode2.buyer);
        log.debug('order.seller: ' + orderNode2.seller);
        log.debug('order.id: ' + orderNode2.id);
        log.debug('order.orderItem.id: ' + orderNode2.OrderItems[0].id);
        log.debug('=================================================================================');

    });

    test('Should be able to find the Order with OrderStatus.ESCROW_LOCKED from buyers node2 after sending the EscrowMessage (MPA_LOCK)', async () => {

        const orderSearchCommandParams = [
            orderSearchCommand,
            bidNode2.ListingItem.hash,
            OrderStatus.ESCROW_LOCKED,
            buyerProfile.address,
            sellerProfile.address,
            SearchOrder.ASC
        ];

        const orderSearchRes: any = await testUtilNode2.rpc(orderCommand, orderSearchCommandParams);
        orderSearchRes.expectJson();
        orderSearchRes.expectStatusCode(200);

        const result: resources.Order = orderSearchRes.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].hash).toBeDefined(); // TODO: bidNode1.BidDatas[orderHash]
        expect(result[0].buyer).toBe(buyerProfile.address);
        expect(result[0].seller).toBe(sellerProfile.address);
        expect(result[0].OrderItems).toHaveLength(1);
        expect(result[0].OrderItems[0].status).toBe(OrderStatus.ESCROW_LOCKED);
        expect(result[0].OrderItems[0].itemHash).toBe(bidNode1.ListingItem.hash);

        orderNode2 = result[0];
    });

    test('Should receive EscrowMessage (MPA_LOCK) posted from buyers node2 on sellers node1', async () => {

        const orderSearchCommandParams = [
            orderSearchCommand,
            bidNode1.ListingItem.hash,
            OrderStatus.ESCROW_LOCKED,
            buyerProfile.address,
            sellerProfile.address,
            SearchOrder.ASC
        ];

        log.debug('WAIT FOR: MPA_LOCK on seller node1');

        const orderSearchRes: any = await testUtilNode1.rpcWaitFor(
            orderCommand,
            orderSearchCommandParams,
            8 * 60,
            200,
            '[0].OrderItems[0].status',
            OrderStatus.ESCROW_LOCKED.toString()
        );
        orderSearchRes.expectJson();
        orderSearchRes.expectStatusCode(200);

        const result: resources.Order = orderSearchRes.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].OrderItems[0].status).toBe(OrderStatus.ESCROW_LOCKED);
        expect(result[0].buyer).toBe(buyerProfile.address);
        expect(result[0].seller).toBe(sellerProfile.address);

        orderNode1 = result[0];

    }, 600000); // timeout to 600s

    test('Should send EscrowMessage (MPA_RELEASE) from sellers node1 to the buyers node2 indicating that the item has been sent', async () => {

        const escrowReleaseCommandParams = [
            escrowReleaseCommand,
            orderNode1.OrderItems[0].id,
            'tracking1234'
        ];

        const escrowReleaseRes: any = await testUtilNode1.rpc(escrowCommand, escrowReleaseCommandParams);
        escrowReleaseRes.expectJson();
        escrowReleaseRes.expectStatusCode(200);

        const result: any = escrowReleaseRes.getBody()['result'];
        log.debug('result', JSON.stringify(result, null, 2));
        expect(result.result).toBe('Sent.');

        log.debug('==[ release Escrow /// seller (node1) -> buyer (node2) ]=========================');
        log.debug('msgid: ' + result.msgid);
        log.debug('order.hash: ' + orderNode2.hash);
        log.debug('order.buyer: ' + orderNode2.buyer);
        log.debug('order.seller: ' + orderNode2.seller);
        log.debug('order.id: ' + orderNode2.id);
        log.debug('order.orderItem.id: ' + orderNode2.OrderItems[0].id);
        log.debug('=================================================================================');

    });

    test('Should be able to find the Order with OrderStatus.SHIPPING from sellers node1 after posting the EscrowMessage (MPA_RELEASE)', async () => {

        const orderSearchCommandParams = [
            orderSearchCommand,
            bidNode1.ListingItem.hash,
            OrderStatus.SHIPPING,
            buyerProfile.address,
            sellerProfile.address,
            SearchOrder.ASC
        ];

        const orderSearchRes: any = await testUtilNode1.rpc(orderCommand, orderSearchCommandParams);
        orderSearchRes.expectJson();
        orderSearchRes.expectStatusCode(200);

        const result: resources.Order = orderSearchRes.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].hash).toBeDefined(); // TODO: bidNode1.BidDatas[orderHash]
        expect(result[0].buyer).toBe(buyerProfile.address);
        expect(result[0].seller).toBe(sellerProfile.address);
        expect(result[0].OrderItems).toHaveLength(1);
        expect(result[0].OrderItems[0].status).toBe(OrderStatus.SHIPPING);
        expect(result[0].OrderItems[0].itemHash).toBe(bidNode1.ListingItem.hash);

        orderNode1 = result[0];
    });

    test('Should receive EscrowMessage (MPA_RELEASE) posted from sellers node1 on buyers node2, OrderStatus.SHIPPING', async () => {

        const orderSearchCommandParams = [
            orderSearchCommand,
            bidNode2.ListingItem.hash,
            OrderStatus.SHIPPING,
            buyerProfile.address,
            sellerProfile.address,
            SearchOrder.ASC
        ];

        log.debug('WAIT FOR: MPA_RELEASE on buyer node2');

        const orderSearchRes: any = await testUtilNode2.rpcWaitFor(
            orderCommand,
            orderSearchCommandParams,
            8 * 60,
            200,
            '[0].OrderItems[0].status',
            OrderStatus.SHIPPING.toString()
        );
        orderSearchRes.expectJson();
        orderSearchRes.expectStatusCode(200);

        const result: resources.Order = orderSearchRes.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].OrderItems[0].status).toBe(OrderStatus.SHIPPING);
        expect(result[0].buyer).toBe(buyerProfile.address);
        expect(result[0].seller).toBe(sellerProfile.address);

        orderNode2 = result[0];

    }, 600000); // timeout to 600s

    test('Should send EscrowMessage (MPA_RELEASE) from buyers node2 to the sellers node1 indicating that the item has been received', async () => {

        const escrowReleaseCommandParams = [
            escrowReleaseCommand,
            orderNode2.OrderItems[0].id,
            'kthanxbye'
        ];

        const escrowReleaseRes: any = await testUtilNode2.rpc(escrowCommand, escrowReleaseCommandParams);
        escrowReleaseRes.expectJson();
        escrowReleaseRes.expectStatusCode(200);

        const result: any = escrowReleaseRes.getBody()['result'];
        log.debug('result', JSON.stringify(result, null, 2));
        expect(result.result).toBe('Sent.');

        log.debug('==[ release Escrow /// buyer (node2) -> seller (node1) ]=========================');
        log.debug('msgid: ' + result.msgid);
        log.debug('order.hash: ' + orderNode2.hash);
        log.debug('order.buyer: ' + orderNode2.buyer);
        log.debug('order.seller: ' + orderNode2.seller);
        log.debug('order.id: ' + orderNode2.id);
        log.debug('order.orderItem.id: ' + orderNode2.OrderItems[0].id);
        log.debug('=================================================================================');

    });

    test('Should be able to find the Order with OrderStatus.COMPLETE from buyers node2 after posting the EscrowMessage (MPA_RELEASE)', async () => {

        const orderSearchCommandParams = [
            orderSearchCommand,
            bidNode2.ListingItem.hash,
            OrderStatus.COMPLETE,
            buyerProfile.address,
            sellerProfile.address,
            SearchOrder.ASC
        ];

        const orderSearchRes: any = await testUtilNode2.rpc(orderCommand, orderSearchCommandParams);
        orderSearchRes.expectJson();
        orderSearchRes.expectStatusCode(200);

        const result: resources.Order = orderSearchRes.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].hash).toBeDefined(); // TODO: bidNode1.BidDatas[orderHash]
        expect(result[0].buyer).toBe(buyerProfile.address);
        expect(result[0].seller).toBe(sellerProfile.address);
        expect(result[0].OrderItems).toHaveLength(1);
        expect(result[0].OrderItems[0].status).toBe(OrderStatus.COMPLETE);
        expect(result[0].OrderItems[0].itemHash).toBe(bidNode2.ListingItem.hash);

        orderNode1 = result[0];
    });

    test('Should receive EscrowMessage (MPA_RELEASE) posted from buyers node2 on sellers node1, OrderStatus.COMPLETE', async () => {

        const orderSearchCommandParams = [
            orderSearchCommand,
            bidNode1.ListingItem.hash,
            OrderStatus.COMPLETE,
            buyerProfile.address,
            sellerProfile.address,
            SearchOrder.ASC
        ];

        log.debug('WAIT FOR: MPA_RELEASE on seller node1');

        const orderSearchRes: any = await testUtilNode2.rpcWaitFor(
            orderCommand,
            orderSearchCommandParams,
            8 * 60,
            200,
            '[0].OrderItems[0].status',
            OrderStatus.COMPLETE.toString()
        );
        orderSearchRes.expectJson();
        orderSearchRes.expectStatusCode(200);

        const result: resources.Order = orderSearchRes.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].OrderItems[0].status).toBe(OrderStatus.COMPLETE);
        expect(result[0].buyer).toBe(buyerProfile.address);
        expect(result[0].seller).toBe(sellerProfile.address);

        orderNode2 = result[0];

    }, 600000); // timeout to 600s


});
