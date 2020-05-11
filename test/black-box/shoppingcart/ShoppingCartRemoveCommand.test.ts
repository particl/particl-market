// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { Logger as LoggerType } from '../../../src/core/Logger';

describe('ShoppingCartRemoveCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const shoppingCartCommand = Commands.SHOPPINGCART_ROOT.commandName;
    const shoppingCartRemoveCommand = Commands.SHOPPINGCART_REMOVE.commandName;

    let shoppingCartId;

    beforeAll(async () => {
        await testUtil.cleanDb();
        const defaultProfile = await testUtil.getDefaultProfile();

        const res = await testUtil.rpc(shoppingCartCommand, [Commands.SHOPPINGCART_ADD.commandName, 'New Shopping Cart', defaultProfile.id]);
        shoppingCartId = res.getBody()['result'].id;
    });

    test('Should remove a ShoppingCart', async () => {
        const res = await testUtil.rpc(shoppingCartCommand, [shoppingCartRemoveCommand, shoppingCartId]);
        res.expectJson();
        res.expectStatusCode(200);
    });

    test('Should fail because we want to remove non-existing ShoppingCart', async () => {
        const res = await testUtil.rpc(shoppingCartCommand, [shoppingCartRemoveCommand, shoppingCartId]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(`Entity with identifier ${shoppingCartId} does not exist`);

    });
});
