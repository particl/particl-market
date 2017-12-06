import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';

describe('AddMarket', () => {

    const testUtil = new BlackBoxTestUtil();
    const method = 'addmarket';

    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    const marketData = {
        name: 'Test Market',
        private_key: 'privateKey',
        address: 'Market Address'
    };

    test('Should create a new market', async () => {
        const res = await rpc(method, [marketData.name, marketData.private_key, marketData.address]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.name).toBe(marketData.name);
        expect(result.privateKey).toBe(marketData.private_key);
        expect(result.address).toBe(marketData.address);
    });

    test('Should fail because we want to create an empty market', async () => {
        const res = await rpc(method, []);
        res.expectJson();
        res.expectStatusCode(400);
    });
});
