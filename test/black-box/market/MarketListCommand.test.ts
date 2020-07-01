// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * as Faker from 'faker';
import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands} from '../../../src/api/commands/CommandEnumType';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';

describe('MarketListCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const marketCommand = Commands.MARKET_ROOT.commandName;
    const marketListCommand = Commands.MARKET_LIST.commandName;
    const marketAddCommand = Commands.MARKET_ADD.commandName;

    let profile: resources.Profile;
    let market: resources.Market;

    beforeAll(async () => {
        await testUtil.cleanDb();

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

    test('Should list only one default Market for the default Profile', async () => {
        const res = await testUtil.rpc(marketCommand, [marketListCommand]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(1);
    });

    test('Should list only one default Market for specified Profile', async () => {
        const res = await testUtil.rpc(marketCommand, [marketListCommand,
            profile.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(1);
    });

    test('Should list two Markets for the default Profile', async () => {
        await testUtil.rpc(marketCommand, [marketAddCommand,
            profile.id,
            Faker.finance.bitcoinAddress()
        ]);

        const res = await testUtil.rpc(marketCommand, [marketListCommand]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(2);
    });

    test('Should list two Markets for specified Profile', async () => {
        const res = await testUtil.rpc(marketCommand, [marketListCommand,
            profile.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(2);
    });

});
