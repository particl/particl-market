// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { SearchOrder } from '../../../src/api/enums/SearchOrder';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { ActionDirection } from '../../../src/api/enums/ActionDirection';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';

describe('OrderItemHistory', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtilSellerNode = new BlackBoxTestUtil(randomBoolean ? 0 : 1);  // SELLER
    const testUtilBuyerNode = new BlackBoxTestUtil(randomBoolean ? 1 : 0);

    const templateCommand = Commands.TEMPLATE_ROOT.commandName;
    const templatePostCommand = Commands.TEMPLATE_POST.commandName;
    const templateGetCommand = Commands.TEMPLATE_GET.commandName;
    const orderItemCommand = Commands.ORDERITEM_ROOT.commandName;
    const orderItemHistoryCommand = Commands.ORDERITEM_HISTORY.commandName;
    const listingItemCommand = Commands.ITEM_ROOT.commandName;
    const listingItemGetCommand = Commands.ITEM_GET.commandName;
    const bidCommand = Commands.BID_ROOT.commandName;
    const bidSendCommand = Commands.BID_SEND.commandName;
    const bidSearchCommand = Commands.BID_SEARCH.commandName;
    const daemonCommand = Commands.DAEMON_ROOT.commandName;

    let buyerProfile: resources.Profile;
    let sellerProfile: resources.Profile;

    let buyerMarket: resources.Market;
    let sellerMarket: resources.Market;

    let listingItemTemplateOnSellerNode: resources.ListingItemTemplate;
    let listingItemReceivedOnSellerNode: resources.ListingItem;
    let listingItemReceivedOnBuyerNode: resources.ListingItem;

    let bidOnBuyerNode: resources.Bid;

    const PAGE = 0;
    const PAGE_LIMIT = 10;
    const ORDER = SearchOrder.ASC;
    const DAYS_RETENTION = 2;

    let sent = false;

    beforeAll(async () => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

        await testUtilSellerNode.cleanDb();
        await testUtilBuyerNode.cleanDb();

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

        const listingItemTemplatesOnSellerNode: resources.ListingItemTemplate[] = await testUtilSellerNode.generateData(
            CreatableModel.LISTINGITEMTEMPLATE,     // what to generate
            1,                              // how many to generate
            true,                       // return model
            generateListingItemTemplateParams       // what kind of data to generate
        ) as resources.ListingItemTemplates[];
        listingItemTemplateOnSellerNode = listingItemTemplatesOnSellerNode[0];
        expect(listingItemTemplateOnSellerNode.id).toBeDefined();

        // start with clean outputs in case something went wrong earlier
        let res = await testUtilSellerNode.rpc(daemonCommand, ['lockunspent', true]);
        res.expectJson();
        res.expectStatusCode(200);

        res = await testUtilBuyerNode.rpc(daemonCommand, ['lockunspent', true]);
        res.expectJson();
        res.expectStatusCode(200);

        log.debug('==> Setup DONE.');

    });

    test('Should post ListingItem from SELLER node', async () => {

        log.debug('========================================================================================');
        log.debug('SELLER POSTS MPA_LISTING_ADD');
        log.debug('========================================================================================');

        await testUtilSellerNode.waitFor(5);

        const res: any = await testUtilSellerNode.rpc(templateCommand, [templatePostCommand,
            listingItemTemplateOnSellerNode.id,
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
        log.debug('item.id: ' + listingItemTemplateOnSellerNode.id);
        log.debug('item.hash: ' + listingItemTemplateOnSellerNode.hash);
        log.debug('item.title: ' + listingItemTemplateOnSellerNode.ItemInformation.title);
        log.debug('item.desc: ' + listingItemTemplateOnSellerNode.ItemInformation.shortDescription);
        log.debug('item.category: [' + listingItemTemplateOnSellerNode.ItemInformation.ItemCategory.id + '] '
            + listingItemTemplateOnSellerNode.ItemInformation.ItemCategory.name);
        log.debug('========================================================================================');

    });

    test('Should get the updated ListingItemTemplate to get the hash', async () => {
        // sending should have succeeded for this test to work
        expect(sent).toBeTruthy();

        const res: any = await testUtilSellerNode.rpc(templateCommand, [templateGetCommand,
            listingItemTemplateOnSellerNode.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        listingItemTemplateOnSellerNode = res.getBody()['result'];

        log.debug('listingItemTemplateOnSellerNode.hash: ', listingItemTemplateOnSellerNode.hash);
    });


    test('Should have received ListingItem (MPA_LISTING_ADD) on BUYER node, ListingItem is created', async () => {

        // sending should have succeeded for this test to work
        expect(sent).toBeTruthy();

        log.debug('========================================================================================');
        log.debug('BUYER RECEIVES MPA_LISTING_ADD posted from sellers node, ListingItem is created');
        log.debug('========================================================================================');

        let response: any = await testUtilBuyerNode.rpcWaitFor(
            listingItemCommand,
            [listingItemGetCommand, listingItemTemplateOnSellerNode.hash],
            15 * 60,
            200,
            'hash',
            listingItemTemplateOnSellerNode.hash
        );
        response.expectJson();
        response.expectStatusCode(200);

        // seller node allready received this, but wait a while, and refetch, just in case
        await testUtilBuyerNode.waitFor(5);

        response = await testUtilBuyerNode.rpc(listingItemCommand, [listingItemGetCommand,
            listingItemTemplateOnSellerNode.hash
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


    test('Should post Bid (MPA_BID) from BUYER node', async () => {

        // ListingItem should have been received on buyer node
        expect(listingItemReceivedOnBuyerNode).toBeDefined();
        sent = false;

        log.debug('========================================================================================');
        log.debug('BUYER POSTS MPA_BID for the ListingItem to the seller');
        log.debug('========================================================================================');

        const res: any = await testUtilBuyerNode.rpc(bidCommand, [bidSendCommand,
            listingItemReceivedOnBuyerNode.hash,
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
        log.debug('item.hash: ' + listingItemReceivedOnBuyerNode.hash);
        log.debug('item.seller: ' + listingItemReceivedOnBuyerNode.seller);
        log.debug('bid.bidder: ' + buyerProfile.address);
        log.debug('===============================================================================');

    });


    test('Should have created Bid on BUYER node after posting the MPA_BID', async () => {

        expect(sent).toBeTruthy();
        expect(listingItemReceivedOnBuyerNode).toBeDefined();

        // wait for some time to make sure the Bid has been created
        await testUtilBuyerNode.waitFor(5);

        const res: any = await testUtilBuyerNode.rpc(bidCommand, [bidSearchCommand,
            PAGE, PAGE_LIMIT, ORDER,
            listingItemReceivedOnBuyerNode.hash,
            MPAction.MPA_BID,
            '*',
            buyerProfile.address
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Bid = res.getBody()['result'];

        log.debug('result bid: ', JSON.stringify(result, null, 2));
        expect(result.length).toBe(1);
        expect(result[0].type).toBe(MPAction.MPA_BID);
        expect(result[0].bidder).toBe(buyerProfile.address);
        expect(result[0].ListingItem.hash).toBe(listingItemReceivedOnBuyerNode.hash);
        expect(result[0].ListingItem.seller).toBe(sellerProfile.address);

        // there should be no relation to ListingItemTemplate on the buyer side
        expect(result[0].ListingItem.ListingItemTemplate).not.toBeDefined();
        bidOnBuyerNode = result[0];

        // expect Order and OrderItem to be created
        expect(result[0].OrderItem.id).toBeDefined();
        expect(result[0].OrderItem.Order.id).toBeDefined();

        // todo: this is not defined, should it be?
        // expect(result[0].OrderItem.ListingItem.id).toBeDefined();

        log.debug('==> Bid found on buyer node.');

    }, 600000); // timeout to 600s


    test('Should receive OrderItem history with two SmsgMessages', async () => {

        expect(sent).toBeTruthy();
        expect(bidOnBuyerNode).toBeDefined();

        const res = await testUtilBuyerNode.rpc(orderItemCommand, [orderItemHistoryCommand,
            bidOnBuyerNode.OrderItem.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.SmsgMessage[] = res.getBody()['result'];
        expect(result.length).toBe(2);
        expect(result[0].type).toBe(MPAction.MPA_LISTING_ADD);
        expect(result[0].direction).toBe(ActionDirection.INCOMING);
        expect(result[1].type).toBe(MPAction.MPA_BID);
        expect(result[1].direction).toBe(ActionDirection.OUTGOING);

        log.debug('OrderItem history: ', JSON.stringify(result, null, 2));
        log.debug('==> Correct OrderItem history received.');

    }, 600000); // timeout to 600s

});
