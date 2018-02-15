import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { PriceTickerService } from '../../src/api/services/PriceTickerService';
import { PriceTickerCreateRequest } from '../../src/api/requests/PriceTickerCreateRequest';
import { PriceTickerUpdateRequest } from '../../src/api/requests/PriceTickerUpdateRequest';
import { PriceTicker } from '../../src/api/models/PriceTicker';

describe('PriceTicker', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let priceTickerService: PriceTickerService;

    let createdId;

    const testData = {
        crypto_id: 'bitcoin',
        crypto_name: 'Bitcoin',
        crypto_symbol: 'BTC',
        crypto_rank: '1',
        crypto_price_usd: '8001.02',
        crypto_price_btc: '1.0',
        crypto_24h_volume_usd: '9892040000.0',
        crypto_market_cap_usd: '134838389703',
        crypto_available_supply: '16852650.0',
        crypto_total_supply: '16852650.0',
        crypto_max_supply: '21000000.0',
        crypto_percent_change_1h: '-1.27',
        crypto_percent_change_24h: '7.28',
        crypto_percent_change_7d: '-20.22',
        crypto_last_updated: '1518071364',
        crypto_price_eur: '514365.57325',
        crypto_24h_volume_eur: '635934521500.0000000000',
        crypto_market_cap_eur: '8668422978032'
    } as PriceTickerCreateRequest;

    const testDataUpdated = {
        crypto_id: 'ethereum',
        crypto_name: 'Ethereum',
        crypto_symbol: 'ETH',
        crypto_rank: '2',
        crypto_price_usd: '803.952',
        crypto_price_btc: '0.100246',
        crypto_24h_volume_usd: '4216090000.0',
        crypto_market_cap_usd: '78370675159.0',
        crypto_available_supply: '97481784.0',
        crypto_total_supply: '97481784.0',
        crypto_max_supply: null,
        crypto_percent_change_1h: '-1.22',
        crypto_percent_change_24h: '7.16',
        crypto_percent_change_7d: '-29.01',
        crypto_last_updated: '1518071354',
        crypto_price_eur: '51684.0642',
        crypto_24h_volume_eur: '271041885874.9999694824',
        crypto_market_cap_eur: '5038254779310'
    } as PriceTickerUpdateRequest;
    let lastUpdated;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        priceTickerService = app.IoC.getNamed<PriceTickerService>(Types.Service, Targets.Service.PriceTickerService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();
    });

    afterAll(async () => {
        //
    });

    test('Should create a new PriceTicker', async () => {
        const PriceTickerModel: PriceTicker = await priceTickerService.create(testData);
        createdId = PriceTickerModel.Id;

        const result = PriceTickerModel.toJSON();
        lastUpdated = result.updatedAt;
        expect(result.cryptoId).toBe(testData.crypto_id);
        expect(result.cryptoName).toBe(testData.crypto_name);
        expect(result.cryptoSymbol).toBe(testData.crypto_symbol);
        expect(result.cryptoRank).toBe(testData.crypto_rank);
        expect(result.cryptoPriceUsd).toBe(testData.crypto_price_usd);
        expect(result.cryptoPriceBtc).toBe(testData.crypto_price_btc);
        expect(result.crypto24HVolumeUsd).toBe(testData.crypto_24h_volume_usd);
        expect(result.cryptoMarketCapUsd).toBe(testData.crypto_market_cap_usd);
        expect(result.cryptoAvailableSupply).toBe(testData.crypto_available_supply);
        expect(result.cryptoTotalSupply).toBe(testData.crypto_total_supply);
        expect(result.cryptoMaxSupply).toBe(testData.crypto_max_supply);
        expect(result.cryptoPercentChange1H).toBe(testData.crypto_percent_change_1h);
        expect(result.cryptoPercentChange24H).toBe(testData.crypto_percent_change_24h);
        expect(result.cryptoPercentChange7D).toBe(testData.crypto_percent_change_7d);
        expect(result.cryptoLastUpdated).toBe(testData.crypto_last_updated);
        expect(result.cryptoPriceEur).toBe(testData.crypto_price_eur);
        expect(result.crypto24HVolumeEur).toBe(testData.crypto_24h_volume_eur);
        expect(result.cryptoMarketCapEur).toBe(testData.crypto_market_cap_eur);

        expect(result.updatedAt).toBe(result.createdAt);

    });

    test('Should throw ValidationException because we want to create a empty PriceTicker', async () => {
        expect.assertions(1);
        await priceTickerService.create({} as PriceTickerCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list PriceTicker with our new create one', async () => {
        const PriceTickerCollection = await priceTickerService.findAll();
        const PriceTickerData = PriceTickerCollection.toJSON();
        expect(PriceTickerData.length).toBe(1);

        const result = PriceTickerData[0];

        // test the values
        expect(result.cryptoId).toBe(testData.crypto_id);
        expect(result.cryptoName).toBe(testData.crypto_name);
        expect(result.cryptoSymbol).toBe(testData.crypto_symbol);
        expect(result.cryptoRank).toBe(testData.crypto_rank);
        expect(result.cryptoPriceUsd).toBe(testData.crypto_price_usd);
        expect(result.cryptoPriceBtc).toBe(testData.crypto_price_btc);
        expect(result.crypto24HVolumeUsd).toBe(testData.crypto_24h_volume_usd);
        expect(result.cryptoMarketCapUsd).toBe(testData.crypto_market_cap_usd);
        expect(result.cryptoAvailableSupply).toBe(testData.crypto_available_supply);
        expect(result.cryptoTotalSupply).toBe(testData.crypto_total_supply);
        expect(result.cryptoMaxSupply).toBe(testData.crypto_max_supply);
        expect(result.cryptoPercentChange1H).toBe(testData.crypto_percent_change_1h);
        expect(result.cryptoPercentChange24H).toBe(testData.crypto_percent_change_24h);
        expect(result.cryptoPercentChange7D).toBe(testData.crypto_percent_change_7d);
        expect(result.cryptoLastUpdated).toBe(testData.crypto_last_updated);
        expect(result.cryptoPriceEur).toBe(testData.crypto_price_eur);
        expect(result.crypto24HVolumeEur).toBe(testData.crypto_24h_volume_eur);
        expect(result.cryptoMarketCapEur).toBe(testData.crypto_market_cap_eur);
        expect(result.updatedAt).toBe(lastUpdated);
    });

    test('Should return one PriceTicker', async () => {
        const PriceTickerModel: PriceTicker = await priceTickerService.findOne(createdId);
        const result = PriceTickerModel.toJSON();

        // test the values
        expect(result.cryptoId).toBe(testData.crypto_id);
        expect(result.cryptoName).toBe(testData.crypto_name);
        expect(result.cryptoSymbol).toBe(testData.crypto_symbol);
        expect(result.cryptoRank).toBe(testData.crypto_rank);
        expect(result.cryptoPriceUsd).toBe(testData.crypto_price_usd);
        expect(result.cryptoPriceBtc).toBe(testData.crypto_price_btc);
        expect(result.crypto24HVolumeUsd).toBe(testData.crypto_24h_volume_usd);
        expect(result.cryptoMarketCapUsd).toBe(testData.crypto_market_cap_usd);
        expect(result.cryptoAvailableSupply).toBe(testData.crypto_available_supply);
        expect(result.cryptoTotalSupply).toBe(testData.crypto_total_supply);
        expect(result.cryptoMaxSupply).toBe(testData.crypto_max_supply);
        expect(result.cryptoPercentChange1H).toBe(testData.crypto_percent_change_1h);
        expect(result.cryptoPercentChange24H).toBe(testData.crypto_percent_change_24h);
        expect(result.cryptoPercentChange7D).toBe(testData.crypto_percent_change_7d);
        expect(result.cryptoLastUpdated).toBe(testData.crypto_last_updated);
        expect(result.cryptoPriceEur).toBe(testData.crypto_price_eur);
        expect(result.crypto24HVolumeEur).toBe(testData.crypto_24h_volume_eur);
        expect(result.cryptoMarketCapEur).toBe(testData.crypto_market_cap_eur);
    });

    test('Should update the PriceTicker', async () => {
        const PriceTickerModel: PriceTicker = await priceTickerService.update(createdId, testDataUpdated);
        const result = PriceTickerModel.toJSON();

        // expect(result.currency).toBe(testDataUpdated.currency);
        expect(result.cryptoId).toBe(testDataUpdated.crypto_id);
        expect(result.cryptoName).toBe(testDataUpdated.crypto_name);
        expect(result.cryptoSymbol).toBe(testDataUpdated.crypto_symbol);
        expect(result.cryptoRank).toBe(testDataUpdated.crypto_rank);
        expect(result.cryptoPriceUsd).toBe(testDataUpdated.crypto_price_usd);
        expect(result.cryptoPriceBtc).toBe(testDataUpdated.crypto_price_btc);
        expect(result.crypto24HVolumeUsd).toBe(testDataUpdated.crypto_24h_volume_usd);
        expect(result.cryptoMarketCapUsd).toBe(testDataUpdated.crypto_market_cap_usd);
        expect(result.cryptoAvailableSupply).toBe(testDataUpdated.crypto_available_supply);
        expect(result.cryptoTotalSupply).toBe(testDataUpdated.crypto_total_supply);
        expect(result.cryptoMaxSupply).toBe(testDataUpdated.crypto_max_supply);
        expect(result.cryptoPercentChange1H).toBe(testDataUpdated.crypto_percent_change_1h);
        expect(result.cryptoPercentChange24H).toBe(testDataUpdated.crypto_percent_change_24h);
        expect(result.cryptoPercentChange7D).toBe(testDataUpdated.crypto_percent_change_7d);
        expect(result.cryptoLastUpdated).toBe(testDataUpdated.crypto_last_updated);
        expect(result.cryptoPriceEur).toBe(testDataUpdated.crypto_price_eur);
        expect(result.crypto24HVolumeEur).toBe(testDataUpdated.crypto_24h_volume_eur);
        expect(result.cryptoMarketCapEur).toBe(testDataUpdated.crypto_market_cap_eur);
    });

    test('Should get PriceTicker by symbol', async () => {
        const PriceTickerModel: PriceTicker = await priceTickerService.getOneBySymbol(testDataUpdated.crypto_symbol);
        const result = PriceTickerModel.toJSON();

        expect(result.cryptoId).toBe(testDataUpdated.crypto_id);
        expect(result.cryptoName).toBe(testDataUpdated.crypto_name);
        expect(result.cryptoSymbol).toBe(testDataUpdated.crypto_symbol);
        expect(result.cryptoRank).toBe(testDataUpdated.crypto_rank);
        expect(result.cryptoPriceUsd).toBe(testDataUpdated.crypto_price_usd);
        expect(result.cryptoPriceBtc).toBe(testDataUpdated.crypto_price_btc);
        expect(result.crypto24HVolumeUsd).toBe(testDataUpdated.crypto_24h_volume_usd);
        expect(result.cryptoMarketCapUsd).toBe(testDataUpdated.crypto_market_cap_usd);
        expect(result.cryptoAvailableSupply).toBe(testDataUpdated.crypto_available_supply);
        expect(result.cryptoTotalSupply).toBe(testDataUpdated.crypto_total_supply);
        expect(result.cryptoMaxSupply).toBe(testDataUpdated.crypto_max_supply);
        expect(result.cryptoPercentChange1H).toBe(testDataUpdated.crypto_percent_change_1h);
        expect(result.cryptoPercentChange24H).toBe(testDataUpdated.crypto_percent_change_24h);
        expect(result.cryptoPercentChange7D).toBe(testDataUpdated.crypto_percent_change_7d);
        expect(result.cryptoLastUpdated).toBe(testDataUpdated.crypto_last_updated);
        expect(result.cryptoPriceEur).toBe(testDataUpdated.crypto_price_eur);
        expect(result.crypto24HVolumeEur).toBe(testDataUpdated.crypto_24h_volume_eur);
        expect(result.cryptoMarketCapEur).toBe(testDataUpdated.crypto_market_cap_eur);
    });

    test('Should get no record, if we try to get priceticker by non existing symbol', async () => {
        const PriceTickerModel: PriceTicker = await priceTickerService.getOneBySymbol('TEST_CRYPTO');
        expect(PriceTickerModel).toBeNull();
    });

    test('Should get updated priceticker if timestamp is older', async () => {
        const currencies = ['ETH'];
        const PriceTickerModel: any = await priceTickerService.getPriceTickers(currencies);
        const result = PriceTickerModel[0];

        // should be updated
        expect(result.updatedAt).not.toBe(lastUpdated);
        expect(result.updatedAt).toBeGreaterThan(result.createdAt);

        expect(result.cryptoId).toBeDefined();
        expect(result.cryptoName).toBeDefined();
        expect(result.cryptoSymbol).toBeDefined();
        expect(result.cryptoRank).toBeDefined();
        expect(result.cryptoPriceUsd).toBeDefined();
        expect(result.cryptoPriceBtc).toBeDefined();
        expect(result.crypto24HVolumeUsd).toBeDefined();
        expect(result.cryptoMarketCapUsd).toBeDefined();
        expect(result.cryptoAvailableSupply).toBeDefined();
        expect(result.cryptoTotalSupply).toBeDefined();
        expect(result.cryptoMaxSupply).toBeDefined();
        expect(result.cryptoPercentChange1H).toBeDefined();
        expect(result.cryptoPercentChange24H).toBeDefined();
        expect(result.cryptoPercentChange7D).toBeDefined();
        expect(result.cryptoLastUpdated).toBeDefined();
        expect(result.cryptoPriceEur).toBeDefined();
        expect(result.crypto24HVolumeEur).toBeDefined();
        expect(result.cryptoMarketCapEur).toBeDefined();
    });

    test('Should delete the PriceTicker', async () => {
        expect.assertions(1);
        await priceTickerService.destroy(createdId);
        await priceTickerService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });
});
