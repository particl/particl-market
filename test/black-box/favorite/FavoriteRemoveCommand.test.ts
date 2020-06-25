// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemParams } from '../../../src/api/requests/testdata/GenerateListingItemParams';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';

describe('FavoriteRemoveCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const favoriteCommand = Commands.FAVORITE_ROOT.commandName;
    const favoriteRemoveCommand = Commands.FAVORITE_REMOVE.commandName;
    const favoriteListCommand = Commands.FAVORITE_LIST.commandName;
    const favoriteAddCommand = Commands.FAVORITE_ADD.commandName;

    let profile: resources.Profile;
    let market: resources.Market;

    let listingItem1: resources.ListingItem;
    let listingItem2: resources.ListingItem;
    let listingItem3: resources.ListingItem;

    let favoriteItem1: resources.FavoriteItem;
    let favoriteItem2: resources.FavoriteItem;

    beforeAll(async () => {

        // clean up the db, first removes all data and then seeds the db with default data
        await testUtil.cleanDb();

        profile = await testUtil.getDefaultProfile();
        expect(profile.id).toBeDefined();
        market = await testUtil.getDefaultMarket(profile.id);
        expect(market.id).toBeDefined();

        const generateListingItemParams = new GenerateListingItemParams([
            true,           // generateItemInformation
            true,           // generateItemLocation
            true,           // generateShippingDestinations
            false,          // generateItemImages
            true,           // generatePaymentInformation
            true,           // generateEscrow
            true,           // generateItemPrice
            false,          // generateMessagingInformation
            false,          // generateListingItemObjects
            false           // generateObjectDatas
        ]).toParamsArray();

        // create two items
        const listingItems = await testUtil.generateData(
            CreatableModel.LISTINGITEM,         // what to generate
            3,                          // how many to generate
            true,                    // return model
            generateListingItemParams           // what kind of data to generate
        ) as resources.ListingItem[];

        listingItem1 = listingItems[0];
        listingItem2 = listingItems[1];
        listingItem3 = listingItems[2];

        // add favorite items
        let res: any = await testUtil.rpc(favoriteCommand, [favoriteAddCommand, profile.id, listingItem1.id]);
        res.expectStatusCode(200);
        favoriteItem1 = res.getBody()['result'];

        res = await testUtil.rpc(favoriteCommand, [favoriteAddCommand, profile.id, listingItem2.id]);
        res.expectStatusCode(200);
        favoriteItem2 = res.getBody()['result'];

        expect(favoriteItem1.ListingItem.id).toBe(listingItem1.id);
        expect(favoriteItem2.ListingItem.id).toBe(listingItem2.id);
        expect(favoriteItem1.Profile.id).toBe(profile.id);
        expect(favoriteItem2.Profile.id).toBe(profile.id);

    });

    test('Should fail because missing favoriteItemId', async () => {
        const res = await testUtil.rpc(favoriteCommand, [favoriteRemoveCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('favoriteItemId').getMessage());
    });

    test('Should fail because invalid favoriteItemId', async () => {
        const res = await testUtil.rpc(favoriteCommand, [favoriteRemoveCommand,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('favoriteItemId', 'number').getMessage());
    });

    test('Should fail because FavoriteItem not found', async () => {

        const res = await testUtil.rpc(favoriteCommand, [favoriteRemoveCommand,
            0
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('FavoriteItem').getMessage());
    });

    test('Should remove FavoriteItem by id', async () => {
        let res: any = await testUtil.rpc(favoriteCommand, [favoriteRemoveCommand,
            favoriteItem1.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        // check that the remove really worked
        res = await testUtil.rpc(favoriteCommand, [favoriteListCommand, profile.id]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.FavoriteItem[] = res.getBody()['result'];
        expect(result.length).toBe(1);
    });

    test('Should remove second FavoriteItem by id', async () => {
        let res: any = await testUtil.rpc(favoriteCommand, [favoriteRemoveCommand,
            favoriteItem2.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        // check that the remove really worked
        res = await testUtil.rpc(favoriteCommand, [favoriteListCommand, profile.id]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.FavoriteItem[] = res.getBody()['result'];
        expect(result.length).toBe(0);
    });

    test('Should fail remove FavoriteItem because its already removed', async () => {
        const res: any = await testUtil.rpc(favoriteCommand, [favoriteRemoveCommand,
            favoriteItem1.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('FavoriteItem').getMessage());
    });

});
