// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import * as Faker from 'faker';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';
import { MarketRegion } from '../../../src/api/enums/MarketRegion';
import { MessageException } from '../../../src/api/exceptions/MessageException';

describe('MarketFlagCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const marketCommand = Commands.MARKET_ROOT.commandName;
    const marketFlagCommand = Commands.MARKET_FLAG.commandName;
    const marketAddCommand = Commands.MARKET_ADD.commandName;

    let profile: resources.Profile;
    let market: resources.Market;
    let newMarket: resources.Market;

    beforeAll(async () => {
        await testUtil.cleanDb();

        profile = await testUtil.getDefaultProfile();
        expect(profile.id).toBeDefined();
        market = await testUtil.getDefaultMarket(profile.id);
        expect(market.id).toBeDefined();

    });

    test('Should fail because of missing marketId', async () => {
        const res = await testUtil.rpc(marketCommand, [marketFlagCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('marketId').getMessage());
    });

    test('Should fail because invalid marketId', async () => {
        const res = await testUtil.rpc(marketCommand, [marketFlagCommand,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('marketId', 'number').getMessage());
    });

    test('Should fail because Market not found', async () => {
        const res = await testUtil.rpc(marketCommand, [marketFlagCommand,
            0
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('Market').getMessage());
    });

    test('Should fail because cannot flag the default Market', async () => {
        const res = await testUtil.rpc(marketCommand, [marketFlagCommand,
            market.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MessageException('Cannot flag the default Market.').getMessage());
    });

    test('Should create a new market (MARKETPLACE) with just a name and identityId', async () => {
        const marketName = 'TEST-5';
        const res = await testUtil.rpc(marketCommand, [marketAddCommand,
            profile.id,
            marketName,
            null,
            null,
            null,
            market.Identity.id,
            'description',
            MarketRegion.WORLDWIDE,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.Market = res.getBody()['result'];
        expect(result.name).toBe(marketName);
        expect(result.receiveKey).toBe(result.publishKey);

        newMarket = result;
    });

    test('Should flag the Market', async () => {
        const response = await testUtil.rpc(marketCommand, [marketFlagCommand,
            newMarket.id
        ]);
        response.expectJson();
        response.expectStatusCode(200);

        const result: any = response.getBody()['result'];
        expect(result.result).toBe('Sent.');

        log.debug('==> PROPOSAL SENT.');

    }, 600000); // timeout to 600s

    // TODO: check that we send/receive the proposal from/to the newMarket address


});
