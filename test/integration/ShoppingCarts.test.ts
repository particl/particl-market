import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { ShoppingCarts } from '../../src/api/models/ShoppingCarts';

import { ShoppingCartsService } from '../../src/api/services/ShoppingCartsService';

describe('ShoppingCarts', () => {

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let shoppingCartsService: ShoppingCartsService;

    let createdId;

    const testData = {
    };

    const testDataUpdated = {
    };

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        shoppingCartsService = app.IoC.getNamed<ShoppingCartsService>(Types.Service, Targets.Service.ShoppingCartsService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean([]);
    });

    afterAll(async () => {
        //
    });

    /*
    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await shoppingCartsService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });
    */

    test('Should create a new shopping carts', async () => {
        // testData['related_id'] = 0;
        const shoppingCartsModel: ShoppingCarts = await shoppingCartsService.create(testData);
        createdId = shoppingCartsModel.Id;

        const result = shoppingCartsModel.toJSON();

        // test the values
        // expect(result.value).toBe(testData.value);
    });

    test('Should throw ValidationException because we want to create a empty shopping carts', async () => {
        expect.assertions(1);
        await shoppingCartsService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list shopping cartss with our new create one', async () => {
        const shoppingCartsCollection = await shoppingCartsService.findAll();
        const shoppingCarts = shoppingCartsCollection.toJSON();
        expect(shoppingCarts.length).toBe(1);

        const result = shoppingCarts[0];

        // test the values
        // expect(result.value).toBe(testData.value);
    });

    test('Should return one shopping carts', async () => {
        const shoppingCartsModel: ShoppingCarts = await shoppingCartsService.findOne(createdId);
        const result = shoppingCartsModel.toJSON();

        // test the values
        // expect(result.value).toBe(testData.value);
    });

    /*
    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await shoppingCartsService.update(createdId, testDataUpdated).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });
    */

    test('Should update the shopping carts', async () => {
        // testDataUpdated['related_id'] = 0;
        const shoppingCartsModel: ShoppingCarts = await shoppingCartsService.update(createdId, testDataUpdated);
        const result = shoppingCartsModel.toJSON();

        // test the values
        // expect(result.value).toBe(testDataUpdated.value);
    });

    test('Should delete the shopping carts', async () => {
        expect.assertions(1);
        await shoppingCartsService.destroy(createdId);
        await shoppingCartsService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

});
