import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Commands } from '../../src/api/commands/CommandEnumType';

describe('CurrencyPriceAddCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const method = Commands.CURRENCYPRICE_ROOT.commandName;
    const subCommand = Commands.CURRENCYPRICE_ADD.commandName;

    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    test('Should fail to add new currency price because invalid from currency', async () => {
        const res = await rpc(method, [subCommand, 'EUR', 'INR', 'USD']);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('Should fail to add new currency price because some un supported currencies', async () => {
        const res = await rpc(method, [subCommand, 'PART', 'INR', 'USD', 'TEST']);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toBe('Not supported Currencies TEST');
    });

    test('Should add one new currency price', async () => {
        const res = await rpc(method, [subCommand, 'PART', 'INR']);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toBe('Currency added successfully');
    });

    test('Should add two new currency price', async () => {
        const res = await rpc(method, [subCommand, 'PART', 'INR', 'USD']);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toBe('Currency added successfully');
    });
});
