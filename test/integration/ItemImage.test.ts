import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';

import { TestDataService } from '../../src/api/services/TestDataService';
import { ItemImageService } from '../../src/api/services/ItemImageService';
import { MarketService } from '../../src/api/services/MarketService';
import { ListingItemService } from '../../src/api/services/ListingItemService';
import { ItemInformationService } from '../../src/api/services/ItemInformationService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { ItemImage } from '../../src/api/models/ItemImage';
import { ListingItem } from '../../src/api/models/ListingItem';

import { ImageDataProtocolType } from '../../src/api/enums/ImageDataProtocolType';

import { ItemImageCreateRequest } from '../../src/api/requests/ItemImageCreateRequest';
import { ItemImageUpdateRequest } from '../../src/api/requests/ItemImageUpdateRequest';

import { ImageProcessing, MEDIUM_IMAGE_SIZE, THUMBNAIL_IMAGE_SIZE } from '../../src/core/helpers/ImageProcessing';
import { ImageTriplet } from '../../src/core/helpers/ImageTriplet';

import sharp = require('sharp');
import piexif = require('piexifjs');
import { TestDataGenerateRequest } from '../../src/api/requests/TestDataGenerateRequest';
import { GenerateListingItemParams } from '../../src/api/requests/params/GenerateListingItemParams';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { ObjectHash } from '../../src/core/helpers/ObjectHash';
import { ItemImageDataService } from '../../src/api/services/ItemImageDataService';

