// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { Logger as LoggerType } from '../../../src/core/Logger';
import * as resources from 'resources';

describe('ShoppingCartAddCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const shoppingCartCommand = Commands.SHOPPINGCART_ROOT.commandName;
    const shoppingCartAddCommand = Commands.SHOPPINGCART_ADD.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;

    const shoppingCartName = 'Test Shopping Cart';

    beforeAll(async () => {
        await testUtil.cleanDb();

        // get default profile and market
        defaultProfile = await testUtil.getDefaultProfile();
        defaultMarket = await testUtil.getDefaultMarket();
    });

    test('Should create a new ShoppingCart', async () => {

        const res = await testUtil.rpc(shoppingCartCommand, [shoppingCartAddCommand,
            shoppingCartName,
            defaultProfile.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.name).toBe(shoppingCartName);
        expect(result.profileId).toBe(defaultProfile.id);
    });

    test('Should fail because we want to create a ShoppingCart without a name', async () => {
        const res = await testUtil.rpc(shoppingCartCommand, [shoppingCartAddCommand]);
        res.expectJson();
        res.expectStatusCode(400);
    });
});
