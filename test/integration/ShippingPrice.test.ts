import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { ShippingPrice } from '../../src/api/models/ShippingPrice';

import { ShippingPriceService } from '../../src/api/services/ShippingPriceService';

describe('ShippingPrice', () => {

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let shippingPriceService: ShippingPriceService;

    let createdId;

    const testData = {
        domestic: 2.12,
        international: 4.2
    };

    const testDataUpdated = {
        domestic: 1.2,
        international: 3.4
    };

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        shippingPriceService = app.IoC.getNamed<ShippingPriceService>(Types.Service, Targets.Service.ShippingPriceService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean([]);
    });

    afterAll(async () => {
        //
    });

    test('Should throw ValidationException because there is no item_price_id', async () => {
        expect.assertions(1);
        await shippingPriceService.create(testDataUpdated).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new shipping price', async () => {
        testData['item_price_id'] = 0;
        const shippingPriceModel: ShippingPrice = await shippingPriceService.create(testData);
        createdId = shippingPriceModel.Id;

        const result = shippingPriceModel.toJSON();

        expect(result.domestic).toBe(testData.domestic);
        expect(result.international).toBe(testData.international);
    });

    test('Should throw ValidationException because we want to create a empty shipping price', async () => {
        expect.assertions(1);
        await shippingPriceService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list shipping prices with our new create one', async () => {
        const shippingPriceCollection = await shippingPriceService.findAll();
        const shippingPrice = shippingPriceCollection.toJSON();
        expect(shippingPrice.length).toBe(1);

        const result = shippingPrice[0];

        expect(result.domestic).toBe(testData.domestic);
        expect(result.international).toBe(testData.international);
    });

    test('Should return one shipping price', async () => {
        const shippingPriceModel: ShippingPrice = await shippingPriceService.findOne(createdId);
        const result = shippingPriceModel.toJSON();

        expect(result.domestic).toBe(testData.domestic);
        expect(result.international).toBe(testData.international);
    });

    test('Should throw ValidationException because there is no item_price_id', async () => {
        expect.assertions(1);
        await shippingPriceService.update(createdId, testDataUpdated).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should update the shipping price', async () => {
        testDataUpdated['item_price_id'] = 0;
        const shippingPriceModel: ShippingPrice = await shippingPriceService.update(createdId, testDataUpdated);
        const result = shippingPriceModel.toJSON();

        expect(result.domestic).toBe(testDataUpdated.domestic);
        expect(result.international).toBe(testDataUpdated.international);
    });

    test('Should delete the shipping price', async () => {
        expect.assertions(1);
        await shippingPriceService.destroy(createdId);
        await shippingPriceService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

});
