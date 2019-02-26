// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemParams } from '../../../src/api/requests/params/GenerateListingItemParams';
import * as resources from 'resources';
import { Logger as LoggerType } from '../../../src/core/Logger';

describe('FavoriteRemoveCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const favoriteCommand = Commands.FAVORITE_ROOT.commandName;
    const favoriteRemoveCommand = Commands.FAVORITE_REMOVE.commandName;
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
            true,   // generateItemLocation
            true,   // generateShippingDestinations
            false,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            true    // generateListingItemObjects
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

        // add favorite items
        await testUtil.rpc(favoriteCommand, [Commands.FAVORITE_ADD.commandName, defaultProfile.id, listingItem1.id]);
        await testUtil.rpc(favoriteCommand, [Commands.FAVORITE_ADD.commandName, defaultProfile.id, listingItem2.id]);
    });

    test('Should remove first FavoriteItem by profileId and itemId', async () => {
        let res: any = await testUtil.rpc(favoriteCommand, [favoriteRemoveCommand, defaultProfile.id, listingItem1.id]);
        res.expectJson();
        res.expectStatusCode(200);

        // check that the remove really worked
        res = await testUtil.rpc(favoriteCommand, [favoriteListCommand, defaultProfile.id]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.FavoriteItem[] = res.getBody()['result'];
        expect(result.length).toBe(1);
    });

    test('Should remove second FavoriteItem by hash and profileId', async () => {
        let res: any = await testUtil.rpc(favoriteCommand, [favoriteRemoveCommand, defaultProfile.id, listingItem2.hash]);
        res.expectJson();
        res.expectStatusCode(200);

        // check that the remove really worked
        res = await testUtil.rpc(favoriteCommand, [favoriteListCommand, defaultProfile.id]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.FavoriteItem[] = res.getBody()['result'];
        expect(result.length).toBe(0);
    });

    test('Should fail remove FavoriteItem because its already removed', async () => {
        // remove favorite
        const res: any = await testUtil.rpc(favoriteCommand, [favoriteRemoveCommand, defaultProfile.id, listingItem1.id]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(`FavoriteItem doesnt exist.`);
    });
});
