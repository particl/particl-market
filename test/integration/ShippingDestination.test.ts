// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { ShippingDestination } from '../../src/api/models/ShippingDestination';
import { ShippingAvailability } from '../../src/api/enums/ShippingAvailability';
import { ItemLocationService } from '../../src/api/services/ItemLocationService';
import { LocationMarkerService } from '../../src/api/services/LocationMarkerService';
import { ShippingDestinationService } from '../../src/api/services/ShippingDestinationService';
import { ItemImageService } from '../../src/api/services/ItemImageService';
import { ItemInformationService } from '../../src/api/services/ItemInformationService';
import { ListingItemTemplateService } from '../../src/api/services/ListingItemTemplateService';
import { ListingItemService } from '../../src/api/services/ListingItemService';
import { ShippingDestinationCreateRequest } from '../../src/api/requests/ShippingDestinationCreateRequest';
import { ShippingDestinationUpdateRequest } from '../../src/api/requests/ShippingDestinationUpdateRequest';
import { GenerateListingItemParams } from '../../src/api/requests/params/GenerateListingItemParams';
import { GenerateListingItemTemplateParams } from '../../src/api/requests/params/GenerateListingItemTemplateParams';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { TestDataGenerateRequest } from '../../src/api/requests/TestDataGenerateRequest';
import * as resources from 'resources';

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

    let listingItem: resources.ListingItem;
    let listingItemTemplate: resources.ListingItemTemplate;
    let destinationForListingItemTemplate: resources.ShippingDestination;
    let destinationForListingItem: resources.ShippingDestination;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        shippingDestinationService = app.IoC.getNamed<ShippingDestinationService>(Types.Service, Targets.Service.ShippingDestinationService);
        listingItemTemplateService = app.IoC.getNamed<ListingItemTemplateService>(Types.Service, Targets.Service.ListingItemTemplateService);
        itemInformationService = app.IoC.getNamed<ItemInformationService>(Types.Service, Targets.Service.ItemInformationService);
        itemLocationService = app.IoC.getNamed<ItemLocationService>(Types.Service, Targets.Service.ItemLocationService);
        locationMarkerService = app.IoC.getNamed<LocationMarkerService>(Types.Service, Targets.Service.LocationMarkerService);
        itemImageService = app.IoC.getNamed<ItemImageService>(Types.Service, Targets.Service.ItemImageService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.ListingItemService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        let generateParams = new GenerateListingItemParams([
            true,   // generateItemInformation
            false,   // generateShippingDestinations
            false,   // generateItemImages
            false,   // generatePaymentInformation
            false,   // generateEscrow
            false,   // generateItemPrice
            false,   // generateMessagingInformation
            false    // generateListingItemObjects
        ]).toParamsArray();

        // create listingitem without ShippingDestinations and store its id for testing
        const listingItems = await testDataService.generate({
            model: CreatableModel.LISTINGITEM,  // what to generate
            amount: 1,                          // how many to generate
            withRelated: true,                  // return model
            generateParams                      // what kind of data to generate
        } as TestDataGenerateRequest);
        listingItem = listingItems[0];

        generateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
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
        const shippingDestinationModel: ShippingDestination = await shippingDestinationService.create(testData);
        destinationForListingItemTemplate = shippingDestinationModel.toJSON();
        const result = destinationForListingItemTemplate;

        expect(result.country).toBe(testData.country);
        expect(result.shippingAvailability).toBe(testData.shippingAvailability);
    });

    test('Should create a new ShippingDestination for ListingItem', async () => {

        testData.item_information_id = listingItem.ItemInformation.id;
        const shippingDestinationModel: ShippingDestination = await shippingDestinationService.create(testData);
        destinationForListingItem = shippingDestinationModel.toJSON();
        const result = destinationForListingItem;

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
        const shippingDestinationCollection = await shippingDestinationService.findAll();
        const shippingDestination = shippingDestinationCollection.toJSON();
        expect(shippingDestination.length).toBe(2);

        const result = shippingDestination[0];

        expect(result.country).toBe(testData.country);
        expect(result.shippingAvailability).toBe(testData.shippingAvailability);
    });

    test('Should return one ShippingDestination related to ListingItemTemplate', async () => {
        const shippingDestinationModel: ShippingDestination = await shippingDestinationService.findOne(destinationForListingItemTemplate.id);
        const result = shippingDestinationModel.toJSON();

        expect(result.country).toBe(testData.country);
        expect(result.shippingAvailability).toBe(testData.shippingAvailability);
        expect(result.ItemInformation.ListingItemTemplate).toBeDefined();
    });

    test('Should return the other ShippingDestination related to ListingItem', async () => {
        const shippingDestinationModel: ShippingDestination = await shippingDestinationService.findOne(destinationForListingItem.id);
        const result = shippingDestinationModel.toJSON();

        expect(result.country).toBe(testData.country);
        expect(result.shippingAvailability).toBe(testData.shippingAvailability);
        expect(result.ItemInformation.ListingItem).toBeDefined();
    });

    test('Should fail to update and throw ValidationException because there is no item_information_id', async () => {
        expect.assertions(1);
        await shippingDestinationService.update(destinationForListingItem.id, testDataUpdated).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should update the ShippingDestination related to ListingItemTemplate', async () => {
        testDataUpdated.item_information_id = listingItemTemplate.ItemInformation.id;
        const shippingDestinationModel: ShippingDestination = await shippingDestinationService.update(destinationForListingItemTemplate.id, testDataUpdated);
        const result = shippingDestinationModel.toJSON();

        expect(result.country).toBe(testDataUpdated.country);
        expect(result.shippingAvailability).toBe(testDataUpdated.shippingAvailability);
    });

    test('Should update the ShippingDestination related to ListingItem', async () => {
        testDataUpdated.item_information_id = listingItem.ItemInformation.id;
        const shippingDestinationModel: ShippingDestination = await shippingDestinationService.update(destinationForListingItem.id, testDataUpdated);
        const result = shippingDestinationModel.toJSON();

        expect(result.country).toBe(testDataUpdated.country);
        expect(result.shippingAvailability).toBe(testDataUpdated.shippingAvailability);
    });

    test('Should delete the ShippingDestination related to ListingItemTemplate', async () => {
        expect.assertions(5);
        await shippingDestinationService.destroy(destinationForListingItemTemplate.id);
        await shippingDestinationService.findOne(destinationForListingItemTemplate.id).catch(e =>
            expect(e).toEqual(new NotFoundException(destinationForListingItemTemplate.id))
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

    test('Should delete the ShippingDestination related to ListingItem', async () => {
        expect.assertions(5);

        await shippingDestinationService.destroy(destinationForListingItem.id);
        await shippingDestinationService.findOne(destinationForListingItem.id).catch(e =>
            expect(e).toEqual(new NotFoundException(destinationForListingItem.id))
        );

        await listingItemService.destroy(listingItem.id);
        await listingItemService.findOne(listingItem.id).catch(e =>
            expect(e).toEqual(new NotFoundException(listingItem.id))
        );

        const ItemInformation = listingItem.ItemInformation;
        await itemInformationService.findOne(ItemInformation.id).catch(e =>
            expect(e).toEqual(new NotFoundException(ItemInformation.id))
        );

        const createdItemLocation = ItemInformation.ItemLocation;
        const createdLocationMarker = ItemInformation.ItemLocation.LocationMarker;

        await itemLocationService.findOne(createdItemLocation.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdItemLocation.id))
        );

        await locationMarkerService.findOne(createdLocationMarker.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdLocationMarker.id))
        );
    });

});
