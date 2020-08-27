// Copyright (c) 2017-2020, The Particl Market developers
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
import { BidSearchOrderField, ListingItemSearchOrderField } from '../../../src/api/enums/SearchOrderField';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';

describe('OrderItemHistory', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtilSellerNode = new BlackBoxTestUtil(randomBoolean ? 0 : 1);
    const testUtilBuyerNode = new BlackBoxTestUtil(randomBoolean ? 1 : 0);

    const templateCommand = Commands.TEMPLATE_ROOT.commandName;
    const templatePostCommand = Commands.TEMPLATE_POST.commandName;
    const templateGetCommand = Commands.TEMPLATE_GET.commandName;
    const orderItemCommand = Commands.ORDERITEM_ROOT.commandName;
    const orderItemHistoryCommand = Commands.ORDERITEM_HISTORY.commandName;
    const listingItemCommand = Commands.ITEM_ROOT.commandName;
    const listingItemSearchCommand = Commands.ITEM_SEARCH.commandName;
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
    let listingItemReceivedOnBuyerNode: resources.ListingItem;
    let mpaBidOnBuyerNode: resources.Bid;
    let randomCategoryOnSellerNode: resources.ItemCategory;

    const PAGE = 0;
    const PAGE_LIMIT = 10;
    const SEARCHORDER = SearchOrder.ASC;
    const LISTINGITEM_SEARCHORDERFIELD = ListingItemSearchOrderField.CREATED_AT;
    const BID_SEARCHORDERFIELD = BidSearchOrderField.CREATED_AT;

    const DAYS_RETENTION = 1;

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
        // log.debug('sellerProfile: ', sellerProfile.address);
        // log.debug('buyerProfile: ', buyerProfile.address);

        // get seller and buyer markets
        sellerMarket = await testUtilSellerNode.getDefaultMarket(sellerProfile.id);
        buyerMarket = await testUtilBuyerNode.getDefaultMarket(buyerProfile.id);
        expect(sellerMarket.id).toBeDefined();
        expect(buyerMarket.id).toBeDefined();
        // log.debug('sellerMarket: ', JSON.stringify(sellerMarket, null, 2));
        // log.debug('buyerMarket: ', JSON.stringify(buyerMarket, null, 2));

        randomCategoryOnSellerNode = await testUtilSellerNode.getRandomCategory();

        // generate ListingItemTemplate
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,                           // generateItemInformation
            true,                           // generateItemLocation
            true,                           // generateShippingDestinations
            false,                          // generateItemImages
            true,                           // generatePaymentInformation
            true,                           // generateEscrow
            true,                           // generateItemPrice
            false,                          // generateMessagingInformation
            false,                          // generateListingItemObjects
            false,                          // generateObjectDatas
            sellerProfile.id,               // profileId
            false,                          // generateListingItem
            sellerMarket.id,                // soldOnMarketId
            randomCategoryOnSellerNode.id   // categoryId
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
        // log.debug('listingItemTemplateOnSellerNode.hash: ', listingItemTemplateOnSellerNode.hash);
    });


    test('Should have received ListingItem (MPA_LISTING_ADD) on BUYER node, ListingItem is created', async () => {

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
        // log.debug('result: ', JSON.stringify(result, null, 2));
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


    test('Should fail because missing orderItemId', async () => {
        const res: any = await testUtilSellerNode.rpc(orderItemCommand, [orderItemHistoryCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('orderItemId').getMessage());
    });


    test('Should fail because invalid orderItemId', async () => {
        const res: any = await testUtilSellerNode.rpc(orderItemCommand, [orderItemHistoryCommand,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('orderItemId', 'number').getMessage());
    });


    test('Should fail because OrderItem not found', async () => {
        const res: any = await testUtilSellerNode.rpc(orderItemCommand, [orderItemHistoryCommand,
            0
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('OrderItem').getMessage());
    });


    test('Should receive OrderItem history with two SmsgMessages', async () => {

        expect(sent).toBeTruthy();
        expect(mpaBidOnBuyerNode).toBeDefined();

        const res = await testUtilBuyerNode.rpc(orderItemCommand, [orderItemHistoryCommand,
            mpaBidOnBuyerNode.OrderItem.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.SmsgMessage[] = res.getBody()['result'];
        expect(result.length).toBe(2);
        expect(result[0].type).toBe(MPAction.MPA_LISTING_ADD);
        expect(result[0].direction).toBe(ActionDirection.INCOMING);
        expect(result[1].type).toBe(MPAction.MPA_BID);
        expect(result[1].direction).toBe(ActionDirection.OUTGOING);

        // log.debug('OrderItem history: ', JSON.stringify(result, null, 2));
        log.debug('==> Correct OrderItem history received.');

    }, 600000); // timeout to 600s

});
