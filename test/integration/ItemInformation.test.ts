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
import { ProfileService } from '../../src/api/services/model/ProfileService';
import { ListingItemTemplateService } from '../../src/api/services/model/ListingItemTemplateService';
import { ItemLocationService } from '../../src/api/services/model/ItemLocationService';
import { LocationMarkerService } from '../../src/api/services/model/LocationMarkerService';
import { ShippingDestinationService } from '../../src/api/services/model/ShippingDestinationService';
import { ItemImageService } from '../../src/api/services/model/ItemImageService';
import { ItemInformationService } from '../../src/api/services/model/ItemInformationService';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { ItemInformation } from '../../src/api/models/ItemInformation';
import { ShippingAvailability } from '../../src/api/enums/ShippingAvailability';
import { ItemInformationCreateRequest } from '../../src/api/requests/model/ItemInformationCreateRequest';
import { ItemInformationUpdateRequest } from '../../src/api/requests/model/ItemInformationUpdateRequest';
import { ImageProcessing } from '../../src/core/helpers/ImageProcessing';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { ProtocolDSN } from 'omp-lib/dist/interfaces/dsn';
import { GenerateListingItemTemplateParams } from '../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { TestDataGenerateRequest } from '../../src/api/requests/testdata/TestDataGenerateRequest';
import { MarketService } from '../../src/api/services/model/MarketService';
import { ItemCategoryCreateRequest } from '../../src/api/requests/model/ItemCategoryCreateRequest';
import { LocationMarkerCreateRequest } from '../../src/api/requests/model/LocationMarkerCreateRequest';
import { ShippingDestinationCreateRequest } from '../../src/api/requests/model/ShippingDestinationCreateRequest';
import { ItemImageCreateRequest } from '../../src/api/requests/model/ItemImageCreateRequest';
import { ItemImageDataCreateRequest } from '../../src/api/requests/model/ItemImageDataCreateRequest';
import { ItemCategoryUpdateRequest } from '../../src/api/requests/model/ItemCategoryUpdateRequest';
import { ItemLocationCreateRequest } from '../../src/api/requests/model/ItemLocationCreateRequest';
import { LocationMarkerUpdateRequest } from '../../src/api/requests/model/LocationMarkerUpdateRequest';
import { ItemImageDataUpdateRequest } from '../../src/api/requests/model/ItemImageDataUpdateRequest';

