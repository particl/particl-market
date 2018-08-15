// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { rpc, api } from '../lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';

describe('ShoppingCartClearCommand', () => {
    const testUtil = new BlackBoxTestUtil();

    const shoppingCartCommand = Commands.SHOPPINGCART_ROOT.commandName;
    const shoppingCartClearCommand = Commands.SHOPPINGCART_CLEAR.commandName;

    const cartItemCommand = Commands.SHOPPINGCARTITEM_ROOT.commandName;
    const cartItemAddCommand = Commands.SHOPPINGCARTITEM_ADD.commandName;
    const cartItemListCommand = Commands.SHOPPINGCARTITEM_LIST.commandName;

    let defaultShoppingCart;
    let listingItems;

    beforeAll(async () => {
        await testUtil.cleanDb();
        const defaultProfile = await testUtil.getDefaultProfile();
        defaultShoppingCart = defaultProfile.ShoppingCart[0];
        listingItems = await testUtil.generateData(CreatableModel.LISTINGITEM, 2);

        let listingItem = listingItems[0];
        // add listingItem to shoppingCart
        const resAdd = await rpc(cartItemCommand, [cartItemAddCommand, defaultShoppingCart.id, listingItem.id]);
        resAdd.expectJson();
        resAdd.expectStatusCode(200);

        listingItem = listingItems[1];
        // add lisgingItem to shoppingCart
        const resAdd2 = await rpc(cartItemCommand, [cartItemAddCommand, defaultShoppingCart.id, listingItem.id]);
        resAdd2.expectJson();
        resAdd2.expectStatusCode(200);

        // check listingItem is added
        const resList = await rpc(cartItemCommand, [cartItemListCommand, defaultShoppingCart.id]);
        resList.expectJson();
        resList.expectStatusCode(200);
        const result: any = resList.getBody()['result'];
        expect(result).toHaveLength(2);
    });

    test('Should clear ShoppingCart', async () => {

        // clear cart
        const res = await rpc(shoppingCartCommand, [shoppingCartClearCommand, defaultShoppingCart.id]);
        res.expectJson();
        res.expectStatusCode(200);

        // check shopping cart is clear or not
        const resList2 = await rpc(cartItemCommand, [cartItemListCommand, defaultShoppingCart.id]);
        resList2.expectJson();
        resList2.expectStatusCode(200);
        const result2: any = resList2.getBody()['result'];
        expect(result2).toHaveLength(0);
    });

});
