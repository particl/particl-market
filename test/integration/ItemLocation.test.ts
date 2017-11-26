import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { ItemLocation } from '../../src/api/models/ItemLocation';
import { Country } from '../../src/api/enums/Country';

import { ItemLocationService } from '../../src/api/services/ItemLocationService';

describe('ItemLocation', () => {

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let itemLocationService: ItemLocationService;

    let createdId;

    const testData = {
        region: Country.SOUTH_AFRICA,
        address: 'asdf, asdf, asdf',
        locationMarker: {
            markerTitle: 'Helsinki',
            markerText: 'Helsinki',
            lat: 12.1234,
            lng: 23.2314
        }
    };

    const testDataUpdated = {
        region: Country.EU,
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

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean([]);
    });

    afterAll(async () => {
        //
    });

    test('Should create a new item location', async () => {
        const itemLocationModel: ItemLocation = await itemLocationService.create(testData);
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
        await itemLocationService.create({}).catch(e =>
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

    test('Should update the item location', async () => {
        const itemLocationModel: ItemLocation = await itemLocationService.update(createdId, testDataUpdated);
        const result = itemLocationModel.toJSON();

        expect(result.region).toBe(testDataUpdated.region);
        expect(result.address).toBe(testDataUpdated.address);
        expect(result.LocationMarker.markerTitle).toBe(testDataUpdated.locationMarker.markerTitle);
        expect(result.LocationMarker.markerText).toBe(testDataUpdated.locationMarker.markerText);
        expect(result.LocationMarker.lat).toBe(testDataUpdated.locationMarker.lat);
        expect(result.LocationMarker.lng).toBe(testDataUpdated.locationMarker.lng);
    });

    test('Should delete the item location', async () => {
        expect.assertions(1);
        await itemLocationService.destroy(createdId);
        await itemLocationService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

});
