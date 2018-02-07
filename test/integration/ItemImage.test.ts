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
import { ItemInformation } from '../../src/api/models/ItemInformation';

import { ImageDataProtocolType } from '../../src/api/enums/ImageDataProtocolType';

import { ItemImageCreateRequest } from '../../src/api/requests/ItemImageCreateRequest';
import { ItemImageUpdateRequest } from '../../src/api/requests/ItemImageUpdateRequest';
import { TestDataCreateRequest } from '../../src/api/requests/TestDataCreateRequest';

import { ImageProcessing, MEDIUM_IMAGE_SIZE, THUMBNAIL_IMAGE_SIZE } from '../../src/core/helpers/ImageProcessing';
import { ImageTriplet } from '../../src/core/helpers/ImageTriplet';

import sharp = require('sharp');
import piexif = require('piexifjs');

describe('ItemImage', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let itemImageService: ItemImageService;
    let marketService: MarketService;
    let listingItemService: ListingItemService;
    let itemInformationService: ItemInformationService;

    let createdId;
    let itemInformation;
    let createdListingItem;

    const testData = {
        item_information_id: null,
        hash: 'asdfasdfasdfasdf',
        data: {
            dataId: 'QmUwHMFY9GSiKgjqyZpgAv2LhBrh7GV8rtLuagbry9wmMU',
            protocol: ImageDataProtocolType.IPFS,
            encoding: null,
            data: null
        }
    } as ItemImageCreateRequest;

    const testDataUpdated = {
        hash: 'wqerqwerqwerqwerqwer',
        data: {
            dataId: null,
            protocol: ImageDataProtocolType.LOCAL,
            encoding: 'BASE64',
            data: ImageProcessing.milkcat
        }
    } as ItemImageUpdateRequest;


    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        itemImageService = app.IoC.getNamed<ItemImageService>(Types.Service, Targets.Service.ItemImageService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.MarketService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.ListingItemService);
        itemInformationService = app.IoC.getNamed<ItemInformationService>(Types.Service, Targets.Service.ItemInformationService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        // create market
        let defaultMarket = await marketService.getDefault();
        defaultMarket = defaultMarket.toJSON();

        createdListingItem = await testDataService.create<ListingItem>({
            model: 'listingitem',
            data: {
                market_id: defaultMarket.id,
                hash: 'itemhash'
            } as any,
            withRelated: true
        } as TestDataCreateRequest);

        // create iteminformation
        itemInformation = await testDataService.create<ItemInformation>({
            model: 'iteminformation',
            data: {
                listing_item_id: createdListingItem.id,
                title: 'TEST TITLE',
                shortDescription: 'TEST SHORT DESCRIPTION',
                longDescription: 'TEST LONG DESCRIPTION',
                itemCategory: {
                    key: 'cat_high_luxyry_items',
                    name: 'Luxury Items',
                    description: ''
                }
            } as any,
                withRelated: true
        } as TestDataCreateRequest);
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
        testData.item_information_id = itemInformation.id;
        const itemImageModel: ItemImage = await itemImageService.create(testData as ItemImageCreateRequest);
        createdId = itemImageModel.Id;
        const result = itemImageModel.toJSON();

        expect(result.hash).toBe(testData.hash);
        expect(result.ItemImageDatas[0].dataId).toBe(testData.data.dataId);
        expect(result.ItemImageDatas[0].protocol).toBe(testData.data.protocol);
        expect(result.ItemImageDatas[0].encoding).toBe(testData.data.encoding);

        // TODO: test that all sizes exists
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
        expect(result.ItemImageData).toBe(undefined); // doesnt fetch related
    });

    test('Should return one item image', async () => {
        const itemImageModel: ItemImage = await itemImageService.findOne(createdId);
        const result = itemImageModel.toJSON();
        expect(result.hash).toBe(testData.hash);
        expect(result.ItemImageDatas[0].dataId).toBe(testData.data.dataId);
        expect(result.ItemImageDatas[0].protocol).toBe(testData.data.protocol);
        expect(result.ItemImageDatas[0].encoding).toBe(testData.data.encoding);

        // TODO: When non-BASE64 resizing is implemented check image sizes.
    });

    test('Should throw ValidationException because there is no item_information_id', async () => {
        expect.assertions(1);
        await itemImageService.update(createdId, testDataUpdated as ItemImageUpdateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should update the item image', async () => {
        testDataUpdated.item_information_id = itemInformation.id;

        const tmp = await listingItemService.findOne(itemInformation.id).catch(e => {
            log.error('update(): 100: ' + e);
        });
        if ( !tmp ) {
            log.error('update(): 200: tmp is ' + tmp);
        }

        const itemImageModel: ItemImage = await itemImageService.update(createdId, testDataUpdated as ItemImageUpdateRequest);
        log.error('100: ' + JSON.stringify(itemImageModel, null, 2));
        const result = itemImageModel.toJSON();

        expect(result.hash).toBe(testDataUpdated.hash);
        expect(result.ItemImageDatas[0].dataId).toBe(testDataUpdated.data.dataId);
        expect(result.ItemImageDatas[0].protocol).toBe(testDataUpdated.data.protocol);
        expect(result.ItemImageDatas[0].encoding).toBe(testDataUpdated.data.encoding);

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
        expect.assertions(3);
        await listingItemService.destroy(createdListingItem.id);

        await listingItemService.findOne(createdListingItem.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdListingItem.id))
        );
        await itemInformationService.findOne(itemInformation.id).catch(e =>
            expect(e).toEqual(new NotFoundException(itemInformation.id))
        );
        await itemImageService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

});
