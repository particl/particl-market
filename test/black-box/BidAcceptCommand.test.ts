import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { BidMessageType } from '../../src/api/enums/BidMessageType';
import { BidCreateRequest } from '../../src/api/requests/BidCreateRequest';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { Commands } from '../../src/api/commands/CommandEnumType';

describe('BidAcceptCommand', () => {
    const testUtil = new BlackBoxTestUtil();

    const method =  Commands.BID_ROOT.commandName;
    const subMethod = Commands.BID_ACCEPT.commandName;

    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    test('Should accept a bid by RPC', async () => {
        // create listing item
        const listingItem = await testUtil.generateData(CreatableModel.LISTINGITEM, 1);

        // create bid
        const bid = await testUtil.addData(CreatableModel.BID, {
            action: BidMessageType.MPA_BID,
            listing_item_id: listingItem[0].id
        } as BidCreateRequest);
        const res: any = await rpc(method, [subMethod, listingItem[0].hash]);
        res.expectJson();

        // TODO: Need to implements after broadcast functionality get done
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

    });

});
