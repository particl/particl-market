import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Commands } from '../../src/api/commands/CommandEnumType';

describe('ShoppingCartUpdateCommand', () => {
    const testUtil = new BlackBoxTestUtil();

    const method = Commands.SHOPPINGCART_ROOT.commandName;
    const subCommand = Commands.SHOPPINGCART_UPDATE.commandName;

    let defaultShoppingCart;
    const shoppingCartName = 'New Shopping Cart';

    beforeAll(async () => {
        await testUtil.cleanDb([]);
        const defaultProfile = await testUtil.getDefaultProfile();
        defaultShoppingCart = defaultProfile.ShoppingCarts[0];
    });

    test('Should update Shopping Cart', async () => {
        const res = await rpc(method, [subCommand, defaultShoppingCart.id, shoppingCartName]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.name).toBe(shoppingCartName);
    });

    test('Should fail because we want to update an empty shoppingCart', async () => {
        const res = await rpc(method, [subCommand]);
        res.expectJson();
        res.expectStatusCode(400);
    });
});
