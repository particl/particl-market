import { app } from '../../../src/app';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { Types, Core, Targets } from '../../../src/constants';
import { TestUtil } from '../lib/TestUtil';
import { TestDataService } from '../../../src/api/services/TestDataService';

import { ValidationException } from '../../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../../src/api/exceptions/NotFoundException';

import { Order } from '../../../src/api/models/Order';

import { OrderService } from '../../../src/api/services/OrderService';

describe('Order', () => {

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let orderService: OrderService;

    let createdId;

    const testData = {
        hash: undefined // TODO: Add test value
    };

    const testDataUpdated = {
        hash: undefined // TODO: Add test value
    };

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        orderService = app.IoC.getNamed<OrderService>(Types.Service, Targets.Service.OrderService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean([]);
    });

    afterAll(async () => {
        //
    });

    /*
    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await orderService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });
    */

    test('Should create a new order', async () => {
        // testData['related_id'] = 0;
        const orderModel: Order = await orderService.create(testData);
        createdId = orderModel.Id;

        const result = orderModel.toJSON();

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.hash).toBe(testData.hash);
    });

    test('Should throw ValidationException because we want to create a empty order', async () => {
        expect.assertions(1);
        await orderService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list orders with our new create one', async () => {
        const orderCollection = await orderService.findAll();
        const order = orderCollection.toJSON();
        expect(order.length).toBe(1);

        const result = order[0];

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.hash).toBe(testData.hash);
    });

    test('Should return one order', async () => {
        const orderModel: Order = await orderService.findOne(createdId);
        const result = orderModel.toJSON();

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.hash).toBe(testData.hash);
    });

    /*
    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await orderService.update(createdId, testDataUpdated).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });
    */

    test('Should update the order', async () => {
        // testDataUpdated['related_id'] = 0;
        const orderModel: Order = await orderService.update(createdId, testDataUpdated);
        const result = orderModel.toJSON();

        // test the values
        // expect(result.value).toBe(testDataUpdated.value);
        expect(result.hash).toBe(testDataUpdated.hash);
    });

    test('Should delete the order', async () => {
        expect.assertions(1);
        await orderService.destroy(createdId);
        await orderService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

});
