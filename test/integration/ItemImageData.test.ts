// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { ItemImageDataService } from '../../src/api/services/model/ItemImageDataService';
import { ItemImageService } from '../../src/api/services/model/ItemImageService';
import { MarketService } from '../../src/api/services/model/MarketService';
import { ListingItemService } from '../../src/api/services/model/ListingItemService';
import { ItemInformationService } from '../../src/api/services/model/ItemInformationService';
import { ItemImageDataCreateRequest } from '../../src/api/requests/model/ItemImageDataCreateRequest';
import { ItemImageDataUpdateRequest } from '../../src/api/requests/model/ItemImageDataUpdateRequest';
import { ImageProcessing } from '../../src/core/helpers/ImageProcessing';
import { ImageVersions } from '../../src/core/helpers/ImageVersionEnumType';
import { ProtocolDSN } from 'omp-lib/dist/interfaces/dsn';

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
        dataId: '',
        imageVersion: ImageVersions.ORIGINAL.propName,
        protocol: ProtocolDSN.LOCAL,
        encoding: 'BASE64',
        data: ImageProcessing.milkcat
    } as ItemImageDataCreateRequest;

    const testDataUpdated = {
        dataId: '',
        protocol: ProtocolDSN.LOCAL,
        imageVersion: ImageVersions.ORIGINAL.propName,
        encoding: 'BASE64',
        data: ImageProcessing.milkcat
    } as ItemImageDataUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        itemImageDataService = app.IoC.getNamed<ItemImageDataService>(Types.Service, Targets.Service.model.ItemImageDataService);
        itemImageService = app.IoC.getNamed<ItemImageService>(Types.Service, Targets.Service.ItemImageService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.model.ListingItemService);
        itemInformationService = app.IoC.getNamed<ItemInformationService>(Types.Service, Targets.Service.model.ItemInformationService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

/*
        const generateParams = new GenerateListingItemParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
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
