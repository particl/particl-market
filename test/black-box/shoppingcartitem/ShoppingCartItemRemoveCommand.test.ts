// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { GenerateListingItemParams } from '../../../src/api/requests/testdata/GenerateListingItemParams';
import * as resources from 'resources';

describe('ShoppingCartItemRemoveCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const shoppingCartItemCommand = Commands.SHOPPINGCARTITEM_ROOT.commandName;
    const shoppingCartItemRemoveCommand = Commands.SHOPPINGCARTITEM_REMOVE.commandName;

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

        // add ListingItem to ShoppingCart
        let res = await testUtil.rpc(shoppingCartItemCommand, [Commands.SHOPPINGCARTITEM_ADD.commandName,
            defaultShoppingCart.id,
            listingItems[0].id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        // add second ListingItem to ShoppingCart
        res = await testUtil.rpc(shoppingCartItemCommand, [Commands.SHOPPINGCARTITEM_ADD.commandName,
            defaultShoppingCart.id,
            listingItems[1].id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

    });

    test('Should remove ShoppingCartItem from ShoppingCart using listingItem.id', async () => {
        const res = await testUtil.rpc(shoppingCartItemCommand, [shoppingCartItemRemoveCommand,
            defaultShoppingCart.id,
            listingItems[0].id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
    });

    test('Should remove ShoppingCartItem from ShoppingCart using listingItem.hash', async () => {
        const res = await testUtil.rpc(shoppingCartItemCommand, [shoppingCartItemRemoveCommand,
            defaultShoppingCart.id,
            listingItems[1].id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
    });

    test('Should fail to remove ShoppingCartItem from ShoppingCart using listingItem.hash because its allready removed', async () => {
        const res = await testUtil.rpc(shoppingCartItemCommand, [shoppingCartItemRemoveCommand,
            defaultShoppingCart.id,
            listingItems[0].hash
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(`listing item not exist on shopping cart`);
    });

    test('Should fail to remove when missing parameters', async () => {
        const res = await testUtil.rpc(shoppingCartItemCommand, [shoppingCartItemRemoveCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(`cartId and listingItemId can\'t be blank`);
    });

});
