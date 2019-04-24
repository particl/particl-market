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
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { ShippingAvailability } from '../../src/api/enums/ShippingAvailability';
import { ItemLocationService } from '../../src/api/services/model/ItemLocationService';
import { LocationMarkerService } from '../../src/api/services/model/LocationMarkerService';
import { ShippingDestinationService } from '../../src/api/services/model/ShippingDestinationService';
import { ItemImageService } from '../../src/api/services/model/ItemImageService';
import { ItemInformationService } from '../../src/api/services/model/ItemInformationService';
import { ListingItemTemplateService } from '../../src/api/services/model/ListingItemTemplateService';
import { ListingItemService } from '../../src/api/services/model/ListingItemService';
import { ShippingDestinationCreateRequest } from '../../src/api/requests/model/ShippingDestinationCreateRequest';
import { ShippingDestinationUpdateRequest } from '../../src/api/requests/model/ShippingDestinationUpdateRequest';
import { GenerateListingItemTemplateParams } from '../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { TestDataGenerateRequest } from '../../src/api/requests/testdata/TestDataGenerateRequest';

describe('ShippingDestination', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let shippingDestinationService: ShippingDestinationService;
    let listingItemTemplateService: ListingItemTemplateService;
    let itemInformationService: ItemInformationService;
    let itemLocationService: ItemLocationService;
    let locationMarkerService: LocationMarkerService;
    let itemImageService: ItemImageService;

    let listingItemService: ListingItemService;

    const testData = {
        country: 'United Kingdom',
        shippingAvailability: ShippingAvailability.DOES_NOT_SHIP
    } as ShippingDestinationCreateRequest;

    const testDataUpdated = {
        country: 'EU',
        shippingAvailability: ShippingAvailability.SHIPS
    } as ShippingDestinationUpdateRequest;

    let listingItemTemplate: resources.ListingItemTemplate;
    let shippingDestination: resources.ShippingDestination;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        shippingDestinationService = app.IoC.getNamed<ShippingDestinationService>(Types.Service, Targets.Service.model.ShippingDestinationService);
        listingItemTemplateService = app.IoC.getNamed<ListingItemTemplateService>(Types.Service, Targets.Service.model.ListingItemTemplateService);
        itemInformationService = app.IoC.getNamed<ItemInformationService>(Types.Service, Targets.Service.model.ItemInformationService);
        itemLocationService = app.IoC.getNamed<ItemLocationService>(Types.Service, Targets.Service.model.ItemLocationService);
        locationMarkerService = app.IoC.getNamed<LocationMarkerService>(Types.Service, Targets.Service.model.LocationMarkerService);
        itemImageService = app.IoC.getNamed<ItemImageService>(Types.Service, Targets.Service.model.ItemImageService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.model.ListingItemService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        const generateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            false,  // generateShippingDestinations
            false,   // generateItemImages
            false,   // generatePaymentInformation
            false,   // generateEscrow
            false,   // generateItemPrice
            false,   // generateMessagingInformation
            false    // generateListingItemObjects
        ]).toParamsArray();

        // create listingitemtemplate without ShippingDestinations and store its id for testing
        const listingItemTemplates = await testDataService.generate({
            model: CreatableModel.LISTINGITEMTEMPLATE,  // what to generate
            amount: 1,                                  // how many to generate
            withRelated: true,                          // return model
            generateParams                              // what kind of data to generate
        } as TestDataGenerateRequest);
        listingItemTemplate = listingItemTemplates[0];
    });

    afterAll(async () => {
        //
    });

    test('Should fail to create and throw ValidationException because there is no item_information_id', async () => {
        expect.assertions(1);
        await shippingDestinationService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new ShippingDestination for ListingItemTemplate', async () => {

        testData.item_information_id = listingItemTemplate.ItemInformation.id;
        shippingDestination = await shippingDestinationService.create(testData).then(value => value.toJSON());
        const result = shippingDestination;

        expect(result.country).toBe(testData.country);
        expect(result.shippingAvailability).toBe(testData.shippingAvailability);
    });

    test('Should throw ValidationException because we want to create a empty ShippingDestination', async () => {
        expect.assertions(1);
        await shippingDestinationService.create({} as ShippingDestinationCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list ShippingDestination', async () => {
        const shippingDestinations: resources.ShippingDestination[] = await shippingDestinationService.findAll().then(value => value.toJSON());
        expect(shippingDestinations.length).toBe(1);

        const result = shippingDestinations[0];

        expect(result.country).toBe(testData.country);
        expect(result.shippingAvailability).toBe(testData.shippingAvailability);
    });

    test('Should return one ShippingDestination related to ListingItemTemplate', async () => {
        shippingDestination = await shippingDestinationService.findOne(shippingDestination.id).then(value => value.toJSON());
        const result = shippingDestination;

        expect(result.country).toBe(testData.country);
        expect(result.shippingAvailability).toBe(testData.shippingAvailability);
        expect(result.ItemInformation.ListingItemTemplate).toBeDefined();
    });

    test('Should fail to update and throw ValidationException because there is no item_information_id', async () => {
        expect.assertions(1);
        await shippingDestinationService.update(shippingDestination.id, testDataUpdated).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should update the ShippingDestination related to ListingItemTemplate', async () => {
        testDataUpdated.item_information_id = listingItemTemplate.ItemInformation.id;
        shippingDestination = await shippingDestinationService.update(shippingDestination.id, testDataUpdated)
            .then(value => value.toJSON());
        const result = shippingDestination;

        expect(result.country).toBe(testDataUpdated.country);
        expect(result.shippingAvailability).toBe(testDataUpdated.shippingAvailability);
    });

    test('Should delete the ShippingDestination related to ListingItemTemplate', async () => {
        expect.assertions(5);
        await shippingDestinationService.destroy(shippingDestination.id);
        await shippingDestinationService.findOne(shippingDestination.id).catch(e =>
            expect(e).toEqual(new NotFoundException(shippingDestination.id))
        );

        // delete listing-item-template
        await listingItemTemplateService.destroy(listingItemTemplate.id);
        await listingItemTemplateService.findOne(listingItemTemplate.id).catch(e =>
            expect(e).toEqual(new NotFoundException(listingItemTemplate.id))
        );

        const ItemInformation = listingItemTemplate.ItemInformation;
        await itemInformationService.findOne(ItemInformation.id).catch(e =>
            expect(e).toEqual(new NotFoundException(ItemInformation.id))
        );

        const createdItemLocation = ItemInformation.ItemLocation;
        const createdLocationMarker = ItemInformation.ItemLocation.LocationMarker;

        // itemLocation
        await itemLocationService.findOne(createdItemLocation.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdItemLocation.id))
        );

        // LocationMarker
        await locationMarkerService.findOne(createdLocationMarker.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdLocationMarker.id))
        );
    });


});
