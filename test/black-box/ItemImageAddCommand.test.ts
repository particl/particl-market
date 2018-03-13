import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { ListingItemTemplateCreateRequest } from '../../src/api/requests/ListingItemTemplateCreateRequest';
import { PaymentType } from '../../src/api/enums/PaymentType';
import { ObjectHash } from '../../src/core/helpers/ObjectHash';
import { ImageDataProtocolType } from '../../src/api/enums/ImageDataProtocolType';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { Commands } from '../../src/api/commands/CommandEnumType';
import { ImageProcessing } from '../../src/core/helpers/ImageProcessing';
import { ImageVersions } from '../../src/core/helpers/ImageVersionEnumType';
import {ItemImageDataUpdateRequest} from '../../src/api/requests/ItemImageDataUpdateRequest';
import * as sharp from 'sharp';

describe('ItemImageAddCommand', () => {
    const testUtil = new BlackBoxTestUtil();

    const method = Commands.ITEMIMAGE_ROOT.commandName;
    const subCommand = Commands.ITEMIMAGE_ADD.commandName;

    const keys = [
        'id', 'hash', 'updatedAt', 'createdAt'
    ];

    const testDataListingItemTemplate = {
        profile_id: 0,
        hash: '',
        itemInformation: {

        },
        paymentInformation: {
            type: PaymentType.SALE
        }
    } as ListingItemTemplateCreateRequest;

    const pageNumber = 1;
    let createdTemplateId;
    let createdItemInfoId;
    let itemTemplateWithItemInfo;
    let itemImages = [];

    beforeAll(async () => {
        await testUtil.cleanDb();
        // profile
        const defaultProfile = await testUtil.getDefaultProfile();
        testDataListingItemTemplate.profile_id = defaultProfile.id;

        // set hash
        testDataListingItemTemplate.hash = await ObjectHash.getHash(testDataListingItemTemplate);

        // create item template
        const addListingItemTempRes: any = await testUtil.addData(CreatableModel.LISTINGITEMTEMPLATE, testDataListingItemTemplate);

        createdTemplateId = addListingItemTempRes.id;
        createdItemInfoId = addListingItemTempRes.ItemInformation.id;


        // set itemInformation
        testDataListingItemTemplate.itemInformation = {
           title: 'item title1',
           shortDescription: 'item short desc1',
           longDescription: 'item long desc1',
           itemCategory: {
                key: 'cat_high_luxyry_items'
           }
        };

        // set hash
        testDataListingItemTemplate.hash = ObjectHash.getHash(testDataListingItemTemplate);

        // create item template
        const listingItemTempWithItemInfoRes: any = await testUtil.addData(CreatableModel.LISTINGITEMTEMPLATE, testDataListingItemTemplate);
        itemTemplateWithItemInfo = listingItemTempWithItemInfoRes;
        createdItemInfoId = itemTemplateWithItemInfo.ItemInformation.id;
    });

    test('Should fail to add item image because without listingItemTemplate id', async () => {
        // add item image
        const addDataRes: any = await rpc(method, [subCommand]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(404);
        expect(addDataRes.error.error.success).toBe(false);
        expect(addDataRes.error.error.message).toBe('ListingItemTemplate id can not be null.');
    });

    test('Should fail to add item image because given item template does not have item information', async () => {
        // add item image
        const addDataRes: any = await rpc(method, [subCommand, createdTemplateId]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(400);
        expect(addDataRes.error.error.success).toBe(false);
        expect(addDataRes.error.error.message).toBe('Request body is not valid');
    });

    test('Should fail to add item image for Item information with blank ItemImageData', async () => {
        // add item image
        const addDataRes: any = await rpc(method, [subCommand, itemTemplateWithItemInfo.id]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(404);
    });

    // TODO: why does this return 400
    test('Should failed to add item image because invalid ItemImageData protocol', async () => {
        const addDataRes: any = await rpc(method,
            [subCommand, itemTemplateWithItemInfo.id, 'TEST-DATA-ID', 'INVALID_PROTOCOL', 'BASE64', ImageProcessing.milkcat]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(400);
        expect(addDataRes.error.error.message).toBe('Request body is not valid');
    });

    test('Should add item image with ItemImageData', async () => {
        // add item image
        const addDataRes: any = await rpc(method, [
            subCommand,
            itemTemplateWithItemInfo.id,
            'TEST-DATA-ID',
            ImageDataProtocolType.LOCAL,
            'BASE64',
            ImageProcessing.milkcatWide
        ]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(200);
        addDataRes.expectDataRpc(keys);
        const result: any = addDataRes.getBody()['result'];
        expect(result.itemInformationId).toBe(createdItemInfoId);

        itemImages = result.ItemImageDatas;
    });

    test('Should return valid LARGE image dimention', async () => {
        for ( const imageData of itemImages ) {
            expect(imageData.dataId).toBe('TEST-DATA-ID');
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
                const imageBuffer = sharp(dataBuffer);

                const dataBufferOriginal = Buffer.from(rawImage, 'base64');
                const imageBufferOriginal = sharp(dataBufferOriginal);
                const newInfo = await imageBuffer.metadata();
                const originalInfo = await imageBufferOriginal.metadata();

                expect(newInfo.width).toBe(ImageVersions.LARGE.imageWidth);
                expect(newInfo.height).toBe(ImageVersions.LARGE.imageHeight);
            }

        }
    });

    test('Should return valid MEDIUM image dimention', async () => {
        for ( const imageData of itemImages ) {
            expect(imageData.dataId).toBe('TEST-DATA-ID');
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
                const imageBuffer = sharp(dataBuffer);
                const newInfo = await imageBuffer.metadata();

                expect(newInfo.width).toBe(ImageVersions.MEDIUM.imageWidth);
                expect(newInfo.height).toBeLessThanOrEqual(ImageVersions.MEDIUM.imageHeight);
            }

        }
    });

    test('Should return valid THUMBNAIL image dimention', async () => {
        for ( const imageData of itemImages ) {
            expect(imageData.dataId).toBe('TEST-DATA-ID');
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
                const imageBuffer = sharp(dataBuffer);
                const newInfo = await imageBuffer.metadata();

                expect(newInfo.width).toBe(ImageVersions.THUMBNAIL.imageWidth);
                expect(newInfo.height).toBeLessThanOrEqual(ImageVersions.THUMBNAIL.imageHeight);
            }

        }
    });
});



