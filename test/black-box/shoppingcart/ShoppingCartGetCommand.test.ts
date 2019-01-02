// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import {Logger as LoggerType} from '../../../src/core/Logger';
import * as resources from 'resources';

describe('ShoppingCartGetCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const shoppingCartCommand = Commands.SHOPPINGCART_ROOT.commandName;
    const shoppingCartGetCommand = Commands.SHOPPINGCART_GET.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;
    let defaultShoppingCart: resources.ShoppingCart;
    let secondShoppingCart: resources.ShoppingCart;

    beforeAll(async () => {
        await testUtil.cleanDb();

        // get default profile and market
        defaultProfile = await testUtil.getDefaultProfile();
        defaultMarket = await testUtil.getDefaultMarket();
        defaultShoppingCart = defaultProfile.ShoppingCart[0];

        // add a second shopping cart
        const shoppingName = 'TEST-CART-NAME';
        const res = await testUtil.rpc(shoppingCartCommand, [Commands.SHOPPINGCART_ADD.commandName,
            shoppingName,
            defaultProfile.id
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
        expect(result.Profile.id).toBe(defaultProfile.id);
    });

    test('Should get the second ShoppingCart', async () => {
        const res = await testUtil.rpc(shoppingCartCommand, [shoppingCartGetCommand, secondShoppingCart.id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.ShoppingCart = res.getBody()['result'];
        expect(result.name).toBe(secondShoppingCart.name);
        expect(result.Profile.id).toBe(defaultProfile.id);
    });

    test('Should fail to get ShoppingCart with invalidId', async () => {
        const invalidId = 0;
        const res = await testUtil.rpc(shoppingCartCommand, [shoppingCartGetCommand, invalidId]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(`Entity with identifier ${invalidId} does not exist`);
    });

});
