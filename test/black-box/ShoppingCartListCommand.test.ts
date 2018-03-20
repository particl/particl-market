import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Commands } from '../../src/api/commands/CommandEnumType';

describe('ShoppingCartListCommand', () => {
    const testUtil = new BlackBoxTestUtil();

    const method = Commands.SHOPPINGCART_ROOT.commandName;
    const subCommand = Commands.SHOPPINGCART_LIST.commandName;

    let defaultProfile;
    const secondShoppingCartName = 'shopping cart test';

    beforeAll(async () => {
        await testUtil.cleanDb();
        defaultProfile = await testUtil.getDefaultProfile();
    });

    test('Should get a default Shopping Cart by profileId', async () => {
        const res = await rpc(method, [subCommand, defaultProfile.id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(1);
        expect(result[0].Profile).not.toBeDefined();
        expect(result[0].ShoppingCartItem).not.toBeDefined();
        expect(result[0].name).toBe('DEFAULT');
        expect(result[0].profileId).toBe(defaultProfile.id);
    });

    test('Should get a default Shopping Cart by profile name', async () => {
        const res = await rpc(method, [subCommand, defaultProfile.name]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(1);
        expect(result[0].Profile).not.toBeDefined();
        expect(result[0].ShoppingCartItem).not.toBeDefined();
        expect(result[0].name).toBe('DEFAULT');
        expect(result[0].profileId).toBe(defaultProfile.id);
    });

    test('Should fail to get shopping cart if profile id non exist', async () => {
        const fakeProfileId = 123123;
        const res = await rpc(method, [subCommand, fakeProfileId]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(`Entity with identifier ${fakeProfileId} does not exist`);
    });

    test('Should fail to get shopping cart if profile name non exist', async () => {
        const fakeProfileName = 'Test User';
        const res = await rpc(method, [subCommand, fakeProfileName]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(`Profile with the name = ${fakeProfileName} was not found!`);
    });

    test('Should get two Shopping Cart by profileId', async () => {
        // add new shopping cart
        const resAdd = await rpc(method, [Commands.SHOPPINGCART_ADD.commandName, secondShoppingCartName, defaultProfile.id]);
        resAdd.expectJson();
        resAdd.expectStatusCode(200);

        const res = await rpc(method, [subCommand, defaultProfile.id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(2);

        expect(result[0].Profile).not.toBeDefined();
        expect(result[0].ShoppingCartItem).not.toBeDefined();
        expect(result[0].name).toBe('DEFAULT');
        expect(result[0].profileId).toBe(defaultProfile.id);

        expect(result[1].Profile).not.toBeDefined();
        expect(result[1].ShoppingCartItem).not.toBeDefined();
        expect(result[1].name).toBe(secondShoppingCartName);
        expect(result[1].profileId).toBe(defaultProfile.id);
    });

    test('Should get two Shopping Cart by profile name', async () => {
        const res = await rpc(method, [subCommand, defaultProfile.name]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(2);

        expect(result[0].Profile).not.toBeDefined();
        expect(result[0].ShoppingCartItem).not.toBeDefined();
        expect(result[0].name).toBe('DEFAULT');
        expect(result[0].profileId).toBe(defaultProfile.id);

        expect(result[1].Profile).not.toBeDefined();
        expect(result[1].ShoppingCartItem).not.toBeDefined();
        expect(result[1].name).toBe(secondShoppingCartName);
        expect(result[1].profileId).toBe(defaultProfile.id);
    });
});
