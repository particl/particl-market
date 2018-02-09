import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Commands } from '../../src/api/commands/CommandEnumType';

describe('PriceTickerRootCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const method = Commands.PRICETICKER_ROOT.commandName;
    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    test('Should fail because we want to create PriceTicker without passing currency', async () => {
        const res = await rpc(method, []);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(`Currency can\'t be blank`);
    });

    test('Should create records by passing single currency', async () => {
        const res = await rpc(method, ['INR']);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(200);
    });

    test('Should create records by passing two currency(one existing + one new)', async () => {
        const res = await rpc(method, ['INR', 'EUR']);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(400);
    });

});
