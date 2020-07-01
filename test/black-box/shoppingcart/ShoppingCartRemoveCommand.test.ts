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
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';

describe('ShoppingCartRemoveCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const shoppingCartCommand = Commands.SHOPPINGCART_ROOT.commandName;
    const shoppingCartRemoveCommand = Commands.SHOPPINGCART_REMOVE.commandName;

    let profile: resources.Profile;
    let market: resources.Market;

    let shoppingCart: resources.ShoppingCart;

    beforeAll(async () => {
        await testUtil.cleanDb();

        profile = await testUtil.getDefaultProfile();
        expect(profile.id).toBeDefined();
        market = await testUtil.getDefaultMarket(profile.id);
        expect(market.id).toBeDefined();

        const res = await testUtil.rpc(shoppingCartCommand, [Commands.SHOPPINGCART_ADD.commandName,
            profile.id,
            'NEW_CART'
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        shoppingCart = res.getBody()['result'];
    });

    test('Should fail because missing id', async () => {
        const res = await testUtil.rpc(shoppingCartCommand, [shoppingCartRemoveCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('id').getMessage());
    });

    test('Should fail because invalid id', async () => {

        const res = await testUtil.rpc(shoppingCartCommand, [shoppingCartRemoveCommand,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('id', 'number').getMessage());
    });

    test('Should fail because missing ShoppingCart', async () => {
        const res: any = await testUtil.rpc(shoppingCartCommand, [shoppingCartRemoveCommand,
            0
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('ShoppingCart').getMessage());
    });

    test('Should remove a ShoppingCart', async () => {
        const res = await testUtil.rpc(shoppingCartCommand, [shoppingCartRemoveCommand, shoppingCart.id]);
        res.expectJson();
        res.expectStatusCode(200);
    });

    // todo: should remove a ShoppingCart with ShoppingCartItems
});
