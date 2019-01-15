// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import * as resources from 'resources';
import {Logger as LoggerType} from '../../../src/core/Logger';

describe('PriceTickerRootCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const priceTickerCommand = Commands.PRICETICKER_ROOT.commandName;

    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    const expectCoinData = (result: resources.PriceTicker, cryptoId: string, cryptoName: string, cryptoSymbol: string) => {
        expect(result.cryptoId).toBe(cryptoId);
        expect(result.cryptoName).toBe(cryptoName);
        expect(result.cryptoSymbol).toBe(cryptoSymbol);
        expect(result.cryptoRank).toBeDefined();
        expect(result.crypto24HVolumeUsd).toBeDefined();
        expect(result.cryptoPriceUsd).toBeDefined();
        expect(result.cryptoPriceBtc).toBeDefined();
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
    };

    test('Should get PriceTicker by passing single currency (UPPER case)', async () => {
        const res = await testUtil.rpc(priceTickerCommand, ['ETH']);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        const data = result[0];

        expectCoinData(data, 'ethereum', 'Ethereum', 'ETH');
    });

    test('Should get PriceTicker by passing single currency (LOWER case)', async () => {
        const res = await testUtil.rpc(priceTickerCommand, ['xrp']);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        const data = result[0];

        expectCoinData(data, 'ripple', 'XRP', 'XRP');
    });

    test('Should fail to fetch PriceTicker without passing currency', async () => {
        const res = await testUtil.rpc(priceTickerCommand, []);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(`Currency can\'t be blank`);
    });

    test('Should get two PriceTickers by passing two currency ( UPPER + UPPER )', async () => {
        const res = await testUtil.rpc(priceTickerCommand, ['XRP', 'BTC']);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        const data = result[0];
        expectCoinData(data, 'ripple', 'XRP', 'XRP');

        const data2 = result[1];
        expectCoinData(data2, 'bitcoin', 'Bitcoin', 'BTC');

    });

    test('Should get two PriceTickers by passing two currency(UPPER + LOWER)', async () => {
        const res = await testUtil.rpc(priceTickerCommand, ['XRP', 'btc']);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        const data = result[0];
        expectCoinData(data, 'ripple', 'XRP', 'XRP');

        const data2 = result[1];
        expectCoinData(data2, 'bitcoin', 'Bitcoin', 'BTC');

    });

    test('Should get two PriceTickers by passing two currency(LOWER + LOWER)', async () => {
        const res = await testUtil.rpc(priceTickerCommand, ['xrp', 'btc']);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        const data = result[0];
        expectCoinData(data, 'ripple', 'XRP', 'XRP');

        const data2 = result[1];
        expectCoinData(data2, 'bitcoin', 'Bitcoin', 'BTC');

    });
});

