// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
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
import { ItemLocation } from '../../src/api/models/ItemLocation';
import { ItemLocationCreateRequest } from '../../src/api/requests/model/ItemLocationCreateRequest';
import { ItemLocationUpdateRequest } from '../../src/api/requests/model/ItemLocationUpdateRequest';
import * as resources from 'resources';
import { ProfileService } from '../../src/api/services/model/ProfileService';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { TestDataGenerateRequest } from '../../src/api/requests/testdata/TestDataGenerateRequest';
import { GenerateListingItemParams } from '../../src/api/requests/testdata/GenerateListingItemParams';

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
    let createdListingItem: resources.ListingItem;

    let createdId;
    let itemInformation;

    const testData = {
        country: 'South Africa',
        address: 'asdf, asdf, asdf',
        locationMarker: {
            markerTitle: 'Helsinki',
            markerText: 'Helsinki',
            lat: 12.1234,
            lng: 23.2314
        }
    } as ItemLocationCreateRequest;

    const testDataUpdated = {
        item_information_id: null,
        country: 'EU',
        address: 'zxcv, zxcv, zxcv',
        locationMarker: {
            markerTitle: 'Stockholm',
            markerText: 'Stockholm',
            lat: 34.2314,
            lng: 11.1234
        }
    };

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

        // get default profile
        const defaultProfileModel = await profileService.getDefault();
        defaultProfile = defaultProfileModel.toJSON();

        // get market
        const defaultMarketModel = await marketService.getDefault();
        defaultMarket = defaultMarketModel.toJSON();

        // create ListingItem without ItemLocation
        const generateParams = new GenerateListingItemParams([
            true,                               // generateItemInformation
            true,                               // generateItemLocation
            true,                               // generateShippingDestinations
            false,                              // generateItemImages
            true,                               // generatePaymentInformation
            true,                               // generateEscrow
            true,                               // generateItemPrice
            true,                               // generateMessagingInformation
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
        createdListingItem = listingItems[0];
        itemInformation = createdListingItem.ItemInformation;

        await itemLocationService.destroy(itemInformation.ItemLocation.id);
        const listingItemModel = await listingItemService.findOne(createdListingItem.id);
        createdListingItem = listingItemModel.toJSON();

    });

    test('Should throw ValidationException because there is no item_information_id', async () => {
        expect.assertions(1);
        await itemLocationService.create(testData as ItemLocationCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new ItemLocation', async () => {
        // set the itemInformation id
        testData.item_information_id = itemInformation.id;

        const itemLocationModel: ItemLocation = await itemLocationService.create(testData as ItemLocationCreateRequest);
        createdId = itemLocationModel.Id;

        const result = itemLocationModel.toJSON();

        expect(result.country).toBe(testData.country);
        expect(result.address).toBe(testData.address);
        expect(result.LocationMarker.markerTitle).toBe(testData.locationMarker.markerTitle);
        expect(result.LocationMarker.markerText).toBe(testData.locationMarker.markerText);
        expect(result.LocationMarker.lat).toBe(testData.locationMarker.lat);
        expect(result.LocationMarker.lng).toBe(testData.locationMarker.lng);
    });

    test('Should throw ValidationException because we want to create a empty ItemLocation', async () => {
        expect.assertions(1);
        await itemLocationService.create({} as ItemLocationCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list ItemLocations with our newly created one', async () => {
        const itemLocationCollection = await itemLocationService.findAll();
        const itemLocation = itemLocationCollection.toJSON();
        expect(itemLocation.length).toBe(1);

        const result = itemLocation[0];

        expect(result.country).toBe(testData.country);
        expect(result.address).toBe(testData.address);
        expect(result.LocationMarker).toBe(undefined); // doesnt fetch related
    });

    test('Should return one ItemLocation', async () => {
        const itemLocationModel: ItemLocation = await itemLocationService.findOne(createdId);
        const result = itemLocationModel.toJSON();
        expect(result.country).toBe(testData.country);
        expect(result.address).toBe(testData.address);
        expect(result.LocationMarker.markerTitle).toBe(testData.locationMarker.markerTitle);
        expect(result.LocationMarker.markerText).toBe(testData.locationMarker.markerText);
        expect(result.LocationMarker.lat).toBe(testData.locationMarker.lat);
        expect(result.LocationMarker.lng).toBe(testData.locationMarker.lng);
    });

    test('Should throw ValidationException because we are trying to update with no item_information_id', async () => {
        expect.assertions(1);
        await itemLocationService.update(createdId, testDataUpdated as ItemLocationUpdateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should update the ItemLocation', async () => {
        // set the itemInformation id
        testDataUpdated.item_information_id = itemInformation.id;

        const itemLocationModel: ItemLocation = await itemLocationService.update(createdId, testDataUpdated as ItemLocationUpdateRequest);
        const result = itemLocationModel.toJSON();
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
        await listingItemService.destroy(createdListingItem.id);
        await listingItemService.findOne(createdListingItem.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdListingItem.id))
        );
        // delete ItemInformation
        await itemInformationService.findOne(itemInformation.id).catch(e =>
            expect(e).toEqual(new NotFoundException(itemInformation.id))
        );
        // delete ItemLocation
        await itemLocationService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

    test('Should not have LocationMarkers because ItemLocation has been deleted', async () => {
        const bidData = await locationMarkerService.findAll();
        expect(bidData.length).toBe(0);
    });

});
