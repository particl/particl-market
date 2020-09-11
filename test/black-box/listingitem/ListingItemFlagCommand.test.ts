// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { SearchOrder } from '../../../src/api/enums/SearchOrder';
import { ListingItemSearchOrderField } from '../../../src/api/enums/SearchOrderField';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';

describe('ListingItemFlagCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtilSellerNode = new BlackBoxTestUtil(randomBoolean ? 0 : 1);
    const testUtilBuyerNode = new BlackBoxTestUtil(randomBoolean ? 1 : 0);

    const itemCommand = Commands.ITEM_ROOT.commandName;
    const itemFlagCommand = Commands.ITEM_FLAG.commandName;
    const itemGetCommand = Commands.ITEM_GET.commandName;
    const itemSearchCommand = Commands.ITEM_SEARCH.commandName;
    const templateCommand = Commands.TEMPLATE_ROOT.commandName;
    const templatePostCommand = Commands.TEMPLATE_POST.commandName;
    const templateGetCommand = Commands.TEMPLATE_GET.commandName;

    let sellerProfile: resources.Profile;
    let buyerProfile: resources.Profile;
    let sellerMarket: resources.Market;
    let buyerMarket: resources.Market;

    let listingItemTemplateOnSellerNode: resources.ListingItemTemplate;
    let randomCategoryOnSellerNode: resources.ItemCategory;

    let listingItemReceivedOnBuyerNode: resources.ListingItem;

    const PAGE = 0;
    const PAGE_LIMIT = 10;
    const SEARCHORDER = SearchOrder.ASC;
    const LISTINGITEM_SEARCHORDERFIELD = ListingItemSearchOrderField.CREATED_AT;
    const DAYS_RETENTION = 2;

    let sent = false;

    beforeAll(async () => {
        await testUtilSellerNode.cleanDb();
        await testUtilBuyerNode.cleanDb();

        sellerProfile = await testUtilSellerNode.getDefaultProfile();
        buyerProfile = await testUtilBuyerNode.getDefaultProfile();
        expect(sellerProfile.id).toBeDefined();
        expect(buyerProfile.id).toBeDefined();
        // log.debug('sellerProfile.id: ', sellerProfile.id);
        // log.debug('buyerProfile.id: ', buyerProfile.id);

        sellerMarket = await testUtilSellerNode.getDefaultMarket(sellerProfile.id);
        buyerMarket = await testUtilBuyerNode.getDefaultMarket(buyerProfile.id);
        expect(sellerMarket.id).toBeDefined();
        expect(buyerMarket.id).toBeDefined();
        // log.debug('sellerMarket: ', JSON.stringify(sellerMarket, null, 2));
        // log.debug('buyerMarket: ', JSON.stringify(buyerMarket, null, 2));

        randomCategoryOnSellerNode = await testUtilSellerNode.getRandomCategory();

        // generate listingitemtemplate
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,                           // generateItemInformation
            true,                           // generateItemLocation
            true,                           // generateShippingDestinations
            false,                          // generateImages
            true,                           // generatePaymentInformation
            true,                           // generateEscrow
            true,                           // generateItemPrice
            true,                           // generateMessagingInformation
            false,                          // generateListingItemObjects
            false,                          // generateObjectDatas
            sellerProfile.id,               // profileId
            false,                          // generateListingItem
            sellerMarket.id,                // marketId
            randomCategoryOnSellerNode.id   // categoryId
        ]).toParamsArray();

        const listingItemTemplates = await testUtilSellerNode.generateData(
            CreatableModel.LISTINGITEMTEMPLATE,     // what to generate
            1,                              // how many to generate
            true,                        // return model
            generateListingItemTemplateParams       // what kind of data to generate
        ) as resources.ListingItemTemplates[];

        listingItemTemplateOnSellerNode = listingItemTemplates[0];
        expect(listingItemTemplateOnSellerNode.id).toBeDefined();

    });

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

    test('Should have received MPA_LISTING_ADD on BUYER node', async () => {

        // sending should have succeeded for this test to work
        expect(sent).toBeTruthy();

        log.debug('========================================================================================');
        log.debug('BUYER RECEIVES MPA_LISTING_ADD');
        log.debug('========================================================================================');

        const response: any = await testUtilBuyerNode.rpcWaitFor(itemCommand, [itemSearchCommand,
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

    test('Should fail to flag because missing listingItemId', async () => {
        const res = await testUtilBuyerNode.rpc(itemCommand, [itemFlagCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('listingItemId').getMessage());
    });

    test('Should fail to flag because missing identityId', async () => {
        const res = await testUtilBuyerNode.rpc(itemCommand, [itemFlagCommand,
            listingItemReceivedOnBuyerNode.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('identityId').getMessage());
    });

    test('Should fail to flag because invalid listingItemId', async () => {
        const res = await testUtilBuyerNode.rpc(itemCommand, [itemFlagCommand,
            'INVALID',
            buyerProfile.id
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('listingItemId', 'number').getMessage());
    });

    test('Should fail to flag because invalid identityId (string)', async () => {
        const res = await testUtilBuyerNode.rpc(itemCommand, [itemFlagCommand,
            listingItemReceivedOnBuyerNode.id,
            'INVALID-PROFILE-ID'
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('identityId', 'number').getMessage());
    });

    test('Should fail to flag because Identity not found', async () => {
        const res = await testUtilBuyerNode.rpc(itemCommand, [itemFlagCommand,
            listingItemReceivedOnBuyerNode.id,
            0
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('Identity').getMessage());
    });

    test('Should fail to flag because ListingItem not found', async () => {
        const res = await testUtilBuyerNode.rpc(itemCommand, [itemFlagCommand,
            0,
            buyerProfile.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('ListingItem').getMessage());
    });

    test('Should get empty FlaggedItem relation for the ListingItem, because ListingItem is not flagged yet', async () => {
        const res = await testUtilBuyerNode.rpc(itemCommand, [itemGetCommand,
            listingItemReceivedOnBuyerNode.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.FlaggedItem).toMatchObject({});
    });

    test('Should flag the ListingItem using listingItemId and identityId', async () => {
        const response = await testUtilBuyerNode.rpc(itemCommand, [itemFlagCommand,
            listingItemReceivedOnBuyerNode.id,
            buyerMarket.Identity.id
        ]);
        response.expectJson();
        response.expectStatusCode(200);

        // make sure we got the expected result from posting the proposal
        const result: any = response.getBody()['result'];
        expect(result.result).toBe('Sent.');

        log.debug('==> PROPOSAL SENT.');

    }, 600000); // timeout to 600s

    test('Should have flagged the ListingItem', async () => {
        const response = await testUtilBuyerNode.rpcWaitFor(itemCommand, [itemGetCommand,
                listingItemReceivedOnBuyerNode.id
            ],
            8 * 60,
            200,
            'FlaggedItem.reason',
            'This ListingItem should be removed.'
        );
        response.expectJson();
        response.expectStatusCode(200);

        const item: resources.ListingItem = response.getBody()['result'];
        // log.debug('listingItem:', JSON.stringify(listingItem, null, 2));

        expect(item.FlaggedItem.Proposal.title).toBe(listingItemReceivedOnBuyerNode.hash);
    }, 600000); // timeout to 600s

    test('Should fail to flag the ListingItem because the ListingItem has already been flagged', async () => {
        const res = await testUtilBuyerNode.rpc(itemCommand, [itemFlagCommand,
            listingItemReceivedOnBuyerNode.id,
            buyerMarket.Identity.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('ListingItem is already flagged.');
    });

});
