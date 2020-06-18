// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { Logger as LoggerType } from '../../../src/core/Logger';
import * as resources from "resources";

describe('ShoppingCartRemoveCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

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

        const res = await testUtil.rpc(shoppingCartCommand, [Commands.SHOPPINGCART_ADD.commandName, 'New Shopping Cart', profile.id]);
        shoppingCart = res.getBody()['result'];
    });

    test('Should remove a ShoppingCart', async () => {
        const res = await testUtil.rpc(shoppingCartCommand, [shoppingCartRemoveCommand, shoppingCart.id]);
        res.expectJson();
        res.expectStatusCode(200);
    });

    test('Should fail because we want to remove non-existing ShoppingCart', async () => {
        const res = await testUtil.rpc(shoppingCartCommand, [shoppingCartRemoveCommand, shoppingCart.id]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(`Entity with identifier ${shoppingCart.id} does not exist`);

    });
});
