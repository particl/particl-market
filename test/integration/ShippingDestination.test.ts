import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { ShippingDestination } from '../../src/api/models/ShippingDestination';
import { ShippingAvailability } from '../../src/api/enums/ShippingAvailability';
import { Country } from '../../src/api/enums/Country';

import { ShippingDestinationService } from '../../src/api/services/ShippingDestinationService';

describe('ShippingDestination', () => {

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let shippingDestinationService: ShippingDestinationService;

    let createdId;

    const testData = {
        country: Country.UNITED_KINGDOM,
        shippingAvailability: ShippingAvailability.DOES_NOT_SHIP
    };

    const testDataUpdated = {
        country: Country.EU,
        shippingAvailability: ShippingAvailability.SHIPS
    };

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        shippingDestinationService = app.IoC.getNamed<ShippingDestinationService>(Types.Service, Targets.Service.ShippingDestinationService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean([]);
    });

    afterAll(async () => {
        //
    });

    test('Should create a new shipping destination', async () => {
        const shippingDestinationModel: ShippingDestination = await shippingDestinationService.create(testData);
        createdId = shippingDestinationModel.Id;

        const result = shippingDestinationModel.toJSON();

        expect(result.country).toBe(testData.country);
        expect(result.shippingAvailability).toBe(testData.shippingAvailability);
    });

    test('Should throw ValidationException because we want to create a empty shipping destination', async () => {
        expect.assertions(1);
        await shippingDestinationService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list shipping destinations with our new create one', async () => {
        const shippingDestinationCollection = await shippingDestinationService.findAll();
        const shippingDestination = shippingDestinationCollection.toJSON();
        expect(shippingDestination.length).toBe(1);

        const result = shippingDestination[0];

        expect(result.country).toBe(testData.country);
        expect(result.shippingAvailability).toBe(testData.shippingAvailability);
    });

    test('Should return one shipping destination', async () => {
        const shippingDestinationModel: ShippingDestination = await shippingDestinationService.findOne(createdId);
        const result = shippingDestinationModel.toJSON();

        expect(result.country).toBe(testData.country);
        expect(result.shippingAvailability).toBe(testData.shippingAvailability);
    });

    test('Should update the shipping destination', async () => {
        const shippingDestinationModel: ShippingDestination = await shippingDestinationService.update(createdId, testDataUpdated);
        const result = shippingDestinationModel.toJSON();

        expect(result.country).toBe(testDataUpdated.country);
        expect(result.shippingAvailability).toBe(testDataUpdated.shippingAvailability);
    });

    test('Should delete the shipping destination', async () => {
        expect.assertions(1);
        await shippingDestinationService.destroy(createdId);
        await shippingDestinationService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

});
