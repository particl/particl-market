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
import { ListingItemService } from '../../src/api/services/model/ListingItemService';
import { ItemInformationService } from '../../src/api/services/model/ItemInformationService';
import { ItemLocationService } from '../../src/api/services/model/ItemLocationService';
import { MarketService } from '../../src/api/services/model/MarketService';
import { LocationMarkerService } from '../../src/api/services/model/LocationMarkerService';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { ItemLocationCreateRequest } from '../../src/api/requests/model/ItemLocationCreateRequest';
import { ItemLocationUpdateRequest } from '../../src/api/requests/model/ItemLocationUpdateRequest';
import { ProfileService } from '../../src/api/services/model/ProfileService';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { TestDataGenerateRequest } from '../../src/api/requests/testdata/TestDataGenerateRequest';
import { GenerateListingItemParams } from '../../src/api/requests/testdata/GenerateListingItemParams';
import { LocationMarkerCreateRequest } from '../../src/api/requests/model/LocationMarkerCreateRequest';
import { LocationMarkerUpdateRequest } from '../../src/api/requests/model/LocationMarkerUpdateRequest';

describe('ItemLocation', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let itemLocationService: ItemLocationService;
    let marketService: MarketService;
    let profileService: ProfileService;
    let listingItemService: ListingItemService;
    let itemInformationService: ItemInformationService;
    let locationMarkerService: LocationMarkerService;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;
    let listingItem: resources.ListingItem;
    let itemLocation: resources.ItemLocation;

    const testData = {
        country: 'South Africa',
        address: 'asdf, asdf, asdf',
        description: 'desc',
        locationMarker: {
            markerTitle: 'Helsinki',
            markerText: 'Helsinki',
            lat: 12.1234,
            lng: 23.2314
        } as LocationMarkerCreateRequest
    } as ItemLocationCreateRequest;

    const testDataUpdated = {
        country: 'EU',
        address: 'zxcv, zxcv, zxcv',
        description: 'desc',
        locationMarker: {
            markerTitle: 'Stockholm',
            markerText: 'Stockholm',
            lat: 34.2314,
            lng: 11.1234
        } as LocationMarkerUpdateRequest
    } as ItemLocationUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        itemLocationService = app.IoC.getNamed<ItemLocationService>(Types.Service, Targets.Service.model.ItemLocationService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.model.ListingItemService);
        itemInformationService = app.IoC.getNamed<ItemInformationService>(Types.Service, Targets.Service.model.ItemInformationService);
        locationMarkerService = app.IoC.getNamed<LocationMarkerService>(Types.Service, Targets.Service.model.LocationMarkerService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        defaultProfile = await profileService.getDefault().then(value => value.toJSON());
        defaultMarket = await marketService.getDefault().then(value => value.toJSON());

        // create ListingItem without ItemLocation
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

    });

    test('Should throw ValidationException because there is no item_information_id', async () => {
        expect.assertions(1);
        await itemLocationService.create(testData as ItemLocationCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should throw ValidationException because we want to create a empty ItemLocation', async () => {
        expect.assertions(1);
        await itemLocationService.create({} as ItemLocationCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new ItemLocation', async () => {
        testData.item_information_id = listingItem.ItemInformation.id;

        itemLocation = await itemLocationService.create(testData as ItemLocationCreateRequest).then(value => value.toJSON());
        const result = itemLocation;

        expect(result.country).toBe(testData.country);
        expect(result.address).toBe(testData.address);
        expect(result.LocationMarker.markerTitle).toBe(testData.locationMarker.markerTitle);
        expect(result.LocationMarker.markerText).toBe(testData.locationMarker.markerText);
        expect(result.LocationMarker.lat).toBe(testData.locationMarker.lat);
        expect(result.LocationMarker.lng).toBe(testData.locationMarker.lng);
    });


    test('Should list ItemLocations with our newly created one', async () => {
        const itemLocations: resources.ItemLocation[] = await itemLocationService.findAll().then(value => value.toJSON());
        expect(itemLocations.length).toBe(1);

        const result = itemLocations[0];
        expect(result.country).toBe(testData.country);
        expect(result.address).toBe(testData.address);
        expect(result.LocationMarker).toBe(undefined); // doesnt fetch related
    });

    test('Should return one ItemLocation', async () => {
        itemLocation = await itemLocationService.findOne(itemLocation.id).then(value => value.toJSON());

        const result = itemLocation;
        expect(result.country).toBe(testData.country);
        expect(result.address).toBe(testData.address);
        expect(result.LocationMarker.markerTitle).toBe(testData.locationMarker.markerTitle);
        expect(result.LocationMarker.markerText).toBe(testData.locationMarker.markerText);
        expect(result.LocationMarker.lat).toBe(testData.locationMarker.lat);
        expect(result.LocationMarker.lng).toBe(testData.locationMarker.lng);
    });

    test('Should update the ItemLocation', async () => {
        itemLocation = await itemLocationService.update(itemLocation.id, testDataUpdated).then(value => value.toJSON());

        const result = itemLocation;
        expect(result.country).toBe(testDataUpdated.country);
        expect(result.address).toBe(testDataUpdated.address);
        expect(result.LocationMarker.markerTitle).toBe(testDataUpdated.locationMarker.markerTitle);
        expect(result.LocationMarker.markerText).toBe(testDataUpdated.locationMarker.markerText);
        expect(result.LocationMarker.lat).toBe(testDataUpdated.locationMarker.lat);
        expect(result.LocationMarker.lng).toBe(testDataUpdated.locationMarker.lng);
    });

    test('Should delete the ItemLocation', async () => {
        expect.assertions(3);
        // delete ListingItem
        await listingItemService.destroy(listingItem.id);
        await listingItemService.findOne(listingItem.id).catch(e =>
            expect(e).toEqual(new NotFoundException(listingItem.id))
        );
        // delete ItemInformation
        await itemInformationService.findOne(listingItem.ItemInformation.id).catch(e =>
            expect(e).toEqual(new NotFoundException(listingItem.ItemInformation.id))
        );
        // delete ItemLocation
        await itemLocationService.findOne(itemLocation.id).catch(e =>
            expect(e).toEqual(new NotFoundException(itemLocation.id))
        );
    });

    test('Should not have LocationMarkers because ItemLocation has been deleted', async () => {
        const itemLocations: resources.ItemLocation[] = await locationMarkerService.findAll().then(value => value.toJSON());
        expect(itemLocations.length).toBe(0);
    });

});
