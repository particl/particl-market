import { app } from '../../../src/app';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { Types, Core, Targets } from '../../../src/constants';
import { TestUtil } from '../lib/TestUtil';
import { TestDataService } from '../../../src/api/services/TestDataService';

import { ValidationException } from '../../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../../src/api/exceptions/NotFoundException';

import { OrderItem } from '../../../src/api/models/OrderItem';

import { OrderItemService } from '../../../src/api/services/OrderItemService';

describe('OrderItem', () => {

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let orderItemService: OrderItemService;

    let createdId;

    const testData = {
        status: undefined // TODO: Add test value
    };

    const testDataUpdated = {
        status: undefined // TODO: Add test value
    };

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        orderItemService = app.IoC.getNamed<OrderItemService>(Types.Service, Targets.Service.OrderItemService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean([]);
    });

    afterAll(async () => {
        //
    });

    /*
    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await orderItemService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });
    */

    test('Should create a new order item', async () => {
        // testData['related_id'] = 0;
        const orderItemModel: OrderItem = await orderItemService.create(testData);
        createdId = orderItemModel.Id;

        const result = orderItemModel.toJSON();

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.status).toBe(testData.status);
    });

    test('Should throw ValidationException because we want to create a empty order item', async () => {
        expect.assertions(1);
        await orderItemService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list order items with our new create one', async () => {
        const orderItemCollection = await orderItemService.findAll();
        const orderItem = orderItemCollection.toJSON();
        expect(orderItem.length).toBe(1);

        const result = orderItem[0];

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.status).toBe(testData.status);
    });

    test('Should return one order item', async () => {
        const orderItemModel: OrderItem = await orderItemService.findOne(createdId);
        const result = orderItemModel.toJSON();

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.status).toBe(testData.status);
    });

    /*
    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await orderItemService.update(createdId, testDataUpdated).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });
    */

    test('Should update the order item', async () => {
        // testDataUpdated['related_id'] = 0;
        const orderItemModel: OrderItem = await orderItemService.update(createdId, testDataUpdated);
        const result = orderItemModel.toJSON();

        // test the values
        // expect(result.value).toBe(testDataUpdated.value);
        expect(result.status).toBe(testDataUpdated.status);
    });

    test('Should delete the order item', async () => {
        expect.assertions(1);
        await orderItemService.destroy(createdId);
        await orderItemService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

});
