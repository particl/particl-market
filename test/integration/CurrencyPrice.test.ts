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

import * as createRequestCurrencyPricePARTINR from '../testdata/createrequest/currencyPricePARTINR.json';
import * as updateRequestCurrencyPricePARTINR from '../testdata/updaterequest/currencyPricePARTINR.json';

describe('CurrencyPrice', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let currencyPriceService: CurrencyPriceService;

    let createdId;
    let createdCurrencyPricePARTINR;
    let createdCurrencyPricePARTUSD;

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

    test('Should create a new CurrencyPrice', async () => {

        const currencyPriceModel: CurrencyPrice = await currencyPriceService.create(createRequestCurrencyPricePARTINR);
        createdId = currencyPriceModel.Id;

        const result = currencyPriceModel.toJSON();
        createdCurrencyPricePARTINR = result;

        expect(result.from).toBe(createRequestCurrencyPricePARTINR.from);
        expect(result.to).toBe(createRequestCurrencyPricePARTINR.to);
        expect(result.price).toBe(createRequestCurrencyPricePARTINR.price);
        expect(result.createdAt).toBe(result.updatedAt);
    });

    test('Should get CurrencyPrice from db without updating the latest price from external service', async () => {
        const currencyPrice = await currencyPriceService.getCurrencyPrices('PART', ['INR']);
        const result = currencyPrice[0];

        expect(result.from).toBe(createRequestCurrencyPricePARTINR.from);
        expect(result.to).toBe(createRequestCurrencyPricePARTINR.to);
        expect(result.price).toBe(createRequestCurrencyPricePARTINR.price);
        expect(result.createdAt).toBe(result.updatedAt);
    });

    test('Should throw ValidationException because we want to create a empty CurrencyPrice', async () => {
        expect.assertions(1);
        await currencyPriceService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list CurrencyPrices containing the previously created one', async () => {
        const currencyPriceCollection = await currencyPriceService.findAll();
        const currencyPrice = currencyPriceCollection.toJSON();
        expect(currencyPrice.length).toBe(1);
        const result = currencyPrice[0];

        expect(result.from).toBe(createdCurrencyPricePARTINR.from);
        expect(result.to).toBe(createdCurrencyPricePARTINR.to);
        expect(result.price).toBe(createdCurrencyPricePARTINR.price);
    });

    test('Should return the one created CurrencyPrice', async () => {
        const currencyPriceModel: CurrencyPrice = await currencyPriceService.findOne(createdId);
        const result = currencyPriceModel.toJSON();

        expect(result.from).toBe(createdCurrencyPricePARTINR.from);
        expect(result.to).toBe(createdCurrencyPricePARTINR.to);
        expect(result.price).toBe(createdCurrencyPricePARTINR.price);
    });

    test('Should update the CurrencyPrice', async () => {
        const currencyPriceModel: CurrencyPrice = await currencyPriceService.update(createdId, updateRequestCurrencyPricePARTINR);
        const result = currencyPriceModel.toJSON();

        expect(result.from).toBe(updateRequestCurrencyPricePARTINR.from);
        expect(result.to).toBe(updateRequestCurrencyPricePARTINR.to);
        expect(result.price).toBe(updateRequestCurrencyPricePARTINR.price);
        expect(result.createdAt).not.toBe(result.updatedAt);
    });

    test('Should get CurrencyPrice with previously updated price', async () => {
        log.debug('Should get CurrencyPrice with updated price');
        const result = await currencyPriceService.getCurrencyPrices('PART', ['INR']);
        log.debug('result:', result);

        expect(result.length).toBe(1);

        expect(result[0].from).toBe(updateRequestCurrencyPricePARTINR.from);
        expect(result[0].to).toBe(updateRequestCurrencyPricePARTINR.to);
        expect(result[0].price).toBe(updateRequestCurrencyPricePARTINR.price);
        expect(result[0].updatedAt).toBeGreaterThan(result[0].createdAt);

        createdCurrencyPricePARTINR = result[0];
    });

    test('Should get CurrencyPrice from db and another one with updated price', async () => {
        const result = await currencyPriceService.getCurrencyPrices('PART', ['INR', 'USD']);

        expect(result[0].id).toBe(createdCurrencyPricePARTINR.id);
        expect(result[0].from).toBe(createdCurrencyPricePARTINR.from);
        expect(result[0].to).toBe(createdCurrencyPricePARTINR.to);
        expect(result[0].price).toBe(createdCurrencyPricePARTINR.price);
        expect(result[0].updatedAt).toBe(createdCurrencyPricePARTINR.updatedAt);
        expect(result[0].updatedAt).toBeGreaterThan(result[0].createdAt);

        expect(result[1].from).toBe('PART');
        expect(result[1].to).toBe('USD');
        expect(result[1].updatedAt).toBe(result[1].createdAt);

        createdCurrencyPricePARTUSD = result[1];
    });

    test('Should get CurrencyPrice from db passing currencies in UPPER case', async () => {
        const result = await currencyPriceService.getCurrencyPrices('PART', ['INR', 'USD']);
        expect(result[0].from).toBe(createdCurrencyPricePARTINR.from);
        expect(result[0].to).toBe(createdCurrencyPricePARTINR.to);
        expect(result[0].price).toBe(createdCurrencyPricePARTINR.price);
        expect(result[0].updatedAt).toBeGreaterThan(result[0].createdAt);

        expect(result[1].from).toBe('PART');
        expect(result[1].to).toBe('USD');

    });

    test('Should get CurrencyPrice from db passing currencies in LOWER case', async () => {
        const result = await currencyPriceService.getCurrencyPrices('PART', ['inr', 'usd']);
        expect(result[0].from).toBe(createdCurrencyPricePARTINR.from);
        expect(result[0].to).toBe(createdCurrencyPricePARTINR.to);
        expect(result[0].price).toBe(createdCurrencyPricePARTINR.price);
        expect(result[0].updatedAt).toBe(createdCurrencyPricePARTINR.updatedAt);
        expect(result[0].createdAt).toBe(createdCurrencyPricePARTINR.createdAt);

        expect(result[1].from).toBe('PART');
        expect(result[1].to).toBe('USD');

    });

    test('Should get updated CurrencyPrice passing currencies in LOWER case', async () => {
        process.env.CHASING_COINS_API_DELAY = 0;

        const result = await currencyPriceService.getCurrencyPrices('PART', ['inr', 'usd']);
        expect(result[0].from).toBe('PART');
        expect(result[0].to).toBe('INR');
        expect(result[0].updatedAt).toBeGreaterThan(result[0].createdAt);

        expect(result[1].from).toBe('PART');
        expect(result[1].to).toBe('USD');
        expect(result[1].updatedAt).toBeGreaterThan(result[1].createdAt);
    });

    test('Should get currency price from db passing one currency in LOWER case and one in UPPER case', async () => {
        const result = await currencyPriceService.getCurrencyPrices('PART', ['inr', 'USD']);
        expect(result[0].from).toBe('PART');
        expect(result[0].to).toBe('INR');
        expect(result[0].updatedAt).toBeGreaterThan(result[0].createdAt);

        expect(result[1].from).toBe('PART');
        expect(result[1].to).toBe('USD');
        expect(result[1].updatedAt).toBeGreaterThan(result[1].createdAt);

    });

    test('Should search currency price by from PART and to USD currency', async () => {
        const result = await currencyPriceService.search({from: createdCurrencyPricePARTUSD.from, to: createdCurrencyPricePARTUSD.to} as CurrencyPriceParams);
        expect(result.From).toBe(createdCurrencyPricePARTUSD.from);
        expect(result.To).toBe(createdCurrencyPricePARTUSD.to);
        expect(result.Price).toBe(createdCurrencyPricePARTUSD.price);
        expect(result.Id).toBe(createdCurrencyPricePARTUSD.id);
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
