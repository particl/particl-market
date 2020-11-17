// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { MessageSize } from '../../../src/api/responses/MessageSize';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { CoreMessageVersion } from '../../../src/api/enums/CoreMessageVersion';
import { ProtocolDSN } from 'omp-lib/dist/interfaces/dsn';


describe('ListingItemTemplateSizeCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const templateCommand = Commands.TEMPLATE_ROOT.commandName;
    const templateSizeCommand = Commands.TEMPLATE_SIZE.commandName;
    const templateGetCommand = Commands.TEMPLATE_GET.commandName;
    const imageCommand = Commands.IMAGE_ROOT.commandName;
    const imageAddCommand = Commands.IMAGE_ADD.commandName;

    let profile: resources.Profile;
    let market: resources.Market;

    let listingItemTemplate: resources.ListingItemTemplate;
    let randomCategory: resources.ItemCategory;

    beforeAll(async () => {
        await testUtil.cleanDb();

        profile = await testUtil.getDefaultProfile();
        market = await testUtil.getDefaultMarket(profile.id);

        randomCategory = await testUtil.getRandomCategory();

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
            profile.id,                     // profileId
            false,                          // generateListingItem
            market.id,                      // soldOnMarketId
            randomCategory.id               // categoryId
        ]).toParamsArray();

        const listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                    // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplate[];
        listingItemTemplate = listingItemTemplates[0];

    });

    test('Should fail to post because missing listingItemTemplateId', async () => {
        const res = await testUtil.rpc(templateCommand, [templateSizeCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('listingItemTemplateId').getMessage());
    });

    test('Should fail to add because invalid listingItemTemplateId', async () => {
        const res = await testUtil.rpc(templateCommand, [templateSizeCommand,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('listingItemTemplateId', 'number').getMessage());
    });

    test('Should return MessageSize for ListingItemTemplate, fits', async () => {
        const res = await testUtil.rpc(templateCommand, [templateSizeCommand,
            listingItemTemplate.id,
            false                   // usePaidImageMessages
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: MessageSize = res.getBody()['result'];
        expect(result.messageVersion).toBe(CoreMessageVersion.PAID);
        expect(result.size).toBeGreaterThan(0);
        expect(result.maxSize).toBe(process.env.SMSG_MAX_MSG_BYTES_PAID);
        expect(result.spaceLeft).toBeGreaterThan(0);
        expect(result.fits).toBe(true);
        expect(result.identifier).toBe(listingItemTemplate.id);
        expect(result.childMessageSizes![0].messageVersion).toBe(CoreMessageVersion.FREE);
        expect(result.childMessageSizes![0].identifier).toBe(listingItemTemplate.ItemInformation.Images[0].id);
    });

    test('Should return MessageSize for ListingItemTemplate, fits, usePaidImageMessages', async () => {
        const res = await testUtil.rpc(templateCommand, [templateSizeCommand,
            listingItemTemplate.id,
            true                    // usePaidImageMessages
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: MessageSize = res.getBody()['result'];
        log.debug('MessageSize: ', JSON.stringify(result, null, 2));
        expect(result.messageVersion).toBe(CoreMessageVersion.PAID);
        expect(result.size).toBeGreaterThan(0);
        expect(result.maxSize).toBe(process.env.SMSG_MAX_MSG_BYTES_PAID);
        expect(result.spaceLeft).toBeGreaterThan(0);
        expect(result.fits).toBe(true);
        expect(result.identifier).toBe(listingItemTemplate.id);
        expect(result.childMessageSizes![0].messageVersion).toBe(CoreMessageVersion.PAID);
        expect(result.childMessageSizes![0].identifier).toBe(listingItemTemplate.ItemInformation.Images[0].id);
    });

    test('Should add a too large Image for PAID msg to the ListingItemTemplate', async () => {

        expect(listingItemTemplate.id).toBeDefined();

        const imageCount = listingItemTemplate.ItemInformation.Images.length;
        const randomImage = await testUtil.generateRandomImage(1000, 800);
        log.debug('randomImage.length: ', randomImage.length);

        let res: any = await testUtil.rpc(imageCommand, [imageAddCommand,
            'template',
            listingItemTemplate.id,
            ProtocolDSN.REQUEST,
            randomImage,
            false,              // featured
            true                // skipResize
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const addImageResult: resources.Image = res.getBody()['result'];

        res = await testUtil.rpc(templateCommand, [templateGetCommand,
            listingItemTemplate.id,
            true        // returnImageData
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        listingItemTemplate = res.getBody()['result'];

        expect(addImageResult.id).toBe(listingItemTemplate.ItemInformation.Images[imageCount].id);
    });


    test('Should return MessageSize for ListingItemTemplate, FREE msg, doesnt fit', async () => {

        const res = await testUtil.rpc(templateCommand, [templateSizeCommand,
            listingItemTemplate.id,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result = res.getBody()['result'];
        log.debug('MessageSize: ', JSON.stringify(result, null, 2));
        expect(result.spaceLeft).toBeGreaterThan(0);
        expect(result.fits).toBe(true);

        const imageCount = listingItemTemplate.ItemInformation.Images.length;
        expect(result.childMessageSizes[imageCount - 1].fits).toBe(false);
        expect(result.childMessageSizes[imageCount - 1].spaceLeft).toBeLessThan(0);
    });

});
