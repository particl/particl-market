// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

// tslint:disable:max-line-length
import * from 'jest';
import * as resources from 'resources';
import * as Faker from 'faker';
import * as _ from 'lodash';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { ProfileService } from '../../src/api/services/model/ProfileService';
import { ListingItemTemplateService } from '../../src/api/services/model/ListingItemTemplateService';
import { ItemLocationService } from '../../src/api/services/model/ItemLocationService';
import { LocationMarkerService } from '../../src/api/services/model/LocationMarkerService';
import { ShippingDestinationService } from '../../src/api/services/model/ShippingDestinationService';
import { ImageService } from '../../src/api/services/model/ImageService';
import { ItemInformationService } from '../../src/api/services/model/ItemInformationService';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { ItemInformation } from '../../src/api/models/ItemInformation';
import { ShippingAvailability } from '../../src/api/enums/ShippingAvailability';
import { ItemInformationCreateRequest } from '../../src/api/requests/model/ItemInformationCreateRequest';
import { ItemInformationUpdateRequest } from '../../src/api/requests/model/ItemInformationUpdateRequest';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { ProtocolDSN } from 'omp-lib/dist/interfaces/dsn';
import { GenerateListingItemTemplateParams } from '../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { TestDataGenerateRequest } from '../../src/api/requests/testdata/TestDataGenerateRequest';
import { MarketService } from '../../src/api/services/model/MarketService';
import { ItemCategoryCreateRequest } from '../../src/api/requests/model/ItemCategoryCreateRequest';
import { LocationMarkerCreateRequest } from '../../src/api/requests/model/LocationMarkerCreateRequest';
import { ShippingDestinationCreateRequest } from '../../src/api/requests/model/ShippingDestinationCreateRequest';
import { ImageCreateRequest } from '../../src/api/requests/model/ImageCreateRequest';
import { ImageDataCreateRequest } from '../../src/api/requests/model/ImageDataCreateRequest';
import { ItemCategoryUpdateRequest } from '../../src/api/requests/model/ItemCategoryUpdateRequest';
import { ItemLocationCreateRequest } from '../../src/api/requests/model/ItemLocationCreateRequest';
import { DefaultMarketService } from '../../src/api/services/DefaultMarketService';
import { ImageVersions } from '../../src/core/helpers/ImageVersionEnumType';
import { ConfigurableHasher } from 'omp-lib/dist/hasher/hash';
import { ShippingCountries } from '../../src/core/helpers/ShippingCountries';
import { HashableImageCreateRequestConfig } from '../../src/api/factories/hashableconfig/createrequest/HashableImageCreateRequestConfig';
// tslint:enable:max-line-length

