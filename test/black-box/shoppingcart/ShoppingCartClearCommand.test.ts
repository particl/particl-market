// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { GenerateListingItemParams } from '../../../src/api/requests/testdata/GenerateListingItemParams';

describe('ShoppingCartClearCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const shoppingCartCommand = Commands.SHOPPINGCART_ROOT.commandName;
    const shoppingCartClearCommand = Commands.SHOPPINGCART_CLEAR.commandName;
    const cartItemCommand = Commands.SHOPPINGCARTITEM_ROOT.commandName;
    const cartItemAddCommand = Commands.SHOPPINGCARTITEM_ADD.commandName;
    const cartItemListCommand = Commands.SHOPPINGCARTITEM_LIST.commandName;

    let profile: resources.Profile;
    let market: resources.Market;
    let shoppingCart: resources.ShoppingCart;

    let listingItems: resources.ListingItem[];

    beforeAll(async () => {
        await testUtil.cleanDb();

        // get default profile and market
        profile = await testUtil.getDefaultProfile();
        expect(profile.id).toBeDefined();
        market = await testUtil.getDefaultMarket(profile.id);
        expect(market.id).toBeDefined();

        shoppingCart = profile.ShoppingCart[0];

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

        // add listingItem to shoppingCart
        let res = await testUtil.rpc(cartItemCommand, [cartItemAddCommand,
            shoppingCart.id,
            listingItems[0].id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        // add listingItem to shoppingCart
        res = await testUtil.rpc(cartItemCommand, [cartItemAddCommand,
            shoppingCart.id,
            listingItems[1].id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        // check listingItem is added
        res = await testUtil.rpc(cartItemCommand, [cartItemListCommand,
            shoppingCart.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(2);
    });

    test('Should clear ShoppingCart', async () => {
        // clear cart
        let res = await testUtil.rpc(shoppingCartCommand, [shoppingCartClearCommand, shoppingCart.id]);
        res.expectJson();
        res.expectStatusCode(200);

        // check shopping cart is clear or not
        res = await testUtil.rpc(cartItemCommand, [cartItemListCommand, shoppingCart.id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(0);
    });

});
