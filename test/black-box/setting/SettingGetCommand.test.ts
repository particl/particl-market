// Copyright (c) 2017-2019, The Particl Market developers
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

describe('SettingGetCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const settingCommand = Commands.SETTING_ROOT.commandName;
    const settingGetCommand = Commands.SETTING_GET.commandName;
    const settingSetCommand = Commands.SETTING_SET.commandName;

    let profile: resources.Profile;
    let market: resources.Market;
    let setting: resources.Setting;

    const testData = {
        key: 'key',
        value: 'value'
    };

    beforeAll(async () => {
        await testUtil.cleanDb();

        // get default profile and market
        profile = await testUtil.getDefaultProfile();
        market = await testUtil.getDefaultMarket();

        // create setting
        const res = await testUtil.rpc(settingCommand, [settingSetCommand,
            testData.key,
            testData.value,
            profile.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        setting = res.getBody()['result'];

    });

    test('Should fail to return Setting because missing key', async () => {
        const res = await testUtil.rpc(settingCommand, [settingGetCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('key').getMessage());
    });

    test('Should fail to return Setting because missing profileId', async () => {
        const res = await testUtil.rpc(settingCommand, [settingGetCommand,
            testData.key
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('profileId').getMessage());
    });

    test('Should fail to return Setting because invalid key', async () => {
        const invalidKey = 0;
        const res = await testUtil.rpc(settingCommand, [settingGetCommand,
            invalidKey,
            profile.id
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('key', 'string').getMessage());
    });

    test('Should fail to return Setting because invalid profileId', async () => {
        const invalidProfileId = true;
        const res = await testUtil.rpc(settingCommand, [settingGetCommand,
            testData.key,
            invalidProfileId
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('profileId', 'number').getMessage());
    });

    test('Should fail to return Setting because missing Profile model', async () => {
        const missingProfileId = 0;
        const res = await testUtil.rpc(settingCommand, [settingGetCommand,
            testData.key,
            missingProfileId
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('Profile').getMessage());
    });

    test('Should return Setting by key and profileId', async () => {
        //
        const res = await testUtil.rpc(settingCommand, [settingGetCommand,
            testData.key,
            profile.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.Setting = res.getBody()['result'];
        log.debug('result:', JSON.stringify(result, null, 2));
        // expect(result.Profile).toBeDefined();
        // expect(result.Profile.id).toBe(profile.id);
        expect(result[0].key).toBe(setting.key);
        expect(result[0].value).toBe(setting.value);
    });

});
