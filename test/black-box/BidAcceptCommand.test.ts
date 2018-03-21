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
            txid: '91acbd9589197eb01e124dd4f176fb3f1e0bd220797d90819704a2c629bd705c',
            vout: 0,
            amount: 20000
        }];

        const pubkey = '02dcd01e1c1bde4d5f8eff82cde60017f81ac1c2888d04f47a31660004fe8d4bb7';
        const changeAddress = 'pYTjD9CRepFvh1YvVfowY2J14DK9ayrvrr';

        // create listing item
        const listingItem = await testUtil.generateData(CreatableModel.LISTINGITEM, 1);

        // create bid
        const bid = await testUtil.addData(CreatableModel.BID, {
            action: BidMessageType.MPA_BID,
            bidData: [
                {id: 'pubkeys', value: [pubkey]},
                {id: 'outputs', value: outputs},
                {id: 'changeAddr', value: changeAddress},
                {id: 'change', value: +(listingItem[0].PaymentInformation.ItemPrice.basePrice
                    + listingItem[0].PaymentInformation.ItemPrice.ShippingPrice.international).toFixed(8) }
            ],
            listing_item_id: listingItem[0].id
        } as BidCreateRequest);

        const res: any = await rpc(bidCommand, [acceptCommand, listingItem[0].hash]);

        res.expectJson();

        // TODO: Need to implements after broadcast functionality get done
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
    });

});
