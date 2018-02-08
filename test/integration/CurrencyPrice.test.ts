import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { CurrencyPrice } from '../../src/api/models/CurrencyPrice';

import { CurrencyPriceService } from '../../src/api/services/CurrencyPriceService';

describe('CurrencyPrice', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let currencyPriceService: CurrencyPriceService;

    let createdId;

    const testData = {
        from: 'PART',
        to: 'INR',
        price: 10
    };

    const testDataUpdated = {
        from: 'PART',
        to: 'INR',
        price: 20
    };

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        currencyPriceService = app.IoC.getNamed<CurrencyPriceService>(Types.Service, Targets.Service.CurrencyPriceService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();
    });

    afterAll(async () => {
        //
    });

    test('Should create a new currency price', async () => {
        // testData['related_id'] = 0;
        const currencyPriceModel: CurrencyPrice = await currencyPriceService.create(testData);
        createdId = currencyPriceModel.Id;

        const result = currencyPriceModel.toJSON();

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.from).toBe(testData.from);
        expect(result.to).toBe(testData.to);
        expect(result.price).toBe(testData.price);
    });

    test('Should throw ValidationException because we want to create a empty currency price', async () => {
        expect.assertions(1);
        await currencyPriceService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list currency prices with our new create one', async () => {
        const currencyPriceCollection = await currencyPriceService.findAll();
        const currencyPrice = currencyPriceCollection.toJSON();
        expect(currencyPrice.length).toBe(1);

        const result = currencyPrice[0];

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.from).toBe(testData.from);
        expect(result.to).toBe(testData.to);
        expect(result.price).toBe(testData.price);
    });

    test('Should return one currency price', async () => {
        const currencyPriceModel: CurrencyPrice = await currencyPriceService.findOne(createdId);
        const result = currencyPriceModel.toJSON();

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.from).toBe(testData.from);
        expect(result.to).toBe(testData.to);
        expect(result.price).toBe(testData.price);
    });

    test('Should update the currency price', async () => {
        // testDataUpdated['related_id'] = 0;
        const currencyPriceModel: CurrencyPrice = await currencyPriceService.update(createdId, testDataUpdated);
        const result = currencyPriceModel.toJSON();

        // test the values
        // expect(result.value).toBe(testDataUpdated.value);
        expect(result.from).toBe(testDataUpdated.from);
        expect(result.to).toBe(testDataUpdated.to);
        expect(result.price).toBe(testDataUpdated.price);
    });

    test('Should delete the currency price', async () => {
        expect.assertions(1);
        await currencyPriceService.destroy(createdId);
        await currencyPriceService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });
});
