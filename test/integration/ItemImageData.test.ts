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
import { ImageDataProtocolType } from '../../src/api/enums/ImageDataProtocolType';

import { ItemImageData } from '../../src/api/models/ItemImageData';
import { ItemImage } from '../../src/api/models/ItemImage';
import { ItemInformation } from '../../src/api/models/ItemInformation';
import { ListingItem } from '../../src/api/models/ListingItem';

import { ItemImageCreateRequest } from '../../src/api/requests/ItemImageCreateRequest';
import { TestDataCreateRequest } from '../../src/api/requests/TestDataCreateRequest';
import { ItemImageDataCreateRequest } from '../../src/api/requests/ItemImageDataCreateRequest';
import { ItemImageDataUpdateRequest } from '../../src/api/requests/ItemImageDataUpdateRequest';

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

    let createdId;
    let itemInformation;
    let createdListingItem;
    let itemImage;

    const testData = {
        item_image_id: null,
        dataId: 'QmUwHMFY9GSiKgjqyZpgAv2LhBrh7GV8rtLuagbry9wmMU',
        protocol: ImageDataProtocolType.IPFS,
        encoding: null,
        data: null
    } as ItemImageDataCreateRequest;

    const testDataUpdated = {
        item_image_id: null,
        dataId: null,
        protocol: ImageDataProtocolType.LOCAL,
        encoding: 'BASE64',
        data: 'BASE64 encoded image data'
    } as ItemImageDataUpdateRequest;

    const itemImageTestData = {
        item_information_id: null,
        hash: 'TEST-HASH',
        data: {
            dataId: 'QmUwHMFY9GSiKgjqyZpgAv2LhBrh7GV8rtLuagbry9wmMU',
            protocol: ImageDataProtocolType.IPFS,
            encoding: null,
            data: null
        }
    } as ItemImageCreateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        itemImageDataService = app.IoC.getNamed<ItemImageDataService>(Types.Service, Targets.Service.ItemImageDataService);
        itemImageService = app.IoC.getNamed<ItemImageService>(Types.Service, Targets.Service.ItemImageService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.MarketService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.ListingItemService);
        itemInformationService = app.IoC.getNamed<ItemInformationService>(Types.Service, Targets.Service.ItemInformationService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean([]);

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


        // create iteminformation
        itemImageTestData.item_information_id = itemInformation.id;
        itemImage = await testDataService.create<ItemImage>({
            model: 'itemimage',
            data: itemImageTestData as any,
                withRelated: true
        } as TestDataCreateRequest);
    });

    afterAll(async () => {
        //
    });

    test('Should throw ValidationException because there is no item_image_id', async () => {
        expect.assertions(1);
        await itemImageDataService.create(testData as ItemImageDataCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new item image data', async () => {
        testData.item_image_id = itemImage.id;
        const itemImageDataModel: ItemImageData = await itemImageDataService.create(testData as ItemImageDataCreateRequest);
        createdId = itemImageDataModel.Id;
        const result = itemImageDataModel.toJSON();
        expect(result.dataId).toBe(testData.dataId);
        expect(result.protocol).toBe(testData.protocol);
        expect(result.encoding).toBe(testData.encoding);
        if (!testData.data) {
            expect(result.dataBig).toBeUndefined();
            expect(result.dataMedium).toBeUndefined();
            expect(result.dataThumbnail).toBeUndefined();
        } else {
            // TODO: If image is in test data check size and validity of processed image
            expect(result.dataBig).not.toBeUndefined();
            expect(result.dataMedium).not.toBeUndefined();
            expect(result.dataThumbnail).not.toBeUndefined();
        }
    });

    test('Should throw ValidationException because we want to create a empty item image data', async () => {
        expect.assertions(1);
        await itemImageDataService.create({} as ItemImageDataCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list item image datas with our new create one', async () => {
        const itemImageDataCollection = await itemImageDataService.findAll();
        const itemImageData = itemImageDataCollection.toJSON();
        expect(itemImageData.length).toBe(2);

        const result = itemImageData[0];

        expect(result.dataId).toBe(testData.dataId);
        expect(result.protocol).toBe(testData.protocol);
        expect(result.encoding).toBe(testData.encoding);
        if (!testData.data) {
            expect(result.dataBig).toBeUndefined();
            expect(result.dataMedium).toBeUndefined();
            expect(result.dataThumbnail).toBeUndefined();
        } else {
            // TODO: If image is in test data check size and validity of processed image
            expect(result.dataBig).not.toBeUndefined();
            expect(result.dataMedium).not.toBeUndefined();
            expect(result.dataThumbnail).not.toBeUndefined();
        }
    });

    test('Should return one item image data', async () => {
        const itemImageDataModel: ItemImageData = await itemImageDataService.findOne(createdId);
        const result = itemImageDataModel.toJSON();

        expect(result.dataId).toBe(testData.dataId);
        expect(result.protocol).toBe(testData.protocol);
        expect(result.encoding).toBe(testData.encoding);
        if (!testData.data) {
            expect(result.dataBig).toBeUndefined();
            expect(result.dataMedium).toBeUndefined();
            expect(result.dataThumbnail).toBeUndefined();
        } else {
            // TODO: If image is in test data check size and validity of processed image
            expect(result.dataBig).not.toBeUndefined();
            expect(result.dataMedium).not.toBeUndefined();
            expect(result.dataThumbnail).not.toBeUndefined();
        }
    });

    test('Should throw ValidationException because there is no item_image_id', async () => {
        expect.assertions(1);
        await itemImageDataService.update(createdId, testDataUpdated as ItemImageDataUpdateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should throw ValidationException because we want to update a item image data with empty body', async () => {
        expect.assertions(1);
        await itemImageDataService.update(createdId, {} as ItemImageDataUpdateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should update the item image data', async () => {
        testDataUpdated.item_image_id = itemImage.id;
        const itemImageDataModel: ItemImageData = await itemImageDataService.update(createdId, testDataUpdated as ItemImageDataUpdateRequest);
        const result = itemImageDataModel.toJSON();

        expect(result.dataId).toBe(testDataUpdated.dataId);
        expect(result.protocol).toBe(testDataUpdated.protocol);
        expect(result.encoding).toBe(testDataUpdated.encoding);
        if (!testDataUpdated.data) {
            expect(result.dataBig).toBeUndefined();
            expect(result.dataMedium).toBeUndefined();
            expect(result.dataThumbnail).toBeUndefined();
        } else {
            // TODO: If image is in test data check size and validity of processed image
            expect(result.dataBig).not.toBeUndefined();
            expect(result.dataMedium).not.toBeUndefined();
            expect(result.dataThumbnail).not.toBeUndefined();
        }
    });

    test('Should delete the item image data', async () => {
        expect.assertions(3);
        await listingItemService.destroy(createdListingItem.id);
        await listingItemService.findOne(createdListingItem.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdListingItem.id))
        );

        await itemInformationService.findOne(itemInformation.id).catch(e =>
            expect(e).toEqual(new NotFoundException(itemInformation.id))
        );

        await itemImageDataService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );

    });

});
