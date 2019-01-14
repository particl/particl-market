// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { Logger as LoggerType } from '../../../src/core/Logger';
import * as resources from 'resources';

describe('ShoppingCartListCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const shoppingCartCommand = Commands.SHOPPINGCART_ROOT.commandName;
    const shoppingCartListCommand = Commands.SHOPPINGCART_LIST.commandName;

    let defaultProfile: resources.Profile;
    const secondShoppingCartName = 'NEW_CART_NAME';

    beforeAll(async () => {
        await testUtil.cleanDb();
        defaultProfile = await testUtil.getDefaultProfile();
    });

    test('Should get a ShoppingCart by profileId', async () => {
        const res = await testUtil.rpc(shoppingCartCommand, [shoppingCartListCommand, defaultProfile.id]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(1);
        expect(result[0].Profile).not.toBeDefined();
        expect(result[0].ShoppingCartItems).not.toBeDefined();
        expect(result[0].name).toBe('DEFAULT');
        expect(result[0].profileId).toBe(defaultProfile.id);
    });

    test('Should get a ShoppingCart by profileName', async () => {
        const res = await testUtil.rpc(shoppingCartCommand, [shoppingCartListCommand, defaultProfile.name]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(1);
        expect(result[0].Profile).not.toBeDefined();
        expect(result[0].ShoppingCartItems).not.toBeDefined();
        expect(result[0].name).toBe('DEFAULT');
        expect(result[0].profileId).toBe(defaultProfile.id);
    });

    test('Should fail to get ShoppingCart if profileId doesnt exist', async () => {
        const invalidProfileId = 0;
        const res = await testUtil.rpc(shoppingCartCommand, [shoppingCartListCommand, invalidProfileId]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(`Entity with identifier ${invalidProfileId} does not exist`);
    });

    test('Should fail to get ShoppingCart if profileName doesnt exist', async () => {
        const invalidProfileName = 'invalid_name';
        const res = await testUtil.rpc(shoppingCartCommand, [shoppingCartListCommand, invalidProfileName]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(`Entity with identifier ${invalidProfileName} does not exist`);
    });

    test('Should get two ShoppingCarts by profileId', async () => {

        const resAdd = await testUtil.rpc(shoppingCartCommand, [Commands.SHOPPINGCART_ADD.commandName, secondShoppingCartName, defaultProfile.id]);
        resAdd.expectJson();
        resAdd.expectStatusCode(200);

        const res = await testUtil.rpc(shoppingCartCommand, [shoppingCartListCommand, defaultProfile.id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(2);

        expect(result[0].Profile).not.toBeDefined();
        expect(result[0].ShoppingCartItems).not.toBeDefined();
        expect(result[0].name).toBe('DEFAULT');
        expect(result[0].profileId).toBe(defaultProfile.id);

        expect(result[1].Profile).not.toBeDefined();
        expect(result[1].ShoppingCartItems).not.toBeDefined();
        expect(result[1].name).toBe(secondShoppingCartName);
        expect(result[1].profileId).toBe(defaultProfile.id);
    });

    test('Should get two ShoppingCarts by profileName', async () => {

        const res = await testUtil.rpc(shoppingCartCommand, [shoppingCartListCommand, defaultProfile.name]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(2);

        expect(result[0].Profile).not.toBeDefined();
        expect(result[0].ShoppingCartItems).not.toBeDefined();
        expect(result[0].name).toBe('DEFAULT');
        expect(result[0].profileId).toBe(defaultProfile.id);

        expect(result[1].Profile).not.toBeDefined();
        expect(result[1].ShoppingCartItems).not.toBeDefined();
        expect(result[1].name).toBe(secondShoppingCartName);
        expect(result[1].profileId).toBe(defaultProfile.id);
    });
});
