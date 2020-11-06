// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import * as jpeg from 'jpeg-js';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';
import { OutputType } from 'omp-lib/dist/interfaces/crypto';
import { SearchOrder } from '../../../src/api/enums/SearchOrder';
import { ListingItemSearchOrderField } from '../../../src/api/enums/SearchOrderField';
import { ProtocolDSN } from 'omp-lib/dist/interfaces/dsn';
import { SmsgSendResponse } from '../../../src/api/responses/SmsgSendResponse';
import { CoreMessageVersion } from '../../../src/api/enums/CoreMessageVersion';
import * as _ from 'lodash';
import {ImageVersions} from '../../../src/core/helpers/ImageVersionEnumType';
import {MessageVersions} from '../../../src/api/messages/MessageVersions';

describe('ListingItemTemplatePostCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtilSellerNode = new BlackBoxTestUtil(randomBoolean ? 0 : 1);
    const testUtilBuyerNode = new BlackBoxTestUtil(randomBoolean ? 1 : 0);

    const templateCommand = Commands.TEMPLATE_ROOT.commandName;
    const templatePostCommand = Commands.TEMPLATE_POST.commandName;
    const templateGetCommand = Commands.TEMPLATE_GET.commandName;
    const templateAddCommand = Commands.TEMPLATE_ADD.commandName;
    const templateCloneCommand = Commands.TEMPLATE_CLONE.commandName;
    const templateSizeCommand = Commands.TEMPLATE_SIZE.commandName;
    const templateCompressCommand = Commands.TEMPLATE_COMPRESS.commandName;
    const listingItemCommand = Commands.ITEM_ROOT.commandName;
    const listingItemSearchCommand = Commands.ITEM_SEARCH.commandName;
    const itemLocationCommand = Commands.ITEMLOCATION_ROOT.commandName;
    const itemLocationUpdateCommand = Commands.ITEMLOCATION_UPDATE.commandName;
    const shippingDestinationCommand = Commands.SHIPPINGDESTINATION_ROOT.commandName;
    const shippingDestinationAddCommand = Commands.SHIPPINGDESTINATION_ADD.commandName;
    const imageCommand = Commands.IMAGE_ROOT.commandName;
    const imageAddCommand = Commands.IMAGE_ADD.commandName;

    let sellerProfile: resources.Profile;
    let sellerMarket: resources.Market;
    let buyerProfile: resources.Profile;
    let buyerMarket: resources.Market;

    let listingItemTemplateOnSellerNode: resources.ListingItemTemplate;
    let listingItemReceivedOnSellerNode: resources.ListingItem;
    let listingItemReceivedOnBuyerNode: resources.ListingItem;

    let randomCategory: resources.ItemCategory;

    let sent = false;
    const PAGE = 0;
    const PAGE_LIMIT = 10;
    const SEARCHORDER = SearchOrder.ASC;
    const LISTINGITEM_SEARCHORDERFIELD = ListingItemSearchOrderField.CREATED_AT;
    const DAYS_RETENTION = 1;

    beforeAll(async () => {
        await testUtilSellerNode.cleanDb();
        await testUtilBuyerNode.cleanDb();

        sellerProfile = await testUtilSellerNode.getDefaultProfile();
        sellerMarket = await testUtilSellerNode.getDefaultMarket(sellerProfile.id);

        buyerProfile = await testUtilBuyerNode.getDefaultProfile();
        buyerMarket = await testUtilBuyerNode.getDefaultMarket(buyerProfile.id);

        randomCategory = await testUtilSellerNode.getRandomCategory();

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,                           // generateItemInformation
            true,                           // generateItemLocation
            true,                           // generateShippingDestinations
            true,                           // generateImages
            true,                           // generatePaymentInformation
            true,                           // generateEscrow
            true,                           // generateItemPrice
            true,                           // generateMessagingInformation
            false,                          // generateListingItemObjects
            false,                          // generateObjectDatas
            sellerProfile.id,               // profileId
            false,                          // generateListingItem
            sellerMarket.id,                // soldOnMarketId
            randomCategory.id,              // categoryId
            false                           // largeImages
        ]).toParamsArray();

        const listingItemTemplates = await testUtilSellerNode.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                    // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplate[];

        listingItemTemplateOnSellerNode = listingItemTemplates[0];

    });


    test('Should fail because missing listingItemTemplateId', async () => {
        const res = await testUtilSellerNode.rpc(templateCommand, [templatePostCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('listingItemTemplateId').getMessage());
    });


    test('Should fail because missing daysRetention', async () => {
        const res = await testUtilSellerNode.rpc(templateCommand, [templatePostCommand,
            listingItemTemplateOnSellerNode.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('daysRetention').getMessage());
    });


    test('Should fail because invalid listingItemTemplateId', async () => {
        const res = await testUtilSellerNode.rpc(templateCommand, [templatePostCommand,
            'INVALID',
            DAYS_RETENTION
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('listingItemTemplateId', 'number').getMessage());
    });


    test('Should fail because invalid daysRetention', async () => {
        const res = await testUtilSellerNode.rpc(templateCommand, [templatePostCommand,
            listingItemTemplateOnSellerNode.id,
            'INVALID'
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('daysRetention', 'number').getMessage());
    });


    test('Should fail because invalid estimateFee', async () => {
        const res = await testUtilSellerNode.rpc(templateCommand, [templatePostCommand,
            listingItemTemplateOnSellerNode.id,
            DAYS_RETENTION,
            0
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('estimateFee', 'boolean').getMessage());
    });


    test('Should fail because invalid usePaidImageMessages', async () => {
        const res = await testUtilSellerNode.rpc(templateCommand, [templatePostCommand,
            listingItemTemplateOnSellerNode.id,
            DAYS_RETENTION,
            true,
            0
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('usePaidImageMessages', 'boolean').getMessage());
    });


    test('Should fail because invalid feeType', async () => {
        const res = await testUtilSellerNode.rpc(templateCommand, [templatePostCommand,
            listingItemTemplateOnSellerNode.id,
            DAYS_RETENTION,
            true,
            false,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('feeType', 'string').getMessage());
    });


    test('Should fail because invalid feeType', async () => {
        const res = await testUtilSellerNode.rpc(templateCommand, [templatePostCommand,
            listingItemTemplateOnSellerNode.id,
            DAYS_RETENTION,
            true,
            false,
            'INVALID'
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('feeType', 'OutputType').getMessage());
    });

    test('Should fail because invalid ringSize', async () => {
        const res = await testUtilSellerNode.rpc(templateCommand, [templatePostCommand,
            listingItemTemplateOnSellerNode.id,
            DAYS_RETENTION,
            true,
            false,
            OutputType.PART,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('ringSize', 'number').getMessage());
    });


    test('Should fail because ListingItemTemplate not found', async () => {
        const res = await testUtilSellerNode.rpc(templateCommand, [templatePostCommand,
            0,
            DAYS_RETENTION,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('ListingItemTemplate').getMessage());
    });


    test('Should estimate post cost without actually posting (FREE image msgs)', async () => {

        expect(listingItemTemplateOnSellerNode.id).toBeDefined();
        const res: any = await testUtilSellerNode.rpc(templateCommand, [templatePostCommand,
            listingItemTemplateOnSellerNode.id,
            DAYS_RETENTION,
            true
        ]);
        res.expectJson();

        // make sure we got the expected result from posting the template
        const result: any = res.getBody()['result'];
        log.debug('result:', JSON.stringify(result, null, 2));

        expect(result.result).toBe('Not Sent.');
        expect(result.childResults[0].result).toBe('No fee for FREE message.');
        expect(result.childResults[0].fee).toBe(0);

        log.debug('==[ ESTIMATED COST ON ITEM (FREE image msgs) ]================================================');
        log.debug('id: ' + listingItemTemplateOnSellerNode.id + ', ' + listingItemTemplateOnSellerNode.ItemInformation.title);
        log.debug('desc: ' + listingItemTemplateOnSellerNode.ItemInformation.shortDescription);
        log.debug('fee: ' + result.fee);
        log.debug('==============================================================================================');

    });


    test('Should estimate post cost with PAID images', async () => {

        expect(listingItemTemplateOnSellerNode.id).toBeDefined();

        const res: any = await testUtilSellerNode.rpc(templateCommand, [templatePostCommand,
            listingItemTemplateOnSellerNode.id,
            DAYS_RETENTION,
            true,
            true
        ]);
        res.expectJson();

        // make sure we got the expected result from posting the template
        const result: SmsgSendResponse = res.getBody()['result'];
        log.debug('result:', JSON.stringify(result, null, 2));

        expect(result.result).toBe('Not Sent.');
        expect(result.fee).not.toBeUndefined();
        expect(result.fee).toBeGreaterThan(0);
        expect(result.totalFees).not.toBeUndefined();
        expect(result.totalFees).toBeGreaterThan(result.fee!);

        expect(result.childResults![0].result).toBe('Not Sent.');
        expect(result.childResults![0].fee).toBeGreaterThan(0);

        log.debug('==[ ESTIMATED COST ON ITEM (PAID image msgs) ]================================================');
        log.debug('id: ' + listingItemTemplateOnSellerNode.id + ', ' + listingItemTemplateOnSellerNode.ItemInformation.title);
        log.debug('desc: ' + listingItemTemplateOnSellerNode.ItemInformation.shortDescription);
        log.debug('fee: ' + result.fee);
        log.debug('totalFees: ' + result.totalFees);
        log.debug('==============================================================================================');
    });


    test('Should add a large Image to the ListingItemTemplate', async () => {

        expect(listingItemTemplateOnSellerNode.id).toBeDefined();

        const imageCount = listingItemTemplateOnSellerNode.ItemInformation.Images.length;
        const randomImage = await testUtilSellerNode.generateRandomImage(800, 400);

        let res: any = await testUtilSellerNode.rpc(imageCommand, [imageAddCommand,
            'template',
            listingItemTemplateOnSellerNode.id,
            ProtocolDSN.REQUEST,
            randomImage,
            false,              // featured
            true                // skipResize
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const addImageResult: resources.Image = res.getBody()['result'];

        res = await testUtilSellerNode.rpc(templateCommand, [templateGetCommand,
            listingItemTemplateOnSellerNode.id,
            true        // returnImageData
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        listingItemTemplateOnSellerNode = res.getBody()['result'];

        expect(addImageResult.id).toBe(listingItemTemplateOnSellerNode.ItemInformation.Images[imageCount].id);

        log.debug('Added Image (skipResize), length: ', randomImage.length);
    });


    test('Should fail to estimate post cost because Image too large for FREE message', async () => {
        const res = await testUtilSellerNode.rpc(templateCommand, [templatePostCommand,
            listingItemTemplateOnSellerNode.id,
            DAYS_RETENTION,
            true,       // estimateFee
            false       // paidImageMessages
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toContain('MPA_LISTING_IMAGE_ADD size exceeds size limit.');
    });


    test('Should estimate post cost with PAID image messages', async () => {

        expect(listingItemTemplateOnSellerNode.id).toBeDefined();

        const res: any = await testUtilSellerNode.rpc(templateCommand, [templatePostCommand,
            listingItemTemplateOnSellerNode.id,
            DAYS_RETENTION,
            true,       // estimateFee
            true        // paidImageMessages
        ]);
        res.expectJson();

        // make sure we got the expected result from posting the template
        const result: SmsgSendResponse = res.getBody()['result'];
        log.debug('result:', JSON.stringify(result, null, 2));

        expect(result.result).toBe('Not Sent.');
        expect(result.fee).toBeGreaterThan(0);
        expect(result.totalFees).not.toBeUndefined();
        expect(result.totalFees).toBeGreaterThan(result.fee!);
        expect(result.childResults![0].result).toBe('Not Sent.');
        expect(result.childResults![0].fee).toBeGreaterThan(0);

        log.debug('==[ ESTIMATED COST ON ITEM (PAID image msgs)  ]===============================================');
        log.debug('id: ' + listingItemTemplateOnSellerNode.id + ', ' + listingItemTemplateOnSellerNode.ItemInformation.title);
        log.debug('desc: ' + listingItemTemplateOnSellerNode.ItemInformation.shortDescription);
        log.debug('fee: ' + result.fee);
        log.debug('totalFees: ' + result.totalFees);
        log.debug('==============================================================================================');
    });


    test('Should add a too large Image 1 for PAID msg to the ListingItemTemplate', async () => {

        expect(listingItemTemplateOnSellerNode.id).toBeDefined();

        const imageCount = listingItemTemplateOnSellerNode.ItemInformation.Images.length;
        const randomImage = await testUtilSellerNode.generateRandomImage(1000, 800);
        log.debug('randomImage.length: ', randomImage.length);

        let res: any = await testUtilSellerNode.rpc(imageCommand, [imageAddCommand,
            'template',
            listingItemTemplateOnSellerNode.id,
            ProtocolDSN.REQUEST,
            randomImage,
            false,              // featured
            true                // skipResize
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const addImageResult: resources.Image = res.getBody()['result'];

        res = await testUtilSellerNode.rpc(templateCommand, [templateGetCommand,
            listingItemTemplateOnSellerNode.id,
            true        // returnImageData
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        listingItemTemplateOnSellerNode = res.getBody()['result'];

        expect(addImageResult.id).toBe(listingItemTemplateOnSellerNode.ItemInformation.Images[imageCount].id);
        log.debug('Added Image (skipResize), length: ', randomImage.length);
    });


    test('Should add a too large Image 2 for PAID msg to the ListingItemTemplate (resize after upload)', async () => {

        expect(listingItemTemplateOnSellerNode.id).toBeDefined();

        const randomImage = await testUtilSellerNode.generateRandomImage(1000, 800);
        log.debug('randomImage.length (resizing after upload): ', randomImage.length);

        let res: any = await testUtilSellerNode.rpc(imageCommand, [imageAddCommand,
            'template',
            listingItemTemplateOnSellerNode.id,
            ProtocolDSN.REQUEST,
            randomImage,
            false,              // featured
            false,              // skipResize
            CoreMessageVersion.PAID,
            0.8,                // scalingFraction, default: 0.9
            1,                  // qualityFraction, default: 0.9
            50                  // maxIterations, default: 10
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const addImageResult: resources.Image = res.getBody()['result'];
        log.debug('addImageResult:', JSON.stringify(addImageResult, null, 2));

        res = await testUtilSellerNode.rpc(templateCommand, [templateGetCommand,
            listingItemTemplateOnSellerNode.id,
            true        // returnImageData
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        listingItemTemplateOnSellerNode = res.getBody()['result'];

        const index = listingItemTemplateOnSellerNode.ItemInformation.Images.length - 1;
        expect(addImageResult.id).toBe(listingItemTemplateOnSellerNode.ItemInformation.Images[index].id);

        log.debug('Added Image (original), length: ', randomImage.length);
        const resizedImageData = _.find(addImageResult.ImageDatas, (value: resources.Image) => {
            return value.imageVersion === ImageVersions.RESIZED.propName;
        });

        log.debug('resizedImageData:', JSON.stringify(resizedImageData, null, 2));
        expect(resizedImageData.imageHash).toBe(addImageResult.hash);

    });

/*
    test('Should return MessageSize for ListingItemTemplate, FREE msg, doesnt fit', async () => {

        const res = await testUtilSellerNode.rpc(templateCommand, [templateSizeCommand,
            listingItemTemplateOnSellerNode.id,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result = res.getBody()['result'];
        log.debug('MessageSize: ', JSON.stringify(result, null, 2));
        expect(result.spaceLeft).toBeGreaterThan(0);
        expect(result.fits).toBe(true);

        const imageCount = listingItemTemplateOnSellerNode.ItemInformation.Images.length;
        expect(result.childMessageSizes[imageCount - 1].fits).toBe(false);
        expect(result.childMessageSizes[imageCount - 1].spaceLeft).toBeLessThan(0);
    });


    test('Should return MessageSize for ListingItemTemplate, PAID msg, doesnt fit, but last image fits', async () => {

        const res = await testUtilSellerNode.rpc(templateCommand, [templateSizeCommand,
            listingItemTemplateOnSellerNode.id,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result = res.getBody()['result'];
        log.debug('MessageSize: ', JSON.stringify(result, null, 2));
        expect(result.spaceLeft).toBeGreaterThan(0);
        expect(result.fits).toBe(true);

        const imageCount = listingItemTemplateOnSellerNode.ItemInformation.Images.length;
        expect(result.childMessageSizes[imageCount - 1].fits).toBe(true);
        expect(result.childMessageSizes[imageCount - 1].spaceLeft).toBeGreaterThan(0);
    });


    test('Should fail to estimate post cost because Image too large for PAID message', async () => {
        const res = await testUtilSellerNode.rpc(templateCommand, [templatePostCommand,
            listingItemTemplateOnSellerNode.id,
            DAYS_RETENTION,
            true,       // estimateFee
            true        // paidImageMessages
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toContain('MPA_LISTING_IMAGE_ADD size exceeds size limit.');
    });


    test('Should compress all Images to fit PAID message size', async () => {
        const res = await testUtilSellerNode.rpc(templateCommand, [templateCompressCommand,
            listingItemTemplateOnSellerNode.id,
            CoreMessageVersion.PAID,
            0.9,
            0.8,
            10
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.ListingItemTemplate = res.getBody()['result'];
        for (const image of result.ItemInformation.Images) {
            expect(image.ImageDatas).toHaveLength(5);
        }
    });

    // todo: all images should fit in PAID msgs

    test('Should estimate post cost with PAID image messages', async () => {

        expect(listingItemTemplateOnSellerNode.id).toBeDefined();

        const res: any = await testUtilSellerNode.rpc(templateCommand, [templatePostCommand,
            listingItemTemplateOnSellerNode.id,
            DAYS_RETENTION,
            true,       // estimateFee
            true        // paidImageMessages
        ]);
        res.expectJson();

        // make sure we got the expected result from posting the template
        const result: SmsgSendResponse = res.getBody()['result'];
        log.debug('result:', JSON.stringify(result, null, 2));

        expect(result.result).toBe('Not Sent.');
        expect(result.fee).not.toBeUndefined();
        expect(result.fee).toBeGreaterThan(0);
        expect(result.totalFees).not.toBeUndefined();
        expect(result.totalFees).toBeGreaterThan(result.fee!);

        log.debug('==[ ESTIMATED COST ON ITEM (PAID) ]===========================================================');
        log.debug('id: ' + listingItemTemplateOnSellerNode.id + ', ' + listingItemTemplateOnSellerNode.ItemInformation.title);
        log.debug('desc: ' + listingItemTemplateOnSellerNode.ItemInformation.shortDescription);
        log.debug('fee: ' + result.fee);
        log.debug('totalFees: ' + result.totalFees);
        log.debug('==============================================================================================');
    });
*/
/*
    test('Should compress Images to fit FREE message size', async () => {
        const res = await testUtilSellerNode.rpc(templateCommand, [templateCompressCommand,
            listingItemTemplateOnSellerNode.id,
            CoreMessageVersion.FREE,
            0.9,
            0.8,
            10
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.ListingItemTemplate = res.getBody()['result'];
        for (const image of result.ItemInformation.Images) {
            expect(image.ImageDatas).toHaveLength(5);
            for (const imageData of image.ImageDatas) {
                expect(imageData.data).toBeNull();
                expect(imageData.protocol).toBe(ProtocolDSN.FILE);
            }
        }
    });


    test('Should estimate post cost with FREE image messages', async () => {

        expect(listingItemTemplateOnSellerNode.id).toBeDefined();

        const res: any = await testUtilSellerNode.rpc(templateCommand, [templatePostCommand,
            listingItemTemplateOnSellerNode.id,
            DAYS_RETENTION,
            true,       // estimateFee
            false       // paidImageMessages
        ]);
        res.expectJson();

        // make sure we got the expected result from posting the template
        const result: SmsgSendResponse = res.getBody()['result'];
        log.debug('result:', JSON.stringify(result, null, 2));

        expect(result.result).toBe('Not Sent.');
        expect(result.fee).not.toBeUndefined();
        expect(result.fee).toBeGreaterThan(0);
        expect(result.totalFees).not.toBeUndefined();
        expect(result.totalFees).toBe(result.fee!);

        log.debug('==[ ESTIMATED COST ON ITEM ]==================================================================');
        log.debug('id: ' + listingItemTemplateOnSellerNode.id + ', ' + listingItemTemplateOnSellerNode.ItemInformation.title);
        log.debug('desc: ' + listingItemTemplateOnSellerNode.ItemInformation.shortDescription);
        log.debug('fee: ' + result.fee);
        log.debug('totalFees: ' + result.totalFees);
        log.debug('==============================================================================================');
    });


    test('Should post a ListingItemTemplate from SELLER node (FREE image msg)', async () => {

        expect(listingItemTemplateOnSellerNode.id).toBeDefined();
        const res: any = await testUtilSellerNode.rpc(templateCommand, [templatePostCommand,
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

    });


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
        // log.debug('listingItemReceivedOnSellerNode: ', JSON.stringify(listingItemReceivedOnSellerNode, null, 2));
        expect(listingItemReceivedOnSellerNode.ItemInformation.Images.length).toBeGreaterThan(0);

        for (const image of listingItemReceivedOnSellerNode.ItemInformation.Images) {
            expect(image.msgid).toBeDefined();
            expect(image.target).toBeDefined();
            expect(image.generatedAt).toBeDefined();
            expect(image.postedAt).toBeDefined();
            expect(image.receivedAt).toBeDefined();
            expect(image.ImageDatas).toHaveLength(4);

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

        const response: any = await testUtilBuyerNode.rpcWaitFor(listingItemCommand, [listingItemSearchCommand,
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

        listingItemReceivedOnBuyerNode = results[0];
        // log.debug('listingItemReceivedOnSellerNode: ', JSON.stringify(listingItemReceivedOnSellerNode, null, 2));
        expect(listingItemReceivedOnBuyerNode.ItemInformation.Images.length).toBeGreaterThan(0);

        for (const image of listingItemReceivedOnBuyerNode.ItemInformation.Images) {
            expect(image.msgid).toBeDefined();
            expect(image.target).toBeDefined();
            expect(image.generatedAt).toBeDefined();
            expect(image.postedAt).toBeDefined();
            expect(image.receivedAt).toBeDefined();
            expect(image.ImageDatas).toHaveLength(4);

            for (const imageData of image.ImageDatas) {
                expect(imageData.data).toBeNull();
                expect(imageData.protocol).toBe(ProtocolDSN.FILE);
            }
        }
    }, 600000); // timeout to 600s
*/


});
