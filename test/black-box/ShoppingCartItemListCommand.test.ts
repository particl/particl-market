import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Commands } from '../../src/api/commands/CommandEnumType';

describe('ShoppingCartItemListCommand', () => {
    const testUtil = new BlackBoxTestUtil();

    const method = Commands.SHOPPINGCARTITEM_ROOT.commandName;
    const subCommand = Commands.SHOPPINGCARTITEM_LIST.commandName;

    let defaultShoppingCart;
    let listingItems;

    beforeAll(async () => {
        await testUtil.cleanDb([]);
        const defaultProfile = await testUtil.getDefaultProfile();
        defaultShoppingCart = defaultProfile.ShoppingCarts[0];
        // listing-item
        listingItems = await testUtil.generateData('listingitem', 2);
    });

    test('Should get zero listingItem of Shopping Cart', async () => {
        const res = await rpc(method, [subCommand, defaultShoppingCart.id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(0);
    });

    test('Should get listingItem of Shopping Cart', async () => {
        // add lisgingItem to shoppingCart
        const resAdd = await rpc(method, [Commands.SHOPPINGCARTITEM_ADD.commandName, defaultShoppingCart.id, listingItems[0].id]);
        resAdd.expectJson();
        resAdd.expectStatusCode(200);

        // add lisgingItem to shoppingCart
        const resAdd2 = await rpc(method, [Commands.SHOPPINGCARTITEM_ADD.commandName, defaultShoppingCart.id, listingItems[1].id]);
        resAdd2.expectJson();
        resAdd2.expectStatusCode(200);

        const res = await rpc(method, [subCommand, defaultShoppingCart.id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(2);
    });


});
