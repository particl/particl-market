import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Commands } from '../../src/api/commands/CommandEnumType';

describe('ShoppingCartListCommand', () => {
    const testUtil = new BlackBoxTestUtil();

    const method = Commands.SHOPPINGCART_ROOT.commandName;
    const subCommand = Commands.SHOPPINGCART_LIST.commandName;

    let defaultProfile;

    beforeAll(async () => {
        await testUtil.cleanDb([]);
        defaultProfile = await testUtil.getDefaultProfile();
    });

    test('Should get a default Shopping Cart by profileId', async () => {
        const res = await rpc(method, [subCommand, defaultProfile.id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(1);
    });

    test('Should get a default Shopping Cart by profile name', async () => {
        const res = await rpc(method, [subCommand, defaultProfile.name]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(1);
    });

    test('Should get zero shopping cart if profile id non exist', async () => {
        const res = await rpc(method, [subCommand, 123123]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(0);
    });

    test('Should get two Shopping Cart by profileId', async () => {
        // add new shopping cart
        const resAdd = await rpc(method, [Commands.SHOPPINGCART_ADD.commandName, 'shopping cart name', defaultProfile.id]);
        resAdd.expectJson();
        resAdd.expectStatusCode(200);

        const res = await rpc(method, [subCommand, defaultProfile.id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(2);
    });

    test('Should get two Shopping Cart by profile name', async () => {
        const res = await rpc(method, [subCommand, defaultProfile.name]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(2);
    });
});
