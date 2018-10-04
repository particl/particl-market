// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands} from '../../../src/api/commands/CommandEnumType';
import { Logger as LoggerType } from '../../../src/core/Logger';

describe('MarketListCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const marketCommand = Commands.MARKET_ROOT.commandName;
    const marketListCommand = Commands.MARKET_LIST.commandName;
    const marketAddCommand = Commands.MARKET_ADD.commandName;

    const marketData = {
        name: 'Test Market',
        private_key: 'privateKey',
        address: 'Market Address'
    };

    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    test('Should return only one default Market', async () => {
        const res = await testUtil.rpc(marketCommand, [marketListCommand]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(1);
    });

    test('Should list all created Markets', async () => {
        // add market
        await testUtil.rpc(marketCommand, [marketAddCommand, marketData.name, marketData.private_key, marketData.address]);

        const res = await testUtil.rpc(marketCommand, [marketListCommand]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(2);
    });

    test('Should fail to create Market with allready existing name', async () => {
        // todo: should this be a problem?
        const marketRes = await testUtil.rpc(marketCommand, [marketAddCommand, marketData.name, marketData.private_key, marketData.address]);
        marketRes.expectJson();
        marketRes.expectStatusCode(400);
        expect(marketRes.error.error.success).toBe(false);
        expect(marketRes.error.error.message).toBe('Could not create the market!');
    });

});
