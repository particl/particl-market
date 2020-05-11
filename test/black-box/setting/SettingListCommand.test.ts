// Copyright (c) 2017-2020, The Particl Market developers
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

describe('SettingListCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const settingCommand = Commands.SETTING_ROOT.commandName;
    const settingListCommand = Commands.SETTING_LIST.commandName;
    const settingSetCommand = Commands.SETTING_SET.commandName;

    let market: resources.Market;
    let profile: resources.Profile;
    let setting1: resources.Setting;
    let setting2: resources.Setting;

    const testData1 = {
        key: 'key1',
        value: 'value1'
    };

    const testData2 = {
        key: 'key2',
        value: 'value2'
    };

    beforeAll(async () => {
        await testUtil.cleanDb();

        // get default profile and market
        profile = await testUtil.getDefaultProfile();
        market = await testUtil.getDefaultMarket();

        // create setting
        let res = await testUtil.rpc(settingCommand, [settingSetCommand,
            testData1.key,
            testData1.value,
            profile.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        setting1 = res.getBody()['result'];

        // create setting
        res = await testUtil.rpc(settingCommand, [settingSetCommand,
            testData2.key,
            testData2.value,
            profile.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        setting2 = res.getBody()['result'];

    });

    test('Should fail to list Settings because missing profileId', async () => {
        const res = await testUtil.rpc(settingCommand, [settingListCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('profileId').getMessage());
    });

    test('Should fail to list Settings because invalid profileId', async () => {
        const res = await testUtil.rpc(settingCommand, [settingListCommand,
            'INVALID'
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('profileId', 'number').getMessage());
    });

    test('Should fail to list Settings because invalid marketId', async () => {
        const res = await testUtil.rpc(settingCommand, [settingListCommand,
            profile.id,
            'INVALID'
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('marketId', 'number').getMessage());
    });

    test('Should fail to list Settings because missing Profile model', async () => {
        const missingProfileId = 0;
        const res = await testUtil.rpc(settingCommand, [settingListCommand,
            missingProfileId
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('Profile').getMessage());
    });

    test('Should fail to list Settings because missing Market model', async () => {
        const missingMarketId = 0;
        const res = await testUtil.rpc(settingCommand, [settingListCommand,
            profile.id,
            missingMarketId
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('Market').getMessage());
    });

    test('Should list two Settings using profileId', async () => {
        const res = await testUtil.rpc(settingCommand, [settingListCommand,
            profile.id]
        );
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        expect(result.length).toBe(7);  // there are 5 settings created on startup
    });

    // TODO: create market specific settings, add tests

});
