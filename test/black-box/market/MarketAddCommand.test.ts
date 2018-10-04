// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands} from '../../../src/api/commands/CommandEnumType';
import { Logger as LoggerType } from '../../../src/core/Logger';

describe('MarketAddCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const marketCommand = Commands.MARKET_ROOT.commandName;
    const marketAddCommand = Commands.MARKET_ADD.commandName;

    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    const marketData = {
        name: 'Test Market',
        private_key: 'privateKey',
        address: 'Market Address'
    };

    test('Should create a new market', async () => {
        const res = await testUtil.rpc(marketCommand, [marketAddCommand, marketData.name, marketData.private_key, marketData.address]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.name).toBe(marketData.name);
        expect(result.privateKey).toBe(marketData.private_key);
        expect(result.address).toBe(marketData.address);
    });

    test('Should fail because we want to create an empty market', async () => {
        const res = await testUtil.rpc(marketCommand, [marketAddCommand]);
        res.expectJson();
        res.expectStatusCode(400);
    });
});
