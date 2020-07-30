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

describe('ItemImageAddCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const itemImageCommand = Commands.ITEMIMAGE_ROOT.commandName;
    const itemImageAddCommand = Commands.ITEMIMAGE_ADD.commandName;

    let profile: resources.Profile;
    let market: resources.Market;
    let image: resources.Image;

    let listingItemTemplate: resources.ListingItemTemplate;
    let itemImages: resources.ItemImageData[];

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
            false,              // generateItemImages
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

    test('Should fail because missing listingItemTemplateId', async () => {
        const res: any = await testUtil.rpc(itemImageCommand, [itemImageAddCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('listingItemTemplateId').getMessage());
    });


    test('Should fail because missing dataId', async () => {
        const res: any = await testUtil.rpc(itemImageCommand, [itemImageAddCommand,
            listingItemTemplate.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('dataId').getMessage());
    });


    test('Should fail because missing protocol', async () => {
        const res: any = await testUtil.rpc(itemImageCommand, [itemImageAddCommand,
            listingItemTemplate.id,
            'TEST-DATA-ID'
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('protocol').getMessage());
    });


    test('Should fail because missing encoding', async () => {
        const res: any = await testUtil.rpc(itemImageCommand, [itemImageAddCommand,
            listingItemTemplate.id,
            'TEST-DATA-ID',
            ProtocolDSN.LOCAL
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('encoding').getMessage());
    });


    test('Should fail because missing data', async () => {
        const res: any = await testUtil.rpc(itemImageCommand, [itemImageAddCommand,
            listingItemTemplate.id,
            'TEST-DATA-ID',
            ProtocolDSN.LOCAL,
            'BASE64',
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('data').getMessage());
    });


    test('Should fail because invalid listingItemTemplateId', async () => {
        const res: any = await testUtil.rpc(itemImageCommand, [itemImageAddCommand,
            true,
            'TEST-DATA-ID',
            ProtocolDSN.LOCAL,
            'BASE64',
            ImageProcessing.milkcat
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('listingItemTemplateId', 'number').getMessage());
    });


    test('Should fail because invalid dataId', async () => {
        const res: any = await testUtil.rpc(itemImageCommand, [itemImageAddCommand,
            listingItemTemplate.id,
            true,
            ProtocolDSN.LOCAL,
            'BASE64',
            ImageProcessing.milkcat
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('dataId', 'string').getMessage());
    });


    test('Should fail because invalid protocol', async () => {
        const res: any = await testUtil.rpc(itemImageCommand, [itemImageAddCommand,
            listingItemTemplate.id,
            'TEST-DATA-ID',
            true,
            'BASE64',
            ImageProcessing.milkcat
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('protocol', 'string').getMessage());
    });


    test('Should fail because invalid encoding', async () => {
        const res: any = await testUtil.rpc(itemImageCommand, [itemImageAddCommand,
            listingItemTemplate.id,
            'TEST-DATA-ID',
            ProtocolDSN.LOCAL,
            true,
            ImageProcessing.milkcat
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('encoding', 'string').getMessage());
    });


    test('Should fail because invalid data', async () => {
        const res: any = await testUtil.rpc(itemImageCommand, [itemImageAddCommand,
            listingItemTemplate.id,
            'TEST-DATA-ID',
            ProtocolDSN.LOCAL,
            'BASE64',
            true
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('data', 'string').getMessage());
    });


    test('Should fail because invalid protocolDSN', async () => {
        const res: any = await testUtil.rpc(itemImageCommand, [itemImageAddCommand,
            listingItemTemplate.id,
            'TEST-DATA-ID',
            'INVALID',
            'BASE64',
            ImageProcessing.milkcatWide
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('protocol', 'ProtocolDSN').getMessage());
    });


    test('Should fail because ListingItemTemplate not found', async () => {
        const res: any = await testUtil.rpc(itemImageCommand, [itemImageAddCommand,
            0,
            'TEST-DATA-ID',
            ProtocolDSN.LOCAL,
            'BASE64',
            ImageProcessing.milkcatWide
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('ListingItemTemplate').getMessage());
    });


    test('Should add ItemImage with ItemImageData', async () => {
        const res: any = await testUtil.rpc(itemImageCommand, [itemImageAddCommand,
            listingItemTemplate.id,
            'TEST-DATA-ID',
            ProtocolDSN.LOCAL,
            'BASE64',
            ImageProcessing.milkcatWide
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        image = result;
        itemImages = result.ItemImageDatas;
        // TODO: this test is just testing that the command response is 200
    });


    test('Should fail because ListingItemTemplate is not modifiable', async () => {
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            true,   // generateShippingDestinations
            false,  // generateItemImages
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

        const res = await testUtil.rpc(itemImageCommand, [itemImageAddCommand,
            listingItemTemplate.id,
            'TEST-DATA-ID',
            ProtocolDSN.LOCAL,
            'BASE64',
            ImageProcessing.milkcatWide
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new ModelNotModifiableException('ListingItemTemplate').getMessage());
    });

    // TODO: this is not an api test and should be moved under unit/integration tests
    test('Should return valid versions of image', async () => {

        expect(itemImages.length).toBe(4);

        for ( const imageData of itemImages ) {
            const imageUrl = process.env.APP_HOST
                + (process.env.APP_PORT ? ':' + process.env.APP_PORT : '')
                + '/api/item-images/' + image.id + '/' + imageData.imageVersion;
            expect(imageData.dataId).toBe(imageUrl);
            expect(imageData.protocol).toBe(ProtocolDSN.LOCAL);
            expect(imageData.encoding).toBe('BASE64');
        }
    });

});


