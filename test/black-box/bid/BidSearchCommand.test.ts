import { rpc, api } from '../lib/api';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { BidMessageType } from '../../../src/api/enums/BidMessageType';
import { BidCreateRequest } from '../../../src/api/requests/BidCreateRequest';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { Commands } from '../../../src/api/commands/CommandEnumType';

describe('BidSearchCommand', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const testUtil = new BlackBoxTestUtil();

    const bidCommand =  Commands.BID_ROOT.commandName;
    const searchCommand = Commands.BID_SEARCH.commandName;

    let listingItems;

    beforeAll(async () => {
        await testUtil.cleanDb();
        // create listing item
        listingItems = await testUtil.generateData(CreatableModel.LISTINGITEM, 2);
    });

    test('Should return empty bid search result because bids does not exist for the given item', async () => {
        const res: any = await rpc(bidCommand, [searchCommand, listingItems[0].hash]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.length).toBe(0);
    });

    test('Should fail to search bids because invalid item hash', async () => {
        // search bid by item hash
        const res: any = await rpc(bidCommand, [searchCommand, 'INVALID HASH']);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Entity with identifier INVALID HASH does not exist');
    });

    test('Should return one bid search by item hash', async () => {
        // create bid
        const bidRes: any = await testUtil.addData(CreatableModel.BID, {
            action: BidMessageType.MPA_BID,
            listing_item_id: listingItems[0].id
        } as BidCreateRequest);
        bidRes.expectJson();
        bidRes.expectStatusCode(200);
        const bid: any = bidRes.getBody()['result'];
        log.debug('bid: ', JSON.stringify(bid, null, 2));

        // search bid by item hash
        const res: any = await rpc(bidCommand, [searchCommand, listingItems[0].hash]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].action).toBe(BidMessageType.MPA_BID);
        expect(result[0].listingItemId).toBe(listingItems[0].id);
    });

    test('Should return two bids search by item hash', async () => {
        // create second bid
        await testUtil.addData(CreatableModel.BID, {
            action: BidMessageType.MPA_ACCEPT,
            listing_item_id: listingItems[0].id
        } as BidCreateRequest);

        // search bid by item hash
        const res: any = await rpc(bidCommand, [searchCommand, listingItems[0].hash]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.length).toBe(2);
        expect(result[0].action).toBe(BidMessageType.MPA_BID);
        expect(result[0].listingItemId).toBe(listingItems[0].id);
    });

    test('Should search bids by item hash and bid status', async () => {
        // search bid by item hash
        const res: any = await rpc(bidCommand, [searchCommand, listingItems[0].hash, BidMessageType.MPA_BID]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].action).toBe(BidMessageType.MPA_BID);
        expect(result[0].listingItemId).toBe(listingItems[0].id);
    });

    test('Should fail to search bids because invalid enum bid status', async () => {
        // search bid by item hash
        const res: any = await rpc(bidCommand, [searchCommand, listingItems[0].hash, 'INVALID STATUS']);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Request body is not valid');
    });

    test('Should return empty search result because bid with status MPA_REJECT does not exist', async () => {
        // search bid by item hash
        const res: any = await rpc(bidCommand, [searchCommand, listingItems[0].hash, BidMessageType.MPA_REJECT]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.length).toBe(0);
    });
});
