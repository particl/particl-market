// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { Logger as LoggerType } from '../../../src/core/Logger';

describe('ShoppingCartUpdateCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const shoppingCartCommand = Commands.SHOPPINGCART_ROOT.commandName;
    const shoppingCartUpdateCommand = Commands.SHOPPINGCART_UPDATE.commandName;

    let profile: resources.Profile;
    let market: resources.Market;

    let defaultShoppingCart: resources.ShoppingCart;
    const shoppingCartName = 'New Shopping Cart';

    beforeAll(async () => {
        await testUtil.cleanDb();

        profile = await testUtil.getDefaultProfile();
        expect(profile.id).toBeDefined();
        market = await testUtil.getDefaultMarket(profile.id);
        expect(market.id).toBeDefined();

        defaultShoppingCart = profile.ShoppingCart[0];
    });

    test('Should update Shopping Cart', async () => {
        const res = await testUtil.rpc(shoppingCartCommand, [shoppingCartUpdateCommand, defaultShoppingCart.id, shoppingCartName]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.name).toBe(shoppingCartName);
    });

    test('Should fail because shoppingCartId is missing', async () => {
        const res = await testUtil.rpc(shoppingCartCommand, [shoppingCartUpdateCommand]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(`Request body is not valid`);

    });
});
