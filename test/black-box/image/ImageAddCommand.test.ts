// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { ImageProcessing } from '../../../src/core/helpers/ImageProcessing';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { ListingItemTemplate } from '../../../src/api/models/ListingItemTemplate';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { ProtocolDSN } from 'omp-lib/dist/interfaces/dsn';
import { ModelNotModifiableException } from '../../../src/api/exceptions/ModelNotModifiableException';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';

describe('ImageAddCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const imageCommand = Commands.IMAGE_ROOT.commandName;
    const imageAddCommand = Commands.IMAGE_ADD.commandName;

    let profile: resources.Profile;
    let market: resources.Market;
    let image: resources.Image;

    let listingItemTemplate: resources.ListingItemTemplate;
    let images: resources.ImageData[];

    beforeAll(async () => {
        await testUtil.cleanDb();

        profile = await testUtil.getDefaultProfile();
        expect(profile.id).toBeDefined();
        market = await testUtil.getDefaultMarket(profile.id);
        expect(market.id).toBeDefined();

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,               // generateItemInformation
            true,               // generateItemLocation
            true,               // generateShippingDestinations
            false,              // generateImages
            true,               // generatePaymentInformation
            true,               // generateEscrow
            true,               // generateItemPrice
            false,              // generateMessagingInformation
            false,              // generateListingItemObjects
            false,              // generateObjectDatas
            profile.id,         // profileId
            false,              // generateListingItem
            market.id           // soldOnMarketId
        ]).toParamsArray();

        const listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE,     // what to generate
            1,                              // how many to generate
            true,                        // return model
            generateListingItemTemplateParams       // what kind of data to generate
        ) as resources.ListingItemTemplate[];

        listingItemTemplate = listingItemTemplates[0];
    });

    test('Should fail because missing typeSpecifier', async () => {
        const res: any = await testUtil.rpc(imageCommand, [imageAddCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('typeSpecifier').getMessage());
    });


    test('Should fail because missing id', async () => {
        const res: any = await testUtil.rpc(imageCommand, [imageAddCommand,
            'template'
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('id').getMessage());
    });


    test('Should fail because missing protocol', async () => {
        const res: any = await testUtil.rpc(imageCommand, [imageAddCommand,
            'template',
            listingItemTemplate.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('protocol').getMessage());
    });


    test('Should fail because missing data', async () => {
        const res: any = await testUtil.rpc(imageCommand, [imageAddCommand,
            'template',
            listingItemTemplate.id,
            ProtocolDSN.REQUEST
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('protocol').getMessage());
    });


    test('Should fail because invalid typeSpecifier', async () => {
        const res: any = await testUtil.rpc(imageCommand, [imageAddCommand,
            true,
            listingItemTemplate.id,
            ProtocolDSN.REQUEST,
            ImageProcessing.milkcatSmall,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('template|market', 'string').getMessage());
    });


    test('Should fail because invalid id', async () => {
        const res: any = await testUtil.rpc(imageCommand, [imageAddCommand,
            'template',
            true,
            ProtocolDSN.REQUEST,
            ImageProcessing.milkcatSmall,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('id', 'number').getMessage());
    });


    test('Should fail because invalid protocol', async () => {
        const res: any = await testUtil.rpc(imageCommand, [imageAddCommand,
            'template',
            listingItemTemplate.id,
            true,
            ImageProcessing.milkcatSmall,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('protocol', 'string').getMessage());
    });


    test('Should fail because invalid data', async () => {
        const res: any = await testUtil.rpc(imageCommand, [imageAddCommand,
            'template',
            listingItemTemplate.id,
            ProtocolDSN.REQUEST,
            true,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('data', 'string').getMessage());
    });


    test('Should fail because invalid skipResize', async () => {
        const res: any = await testUtil.rpc(imageCommand, [imageAddCommand,
            'template',
            listingItemTemplate.id,
            ProtocolDSN.REQUEST,
            ImageProcessing.milkcatSmall,
            'INVALID'
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('skipResize', 'boolean').getMessage());
    });


    test('Should fail because ListingItemTemplate not found', async () => {
        const res: any = await testUtil.rpc(imageCommand, [imageAddCommand,
            'template',
            0,
            ProtocolDSN.REQUEST,
            ImageProcessing.milkcatSmall,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('ListingItemTemplate').getMessage());
    });


    test('Should add Image to ListingItemTemplate', async () => {
        const res: any = await testUtil.rpc(imageCommand, [imageAddCommand,
            'template',
            listingItemTemplate.id,
            ProtocolDSN.REQUEST,
            ImageProcessing.milkcatSmall,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        image = result;
        images = result.ImageDatas;
        // TODO: this test is just testing that the command response is 200
    });

/*
    test('Should fail because ListingItemTemplate is not modifiable', async () => {
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            true,   // generateShippingDestinations
            false,  // generateImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            false,  // generateListingItemObjects
            false,  // generateObjectDatas
            profile.id, // profileId
            true,  // generateListingItem
            market.id   // marketId
        ]).toParamsArray();

        const listingItemTemplates: resources.ListingItemTemplate[] = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE,
            2,
            true,
            generateListingItemTemplateParams
        );
        listingItemTemplate = listingItemTemplates[0];

        const res = await testUtil.rpc(imageCommand, [imageAddCommand,
            listingItemTemplate.id,
            'TEST-DATA-ID',
            ProtocolDSN.FILE,
            'BASE64',
            ImageProcessing.milkcatWide
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new ModelNotModifiableException('ListingItemTemplate').getMessage());
    });

    // TODO: this is not an api test and should be moved under unit/integration tests
    test('Should return valid versions of image', async () => {

        expect(images.length).toBe(4);

        for ( const imageData of images ) {
            // const imageUrl = process.env.APP_HOST
            //    + (process.env.APP_PORT ? ':' + process.env.APP_PORT : '')
            //    + '/api/item-images/' + image.id + '/' + imageData.imageVersion;
            //  expect(imageData.dataId).toBe(imageUrl);
            expect(imageData.protocol).toBe(ProtocolDSN.FILE);
            expect(imageData.encoding).toBe('BASE64');
        }
    });
*/
});
