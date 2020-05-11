// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';

describe('ShoppingCartListCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const shoppingCartCommand = Commands.SHOPPINGCART_ROOT.commandName;
    const shoppingCartListCommand = Commands.SHOPPINGCART_LIST.commandName;
    const shoppingCartAddCommand = Commands.SHOPPINGCART_ADD.commandName;

    let defaultProfile: resources.Profile;
    const secondShoppingCartName = 'NEW_CART_NAME';

    beforeAll(async () => {
        await testUtil.cleanDb();
        defaultProfile = await testUtil.getDefaultProfile();
    });

    test('Should fail to list ShoppingCarts because missing profileId', async () => {
        const res = await testUtil.rpc(shoppingCartCommand, [shoppingCartListCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('profileId').getMessage());
    });

    test('Should fail to list ShoppingCarts because of invalid profileId', async () => {
        const res = await testUtil.rpc(shoppingCartCommand, [shoppingCartListCommand,
            'INVALID-PROFILE-ID'
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('profileId', 'number').getMessage());
    });

    test('Should fail to list ShoppingCarts because Profile not found', async () => {
        const res = await testUtil.rpc(shoppingCartCommand, [shoppingCartListCommand,
            0
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('Profile').getMessage());
    });

    test('Should get a ShoppingCart by profileId', async () => {
        const res = await testUtil.rpc(shoppingCartCommand, [shoppingCartListCommand,
            defaultProfile.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(1);
        expect(result[0].Profile).not.toBeDefined();
        expect(result[0].ShoppingCartItems).not.toBeDefined();
        expect(result[0].name).toBe('DEFAULT');
        expect(result[0].profileId).toBe(defaultProfile.id);
    });

    test('Should get two ShoppingCarts by profileId', async () => {

        const resAdd = await testUtil.rpc(shoppingCartCommand, [shoppingCartAddCommand,
            secondShoppingCartName, defaultProfile.id
        ]);
        resAdd.expectJson();
        resAdd.expectStatusCode(200);

        const res = await testUtil.rpc(shoppingCartCommand, [shoppingCartListCommand,
            defaultProfile.id
        ]);
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