describe('ItemInformation', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let itemInformationService: ItemInformationService;
    let profileService: ProfileService;
    let marketService: MarketService;
    let listingItemTemplateService: ListingItemTemplateService;
    let itemLocationService: ItemLocationService;
    let locationMarkerService: LocationMarkerService;
    let shippingDestinationService: ShippingDestinationService;
    let itemImageService: ItemImageService;

    let listingItemTemplate: resources.ListingItemTemplate;
    let itemInformation: resources.ItemInformation;
    let defaultMarket: resources.Market;
    let defaultProfile: resources.Profile;

    const testData = {
        title: 'item title1',
        shortDescription: 'item short desc1',
        longDescription: 'item long desc1',
        itemCategory: {
            key: 'cat_apparel_adult',
            name: 'Adult',
            description: ''
        } as ItemCategoryCreateRequest,
        itemLocation: {
            country: 'South Africa',
            address: 'asdf, asdf, asdf',
            locationMarker: {
                markerTitle: 'Helsinki',
                markerText: 'Helsinki',
                lat: 12.1234,
                lng: 23.2314
            } as LocationMarkerCreateRequest
        },
        shippingDestinations: [{
            country: 'United Kingdom',
            shippingAvailability: ShippingAvailability.DOES_NOT_SHIP
        }, {
            country: 'Asia',
            shippingAvailability: ShippingAvailability.SHIPS
        }, {
            country: 'South Africa',
            shippingAvailability: ShippingAvailability.ASK
        }] as ShippingDestinationCreateRequest[],
        itemImages: [{
            hash: 'imagehash4',
            data: [{
                dataId: 'http://xxx',
                protocol: ProtocolDSN.LOCAL,
                imageVersion: 'ORIGINAL',
                imageHash: '',
                encoding: 'BASE64',
                data: ImageProcessing.milkcat
            }] as ItemImageDataCreateRequest[]
        }] as ItemImageCreateRequest[]
    } as ItemInformationCreateRequest;

    const testDataUpdated = {
        title: 'item title2',
        shortDescription: 'item short desc2',
        longDescription: 'item long desc2',
        itemCategory: {
            key: 'cat_high_luxyry_items',
            name: 'Luxury Items',
            description: ''
        } as ItemCategoryUpdateRequest,
        itemLocation: {
            country: 'EU',
            address: 'zxcv, zxcv, zxcv',
            locationMarker: {
                markerTitle: 'Stockholm',
                markerText: 'Stockholm',
                lat: 34.2314,
                lng: 11.1234
            } as LocationMarkerUpdateRequest
        } as ItemLocationCreateRequest,
        shippingDestinations: [{
            country: 'Sweden',
            shippingAvailability: ShippingAvailability.DOES_NOT_SHIP
        }, {
            country: 'EU',
            shippingAvailability: ShippingAvailability.SHIPS
        }, {
            country: 'Finland',
            shippingAvailability: ShippingAvailability.ASK
        }] as ShippingDestinationCreateRequest[],
        itemImages: [{
            hash: 'imagehash4',
            data: [{
                dataId: 'http://xxx',
                protocol: ProtocolDSN.LOCAL,
                imageVersion: 'ORIGINAL',
                imageHash: '',
                encoding: 'BASE64',
                data: ImageProcessing.milkcat
            }] as ItemImageDataUpdateRequest[]
        }] as ItemImageCreateRequest[]
    } as ItemInformationUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        itemInformationService = app.IoC.getNamed<ItemInformationService>(Types.Service, Targets.Service.model.ItemInformationService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);
        listingItemTemplateService = app.IoC.getNamed<ListingItemTemplateService>(Types.Service, Targets.Service.model.ListingItemTemplateService);
        itemLocationService = app.IoC.getNamed<ItemLocationService>(Types.Service, Targets.Service.model.ItemLocationService);
        locationMarkerService = app.IoC.getNamed<LocationMarkerService>(Types.Service, Targets.Service.model.LocationMarkerService);
        shippingDestinationService = app.IoC.getNamed<ShippingDestinationService>(Types.Service, Targets.Service.model.ShippingDestinationService);
        itemImageService = app.IoC.getNamed<ItemImageService>(Types.Service, Targets.Service.model.ItemImageService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        defaultProfile = await profileService.getDefault().then(value => value.toJSON());
        defaultMarket = await marketService.getDefault().then(value => value.toJSON());

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            false,               // generateItemInformation
            false,               // generateItemLocation
            false,               // generateShippingDestinations
            false,              // generateItemImages
            false,               // generatePaymentInformation
            false,               // generateEscrow
            false,               // generateItemPrice
            false,               // generateMessagingInformation
            false,              // generateListingItemObjects
            false,              // generateObjectDatas
            defaultProfile.id,  // profileId
            false,               // generateListingItem
            defaultMarket.id    // marketId
        ]).toParamsArray();

        // generate two ListingItemTemplates with ListingItems
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

    test('Should throw ValidationException because there is no listing_item_id or listing_item_template_id', async () => {
        expect.assertions(1);
        await itemInformationService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new ItemInformation', async () => {

        testData.listing_item_template_id = listingItemTemplate.id;
        itemInformation = await itemInformationService.create(testData).then(value => value.toJSON());
        const result = itemInformation;

        expect(result.title).toBe(testData.title);
        expect(result.shortDescription).toBe(testData.shortDescription);
        expect(result.longDescription).toBe(testData.longDescription);
        expect(result.ItemCategory.name).toBe(testData.itemCategory.name);
        expect(result.ItemCategory.description).toBe(testData.itemCategory.description);
        expect(result.ItemLocation.country).toBe(testData.itemLocation.country);
        expect(result.ItemLocation.address).toBe(testData.itemLocation.address);
        expect(result.ItemLocation.LocationMarker.markerTitle).toBe(testData.itemLocation.locationMarker.markerTitle);
        expect(result.ItemLocation.LocationMarker.markerText).toBe(testData.itemLocation.locationMarker.markerText);
        expect(result.ItemLocation.LocationMarker.lat).toBe(testData.itemLocation.locationMarker.lat);
        expect(result.ItemLocation.LocationMarker.lng).toBe(testData.itemLocation.locationMarker.lng);
        expect(result.ShippingDestinations).toHaveLength(3);
        expect(result.ItemImages).toHaveLength(1);

    });

    test('Should throw ValidationException because we want to create a empty ItemInformation', async () => {
        expect.assertions(1);
        await itemInformationService.create({} as ItemInformationCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
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
        expect(result.ItemImages).toBe(undefined); // doesnt fetch related
    });

    test('Should return one ItemInformation', async () => {
        const itemInformationModel: ItemInformation = await itemInformationService.findOne(itemInformation.id);
        const result = itemInformationModel.toJSON();

        expect(result.title).toBe(testData.title);
        expect(result.shortDescription).toBe(testData.shortDescription);
        expect(result.longDescription).toBe(testData.longDescription);
        expect(result.ItemCategory.name).toBe(testData.itemCategory.name);
        expect(result.ItemCategory.description).toBe(testData.itemCategory.description);
        expect(result.ItemLocation.country).toBe(testData.itemLocation.country);
        expect(result.ItemLocation.address).toBe(testData.itemLocation.address);
        expect(result.ItemLocation.LocationMarker.markerTitle).toBe(testData.itemLocation.locationMarker.markerTitle);
        expect(result.ItemLocation.LocationMarker.markerText).toBe(testData.itemLocation.locationMarker.markerText);
        expect(result.ItemLocation.LocationMarker.lat).toBe(testData.itemLocation.locationMarker.lat);
        expect(result.ItemLocation.LocationMarker.lng).toBe(testData.itemLocation.locationMarker.lng);
        expect(result.ShippingDestinations).toHaveLength(3);
        expect(result.ItemImages).toHaveLength(1);
    });

    test('Should throw ValidationException because there is no listing_item_id or listing_item_template_id', async () => {
        expect.assertions(1);
        await itemInformationService.update(itemInformation.id, testDataUpdated).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should update the ItemInformation', async () => {

        testDataUpdated['listing_item_template_id'] = listingItemTemplate.id;

        itemInformation = await itemInformationService.update(itemInformation.id, testDataUpdated).then(value => value.toJSON());
        const result = itemInformation;

        expect(result.title).toBe(testDataUpdated.title);
        expect(result.shortDescription).toBe(testDataUpdated.shortDescription);
        expect(result.longDescription).toBe(testDataUpdated.longDescription);
        expect(result.ItemCategory.name).toBe(testDataUpdated.itemCategory.name);
        expect(result.ItemCategory.description).toBe(testDataUpdated.itemCategory.description);
        expect(result.ItemLocation.country).toBe(testDataUpdated.itemLocation.country);
        expect(result.ItemLocation.address).toBe(testDataUpdated.itemLocation.address);
        expect(result.ItemLocation.LocationMarker.markerTitle).toBe(testDataUpdated.itemLocation.locationMarker.markerTitle);
        expect(result.ItemLocation.LocationMarker.markerText).toBe(testDataUpdated.itemLocation.locationMarker.markerText);
        expect(result.ItemLocation.LocationMarker.lat).toBe(testDataUpdated.itemLocation.locationMarker.lat);
        expect(result.ItemLocation.LocationMarker.lng).toBe(testDataUpdated.itemLocation.locationMarker.lng);
        expect(result.ShippingDestinations).toHaveLength(3);
        expect(result.ItemImages).toHaveLength(1);
    });

    test('Should delete the ItemInformation', async () => {
        expect.assertions(8);
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
        await shippingDestinationService.findOne(itemInformation.ShippingDestinations[1].id).catch(e =>
            expect(e).toEqual(new NotFoundException(itemInformation.ShippingDestinations[1].id))
        );
        await shippingDestinationService.findOne(itemInformation.ShippingDestinations[2].id).catch(e =>
            expect(e).toEqual(new NotFoundException(itemInformation.ShippingDestinations[2].id))
        );

        // ItemImages
        await itemImageService.findOne(itemInformation.ItemImages[0].id).catch(e =>
            expect(e).toEqual(new NotFoundException(itemInformation.ItemImages[0].id))
        );

        // delete listing item
        await listingItemTemplateService.destroy(listingItemTemplate.id);
        await listingItemTemplateService.findOne(listingItemTemplate.id).catch(e =>
            expect(e).toEqual(new NotFoundException(listingItemTemplate.id))
        );
    });

});
