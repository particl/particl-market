import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Commands} from '../../src/api/commands/CommandEnumType';

describe('MarketListCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const method =  Commands.MARKET_ROOT.commandName;
    const subCommand =  Commands.MARKET_LIST.commandName;
    const addMarketCommand =  Commands.MARKET_ADD.commandName;

    const marketData = {
        name: 'Test Market',
        private_key: 'privateKey',
        address: 'Market Address'
    };

    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    test('Should return only one default market', async () => {
        const res = await rpc(method, [subCommand]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(1);
    });

    test('Should list all created markets', async () => {
        // add markets
        await rpc(method, [addMarketCommand, marketData.name, marketData.private_key, marketData.address]);

        await rpc(method, [addMarketCommand, marketData.name, marketData.private_key, marketData.address]);

        const res = await rpc(method, [subCommand]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(2);
    });

});
