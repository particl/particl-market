import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Commands } from '../../src/api/commands/CommandEnumType';

describe('ShoppingCartGetCommand', () => {
    const testUtil = new BlackBoxTestUtil();

    const method = Commands.SHOPPINGCART_ROOT.commandName;
    const subCommand = Commands.SHOPPINGCART_GET.commandName;

    let defaultShoppingCart;
    let defaultProfile;

    beforeAll(async () => {
        await testUtil.cleanDb([]);
        defaultProfile = await testUtil.getDefaultProfile();
        defaultShoppingCart = defaultProfile.ShoppingCarts[0];
    });

    test('Should get a default Shopping Cart', async () => {
        const res = await rpc(method, [subCommand, defaultShoppingCart.id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.name).toBe('DEFAULT');
    });

    test('Should get new Shopping Cart', async () => {
        // add new shopping cart
        const shoppingName = 'new cart';
        const resAdd = await rpc(method, [Commands.SHOPPINGCART_ADD.commandName, shoppingName, defaultProfile.id]);
        resAdd.expectJson();
        resAdd.expectStatusCode(200);
        const resultAdd: any = resAdd.getBody()['result'];

        const res = await rpc(method, [subCommand, resultAdd.id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.name).toBe(shoppingName);
        expect(result.profileId).toBe(defaultProfile.id);
        defaultShoppingCart = result;
    });


    test('Should not get Shopping Cart when identifier not exist', async () => {
        const resRemove = await rpc(method, [Commands.SHOPPINGCART_REMOVE.commandName, defaultShoppingCart.id]);
        resRemove.expectJson();
        resRemove.expectStatusCode(200);

        const res = await rpc(method, [subCommand, defaultShoppingCart.id]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(`Entity with identifier ${defaultShoppingCart.id} does not exist`);
    });

});
