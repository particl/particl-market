// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import * as _ from 'lodash';
import * as Faker from 'faker';
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
import { ItemImageDataService } from '../../src/api/services/model/ItemImageDataService';
import { ProtocolDSN } from 'omp-lib/dist/interfaces/dsn';
import { ImageVersions } from '../../src/core/helpers/ImageVersionEnumType';
import { ItemImageDataCreateRequest } from '../../src/api/requests/model/ItemImageDataCreateRequest';
import { MarketService } from '../../src/api/services/model/MarketService';
import { ProfileService } from '../../src/api/services/model/ProfileService';
import { ListingItemTemplateService } from '../../src/api/services/model/ListingItemTemplateService';

describe('ItemImage', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let itemImageService: ItemImageService;
    let itemImageDataService: ItemImageDataService;
    let marketService: MarketService;
    let profileService: ProfileService;
    let listingItemService: ListingItemService;
    let listingItemTemplateService: ListingItemTemplateService;

    let bidderProfile: resources.Profile;
    let sellerProfile: resources.Profile;
    let bidderMarket: resources.Market;
    let sellerMarket: resources.Market;
    let listingItem: resources.ListingItem;
    let listingItemTemplate: resources.ListingItemTemplate;

    let itemImage: resources.ItemImage;

    const testData = {
        data: [{
            dataId: 'http://dataid1',
            protocol: ProtocolDSN.LOCAL,
            imageVersion: ImageVersions.ORIGINAL.propName,
            imageHash: 'TEST-imagehash1',
            encoding: 'BASE64'
            // data: ''
        }] as ItemImageDataCreateRequest[],
        hash: 'TEST-imagehash1',
        featured: false
    } as ItemImageCreateRequest;

    const testDataUpdated = {
        data: [{
            dataId: 'http://dataid2',
            protocol: ProtocolDSN.LOCAL,
            imageVersion: ImageVersions.ORIGINAL.propName,
            imageHash: 'TEST-imagehash2',
            encoding: 'BASE64'
            // data: ''
        }] as ItemImageDataCreateRequest[],
        hash: 'TEST-imagehash2',
        featured: true
    } as ItemImageUpdateRequest;


    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        itemImageService = app.IoC.getNamed<ItemImageService>(Types.Service, Targets.Service.model.ItemImageService);
        itemImageDataService = app.IoC.getNamed<ItemImageDataService>(Types.Service, Targets.Service.model.ItemImageDataService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.model.ListingItemService);
        listingItemTemplateService = app.IoC.getNamed<ListingItemTemplateService>(Types.Service, Targets.Service.model.ListingItemTemplateService);

        bidderProfile = await profileService.getDefault().then(value => value.toJSON());
        log.debug('bidderProfile: ', JSON.stringify(bidderProfile, null, 2));
        bidderMarket = await marketService.getDefaultForProfile(bidderProfile.id).then(value => value.toJSON());
        log.debug('bidderMarket: ', JSON.stringify(bidderMarket, null, 2));

        sellerProfile = await testDataService.generateProfile();
        log.debug('sellerProfile: ', JSON.stringify(sellerProfile, null, 2));
        sellerMarket = await marketService.getDefaultForProfile(sellerProfile.id).then(value => value.toJSON());
        log.debug('sellerMarket: ', JSON.stringify(sellerMarket, null, 2));

        listingItem = await testDataService.generateListingItemWithTemplate(sellerProfile, bidderMarket, false);
        listingItemTemplate = await listingItemTemplateService.findOne(listingItem.ListingItemTemplate.id).then(value => value.toJSON());

        log.debug('listingItem: ', JSON.stringify(listingItem, null, 2));

    });

    afterAll(async () => {
        //
    });

    test('Should throw ValidationException because there is no item_information_id', async () => {
        expect.assertions(1);

        await itemImageService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new ItemImage', async () => {

        const randomImageData1 = await testDataService.generateRandomImage(20, 20);

        testData.item_information_id = listingItem.ItemInformation.id;
        testData.data[0].data = randomImageData1;

        itemImage = await itemImageService.create(testData).then(value => value.toJSON());
        const result = itemImage;

        const imageUrl = process.env.APP_HOST
        + (process.env.APP_PORT ? ':' + process.env.APP_PORT : '')
        + '/api/item-images/' + itemImage.id + '/' + testData.data[0].imageVersion;

        expect(result.hash).toBe(testData.hash);
        expect(result.featured).toBeFalsy();
        expect(result.ItemImageDatas[0].dataId).toBe(imageUrl);
        expect(result.ItemImageDatas[0].protocol).toBe(testData.data[0].protocol);
        expect(result.ItemImageDatas[0].imageVersion).toBe(testData.data[0].imageVersion);
        expect(result.ItemImageDatas[0].encoding).toBe(testData.data[0].encoding);
        expect(result.ItemImageDatas.length).toBe(4);

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
        expect(result.hash).toBe(testData.hash);
        expect(result.featured).toBeFalsy();
        expect(result.ItemImageDatas).toBe(undefined); // doesnt fetch related
    });

    test('Should return one ItemImage', async () => {
        itemImage = await itemImageService.findOne(itemImage.id).then(value => value.toJSON());

        const imageUrl = process.env.APP_HOST
            + (process.env.APP_PORT ? ':' + process.env.APP_PORT : '')
            + '/api/item-images/' + itemImage.id + '/' + testData.data[0].imageVersion;

        const result = itemImage;
        expect(result.hash).toBe(testData.hash);
        expect(result.featured).toBeFalsy();
        expect(result.ItemImageDatas[0].dataId).toBe(imageUrl);
        expect(result.ItemImageDatas[0].protocol).toBe(testData.data[0].protocol);
        expect(result.ItemImageDatas[0].imageVersion).toBe(testData.data[0].imageVersion);
        expect(result.ItemImageDatas[0].encoding).toBe(testData.data[0].encoding);

    });

    test('Should update the ItemImage', async () => {

        const randomImageData1 = await testDataService.generateRandomImage(20, 20);
        testDataUpdated.data[0].data = randomImageData1;

        const result: resources.ItemImage = await itemImageService.update(itemImage.id, testDataUpdated).then(value => value.toJSON());

        const imageUrl = process.env.APP_HOST
            + (process.env.APP_PORT ? ':' + process.env.APP_PORT : '')
            + '/api/item-images/' + itemImage.id + '/' + testData.data[0].imageVersion;

        expect(result.hash).toBe(testDataUpdated.hash);
        expect(result.featured).toBeTruthy();
        expect(result.ItemImageDatas[0].dataId).toBe(imageUrl);
        expect(result.ItemImageDatas[0].protocol).toBe(testDataUpdated.data[0].protocol);
        expect(result.ItemImageDatas[0].imageVersion).toBe(testDataUpdated.data[0].imageVersion);
        expect(result.ItemImageDatas[0].encoding).toBe(testDataUpdated.data[0].encoding);

        expect(result.ItemImageDatas.length).toBe(4);

        itemImage = result;
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
        await listingItemService.findOne(listingItem.id).catch(e =>
            expect(e).toEqual(new NotFoundException(listingItem.id))
        );

    });

});

