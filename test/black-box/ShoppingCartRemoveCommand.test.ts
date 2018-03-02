import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Commands } from '../../src/api/commands/CommandEnumType';

describe('ShoppingCartRemoveCommand', () => {
    const testUtil = new BlackBoxTestUtil();

    const method = Commands.SHOPPINGCART_ROOT.commandName;
    const subCommand = Commands.SHOPPINGCART_REMOVE.commandName;

    let shoppingCartId;

    beforeAll(async () => {
        await testUtil.cleanDb([]);
        const defaultProfile = await testUtil.getDefaultProfile();
        const res = await rpc(method, [Commands.SHOPPINGCART_ADD.commandName, 'New Shopping Cart', defaultProfile.id]);
        shoppingCartId = res.getBody()['result'].id;
    });

    test('Should remove a Shopping Cart', async () => {
        const res = await rpc(method, [subCommand, shoppingCartId]);
        res.expectJson();
        res.expectStatusCode(200);
    });

    test('Should fail because we want to remove non-existing shoppingCart', async () => {
        const res = await rpc(method, [subCommand, shoppingCartId]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(`Entity with identifier ${shoppingCartId} does not exist`);

    });
});
