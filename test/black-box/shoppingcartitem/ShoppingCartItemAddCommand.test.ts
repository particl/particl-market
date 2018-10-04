// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { Logger as LoggerType } from '../../../src/core/Logger';
import * as resources from 'resources';
import { GenerateListingItemParams } from '../../../src/api/requests/params/GenerateListingItemParams';

describe('ShoppingCartItemAddCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const shoppingCartItemCommand = Commands.SHOPPINGCARTITEM_ROOT.commandName;
    const shoppingCartItemAddCommand = Commands.SHOPPINGCARTITEM_ADD.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;
    let defaultShoppingCart: resources.ShoppingCart;
    let listingItems: resources.ListingItem[];

    beforeAll(async () => {
        await testUtil.cleanDb();

        // get default profile and market
        defaultProfile = await testUtil.getDefaultProfile();
        defaultMarket = await testUtil.getDefaultMarket();
        defaultShoppingCart = defaultProfile.ShoppingCart[0];

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

        // create item and store its id for testing
        listingItems = await testUtil.generateData(
            CreatableModel.LISTINGITEM,         // what to generate
            2,                          // how many to generate
            true,                    // return model
            generateListingItemParams           // what kind of data to generate
        ) as resources.ListingItem[];

    });

    test('Should add ListingItem to ShoppingCart using id', async () => {
        const res = await testUtil.rpc(shoppingCartItemCommand, [shoppingCartItemAddCommand,
            defaultShoppingCart.id,
            listingItems[0].id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.shoppingCartId).toBe(defaultShoppingCart.id);
        expect(result.listingItemId).toBe(listingItems[0].id);
    });

    test('Should add ListingItem to ShoppingCart using hash', async () => {
        const res = await testUtil.rpc(shoppingCartItemCommand, [shoppingCartItemAddCommand,
            defaultShoppingCart.id,
            listingItems[1].hash
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.shoppingCartId).toBe(defaultShoppingCart.id);
        expect(result.listingItemId).toBe(listingItems[1].id);
    });

    test('Should not add ListingItem to ShoppingCart because its already added', async () => {
        const res = await testUtil.rpc(shoppingCartItemCommand, [shoppingCartItemAddCommand,
            defaultShoppingCart.id,
            listingItems[0].id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(`ListingItem already exist in ShoppingCart`);
    });

    test('Should fail because missing parameters', async () => {
        const res = await testUtil.rpc(shoppingCartItemCommand, [shoppingCartItemAddCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(`cartId and listingItemId can\'t be blank`);
    });

});
