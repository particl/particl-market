// Copyright (c) 2017-2019, The Particl Market developers
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

describe('MarketRemoveCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const marketCommand = Commands.MARKET_ROOT.commandName;
    const marketRemoveCommand = Commands.MARKET_REMOVE.commandName;
    const marketAddCommand = Commands.MARKET_ADD.commandName;

    let market: resources.Market;
    let profile: resources.Profile;
    let testMarket: resources.Market;

    const testData = {
        name: 'TEST_MARKET'
    };

    beforeAll(async () => {
        await testUtil.cleanDb();

        // get default profile and market
        profile = await testUtil.getDefaultProfile();
        market = await testUtil.getDefaultMarket();

        // create a market
        const res = await testUtil.rpc(marketCommand, [marketAddCommand,
            profile.id,
            testData.name
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        testMarket = res.getBody()['result'];

    });

    test('Should fail to remove Market because missing marketId', async () => {
        const res = await testUtil.rpc(marketCommand, [marketRemoveCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('marketId').getMessage());
    });

    test('Should fail to remove Market because invalid marketId', async () => {
        const res = await testUtil.rpc(marketCommand, [marketRemoveCommand,
            'INVALID'
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('marketId', 'number').getMessage());
    });

    test('Should fail to remove Market because Market model not found', async () => {
        const res = await testUtil.rpc(marketCommand, [marketRemoveCommand,
            0
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('Market').getMessage());
    });

    test('Should remove Market by marketId', async () => {
        const res = await testUtil.rpc(marketCommand, [marketRemoveCommand,
            testMarket.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
    });

    test('Should fail to remove already removed Market', async () => {
        const res = await testUtil.rpc(marketCommand, [marketRemoveCommand,
            testMarket.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('Market').getMessage());
    });

});
