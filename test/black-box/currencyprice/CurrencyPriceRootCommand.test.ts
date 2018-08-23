// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { rpc, api } from '../lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';

describe('CurrencyPriceRootCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const method = Commands.CURRENCYPRICE_ROOT.commandName;
    let currencyPrice;

    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    test('Should get one new CurrencyPrice', async () => {
        const res = await rpc(method, ['PART', 'INR']);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        currencyPrice = result;
        expect(result.length).toBe(1);
        expect(result[0].from).toBe('PART');
        expect(result[0].to).toBe('INR');
        expect(result[0].price).toBeDefined();
        expect(result[0].createdAt).toBe(result[0].updatedAt);
    });

    test('Should not have updated CurrencyPrice', async () => {
        const res = await rpc(method, ['PART', 'INR']);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].from).toBe('PART');
        expect(result[0].to).toBe('INR');
        expect(result[0].price).toBe(currencyPrice[0].price);
        expect(result[0].createdAt).toBe(result[0].updatedAt);
    });

    test('Should fail to get CurrencyPrice because empty params', async () => {
        const res = await rpc(method, []);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Requires at least two parameters, but only 0 were found.');
    });

    test('Should fail to get CurrencyPrice because only one param', async () => {
        const res = await rpc(method, ['INR']);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Requires at least two parameters, but only 1 were found.');
    });

    test('Should fail to get CurrencyPrice without from currency as PART', async () => {
        const res = await rpc(method, ['INR', 'EUR']);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('fromCurrency must be PART, but was INR.');
    });

    test('Should fail to get CurrencyPrice because invalid from currency', async () => {
        const res = await rpc(method, ['EUR', 'INR', 'USD']);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('Should fail to get CurrencyPrice because unsupported currencies', async () => {
        const res = await rpc(method, ['PART', 'INR', 'USD', 'TEST']);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Invalid or unsupported currency: TEST.');
    });
});
