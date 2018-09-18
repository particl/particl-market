// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemParams } from '../../../src/api/requests/params/GenerateListingItemParams';
import { GenerateProfileParams } from '../../../src/api/requests/params/GenerateProfileParams';
import * as resources from 'resources';

describe('FavoriteRemoveCommand', () => {

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

    });

    test('Should remove FavoriteItem by profileId and itemId', async () => {
        // add favorite item
        await testUtil.rpc(favoriteCommand, [Commands.FAVORITE_ADD.commandName, defaultProfile.id, listingItem1.id]);

        // remove favorite item by itemId and profileId
        const removeResult: any = await testUtil.rpc(favoriteCommand, [favoriteRemoveCommand, defaultProfile.id, listingItem1.id]);
        removeResult.expectJson();
        removeResult.expectStatusCode(200);

        // check that the remove really worked
        const listResult: any = await testUtil.rpc(favoriteCommand, [favoriteListCommand, defaultProfile.id]);
        listResult.expectJson();
        listResult.expectStatusCode(200);
        const result: any = listResult.getBody()['result'];

        expect(result.length).toBe(0);
    });

    test('Should remove FavoriteItem by profile id and hash', async () => {
        // add favorite item
        await testUtil.addData(CreatableModel.FAVORITEITEM, {
            listing_item_id: listingItem1.id,
            profile_id: defaultProfile.id
        });

        // remove favorite item by item id and profile
        const removeResult: any = await testUtil.rpc(favoriteCommand, [favoriteRemoveCommand, defaultProfile.id, listingItem1.hash]);
        removeResult.expectJson();
        removeResult.expectStatusCode(200);

        // check that the remove really worked
        const listResult: any = await testUtil.rpc(favoriteCommand, [favoriteListCommand, defaultProfile.id]);
        listResult.expectJson();
        listResult.expectStatusCode(200);
        const result: any = listResult.getBody()['result'];

        expect(result.length).toBe(0);
    });

    test('Should fail remove FavoriteItem because its already removed', async () => {
        // remove favorite
        const getDataRes: any = await testUtil.rpc(favoriteCommand, [favoriteRemoveCommand, defaultProfile.id, listingItem1.id]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(404);
    });
});
