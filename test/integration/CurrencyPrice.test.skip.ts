// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { CurrencyPriceService } from '../../src/api/services/model/CurrencyPriceService';
import { CurrencyPriceCreateRequest } from '../../src/api/requests/model/CurrencyPriceCreateRequest';
import { CurrencyPriceUpdateRequest } from '../../src/api/requests/model/CurrencyPriceUpdateRequest';
import { CurrencyPriceSearchParams } from '../../src/api/requests/search/CurrencyPriceSearchParams';

describe('CurrencyPrice', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let currencyPriceService: CurrencyPriceService;

    let currencyPricePARTINR: resources.CurrencyPrice;
    let currencyPricePARTUSD: resources.CurrencyPrice;

    const createRequestCurrencyPricePARTINR = {
        from: 'PART',
        to: 'INR',
        price: 10
    } as CurrencyPriceCreateRequest;

    const updateRequestCurrencyPricePARTINR = {
        from: 'PART',
        to: 'INR',
        price: 20
    } as CurrencyPriceUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        process.env.CHASING_COINS_API_DELAY = 1000;

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        currencyPriceService = app.IoC.getNamed<CurrencyPriceService>(Types.Service, Targets.Service.model.CurrencyPriceService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();
    });

    afterAll(async () => {
        //
    });

    test('Should create a new CurrencyPrice', async () => {

        currencyPricePARTINR = await currencyPriceService.create(createRequestCurrencyPricePARTINR)
            .then(value => value.toJSON());

        const result: resources.CurrencyPrice = currencyPricePARTINR;
        expect(result.from).toBe(createRequestCurrencyPricePARTINR.from);
        expect(result.to).toBe(createRequestCurrencyPricePARTINR.to);
        expect(result.price).toBe(createRequestCurrencyPricePARTINR.price);
        expect(result.createdAt).toBe(result.updatedAt);
    });

    test('Should get CurrencyPrice from db without updating the latest price from external service', async () => {
        currencyPricePARTINR = await currencyPriceService.getCurrencyPrices('PART', ['INR']);

        log.debug('currencyPricePARTINR', JSON.stringify(currencyPricePARTINR, null, 2));
        const result: resources.CurrencyPrice = currencyPricePARTINR;
        expect(result.from).toBe(createRequestCurrencyPricePARTINR.from);
        expect(result.to).toBe(createRequestCurrencyPricePARTINR.to);
        expect(result.price).toBe(createRequestCurrencyPricePARTINR.price);
        expect(result.createdAt).toBe(result.updatedAt);
    });

    test('Should throw ValidationException because we want to create a empty CurrencyPrice', async () => {
        expect.assertions(1);
        await currencyPriceService.create({} as CurrencyPriceCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list CurrencyPrices containing the previously created one', async () => {
        const currencyPrices: resources.CurrencyPrice[] = await currencyPriceService.findAll().then(value => value.toJSON());
        expect(currencyPrices.length).toBe(1);
        const result = currencyPrices[0];

        expect(result.from).toBe(currencyPricePARTINR.from);
        expect(result.to).toBe(currencyPricePARTINR.to);
        expect(result.price).toBe(currencyPricePARTINR.price);
    });

    test('Should return the one created CurrencyPrice', async () => {
        currencyPricePARTINR = await currencyPriceService.findOne(currencyPricePARTINR.id)
            .then(value => value.toJSON());

        const result: resources.CurrencyPrice = currencyPricePARTINR;
        expect(result.from).toBe(currencyPricePARTINR.from);
        expect(result.to).toBe(currencyPricePARTINR.to);
        expect(result.price).toBe(currencyPricePARTINR.price);
    });

    test('Should update the CurrencyPrice', async () => {
        currencyPricePARTINR = await currencyPriceService.update(currencyPricePARTINR.id, updateRequestCurrencyPricePARTINR)
            .then(value => value.toJSON());

        const result: resources.CurrencyPrice = currencyPricePARTINR;
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

        currencyPricePARTINR = result[0];
    });

    test('Should get CurrencyPrice from db and another one with updated price', async () => {
        const result = await currencyPriceService.getCurrencyPrices('PART', ['INR', 'USD']);

        log.debug('result:', JSON.stringify(result, null, 2));

        expect(result[0].id).toBe(currencyPricePARTINR.id);
        expect(result[0].from).toBe(currencyPricePARTINR.from);
        expect(result[0].to).toBe(currencyPricePARTINR.to);
        expect(result[0].price).toBe(currencyPricePARTINR.price);
        expect(result[0].updatedAt).toBe(currencyPricePARTINR.updatedAt);
        expect(result[0].updatedAt).toBeGreaterThan(result[0].createdAt);

        expect(result[1].from).toBe('PART');
        expect(result[1].to).toBe('USD');
        expect(result[1].updatedAt).toBe(result[1].createdAt);

        currencyPricePARTUSD = result[1];
    });

    test('Should get CurrencyPrice from db passing currencies in UPPER case', async () => {
        const result = await currencyPriceService.getCurrencyPrices('PART', ['INR', 'USD']);
        expect(result[0].from).toBe(currencyPricePARTINR.from);
        expect(result[0].to).toBe(currencyPricePARTINR.to);
        expect(result[0].price).toBe(currencyPricePARTINR.price);
        expect(result[0].updatedAt).toBeGreaterThan(result[0].createdAt);

        expect(result[1].from).toBe('PART');
        expect(result[1].to).toBe('USD');

    });

    test('Should get CurrencyPrice from db passing currencies in LOWER case', async () => {
        const result = await currencyPriceService.getCurrencyPrices('PART', ['inr', 'usd']);
        expect(result[0].from).toBe(currencyPricePARTINR.from);
        expect(result[0].to).toBe(currencyPricePARTINR.to);
        expect(result[0].price).toBe(currencyPricePARTINR.price);
        expect(result[0].updatedAt).toBe(currencyPricePARTINR.updatedAt);
        expect(result[0].createdAt).toBe(currencyPricePARTINR.createdAt);

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

    test('Should searchBy currency price by from PART and to USD currency', async () => {
        const result = await currencyPriceService.search({
            from: currencyPricePARTUSD.from,
            to: currencyPricePARTUSD.to
        } as CurrencyPriceSearchParams);
        expect(result.From).toBe(currencyPricePARTUSD.from);
        expect(result.To).toBe(currencyPricePARTUSD.to);
        expect(result.Price).toBe(currencyPricePARTUSD.price);
        expect(result.Id).toBe(currencyPricePARTUSD.id);
    });

    test('Should return null searchBy result because invalid from currency', async () => {
        const currencyPriceModel = await currencyPriceService.search({
            from: 'INR',
            to: 'USD'
        } as CurrencyPriceSearchParams);
        expect(currencyPriceModel).toBe(null);
    });

    test('Should return null searchBy result because not supported to currency', async () => {
        const currencyPriceModel = await currencyPriceService.search({
            from: 'PART',
            to: 'TEST'
        } as CurrencyPriceSearchParams);
        expect(currencyPriceModel).toBe(null);
    });

    test('Should return null searchBy result because currency price does not exist in the db for the given to currency', async () => {
        const currencyPriceModel = await currencyPriceService.search({
            from: 'PART',
            to: 'PKR'
        } as CurrencyPriceSearchParams);
        expect(currencyPriceModel).toBe(null);
    });

    test('Should delete the currency price', async () => {
        expect.assertions(1);
        await currencyPriceService.destroy(currencyPricePARTINR.id);
        await currencyPriceService.findOne(currencyPricePARTINR.id).catch(e =>
            expect(e).toEqual(new NotFoundException(currencyPricePARTINR.id))
        );
    });
});
