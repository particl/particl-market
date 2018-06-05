import { rpc, api } from '../lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { reset } from 'chalk';

describe('PriceTickerRootCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const method = Commands.PRICETICKER_ROOT.commandName;
    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    let lastUpdated;

    test('Should get PriceTicker by passing single currency (UPPER case)', async () => {
        const res = await rpc(method, ['ETH']);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        const data = result[0];

        lastUpdated = data.updatedAt;

        expect(data.cryptoId).toBe('ethereum');
        expect(data.cryptoName).toBe('Ethereum');
        expect(data.cryptoSymbol).toBe('ETH');
        expect(data.cryptoRank).toBeDefined();
        expect(data.crypto24HVolumeUsd).toBeDefined();
        expect(data.cryptoPriceUsd).toBeDefined();
        expect(data.cryptoPriceBtc).toBeDefined();
        expect(data.cryptoMarketCapUsd).toBeDefined();
        expect(data.cryptoAvailableSupply).toBeDefined();
        expect(data.cryptoTotalSupply).toBeDefined();
        expect(data.cryptoMaxSupply).toBeDefined();
        expect(data.cryptoPercentChange1H).toBeDefined();
        expect(data.cryptoPercentChange24H).toBeDefined();
        expect(data.cryptoPercentChange7D).toBeDefined();
        expect(data.cryptoLastUpdated).toBeDefined();
        expect(data.cryptoPriceEur).toBeDefined();
        expect(data.crypto24HVolumeEur).toBeDefined();
        expect(data.cryptoMarketCapEur).toBeDefined();

        expect(data.updatedAt).toBe(data.createdAt);
    });

    test('Should get PriceTicker by passing single currency (LOWER case)', async () => {
        const res = await rpc(method, ['xrp']);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        const data = result[0];

        lastUpdated = data.updatedAt;

        expect(data.cryptoId).toBe('ripple');
        expect(data.cryptoName).toBe('Ripple');
        expect(data.cryptoSymbol).toBe('XRP');
        expect(data.cryptoRank).toBeDefined();
        expect(data.crypto24HVolumeUsd).toBeDefined();
        expect(data.cryptoPriceUsd).toBeDefined();
        expect(data.cryptoPriceBtc).toBeDefined();
        expect(data.cryptoMarketCapUsd).toBeDefined();
        expect(data.cryptoAvailableSupply).toBeDefined();
        expect(data.cryptoTotalSupply).toBeDefined();
        expect(data.cryptoMaxSupply).toBeDefined();
        expect(data.cryptoPercentChange1H).toBeDefined();
        expect(data.cryptoPercentChange24H).toBeDefined();
        expect(data.cryptoPercentChange7D).toBeDefined();
        expect(data.cryptoLastUpdated).toBeDefined();
        expect(data.cryptoPriceEur).toBeDefined();
        expect(data.crypto24HVolumeEur).toBeDefined();
        expect(data.cryptoMarketCapEur).toBeDefined();

        expect(data.updatedAt).toBe(data.createdAt);
    });

    test('Should fail to fetch PriceTicker without passing currency', async () => {
        const res = await rpc(method, []);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(`Currency can\'t be blank`);
    });

    test('Should get two PriceTickers by passing two currency ( UPPER + UPPER )', async () => {
        const res = await rpc(method, ['XRP', 'BTC']);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        const data = result[0];
        expect(data.cryptoId).toBe('ripple');
        expect(data.cryptoName).toBe('Ripple');
        expect(data.cryptoSymbol).toBe('XRP');
        expect(data.cryptoRank).toBeDefined();
        expect(data.crypto24HVolumeUsd).toBeDefined();
        expect(data.cryptoPriceUsd).toBeDefined();
        expect(data.cryptoPriceBtc).toBeDefined();
        expect(data.cryptoMarketCapUsd).toBeDefined();
        expect(data.cryptoAvailableSupply).toBeDefined();
        expect(data.cryptoTotalSupply).toBeDefined();
        expect(data.cryptoMaxSupply).toBeDefined();
        expect(data.cryptoPercentChange1H).toBeDefined();
        expect(data.cryptoPercentChange24H).toBeDefined();
        expect(data.cryptoPercentChange7D).toBeDefined();
        expect(data.cryptoLastUpdated).toBeDefined();
        expect(data.cryptoPriceEur).toBeDefined();
        expect(data.crypto24HVolumeEur).toBeDefined();
        expect(data.cryptoMarketCapEur).toBeDefined();

        const data2 = result[1];

        expect(data2.cryptoId).toBe('bitcoin');
        expect(data2.cryptoName).toBe('Bitcoin');
        expect(data2.cryptoSymbol).toBe('BTC');
        expect(data2.cryptoRank).toBeDefined();
        expect(data2.crypto24HVolumeUsd).toBeDefined();
        expect(data2.cryptoPriceUsd).toBeDefined();
        expect(data2.cryptoPriceBtc).toBeDefined();
        expect(data2.cryptoMarketCapUsd).toBeDefined();
        expect(data2.cryptoAvailableSupply).toBeDefined();
        expect(data2.cryptoTotalSupply).toBeDefined();
        expect(data2.cryptoMaxSupply).toBeDefined();
        expect(data2.cryptoPercentChange1H).toBeDefined();
        expect(data2.cryptoPercentChange24H).toBeDefined();
        expect(data2.cryptoPercentChange7D).toBeDefined();
        expect(data2.cryptoLastUpdated).toBeDefined();
        expect(data2.cryptoPriceEur).toBeDefined();
        expect(data2.crypto24HVolumeEur).toBeDefined();
        expect(data2.cryptoMarketCapEur).toBeDefined();
    });

    test('Should get two PriceTickers by passing two currency(UPPER + LOWER)', async () => {
        const res = await rpc(method, ['XRP', 'btc']);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        const data = result[0];
        expect(data.cryptoId).toBe('ripple');
        expect(data.cryptoName).toBe('Ripple');
        expect(data.cryptoSymbol).toBe('XRP');
        expect(data.cryptoRank).toBeDefined();
        expect(data.crypto24HVolumeUsd).toBeDefined();
        expect(data.cryptoPriceUsd).toBeDefined();
        expect(data.cryptoPriceBtc).toBeDefined();
        expect(data.cryptoMarketCapUsd).toBeDefined();
        expect(data.cryptoAvailableSupply).toBeDefined();
        expect(data.cryptoTotalSupply).toBeDefined();
        expect(data.cryptoMaxSupply).toBeDefined();
        expect(data.cryptoPercentChange1H).toBeDefined();
        expect(data.cryptoPercentChange24H).toBeDefined();
        expect(data.cryptoPercentChange7D).toBeDefined();
        expect(data.cryptoLastUpdated).toBeDefined();
        expect(data.cryptoPriceEur).toBeDefined();
        expect(data.crypto24HVolumeEur).toBeDefined();
        expect(data.cryptoMarketCapEur).toBeDefined();

        const data2 = result[1];

        expect(data2.cryptoId).toBe('bitcoin');
        expect(data2.cryptoName).toBe('Bitcoin');
        expect(data2.cryptoSymbol).toBe('BTC');
        expect(data2.cryptoRank).toBeDefined();
        expect(data2.crypto24HVolumeUsd).toBeDefined();
        expect(data2.cryptoPriceUsd).toBeDefined();
        expect(data2.cryptoPriceBtc).toBeDefined();
        expect(data2.cryptoMarketCapUsd).toBeDefined();
        expect(data2.cryptoAvailableSupply).toBeDefined();
        expect(data2.cryptoTotalSupply).toBeDefined();
        expect(data2.cryptoMaxSupply).toBeDefined();
        expect(data2.cryptoPercentChange1H).toBeDefined();
        expect(data2.cryptoPercentChange24H).toBeDefined();
        expect(data2.cryptoPercentChange7D).toBeDefined();
        expect(data2.cryptoLastUpdated).toBeDefined();
        expect(data2.cryptoPriceEur).toBeDefined();
        expect(data2.crypto24HVolumeEur).toBeDefined();
        expect(data2.cryptoMarketCapEur).toBeDefined();
    });

    test('Should get two PriceTickers by passing two currency(LOWER + LOWER)', async () => {
        const res = await rpc(method, ['xrp', 'btc']);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        const data = result[0];
        expect(data.cryptoId).toBe('ripple');
        expect(data.cryptoName).toBe('Ripple');
        expect(data.cryptoSymbol).toBe('XRP');
        expect(data.cryptoRank).toBeDefined();
        expect(data.crypto24HVolumeUsd).toBeDefined();
        expect(data.cryptoPriceUsd).toBeDefined();
        expect(data.cryptoPriceBtc).toBeDefined();
        expect(data.cryptoMarketCapUsd).toBeDefined();
        expect(data.cryptoAvailableSupply).toBeDefined();
        expect(data.cryptoTotalSupply).toBeDefined();
        expect(data.cryptoMaxSupply).toBeDefined();
        expect(data.cryptoPercentChange1H).toBeDefined();
        expect(data.cryptoPercentChange24H).toBeDefined();
        expect(data.cryptoPercentChange7D).toBeDefined();
        expect(data.cryptoLastUpdated).toBeDefined();
        expect(data.cryptoPriceEur).toBeDefined();
        expect(data.crypto24HVolumeEur).toBeDefined();
        expect(data.cryptoMarketCapEur).toBeDefined();

        const data2 = result[1];

        expect(data2.cryptoId).toBe('bitcoin');
        expect(data2.cryptoName).toBe('Bitcoin');
        expect(data2.cryptoSymbol).toBe('BTC');
        expect(data2.cryptoRank).toBeDefined();
        expect(data2.crypto24HVolumeUsd).toBeDefined();
        expect(data2.cryptoPriceUsd).toBeDefined();
        expect(data2.cryptoPriceBtc).toBeDefined();
        expect(data2.cryptoMarketCapUsd).toBeDefined();
        expect(data2.cryptoAvailableSupply).toBeDefined();
        expect(data2.cryptoTotalSupply).toBeDefined();
        expect(data2.cryptoMaxSupply).toBeDefined();
        expect(data2.cryptoPercentChange1H).toBeDefined();
        expect(data2.cryptoPercentChange24H).toBeDefined();
        expect(data2.cryptoPercentChange7D).toBeDefined();
        expect(data2.cryptoLastUpdated).toBeDefined();
        expect(data2.cryptoPriceEur).toBeDefined();
        expect(data2.crypto24HVolumeEur).toBeDefined();
        expect(data2.cryptoMarketCapEur).toBeDefined();
    });
});

