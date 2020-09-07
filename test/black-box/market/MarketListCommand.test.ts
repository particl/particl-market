// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands} from '../../../src/api/commands/CommandEnumType';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';

describe('MarketListCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);
    const testUtilOther = new BlackBoxTestUtil(randomBoolean ? 1 : 0);

    const marketCommand = Commands.MARKET_ROOT.commandName;
    const marketListCommand = Commands.MARKET_LIST.commandName;
    const marketAddCommand = Commands.MARKET_ADD.commandName;
    const marketPostCommand = Commands.MARKET_POST.commandName;

    let profile: resources.Profile;
    let market: resources.Market;

    let sent = false;
    const DAYS_RETENTION = 1;

    beforeAll(async () => {
        await testUtil.cleanDb();
        await testUtilOther.cleanDb();

        profile = await testUtil.getDefaultProfile();
        expect(profile.id).toBeDefined();
        market = await testUtil.getDefaultMarket(profile.id);
        expect(market.id).toBeDefined();

    });

    test('Should fail because invalid profileId', async () => {
        const res: any = await testUtil.rpc(marketCommand, [marketListCommand,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('profileId', 'number').getMessage());
    });


    test('Should fail because Profile not found', async () => {
        const res = await testUtil.rpc(marketCommand, [marketListCommand,
            0
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('Profile').getMessage());
    });


    test('Should post the default Market', async () => {

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


    test('Should list the posted (and received) Market', async () => {

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
        expect(result.Image).toBeDefined();
        expect(result.Image.hash).toBe('e985ce59e9cdfdff368fa96de65161572cc755bed9ec5f9913e9f9cc4f7fa66b');
    }, 600000); // timeout to 600s


    test('Should list the default Market for specified Profile', async () => {
        const response = await testUtil.rpc(marketCommand, [marketListCommand,
            profile.id
        ]);
        response.expectJson();
        response.expectStatusCode(200);

        const markets: resources.Market[] = response.getBody()['result'];
        expect(markets).toHaveLength(1);

        const result: resources.Market = markets[0];
        expect(result.title).toBe(market.title);
        expect(result.description).toBe(market.description);
        expect(result.Image).toBeDefined();
        expect(result.Image.hash).toBe('e985ce59e9cdfdff368fa96de65161572cc755bed9ec5f9913e9f9cc4f7fa66b');
    });

    test('Should list the posted (and received) Market with Image', async () => {

        const response: any = await testUtil.rpcWaitFor(marketCommand, [marketListCommand],
            30 * 60,                                // maxSeconds
            200,                                // waitForStatusCode
            '[0].ImageDatas[0].dataId',       // property name
            'data/images/e985ce59e9cdfdff368fa96de65161572cc755bed9ec5f9913e9f9cc4f7fa66b-ORIGINAL', // value
            '='
        );
        response.expectJson();
        response.expectStatusCode(200);

        const markets: resources.Market[] = response.getBody()['result'];
        expect(markets).toHaveLength(1);

        const result: resources.Market = markets[0];
        expect(result.title).toBe(market.title);
        expect(result.description).toBe(market.description);
        expect(result.Image).toBeDefined();
        expect(result.Image.hash).toBe('e985ce59e9cdfdff368fa96de65161572cc755bed9ec5f9913e9f9cc4f7fa66b');

    }, 600000); // timeout to 600s

});
