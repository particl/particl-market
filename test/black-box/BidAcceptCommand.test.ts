import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { BidMessageType } from '../../src/api/enums/BidMessageType';
import { BidCreateRequest } from '../../src/api/requests/BidCreateRequest';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { Commands } from '../../src/api/commands/CommandEnumType';
import { addressTestData } from './BidCommandCommon';

describe('BidAcceptCommand', () => {
    const testUtil = new BlackBoxTestUtil();

    const method =  Commands.BID_ROOT.commandName;
    const subMethod = Commands.BID_ACCEPT.commandName;

    beforeAll(async () => {
        await testUtil.cleanDb();

        // create address
        const addressRes = await rpc(Commands.ADDRESS_ROOT.commandName, [Commands.ADDRESS_ADD.commandName,
            (await testUtil.getDefaultProfile()).id,
            addressTestData.title,
            addressTestData.addressLine1, addressTestData.addressLine2,
            addressTestData.city, addressTestData.state, addressTestData.country, addressTestData.zipCode]);
        addressRes.expectJson();
        addressRes.expectStatusCode(200);
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
        const listingItem = await testUtil.generateData(CreatableModel.LISTINGITEM, 1);

        // create bid
        const bid = await testUtil.addData(CreatableModel.BID, {
            action: BidMessageType.MPA_BID,
            bidData: [
                {id: 'pubkey', value: pubkey},
                {id: 'outputs', value: outputs},
                {id: 'changeAddr', value: changeAddress},
            ],
            listing_item_id: listingItem[0].id
        } as BidCreateRequest);

        const res: any = await rpc(method, [subMethod, listingItem[0].hash]);
        res.expectJson();

        // TODO: Need to implements after broadcast functionality get done
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

    });

});
