import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { ShippingDestination } from '../../src/api/models/ShippingDestination';
import { ShippingAvailability } from '../../src/api/enums/ShippingAvailability';

import { ShippingDestinationService } from '../../src/api/services/ShippingDestinationService';

import { MarketService } from '../../src/api/services/MarketService';
import { ListingItemService } from '../../src/api/services/ListingItemService';
import { ItemInformationService } from '../../src/api/services/ItemInformationService';
import { ShippingDestinationCreateRequest } from '../../src/api/requests/ShippingDestinationCreateRequest';
import { ShippingDestinationUpdateRequest } from '../../src/api/requests/ShippingDestinationUpdateRequest';
import { GenerateListingItemParams } from '../../src/api/requests/params/GenerateListingItemParams';
import { GenerateListingItemTemplateParams } from '../../src/api/requests/params/GenerateListingItemTemplateParams';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { TestDataGenerateRequest } from '../../src/api/requests/TestDataGenerateRequest';

describe('ShippingDestination', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let shippingDestinationService: ShippingDestinationService;
    let marketService: MarketService;
    let listingItemService: ListingItemService;
    let itemInformationService: ItemInformationService;

    const testData = {
        country: 'United Kingdom',
        shippingAvailability: ShippingAvailability.DOES_NOT_SHIP
    } as ShippingDestinationCreateRequest;

    const testDataUpdated = {
        country: 'EU',
        shippingAvailability: ShippingAvailability.SHIPS
    } as ShippingDestinationUpdateRequest;

    let createdListingItem;
    let createdListingItemTemplate;
    let createdTemplateShippingDestinationId;
    let createdListingItemShippingDestinationId;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        shippingDestinationService = app.IoC.getNamed<ShippingDestinationService>(Types.Service, Targets.Service.ShippingDestinationService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.MarketService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.ListingItemService);
        itemInformationService = app.IoC.getNamed<ItemInformationService>(Types.Service, Targets.Service.ItemInformationService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        let generateParams = new GenerateListingItemParams([
            true,   // generateItemInformation
            false,   // generateShippingDestinations
            true,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            true    // generateListingItemObjects
        ]).toParamsArray();

        // create listingitem without ShippingDestinations and store its id for testing
        const listingItems = await testDataService.generate({
            model: CreatableModel.LISTINGITEM,  // what to generate
            amount: 1,                          // how many to generate
            withRelated: true,                  // return model
            generateParams                      // what kind of data to generate
        } as TestDataGenerateRequest);
        createdListingItem = listingItems[0].toJSON();

        generateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            false,  // generateShippingDestinations
            true,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            true    // generateListingItemObjects
        ]).toParamsArray();

        // create listingitemtemplate without ShippingDestinations and store its id for testing
        const listingItemTemplates = await testDataService.generate({
            model: CreatableModel.LISTINGITEMTEMPLATE,  // what to generate
            amount: 1,                                  // how many to generate
            withRelated: true,                          // return model
            generateParams                              // what kind of data to generate
        } as TestDataGenerateRequest);
        createdListingItemTemplate = listingItemTemplates[0].toJSON();

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

    test('Should create a new shipping destination for template', async () => {

        testData.item_information_id = createdListingItemTemplate.ItemInformation.id;
        const shippingDestinationModel: ShippingDestination = await shippingDestinationService.create(testData);
        createdTemplateShippingDestinationId = shippingDestinationModel.Id;
        const result = shippingDestinationModel.toJSON();

        expect(result.country).toBe(testData.country);
        expect(result.shippingAvailability).toBe(testData.shippingAvailability);
    });

    test('Should create a new shipping destination for listing item', async () => {

        testData.item_information_id = createdListingItem.ItemInformation.id;
        const shippingDestinationModel: ShippingDestination = await shippingDestinationService.create(testData);
        createdListingItemShippingDestinationId = shippingDestinationModel.Id;
        const result = shippingDestinationModel.toJSON();

        expect(result.country).toBe(testData.country);
        expect(result.shippingAvailability).toBe(testData.shippingAvailability);
    });

    test('Should throw ValidationException because we want to create a empty shipping destination', async () => {
        expect.assertions(1);
        await shippingDestinationService.create({} as ShippingDestinationCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list shipping destinations', async () => {
        const shippingDestinationCollection = await shippingDestinationService.findAll();
        const shippingDestination = shippingDestinationCollection.toJSON();
        expect(shippingDestination.length).toBe(2);

        const result = shippingDestination[0];

        expect(result.country).toBe(testData.country);
        expect(result.shippingAvailability).toBe(testData.shippingAvailability);
    });

    test('Should return one shipping destination related to template', async () => {
        const shippingDestinationModel: ShippingDestination = await shippingDestinationService.findOne(createdTemplateShippingDestinationId);
        const result = shippingDestinationModel.toJSON();

        expect(result.country).toBe(testData.country);
        expect(result.shippingAvailability).toBe(testData.shippingAvailability);
        expect(result.ItemInformation.ListingItem).toMatchObject({});
        expect(result.ItemInformation.ListingItemTemplate).toBeDefined();
    });

    test('Should return the other shipping destination related to listing item', async () => {
        const shippingDestinationModel: ShippingDestination = await shippingDestinationService.findOne(createdListingItemShippingDestinationId);
        const result = shippingDestinationModel.toJSON();

        expect(result.country).toBe(testData.country);
        expect(result.shippingAvailability).toBe(testData.shippingAvailability);
        expect(result.ItemInformation.ListingItem).toBeDefined();
        expect(result.ItemInformation.ListingItemTemplate).toMatchObject({});
    });

    test('Should fail to update and throw ValidationException because there is no item_information_id', async () => {
        expect.assertions(1);
        await shippingDestinationService.update(createdListingItemShippingDestinationId, testDataUpdated).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should update the shipping destination related to template', async () => {
        testDataUpdated.item_information_id = createdListingItemTemplate.ItemInformation.id;
        const shippingDestinationModel: ShippingDestination = await shippingDestinationService.update(createdTemplateShippingDestinationId, testDataUpdated);
        const result = shippingDestinationModel.toJSON();

        expect(result.country).toBe(testDataUpdated.country);
        expect(result.shippingAvailability).toBe(testDataUpdated.shippingAvailability);
    });

    test('Should update the shipping destination related to listing item', async () => {
        testDataUpdated.item_information_id = createdListingItem.ItemInformation.id;
        const shippingDestinationModel: ShippingDestination = await shippingDestinationService.update(createdListingItemShippingDestinationId, testDataUpdated);
        const result = shippingDestinationModel.toJSON();

        expect(result.country).toBe(testDataUpdated.country);
        expect(result.shippingAvailability).toBe(testDataUpdated.shippingAvailability);
    });

    test('Should delete the shipping destination related to template', async () => {
        expect.assertions(1);
        await shippingDestinationService.destroy(createdTemplateShippingDestinationId);
        await shippingDestinationService.findOne(createdTemplateShippingDestinationId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdTemplateShippingDestinationId))
        );
    });

    test('Should delete the shipping destination related to listing item', async () => {
        expect.assertions(1);
        await shippingDestinationService.destroy(createdListingItemShippingDestinationId);
        await shippingDestinationService.findOne(createdListingItemShippingDestinationId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdListingItemShippingDestinationId))
        );
    });

});
