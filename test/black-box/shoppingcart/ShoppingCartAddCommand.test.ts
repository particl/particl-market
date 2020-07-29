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

describe('ShoppingCartAddCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const shoppingCartCommand = Commands.SHOPPINGCART_ROOT.commandName;
    const shoppingCartAddCommand = Commands.SHOPPINGCART_ADD.commandName;

    let profile: resources.Profile;
    let market: resources.Market;

    beforeAll(async () => {
        await testUtil.cleanDb();

        profile = await testUtil.getDefaultProfile();
        expect(profile.id).toBeDefined();
        market = await testUtil.getDefaultMarket(profile.id);
        expect(market.id).toBeDefined();

    });

    test('Should fail because missing identityId', async () => {
        const res: any = await testUtil.rpc(shoppingCartCommand, [shoppingCartAddCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('identityId').getMessage());
    });

    test('Should fail because invalid identityId', async () => {
        const res = await testUtil.rpc(shoppingCartCommand, [shoppingCartAddCommand,
            false,
            'name'
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('identityId', 'number').getMessage());
    });

    test('Should fail because invalid name', async () => {
        const res = await testUtil.rpc(shoppingCartCommand, [shoppingCartAddCommand,
            market.Identity.id,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('name', 'string').getMessage());
    });

    test('Should fail because Identity not found', async () => {
        const res = await testUtil.rpc(shoppingCartCommand, [shoppingCartAddCommand,
            0,
            'name'
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('Identity').getMessage());
    });

    test('Should create a new ShoppingCart', async () => {
        const res = await testUtil.rpc(shoppingCartCommand, [shoppingCartAddCommand,
            market.Identity.id,
            'name'
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.ShoppingCart = res.getBody()['result'];
        expect(result.Identity.id).toBe(market.Identity.id);
        expect(result.name).toBe('name');
    });

    test('Should create a new ShoppingCart without specifying a name', async () => {
        const res = await testUtil.rpc(shoppingCartCommand, [shoppingCartAddCommand,
            market.Identity.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.ShoppingCart = res.getBody()['result'];
        expect(result.Identity.id).toBe(market.Identity.id);
    });

});
