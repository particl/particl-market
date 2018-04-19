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
// tslint:enable:max-line-length

describe('ListingItemSearchCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    // const testUtilNode0 = new BlackBoxTestUtil(0);
    const testUtilNode1 = new BlackBoxTestUtil(0);
    const testUtilNode2 = new BlackBoxTestUtil(2);

    const templateCommand = Commands.TEMPLATE_ROOT.commandName;
    const templatePostCommand = Commands.TEMPLATE_POST.commandName;
    const templateGetCommand = Commands.TEMPLATE_GET.commandName;

    const listingItemCommand = Commands.ITEM_ROOT.commandName;
    const listingItemGetCommand = Commands.ITEM_GET.commandName;

    const bidCommand = Commands.BID_ROOT.commandName;
    const bidSendCommand = Commands.BID_SEND.commandName;
    const bidSearchCommand = Commands.BID_SEARCH.commandName;
    const bidAcceptCommand = Commands.BID_ACCEPT.commandName;

    let sellerProfile: resources.Profile;
    let buyerProfile: resources.Profile;
    let defaultMarket: resources.Market;

    let listingItemTemplatesNode1: resources.ListingItemTemplate[];
    let listingItemReceivedNode2: resources.ListingItem;

    let bidNode2: resources.Bid;
    let bidNode1: resources.Bid;

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
        expect(result.txid).toBeDefined();
        expect(result.fee).toBeGreaterThan(0);

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

        // try to find the item from the other node
        const itemGetNode1Res: any = await testUtilNode2.rpcWaitFor(
            listingItemCommand,
            [listingItemGetCommand, listingItemTemplatesNode1[0].hash],
            8 * 60,
            200,
            'hash',
            listingItemTemplatesNode1[0].hash
        );
        itemGetNode1Res.expectJson();
        itemGetNode1Res.expectStatusCode(200);

        // make sure we got the expected result
        const result: resources.ListingItem = itemGetNode1Res.getBody()['result'];
        expect(result.hash).toBe(listingItemTemplatesNode1[0].hash);

        // store ListingItem for later tests
        listingItemReceivedNode2 = result;

    }, 600000); // timeout to 600s

// tslint:disable:max-line-length
    test('Should receive ListingItemMessage (MP_ITEM_ADD) posted from sellers node1 as ListingItem on bidders node2 and match it with the existing ListingItemTemplate', async () => {

        // try to find the item from the seller node
        const itemGetNode0Res: any = await testUtilNode1.rpcWaitFor(
            listingItemCommand,
            [listingItemGetCommand, listingItemTemplatesNode1[0].hash],
            8 * 60,
            200,
            'hash',
            listingItemTemplatesNode1[0].hash
        );
        itemGetNode0Res.expectJson();
        itemGetNode0Res.expectStatusCode(200);

        // make sure we got the expected result from seller node -> item hash was matched with existing template hash
        const result: resources.ListingItem = itemGetNode0Res.getBody()['result'];

        log.debug('result: ', result);
        expect(result.hash).toBe(listingItemTemplatesNode1[0].hash);
        expect(result.ListingItemTemplate.hash).toBe(listingItemTemplatesNode1[0].hash);

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

        // make sure we got the expected result from sending the bid
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

        log.debug('result[0].ListingItem.ListingItemTemplate', result[0].ListingItem.ListingItemTemplate);

        // there should be no relation to template on the buyer side
        expect(result[0].ListingItem.ListingItemTemplate).not.toBeDefined();

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

        // try to find the item from the seller node
        const bidSearchRes: any = await testUtilNode2.rpcWaitFor(
            bidCommand,
            bidSearchCommandParams,
            8 * 60,
            200,
            '[0].action',
            BidMessageType.MPA_BID
        );
        bidSearchRes.expectJson();
        bidSearchRes.expectStatusCode(200);

        const result: resources.Bid = bidSearchRes.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].action).toBe(BidMessageType.MPA_BID);
        expect(result[0].ListingItem.hash).toBe(listingItemReceivedNode2.hash);

        log.debug('result[0].ListingItem.ListingItemTemplate', result[0].ListingItem.ListingItemTemplate);

        // there should be a relation to template on the seller side
        expect(result[0].ListingItem.ListingItemTemplate).toBeDefined();

        // todo: check for correct biddata
        bidNode1 = result[0];


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


});
