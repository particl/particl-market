import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { Commands } from '../../src/api/commands/CommandEnumType';

describe('BidSendCommand', () => {

    const testUtil = new BlackBoxTestUtil();

    const bidCommand =  Commands.BID_ROOT.commandName;
    const sendCommand =  Commands.BID_SEND.commandName;

    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    test('Should send Bid for a ListingItem', async () => {
        const listingItem = await testUtil.generateData(CreatableModel.LISTINGITEM, 1);

/*
        const res: any = await rpc(bidCommand, testData);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
*/
        // TODO: Need to implements after broadcast functionality get done
    });

});
