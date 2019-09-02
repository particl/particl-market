// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { SearchOrder } from '../../../src/api/enums/SearchOrder';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';

describe('SmsgRemoveCommand', () => {

    const log: LoggerType = new LoggerType(__filename);

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtilSellerNode = new BlackBoxTestUtil(randomBoolean ? 0 : 1);  // SELLER
    const testUtilBuyerNode = new BlackBoxTestUtil(randomBoolean ? 1 : 0);

    const smsgCommand = Commands.SMSG_ROOT.commandName;
    const smsgSearchCommand = Commands.SMSG_SEARCH.commandName;
    const smsgRemoveCommand = Commands.SMSG_REMOVE.commandName;
    const templateCommand = Commands.TEMPLATE_ROOT.commandName;
    const templatePostCommand = Commands.TEMPLATE_POST.commandName;
    const templateGetCommand = Commands.TEMPLATE_GET.commandName;
    const listingItemCommand = Commands.ITEM_ROOT.commandName;
    const listingItemGetCommand = Commands.ITEM_GET.commandName;

    let buyerProfile: resources.Profile;
    let sellerProfile: resources.Profile;
    let buyerMarket: resources.Market;
    let sellerMarket: resources.Market;

    let listingItemTemplateOnSellerNode: resources.ListingItemTemplate;
    let listingItemReceivedOnBuyerNode: resources.ListingItem;
    let smsgMessageReceivedOnBuyerNode: resources.SmsgMessage;


    const PAGE = 0;
    const PAGE_LIMIT = 10;
    const ORDER = SearchOrder.ASC;
    const DAYS_RETENTION = 2;

    let sent = false;

    beforeAll(async () => {
        await testUtilSellerNode.cleanDb();
        await testUtilBuyerNode.cleanDb();

        // get seller and buyer profiles
        sellerProfile = await testUtilSellerNode.getDefaultProfile();
        buyerProfile = await testUtilBuyerNode.getDefaultProfile();
        expect(sellerProfile.id).toBeDefined();
        expect(buyerProfile.id).toBeDefined();
        log.debug('sellerProfile: ', sellerProfile.address);
        log.debug('buyerProfile: ', buyerProfile.address);

        // get seller and buyer markets
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

    });


    test('Both nodes should contain no SmsgMessages', async () => {
        let res: any = await testUtilSellerNode.rpc(smsgCommand, [smsgSearchCommand,
            0,
            10,
            SearchOrder.ASC
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        let result: resources.SmsgMessage[] = res.getBody()['result'];
        expect(result).toHaveLength(0);

        res = await testUtilBuyerNode.rpc(smsgCommand, [smsgSearchCommand,
            0,
            10,
            SearchOrder.ASC
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        result = res.getBody()['result'];
        expect(result).toHaveLength(0);
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


    test('Both nodes should contain SmsgMessage', async () => {
        let resSeller: any = await testUtilSellerNode.rpcWaitFor(
            smsgCommand,
            [smsgSearchCommand, PAGE, PAGE_LIMIT, ORDER],
            15 * 60,
            200,
            '[0].type',
            MPAction.MPA_LISTING_ADD,
            '='
        );
        resSeller.expectJson();
        resSeller.expectStatusCode(200);

        resSeller = await testUtilSellerNode.rpc(smsgCommand, [smsgSearchCommand,
            0,
            10,
            SearchOrder.ASC
        ]);
        resSeller.expectJson();
        resSeller.expectStatusCode(200);
        const resultSeller: resources.SmsgMessage[] = resSeller.getBody()['result'];
        expect(resultSeller).toHaveLength(2);   // OUTGOING + INCOMING

        const resBuyer: any = await testUtilBuyerNode.rpcWaitFor(
            smsgCommand,
            [smsgSearchCommand, PAGE, PAGE_LIMIT, ORDER],
            15 * 60,
            200,
            '[0].type',
            MPAction.MPA_LISTING_ADD,
            '='
        );
        resSeller.expectJson();
        resSeller.expectStatusCode(200);

        const resultBuyer: resources.SmsgMessage[] = resBuyer.getBody()['result'];
        expect(resultBuyer).toHaveLength(1);    // INCOMING

        smsgMessageReceivedOnBuyerNode = resultBuyer[0];
        log.debug('smsgMessageReceivedOnBuyerNode.msgid: ', smsgMessageReceivedOnBuyerNode.msgid);
    });

    // TODO: test for missing/invalid params

    test('Should remove SmsgMessages from BUYER node', async () => {

        log.debug('msgid: ', smsgMessageReceivedOnBuyerNode.msgid);

        let res: any = await testUtilBuyerNode.rpc(smsgCommand, [smsgRemoveCommand,
            smsgMessageReceivedOnBuyerNode.msgid
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        res = await testUtilBuyerNode.rpc(smsgCommand, [smsgSearchCommand,
            0,
            10,
            SearchOrder.ASC
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.SmsgMessage[] = res.getBody()['result'];
        expect(result).toHaveLength(0);
    });

});
