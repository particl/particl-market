// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { ImageDataProtocolType } from '../../../src/api/enums/ImageDataProtocolType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { ImageProcessing } from '../../../src/core/helpers/ImageProcessing';
import { ImageVersions } from '../../../src/core/helpers/ImageVersionEnumType';
import * as Jimp from 'jimp';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/params/GenerateListingItemTemplateParams';
import { ListingItemTemplate } from '../../../src/api/models/ListingItemTemplate';
import {Logger as LoggerType} from '../../../src/core/Logger';
import * as resources from 'resources';

describe('ItemImageAddCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const itemImageCommand = Commands.ITEMIMAGE_ROOT.commandName;
    const itemImageAddCommand = Commands.ITEMIMAGE_ADD.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;
    let createdImage: resources.Image;

    const keys = [
        'id', 'hash', 'updatedAt', 'createdAt'
    ];

    let createdListingItemTemplateWithoutItemInformation: resources.ListingItemTemplate;
    let createdListingItemTemplate: resources.ListingItemTemplate;
    let itemImages: resources.ItemImageData[];

    beforeAll(async () => {
        await testUtil.cleanDb();

        defaultProfile = await testUtil.getDefaultProfile();
        defaultMarket = await testUtil.getDefaultMarket();

        let generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            false,   // generateItemInformation
            true,   // generateItemLocation
            false,   // generateShippingDestinations
            false,   // generateItemImages
            false,   // generatePaymentInformation
            false,   // generateEscrow
            false,   // generateItemPrice
            false,   // generateMessagingInformation
            false    // generateListingItemObjects
        ]).toParamsArray();

        let listingItemTemplate = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as ListingItemTemplate[];
        createdListingItemTemplateWithoutItemInformation = listingItemTemplate[0];

        generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            false,   // generateShippingDestinations
            true,   // generateItemImages
            false,   // generatePaymentInformation
            false,   // generateEscrow
            false,   // generateItemPrice
            false,   // generateMessagingInformation
            false    // generateListingItemObjects
        ]).toParamsArray();

        listingItemTemplate = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as ListingItemTemplate[];
        createdListingItemTemplate = listingItemTemplate[0];
    });

    test('Should fail to add ItemImage because missing ListingItemTemplate.Id', async () => {
        const res: any = await testUtil.rpc(itemImageCommand, [itemImageAddCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('ListingItemTemplate id can not be null.');
    });

    test('Should fail to add ItemImage because given ListingItemTemplate does not have ItemInformation', async () => {
        // add item image
        const res: any = await testUtil.rpc(itemImageCommand, [itemImageAddCommand, createdListingItemTemplateWithoutItemInformation.id]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Request body is not valid');
    });

    test('Should fail to add ItemImage without ItemImageData', async () => {
        // add item image
        const res: any = await testUtil.rpc(itemImageCommand, [itemImageAddCommand, createdListingItemTemplate.id]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Invalid image protocol.');
    });

    test('Should fail to add ItemImage because invalid ItemImageData protocol', async () => {
        const res: any = await testUtil.rpc(itemImageCommand,
            [itemImageAddCommand, createdListingItemTemplate.id, 'TEST-DATA-ID', 'INVALID_PROTOCOL', 'BASE64', ImageProcessing.milkcat]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Invalid image protocol.');
    });

    test('Should add ItemImage with ItemImageData', async () => {
        // add item image
        const res: any = await testUtil.rpc(itemImageCommand, [
            itemImageAddCommand,
            createdListingItemTemplate.id,
            'TEST-DATA-ID',
            ImageDataProtocolType.LOCAL,
            'BASE64',
            ImageProcessing.milkcatWide
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        res.expectDataRpc(keys);
        const result: any = res.getBody()['result'];
        createdImage = result;
        itemImages = result.ItemImageDatas;
        // TODO: this test is just testing that the command response is 200, its not verifying that the itemimage was actually inserted

    });

    test('Should return valid LARGE image dimension', async () => {
        for ( const imageData of itemImages ) {
            const imageUrl = // process.env.APP_HOST
                // + (process.env.APP_PORT ? ':' + process.env.APP_PORT : '')
                + 'http://localhost:3000'
                + '/api/item-images/' + createdImage.id + '/' + imageData.imageVersion;
            expect(imageData.dataId).toBe(imageUrl);
            expect(imageData.protocol).toBe(ImageDataProtocolType.LOCAL);
            expect(imageData.encoding).toBe('BASE64');

            if ( imageData.imageVersion === ImageVersions.ORIGINAL.propName ) {

                const rawImage = imageData.ItemImageDataContent.data;
                expect(typeof rawImage).toBe('string');

                const toVersions = [ImageVersions.LARGE, ImageVersions.MEDIUM, ImageVersions.THUMBNAIL];
                const originalData: string = await ImageProcessing.convertToJPEG(rawImage);
                const resizedDatas: Map<string, string> = await ImageProcessing.resizeImageData(originalData, toVersions);

                // large
                const largeData = resizedDatas.get(ImageVersions.LARGE.propName) || '';
                expect(largeData).not.toEqual(null);
                expect(largeData).not.toEqual('');

                const dataBuffer = Buffer.from(largeData, 'base64');
                const imageBuffer = await Jimp.read(dataBuffer);

                expect(imageBuffer.bitmap.width).toBe(ImageVersions.LARGE.imageWidth);
                expect(imageBuffer.bitmap.height).toBe(ImageVersions.LARGE.imageHeight);
            }

        }
    });

    test('Should return valid MEDIUM image dimension', async () => {
        for ( const imageData of itemImages ) {
            const imageUrl = // process.env.APP_HOST
                // + (process.env.APP_PORT ? ':' + process.env.APP_PORT : '')
                + 'http://localhost:3000'
                + '/api/item-images/' + createdImage.id + '/' + imageData.imageVersion;
            expect(imageData.dataId).toBe(imageUrl);
            expect(imageData.protocol).toBe(ImageDataProtocolType.LOCAL);
            expect(imageData.encoding).toBe('BASE64');

            if ( imageData.imageVersion === ImageVersions.ORIGINAL.propName ) {

                const rawImage = imageData.ItemImageDataContent.data;

                const toVersions = [ImageVersions.LARGE, ImageVersions.MEDIUM, ImageVersions.THUMBNAIL];
                const originalData: string = await ImageProcessing.convertToJPEG(rawImage);
                const resizedDatas: Map<string, string> = await ImageProcessing.resizeImageData(originalData, toVersions);

                // medium
                const mediumData = resizedDatas.get(ImageVersions.MEDIUM.propName) || '';
                expect(mediumData).not.toEqual(null);
                expect(mediumData).not.toEqual('');

                const dataBuffer = Buffer.from(mediumData, 'base64');
                const imageBuffer = await Jimp.read(dataBuffer);

                expect(imageBuffer.bitmap.width).toBe(ImageVersions.MEDIUM.imageWidth);
                expect(imageBuffer.bitmap.height).toBeLessThanOrEqual(ImageVersions.MEDIUM.imageHeight);
            }

        }
    });

    test('Should return valid THUMBNAIL image dimension', async () => {
        for ( const imageData of itemImages ) {
            const imageUrl = // process.env.APP_HOST
                // + (process.env.APP_PORT ? ':' + process.env.APP_PORT : '')
                + 'http://localhost:3000'
                + '/api/item-images/' + createdImage.id + '/' + imageData.imageVersion;
            expect(imageData.dataId).toBe(imageUrl);
            expect(imageData.protocol).toBe(ImageDataProtocolType.LOCAL);
            expect(imageData.encoding).toBe('BASE64');

            if ( imageData.imageVersion === ImageVersions.ORIGINAL.propName ) {

                const rawImage = imageData.ItemImageDataContent.data;

                const toVersions = [ImageVersions.LARGE, ImageVersions.MEDIUM, ImageVersions.THUMBNAIL];
                const originalData: string = await ImageProcessing.convertToJPEG(rawImage);
                const resizedDatas: Map<string, string> = await ImageProcessing.resizeImageData(originalData, toVersions);

                // thumb
                const thumbData = resizedDatas.get(ImageVersions.THUMBNAIL.propName) || '';
                expect(thumbData).not.toEqual(null);
                expect(thumbData).not.toEqual('');

                const dataBuffer = Buffer.from(thumbData, 'base64');
                const imageBuffer = await Jimp.read(dataBuffer);

                expect(imageBuffer.bitmap.width).toBe(ImageVersions.THUMBNAIL.imageWidth);
                expect(imageBuffer.bitmap.height).toBeLessThanOrEqual(ImageVersions.THUMBNAIL.imageHeight);
            }

        }
    });

});


