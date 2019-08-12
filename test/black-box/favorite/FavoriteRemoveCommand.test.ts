// Copyright (c) 2017-2019, The Particl Market developers
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

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;

    let listingItem1: resources.ListingItem;
    let listingItem2: resources.ListingItem;
    let listingItem3: resources.ListingItem;

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
            3,                          // how many to generate
            true,                    // return model
            generateListingItemParams           // what kind of data to generate
        ) as resources.ListingItem[];

        listingItem1 = listingItems[0];
        listingItem2 = listingItems[1];
        listingItem3 = listingItems[2];

        // add favorite items
        await testUtil.rpc(favoriteCommand, [favoriteAddCommand, defaultProfile.id, listingItem1.id]);
        await testUtil.rpc(favoriteCommand, [favoriteAddCommand, defaultProfile.id, listingItem2.id]);
    });

    test('Should fail to remove because missing profileId', async () => {
        const res = await testUtil.rpc(favoriteCommand, [favoriteRemoveCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('profileId').getMessage());
    });

    test('Should fail to remove because missing listingItemId', async () => {
        const res = await testUtil.rpc(favoriteCommand, [favoriteRemoveCommand,
            defaultProfile.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('listingItemId').getMessage());
    });

    test('Should fail to remove because invalid profileId', async () => {
        const res = await testUtil.rpc(favoriteCommand, [favoriteRemoveCommand,
            'INVALID',
            listingItem1.id
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('profileId', 'number').getMessage());
    });

    /*
    // TODO: hash is supported, propably id shouldnt be
    test('Should fail to add because invalid listingItemId', async () => {
        const res = await testUtil.rpc(favoriteCommand, [favoriteAddCommand,
            defaultProfile.id,
            'INVALID'
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('listingItemId', 'number').getMessage());
    });
    */
    test('Should fail to remove because Profile not found', async () => {

        const res = await testUtil.rpc(favoriteCommand, [favoriteRemoveCommand,
            0,
            listingItem1.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('Profile').getMessage());
    });

    test('Should fail to remove because ListingItem not found', async () => {

        const res = await testUtil.rpc(favoriteCommand, [favoriteRemoveCommand,
            defaultProfile.id,
            0
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('ListingItem').getMessage());
    });

    test('Should fail to remove because FavoriteItem not found', async () => {

        const res = await testUtil.rpc(favoriteCommand, [favoriteRemoveCommand,
            defaultProfile.id,
            listingItem3.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('FavoriteItem').getMessage());
    });

    test('Should remove first FavoriteItem by id', async () => {
        let res: any = await testUtil.rpc(favoriteCommand, [favoriteRemoveCommand,
            defaultProfile.id,
            listingItem1.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        // check that the remove really worked
        res = await testUtil.rpc(favoriteCommand, [favoriteListCommand, defaultProfile.id]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.FavoriteItem[] = res.getBody()['result'];
        expect(result.length).toBe(1);
    });

    test('Should remove second FavoriteItem by hash', async () => {
        let res: any = await testUtil.rpc(favoriteCommand, [favoriteRemoveCommand,
            defaultProfile.id,
            listingItem2.hash
        ]);
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
        expect(res.error.error.message).toBe(new ModelNotFoundException('FavoriteItem').getMessage());
    });
});
