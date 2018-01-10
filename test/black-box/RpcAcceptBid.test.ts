import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { BidMessageType } from '../../src/api/enums/BidMessageType';
import { ListingItemTemplateCreateRequest } from '../../src/api/requests/ListingItemTemplateCreateRequest';
import { BidCreateRequest } from '../../src/api/requests/BidCreateRequest';

describe('AcceptBid', () => {
    const testUtil = new BlackBoxTestUtil();
    const method = 'acceptbid';

    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    test('Should accept a bid by RPC', async () => {
        // create listing item
        const listingItem = await testUtil.generateData('listingitem', 1);

        // create bid
        const bid = await testUtil.addData('bid', {
            action: BidMessageType.MPA_BID,
            listing_item_id: listingItem[0].id
        } as BidCreateRequest);
        const res: any = await rpc(method, [listingItem[0].hash]);
        res.expectJson();

        // TODO: Need to implements after broadcast functionality get done
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

    });

});
