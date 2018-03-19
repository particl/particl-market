import * as _ from 'lodash';
import { api, rpc } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Commands } from '../../src/api/commands/CommandEnumType';

describe('/ProfileGetCommand', () => {
    const testUtil = new BlackBoxTestUtil();
    const method = Commands.PROFILE_ROOT.commandName;
    const subCommand = Commands.PROFILE_GET.commandName;

    const keys = [
        'id', 'name', 'updatedAt', 'createdAt'
    ];

    const profileName = 'DEFAULT-TEST-PROFILE';
    const profileAddress = 'DEFAULT-TEST-ADDRESS';

    let createdId;
    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    test('Should return one profile by ID', async () => {
        // created profile
        const res = await rpc(method, [Commands.PROFILE_ADD.commandName, profileName, profileAddress]);
        // call rpc api
        res.expectJson();
        res.expectStatusCode(200);
        res.expectDataRpc(keys);
        const result: object = res.getBody()['result'];
        createdId = result['id'];
        // get profile
        const resMain = await rpc(method, [subCommand, createdId]);
        resMain.expectJson();
        resMain.expectStatusCode(200);
        resMain.expectDataRpc(keys);
        const resultMain: any = resMain.getBody()['result'];
        expect(resultMain.id).toBe(createdId);
        expect(resultMain.name).toBe(profileName);
        expect(resultMain.address).toBe(profileAddress);
        expect(resultMain.CryptocurrencyAddresses).toBeDefined();
        expect(resultMain.FavoriteItems).toBeDefined();
        expect(resultMain.ShippingAddresses).toBeDefined();
        expect(resultMain.ShoppingCart).toBeDefined();
    });

    test('Should return one profile by Name', async () => {
        const resMain = await rpc(method, [subCommand, profileName]);
        resMain.expectJson();
        resMain.expectStatusCode(200);
        resMain.expectDataRpc(keys);
        const resultMain: any = resMain.getBody()['result'];
        expect(resultMain.id).toBe(createdId);
        expect(resultMain.name).toBe(profileName);
        expect(resultMain.address).toBe(profileAddress);
        expect(resultMain.CryptocurrencyAddresses).toBeDefined();
        expect(resultMain.FavoriteItems).toBeDefined();
        expect(resultMain.ShippingAddresses).toBeDefined();
        expect(resultMain.ShoppingCart).toBeDefined();
    });

    test('Should return null profile by invalid Name', async () => {
        const resMain = await rpc(method, [subCommand, 'profileName']);
        resMain.expectJson();
        resMain.expectStatusCode(200);
        const resultMain: any = resMain.getBody()['result'];
        expect(resultMain).toBeNull();
    });

    test('Should return null profile by invalid Id', async () => {
        const resMain = await rpc(method, [subCommand, 123123]);
        resMain.expectJson();
        resMain.expectStatusCode(404);
    });

});
