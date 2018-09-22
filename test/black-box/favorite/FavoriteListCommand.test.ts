// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemParams } from '../../../src/api/requests/params/GenerateListingItemParams';
import { Logger as LoggerType } from '../../../src/core/Logger';
import * as resources from 'resources';

describe('FavoriteListCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const favoriteCommand = Commands.FAVORITE_ROOT.commandName;
    const favoriteListCommand = Commands.FAVORITE_LIST.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;

    let listingItem1: resources.ListingItem;
    let listingItem2: resources.ListingItem;

    beforeAll(async () => {

        // clean up the db, first removes all data and then seeds the db with default data
        await testUtil.cleanDb();

        defaultProfile = await testUtil.getDefaultProfile();
        defaultMarket = await testUtil.getDefaultMarket();

        const generateListingItemParams = new GenerateListingItemParams([
            true,   // generateItemInformation
            true,   // generateShippingDestinations
            false,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            false,   // generateMessagingInformation
            false    // generateListingItemObjects
        ]).toParamsArray();

        // create two items
        const listingItems = await testUtil.generateData(
            CreatableModel.LISTINGITEM,         // what to generate
            2,                          // how many to generate
            true,                    // return model
            generateListingItemParams           // what kind of data to generate
        ) as resources.ListingItem[];

        listingItem1 = listingItems[0];
        listingItem2 = listingItems[1];

    });

    test('Should return empty FavoriteItem list', async () => {
        const res: any = await testUtil.rpc(favoriteCommand, [favoriteListCommand, defaultProfile.id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.FavoriteItem[] = res.getBody()['result'];
        expect(result).toHaveLength(0);
    });

    test('Should return one FavoriteItem by profileId', async () => {

        // add favorite item
        await testUtil.rpc(favoriteCommand, [Commands.FAVORITE_ADD.commandName, defaultProfile.id, listingItem1.id]);

        // get the favorite list
        const res: any = await testUtil.rpc(favoriteCommand, [favoriteListCommand, defaultProfile.id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.FavoriteItem[] = res.getBody()['result'];

        expect(result.length).toBe(1);
        expect(result[0].profileId).toBe(defaultProfile.id);
        expect(result[0].listingItemId).toBe(listingItem1.id);
        expect(result[0].Profile).toBeDefined();
        expect(result[0].Profile.id).toBe(defaultProfile.id);
        expect(result[0].ListingItem).toBeDefined();
        expect(result[0].ListingItem.id).toBe(listingItem1.id);

        expect(result[0].ListingItem.Bids).toBeDefined();
        expect(result[0].ListingItem.FlaggedItem).toBeDefined();
        expect(result[0].ListingItem.ItemInformation).toBeDefined();
        expect(result[0].ListingItem.ListingItemObjects).toBeDefined();
        expect(result[0].ListingItem.Market).toBeDefined();
        expect(result[0].ListingItem.MessagingInformation).toBeDefined();
        expect(result[0].ListingItem.PaymentInformation).toBeDefined();
    });

    test('Should return FavoriteItem list by profileName', async () => {

        // add favorite item
        await testUtil.rpc(favoriteCommand, [Commands.FAVORITE_ADD.commandName, defaultProfile.id, listingItem1.id]);

        // get the favorite list
        const res: any = await testUtil.rpc(favoriteCommand, [favoriteListCommand, defaultProfile.name]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.FavoriteItem[] = res.getBody()['result'];

        expect(result.length).toBe(1);
        expect(result[0].profileId).toBe(defaultProfile.id);
        expect(result[0].listingItemId).toBe(listingItem1.id);
        expect(result[0].Profile).toBeDefined();
        expect(result[0].Profile.id).toBe(defaultProfile.id);
        expect(result[0].ListingItem).toBeDefined();
        expect(result[0].ListingItem.id).toBe(listingItem1.id);

        expect(result[0].ListingItem.Bids).toBeDefined();
        expect(result[0].ListingItem.FlaggedItem).toBeDefined();
        expect(result[0].ListingItem.ItemInformation).toBeDefined();
        expect(result[0].ListingItem.ListingItemObjects).toBeDefined();
        expect(result[0].ListingItem.Market).toBeDefined();
        expect(result[0].ListingItem.MessagingInformation).toBeDefined();
        expect(result[0].ListingItem.PaymentInformation).toBeDefined();
    });

    test('Should fail to get FavoriteItem list because invalid profileName', async () => {
        const invalidProfileName = 'INVALID-PROFILE-NAME';
        const res: any = await testUtil.rpc(favoriteCommand, [favoriteListCommand, invalidProfileName]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(`Entity with identifier ${invalidProfileName} does not exist`);
    });

    test('Should fail to get FavoriteItem list because invalid profileId', async () => {
        const invalidProfileId = 0;
        const res: any = await testUtil.rpc(favoriteCommand, [favoriteListCommand, invalidProfileId]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(`Entity with identifier ${invalidProfileId} does not exist`);
    });

    test('Should return two FavoriteItems by profileId', async () => {

        // add favorite item
        await testUtil.rpc(favoriteCommand, [Commands.FAVORITE_ADD.commandName, defaultProfile.id, listingItem2.id]);

        // get the favorite list
        const res: any = await testUtil.rpc(favoriteCommand, [favoriteListCommand, defaultProfile.id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.FavoriteItem[] = res.getBody()['result'];

        expect(result.length).toBe(2);
        expect(result[0].profileId).toBe(defaultProfile.id);
        expect(result[0].listingItemId).toBe(listingItem1.id);
        expect(result[0].Profile).toBeDefined();
        expect(result[0].Profile.id).toBe(defaultProfile.id);
        expect(result[0].ListingItem).toBeDefined();
        expect(result[0].ListingItem.id).toBe(listingItem1.id);
        expect(result[0].ListingItem.Bids).toBeDefined();
        expect(result[0].ListingItem.FlaggedItem).toBeDefined();
        expect(result[0].ListingItem.ItemInformation).toBeDefined();
        expect(result[0].ListingItem.ListingItemObjects).toBeDefined();
        expect(result[0].ListingItem.Market).toBeDefined();
        expect(result[0].ListingItem.MessagingInformation).toBeDefined();
        expect(result[0].ListingItem.PaymentInformation).toBeDefined();

        expect(result[1].profileId).toBe(defaultProfile.id);
        expect(result[1].listingItemId).toBe(listingItem2.id);
        expect(result[1].Profile).toBeDefined();
        expect(result[1].Profile.id).toBe(defaultProfile.id);
        expect(result[1].ListingItem).toBeDefined();
        expect(result[1].ListingItem.id).toBe(listingItem2.id);
        expect(result[1].ListingItem.Bids).toBeDefined();
        expect(result[1].ListingItem.FlaggedItem).toBeDefined();
        expect(result[1].ListingItem.ItemInformation).toBeDefined();
        expect(result[1].ListingItem.ListingItemObjects).toBeDefined();
        expect(result[1].ListingItem.Market).toBeDefined();
        expect(result[1].ListingItem.MessagingInformation).toBeDefined();
        expect(result[1].ListingItem.PaymentInformation).toBeDefined();

    });

    test('Should return two FavoriteItems by profileName without related', async () => {

        // add favorite item
        await testUtil.rpc(favoriteCommand, [Commands.FAVORITE_ADD.commandName, defaultProfile.id, listingItem2.id]);

        // get the favorite list
        const res: any = await testUtil.rpc(favoriteCommand, [favoriteListCommand, defaultProfile.name, false]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.FavoriteItem[] = res.getBody()['result'];

        expect(result.length).toBe(2);
        expect(result[0].profileId).toBe(defaultProfile.id);
        expect(result[0].listingItemId).toBe(listingItem1.id);
        expect(result[0].Profile).not.toBeDefined();
        expect(result[0].ListingItem).not.toBeDefined();

        expect(result[1].profileId).toBe(defaultProfile.id);
        expect(result[1].listingItemId).toBe(listingItem2.id);

        expect(result[1].Profile).not.toBeDefined();
        expect(result[1].ListingItem).not.toBeDefined();
    });
});
