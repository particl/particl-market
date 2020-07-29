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

describe('ShoppingCartListCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const shoppingCartCommand = Commands.SHOPPINGCART_ROOT.commandName;
    const shoppingCartListCommand = Commands.SHOPPINGCART_LIST.commandName;
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

    test('Should fail because invalid profileId', async () => {
        const res: any = await testUtil.rpc(shoppingCartCommand, [shoppingCartListCommand,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('profileId', 'number').getMessage());
    });

    test('Should fail because Profile not found', async () => {
        const res = await testUtil.rpc(shoppingCartCommand, [shoppingCartListCommand,
            0
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('Profile').getMessage());
    });

    test('Should list only one default ShoppingCart', async () => {
        const res = await testUtil.rpc(shoppingCartCommand, [shoppingCartListCommand]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result).toHaveLength(1);
        expect(result[0].name).toBe(market.Identity.address);
        expect(result[0].Identity.id).toBe(market.Identity.id);
    });

    test('Should list only one default ShoppingCart for specified Profile', async () => {
        const res = await testUtil.rpc(shoppingCartCommand, [shoppingCartListCommand,
            profile.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.ShoppingCart[] = res.getBody()['result'];
        expect(result).toHaveLength(1);

        expect(result[0].name).toBe(market.Identity.address);
        expect(result[0].Identity.id).toBe(market.Identity.id);
    });

    test('Should create a second ShoppingCart for specified Identity', async () => {
        const res = await testUtil.rpc(shoppingCartCommand, [shoppingCartAddCommand,
            market.Identity.id,
            'NEW_CART_NAME'
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.ShoppingCart = res.getBody()['result'];
        expect(result.name).toBe('NEW_CART_NAME');
        expect(result.Identity.id).toBe(market.Identity.id);
    });

    test('Should list two ShoppingCarts for the default Profile', async () => {

        const res = await testUtil.rpc(shoppingCartCommand, [shoppingCartListCommand]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.ShoppingCart[] = res.getBody()['result'];
        expect(result).toHaveLength(2);

        expect(result[0].Profile).not.toBeDefined();
        expect(result[0].name).toBe(market.Identity.address);
        expect(result[0].Identity.id).toBe(market.Identity.id);

        expect(result[1].Profile).not.toBeDefined();
        expect(result[1].name).toBe('NEW_CART_NAME');
        expect(result[1].Identity.id).toBe(market.Identity.id);
    });

    test('Should list two Markets for specified Profile', async () => {
        const res = await testUtil.rpc(shoppingCartCommand, [shoppingCartListCommand,
            profile.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.ShoppingCart[] = res.getBody()['result'];
        expect(result).toHaveLength(2);

        expect(result[0].Profile).not.toBeDefined();
        expect(result[0].name).toBe(market.Identity.address);
        expect(result[0].Identity.id).toBe(market.Identity.id);

        expect(result[1].Profile).not.toBeDefined();
        expect(result[1].name).toBe('NEW_CART_NAME');
        expect(result[1].Identity.id).toBe(market.Identity.id);
    });

});
