import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Commands } from '../../src/api/commands/CommandEnumType';

describe('CurrencyPriceRootCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const method = Commands.CURRENCYPRICE_ROOT.commandName;

    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    test('Should fail to get currency price because empty params', async () => {
        const res = await rpc(method, []);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Invalid params');
    });

    test('Should fail to get currency price because without from curreny as PART', async () => {
        const res = await rpc(method, ['INR']);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Invalid params');
    });

    test('Should fail to get currency price because without to currencies', async () => {
        const res = await rpc(method, ['PART']);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Invalid params');
    });

    test('Should fail to get currency price because invalid from currency', async () => {
        const res = await rpc(method, ['EUR', 'INR', 'USD']);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('Should fail to get currency price because some un supported currencies', async () => {
        const res = await rpc(method, ['PART', 'INR', 'USD', 'TEST']);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Invalid currency TEST');
    });

    test('Should get one new currency price', async () => {
        const res = await rpc(method, ['PART', 'INR']);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].from).toBe('PART');
        expect(result[0].to).toBe('INR');
    });

    test('Should get two new currency price', async () => {
        const res = await rpc(method, ['PART', 'INR', 'USD']);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.length).toBe(2);
        expect(result[0].from).toBe('PART');
        expect(result[0].to).toBe('INR');
        expect(result[1].from).toBe('PART');
        expect(result[1].to).toBe('USD');
    });
});
