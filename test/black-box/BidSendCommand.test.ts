import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { Commands } from '../../src/api/commands/CommandEnumType';
import { addressTestData } from './BidCommandCommon';

describe('BidSendCommand', () => {

    const testUtil = new BlackBoxTestUtil();

    const bidCommand =  Commands.BID_ROOT.commandName;
    const sendCommand =  Commands.BID_SEND.commandName;

    const testData = [
        'colour',
        'black',
        'colour',
        'red'
    ];

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

    test('Should send Bid for a ListingItem', async () => {
        // create listing item
        // TODO: Add address to bid...
        const listingItem = await testUtil.generateData(CreatableModel.LISTINGITEM, 1);
        testData.unshift(listingItem[0].hash);
        testData.unshift(sendCommand);
        const res: any = await rpc(bidCommand, testData);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        // TODO: Need to implements after broadcast functionality get done
    });

});
