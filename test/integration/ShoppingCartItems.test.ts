import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { ShoppingCartItems } from '../../src/api/models/ShoppingCartItems';

import { ShoppingCartItemsService } from '../../src/api/services/ShoppingCartItemsService';

describe('ShoppingCartItems', () => {

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let shoppingCartItemsService: ShoppingCartItemsService;

    let createdId;

    const testData = {
    };

    const testDataUpdated = {
    };

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        shoppingCartItemsService = app.IoC.getNamed<ShoppingCartItemsService>(Types.Service, Targets.Service.ShoppingCartItemsService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean([]);
    });

    afterAll(async () => {
        //
    });

    /*
    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await shoppingCartItemsService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });
    */

    test('Should create a new shopping cart items', async () => {
        // testData['related_id'] = 0;
        const shoppingCartItemsModel: ShoppingCartItems = await shoppingCartItemsService.create(testData);
        createdId = shoppingCartItemsModel.Id;

        const result = shoppingCartItemsModel.toJSON();

        // test the values
        // expect(result.value).toBe(testData.value);
    });

    test('Should throw ValidationException because we want to create a empty shopping cart items', async () => {
        expect.assertions(1);
        await shoppingCartItemsService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list shopping cart itemss with our new create one', async () => {
        const shoppingCartItemsCollection = await shoppingCartItemsService.findAll();
        const shoppingCartItems = shoppingCartItemsCollection.toJSON();
        expect(shoppingCartItems.length).toBe(1);

        const result = shoppingCartItems[0];

        // test the values
        // expect(result.value).toBe(testData.value);
    });

    test('Should return one shopping cart items', async () => {
        const shoppingCartItemsModel: ShoppingCartItems = await shoppingCartItemsService.findOne(createdId);
        const result = shoppingCartItemsModel.toJSON();

        // test the values
        // expect(result.value).toBe(testData.value);
    });

    /*
    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await shoppingCartItemsService.update(createdId, testDataUpdated).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });
    */

    test('Should update the shopping cart items', async () => {
        // testDataUpdated['related_id'] = 0;
        const shoppingCartItemsModel: ShoppingCartItems = await shoppingCartItemsService.update(createdId, testDataUpdated);
        const result = shoppingCartItemsModel.toJSON();

        // test the values
        // expect(result.value).toBe(testDataUpdated.value);
    });

    test('Should delete the shopping cart items', async () => {
        expect.assertions(1);
        await shoppingCartItemsService.destroy(createdId);
        await shoppingCartItemsService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

});
