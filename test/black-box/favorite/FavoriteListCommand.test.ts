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

describe('FavoriteListCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const favoriteCommand = Commands.FAVORITE_ROOT.commandName;
    const favoriteListCommand = Commands.FAVORITE_LIST.commandName;
    const favoriteAddCommand = Commands.FAVORITE_ADD.commandName;

    let profile: resources.Profile;
    let market: resources.Market;

    let listingItem1: resources.ListingItem;
    let listingItem2: resources.ListingItem;
    let randomCategory: resources.ItemCategory;

    beforeAll(async () => {

        // clean up the db, first removes all data and then seeds the db with default data
        await testUtil.cleanDb();

        profile = await testUtil.getDefaultProfile();
        expect(profile.id).toBeDefined();
        market = await testUtil.getDefaultMarket(profile.id);
        expect(market.id).toBeDefined();
        randomCategory = await testUtil.getRandomCategory();

        const generateListingItemParams = new GenerateListingItemParams([
            true,               // generateItemInformation
            true,               // generateItemLocation
            true,               // generateShippingDestinations
            false,              // generateItemImages
            true,               // generatePaymentInformation
            true,               // generateEscrow
            true,               // generateItemPrice
            false,              // generateMessagingInformation
            false,              // generateListingItemObjects
            false,              // generateObjectDatas
            undefined,          // listingItemTemplateHash
            undefined,          // seller
            randomCategory.id,  // categoryId
            undefined           // soldOnMarketId
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

    test('Should fail because missing profileId', async () => {
        const res = await testUtil.rpc(favoriteCommand, [favoriteListCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('profileId').getMessage());
    });

    test('Should fail because invalid profileId', async () => {
        const res = await testUtil.rpc(favoriteCommand, [favoriteListCommand,
            'INVALID'
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('profileId', 'number').getMessage());
    });

    test('Should fail because Profile not found', async () => {
        const res = await testUtil.rpc(favoriteCommand, [favoriteListCommand,
            0
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('Profile').getMessage());
    });

    test('Should return empty FavoriteItem list', async () => {
        const res: any = await testUtil.rpc(favoriteCommand, [favoriteListCommand,
            profile.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.FavoriteItem[] = res.getBody()['result'];
        expect(result).toHaveLength(0);
    });

    test('Should return one FavoriteItem by profileId', async () => {

        // add favorite item
        await testUtil.rpc(favoriteCommand, [favoriteAddCommand,
            profile.id,
            listingItem1.id
        ]);

        // get the favorite list
        const res = await testUtil.rpc(favoriteCommand, [favoriteListCommand,
            profile.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.FavoriteItem[] = res.getBody()['result'];

        expect(result.length).toBe(1);
        expect(result[0].profileId).toBe(profile.id);
        expect(result[0].listingItemId).toBe(listingItem1.id);
        expect(result[0].Profile).toBeDefined();
        expect(result[0].Profile.id).toBe(profile.id);
        expect(result[0].ListingItem).toBeDefined();
        expect(result[0].ListingItem.id).toBe(listingItem1.id);
        expect(result[0].ListingItem.market).toBeDefined();

        expect(result[0].ListingItem.Bids).toBeDefined();
        expect(result[0].ListingItem.FlaggedItem).toBeDefined();
        expect(result[0].ListingItem.ItemInformation).toBeDefined();
        expect(result[0].ListingItem.ListingItemObjects).toBeDefined();
        expect(result[0].ListingItem.MessagingInformation).toBeDefined();
        expect(result[0].ListingItem.PaymentInformation).toBeDefined();
    });

    test('Should return list of FavoriteItems', async () => {

        // add favorite item
        await testUtil.rpc(favoriteCommand, [favoriteAddCommand,
            profile.id,
            listingItem2.id
        ]);

        // get the favorite list
        const res: any = await testUtil.rpc(favoriteCommand, [favoriteListCommand,
            profile.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.FavoriteItem[] = res.getBody()['result'];

        expect(result.length).toBe(2);
        expect(result[0].profileId).toBe(profile.id);
        expect(result[0].listingItemId).toBe(listingItem1.id);
        expect(result[0].Profile).toBeDefined();
        expect(result[0].Profile.id).toBe(profile.id);
        expect(result[0].ListingItem).toBeDefined();
        expect(result[0].ListingItem.id).toBe(listingItem1.id);
        expect(result[0].ListingItem.market).toBeDefined();
        expect(result[0].ListingItem.Bids).toBeDefined();
        expect(result[0].ListingItem.FlaggedItem).toBeDefined();
        expect(result[0].ListingItem.ItemInformation).toBeDefined();
        expect(result[0].ListingItem.ListingItemObjects).toBeDefined();
        expect(result[0].ListingItem.MessagingInformation).toBeDefined();
        expect(result[0].ListingItem.PaymentInformation).toBeDefined();

        expect(result[1].profileId).toBe(profile.id);
        expect(result[1].listingItemId).toBe(listingItem2.id);
        expect(result[1].Profile).toBeDefined();
        expect(result[1].Profile.id).toBe(profile.id);
        expect(result[1].ListingItem).toBeDefined();
        expect(result[1].ListingItem.id).toBe(listingItem2.id);
        expect(result[1].ListingItem.market).toBeDefined();
        expect(result[1].ListingItem.Bids).toBeDefined();
        expect(result[1].ListingItem.FlaggedItem).toBeDefined();
        expect(result[1].ListingItem.ItemInformation).toBeDefined();
        expect(result[1].ListingItem.ListingItemObjects).toBeDefined();
        expect(result[1].ListingItem.MessagingInformation).toBeDefined();
        expect(result[1].ListingItem.PaymentInformation).toBeDefined();
    });

});
