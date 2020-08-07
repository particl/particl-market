// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import * as Faker from 'faker';
import * as _ from 'lodash';
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
import { LocationMarkerCreateRequest } from '../../src/api/requests/model/LocationMarkerCreateRequest';
import { LocationMarkerUpdateRequest } from '../../src/api/requests/model/LocationMarkerUpdateRequest';
import { DefaultMarketService } from '../../src/api/services/DefaultMarketService';
import { GenerateListingItemTemplateParams } from '../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { ShippingCountries } from '../../src/core/helpers/ShippingCountries';

describe('ItemLocation', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let defaultMarketService: DefaultMarketService;
    let itemLocationService: ItemLocationService;
    let marketService: MarketService;
    let profileService: ProfileService;
    let listingItemService: ListingItemService;
    let itemInformationService: ItemInformationService;
    let locationMarkerService: LocationMarkerService;

    let profile: resources.Profile;
    let market: resources.Market;
    let listingItemTemplate: resources.ListingItemTemplate;
    let itemLocation: resources.ItemLocation;

    const testData = {
        country: Faker.random.arrayElement(Object.getOwnPropertyNames(ShippingCountries.countryCodeList)),
        address: Faker.address.streetAddress(),
        description: Faker.lorem.paragraph(),
        locationMarker: {
            title: Faker.lorem.word(),
            description: Faker.lorem.sentence(),
            lat: _.random(-50, 50),
            lng: _.random(-50, 50)
        } as LocationMarkerCreateRequest
    } as ItemLocationCreateRequest;

    const testDataUpdated = {
        country: Faker.random.arrayElement(Object.getOwnPropertyNames(ShippingCountries.countryCodeList)),
        address: Faker.address.streetAddress(),
        description: Faker.lorem.paragraph(),
        locationMarker: {
            title: Faker.lorem.word(),
            description: Faker.lorem.sentence(),
            lat: _.random(-50, 50),
            lng: _.random(-50, 50)
        } as LocationMarkerUpdateRequest
    } as ItemLocationUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        defaultMarketService = app.IoC.getNamed<DefaultMarketService>(Types.Service, Targets.Service.DefaultMarketService);
        itemLocationService = app.IoC.getNamed<ItemLocationService>(Types.Service, Targets.Service.model.ItemLocationService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.model.ListingItemService);
        itemInformationService = app.IoC.getNamed<ItemInformationService>(Types.Service, Targets.Service.model.ItemInformationService);
        locationMarkerService = app.IoC.getNamed<LocationMarkerService>(Types.Service, Targets.Service.model.LocationMarkerService);

        profile = await profileService.getDefault().then(value => value.toJSON());
        market = await defaultMarketService.getDefaultForProfile(profile.id).then(value => value.toJSON());

        // create ListingItemTemplate without ItemLocation
        const templateGenerateParams = new GenerateListingItemTemplateParams([
            true,                   // generateItemInformation
            false,                  // generateItemLocation
            false,                  // generateShippingDestinations
            false,                  // generateItemImages
            true,                   // generatePaymentInformation
            false,                  // generateEscrow
            false,                  // generateItemPrice
            true,                   // generateMessagingInformation
            false,                  // generateListingItemObjects
            false,                  // generateObjectDatas
            profile.id,             // profileId
            false,                  // generateListingItem
            market.id               // soldOnMarketId
        ]).toParamsArray();

        // log.debug('templateGenerateParams:', JSON.stringify(templateGenerateParams, null, 2));

        const listingItemTemplates = await testDataService.generate({
            model: CreatableModel.LISTINGITEMTEMPLATE,
            amount: 1,
            withRelated: true,
            generateParams: templateGenerateParams
        } as TestDataGenerateRequest);
        listingItemTemplate = listingItemTemplates[0];

    });

    test('Should throw ValidationException because we want to create a empty ItemLocation', async () => {
        expect.assertions(1);
        await itemLocationService.create({} as ItemLocationCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should throw ValidationException because there is no item_information_id', async () => {
        expect.assertions(1);
        await itemLocationService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new ItemLocation', async () => {
        expect(listingItemTemplate.ItemInformation.ItemLocation).toEqual({});

        testData.item_information_id = listingItemTemplate.ItemInformation.id;
        const result: resources.ItemLocation = await itemLocationService.create(testData).then(value => value.toJSON());
        expect(result.country).toBe(testData.country);
        expect(result.address).toBe(testData.address);
        expect(result.LocationMarker.title).toBe(testData.locationMarker.title);
        expect(result.LocationMarker.description).toBe(testData.locationMarker.description);
        expect(result.LocationMarker.lat).toBe(testData.locationMarker.lat);
        expect(result.LocationMarker.lng).toBe(testData.locationMarker.lng);
        expect(result.ItemInformation.id).toBe(testData.item_information_id);
        itemLocation = result;
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
        const result: resources.itemLocation = await itemLocationService.findOne(itemLocation.id).then(value => value.toJSON());
        expect(result.country).toBe(testData.country);
        expect(result.address).toBe(testData.address);
        expect(result.LocationMarker.title).toBe(testData.locationMarker.title);
        expect(result.LocationMarker.description).toBe(testData.locationMarker.description);
        expect(result.LocationMarker.lat).toBe(testData.locationMarker.lat);
        expect(result.LocationMarker.lng).toBe(testData.locationMarker.lng);
        itemLocation = result;
    });

    test('Should update the ItemLocation', async () => {
        const result: resources.itemLocation = await itemLocationService.update(itemLocation.id, testDataUpdated).then(value => value.toJSON());
        expect(result.country).toBe(testDataUpdated.country);
        expect(result.address).toBe(testDataUpdated.address);
        expect(result.LocationMarker.title).toBe(testDataUpdated.locationMarker.title);
        expect(result.LocationMarker.description).toBe(testDataUpdated.locationMarker.description);
        expect(result.LocationMarker.lat).toBe(testDataUpdated.locationMarker.lat);
        expect(result.LocationMarker.lng).toBe(testDataUpdated.locationMarker.lng);
        itemLocation = result;
    });

    test('Should delete the ItemLocation', async () => {
        expect.assertions(1);
        await itemLocationService.destroy(itemLocation.id);
        await itemLocationService.findOne(itemLocation.id).catch(e =>
            expect(e).toEqual(new NotFoundException(itemLocation.id))
        );
    });

    test('Should not have any LocationMarkers because ItemLocations have been deleted', async () => {
        const itemLocations: resources.ItemLocation[] = await locationMarkerService.findAll().then(value => value.toJSON());
        expect(itemLocations.length).toBe(0);
    });

});
