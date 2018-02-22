import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { CurrencyPrice } from '../../src/api/models/CurrencyPrice';

import { CurrencyPriceService } from '../../src/api/services/CurrencyPriceService';
import { CurrencyPriceParams } from '../../src/api/requests/CurrencyPriceParams';

describe('CurrencyPrice', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let currencyPriceService: CurrencyPriceService;

    let createdId;
    let createdCurrencyPrice;

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
        createdCurrencyPrice = result;
        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.from).toBe(testData.from);
        expect(result.to).toBe(testData.to);
        expect(result.price).toBe(testData.price);
    });

    test('Should get currency price from db without updated', async () => {
        const currencyPriceModel = await currencyPriceService.getCurrencyPrices('PART', ['INR']);
        expect(currencyPriceModel[0].from).toBe('PART');
        expect(currencyPriceModel[0].to).toBe('INR');
        expect(createdCurrencyPrice.from).toBe('PART');
        expect(createdCurrencyPrice.to).toBe('INR');
        expect(createdCurrencyPrice.price).toBe(currencyPriceModel[0].price);
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

    test('Should get currency price with updated price', async () => {
        const currencyPriceModel = await currencyPriceService.getCurrencyPrices('PART', ['INR']);
        expect(currencyPriceModel[0].from).toBe('PART');
        expect(currencyPriceModel[0].to).toBe('INR');
        expect(createdCurrencyPrice.from).toBe('PART');
        expect(createdCurrencyPrice.to).toBe('INR');
        expect(currencyPriceModel[0].updatedAt).toBeGreaterThan(createdCurrencyPrice.updatedAt);

        createdCurrencyPrice = currencyPriceModel[0];
    });

    test('Should get currency price one from db and another with updated price', async () => {
        const currencyPriceModel = await currencyPriceService.getCurrencyPrices('PART', ['INR', 'USD']);
        expect(currencyPriceModel[0].from).toBe('PART');
        expect(currencyPriceModel[0].to).toBe('INR');
        expect(currencyPriceModel[0].updatedAt).toBe(createdCurrencyPrice.updatedAt);
        expect(currencyPriceModel[0].id).toBe(createdCurrencyPrice.id);
        expect(currencyPriceModel[0].price).toBe(createdCurrencyPrice.price);

        expect(currencyPriceModel[1].to).toBe('USD');
        expect(currencyPriceModel[1]['from']).toBe('PART');
        expect(currencyPriceModel[1].updatedAt).toBe(currencyPriceModel[1].createdAt);

        createdCurrencyPrice = currencyPriceModel;
    });

    test('Should get currency price from db', async () => {
        const currencyPriceModel = await currencyPriceService.getCurrencyPrices('PART', ['INR', 'USD']);
        expect(currencyPriceModel[0].from).toBe('PART');
        expect(currencyPriceModel[0].to).toBe('INR');
        expect(currencyPriceModel[0].updatedAt).toBe(createdCurrencyPrice[0].updatedAt);
        expect(createdCurrencyPrice[0].id).toBe(currencyPriceModel[0].id);
        expect(createdCurrencyPrice[0].price).toBe(currencyPriceModel[0].price);
        expect(createdCurrencyPrice[0].createdAt).toBe(currencyPriceModel[0].createdAt);

        expect(createdCurrencyPrice[1].id).toBe(currencyPriceModel[1].id);
        expect(currencyPriceModel[1].to).toBe('USD');
        expect(currencyPriceModel[1]['from']).toBe('PART');
        expect(createdCurrencyPrice[1].updatedAt).toBe(currencyPriceModel[1].updatedAt);
        expect(createdCurrencyPrice[1].createdAt).toBe(currencyPriceModel[1].createdAt);
        expect(createdCurrencyPrice[1].price).toBe(currencyPriceModel[1].price);

        process.env.CHASING_COINS_API_DELAY = 0;
        createdCurrencyPrice = currencyPriceModel;
    });

    test('Should get updated currency price', async () => {
        const currencyPriceModel = await currencyPriceService.getCurrencyPrices('PART', ['INR', 'USD']);
        expect(currencyPriceModel[0].from).toBe('PART');
        expect(currencyPriceModel[0].to).toBe('INR');
        expect(currencyPriceModel[0].updatedAt).toBeGreaterThan(createdCurrencyPrice[0].updatedAt);
        expect(createdCurrencyPrice[0].id).toBe(currencyPriceModel[0].id);
        expect(createdCurrencyPrice[0].createdAt).toBe(currencyPriceModel[0].createdAt);

        expect(createdCurrencyPrice[1].id).toBe(currencyPriceModel[1].id);
        expect(currencyPriceModel[1].to).toBe('USD');
        expect(currencyPriceModel[1]['from']).toBe('PART');
        expect(createdCurrencyPrice[1].updatedAt).toBeLessThan(currencyPriceModel[1].updatedAt);
        expect(createdCurrencyPrice[1].createdAt).toBe(currencyPriceModel[1].createdAt);

        createdCurrencyPrice = currencyPriceModel[1];
    });

    test('Should search currency price by from PART and to USD currency', async () => {
        const currencyPriceModel = await currencyPriceService.search({from: 'PART', to: 'USD'} as CurrencyPriceParams);
        expect(currencyPriceModel.From).toBe('PART');
        expect(currencyPriceModel.To).toBe('USD');
        expect(createdCurrencyPrice.price).toBe(currencyPriceModel.Price);
        expect(createdCurrencyPrice.id).toBe(currencyPriceModel.id);
    });

    test('Should return null search result because invalid from currency', async () => {
        const currencyPriceModel = await currencyPriceService.search({from: 'INR', to: 'USD'} as CurrencyPriceParams);
        expect(currencyPriceModel).toBe(null);
    });

    test('Should return null search result because not supported to currency', async () => {
        const currencyPriceModel = await currencyPriceService.search({from: 'PART', to: 'TEST'} as CurrencyPriceParams);
        expect(currencyPriceModel).toBe(null);
    });

    test('Should return null search result because currency price does not exist in the db for the given to currency', async () => {
        const currencyPriceModel = await currencyPriceService.search({from: 'PART', to: 'PKR'} as CurrencyPriceParams);
        expect(currencyPriceModel).toBe(null);
    });

    test('Should delete the currency price', async () => {
        expect.assertions(1);
        await currencyPriceService.destroy(createdId);
        await currencyPriceService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });
});
