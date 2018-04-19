import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { ListingItemTemplateCreateRequest } from '../../src/api/requests/ListingItemTemplateCreateRequest';
import { PaymentType } from '../../src/api/enums/PaymentType';
import { ImageDataProtocolType } from '../../src/api/enums/ImageDataProtocolType';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { Commands } from '../../src/api/commands/CommandEnumType';
import { ImageProcessing } from '../../src/core/helpers/ImageProcessing';
import { ImageVersions } from '../../src/core/helpers/ImageVersionEnumType';
import {ItemImageDataUpdateRequest} from '../../src/api/requests/ItemImageDataUpdateRequest';
import * as Jimp from 'jimp';
import {GenerateListingItemTemplateParams} from '../../src/api/requests/params/GenerateListingItemTemplateParams';
import {ListingItemTemplate} from '../../src/api/models/ListingItemTemplate';

describe('ItemImageAddCommand', () => {
    const testUtil = new BlackBoxTestUtil();

    const imageCommand = Commands.ITEMIMAGE_ROOT.commandName;
    const addCommand = Commands.ITEMIMAGE_ADD.commandName;

    let createdImage;

    const keys = [
        'id', 'hash', 'updatedAt', 'createdAt'
    ];
/*
    const testDataListingItemTemplate = {
        profile_id: 0,
        hash: '',
        itemInformation: {

        },
        paymentInformation: {
            type: PaymentType.SALE
        }
    } as ListingItemTemplateCreateRequest;
*/
    const pageNumber = 1;
    let createdListingItemTemplateWithoutItemInformation;
    let createdListingItemTemplate;
    let itemImages = [];

    beforeAll(async () => {
        await testUtil.cleanDb();
        // profile
        const defaultProfile = await testUtil.getDefaultProfile();

        let generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            false,   // generateItemInformation
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
        const result: any = await rpc(imageCommand, [addCommand]);
        result.expectJson();
        result.expectStatusCode(404);
        expect(result.error.error.success).toBe(false);
        expect(result.error.error.message).toBe('ListingItemTemplate id can not be null.');
    });

    test('Should fail to add ItemImage because given ListingItemTemplate does not have ItemInformation', async () => {
        // add item image
        const addDataRes: any = await rpc(imageCommand, [addCommand, createdListingItemTemplateWithoutItemInformation.id]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(400);
        expect(addDataRes.error.error.success).toBe(false);
        expect(addDataRes.error.error.message).toBe('Request body is not valid');
    });

    test('Should fail to add ItemImage without ItemImageData', async () => {
        // add item image
        const addDataRes: any = await rpc(imageCommand, [addCommand, createdListingItemTemplate.id]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(404);
    });

    test('Should fail to add ItemImage because invalid ItemImageData protocol', async () => {
        const addDataRes: any = await rpc(imageCommand,
            [addCommand, createdListingItemTemplate.id, 'TEST-DATA-ID', 'INVALID_PROTOCOL', 'BASE64', ImageProcessing.milkcat]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(404);
        expect(addDataRes.error.error.message).toBe('Invalid image protocol.');
    });

    test('Should add ItemImage with ItemImageData', async () => {
        // add item image
        const addDataRes: any = await rpc(imageCommand, [
            addCommand,
            createdListingItemTemplate.id,
            'TEST-DATA-ID',
            ImageDataProtocolType.LOCAL,
            'BASE64',
            ImageProcessing.milkcatWide
        ]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(200);
        addDataRes.expectDataRpc(keys);
        const result: any = addDataRes.getBody()['result'];
        createdImage = result;
        itemImages = result.ItemImageDatas;
        // TODO: this test is just testing that the command response is 200, its not verifying that the itemimage was actually inserted

    });

    test('Should return valid LARGE image dimention', async () => {
        for ( const imageData of itemImages ) {
            const imageUrl = process.env.APP_HOST
                + (process.env.APP_PORT ? ':' + process.env.APP_PORT : '')
                + '/api/item-images/' + createdImage.id + '/' + imageData.imageVersion;
            expect(imageData.dataId).toBe(imageUrl);
            expect(imageData.protocol).toBe(ImageDataProtocolType.LOCAL);
            expect(imageData.encoding).toBe('BASE64');

            if ( imageData.imageVersion === ImageVersions.ORIGINAL.propName ) {

                const rawImage = imageData.data;

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

    test('Should return valid MEDIUM image dimention', async () => {
        for ( const imageData of itemImages ) {
            const imageUrl = process.env.APP_HOST
                + (process.env.APP_PORT ? ':' + process.env.APP_PORT : '')
                + '/api/item-images/' + createdImage.id + '/' + imageData.imageVersion;
            expect(imageData.dataId).toBe(imageUrl);
            expect(imageData.protocol).toBe(ImageDataProtocolType.LOCAL);
            expect(imageData.encoding).toBe('BASE64');

            if ( imageData.imageVersion === ImageVersions.ORIGINAL.propName ) {

                const rawImage = imageData.data;

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

    test('Should return valid THUMBNAIL image dimention', async () => {
        for ( const imageData of itemImages ) {
            const imageUrl = process.env.APP_HOST
                + (process.env.APP_PORT ? ':' + process.env.APP_PORT : '')
                + '/api/item-images/' + createdImage.id + '/' + imageData.imageVersion;
            expect(imageData.dataId).toBe(imageUrl);
            expect(imageData.protocol).toBe(ImageDataProtocolType.LOCAL);
            expect(imageData.encoding).toBe('BASE64');

            if ( imageData.imageVersion === ImageVersions.ORIGINAL.propName ) {

                const rawImage = imageData.data;

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


