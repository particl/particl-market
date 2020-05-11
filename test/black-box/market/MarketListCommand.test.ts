// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands} from '../../../src/api/commands/CommandEnumType';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { MarketType } from '../../../src/api/enums/MarketType';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';

describe('MarketListCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const marketCommand = Commands.MARKET_ROOT.commandName;
    const marketListCommand = Commands.MARKET_LIST.commandName;
    const marketAddCommand = Commands.MARKET_ADD.commandName;

    let defaultProfile: resources.Profile;

    const marketData = {
        name: 'Test Market',
        type: MarketType.MARKETPLACE,
        receiveKey: 'receiveKey',
        receiveAddress: 'receiveAddress',
        publishKey: 'publishKey',
        publishAddress: 'publishAddress'
    };

    beforeAll(async () => {
        await testUtil.cleanDb();

        defaultProfile = await testUtil.getDefaultProfile();

    });

    test('Should fail to list Markets because invalid profileId', async () => {

        const res: any = await testUtil.rpc(marketCommand, [marketListCommand,
            'INVALID'
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('profileId', 'number').getMessage());
    });

    test('Should list only one default Market', async () => {
        const res = await testUtil.rpc(marketCommand, [marketListCommand, defaultProfile.id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(1);
    });

    test('Should list two Markets', async () => {

        // add new one
        await testUtil.rpc(marketCommand, [marketAddCommand,
            defaultProfile.id,
            marketData.name,
            marketData.type,
            marketData.receiveKey,
            marketData.receiveAddress,
            marketData.publishKey,
            marketData.publishAddress
        ]);

        const res = await testUtil.rpc(marketCommand, [marketListCommand, defaultProfile.id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(2);
    });

    test('Should list two Markets for default Profile when no profileId is specified', async () => {

        const res = await testUtil.rpc(marketCommand, [marketListCommand]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(2);
    });

});
