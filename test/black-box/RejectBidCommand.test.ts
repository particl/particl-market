import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Logger } from '../../src/core/Logger';
import { RejectBidCommand } from '../../src/api/commands/bid/RejectBidCommand';

describe('RejectBidCommand', () => {
    const testUtil = new BlackBoxTestUtil();
    const bidFactory = null;
    const listingItemService = null;
    const messageBroadcastService = null;
    const method =  new RejectBidCommand(bidFactory, listingItemService, messageBroadcastService, Logger).name;

    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    test('Should reject a bid by RPC', async () => {
        const listingItem = await testUtil.generateData('listingitem', 1);
        const res: any = await rpc(method, [listingItem[0].hash]);
        res.expectJson();

        // TODO: Need to implements after broadcast functionality get done

        // res.expectStatusCode(200);
        // const result: any = res.getBody()['result'];
    });

});
