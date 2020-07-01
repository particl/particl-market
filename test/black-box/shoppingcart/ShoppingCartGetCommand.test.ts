// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';

describe('ShoppingCartGetCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const shoppingCartCommand = Commands.SHOPPINGCART_ROOT.commandName;
    const shoppingCartGetCommand = Commands.SHOPPINGCART_GET.commandName;
    const shoppingCartAddCommand = Commands.SHOPPINGCART_ADD.commandName;

    let profile: resources.Profile;
    let market: resources.Market;

    let defaultShoppingCart: resources.ShoppingCart;
    let secondShoppingCart: resources.ShoppingCart;

    beforeAll(async () => {
        await testUtil.cleanDb();

        profile = await testUtil.getDefaultProfile();
        expect(profile.id).toBeDefined();
        market = await testUtil.getDefaultMarket(profile.id);
        expect(market.id).toBeDefined();

        defaultShoppingCart = profile.ShoppingCart[0];

        // add a second shopping cart
        const res = await testUtil.rpc(shoppingCartCommand, [shoppingCartAddCommand,
            profile.id,
            'TEST-CART-NAME'
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        secondShoppingCart = res.getBody()['result'];

    });

    test('Should fail because missing cartId', async () => {
        const res = await testUtil.rpc(shoppingCartCommand, [shoppingCartGetCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('cartId').getMessage());
    });

    test('Should fail because invalid cartId', async () => {
        const res = await testUtil.rpc(shoppingCartCommand, [shoppingCartGetCommand,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('id', 'number').getMessage());
    });

    test('Should fail because ShoppingCart not found', async () => {
        const res = await testUtil.rpc(shoppingCartCommand, [shoppingCartGetCommand,
            0
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('ShoppingCart').getMessage());
    });

    test('Should get a default ShoppingCart', async () => {
        const res = await testUtil.rpc(shoppingCartCommand, [shoppingCartGetCommand,
            defaultShoppingCart.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.ShoppingCart = res.getBody()['result'];
        expect(result.name).toBe(defaultShoppingCart.name);
        expect(result.Profile.id).toBe(profile.id);
    });

    test('Should get the second ShoppingCart', async () => {
        const res = await testUtil.rpc(shoppingCartCommand, [shoppingCartGetCommand,
            secondShoppingCart.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.ShoppingCart = res.getBody()['result'];
        expect(result.name).toBe(secondShoppingCart.name);
        expect(result.Profile.id).toBe(profile.id);
    });

});
