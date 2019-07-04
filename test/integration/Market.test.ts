// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * from 'jest';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { Market } from '../../src/api/models/Market';
import { MarketService } from '../../src/api/services/model/MarketService';
import { MarketCreateRequest } from '../../src/api/requests/model/MarketCreateRequest';
import { MarketUpdateRequest } from '../../src/api/requests/model/MarketUpdateRequest';

describe('Market', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let marketService: MarketService;

    let createdId;

    const testData = {
        name: 'TEST-MARKET',
        receiveKey: 'TEST-PRIVATE-KEY',
        receiveAddress: 'TEST-MARKET-ADDRESS'
    } as MarketCreateRequest;

    const testDataUpdated = {
        name: 'TEST-UPDATE-MARKET',
        receiveKey: 'TEST-UPDATE-PRIVATE-KEY',
        receiveAddress: 'TEST-UPDATE-MARKET-ADDRESS'
    } as MarketUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

    });

    // fetchByName
    it('Should get default market', async () => {
        const marketModel: Market = await marketService.getDefault();
        const result = marketModel.toJSON();

        // test the values
        expect(result.name).toBe('DEFAULT');
        expect(result.privateKey).toBeDefined();
        expect(result.privateKey).not.toBeNull();
        expect(result.address).toBeDefined();
        expect(result.address).not.toBeNull();
    });

    it('Should create a new market', async () => {
        const marketModel: Market = await marketService.create(testData);
        createdId = marketModel.Id;

        const result: resources.Market = marketModel.toJSON();

        // test the values
        expect(result.name).toBe(testData.name);
        expect(result.receiveKey).toBe(testData.receiveKey);
        expect(result.receiveAddress).toBe(testData.receiveAddress);
    });

    test('Should throw ValidationException because we want to create a empty market', async () => {
        expect.assertions(1);
        await marketService.create({} as MarketCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list markets with our new create one', async () => {
        const marketCollection = await marketService.findAll();
        const market = marketCollection.toJSON();
        expect(market.length).toBe(2); // include with default market

        const result: resources.Market = market[1];

        // test the values
        expect(result.name).toBe(testData.name);
        expect(result.receiveKey).toBe(testData.receiveKey);
        expect(result.receiveAddress).toBe(testData.receiveAddress);
    });

    test('Should return one market', async () => {
        const marketModel: Market = await marketService.findOne(createdId);
        const result: resources.Market = marketModel.toJSON();

        // test the values
        expect(result.name).toBe(testData.name);
        expect(result.receiveKey).toBe(testData.receiveKey);
        expect(result.receiveAddress).toBe(testData.receiveAddress);
    });

    test('Should update the market', async () => {
        const marketModel: Market = await marketService.update(createdId, testDataUpdated);
        const result: resources.Market = marketModel.toJSON();

        // test the values
        expect(result.name).toBe(testDataUpdated.name);
        expect(result.receiveKey).toBe(testDataUpdated.receiveKey);
        expect(result.receiveAddress).toBe(testDataUpdated.receiveAddress);
    });

    // findOneByReceiveAddress
    test('Should find market by address', async () => {
        const marketModel: Market = await marketService.findOneByReceiveAddress(testDataUpdated.address);
        const result: resources.Market = marketModel.toJSON();

        // test the values
        expect(result.name).toBe(testDataUpdated.name);
        expect(result.receiveKey).toBe(testDataUpdated.receiveKey);
        expect(result.receiveAddress).toBe(testDataUpdated.receiveAddress);
    });

    test('Should delete the market', async () => {
        expect.assertions(1);
        await marketService.destroy(createdId);
        await marketService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

});
