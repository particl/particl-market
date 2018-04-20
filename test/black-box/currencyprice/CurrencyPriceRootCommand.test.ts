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
        // todo: MessageExceptions are returning 404 which doesnt make sense, should be 400
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Invalid params');
    });

    test('Should fail to get CurrencyPrice without from currency as PART', async () => {
        const res = await rpc(method, ['INR']);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Invalid params');
    });

    test('Should fail to get CurrencyPrice without to currencies', async () => {
        const res = await rpc(method, ['PART']);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Invalid params');
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
        expect(res.error.error.message).toBe('Invalid currency TEST');
    });
});
