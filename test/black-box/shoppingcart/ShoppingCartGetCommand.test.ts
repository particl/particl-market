// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { Logger as LoggerType } from '../../../src/core/Logger';

describe('ShoppingCartGetCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const shoppingCartCommand = Commands.SHOPPINGCART_ROOT.commandName;
    const shoppingCartGetCommand = Commands.SHOPPINGCART_GET.commandName;

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
        const shoppingName = 'TEST-CART-NAME';
        const res = await testUtil.rpc(shoppingCartCommand, [Commands.SHOPPINGCART_ADD.commandName,
            shoppingName,
            profile.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        secondShoppingCart = res.getBody()['result'];

    });

    test('Should get a default ShoppingCart', async () => {
        const res = await testUtil.rpc(shoppingCartCommand, [shoppingCartGetCommand, defaultShoppingCart.id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.ShoppingCart = res.getBody()['result'];
        expect(result.name).toBe(defaultShoppingCart.name);
        expect(result.Profile.id).toBe(profile.id);
    });

    test('Should get the second ShoppingCart', async () => {
        const res = await testUtil.rpc(shoppingCartCommand, [shoppingCartGetCommand, secondShoppingCart.id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.ShoppingCart = res.getBody()['result'];
        expect(result.name).toBe(secondShoppingCart.name);
        expect(result.Profile.id).toBe(profile.id);
    });

    test('Should fail to get ShoppingCart with invalidId', async () => {
        const invalidId = 0;
        const res = await testUtil.rpc(shoppingCartCommand, [shoppingCartGetCommand, invalidId]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(`Entity with identifier ${invalidId} does not exist`);
    });

});
