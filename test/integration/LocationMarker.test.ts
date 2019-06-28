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
import { LocationMarkerService } from '../../src/api/services/model/LocationMarkerService';
import { ProfileService } from '../../src/api/services/model/ProfileService';
import { ListingItemTemplateService } from '../../src/api/services/model/ListingItemTemplateService';
import { ItemLocationService } from '../../src/api/services/model/ItemLocationService';
import { ItemInformationService } from '../../src/api/services/model/ItemInformationService';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { LocationMarker } from '../../src/api/models/LocationMarker';
import { LocationMarkerCreateRequest } from '../../src/api/requests/model/LocationMarkerCreateRequest';
import { LocationMarkerUpdateRequest } from '../../src/api/requests/model/LocationMarkerUpdateRequest';
import { GenerateListingItemTemplateParams } from '../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { TestDataGenerateRequest } from '../../src/api/requests/testdata/TestDataGenerateRequest';
import { MarketService } from '../../src/api/services/model/MarketService';

describe('LocationMarker', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let locationMarkerService: LocationMarkerService;
    let profileService: ProfileService;
    let marketService: MarketService;
    let listingItemTemplateService: ListingItemTemplateService;
    let itemInformationService: ItemInformationService;
    let itemLocationService: ItemLocationService;

    let listingItemTemplate: resources.ListingItemTemplate;
    let locationMarker: resources.LocationMarker;
    let defaultMarket: resources.Market;
    let defaultProfile: resources.Profile;

    const testData = {
        title: 'Helsinki',
        description: 'Helsinki',
        lat: 12.1234,
        lng: 23.2314
    } as LocationMarkerCreateRequest;

    const testDataUpdated = {
        title: 'Stockholm',
        description: 'Stockholm',
        lat: 34.2314,
        lng: 11.1234
    } as LocationMarkerUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        locationMarkerService = app.IoC.getNamed<LocationMarkerService>(Types.Service, Targets.Service.model.LocationMarkerService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);
        itemLocationService = app.IoC.getNamed<ItemLocationService>(Types.Service, Targets.Service.model.ItemLocationService);
        listingItemTemplateService = app.IoC.getNamed<ListingItemTemplateService>(Types.Service, Targets.Service.model.ListingItemTemplateService);
        itemInformationService = app.IoC.getNamed<ItemInformationService>(Types.Service, Targets.Service.model.ItemInformationService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        defaultProfile = await profileService.getDefault().then(value => value.toJSON());
        defaultMarket = await marketService.getDefault().then(value => value.toJSON());

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,               // generateItemInformation
            true,               // generateItemLocation
            true,               // generateShippingDestinations
            false,              // generateItemImages
            true,               // generatePaymentInformation
            true,               // generateEscrow
            false,              // generateItemPrice
            true,               // generateMessagingInformation
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

    test('Should throw ValidationException because there is no item_location_id', async () => {
        expect.assertions(1);
        await locationMarkerService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new LocationMarker', async () => {
        testData['item_location_id'] = listingItemTemplate.ItemInformation.ItemLocation.id;
        locationMarker = await locationMarkerService.create(testData).then(value => value.toJSON());
        const result: resources.LocationMarker = locationMarker;

        expect(result.title).toBe(testData.title);
        expect(result.description).toBe(testData.description);
        expect(result.lat).toBe(testData.lat);
        expect(result.lng).toBe(testData.lng);
        expect(result.itemLocationId).toBe(listingItemTemplate.ItemInformation.ItemLocation.id);
    });

    test('Should throw ValidationException because we want to create a empty LocationMarker', async () => {
        expect.assertions(1);
        await locationMarkerService.create({} as LocationMarkerCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list LocationMarkers with our new create one', async () => {
        const locationMarkers: resources.LocationMarker[] = await locationMarkerService.findAll().then(value => value.toJSON());
        expect(locationMarkers.length).toBe(1);

        const result = locationMarkers[0];

        expect(result.title).toBe(testData.title);
        expect(result.description).toBe(testData.description);
        expect(result.lat).toBe(testData.lat);
        expect(result.lng).toBe(testData.lng);
        expect(result.itemLocationId).toBe(listingItemTemplate.ItemInformation.ItemLocation.id);
    });

    test('Should return one LocationMarker', async () => {
        const locationMarkerModel: LocationMarker = await locationMarkerService.findOne(locationMarker.id);
        const result = locationMarkerModel.toJSON();

        expect(result.title).toBe(testData.title);
        expect(result.description).toBe(testData.description);
        expect(result.lat).toBe(testData.lat);
        expect(result.lng).toBe(testData.lng);
        expect(result.itemLocationId).toBe(listingItemTemplate.ItemInformation.ItemLocation.id);
    });

    test('Should update the LocationMarker', async () => {
        testDataUpdated['item_location_id'] = listingItemTemplate.ItemInformation.ItemLocation.id;
        const locationMarkerModel: LocationMarker = await locationMarkerService.update(locationMarker.id, testDataUpdated);
        const result = locationMarkerModel.toJSON();

        expect(result.title).toBe(testDataUpdated.title);
        expect(result.description).toBe(testDataUpdated.description);
        expect(result.lat).toBe(testDataUpdated.lat);
        expect(result.lng).toBe(testDataUpdated.lng);
        expect(result.itemLocationId).toBe(listingItemTemplate.ItemInformation.ItemLocation.id);
    });

    test('Should delete the LocationMarker', async () => {
        expect.assertions(1);
        await locationMarkerService.destroy(locationMarker.id);
        await locationMarkerService.findOne(locationMarker.id).catch(e =>
            expect(e).toEqual(new NotFoundException(locationMarker.id))
        );
    });

});
