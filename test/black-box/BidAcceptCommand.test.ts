import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { BidMessageType } from '../../src/api/enums/BidMessageType';
import { BidCreateRequest } from '../../src/api/requests/BidCreateRequest';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { Commands } from '../../src/api/commands/CommandEnumType';
import { addressTestData } from './BidCommandCommon';

describe('BidAcceptCommand', () => {

    const testUtil = new BlackBoxTestUtil();

    const bidCommand =  Commands.BID_ROOT.commandName;
    const acceptCommand = Commands.BID_ACCEPT.commandName;

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

    test('Should Accept a Bid for a ListingItem', async () => {

        // Ryno Hacks - This requires regtest
        const outputs = [{
            txid: 'e3fd6c39588c5e9fc5cd2d0626f21735936f8ab07c6b7f535618614f2ca989a8',
            vout: 1,
            amount: 20000
        }];

        const pubkey = '02dcd01e1c1bde4d5f8eff82cde60017f81ac1c2888d04f47a31660004fe8d4bb7';
        const changeAddress = 'pYTjD9CRepFvh1YvVfowY2J14DK9ayrvrr';

        // create listing item
        // TODO: Create listing item template, so that we know it belongs to us
        const listingItem = await testUtil.generateData(CreatableModel.LISTINGITEM, 1);

        // create bid
        const bid = await testUtil.addData(CreatableModel.BID, {
            action: BidMessageType.MPA_BID,
            bidDatas: [
                {dataId: 'pubkeys', dataValue: [pubkey]},
                {dataId: 'outputs', dataValue: outputs},
                {dataId: 'changeAddr', dataValue: changeAddress},
                {dataId: 'change', dataValue: +(listingItem[0].PaymentInformation.ItemPrice.basePrice
                    + listingItem[0].PaymentInformation.ItemPrice.ShippingPrice.international).toFixed(8) }
            ],
            listing_item_id: listingItem[0].id,
            bidder: 'Anything'
        } as BidCreateRequest);

        const res: any = await rpc(bidCommand, [acceptCommand, listingItem[0].hash, bid.id]);

        res.expectJson();

        // TODO: Need to implements after broadcast functionality get done
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
    });

});
