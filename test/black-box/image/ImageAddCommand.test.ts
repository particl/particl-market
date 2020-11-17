// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * from 'jest';
import * as jpeg from 'jpeg-js';
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
import { ImageVersions } from '../../../src/core/helpers/ImageVersionEnumType';


describe('ImageAddCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const imageCommand = Commands.IMAGE_ROOT.commandName;
    const imageAddCommand = Commands.IMAGE_ADD.commandName;
    const imageListCommand = Commands.IMAGE_LIST.commandName;

    let profile: resources.Profile;
    let market: resources.Market;

    let listingItemTemplate: resources.ListingItemTemplate;
    let image: resources.Image;


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
        expect(res.error.error.message).toBe(new MissingParamException('template|market').getMessage());
    });


    test('Should fail because missing id', async () => {
        const res: any = await testUtil.rpc(imageCommand, [imageAddCommand,
            'template'
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('id').getMessage());
    });

/*
    ProtocolDSN.REQUEST set as default for now...
    test('Should fail because missing protocol', async () => {
        const res: any = await testUtil.rpc(imageCommand, [imageAddCommand,
            'template',
            listingItemTemplate.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('protocol').getMessage());
    });
*/

    test('Should fail because missing data', async () => {
        const res: any = await testUtil.rpc(imageCommand, [imageAddCommand,
            'template',
            listingItemTemplate.id,
            ProtocolDSN.REQUEST
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('data').getMessage());
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


    test('Should fail because invalid featured', async () => {
        const res: any = await testUtil.rpc(imageCommand, [imageAddCommand,
            'template',
            listingItemTemplate.id,
            ProtocolDSN.REQUEST,
            ImageProcessing.milkcatSmall,
            'INVALID'
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('featured', 'boolean').getMessage());
    });


    test('Should fail because invalid skipResize', async () => {
        const res: any = await testUtil.rpc(imageCommand, [imageAddCommand,
            'template',
            listingItemTemplate.id,
            ProtocolDSN.REQUEST,
            ImageProcessing.milkcatSmall,
            false,
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
            false,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.Image = res.getBody()['result'];
        image = result;

        // log.debug('image: ', JSON.stringify(image, null, 2));
        expect(image.ImageDatas.length).toBe(4);

        for ( const imageData of image.ImageDatas ) {
            expect(imageData.protocol).toBe(ProtocolDSN.FILE);
            expect(imageData.encoding).toBe('BASE64');
        }

    });


    test('Should fail because ListingItemTemplate is not modifiable (has published ListingItem)', async () => {
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
            true,               // generateListingItem
            market.id           // soldOnMarketId

        ]).toParamsArray();

        const listingItemTemplates: resources.ListingItemTemplate[] = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE,
            2,
            true,
            generateListingItemTemplateParams
        );
        listingItemTemplate = listingItemTemplates[0];

        const res = await testUtil.rpc(imageCommand, [imageAddCommand,
            'template',
            listingItemTemplate.id,
            ProtocolDSN.REQUEST,
            ImageProcessing.milkcatSmall,
            false,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new ModelNotModifiableException('ListingItemTemplate').getMessage());
    });


    test('Should add a larger (than free msg size limit) Image to Market', async () => {

        const randomImage = await generateRandomImage(1200, 800);
        log.debug('randomImage.length: ', randomImage.length);

        const res: any = await testUtil.rpc(imageCommand, [imageAddCommand,
            'market',
            market.id,
            ProtocolDSN.REQUEST,
            randomImage,
            false,      // featured
            false       // skipResize
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.Image = res.getBody()['result'];

        market = await testUtil.getDefaultMarket(profile.id);

        expect(result).toBeDefined();
        expect(result.id).toBe(market.Image.id);
    });


    test('Should have resized the Image', async () => {
        const res: any = await testUtil.rpc(imageCommand, [imageListCommand,
            'market',
            market.id,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Image[] = res.getBody()['result'];

        expect(result.length).toBe(1);
        const original: resources.ImageData = _.find(result[0].ImageDatas, value => {
            return value.imageVersion === ImageVersions.ORIGINAL.propName;
        });
        const resized: resources.ImageData = _.find(result[0].ImageDatas, value => {
            return value.imageVersion === ImageVersions.RESIZED.propName;
        });

        expect(result[0].ImageDatas.length).toBe(5);
        expect(result[0].ImageDatas[0].data.length).toBeGreaterThan(0);
        expect(original.data.length).toBeGreaterThan(resized.data.length);

        log.debug('resized randomImage.length: ', resized.data.length);

    });

    test('Should add Image to Market', async () => {
        const res: any = await testUtil.rpc(imageCommand, [imageAddCommand,
            'market',
            market.id,
            ProtocolDSN.REQUEST,
            ImageProcessing.milkcatSmall,
            false,      // featured
            true        // skipResize
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.Image = res.getBody()['result'];

        market = await testUtil.getDefaultMarket(profile.id);

        expect(market.id).toBeDefined();
        expect(result).toBeDefined();
        expect(result.id).toBe(market.Image.id);
    });


    test('Should not have resized the Image', async () => {
        const res: any = await testUtil.rpc(imageCommand, [imageListCommand,
            'market',
            market.id,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Image[] = res.getBody()['result'];
        expect(result.length).toBe(1);
        const original: resources.ImageData = _.find(result[0].ImageDatas, value => {
            return value.imageVersion === ImageVersions.ORIGINAL.propName;
        });
        const resized: resources.ImageData = _.find(result[0].ImageDatas, value => {
            return value.imageVersion === ImageVersions.RESIZED.propName;
        });

        expect(result[0].ImageDatas.length).toBe(4);
        expect(result[0].ImageDatas[0].data.length).toBeGreaterThan(0);
    });


    /**
     * Generates an random colored image with specified width, height and quality
     * @param width width of the image
     * @param height height of the image
     * @param quality quality of the image
     */
    const generateRandomImage = async (width: number = 800, height: number = 600, quality: number = 50): Promise<string> => {
        const frameData = Buffer.alloc(width * height * 4);
        let i = 0;
        while (i < frameData.length) {
            frameData[i++] = Math.floor(Math.random() * 256);
        }
        const rawImageData = {
            data: frameData,
            width,
            height
        };
        const generatedImage: jpeg.RawImageData<Buffer> = jpeg.encode(rawImageData, quality);
        return generatedImage.data.toString('base64');
    };

});
