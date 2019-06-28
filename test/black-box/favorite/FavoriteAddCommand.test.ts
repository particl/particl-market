// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemParams } from '../../../src/api/requests/testdata/GenerateListingItemParams';
import { Logger as LoggerType } from '../../../src/core/Logger';
import * as resources from 'resources';

describe('FavoriteAddCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const favoriteCommand =  Commands.FAVORITE_ROOT.commandName;
    const favoriteAddCommand = Commands.FAVORITE_ADD.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;

    let createdListingItem1: resources.ListingItem;
    let createdListingItem2: resources.ListingItem;

    beforeAll(async () => {

        // clean up the db, first removes all data and then seeds the db with default data
        await testUtil.cleanDb();

        defaultProfile = await testUtil.getDefaultProfile();
        defaultMarket = await testUtil.getDefaultMarket();

        const generateListingItemParams = new GenerateListingItemParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            true,   // generateShippingDestinations
            false,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            true    // generateListingItemObjects
        ]).toParamsArray();

        // create item and store its id for testing
        const listingItems = await testUtil.generateData(
            CreatableModel.LISTINGITEM,         // what to generate
            2,                          // how many to generate
            true,                    // return model
            generateListingItemParams           // what kind of data to generate
        ) as resources.ListingItem[];

        createdListingItem1 = listingItems[0];
        createdListingItem2 = listingItems[1];

    });

    test('Should fail because missing all the params', async () => {
        const res: any = await testUtil.rpc(favoriteCommand, [favoriteAddCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('Missing parameters.');
    });

    test('Should fail to add FavoriteItem because not enough parameters', async () => {
        // add favorite item
        const res: any = await testUtil.rpc(favoriteCommand, [favoriteAddCommand, defaultProfile.id]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('Missing parameters.');
    });

    test('Should fail to add FavoriteItem because a profileId was a string', async () => {
        // add favorite item
        const res: any = await testUtil.rpc(favoriteCommand, [favoriteAddCommand, 'Some invalid string', createdListingItem1.id]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('profileId cant be a string.');
    });

    test('Should add FavoriteItem with profileId and listingId', async () => {
        // add favorite item
        const res: any = await testUtil.rpc(favoriteCommand, [favoriteAddCommand, defaultProfile.id, createdListingItem1.id]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        expect(result.ListingItem.id).toBe(createdListingItem1.id);
        expect(result.Profile.id).toBe(defaultProfile.id);
    });

    test('Should add FavoriteItem by profileId and listingHash', async () => {
        // add favorite item by item hash and profile
        const res: any = await testUtil.rpc(favoriteCommand, [favoriteAddCommand, defaultProfile.id, createdListingItem2.hash]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        expect(result.ListingItem.id).toBe(createdListingItem2.id);
        expect(result.Profile.id).toBe(defaultProfile.id);
    });

});
