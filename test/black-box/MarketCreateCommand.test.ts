import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Commands} from '../../src/api/commands/CommandEnumType';

describe('MarketCreateCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const marketService = null;
    const method =  Commands.MARKET_ROOT.commandName;
    const subCommand =  Commands.MARKET_ADD.commandName;

    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    const marketData = {
        name: 'Test Market',
        private_key: 'privateKey',
        address: 'Market Address'
    };

    test('Should create a new market', async () => {
        const res = await rpc(method, [subCommand, marketData.name, marketData.private_key, marketData.address]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.name).toBe(marketData.name);
        expect(result.privateKey).toBe(marketData.private_key);
        expect(result.address).toBe(marketData.address);
    });

    test('Should fail because we want to create an empty market', async () => {
        const res = await rpc(method, [subCommand]);
        res.expectJson();
        res.expectStatusCode(400);
    });
});
