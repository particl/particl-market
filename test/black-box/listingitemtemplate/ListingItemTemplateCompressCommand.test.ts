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
import {ProtocolDSN} from 'omp-lib/dist/interfaces/dsn';


describe('ListingItemTemplateCompressCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const templateCommand = Commands.TEMPLATE_ROOT.commandName;
    const templateCompressCommand = Commands.TEMPLATE_COMPRESS.commandName;

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

        // log.debug('listingItemTemplate: ', JSON.stringify(listingItemTemplate, null, 2));
        for (const image of listingItemTemplate.ItemInformation.Images) {
            expect(image.ImageDatas).toHaveLength(4);
        }

    });


    test('Should fail because missing listingItemTemplateId', async () => {
        const res = await testUtil.rpc(templateCommand, [templateCompressCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('listingItemTemplateId').getMessage());
    });

    test('Should fail because invalid listingItemTemplateId', async () => {
        const res = await testUtil.rpc(templateCommand, [templateCompressCommand,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('listingItemTemplateId', 'number').getMessage());
    });

    test('Should fail because invalid messageVersionToFit', async () => {
        const res = await testUtil.rpc(templateCommand, [templateCompressCommand,
            listingItemTemplate.ItemInformation.Images[0].id,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('messageVersionToFit', 'string').getMessage());
    });

    test('Should fail because invalid scalingFraction', async () => {
        const res = await testUtil.rpc(templateCommand, [templateCompressCommand,
            listingItemTemplate.ItemInformation.Images[0].id,
            CoreMessageVersion.FREE,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('scalingFraction', 'number').getMessage());
    });

    test('Should fail because invalid qualityFraction', async () => {
        const res = await testUtil.rpc(templateCommand, [templateCompressCommand,
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
        const res = await testUtil.rpc(templateCommand, [templateCompressCommand,
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

    test('Should compress Images to fit given message size', async () => {
        const res = await testUtil.rpc(templateCommand, [templateCompressCommand,
            listingItemTemplate.id,
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

});
