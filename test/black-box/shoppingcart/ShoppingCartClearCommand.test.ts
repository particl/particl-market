// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { Logger as LoggerType } from '../../../src/core/Logger';
import * as resources from 'resources';
import { GenerateListingItemParams } from '../../../src/api/requests/params/GenerateListingItemParams';

describe('ShoppingCartClearCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const shoppingCartCommand = Commands.SHOPPINGCART_ROOT.commandName;
    const shoppingCartClearCommand = Commands.SHOPPINGCART_CLEAR.commandName;
    const cartItemCommand = Commands.SHOPPINGCARTITEM_ROOT.commandName;
    const cartItemAddCommand = Commands.SHOPPINGCARTITEM_ADD.commandName;
    const cartItemListCommand = Commands.SHOPPINGCARTITEM_LIST.commandName;

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

        // add listingItem to shoppingCart
        let res = await testUtil.rpc(cartItemCommand, [cartItemAddCommand,
            defaultShoppingCart.id,
            listingItems[0].id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        // add listingItem to shoppingCart
        res = await testUtil.rpc(cartItemCommand, [cartItemAddCommand,
            defaultShoppingCart.id,
            listingItems[1].id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        // check listingItem is added
        res = await testUtil.rpc(cartItemCommand, [cartItemListCommand,
            defaultShoppingCart.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(2);
    });

    test('Should clear ShoppingCart', async () => {
        // clear cart
        let res = await testUtil.rpc(shoppingCartCommand, [shoppingCartClearCommand, defaultShoppingCart.id]);
        res.expectJson();
        res.expectStatusCode(200);

        // check shopping cart is clear or not
        res = await testUtil.rpc(cartItemCommand, [cartItemListCommand, defaultShoppingCart.id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(0);
    });

});
