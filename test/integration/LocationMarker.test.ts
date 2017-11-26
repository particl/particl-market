import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { LocationMarker } from '../../src/api/models/LocationMarker';

import { LocationMarkerService } from '../../src/api/services/LocationMarkerService';

describe('LocationMarker', () => {

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let locationMarkerService: LocationMarkerService;

    let createdId;

    const testData = {
        markerTitle: 'Helsinki',
        markerText: 'Helsinki',
        lat: 12.1234,
        lng: 23.2314
    };

    const testDataUpdated = {
        markerTitle: 'Stockholm',
        markerText: 'Stockholm',
        lat: 34.2314,
        lng: 11.1234
    };

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        locationMarkerService = app.IoC.getNamed<LocationMarkerService>(Types.Service, Targets.Service.LocationMarkerService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean([]);
    });

    afterAll(async () => {
        //
    });

    test('Should create a new location marker', async () => {
        const locationMarkerModel: LocationMarker = await locationMarkerService.create(testData);
        createdId = locationMarkerModel.Id;

        const result = locationMarkerModel.toJSON();

        expect(result.markerTitle).toBe(testData.markerTitle);
        expect(result.markerText).toBe(testData.markerText);
        expect(result.lat).toBe(testData.lat);
        expect(result.lng).toBe(testData.lng);
    });

    test('Should throw ValidationException because we want to create a empty location marker', async () => {
        expect.assertions(1);
        await locationMarkerService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list location markers with our new create one', async () => {
        const locationMarkerCollection = await locationMarkerService.findAll();
        const locationMarker = locationMarkerCollection.toJSON();
        expect(locationMarker.length).toBe(1);

        const result = locationMarker[0];

        expect(result.markerTitle).toBe(testData.markerTitle);
        expect(result.markerText).toBe(testData.markerText);
        expect(result.lat).toBe(testData.lat);
        expect(result.lng).toBe(testData.lng);
    });

    test('Should return one location marker', async () => {
        const locationMarkerModel: LocationMarker = await locationMarkerService.findOne(createdId);
        const result = locationMarkerModel.toJSON();

        expect(result.markerTitle).toBe(testData.markerTitle);
        expect(result.markerText).toBe(testData.markerText);
        expect(result.lat).toBe(testData.lat);
        expect(result.lng).toBe(testData.lng);
    });

    test('Should update the location marker', async () => {
        const locationMarkerModel: LocationMarker = await locationMarkerService.update(createdId, testDataUpdated);
        const result = locationMarkerModel.toJSON();

        expect(result.markerTitle).toBe(testDataUpdated.markerTitle);
        expect(result.markerText).toBe(testDataUpdated.markerText);
        expect(result.lat).toBe(testDataUpdated.lat);
        expect(result.lng).toBe(testDataUpdated.lng);
    });

    test('Should delete the location marker', async () => {
        expect.assertions(1);
        await locationMarkerService.destroy(createdId);
        await locationMarkerService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

});
