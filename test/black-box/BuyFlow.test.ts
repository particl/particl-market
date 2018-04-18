///<reference path="../../node_modules/@types/jest/index.d.ts"/>
// tslint:disable:max-line-length
import {rpc, api, ApiOptions} from './lib/api';
import { Logger as LoggerType } from '../../src/core/Logger';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Commands } from '../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { GenerateListingItemTemplateParams } from '../../src/api/requests/params/GenerateListingItemTemplateParams';
import * as listingItemTemplateCreateRequestWithoutLocationMarker from '../testdata/createrequest/listingItemTemplateCreateRequestWithoutLocationMarker.json';
import * as resources from 'resources';
import {BidMessageType} from '../../src/api/enums/BidMessageType';
// tslint:enable:max-line-length

describe('ListingItemSearchCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const testUtilNode0 = new BlackBoxTestUtil(0);
    const testUtilNode1 = new BlackBoxTestUtil(1);
    // const testUtilNode2 = new BlackBoxTestUtil(2);

    const templateCommand = Commands.TEMPLATE_ROOT.commandName;
    const templatePostCommand = Commands.TEMPLATE_POST.commandName;
    const templateGetCommand = Commands.TEMPLATE_GET.commandName;

    const listingItemCommand = Commands.ITEM_ROOT.commandName;
    const listingItemGetCommand = Commands.ITEM_GET.commandName;

    const bidCommand = Commands.BID_ROOT.commandName;
    const bidSendCommand = Commands.BID_SEND.commandName;

    let sellerProfile;
    let buyerProfile;
    let defaultMarket;

    let listingItemTemplatesNode0: resources.ListingItemTemplate[];
    let listingItemReceivedNode1: resources.ListingItem;

    beforeAll(async () => {

        await testUtilNode0.cleanDb();
        // await testUtilNode2.cleanDb();

        // get seller and buyer profiles
        sellerProfile = await testUtilNode0.getDefaultProfile();
        expect(sellerProfile.id).toBeDefined();

        buyerProfile = await testUtilNode1.getDefaultProfile();
        expect(buyerProfile.id).toBeDefined();

        log.debug('sellerProfile: ', JSON.stringify(sellerProfile, null, 2));
        log.debug('buyerProfile: ', JSON.stringify(buyerProfile, null, 2));

        defaultMarket = await testUtilNode0.getDefaultMarket();
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
        listingItemTemplatesNode0 = await testUtilNode0.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplates[];

        expect(listingItemTemplatesNode0[0].id).toBeDefined();

        // we should be also able to get the template
        const templateGetRes: any = await testUtilNode0.rpc(templateCommand, [templateGetCommand, listingItemTemplatesNode0[0].id]);
        templateGetRes.expectJson();
        templateGetRes.expectStatusCode(200);
        const result: any = templateGetRes.getBody()['result'];

        log.debug('listingItemTemplates[0].hash:', listingItemTemplatesNode0[0].hash);
        log.debug('result.hash:', result.hash);
        expect(result.hash).toBe(listingItemTemplatesNode0[0].hash);

    });

    test('Should post a ListingItemTemplate to the default marketplace from node0', async () => {

        // log.debug('listingItemTemplates[0]:', listingItemTemplatesNode0[0]);

        const templatePostRes: any = await testUtilNode0.rpc(templateCommand, [templatePostCommand, listingItemTemplatesNode0[0].id, defaultMarket.id]);
        templatePostRes.expectJson();
        templatePostRes.expectStatusCode(200);

        // make sure we got the expected result from posting the template
        const result: any = templatePostRes.getBody()['result'];
        expect(result.result).toBe('Sent.');
        expect(result.txid).toBeDefined();
        expect(result.fee).toBeGreaterThan(0);

        log.debug('==[ post ListingItemTemplate /// seller (node0) -> marketplace ]========================');
        log.debug('item.id: ' + listingItemTemplatesNode0[0].id);
        log.debug('item.hash: ' + listingItemTemplatesNode0[0].hash);
        log.debug('item.title: ' + listingItemTemplatesNode0[0].ItemInformation.title);
        log.debug('item.desc: ' + listingItemTemplatesNode0[0].ItemInformation.shortDescription);
        log.debug('item.category: [' + listingItemTemplatesNode0[0].ItemInformation.ItemCategory.id + '] '
            + listingItemTemplatesNode0[0].ItemInformation.ItemCategory.name);
        log.debug('========================================================================================');

    });

    test('Should receive ListingItemTemplate posted from node0 as ListingItem on node1', async () => {

        // try to find the item from the other node
        const itemGetNode1Res: any = await testUtilNode1.rpcWaitFor(
            listingItemCommand,
            [listingItemGetCommand, listingItemTemplatesNode0[0].hash],
            8 * 60,
            200,
            'hash',
            listingItemTemplatesNode0[0].hash
        );
        itemGetNode1Res.expectJson();
        itemGetNode1Res.expectStatusCode(200);

        // make sure we got the expected result
        const result = itemGetNode1Res.getBody()['result'];
        expect(result.hash).toBe(listingItemTemplatesNode0[0].hash);

        // store for later tests
        listingItemReceivedNode1 = result;

    }, 600000); // timeout to 600s

    test('Should receive ListingItemTemplate posted from node0 as ListingItem on node0 and match it with the existing ListingItemTemplate', async () => {

        // try to find the item from the seller node
        const itemGetNode0Res: any = await testUtilNode0.rpcWaitFor(
            listingItemCommand,
            [listingItemGetCommand, listingItemTemplatesNode0[0].hash],
            8 * 60,
            200,
            'hash',
            listingItemTemplatesNode0[0].hash
        );
        itemGetNode0Res.expectJson();
        itemGetNode0Res.expectStatusCode(200);

        // make sure we got the expected result from seller node -> item hash was matched with existing template hash
        const result = itemGetNode0Res.getBody()['result'];

        log.debug('result: ', result);
        expect(result.hash).toBe(listingItemTemplatesNode0[0].hash);
        expect(result.ListingItemTemplate.hash).toBe(listingItemTemplatesNode0[0].hash);

    }, 600000); // timeout to 600s

    test('Should send BidMessage for the ListingItem from node1 to seller', async () => {

        const bidSendCommandParams = [
            bidSendCommand,
            listingItemReceivedNode1.hash,
            buyerProfile.id,
            buyerProfile.ShippingAddresses[0].id,
            'colour',   // TODO: make sure item has these options and test that these end up in the Order
            'black',
            'size',
            'xl'
        ];

        const bidSendRes: any = await testUtilNode1.rpc(bidCommand, bidSendCommandParams);
        bidSendRes.expectJson();
        bidSendRes.expectStatusCode(200);

        // make sure we got the expected result from sending the bid
        const result: any = bidSendRes.getBody()['result'];
        log.debug('result', result);
        expect(result.result).toBe('Sent.');

        // get the bid
        // <itemhash>|*) [(<status>|*) [<ordering> [<bidderAddress..
        // search bid by item hash
        const res: any = await rpc(bidCommand, [searchCommand, listingItems[0].hash, BidMessageType.MPA_BID]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].action).toBe(BidMessageType.MPA_BID);
        expect(result[0].ListingItem.hash).toBe(listingItems[0].hash);

        log.debug('==[ send Bid /// buyer (node1) -> seller (node0) ]=============================');
        log.debug('msgid: ' + result.msgid);
        log.debug('item.hash: ' + listingItemReceivedNode1.hash);
        log.debug('item.seller: ' + listingItemReceivedNode1.seller);
        log.debug('bid.bidder: ' + listingItemTemplatesNode0[0].hash);
        log.debug('===============================================================================');

    }, 600000); // timeout to 600s

});
