import { rpc, api } from '../lib/api';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { addressTestData } from './BidCommandCommon';

import * as resources from 'resources';
import * as listingItemCreateRequestBasic1 from '../../testdata/createrequest/listingItemCreateRequestBasic1.json';

describe('BidSendCommand', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const testUtil = new BlackBoxTestUtil();

    const bidCommand =  Commands.BID_ROOT.commandName;
    const sendCommand =  Commands.BID_SEND.commandName;

    let defaultMarket: resources.Market;
    let defaultProfile: resources.Profile;

    let createdListingItems: resources.ListingItem[];
    let createdAddress: resources.Address;

    beforeAll(async () => {

        await testUtil.cleanDb();

        // get default profile
        defaultProfile = await testUtil.getDefaultProfile();

        const addCommandParams = [
            Commands.ADDRESS_ADD.commandName,
            defaultProfile.id,
            addressTestData.firstName,
            addressTestData.lastName,
            addressTestData.title,
            addressTestData.addressLine1,
            addressTestData.addressLine2,
            addressTestData.city,
            addressTestData.state,
            addressTestData.country,
            addressTestData.zipCode
        ];

        // create address for default profile
        const addressRes: any = await rpc(Commands.ADDRESS_ROOT.commandName, addCommandParams);
        createdAddress = addressRes.getBody()['result'];

        // get default profile again
        defaultProfile = await testUtil.getDefaultProfile();

        // get default market
        defaultMarket = await testUtil.getDefaultMarket();

        // generate a listing item to bid for
        createdListingItems = await testUtil.generateData(CreatableModel.LISTINGITEM);
        log.debug('createdListingItem1: ', createdListingItems[0].id);

    });

    test('Should post Bid for a ListingItem', async () => {

        log.debug('createdListingItems[0].hash: ', createdListingItems[0].hash);
        // log.debug('createdListingItems[0].ActionMessages: ', JSON.stringify(createdListingItems[0].ActionMessages, null, 2));
        log.debug('createdAddress:', JSON.stringify(createdAddress, null, 2));

        const sendBidCommandParams = [
            sendCommand,
            createdListingItems[0].hash,
            defaultProfile.id,
            createdAddress.id,
            'colour',
            'black',
            'size',
            'xl'
        ];

        // create listing item
        const res: any = await rpc(bidCommand, sendBidCommandParams);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        log.debug('result', result);
        expect(result.result).toBe('Sent.');
    });

    test('Should find Bid after posting', async () => {

        log.debug('createdListingItems[0].hash: ', createdListingItems[0].hash);
        // log.debug('createdListingItems[0].ActionMessages: ', JSON.stringify(createdListingItems[0].ActionMessages, null, 2));
        log.debug('createdAddress:', JSON.stringify(createdAddress, null, 2));

        const sendBidCommandParams = [
            sendCommand,
            createdListingItems[0].hash,
            defaultProfile.id,
            createdAddress.id,
            'colour',
            'black',
            'size',
            'xl'
        ];

        // create listing item
        const res: any = await rpc(bidCommand, sendBidCommandParams);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        log.debug('result', result);
        expect(result.result).toBe('Sent.');
    });

});
