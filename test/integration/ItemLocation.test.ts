import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';

import { TestDataService } from '../../src/api/services/TestDataService';
import { ListingItemService } from '../../src/api/services/ListingItemService';
import { ItemInformationService } from '../../src/api/services/ItemInformationService';
import { ItemLocationService } from '../../src/api/services/ItemLocationService';
import { MarketService } from '../../src/api/services/MarketService';
import { LocationMarkerService } from '../../src/api/services/LocationMarkerService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { ItemLocation } from '../../src/api/models/ItemLocation';
import { ListingItem } from '../../src/api/models/ListingItem';
import { ItemInformation } from '../../src/api/models/ItemInformation';

import { TestDataCreateRequest } from '../../src/api/requests/TestDataCreateRequest';
import { ItemLocationCreateRequest } from '../../src/api/requests/ItemLocationCreateRequest';
import { ItemLocationUpdateRequest } from '../../src/api/requests/ItemLocationUpdateRequest';

describe('ItemLocation', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let itemLocationService: ItemLocationService;
    let marketService: MarketService;
    let listingItemService: ListingItemService;
    let itemInformationService: ItemInformationService;
    let locationMarkerService: LocationMarkerService;

    let createdId;
    let itemInformation;
    let createdListingItem;

    const testData = {
        item_information_id: null,
        region: 'South Africa',
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
        region: 'EU',
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
        itemLocationService = app.IoC.getNamed<ItemLocationService>(Types.Service, Targets.Service.ItemLocationService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.MarketService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.ListingItemService);
        itemInformationService = app.IoC.getNamed<ItemInformationService>(Types.Service, Targets.Service.ItemInformationService);
        locationMarkerService = app.IoC.getNamed<LocationMarkerService>(Types.Service, Targets.Service.LocationMarkerService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();


        // create market
        let defaultMarket = await marketService.getDefault();
        defaultMarket = defaultMarket.toJSON();

        createdListingItem = await testDataService.create<ListingItem>({
            model: 'listingitem',
            data: {
                market_id: defaultMarket.id,
                hash: 'itemhash'
            } as any,
            withRelated: true
        } as TestDataCreateRequest);

        // create iteminformation
        itemInformation = await testDataService.create<ItemInformation>({
            model: 'iteminformation',
            data: {
                listing_item_id: createdListingItem.id,
                title: 'TEST TITLE',
                shortDescription: 'TEST SHORT DESCRIPTION',
                longDescription: 'TEST LONG DESCRIPTION',
                itemCategory: {
                    key: 'cat_high_luxyry_items',
                    name: 'Luxury Items',
                    description: ''
                }
            } as any,
                withRelated: true
        } as TestDataCreateRequest);
    });


    afterAll(async () => {
        //
    });

    test('Should throw ValidationException because there is no item_information_id', async () => {
        expect.assertions(1);
        await itemLocationService.create(testData as ItemLocationCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new item location', async () => {
        // set the itemInformation id
        testData.item_information_id = itemInformation.id;

        const itemLocationModel: ItemLocation = await itemLocationService.create(testData as ItemLocationCreateRequest);
        createdId = itemLocationModel.Id;

        const result = itemLocationModel.toJSON();

        expect(result.region).toBe(testData.region);
        expect(result.address).toBe(testData.address);
        expect(result.LocationMarker.markerTitle).toBe(testData.locationMarker.markerTitle);
        expect(result.LocationMarker.markerText).toBe(testData.locationMarker.markerText);
        expect(result.LocationMarker.lat).toBe(testData.locationMarker.lat);
        expect(result.LocationMarker.lng).toBe(testData.locationMarker.lng);
    });

    test('Should throw ValidationException because we want to create a empty item location', async () => {
        expect.assertions(1);
        await itemLocationService.create({} as ItemLocationCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list item locations with our new create one', async () => {
        const itemLocationCollection = await itemLocationService.findAll();
        const itemLocation = itemLocationCollection.toJSON();
        expect(itemLocation.length).toBe(1);

        const result = itemLocation[0];

        expect(result.region).toBe(testData.region);
        expect(result.address).toBe(testData.address);
        expect(result.LocationMarker).toBe(undefined); // doesnt fetch related
    });

    test('Should return one item location', async () => {
        const itemLocationModel: ItemLocation = await itemLocationService.findOne(createdId);
        const result = itemLocationModel.toJSON();
        expect(result.region).toBe(testData.region);
        expect(result.address).toBe(testData.address);
        expect(result.LocationMarker.markerTitle).toBe(testData.locationMarker.markerTitle);
        expect(result.LocationMarker.markerText).toBe(testData.locationMarker.markerText);
        expect(result.LocationMarker.lat).toBe(testData.locationMarker.lat);
        expect(result.LocationMarker.lng).toBe(testData.locationMarker.lng);
    });

    test('Should throw ValidationException because wer are trying to update with no item_information_id', async () => {
        expect.assertions(1);
        await itemLocationService.update(createdId, testDataUpdated as ItemLocationUpdateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should update the item location', async () => {
        // set the itemInformation id
        testDataUpdated.item_information_id = itemInformation.id;

        const itemLocationModel: ItemLocation = await itemLocationService.update(createdId, testDataUpdated as ItemLocationUpdateRequest);
        const result = itemLocationModel.toJSON();
        expect(result.region).toBe(testDataUpdated.region);
        expect(result.address).toBe(testDataUpdated.address);
        expect(result.LocationMarker.markerTitle).toBe(testDataUpdated.locationMarker.markerTitle);
        expect(result.LocationMarker.markerText).toBe(testDataUpdated.locationMarker.markerText);
        expect(result.LocationMarker.lat).toBe(testDataUpdated.locationMarker.lat);
        expect(result.LocationMarker.lng).toBe(testDataUpdated.locationMarker.lng);
    });

    test('Should delete the item location', async () => {
        expect.assertions(3);
        // delete listing item
        await listingItemService.destroy(createdListingItem.id);
        await listingItemService.findOne(createdListingItem.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdListingItem.id))
        );
        // delete itemInformation
        await itemInformationService.findOne(itemInformation.id).catch(e =>
            expect(e).toEqual(new NotFoundException(itemInformation.id))
        );
        // delete item location
        await itemLocationService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

    test('Should not have location markers because locationItem has been deleted', async () => {
        const bidData = await locationMarkerService.findAll();
        expect(bidData.length).toBe(0);
    });

});
