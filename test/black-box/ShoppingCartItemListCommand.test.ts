import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Commands } from '../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../src/api/enums/CreatableModel';

describe('ShoppingCartItemListCommand', () => {
    const testUtil = new BlackBoxTestUtil();

    const method = Commands.SHOPPINGCARTITEM_ROOT.commandName;
    const subCommand = Commands.SHOPPINGCARTITEM_LIST.commandName;

    let defaultShoppingCart;
    let listingItems;

    beforeAll(async () => {
        await testUtil.cleanDb();
        const defaultProfile = await testUtil.getDefaultProfile();
        defaultShoppingCart = defaultProfile.ShoppingCarts[0];
        // listing-item
        listingItems = await testUtil.generateData(CreatableModel.LISTINGITEM, 2);
    });

    test('Should get blank shopping cart items', async () => {
        const res = await rpc(method, [subCommand, defaultShoppingCart.id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(0);
    });

    test('Should get one shopping cart item with default related = true', async () => {
        // add lisgingItem to shoppingCart
        const resAdd = await rpc(method, [Commands.SHOPPINGCARTITEM_ADD.commandName, defaultShoppingCart.id, listingItems[0].id]);
        resAdd.expectJson();
        resAdd.expectStatusCode(200);

        // get list of shoppingCartItems
        const res = await rpc(method, [subCommand, defaultShoppingCart.id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(1);
        expect(result[0].ListingItem).toBeDefined();
        expect(result[0].ListingItem.ItemInformation).toBeDefined();
        expect(result[0].ListingItem.ItemInformation.ItemImages).toBeDefined();

    });


    test('Should get two shopping cart item with related = true', async () => {
        // add lisgingItem to shoppingCart
        const resAdd2 = await rpc(method, [Commands.SHOPPINGCARTITEM_ADD.commandName, defaultShoppingCart.id, listingItems[1].id]);
        resAdd2.expectJson();
        resAdd2.expectStatusCode(200);

        // get list of shoppingCartItems
        const res = await rpc(method, [subCommand, defaultShoppingCart.id, true]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(2);
        expect(result[0].ListingItem).toBeDefined();
        expect(result[0].ListingItem.ItemInformation).toBeDefined();
        expect(result[0].ListingItem.ItemInformation.ItemImages).toBeDefined();
    });

    test('Should get two shopping cart item without related', async () => {
        // get list of shoppingCartItems
        const res = await rpc(method, [subCommand, defaultShoppingCart.id, false]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(2);
        expect(result[0].ListingItem).not.toBeDefined();
    });

});
