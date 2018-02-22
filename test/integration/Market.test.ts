import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { Market } from '../../src/api/models/Market';

import { MarketService } from '../../src/api/services/MarketService';
import { MarketCreateRequest } from '../../src/api/requests/MarketCreateRequest';
import { MarketUpdateRequest } from '../../src/api/requests/MarketUpdateRequest';

describe('Market', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let marketService: MarketService;

    let createdId;

    const testData = {
        name: 'TEST-MARKET',
        private_key: 'TEST-PRIVATE-KEY',
        address: 'TEST-MARKET-ADDRESS'
    } as MarketCreateRequest;

    const testDataUpdated = {
        name: 'TEST-UPDATE-MARKET',
        private_key: 'TEST-UPDATE-PRIVATE-KEY',
        address: 'TEST-UPDATE-MARKET-ADDRESS'
    } as MarketUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.MarketService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

    });

    it('Should create a new market', async () => {
        const marketModel: Market = await marketService.create(testData);
        createdId = marketModel.Id;

        const result = marketModel.toJSON();

        // test the values
        expect(result.name).toBe(testData.name);
        expect(result.privateKey).toBe(testData.private_key);
        expect(result.address).toBe(testData.address);
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

        const result = market[1];

        // test the values
        expect(result.name).toBe(testData.name);
        expect(result.privateKey).toBe(testData.private_key);
        expect(result.address).toBe(testData.address);
    });

    test('Should return one market', async () => {
        const marketModel: Market = await marketService.findOne(createdId);
        const result = marketModel.toJSON();

        // test the values
        expect(result.name).toBe(testData.name);
        expect(result.privateKey).toBe(testData.private_key);
        expect(result.address).toBe(testData.address);
    });

    test('Should update the market', async () => {
        // testDataUpdated['related_id'] = 0;
        const marketModel: Market = await marketService.update(createdId, testDataUpdated);
        const result = marketModel.toJSON();

        // test the values
        expect(result.name).toBe(testDataUpdated.name);
        expect(result.privateKey).toBe(testDataUpdated.private_key);
        expect(result.address).toBe(testDataUpdated.address);
    });

    test('Should delete the market', async () => {
        expect.assertions(1);
        await marketService.destroy(createdId);
        await marketService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

});
