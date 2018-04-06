import { rpc, api } from '../lib/api';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { Commands } from '../../../src/api/commands/CommandEnumType';

import * as resources from 'resources';
import * as listingItemCreateRequestBasic1 from '../../testdata/createrequest/listingItemCreateRequestBasic1.json';
import {BidMessageType} from '../../../src/api/enums/BidMessageType';

describe('BidSendCommand', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const testUtil = new BlackBoxTestUtil();

    const bidCommand =  Commands.BID_ROOT.commandName;
    const sendCommand =  Commands.BID_SEND.commandName;
    const searchCommand =  Commands.BID_SEARCH.commandName;

    let defaultMarket: resources.Market;
    let defaultProfile: resources.Profile;

    let createdListingItems: resources.ListingItem[];

    beforeAll(async () => {

        await testUtil.cleanDb();

        // get default profile again
        defaultProfile = await testUtil.getDefaultProfile();
        log.debug('defaultProfile: ', JSON.stringify(defaultProfile, null, 2));

        // get default market
        defaultMarket = await testUtil.getDefaultMarket();

        // generate a listing item to bid for
        createdListingItems = await testUtil.generateData(CreatableModel.LISTINGITEM);
        log.debug('createdListingItem1: ', createdListingItems[0].id);

    });

    test('Should post Bid for a ListingItem', async () => {

        log.debug('createdListingItems[0].hash: ', createdListingItems[0].hash);
        // log.debug('createdListingItems[0].ActionMessages: ', JSON.stringify(createdListingItems[0].ActionMessages, null, 2));
        log.debug('profile.shippingAddress:', JSON.stringify(defaultProfile.ShippingAddresses[0], null, 2));

        const bidSendCommandParams = [
            sendCommand,
            createdListingItems[0].hash,
            defaultProfile.id,
            defaultProfile.ShippingAddresses[0].id,
            'colour',
            'black',
            'size',
            'xl'
        ];

        // create listing item
        const res: any = await rpc(bidCommand, bidSendCommandParams);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        log.debug('result', result);
        expect(result.result).toBe('Sent.');
    });

    test('Should find Bid after posting', async () => {

        log.debug('createdListingItems[0].hash: ', createdListingItems[0].hash);

        // bid search (<itemhash>|*) [(<status>|*) [<bidderAddress> ...]
        const bidSearchCommandParams = [
            searchCommand,
            createdListingItems[0].hash,
            BidMessageType.MPA_BID,
            defaultProfile.address
        ];

        // create listing item
        const res: any = await rpc(bidCommand, bidSearchCommandParams);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        log.debug('result', result);
        expect(result.result.length).toBe(1);
    });

});
