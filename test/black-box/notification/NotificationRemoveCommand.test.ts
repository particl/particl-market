// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import * as _ from 'lodash';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { SearchOrder } from '../../../src/api/enums/SearchOrder';
import { ListingItemSearchOrderField, NotificationSearchOrderField } from '../../../src/api/enums/SearchOrderField';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { ProtocolDSN } from 'omp-lib/dist/interfaces/dsn';
import { MPActionExtended } from '../../../src/api/enums/MPActionExtended';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';


describe('NotificationRemoveCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtilSellerNode = new BlackBoxTestUtil(randomBoolean ? 0 : 1);
    const testUtilBuyerNode = new BlackBoxTestUtil(randomBoolean ? 1 : 0);

    const notificationCommand = Commands.NOTIFICATION_ROOT.commandName;
    const notificationSetReadCommand = Commands.NOTIFICATION_SETREAD.commandName;
    const notificationRemoveCommand = Commands.NOTIFICATION_REMOVE.commandName;
    const notificationSearchCommand = Commands.NOTIFICATION_SEARCH.commandName;
    const templateCommand = Commands.TEMPLATE_ROOT.commandName;
    const templatePostCommand = Commands.TEMPLATE_POST.commandName;
    const templateGetCommand = Commands.TEMPLATE_GET.commandName;
    const listingItemCommand = Commands.ITEM_ROOT.commandName;
    const listingItemGetCommand = Commands.ITEM_GET.commandName;
    const listingItemSearchCommand = Commands.ITEM_SEARCH.commandName;

    let sellerMarket: resources.Market;
    let sellerProfile: resources.Profile;
    let buyerMarket: resources.Market;
    let buyerProfile: resources.Profile;

    let listingItemTemplateOnSellerNode: resources.ListingItemTemplate;
    let listingItemReceivedOnSellerNode: resources.ListingItem;
    let listingItemReceivedOnBuyerNode: resources.ListingItem;
    let randomCategory: resources.ItemCategory;
    let notifications: resources.Notification[];
    let imageCount: number;

    let sent = false;
    const PAGE = 0;
    const PAGE_LIMIT = 10;
    const SEARCHORDER = SearchOrder.ASC;
    const NOTIFICATION_SEARCHORDERFIELD = NotificationSearchOrderField.CREATED_AT;
    const LISTINGITEM_SEARCHORDERFIELD = ListingItemSearchOrderField.CREATED_AT;
    const DAYS_RETENTION = 1;


    beforeAll(async () => {
        await testUtilSellerNode.cleanDb();
        await testUtilBuyerNode.cleanDb();

        sellerProfile = await testUtilSellerNode.getDefaultProfile();
        expect(sellerProfile.id).toBeDefined();
        sellerMarket = await testUtilSellerNode.getDefaultMarket(sellerProfile.id);
        expect(sellerMarket.id).toBeDefined();

        buyerProfile = await testUtilBuyerNode.getDefaultProfile();
        expect(buyerProfile.id).toBeDefined();
        buyerMarket = await testUtilBuyerNode.getDefaultMarket(buyerProfile.id);
        expect(buyerMarket.id).toBeDefined();

        randomCategory = await testUtilSellerNode.getRandomCategory();

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,                   // generateItemInformation
            true,                   // generateItemLocation
            true,                   // generateShippingDestinations
            true,                   // generateImages
            true,                   // generatePaymentInformation
            true,                   // generateEscrow
            true,                   // generateItemPrice
            true,                   // generateMessagingInformation
            false,                  // generateListingItemObjects
            false,                  // generateObjectDatas
            sellerProfile.id,       // profileId
            false,                  // generateListingItem
            sellerMarket.id,        // soldOnMarketId, no market -> base template
            randomCategory.id,      // categoryId
            false                   // largeImages
        ]).toParamsArray();

        const listingItemTemplates = await testUtilSellerNode.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                    // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplate[];
        listingItemTemplateOnSellerNode = listingItemTemplates[0];
        imageCount = listingItemTemplateOnSellerNode.ItemInformation.Images.length;

        expect(listingItemTemplateOnSellerNode).toBeDefined();

        expect(listingItemTemplateOnSellerNode.id).toBeDefined();
        let res: any = await testUtilSellerNode.rpc(templateCommand, [templatePostCommand,
            listingItemTemplateOnSellerNode.id,
            DAYS_RETENTION
        ]);
        res.expectJson();

        // make sure we got the expected result from posting the template
        const result: any = res.getBody()['result'];
        // log.debug('result:', JSON.stringify(result, null, 2));
        sent = result.result === 'Sent.';
        if (!sent) {
            log.debug(JSON.stringify(result, null, 2));
        }
        expect(result.result).toBe('Sent.');

        log.debug('==[ POSTED ITEM ]=============================================================================');
        log.debug('id: ' + listingItemTemplateOnSellerNode.id + ', ' + listingItemTemplateOnSellerNode.ItemInformation.title);
        log.debug('desc: ' + listingItemTemplateOnSellerNode.ItemInformation.shortDescription);
        log.debug('category: ' + listingItemTemplateOnSellerNode.ItemInformation.ItemCategory.id + ', '
            + listingItemTemplateOnSellerNode.ItemInformation.ItemCategory.name);
        log.debug('==============================================================================================');

        res = await testUtilSellerNode.rpc(templateCommand, [templateGetCommand,
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

        const response: any = await testUtilSellerNode.rpcWaitFor(listingItemCommand, [listingItemSearchCommand,
                PAGE, PAGE_LIMIT, SEARCHORDER, LISTINGITEM_SEARCHORDERFIELD,
                sellerMarket.receiveAddress,
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

        listingItemReceivedOnSellerNode = results[0];

        for (const image of listingItemReceivedOnSellerNode.ItemInformation.Images) {
            expect(image.msgid).toBeDefined();
            expect(image.target).toBeDefined();
            expect(image.generatedAt).toBeDefined();
            expect(image.postedAt).toBeDefined();
            expect(image.receivedAt).toBeDefined();

            for (const imageData of image.ImageDatas) {
                expect(imageData.data).toBeNull();
                expect(imageData.protocol).toBe(ProtocolDSN.FILE);
            }
        }
    }, 600000); // timeout to 600s


    test('Should have received MPA_LISTING_ADD on BUYER node', async () => {

        // sending should have succeeded for this test to work
        expect(sent).toBeTruthy();

        log.debug('========================================================================================');
        log.debug('BUYER RECEIVES MPA_LISTING_ADD');
        log.debug('========================================================================================');

        let response: any = await testUtilBuyerNode.rpcWaitFor(listingItemCommand, [listingItemSearchCommand,
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

        await testUtilBuyerNode.waitFor(5);
        response = await testUtilBuyerNode.rpc(listingItemCommand, [listingItemGetCommand,
            results[0].id
        ]);
        response.expectJson();
        response.expectStatusCode(200);

        const result: resources.ListingItem = response.getBody()['result'];
        expect(result).toBeDefined();

        listingItemReceivedOnBuyerNode = result;

        expect(listingItemReceivedOnBuyerNode.ItemInformation.Images.length).toBeGreaterThan(0);

        for (const image of listingItemReceivedOnBuyerNode.ItemInformation.Images) {
            expect(image.msgid).toBeDefined();
            expect(image.target).toBeDefined();
            expect(image.generatedAt).toBeDefined();
            expect(image.postedAt).toBeDefined();
            expect(image.receivedAt).toBeDefined();

            for (const imageData of image.ImageDatas) {
                expect(imageData.data).toBeNull();
                expect(imageData.protocol).toBe(ProtocolDSN.FILE);
            }
        }
    }, 600000); // timeout to 600s


    test('Should return 3 Notifications', async () => {
        const res: any = await testUtilSellerNode.rpc(notificationCommand, [notificationSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, NOTIFICATION_SEARCHORDERFIELD,
            null,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const results: resources.Notification[] = res.getBody()['result'];
        log.debug('results: ', JSON.stringify(results, null, 2));
        log.debug('imageCount: ', imageCount);

        expect(results.length).toBe(imageCount + 1);
        for (const notification of results) {
            expect(notification.read).toBeFalsy();
        }
        notifications = results;
    });


    test('Should fail because missing notificationId', async () => {
        const res = await testUtilSellerNode.rpc(notificationCommand, [notificationRemoveCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('notificationId').getMessage());
    });


    test('Should fail because invalid notificationId', async () => {
        const res: any = await testUtilSellerNode.rpc(notificationCommand, [notificationRemoveCommand,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('notificationId', 'number').getMessage());
    });


    test('Should remove one', async () => {
        const res: any = await testUtilSellerNode.rpc(notificationCommand, [notificationRemoveCommand,
            notifications[0].id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
    });


    test('Should return two', async () => {
        const res: any = await testUtilSellerNode.rpc(notificationCommand, [notificationSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, NOTIFICATION_SEARCHORDERFIELD,
            null,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const results: resources.Notification[] = res.getBody()['result'];

        log.debug('results: ', JSON.stringify(results, null, 2));

        expect(results.length).toBe(2);
    });


});
