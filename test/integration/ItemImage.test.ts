// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import * as _ from 'lodash';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { ItemImageService } from '../../src/api/services/model/ItemImageService';
import { ListingItemService } from '../../src/api/services/model/ListingItemService';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { ItemImageCreateRequest } from '../../src/api/requests/model/ItemImageCreateRequest';
import { ItemImageUpdateRequest } from '../../src/api/requests/model/ItemImageUpdateRequest';
import { ImageProcessing } from '../../src/core/helpers/ImageProcessing';
import { TestDataGenerateRequest } from '../../src/api/requests/testdata/TestDataGenerateRequest';
import { GenerateListingItemParams } from '../../src/api/requests/testdata/GenerateListingItemParams';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { ItemImageDataService } from '../../src/api/services/model/ItemImageDataService';
import { ProtocolDSN } from 'omp-lib/dist/interfaces/dsn';
import { ImageVersions } from '../../src/core/helpers/ImageVersionEnumType';
import { ItemImageDataCreateRequest } from '../../src/api/requests/model/ItemImageDataCreateRequest';
import { MarketService } from '../../src/api/services/model/MarketService';
import { ProfileService } from '../../src/api/services/model/ProfileService';
import { ConfigurableHasher } from 'omp-lib/dist/hasher/hash';
import { HashableItemImageCreateRequestConfig } from '../../src/api/factories/hashableconfig/createrequest/HashableItemImageCreateRequestConfig';

