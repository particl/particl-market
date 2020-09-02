// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { ImageDataService } from '../../src/api/services/model/ImageDataService';
import { ImageService } from '../../src/api/services/model/ImageService';
import { MarketService } from '../../src/api/services/model/MarketService';
import { ListingItemService } from '../../src/api/services/model/ListingItemService';
import { ItemInformationService } from '../../src/api/services/model/ItemInformationService';
import { ImageProcessing } from '../../src/core/helpers/ImageProcessing';
import { ImageVersions } from '../../src/core/helpers/ImageVersionEnumType';
import { ProtocolDSN } from 'omp-lib/dist/interfaces/dsn';
import { ImageDataCreateRequest } from '../../src/api/requests/model/ImageDataCreateRequest';
import { ImageDataUpdateRequest } from '../../src/api/requests/model/ImageDataUpdateRequest';

describe('ImageData', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let itemImageDataService: ImageDataService;
    let imageService: ImageService;
    let marketService: MarketService;
    let listingItemService: ListingItemService;
    let itemInformationService: ItemInformationService;

    // let createdListingItem;
    // let createdImage;
    // let createdImageDataId;

    const testData = {
        dataId: '',
        imageVersion: ImageVersions.ORIGINAL.propName,
        protocol: ProtocolDSN.LOCAL,
        encoding: 'BASE64',
        data: ImageProcessing.milkcat
    } as ImageDataCreateRequest;

    const testDataUpdated = {
        dataId: '',
        protocol: ProtocolDSN.LOCAL,
        imageVersion: ImageVersions.ORIGINAL.propName,
        encoding: 'BASE64',
        data: ImageProcessing.milkcat
    } as ImageDataUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        itemImageDataService = app.IoC.getNamed<ImageDataService>(Types.Service, Targets.Service.model.ImageDataService);
        imageService = app.IoC.getNamed<ImageService>(Types.Service, Targets.Service.model.ImageService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.model.ListingItemService);
        itemInformationService = app.IoC.getNamed<ItemInformationService>(Types.Service, Targets.Service.model.ItemInformationService);

/*
        const generateParams = new GenerateListingItemParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            true,   // generateShippingDestinations
            false,  // generateImages
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
        const itemImage: Image = await imageService.create({
            item_information_id: createdListingItem.ItemInformation.id,
            hash: 'hash',
            data: {}
        } as ImageCreateRequest);
        createdImage = itemImage.toJSON();
*/
    });

    test('FIX THIS', async () => {
        // asdf
    });
/*
    test('Should throw ValidationException because there is no image_id', async () => {
        expect.assertions(1);
        await itemImageDataService.create(testData as ImageDataCreateRequest).catch(e => {
            expect(e).toEqual(new ValidationException('Request body is not valid', []));
        });
    });

    test('Should create a new item image data', async () => {
        testData.image_id = createdImage.id;

        const itemImageDataModel: ImageData = await itemImageDataService.create(testData);
        createdImageDataId = itemImageDataModel.Id;
        const result = itemImageDataModel.toJSON();
        expect(result.dataId).toBe(testData.dataId);
        expect(result.protocol).toBe(testData.protocol);
        expect(result.encoding).toBe(testData.encoding);
    });

    test('Should throw ValidationException because we want to create a empty item image data', async () => {
        expect.assertions(1);
        await itemImageDataService.create({} as ImageDataCreateRequest).catch(e => {
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
        const itemImageDataModel: ImageData = await itemImageDataService.findOne(createdImageDataId);
        const result = itemImageDataModel.toJSON();

        expect(result.dataId).toBe(testData.dataId);
        expect(result.protocol).toBe(testData.protocol);
        expect(result.encoding).toBe(testData.encoding);
    });

    test('Should throw ValidationException because there is no image_id', async () => {
        expect.assertions(1);
        await itemImageDataService.update(createdImageDataId, testDataUpdated as ImageDataUpdateRequest).catch(e => {
            expect(e).toEqual(new ValidationException('Request body is not valid', []));
        }
        );
    });

    test('Should throw ValidationException because we want to update a item image data with empty body', async () => {
        expect.assertions(1);
        await itemImageDataService.update(createdImageDataId, {} as ImageDataUpdateRequest).catch(e => {
            expect(e).toEqual(new ValidationException('Request body is not valid', []));
        }
        );
    });

    test('Should update the item image data', async () => {
        testDataUpdated.image_id = createdImage.id;
        const itemImageDataModel: ImageData = await itemImageDataService.update(createdImageDataId, testDataUpdated as ImageDataUpdateRequest);
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
