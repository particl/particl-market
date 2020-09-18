// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';


describe('MarketGetCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const marketCommand = Commands.MARKET_ROOT.commandName;
    const marketGetCommand = Commands.MARKET_GET.commandName;

    let profile: resources.Profile;
    let market: resources.Market;

    beforeAll(async () => {
        await testUtil.cleanDb();

        // get default profile and market
        profile = await testUtil.getDefaultProfile();
        market = await testUtil.getDefaultMarket(profile.id);

    });

    test('Should fail because missing marketId', async () => {
        const res: any = await testUtil.rpc(marketCommand, [marketGetCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('marketId').getMessage());
    });


    test('Should fail because invalid marketId', async () => {
        const res: any = await testUtil.rpc(marketCommand, [marketGetCommand,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('marketId', 'number').getMessage());
    });


    test('Should return Market by id', async () => {
        const res = await testUtil.rpc(marketCommand, [marketGetCommand,
            market.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Market = res.getBody()['result'];

        // log.debug('result:', JSON.stringify(result, null, 2));
        expect(result.id).toBe(market.id);
        expect(result.name).toBe(market.name);
    });

    test('Should return base64 of image if returnImageData is true', async () => {

        const res = await testUtil.rpc(marketCommand, [marketGetCommand,
            market.id,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.Market = res.getBody()['result'];
        expect(result.Image.ImageDatas[0].data.length).toBeGreaterThan(200);
    });

});
