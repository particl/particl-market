import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Logger } from '../../src/core/Logger';
import { SendBidCommand } from '../../src/api/commands/bid/SendBidCommand';

describe('SendBidCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const listingItemService = null;
    const messageBroadcastService = null;
    const bidFactory = null;

    const method =  new SendBidCommand(listingItemService, listingItemService, messageBroadcastService, Logger).name;

    const testData = [
        'colour',
        'black',
        'colour',
        'red'
    ];

    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    test('Should send a bid by RPC', async () => {
        const listingItem = await testUtil.generateData('listingitem', 1);
        testData.unshift(listingItem[0].hash);
        const res: any = await rpc(method, testData);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        // TODO: Need to implements after broadcast functionality get done
    });

});