describe('ItemImage', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let itemImageService: ItemImageService;
    let itemImageDataService: ItemImageDataService;
    let listingItemService: ListingItemService;

    let createdImageId;
    let createdListingItem;

    const testData = {
        // item_information_id
        // hash
        data: [{
            dataId: null,
            protocol: ImageDataProtocolType.LOCAL,
            imageVersion: 'ORIGINAL',
            encoding: 'BASE64',
            data: ImageProcessing.milkcatTall
        }]
    } as ItemImageCreateRequest;

    const testDataUpdated = {
        // item_information_id,
        // hash,
        data: [{
            dataId: null,
            protocol: ImageDataProtocolType.LOCAL,
            imageVersion: 'ORIGINAL',
            encoding: 'BASE64',
            data: ImageProcessing.milkcat
        }]
    } as ItemImageUpdateRequest;


    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        itemImageService = app.IoC.getNamed<ItemImageService>(Types.Service, Targets.Service.ItemImageService);
        itemImageDataService = app.IoC.getNamed<ItemImageDataService>(Types.Service, Targets.Service.ItemImageDataService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.ListingItemService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        const generateParams = new GenerateListingItemParams([
            true,   // generateItemInformation
            true,   // generateShippingDestinations
            false,  // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            true    // generateListingItemObjects
        ]).toParamsArray();

        // create listingitem without images and store its id for testing
        const listingItems = await testDataService.generate({
            model: CreatableModel.LISTINGITEM,  // what to generate
            amount: 1,                          // how many to generate
            withRelated: true,                  // return model
            generateParams                      // what kind of data to generate
        } as TestDataGenerateRequest);
        createdListingItem = listingItems[0].toJSON();

    });

    afterAll(async () => {
        //
    });

    test('Should throw ValidationException because there is no item_information_id', async () => {
        expect.assertions(1);

        await itemImageService.create(testData as ItemImageCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new item image', async () => {

        // add the required data to testData
        testData.item_information_id = createdListingItem.ItemInformation.id;
        testData.hash = ObjectHash.getHash(testData);

        // create
        const itemImageModel: ItemImage = await itemImageService.create(testData);
        createdImageId = itemImageModel.Id;
        const result = itemImageModel.toJSON();

        const imageUrl = process.env.APP_HOST
        + (process.env.APP_PORT ? ':' + process.env.APP_PORT : '')
        + '/api/item-images/' + createdImageId + '/' + testData.data[0].imageVersion;

        expect(result.hash).toBe(testData.hash);
        expect(result.ItemImageDatas[0].dataId).toBe(imageUrl);
        expect(result.ItemImageDatas[0].protocol).toBe(testData.data[0].protocol);
        expect(result.ItemImageDatas[0].imageVersion).toBe(testData.data[0].imageVersion);
        expect(result.ItemImageDatas[0].encoding).toBe(testData.data[0].encoding);
        expect(result.ItemImageDatas.length).toBe(4);

        // TODO: When non-BASE64 resizing is implemented check image sizes.
    });

    test('Should throw ValidationException because we want to create a empty item image', async () => {
        expect.assertions(1);
        await itemImageService.create({} as ItemImageCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list item images with our new create one', async () => {
        const itemImageCollection = await itemImageService.findAll();
        const itemImage = itemImageCollection.toJSON();
        expect(itemImage.length).toBe(1);
        const result = itemImage[0];
        expect(result.hash).toBe(testData.hash);
        expect(result.ItemImageDatas).toBe(undefined); // doesnt fetch related
    });

    test('Should return one item image', async () => {
        const itemImageModel: ItemImage = await itemImageService.findOne(createdImageId);
        const result = itemImageModel.toJSON();

        const imageUrl = process.env.APP_HOST
            + (process.env.APP_PORT ? ':' + process.env.APP_PORT : '')
            + '/api/item-images/' + createdImageId + '/' + testData.data[0].imageVersion;

        expect(result.hash).toBe(testData.hash);
        expect(result.ItemImageDatas[0].dataId).toBe(imageUrl);
        expect(result.ItemImageDatas[0].protocol).toBe(testData.data[0].protocol);
        expect(result.ItemImageDatas[0].imageVersion).toBe(testData.data[0].imageVersion);
        expect(result.ItemImageDatas[0].encoding).toBe(testData.data[0].encoding);

        // TODO: When non-BASE64 resizing is implemented check image sizes.
    });

    test('Should throw ValidationException because there is no item_information_id', async () => {
        expect.assertions(1);
        await itemImageService.update(createdImageId, testDataUpdated as ItemImageUpdateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should update the ItemImage', async () => {
        testDataUpdated.item_information_id = createdListingItem.ItemInformation.id;
        testDataUpdated.hash = ObjectHash.getHash(testData);

        const itemImageModel: ItemImage = await itemImageService.update(createdImageId, testDataUpdated);
        const result = itemImageModel.toJSON();

        const imageUrl = process.env.APP_HOST
            + (process.env.APP_PORT ? ':' + process.env.APP_PORT : '')
            + '/api/item-images/' + createdImageId + '/' + testData.data[0].imageVersion;

        expect(result.hash).toBe(testDataUpdated.hash);
        expect(result.ItemImageDatas[0].dataId).toBe(imageUrl);
        expect(result.ItemImageDatas[0].protocol).toBe(testData.data[0].protocol);
        expect(result.ItemImageDatas[0].imageVersion).toBe(testData.data[0].imageVersion);
        expect(result.ItemImageDatas[0].encoding).toBe(testData.data[0].encoding);

        expect(result.ItemImageDatas.length).toBe(4);

        // TODO: check images sizes

        /* if (!testDataUpdated.data && testDataUpdated.data != null) {
            expect(result.ItemImageData.dataBig).toBeUndefined();
            expect(result.ItemImageData.dataMedium).toBeUndefined();
            expect(result.ItemImageData.dataThumbnail).toBeUndefined();
        } else {
            // TODO: If image is in test data check size and validity of processed image
            expect(result.ItemImageData.dataBig).toBeDefined();
            expect(result.ItemImageData.dataMedium).toBeDefined();
            if (result.ItemImageData.dataMedium !== null) {
                const dataBuffer = Buffer.from(result.ItemImageData.dataMedium, 'base64');
                const imageBuffer = sharp(dataBuffer);

                const newInfo = await imageBuffer.metadata();

                expect(newInfo.height).toBeLessThanOrEqual(MEDIUM_IMAGE_SIZE.height);
                expect(newInfo.width).toBeLessThanOrEqual(MEDIUM_IMAGE_SIZE.width);
            }
            expect(result.ItemImageData.dataMedium).toBeDefined();
            if (result.ItemImageData.dataMedium !== null) {
                const dataBuffer = Buffer.from(result.ItemImageData.dataThumbnail, 'base64');
                const imageBuffer = sharp(dataBuffer);

                const newInfo = await imageBuffer.metadata();

                expect(newInfo.height).toBeLessThanOrEqual(THUMBNAIL_IMAGE_SIZE.height);
                expect(newInfo.width).toBeLessThanOrEqual(THUMBNAIL_IMAGE_SIZE.width);
            }
        } */
    });

    test('Should delete the item image', async () => {
        expect.assertions(7);

        // find the listing item
        const listingItemModel = await listingItemService.findOne(createdListingItem.id);
        createdListingItem = listingItemModel.toJSON();
        expect(createdListingItem.ItemInformation.ItemImages.length).toBe(1);

        // destroy the create image
        createdImageId = createdListingItem.ItemInformation.ItemImages[0].id;
        await itemImageService.destroy(createdImageId);

        // make sure the image is destroyed
        await itemImageService.findOne(createdImageId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdImageId))
        );

        // make sure that the related imagedatas were also destroyed
        for (const imageData of createdListingItem.ItemInformation.ItemImages[0].ItemImageDatas) {
            await itemImageDataService.findOne(imageData.id).catch(e =>
                expect(e).toEqual(new NotFoundException(imageData.id))
            );
        }

        // destroy the created item
        await listingItemService.destroy(createdListingItem.id);

        // make sure the created item was destroyed
        await listingItemService.findOne(createdListingItem.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdListingItem.id))
        );

    });
});
