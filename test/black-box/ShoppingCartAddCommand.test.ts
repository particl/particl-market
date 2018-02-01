import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Commands } from '../../src/api/commands/CommandEnumType';

describe('ShoppingCartAddCommand', () => {
    const testUtil = new BlackBoxTestUtil();

    const method = Commands.SHOPPINGCART_ROOT.commandName;
    const subCommand = Commands.SHOPPINGCART_ADD.commandName;

    let defaultProfile;
    const shoppingCartName = 'Test Shopping Cart';

    beforeAll(async () => {
        await testUtil.cleanDb([]);
        defaultProfile = await testUtil.getDefaultProfile();
    });

    test('Should create a new Shopping Cart', async () => {

        const res = await rpc(method, [subCommand, shoppingCartName, defaultProfile.id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.name).toBe(shoppingCartName);
        expect(result.profileId).toBe(defaultProfile.id);
    });

    test('Should fail because we want to create an empty shoppingCart', async () => {
        const res = await rpc(method, [subCommand]);
        res.expectJson();
        res.expectStatusCode(400);
    });
});
