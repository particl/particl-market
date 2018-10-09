// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { GenerateListingItemParams } from '../../../src/api/requests/params/GenerateListingItemParams';
import * as resources from 'resources';

describe('ShoppingCartItemListCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const shoppingCartItemCommand = Commands.SHOPPINGCARTITEM_ROOT.commandName;
    const shoppingCartItemListCommand = Commands.SHOPPINGCARTITEM_LIST.commandName;
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
        listingItems = await testUtil.generateData(
            CreatableModel.LISTINGITEM,         // what to generate
            2,                          // how many to generate
            true,                    // return model
            generateListingItemParams           // what kind of data to generate
        ) as resources.ListingItem[];

    });

    test('Should list ShoppingCartItems in the ShoppingCart: 0', async () => {
        const res = await testUtil.rpc(shoppingCartItemCommand, [shoppingCartItemListCommand, defaultShoppingCart.id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(0);
    });

    test('Should list ShoppingCartItems in the ShoppingCart: 1', async () => {
        let res = await testUtil.rpc(shoppingCartItemCommand, [shoppingCartItemAddCommand,
            defaultShoppingCart.id,
            listingItems[0].hash
        ]);

        res = await testUtil.rpc(shoppingCartItemCommand, [shoppingCartItemListCommand, defaultShoppingCart.id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(1);
    });

    test('Should list ShoppingCartItems in the ShoppingCart: 1', async () => {
        let res = await testUtil.rpc(shoppingCartItemCommand, [shoppingCartItemAddCommand,
            defaultShoppingCart.id,
            listingItems[1].hash
        ]);

        res = await testUtil.rpc(shoppingCartItemCommand, [shoppingCartItemListCommand, defaultShoppingCart.id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(2);
    });
});
