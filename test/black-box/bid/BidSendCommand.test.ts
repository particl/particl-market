import { rpc, api } from '../lib/api';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { addressTestData } from './BidCommandCommon';
import { GenerateListingItemParams } from '../../../src/api/requests/params/GenerateListingItemParams';

import * as resources from 'resources';
import * as listingItemCreateRequestBasic1 from '../../testdata/createrequest/listingItemCreateRequestBasic1.json';
import * as listingItemCreateRequestBasic2 from '../../testdata/createrequest/listingItemCreateRequestBasic2.json';
import * as listingItemCreateRequestBasic3 from '../../testdata/createrequest/listingItemCreateRequestBasic3.json';

describe('BidSendCommand', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const testUtil = new BlackBoxTestUtil();

    const bidCommand =  Commands.BID_ROOT.commandName;
    const sendCommand =  Commands.BID_SEND.commandName;

    let defaultMarket: resources.Market;
    let defaultProfile: resources.Profile;
    let createdListingItem1: resources.ListingItem;

    beforeAll(async () => {

        await testUtil.cleanDb();

        // get default profile
        defaultProfile = await testUtil.getDefaultProfile();

        // create address for default profile
        const addressRes = await rpc(Commands.ADDRESS_ROOT.commandName, [Commands.ADDRESS_ADD.commandName,
            defaultProfile.id,
            addressTestData.firstName, addressTestData.lastName, addressTestData.title,
            addressTestData.addressLine1, addressTestData.addressLine2,
            addressTestData.city, addressTestData.state, addressTestData.country, addressTestData.zipCode]);

        // get default profile again
        defaultProfile = await testUtil.getDefaultProfile();

        // get default market
        defaultMarket = await testUtil.getDefaultMarket();

        // create a listing item to bid for
        listingItemCreateRequestBasic1.market_id = defaultMarket.id;
        createdListingItem1 = await testUtil.addData(CreatableModel.LISTINGITEM, listingItemCreateRequestBasic1);

    });

    test('Should send Bid for a ListingItem', async () => {

        // create listing item
        const res: any = await rpc(bidCommand, [sendCommand, createdListingItem1.hash, 'colour', 'black', 'size', 'xl']);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        log.debug('result', result);
        expect(result.result).toBe('Sent.');
    });

});
