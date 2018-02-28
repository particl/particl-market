import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { BidMessageType } from '../../src/api/enums/BidMessageType';
import { BidCreateRequest } from '../../src/api/requests/BidCreateRequest';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { Commands } from '../../src/api/commands/CommandEnumType';

import { testDataListingItemTemplate, addressTestData } from './BidCommandCommon';

describe('BidAcceptCommand', () => {
    const testUtil = new BlackBoxTestUtil();

    const method =  Commands.BID_ROOT.commandName;
    const subMethod = Commands.BID_ACCEPT.commandName;

    beforeAll(async () => {
        await testUtil.cleanDb();
        testDataListingItemTemplate.market_id = (await testUtil.getDefaultMarket()).id;
    });

    test('Should accept a bid by RPC', async () => {

        // Ryno Hacks - This requires regtest
        const outputs = [{
            txid: 'f89653c7208af2c76a3070d436229fb782acbd065bd5810307995b9982423ce7',
            vout: 9,
            amount: 10000
        }];

        const pubkey = '02dcd01e1c1bde4d5f8eff82cde60017f81ac1c2888d04f47a31660004fe8d4bb7';
        const changeAddress = 'pYTjD9CRepFvh1YvVfowY2J14DK9ayrvrr';

        // create listing item
        const listingItem: any = await testUtil.addData(CreatableModel.LISTINGITEM, testDataListingItemTemplate);

        // create bid
        const bid = await testUtil.addData(CreatableModel.BID, {
            action: BidMessageType.MPA_BID,
            bidData: [
                {id: 'pubkey', value: pubkey},
                {id: 'outputs', value: outputs},
                {id: 'changeAddr', value: changeAddress},
            ],
            listing_item_id: listingItem.id
        } as BidCreateRequest);
        console.log('2: gets here');
        const res: any = await rpc(method, [subMethod, listingItem.hash]);
        res.expectJson();

        // TODO: Need to implements after broadcast functionality get done
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

    });

});
