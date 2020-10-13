// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands} from '../../../src/api/commands/CommandEnumType';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { MarketType } from '../../../src/api/enums/MarketType';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { MessageException } from '../../../src/api/exceptions/MessageException';
import { PrivateKey, Networks } from 'particl-bitcore-lib';
import { MarketRegion } from '../../../src/api/enums/MarketRegion';
import {SearchOrder} from '../../../src/api/enums/SearchOrder';
import {ListingItemSearchOrderField} from '../../../src/api/enums/SearchOrderField';
import {CreatableModel} from '../../../src/api/enums/CreatableModel';
import {GenerateListingItemTemplateParams} from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import {BlacklistType} from '../../../src/api/enums/BlacklistType';
import {ModelNotFoundException} from '../../../src/api/exceptions/ModelNotFoundException';


describe('BlacklistAddCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtilSellerNode = new BlackBoxTestUtil(randomBoolean ? 0 : 1);
    const testUtilBuyerNode = new BlackBoxTestUtil(randomBoolean ? 1 : 0);

    const blacklistCommand = Commands.BLACKLIST_ROOT.commandName;
    const blacklistAddCommand = Commands.BLACKLIST_ADD.commandName;
    const blacklistListCommand = Commands.BLACKLIST_LIST.commandName;

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

    let blacklists: resources.Blacklist[];

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



    test('Should fail because missing type', async () => {
        const res = await testUtilSellerNode.rpc(blacklistCommand, [blacklistAddCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('type').getMessage());
    });

    test('Should fail because missing target', async () => {
        const res = await testUtilSellerNode.rpc(blacklistCommand, [blacklistAddCommand,
            BlacklistType.LISTINGITEM
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('target').getMessage());
    });

    test('Should fail because invalid type', async () => {

        const res: any = await testUtilSellerNode.rpc(blacklistCommand, [blacklistAddCommand,
            false,
            'target'
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('type', 'string').getMessage());
    });

    test('Should fail because invalid target', async () => {

        const res: any = await testUtilSellerNode.rpc(blacklistCommand, [blacklistAddCommand,
            BlacklistType.LISTINGITEM,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('target', 'string').getMessage());
    });

    test('Should fail because missing marketId', async () => {
        const res = await testUtilSellerNode.rpc(blacklistCommand, [blacklistAddCommand,
            BlacklistType.LISTINGITEM,
            'target'
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('marketId').getMessage());
    });

    test('Should fail because ListingItem not found', async () => {
        const res = await testUtilBuyerNode.rpc(blacklistCommand, [blacklistAddCommand,
            BlacklistType.LISTINGITEM,
            'target',
            buyerMarket.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('ListingItem').getMessage());
    });

    test('Should add a Blacklist for ListingItem hash', async () => {
        const res = await testUtilBuyerNode.rpc(blacklistCommand, [blacklistAddCommand,
            BlacklistType.LISTINGITEM,
            listingItemReceivedOnBuyerNode.hash,
            buyerMarket.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.Blacklist = res.getBody()['result'];
        log.debug('result:', JSON.stringify(result, null, 2));
        expect(result.type).toBe(BlacklistType.LISTINGITEM);
        expect(result.target).toBe(listingItemReceivedOnBuyerNode.hash);
        expect(result.market).toBe(buyerMarket.receiveAddress);

    });

});
