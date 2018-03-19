import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Commands } from '../../src/api/commands/CommandEnumType';

describe('ShoppingCartClearCommand', () => {
    const testUtil = new BlackBoxTestUtil();

    const method = Commands.SHOPPINGCART_ROOT.commandName;
    const subCommand = Commands.SHOPPINGCART_CLEAR.commandName;

    const methodItem = Commands.SHOPPINGCARTITEM_ROOT.commandName;
    const subCommandItem = Commands.SHOPPINGCARTITEM_ADD.commandName;
    const subCommandItemList = Commands.SHOPPINGCARTITEM_LIST.commandName;

    let defaultShoppingCart;
    let listingItems;

    beforeAll(async () => {
        await testUtil.cleanDb();
        const defaultProfile = await testUtil.getDefaultProfile();
        defaultShoppingCart = defaultProfile.ShoppingCart[0];
        listingItems = await testUtil.generateData('listingitem', 2);
    });

    test('Should clear shopping cart', async () => {
        let listingItem = listingItems[0];
        // add lisgingItem to shoppingCart
        const resAdd = await rpc(methodItem, [subCommandItem, defaultShoppingCart.id, listingItem.id]);
        resAdd.expectJson();
        resAdd.expectStatusCode(200);

        listingItem = listingItems[1];
        // add lisgingItem to shoppingCart
        const resAdd2 = await rpc(methodItem, [subCommandItem, defaultShoppingCart.id, listingItem.id]);
        resAdd2.expectJson();
        resAdd2.expectStatusCode(200);

        // check listingItem is added
        const resList = await rpc(methodItem, [subCommandItemList, defaultShoppingCart.id]);
        resList.expectJson();
        resList.expectStatusCode(200);
        const result: any = resList.getBody()['result'];
        expect(result).toHaveLength(2);

        // clear cart
        const res = await rpc(method, [subCommand, defaultShoppingCart.id]);
        res.expectJson();
        res.expectStatusCode(200);

        // check shopping cart is clear or not
        const resList2 = await rpc(methodItem, [subCommandItemList, defaultShoppingCart.id]);
        resList2.expectJson();
        resList2.expectStatusCode(200);
        const result2: any = resList2.getBody()['result'];
        expect(result2).toHaveLength(0);
    });

});
