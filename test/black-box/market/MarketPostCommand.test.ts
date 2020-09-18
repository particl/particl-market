// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';

describe('MarketPostCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);
    const testUtilOther = new BlackBoxTestUtil(randomBoolean ? 1 : 0);

    const marketCommand = Commands.MARKET_ROOT.commandName;
    const marketPostCommand = Commands.MARKET_POST.commandName;
    const marketAddCommand = Commands.MARKET_ADD.commandName;
    const marketListCommand = Commands.MARKET_LIST.commandName;

    let profile: resources.Profile;
    let market: resources.Market;

    let sent = false;
    const DAYS_RETENTION = 1;

    beforeAll(async () => {
        await testUtil.cleanDb();
        await testUtilOther.cleanDb();

        // get default profile and market
        profile = await testUtil.getDefaultProfile();
        market = await testUtil.getDefaultMarket(profile.id);

    });


    test('Should fail to post because missing promotedMarketId', async () => {
        const res = await testUtil.rpc(marketCommand, [marketPostCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('marketId').getMessage());
    });


    test('Should fail to post because missing daysRetention', async () => {
        const res = await testUtil.rpc(marketCommand, [marketPostCommand,
            market.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('daysRetention').getMessage());
    });


    test('Should fail to post because invalid promotedMarketId', async () => {
        const res = await testUtil.rpc(marketCommand, [marketPostCommand,
            'INVALID',
            DAYS_RETENTION
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('marketId', 'number').getMessage());
    });


    test('Should fail to post because invalid daysRetention', async () => {
        const res = await testUtil.rpc(marketCommand, [marketPostCommand,
            market.id,
            'INVALID'
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('daysRetention', 'number').getMessage());
    });


    test('Should fail to post because invalid estimateFee', async () => {
        const res = await testUtil.rpc(marketCommand, [marketPostCommand,
            market.id,
            DAYS_RETENTION,
            0
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('estimateFee', 'boolean').getMessage());
    });


    test('Should fail to post because Market not found', async () => {
        const res = await testUtil.rpc(marketCommand, [marketPostCommand,
            0,
            DAYS_RETENTION,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('Market').getMessage());
    });


    test('Should estimate post cost without actually posting', async () => {

        expect(market.id).toBeDefined();
        const res: any = await testUtil.rpc(marketCommand, [marketPostCommand,
            market.id,
            DAYS_RETENTION,
            true
        ]);
        res.expectJson();

        // make sure we got the expected result from posting the template
        const result: any = res.getBody()['result'];
        log.debug('result:', JSON.stringify(result, null, 2));
        expect(result.result).toBe('Not Sent.');
    });


    test('Should post Market', async () => {

        expect(market.id).toBeDefined();
        const res: any = await testUtil.rpc(marketCommand, [marketPostCommand,
            market.id,
            DAYS_RETENTION
        ]);
        res.expectJson();

        // make sure we got the expected result from posting the template
        const result: any = res.getBody()['result'];
        // log.debug('result:', JSON.stringify(result, null, 2));
        sent = result.result === 'Sent.';
        if (!sent) {
            log.debug(JSON.stringify(result, null, 2));
        }
        expect(result.result).toBe('Sent.');

    });


    test('Should list the posted Market', async () => {

        const response: any = await testUtil.rpcWaitFor(marketCommand, [marketListCommand],
            30 * 60,                    // maxSeconds
            200,                    // waitForStatusCode
            '.length',          // property name
            1,              // value
            '='
        );
        response.expectJson();
        response.expectStatusCode(200);

        const markets: resources.Market[] = response.getBody()['result'];
        log.debug('markets: ', JSON.stringify(markets, null, 2));
        expect(markets).toHaveLength(1);

        const result: resources.Market = markets[0];
        expect(result.title).toBe(market.title);
        expect(result.description).toBe(market.description);
        expect(result.Profile).toBeUndefined();

    }, 600000); // timeout to 600s


});
