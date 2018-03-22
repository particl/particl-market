import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Commands } from '../../src/api/commands/CommandEnumType';

describe('ShoppingCartItemAddCommand', () => {
    const testUtil = new BlackBoxTestUtil();

    const method = Commands.SHOPPINGCARTITEM_ROOT.commandName;
    const subCommand = Commands.SHOPPINGCARTITEM_ADD.commandName;

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

    test('Should add listingItem(id) to Shopping Cart', async () => {
        const listingItem = listingItems[0];
        const res = await rpc(method, [subCommand, defaultShoppingCart.id, listingItem.id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.shoppingCartId).toBe(defaultShoppingCart.id);
        expect(result.listingItemId).toBe(listingItem.id);
    });

    test('Should add listingItem(hash) to Shopping Cart', async () => {
        const listingItem = listingItems[1];
        const res = await rpc(method, [subCommand, defaultShoppingCart.id, listingItem.hash]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.shoppingCartId).toBe(defaultShoppingCart.id);
        expect(result.listingItemId).toBe(listingItem.id);
    });

    test('Should not add listingItem(id) to Shopping Cart because its already added', async () => {
        const listingItem = listingItems[0];
        const res = await rpc(method, [subCommand, defaultShoppingCart.id, listingItem.id]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(`listing item already exist on shopping cart`);
    });

    test('Should fail because we want to add an empty shoppingCartItem', async () => {
        const res = await rpc(method, [subCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(`cartId and listingItemId can\'t be blank`);
    });

});
