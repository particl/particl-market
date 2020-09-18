// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { CoreMessageVersion } from '../../../src/api/enums/CoreMessageVersion';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';


describe('ImageCompressCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const imageCommand = Commands.IMAGE_ROOT.commandName;
    const imageCompressCommand = Commands.IMAGE_COMPRESS.commandName;

    let profile: resources.Profile;
    let market: resources.Market;

    let listingItemTemplate: resources.ListingItemTemplate;

    beforeAll(async () => {
        await testUtil.cleanDb();

        profile = await testUtil.getDefaultProfile();
        market = await testUtil.getDefaultMarket(profile.id);

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,               // generateItemInformation
            true,               // generateItemLocation
            true,               // generateShippingDestinations
            true,               // generateImages
            true,               // generatePaymentInformation
            true,               // generateEscrow
            true,               // generateItemPrice
            false,              // generateMessagingInformation
            false,              // generateListingItemObjects
            false,              // generateObjectDatas
            profile.id,         // profileId
            false,              // generateListingItem
            market.id,          // soldOnMarketId,
            undefined,          // categoryId
            true                // largeImages
        ]).toParamsArray();

        const listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE,     // what to generate
            1,                              // how many to generate
            true,                        // return model
            generateListingItemTemplateParams       // what kind of data to generate
        ) as resources.ListingItemTemplate[];

        listingItemTemplate = listingItemTemplates[0];
    });


    test('Should fail because missing imageId', async () => {
        const res = await testUtil.rpc(imageCommand, [imageCompressCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('imageId').getMessage());
    });

    test('Should fail because invalid imageId', async () => {
        const res = await testUtil.rpc(imageCommand, [imageCompressCommand,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('imageId', 'number').getMessage());
    });

    test('Should fail because invalid messageVersionToFit', async () => {
        const res = await testUtil.rpc(imageCommand, [imageCompressCommand,
            listingItemTemplate.ItemInformation.Images[0].id,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('messageVersionToFit', 'string').getMessage());
    });

    test('Should fail because invalid scalingFraction', async () => {
        const res = await testUtil.rpc(imageCommand, [imageCompressCommand,
            listingItemTemplate.ItemInformation.Images[0].id,
            CoreMessageVersion.FREE,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('scalingFraction', 'number').getMessage());
    });

    test('Should fail because invalid qualityFraction', async () => {
        const res = await testUtil.rpc(imageCommand, [imageCompressCommand,
            listingItemTemplate.ItemInformation.Images[0].id,
            CoreMessageVersion.FREE,
            0.9,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('qualityFraction', 'number').getMessage());
    });

    test('Should fail because invalid maxIterations', async () => {
        const res = await testUtil.rpc(imageCommand, [imageCompressCommand,
            listingItemTemplate.ItemInformation.Images[0].id,
            CoreMessageVersion.FREE,
            0.9,
            0.9,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('maxIterations', 'number').getMessage());
    });

    test('Should compress Image to fit given size in bytes', async () => {
        const res = await testUtil.rpc(imageCommand, [imageCompressCommand,
            listingItemTemplate.ItemInformation.Images[0].id,
            CoreMessageVersion.FREE,
            0.9,
            0.8,
            10
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Image = res.getBody()['result'];
        // log.debug('result: ', JSON.stringify(result, null, 2));
        expect(result.ImageDatas).toHaveLength(5);

    });

});
