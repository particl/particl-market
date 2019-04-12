// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { ItemImageService } from '../../src/api/services/model/ItemImageService';
import { ListingItemService } from '../../src/api/services/model/ListingItemService';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { ItemImage } from '../../src/api/models/ItemImage';
import { ItemImageCreateRequest } from '../../src/api/requests/ItemImageCreateRequest';
import { ItemImageUpdateRequest } from '../../src/api/requests/ItemImageUpdateRequest';
import { ImageProcessing } from '../../src/core/helpers/ImageProcessing';
import { TestDataGenerateRequest } from '../../src/api/requests/TestDataGenerateRequest';
import { GenerateListingItemParams } from '../../src/api/requests/params/GenerateListingItemParams';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { ItemImageDataService } from '../../src/api/services/model/ItemImageDataService';
import { HashableObjectTypeDeprecated } from 'HashableObjectTypeDeprecated.ts';
import { ObjectHashDeprecated } from 'ObjectHashDeprecated.ts';
import { ProtocolDSN } from 'omp-lib/dist/interfaces/dsn';
import { ImageVersions } from '../../src/core/helpers/ImageVersionEnumType';
import { ItemImageDataCreateRequest } from '../../src/api/requests/ItemImageDataCreateRequest';
import { ItemImageDataUpdateRequest } from '../../src/api/requests/ItemImageDataUpdateRequest';

describe('ItemImage', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let itemImageService: ItemImageService;
    let itemImageDataService: ItemImageDataService;
    let listingItemService: ListingItemService;

    let createdImageId;
    let createdListingItem: resources.ListingItem;

    const testData = {
        // item_information_id: 0,
        // hash: 'hash',
        data: [{
            // item_image_id: 0,
            dataId: '',
            protocol: ProtocolDSN.LOCAL,
            imageVersion: ImageVersions.ORIGINAL.propName,
            encoding: 'BASE64',
            data: ImageProcessing.milkcatTall
        } as ItemImageDataCreateRequest]
    } as ItemImageCreateRequest;

    const testDataUpdated = {
        // item_information_id,
        // hash,
        data: [{
            dataId: '',
            protocol: ProtocolDSN.LOCAL,
            imageVersion: ImageVersions.ORIGINAL.propName,
            encoding: 'BASE64',
            data: ImageProcessing.milkcat
        } as ItemImageDataUpdateRequest]
    } as ItemImageUpdateRequest;


    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        itemImageService = app.IoC.getNamed<ItemImageService>(Types.Service, Targets.Service.ItemImageService);
        itemImageDataService = app.IoC.getNamed<ItemImageDataService>(Types.Service, Targets.Service.model.ItemImageDataService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.model.ListingItemService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

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
        log.debug('created ListingItem: ', JSON.stringify(createdListingItem, null, 2));
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

    test('Should create a new ItemImage', async () => {

        // add the required data to testData
        testData.item_information_id = createdListingItem.ItemInformation.id;
        const imageHash = ObjectHashDeprecated.getHash(testData.data[0], HashableObjectTypeDeprecated.ITEMIMAGEDATA_CREATEREQUEST);

        const result: resources.ItemImage = await itemImageService.create(testData)
            .then(value => value.toJSON());
        createdImageId = result.id;

        const imageUrl = process.env.APP_HOST
        + (process.env.APP_PORT ? ':' + process.env.APP_PORT : '')
        + '/api/item-images/' + createdImageId + '/' + testData.data[0].imageVersion;

        expect(result.hash).toBe(imageHash);
        expect(result.ItemImageDatas[0].dataId).toBe(imageUrl);
        expect(result.ItemImageDatas[0].protocol).toBe(testData.data[0].protocol);
        expect(result.ItemImageDatas[0].imageVersion).toBe(testData.data[0].imageVersion);
        expect(result.ItemImageDatas[0].encoding).toBe(testData.data[0].encoding);
        expect(result.ItemImageDatas.length).toBe(4);

        // TODO: When non-BASE64 resizing is implemented check image sizes.
    });

    test('Should throw ValidationException because we want to create a empty ItemImage', async () => {
        expect.assertions(1);
        await itemImageService.create({} as ItemImageCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list ItemImages with our newly created one', async () => {
        const itemImageCollection = await itemImageService.findAll();
        const itemImage = itemImageCollection.toJSON();
        expect(itemImage.length).toBe(1);

        const imageHash = ObjectHashDeprecated.getHash(testData.data[0], HashableObjectTypeDeprecated.ITEMIMAGEDATA_CREATEREQUEST);

        const result = itemImage[0];
        expect(result.hash).toBe(imageHash);
        expect(result.ItemImageDatas).toBe(undefined); // doesnt fetch related
    });

    test('Should return one ItemImage', async () => {
        const itemImageModel: ItemImage = await itemImageService.findOne(createdImageId);
        const result = itemImageModel.toJSON();

        const imageUrl = process.env.APP_HOST
            + (process.env.APP_PORT ? ':' + process.env.APP_PORT : '')
            + '/api/item-images/' + createdImageId + '/' + testData.data[0].imageVersion;

        const imageHash = ObjectHashDeprecated.getHash(testData.data[0], HashableObjectTypeDeprecated.ITEMIMAGEDATA_CREATEREQUEST);

        expect(result.hash).toBe(imageHash);
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
        testDataUpdated.hash = ObjectHashDeprecated.getHash(testDataUpdated.data[0], HashableObjectTypeDeprecated.ITEMIMAGEDATA_CREATEREQUEST);

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
    });

    test('Should delete the ItemImage', async () => {
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
