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
import { ImageService } from '../../src/api/services/model/ImageService';
import { ListingItemService } from '../../src/api/services/model/ListingItemService';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { ImageDataService } from '../../src/api/services/model/ImageDataService';
import { ProtocolDSN } from 'omp-lib/dist/interfaces/dsn';
import { ImageVersions } from '../../src/core/helpers/ImageVersionEnumType';
import { MarketService } from '../../src/api/services/model/MarketService';
import { ProfileService } from '../../src/api/services/model/ProfileService';
import { ListingItemTemplateService } from '../../src/api/services/model/ListingItemTemplateService';
import { DefaultMarketService } from '../../src/api/services/DefaultMarketService';
import { ImageDataCreateRequest } from '../../src/api/requests/model/ImageDataCreateRequest';
import { ImageCreateRequest } from '../../src/api/requests/model/ImageCreateRequest';
import { ImageUpdateRequest } from '../../src/api/requests/model/ImageUpdateRequest';

describe('Image', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let defaultMarketService: DefaultMarketService;
    let imageService: ImageService;
    let imageDataService: ImageDataService;
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

    let itemImage: resources.Image;

    const testData = {
        data: [{
            dataId: 'http://dataid1',
            protocol: ProtocolDSN.FILE,
            imageVersion: ImageVersions.ORIGINAL.propName,
            imageHash: 'TEST-imagehash1',
            encoding: 'BASE64'
            // data: ''
        }] as ImageDataCreateRequest[],
        hash: 'TEST-imagehash1',
        featured: false
    } as ImageCreateRequest;

    const testDataUpdated = {
        data: [{
            dataId: 'http://dataid2',
            protocol: ProtocolDSN.FILE,
            imageVersion: ImageVersions.ORIGINAL.propName,
            imageHash: 'TEST-imagehash2',
            encoding: 'BASE64'
            // data: ''
        }] as ImageDataCreateRequest[],
        hash: 'TEST-imagehash2',
        featured: true
    } as ImageUpdateRequest;


    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        defaultMarketService = app.IoC.getNamed<DefaultMarketService>(Types.Service, Targets.Service.DefaultMarketService);
        imageService = app.IoC.getNamed<ImageService>(Types.Service, Targets.Service.model.ImageService);
        imageDataService = app.IoC.getNamed<ImageDataService>(Types.Service, Targets.Service.model.ImageDataService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.model.ListingItemService);
        listingItemTemplateService = app.IoC.getNamed<ListingItemTemplateService>(Types.Service, Targets.Service.model.ListingItemTemplateService);

        bidderProfile = await profileService.getDefault().then(value => value.toJSON());
        // log.debug('bidderProfile: ', JSON.stringify(bidderProfile, null, 2));
        bidderMarket = await defaultMarketService.getDefaultForProfile(bidderProfile.id).then(value => value.toJSON());
        // log.debug('bidderMarket: ', JSON.stringify(bidderMarket, null, 2));

        sellerProfile = await testDataService.generateProfile();
        // log.debug('sellerProfile: ', JSON.stringify(sellerProfile, null, 2));
        sellerMarket = await defaultMarketService.getDefaultForProfile(sellerProfile.id).then(value => value.toJSON());
        // log.debug('sellerMarket: ', JSON.stringify(sellerMarket, null, 2));

        listingItem = await testDataService.generateListingItemWithTemplate(sellerProfile, bidderMarket, false);
        listingItemTemplate = await listingItemTemplateService.findOne(listingItem.ListingItemTemplate.id).then(value => value.toJSON());

        // log.debug('listingItem: ', JSON.stringify(listingItem, null, 2));

    });

    afterAll(async () => {
        //
    });

    test('Should throw ValidationException because there is no item_information_id', async () => {
        expect.assertions(1);

        await imageService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new Image', async () => {

        const randomImageData1 = await testDataService.generateRandomImage(20, 20);

        testData.item_information_id = listingItem.ItemInformation.id;
        testData.data[0].data = randomImageData1;

        itemImage = await imageService.create(testData).then(value => value.toJSON());
        const result = itemImage;

        // TODO: imageDataFactory.getImageUrl
        const imageUrl = process.env.APP_HOST
        + (process.env.APP_PORT ? ':' + process.env.APP_PORT : '')
        + '/api/images/' + itemImage.id + '/' + testData.data[0].imageVersion;

        expect(result.hash).toBe(testData.hash);
        expect(result.featured).toBeFalsy();
        expect(result.ImageDatas[0].dataId).toBe(imageUrl);
        expect(result.ImageDatas[0].protocol).toBe(testData.data[0].protocol);
        expect(result.ImageDatas[0].imageVersion).toBe(testData.data[0].imageVersion);
        expect(result.ImageDatas[0].encoding).toBe(testData.data[0].encoding);
        expect(result.ImageDatas.length).toBe(4);

    });

    test('Should throw ValidationException because we want to create a empty Image', async () => {
        expect.assertions(1);
        await imageService.create({} as ImageCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list Images with our newly created one', async () => {
        const images: resources.Image[] = await imageService.findAll().then(value => value.toJSON());
        expect(images.length).toBe(1);

        const result: resources.Image = images[0];
        log.debug('result: ', JSON.stringify(result, null, 2));
        expect(result.hash).toBe(testData.hash);
        expect(result.featured).toBeFalsy();
        expect(result.ImageDatas).toBe(undefined); // doesnt fetch related
    });

    test('Should return one Image', async () => {
        itemImage = await imageService.findOne(itemImage.id).then(value => value.toJSON());

        const imageUrl = process.env.APP_HOST
            + (process.env.APP_PORT ? ':' + process.env.APP_PORT : '')
            + '/api/images/' + itemImage.id + '/' + testData.data[0].imageVersion;

        const result = itemImage;
        expect(result.hash).toBe(testData.hash);
        expect(result.featured).toBeFalsy();
        expect(result.ImageDatas[0].dataId).toBe(imageUrl);
        expect(result.ImageDatas[0].protocol).toBe(testData.data[0].protocol);
        expect(result.ImageDatas[0].imageVersion).toBe(testData.data[0].imageVersion);
        expect(result.ImageDatas[0].encoding).toBe(testData.data[0].encoding);

    });

    test('Should update the Image', async () => {

        const randomImageData1 = await testDataService.generateRandomImage(20, 20);
        testDataUpdated.data[0].data = randomImageData1;

        const result: resources.Image = await imageService.update(itemImage.id, testDataUpdated).then(value => value.toJSON());

        const imageUrl = process.env.APP_HOST
            + (process.env.APP_PORT ? ':' + process.env.APP_PORT : '')
            + '/api/images/' + itemImage.id + '/' + testData.data[0].imageVersion;

        expect(result.hash).toBe(testDataUpdated.hash);
        expect(result.featured).toBeTruthy();
        expect(result.ImageDatas[0].dataId).toBe(imageUrl);
        expect(result.ImageDatas[0].protocol).toBe(testDataUpdated.data[0].protocol);
        expect(result.ImageDatas[0].imageVersion).toBe(testDataUpdated.data[0].imageVersion);
        expect(result.ImageDatas[0].encoding).toBe(testDataUpdated.data[0].encoding);

        expect(result.ImageDatas.length).toBe(4);

        itemImage = result;
    });

    test('Should delete the Image', async () => {
        expect.assertions(7);

        // find the listing item
        listingItem = await listingItemService.findOne(listingItem.id).then(value => value.toJSON());
        expect(listingItem.ItemInformation.Images.length).toBe(1);

        // destroy the create image
        await imageService.destroy(listingItem.ItemInformation.Images[0].id);

        // make sure the image is destroyed
        await imageService.findOne(listingItem.ItemInformation.Images[0].id).catch(e =>
            expect(e).toEqual(new NotFoundException(listingItem.ItemInformation.Images[0].id))
        );

        // make sure that the related imagedatas were also destroyed
        for (const imageData of listingItem.ItemInformation.Images[0].ImageDatas) {
            await imageDataService.findOne(imageData.id).catch(e =>
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

