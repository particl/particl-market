import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';

import { TestDataService } from '../../src/api/services/TestDataService';
import { ItemImageDataService } from '../../src/api/services/ItemImageDataService';
import { ItemImageService } from '../../src/api/services/ItemImageService';
import { MarketService } from '../../src/api/services/MarketService';
import { ListingItemService } from '../../src/api/services/ListingItemService';
import { ItemInformationService } from '../../src/api/services/ItemInformationService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { DatabaseException } from '../../src/api/exceptions/DatabaseException';
import { ImageDataProtocolType } from '../../src/api/enums/ImageDataProtocolType';

import { ItemImageData } from '../../src/api/models/ItemImageData';
import { ItemImage } from '../../src/api/models/ItemImage';
import { ItemInformation } from '../../src/api/models/ItemInformation';
import { ListingItem } from '../../src/api/models/ListingItem';

import { ItemImageCreateRequest } from '../../src/api/requests/ItemImageCreateRequest';
import { TestDataCreateRequest } from '../../src/api/requests/TestDataCreateRequest';
import { ItemImageDataCreateRequest } from '../../src/api/requests/ItemImageDataCreateRequest';
import { ItemImageDataUpdateRequest } from '../../src/api/requests/ItemImageDataUpdateRequest';

import { ImageProcessing, MEDIUM_IMAGE_SIZE, THUMBNAIL_IMAGE_SIZE } from '../../src/core/helpers/ImageProcessing';
import { ImageTriplet } from '../../src/core/helpers/ImageTriplet';

import sharp = require('sharp');
import piexif = require('piexifjs');
import {ImageVersions} from '../../src/core/helpers/ImageVersionEnumType';
import {GenerateListingItemParams} from '../../src/api/requests/params/GenerateListingItemParams';
import {CreatableModel} from '../../src/api/enums/CreatableModel';
import {TestDataGenerateRequest} from '../../src/api/requests/TestDataGenerateRequest';
import {IsNotEmpty} from 'class-validator';

describe('ItemImageData', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let itemImageDataService: ItemImageDataService;
    let itemImageService: ItemImageService;
    let marketService: MarketService;
    let listingItemService: ListingItemService;
    let itemInformationService: ItemInformationService;

    // let createdListingItem;
    // let createdImage;
    // let createdImageDataId;

    const testData = {
        imageVersion: ImageVersions.ORIGINAL.propName,
        dataId: null,
        protocol: ImageDataProtocolType.LOCAL,
        encoding: 'BASE64',
        data: ImageProcessing.milkcat
    } as ItemImageDataCreateRequest;

    const testDataUpdated = {
        dataId: null,
        protocol: ImageDataProtocolType.LOCAL,
        imageVersion: ImageVersions.ORIGINAL.propName,
        encoding: 'BASE64',
        data: ImageProcessing.milkcat
    } as ItemImageDataUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        itemImageDataService = app.IoC.getNamed<ItemImageDataService>(Types.Service, Targets.Service.ItemImageDataService);
        itemImageService = app.IoC.getNamed<ItemImageService>(Types.Service, Targets.Service.ItemImageService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.MarketService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.ListingItemService);
        itemInformationService = app.IoC.getNamed<ItemInformationService>(Types.Service, Targets.Service.ItemInformationService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

/*
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
        createdListingItem = listingItems[0];

        // create an image, without data
        const itemImage: ItemImage = await itemImageService.create({
            item_information_id: createdListingItem.ItemInformation.id,
            hash: 'hash',
            data: {}
        } as ItemImageCreateRequest);
        createdImage = itemImage.toJSON();
*/
    });

    test('FIX THIS', async () => {
        // asdf
    });
/*
    test('Should throw ValidationException because there is no item_image_id', async () => {
        expect.assertions(1);
        await itemImageDataService.create(testData as ItemImageDataCreateRequest).catch(e => {
            expect(e).toEqual(new ValidationException('Request body is not valid', []));
        });
    });

    test('Should create a new item image data', async () => {
        testData.item_image_id = createdImage.id;

        const itemImageDataModel: ItemImageData = await itemImageDataService.create(testData);
        createdImageDataId = itemImageDataModel.Id;
        const result = itemImageDataModel.toJSON();
        expect(result.dataId).toBe(testData.dataId);
        expect(result.protocol).toBe(testData.protocol);
        expect(result.encoding).toBe(testData.encoding);
    });

    test('Should throw ValidationException because we want to create a empty item image data', async () => {
        expect.assertions(1);
        await itemImageDataService.create({} as ItemImageDataCreateRequest).catch(e => {
            expect(e).toEqual(new ValidationException('Request body is not valid', []));
        }
        );
    });

    test('Should list item image datas with our new create one', async () => {
        const itemImageDataCollection = await itemImageDataService.findAll();
        const itemImageData = itemImageDataCollection.toJSON();
        expect(itemImageData.length).toBe(1);

        const result = itemImageData[0];

        expect(result.dataId).toBe(testData.dataId);
        expect(result.protocol).toBe(testData.protocol);
        expect(result.encoding).toBe(testData.encoding);
    });

    test('Should return one item image data', async () => {
        const itemImageDataModel: ItemImageData = await itemImageDataService.findOne(createdImageDataId);
        const result = itemImageDataModel.toJSON();

        expect(result.dataId).toBe(testData.dataId);
        expect(result.protocol).toBe(testData.protocol);
        expect(result.encoding).toBe(testData.encoding);
    });

    test('Should throw ValidationException because there is no item_image_id', async () => {
        expect.assertions(1);
        await itemImageDataService.update(createdImageDataId, testDataUpdated as ItemImageDataUpdateRequest).catch(e => {
            expect(e).toEqual(new ValidationException('Request body is not valid', []));
        }
        );
    });

    test('Should throw ValidationException because we want to update a item image data with empty body', async () => {
        expect.assertions(1);
        await itemImageDataService.update(createdImageDataId, {} as ItemImageDataUpdateRequest).catch(e => {
            expect(e).toEqual(new ValidationException('Request body is not valid', []));
        }
        );
    });

    test('Should update the item image data', async () => {
        testDataUpdated.item_image_id = createdImage.id;
        const itemImageDataModel: ItemImageData = await itemImageDataService.update(createdImageDataId, testDataUpdated as ItemImageDataUpdateRequest);
        const result = itemImageDataModel.toJSON();

        expect(result.dataId).toBe(testDataUpdated.dataId);
        expect(result.protocol).toBe(testDataUpdated.protocol);
        expect(result.encoding).toBe(testDataUpdated.encoding);
    });

    test('Should delete the item image data', async () => {
        expect.assertions(1);
        await itemImageDataService.destroy(createdImageDataId);

        await itemImageDataService.findOne(createdImageDataId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdImageDataId))
        );

    });
*/

});
