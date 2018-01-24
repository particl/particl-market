import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Logger } from '../../src/core/Logger';
import { MarketListCommand } from '../../src/api/commands/market/MarketListCommand';
import { Commands} from '../../src/api/commands/CommandEnumType';

describe('MarketListCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const marketService = null;
    const method =  Commands.MARKET_ROOT.commandName;
    const subCommand =  Commands.MARKET_LIST.commandName;

    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    test('Should return empty market list', async () => {
        const res = await rpc(method, [subCommand]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(0);
    });

    test('Should list all created markets', async () => {
        // generate markets
        await testUtil.generateData('market', 3);

        const res = await rpc(method, [subCommand]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(3);
    });

});
