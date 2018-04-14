import { rpc, api } from '../lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';

describe('ShoppingCartItemRemoveCommand', () => {
    const testUtil = new BlackBoxTestUtil();

    const method = Commands.SHOPPINGCARTITEM_ROOT.commandName;
    const subCommand = Commands.SHOPPINGCARTITEM_REMOVE.commandName;

    let defaultProfile;
    let defaultShoppingCart;
    let listingItems;

    beforeAll(async () => {
        await testUtil.cleanDb();
        defaultProfile = await testUtil.getDefaultProfile();
        defaultShoppingCart = defaultProfile.ShoppingCart[0];
        // listing-item
        listingItems = await testUtil.generateData('listingitem', 2);
    });

    test('Should remove listingItem(id) to Shopping Cart', async () => {
        const listingItem = listingItems[0];
        // add lisgingItem to shoppingCart
        const resAdd = await rpc(method, [Commands.SHOPPINGCARTITEM_ADD.commandName, defaultShoppingCart.id, listingItem.id]);
        resAdd.expectJson();
        resAdd.expectStatusCode(200);

        const res = await rpc(method, [subCommand, defaultShoppingCart.id, listingItem.id]);
        res.expectJson();
        res.expectStatusCode(200);
    });

    test('Should remove listingItem(hash) to Shopping Cart', async () => {
        const listingItem = listingItems[1];
        // add lisgingItem to shoppingCart
        const resAdd = await rpc(method, [Commands.SHOPPINGCARTITEM_ADD.commandName, defaultShoppingCart.id, listingItem.id]);
        resAdd.expectJson();
        resAdd.expectStatusCode(200);

        const res = await rpc(method, [subCommand, defaultShoppingCart.id, listingItem.id]);
        res.expectJson();
        res.expectStatusCode(200);
    });

    test('Should not remove listingItem(id) to Shopping Cart if listingItem not exist in cart', async () => {
        const listingItem = listingItems[1];
        const res = await rpc(method, [subCommand, defaultShoppingCart.id, listingItem.hash]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(`listing item not exist on shopping cart`);
    });

    test('Should fail remove listingItem to Shopping Cart if pass empty data', async () => {
        const listingItem = listingItems[1];
        const res = await rpc(method, [subCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(`cartId and listingItemId can\'t be blank`);
    });

});
