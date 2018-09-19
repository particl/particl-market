// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { BidMessageType } from '../../../src/api/enums/BidMessageType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/params/GenerateListingItemTemplateParams';
import * as resources from 'resources';
import { GenerateProfileParams } from '../../../src/api/requests/params/GenerateProfileParams';
import { GenerateBidParams } from '../../../src/api/requests/params/GenerateBidParams';

describe('BidAcceptCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const bidCommand =  Commands.BID_ROOT.commandName;
    const bidAcceptCommand = Commands.BID_ACCEPT.commandName;
    const bidSearchCommand =  Commands.BID_SEARCH.commandName;

    let defaultMarket: resources.Market;
    let defaultProfile: resources.Profile;
    let sellerProfile: resources.Profile;

    let listingItemTemplate: resources.ListingItemTemplate;
    let bid: resources.Bid;

    beforeAll(async () => {
        await testUtil.cleanDb();

        defaultProfile = await testUtil.getDefaultProfile();
        defaultMarket = await testUtil.getDefaultMarket();

        // generate local seller profile
        const generateProfileParams = new GenerateProfileParams([
            false,  // generateShippingAddresses
            false   // generateCryptocurrencyAddresses
        ]).toParamsArray();

        const sellerProfiles = await testUtil.generateData(
            CreatableModel.PROFILE,    // what to generate
            1,                 // how many to generate
            true,           // return model
            generateProfileParams      // all true -> generate everything
        ) as resources.Profile[];
        sellerProfile = sellerProfiles[0];

        // generate ListingItemTemplate with ListingItem
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateShippingDestinations
            false,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            false,  // generateListingItemObjects
            false,  // generateObjectDatas
            sellerProfile.id, // profileId
            true,   // generateListingItem
            defaultMarket.id  // marketId
        ]).toParamsArray();

        const listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                    // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplate[];
        listingItemTemplate = listingItemTemplates[0];

        // expect template is related to correct profile and listingitem posted to correct market
        expect(listingItemTemplate.Profile.id).toBe(sellerProfile.id);
        expect(listingItemTemplate.ListingItems[0].marketId).toBe(defaultMarket.id);

        // generate bid
        const bidGenerateParams = new GenerateBidParams([
            false,                                      // generateListingItemTemplate
            false,                                      // generateListingItem
            listingItemTemplate.ListingItems[0].hash,   // listingItem.hash
            BidMessageType.MPA_BID,                     // action
            defaultProfile.address                      // bidder
        ]).toParamsArray();

        const bids: any = await testUtil.generateData(
            CreatableModel.BID,
            1,
            true,
            bidGenerateParams);
        bid = bids[0];

        // log.debug('bids: ', JSON.stringify(bids, null, 2));

    });

    test('Should accept a Bid', async () => {

    // TODO: fix
/*
        log.debug('listingItem.hash: ', listingItemTemplate.ListingItems[0].hash);
        log.debug('bid.id: ', bid.id);

        let res: any = await testUtil.rpc(bidCommand, [bidAcceptCommand, listingItemTemplate.ListingItems[0].hash, bid.id]);
        res.expectJson();
        res.expectStatusCode(200);

        const bidSearchCommandParams = [
            bidSearchCommand,
            listingItemTemplate.ListingItems[0].hash,
            BidMessageType.MPA_BID,
            defaultProfile.address
        ];

        res = await testUtil.rpc(bidCommand, bidSearchCommandParams);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.Bid[] = res.getBody()['result'];

        log.debug('bid search result:', JSON.stringify(result, null, 2));
        expect(result[0].action).toBe(BidMessageType.MPA_ACCEPT);
        expect(result[0].bidder).toBe(defaultProfile.address);
*/
    });


});
