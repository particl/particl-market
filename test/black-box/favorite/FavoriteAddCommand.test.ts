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

describe('FavoriteAddCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const favoriteCommand =  Commands.FAVORITE_ROOT.commandName;
    const favoriteAddCommand = Commands.FAVORITE_ADD.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;

    let createdListingItem1: resources.ListingItem;

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
            1,                          // how many to generate
            true,                    // return model
            generateListingItemParams           // what kind of data to generate
        ) as resources.ListingItem[];

        createdListingItem1 = listingItems[0];

    });

    test('Should fail to add because missing profileId', async () => {
        const res = await testUtil.rpc(favoriteCommand, [favoriteAddCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('profileId').getMessage());
    });

    test('Should fail to add because missing listingItemId', async () => {
        const res = await testUtil.rpc(favoriteCommand, [favoriteAddCommand,
            defaultProfile.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('listingItemId').getMessage());
    });

    test('Should fail to add because invalid profileId', async () => {
        const res = await testUtil.rpc(favoriteCommand, [favoriteAddCommand,
            'INVALID',
            createdListingItem1.id
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
    test('Should fail to add because Profile not found', async () => {

        const res = await testUtil.rpc(favoriteCommand, [favoriteAddCommand,
            0,
            createdListingItem1.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('Profile').getMessage());
    });

    test('Should fail to add because ListingItem not found', async () => {

        const res = await testUtil.rpc(favoriteCommand, [favoriteAddCommand,
            defaultProfile.id,
            0
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('ListingItem').getMessage());
    });

    test('Should add FavoriteItem', async () => {

        const res: any = await testUtil.rpc(favoriteCommand, [favoriteAddCommand,
            defaultProfile.id,
            createdListingItem1.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        expect(result.ListingItem.id).toBe(createdListingItem1.id);
        expect(result.Profile.id).toBe(defaultProfile.id);
    });

    test('Should fail to add because ListingItem already added', async () => {

        const res = await testUtil.rpc(favoriteCommand, [favoriteAddCommand,
            defaultProfile.id,
            0
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('ListingItem').getMessage());
    });

});