describe('ItemInformation', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let defaultMarketService: DefaultMarketService;
    let itemInformationService: ItemInformationService;
    let profileService: ProfileService;
    let marketService: MarketService;
    let listingItemTemplateService: ListingItemTemplateService;
    let itemLocationService: ItemLocationService;
    let locationMarkerService: LocationMarkerService;
    let shippingDestinationService: ShippingDestinationService;
    let imageService: ImageService;

    let market: resources.Market;
    let profile: resources.Profile;

    let randomImageData: string;
    let listingItemTemplate: resources.ListingItemTemplate;
    let itemInformation: resources.ItemInformation;

    let testData: ItemInformationCreateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        defaultMarketService = app.IoC.getNamed<DefaultMarketService>(Types.Service, Targets.Service.DefaultMarketService);
        itemInformationService = app.IoC.getNamed<ItemInformationService>(Types.Service, Targets.Service.model.ItemInformationService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);
        listingItemTemplateService = app.IoC.getNamed<ListingItemTemplateService>(Types.Service, Targets.Service.model.ListingItemTemplateService);
        itemLocationService = app.IoC.getNamed<ItemLocationService>(Types.Service, Targets.Service.model.ItemLocationService);
        locationMarkerService = app.IoC.getNamed<LocationMarkerService>(Types.Service, Targets.Service.model.LocationMarkerService);
        shippingDestinationService = app.IoC.getNamed<ShippingDestinationService>(Types.Service, Targets.Service.model.ShippingDestinationService);
        imageService = app.IoC.getNamed<ImageService>(Types.Service, Targets.Service.model.ImageService);

        profile = await profileService.getDefault().then(value => value.toJSON());
        market = await defaultMarketService.getDefaultForProfile(profile.id).then(value => value.toJSON());

        randomImageData = await testDataService.generateRandomImage(10, 10);

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            false,              // generateItemInformation
            false,              // generateItemLocation
            false,              // generateShippingDestinations
            false,              // generateImages
            false,              // generatePaymentInformation
            false,              // generateEscrow
            false,              // generateItemPrice
            false,              // generateMessagingInformation
            false,              // generateListingItemObjects
            false,              // generateObjectDatas
            profile.id,         // profileId
            false,              // generateListingItem
            market.id           // marketId
        ]).toParamsArray();

        const listingItemTemplates: resources.ListingItemTemplate[] = await testDataService.generate({
            model: CreatableModel.LISTINGITEMTEMPLATE,          // what to generate
            amount: 1,                                          // how many to generate
            withRelated: true,                                  // return model
            generateParams: generateListingItemTemplateParams   // what kind of data to generate
        } as TestDataGenerateRequest);

        listingItemTemplate = listingItemTemplates[0];
    });

    afterAll(async () => {
        //
    });

    test('Should throw ValidationException because we want to create a empty ItemInformation', async () => {
        expect.assertions(1);
        await itemInformationService.create({} as ItemInformationCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should throw ValidationException because there is no listing_item_id or listing_item_template_id', async () => {
        expect.assertions(1);
        await itemInformationService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new ItemInformation', async () => {

        testData = await generateItemInformationCreateRequest(false);
        testData.listing_item_template_id = listingItemTemplate.id;
        itemInformation = await itemInformationService.create(testData).then(value => value.toJSON());
        const result: resources.ItemInformation = itemInformation;

        expect(result.title).toBe(testData.title);
        expect(result.shortDescription).toBe(testData.shortDescription);
        expect(result.longDescription).toBe(testData.longDescription);
        expect(result.ItemCategory.key).toBe(testData.itemCategory.key);
        expect(result.ItemLocation.country).toBe(testData.itemLocation.country);
        expect(result.ItemLocation.address).toBe(testData.itemLocation.address);
        expect(result.ItemLocation.LocationMarker.title).toBe(testData.itemLocation.locationMarker.title);
        expect(result.ItemLocation.LocationMarker.description).toBe(testData.itemLocation.locationMarker.description);
        expect(result.ItemLocation.LocationMarker.lat).toBe(testData.itemLocation.locationMarker.lat);
        expect(result.ItemLocation.LocationMarker.lng).toBe(testData.itemLocation.locationMarker.lng);
        expect(result.ShippingDestinations).toHaveLength(1);
        expect(result.Images).toHaveLength(0);

    });

    test('Should list ItemInformations with our new create one', async () => {
        const itemInformations: resources.ItemInformation[] = await itemInformationService.findAll().then(value => value.toJSON());
        expect(itemInformations.length).toBe(1);

        const result = itemInformations[0];

        expect(result.title).toBe(testData.title);
        expect(result.shortDescription).toBe(testData.shortDescription);
        expect(result.longDescription).toBe(testData.longDescription);
        expect(result.ItemCategory).toBe(undefined); // doesnt fetch related
        expect(result.ItemLocation).toBe(undefined); // doesnt fetch related
        expect(result.ShippingDestinations).toBe(undefined); // doesnt fetch related
        expect(result.Images).toBe(undefined); // doesnt fetch related
    });

    test('Should return one ItemInformation', async () => {
        itemInformation = await itemInformationService.findOne(itemInformation.id).then(value => value.toJSON());
        const result: resources.ItemInformation = itemInformation;

        expect(result.title).toBe(testData.title);
        expect(result.shortDescription).toBe(testData.shortDescription);
        expect(result.longDescription).toBe(testData.longDescription);
        expect(result.ItemCategory.key).toBe(testData.itemCategory.key);
        expect(result.ItemLocation.country).toBe(testData.itemLocation.country);
        expect(result.ItemLocation.address).toBe(testData.itemLocation.address);
        expect(result.ItemLocation.LocationMarker.title).toBe(testData.itemLocation.locationMarker.title);
        expect(result.ItemLocation.LocationMarker.description).toBe(testData.itemLocation.locationMarker.description);
        expect(result.ItemLocation.LocationMarker.lat).toBe(testData.itemLocation.locationMarker.lat);
        expect(result.ItemLocation.LocationMarker.lng).toBe(testData.itemLocation.locationMarker.lng);
        expect(result.ShippingDestinations).toHaveLength(1);
        expect(result.Images).toHaveLength(0);
    });

    test('Should throw ValidationException because missing title', async () => {
        expect.assertions(1);
        await itemInformationService.update(itemInformation.id, {
            shortDescription: 'fail',
            longDescription: 'fail'
        } as ItemInformationUpdateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should update the ItemInformation', async () => {

        const newRandomCategory: resources.ItemCategory = await testDataService.getRandomCategory();

        const testDataUpdated = {
            title: 'updated',
            shortDescription: 'updated',
            longDescription: 'updated',
            itemCategory: {
                key: newRandomCategory.key
            } as ItemCategoryUpdateRequest,
            itemLocation: {
                country: Faker.random.arrayElement(Object.getOwnPropertyNames(ShippingCountries.countryCodeList)),
                address: Faker.address.streetAddress(),
                description: Faker.lorem.paragraph(),
                locationMarker: {
                    lat: _.random(-50, 50),
                    lng: _.random(-50, 50),
                    title: Faker.lorem.word(),
                    description: Faker.lorem.sentence()
                } as LocationMarkerCreateRequest
            } as ItemLocationCreateRequest,
            shippingDestinations: [{
                country: Faker.random.arrayElement(Object.getOwnPropertyNames(ShippingCountries.countryCodeList)),
                shippingAvailability: ShippingAvailability.SHIPS
            }] as ShippingDestinationCreateRequest[],
            images: [{
                data: [{
                    // when we receive ListingItemAddMessage -> ProtocolDSN.SMSG
                    // when we receive ListingItemImageAddMessage -> ProtocolDSN.LOCAL
                    protocol: ProtocolDSN.LOCAL,
                    encoding: 'BASE64',
                    imageVersion: ImageVersions.ORIGINAL.propName,
                    data: randomImageData
                }] as ImageDataCreateRequest[],
                featured: false
            }] as ImageCreateRequest[]
        } as ItemInformationUpdateRequest;

        // update image hash
        testDataUpdated.images[0].hash = ConfigurableHasher.hash({
            data: testDataUpdated.images[0].data[0].data
        }, new HashableImageCreateRequestConfig());
        testDataUpdated.images[0].data[0].imageHash = testDataUpdated.images[0].hash;

        const result: resources.ItemInformation = await itemInformationService.update(itemInformation.id, testDataUpdated).then(value => value.toJSON());

        expect(result.title).toBe(testDataUpdated.title);
        expect(result.shortDescription).toBe(testDataUpdated.shortDescription);
        expect(result.longDescription).toBe(testDataUpdated.longDescription);
        expect(result.ItemCategory.key).toBe(testDataUpdated.itemCategory.key);

        itemInformation = result;
    });

    test('Should delete the ItemInformation', async () => {

        // log.debug('itemInformation: ', JSON.stringify(itemInformation, null, 2));
        expect.assertions(6);
        await itemInformationService.destroy(itemInformation.id);

        await itemInformationService.findOne(itemInformation.id).catch(e =>
            expect(e).toEqual(new NotFoundException(itemInformation.id))
        );

        // itemLocation
        await itemLocationService.findOne(itemInformation.ItemLocation.id).catch(e =>
            expect(e).toEqual(new NotFoundException(itemInformation.ItemLocation.id))
        );

        // LocationMarker
        await locationMarkerService.findOne(itemInformation.ItemLocation.LocationMarker.id).catch(e =>
            expect(e).toEqual(new NotFoundException(itemInformation.ItemLocation.LocationMarker.id))
        );

        // ShippingDestinations
        await shippingDestinationService.findOne(itemInformation.ShippingDestinations[0].id).catch(e =>
            expect(e).toEqual(new NotFoundException(itemInformation.ShippingDestinations[0].id))
        );

        // Images
        await imageService.findOne(itemInformation.Images[0].id).catch(e =>
            expect(e).toEqual(new NotFoundException(itemInformation.Images[0].id))
        );

        // delete listing item
        await listingItemTemplateService.destroy(listingItemTemplate.id);
        await listingItemTemplateService.findOne(listingItemTemplate.id).catch(e =>
            expect(e).toEqual(new NotFoundException(listingItemTemplate.id))
        );
    });

    const generateItemInformationCreateRequest = async (withImage: boolean = false): Promise<ItemInformationCreateRequest> => {
        const randomCategory: resources.ItemCategory = await testDataService.getRandomCategory();
        let itemImages: ImageCreateRequest[] = [];

        if (withImage) {
            itemImages = [{
                data: [{
                    // when we receive ListingItemAddMessage -> ProtocolDSN.SMSG
                    // when we receive ListingItemImageAddMessage -> ProtocolDSN.LOCAL
                    protocol: ProtocolDSN.LOCAL,
                    encoding: 'BASE64',
                    imageVersion: ImageVersions.ORIGINAL.propName,
                    data: randomImageData
                }] as ImageDataCreateRequest[],
                featured: false
            }] as ImageCreateRequest[];

            const hash = ConfigurableHasher.hash(itemImages[0], new HashableImageCreateRequestConfig());
            itemImages[0].hash = hash;
            itemImages[0].data[0].dataId = 'https://particl.io/images/' + hash;
        }

        const createRequest = {
            title: Faker.random.words(4),
            shortDescription: Faker.random.words(10),
            longDescription: Faker.random.words(30),
            itemCategory: {
                key: randomCategory.key
            } as ItemCategoryCreateRequest,
            itemLocation: {
                country: Faker.random.arrayElement(Object.getOwnPropertyNames(ShippingCountries.countryCodeList)),
                address: Faker.address.streetAddress(),
                description: Faker.lorem.paragraph(),
                locationMarker: {
                    lat: _.random(-50, 50),
                    lng: _.random(-50, 50),
                    title: Faker.lorem.word(),
                    description: Faker.lorem.sentence()
                } as LocationMarkerCreateRequest
            } as ItemLocationCreateRequest,
            shippingDestinations: [{
                country: Faker.random.arrayElement(Object.getOwnPropertyNames(ShippingCountries.countryCodeList)),
                shippingAvailability: ShippingAvailability.SHIPS
            }] as ShippingDestinationCreateRequest[],
            images: itemImages
        } as ItemInformationCreateRequest;

        return createRequest;
    };


});