describe('ItemImage', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let itemImageService: ItemImageService;
    let itemImageDataService: ItemImageDataService;
    let listingItemService: ListingItemService;
    let marketService: MarketService;
    let profileService: ProfileService;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;
    let listingItem: resources.ListingItem;
    let itemImage: resources.ItemImage;

    let imageHash;

    const testData = {
        hash: 'hash',
        data: [{
            imageHash: 'hash',
            dataId: 'http://dataid1',
            protocol: ProtocolDSN.LOCAL,
            imageVersion: ImageVersions.ORIGINAL.propName,
            encoding: 'BASE64',
            data: ImageProcessing.milkcatTall
        }] as ItemImageDataCreateRequest[],
        featured: false
    } as ItemImageCreateRequest;

    const testDataUpdated = {
        hash: 'hash',
        data: [{
            imageHash: 'hash',
            dataId: 'http://dataid2',
            protocol: ProtocolDSN.LOCAL,
            imageVersion: ImageVersions.ORIGINAL.propName,
            encoding: 'BASE64',
            data: ImageProcessing.milkcat
        }] as ItemImageDataCreateRequest[],
        featured: true
    } as ItemImageUpdateRequest;


    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        itemImageService = app.IoC.getNamed<ItemImageService>(Types.Service, Targets.Service.model.ItemImageService);
        itemImageDataService = app.IoC.getNamed<ItemImageDataService>(Types.Service, Targets.Service.model.ItemImageDataService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.model.ListingItemService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        defaultProfile = await profileService.getDefault().then(value => value.toJSON());
        defaultMarket = await marketService.getDefault().then(value => value.toJSON());

        const generateParams = new GenerateListingItemParams([
            true,                               // generateItemInformation
            false,                               // generateItemLocation
            false,                               // generateShippingDestinations
            false,                              // generateItemImages
            false,                               // generatePaymentInformation
            false,                               // generateEscrow
            false,                               // generateItemPrice
            false,                               // generateMessagingInformation
            false,                              // generateListingItemObjects
            false,                              // generateObjectDatas
            null,                               // listingItemTemplateHash
            defaultProfile.address              // seller
        ]).toParamsArray();

        const listingItems = await testDataService.generate({
            model: CreatableModel.LISTINGITEM,  // what to generate
            amount: 1,                          // how many to generate
            withRelated: true,                  // return model
            generateParams                      // what kind of data to generate
        } as TestDataGenerateRequest);
        listingItem = listingItems[0];

        log.debug('created ListingItem: ', JSON.stringify(listingItem, null, 2));

        const itemImageDatas: ItemImageDataCreateRequest[] = testData.data;
        const itemImageDataOriginal = _.find(itemImageDatas, (imageData) => {
            return imageData.imageVersion === ImageVersions.ORIGINAL.propName;
        });
        imageHash = ConfigurableHasher.hash(itemImageDataOriginal, new HashableItemImageCreateRequestConfig());
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
        testData.item_information_id = listingItem.ItemInformation.id;

        itemImage = await itemImageService.create(testData).then(value => value.toJSON());
        const result = itemImage;

        const imageUrl = process.env.APP_HOST
        + (process.env.APP_PORT ? ':' + process.env.APP_PORT : '')
        + '/api/item-images/' + itemImage.id + '/' + testData.data[0].imageVersion;

        expect(result.hash).toBe(imageHash);
        expect(result.featured).toBeFalsy();
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
        const itemImages: resources.ItemImage[] = await itemImageService.findAll().then(value => value.toJSON());
        expect(itemImages.length).toBe(1);

        const result: resources.ItemImage = itemImages[0];
        log.debug('result: ', JSON.stringify(result, null, 2));
        expect(result.hash).toBe(imageHash);
        expect(result.featured).toBeFalsy();
        expect(result.ItemImageDatas).toBe(undefined); // doesnt fetch related
    });

    test('Should return one ItemImage', async () => {
        itemImage = await itemImageService.findOne(itemImage.id).then(value => value.toJSON());

        const imageUrl = process.env.APP_HOST
            + (process.env.APP_PORT ? ':' + process.env.APP_PORT : '')
            + '/api/item-images/' + itemImage.id + '/' + testData.data[0].imageVersion;

        const result = itemImage;
        expect(result.hash).toBe(imageHash);
        expect(result.featured).toBeFalsy();
        expect(result.ItemImageDatas[0].dataId).toBe(imageUrl);
        expect(result.ItemImageDatas[0].protocol).toBe(testData.data[0].protocol);
        expect(result.ItemImageDatas[0].imageVersion).toBe(testData.data[0].imageVersion);
        expect(result.ItemImageDatas[0].encoding).toBe(testData.data[0].encoding);

        // TODO: When non-BASE64 resizing is implemented check image sizes.
    });

    test('Should update the ItemImage', async () => {

        itemImage = await itemImageService.update(itemImage.id, testDataUpdated).then(value => value.toJSON());
        const result = itemImage;

        const imageUrl = process.env.APP_HOST
            + (process.env.APP_PORT ? ':' + process.env.APP_PORT : '')
            + '/api/item-images/' + itemImage.id + '/' + testData.data[0].imageVersion;

        const itemImageDatas: ItemImageDataCreateRequest[] = testDataUpdated.data;
        const itemImageDataOriginal = _.find(itemImageDatas, (imageData) => {
            return imageData.imageVersion === ImageVersions.ORIGINAL.propName;
        });
        imageHash = ConfigurableHasher.hash(itemImageDataOriginal, new HashableItemImageCreateRequestConfig());

        expect(result.hash).toBe(imageHash);
        expect(result.featured).toBeTruthy();
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
        listingItem = await listingItemService.findOne(listingItem.id).then(value => value.toJSON());
        expect(listingItem.ItemInformation.ItemImages.length).toBe(1);

        // destroy the create image
        await itemImageService.destroy(listingItem.ItemInformation.ItemImages[0].id);

        // make sure the image is destroyed
        await itemImageService.findOne(listingItem.ItemInformation.ItemImages[0].id).catch(e =>
            expect(e).toEqual(new NotFoundException(listingItem.ItemInformation.ItemImages[0].id))
        );

        // make sure that the related imagedatas were also destroyed
        for (const imageData of listingItem.ItemInformation.ItemImages[0].ItemImageDatas) {
            await itemImageDataService.findOne(imageData.id).catch(e =>
                expect(e).toEqual(new NotFoundException(imageData.id))
            );
        }

        // destroy the created item
        await listingItemService.destroy(listingItem.id);

        // make sure the created item was destroyed
        await listingItemService.findOne(listingItem.id).catch(e =>
            expect(e).toEqual(new NotFoundException(listingItem.id))
        );

    });
});
