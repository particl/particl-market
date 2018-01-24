import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Logger } from '../../src/core/Logger';
import { MarketListCommand } from '../../src/api/commands/market/MarketListCommand';

describe('MarketListCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const marketService = null;
    const method =  'market';

    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    test('Should list all markets', async () => {
        // generate market
        // const listingItems = await testUtil.generateData('market', 3);

        // const res = await rpc(method, ['list']);
        // res.expectJson();
        // res.expectStatusCode(200);
        // const result: any = res.getBody()['result'];

        // TODO: need to add more test cases after dataRootCommand will be merged

    });

});
