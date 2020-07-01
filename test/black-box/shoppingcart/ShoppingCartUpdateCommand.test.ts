// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';

describe('ShoppingCartUpdateCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const shoppingCartCommand = Commands.SHOPPINGCART_ROOT.commandName;
    const shoppingCartUpdateCommand = Commands.SHOPPINGCART_UPDATE.commandName;

    let profile: resources.Profile;
    let market: resources.Market;

    let defaultShoppingCart: resources.ShoppingCart;

    beforeAll(async () => {
        await testUtil.cleanDb();

        profile = await testUtil.getDefaultProfile();
        expect(profile.id).toBeDefined();
        market = await testUtil.getDefaultMarket(profile.id);
        expect(market.id).toBeDefined();

        defaultShoppingCart = profile.ShoppingCart[0];
    });

    test('Should fail because missing shoppingCartId', async () => {
        const res = await testUtil.rpc(shoppingCartCommand, [shoppingCartUpdateCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('id').getMessage());
    });

    test('Should fail because missing name', async () => {
        const res = await testUtil.rpc(shoppingCartCommand, [shoppingCartUpdateCommand,
            defaultShoppingCart.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('name').getMessage());
    });

    test('Should fail because invalid shoppingCartId', async () => {

        const res = await testUtil.rpc(shoppingCartCommand, [shoppingCartUpdateCommand,
            false,
            'NEW_NAME'
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('id', 'number').getMessage());
    });

    test('Should fail because invalid profileName', async () => {
        const res = await testUtil.rpc(shoppingCartCommand, [shoppingCartUpdateCommand,
            defaultShoppingCart.id,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('name', 'string').getMessage());
    });

    test('Should fail because missing ShoppingCart', async () => {
        const res: any = await testUtil.rpc(shoppingCartCommand, [shoppingCartUpdateCommand,
            0,
            'NEW_NAME'
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('ShoppingCart').getMessage());
    });

    test('Should update ShoppingCart', async () => {
        const res = await testUtil.rpc(shoppingCartCommand, [shoppingCartUpdateCommand,
            defaultShoppingCart.id,
            'NEW_NAME'
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.name).toBe('NEW_NAME');
    });

});
