// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { Logger as LoggerType } from '../../../src/core/Logger';
import * as resources from 'resources';

describe('SettingSetCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const settingCommand = Commands.SETTING_ROOT.commandName;
    const settingSetCommand = Commands.SETTING_SET.commandName;

    let defaultMarket: resources.Market;
    let defaultProfile: resources.Profile;

    const testData = {
        key: 'key',
        value: 'value'
    };

    const testDataUpdated = {
        key: 'keyUPDATED',
        value: 'valueUPDATED'
    };

    beforeAll(async () => {
        await testUtil.cleanDb();

        // get default profile and market
        defaultProfile = await testUtil.getDefaultProfile();
        defaultMarket = await testUtil.getDefaultMarket();

    });

    test('Should fail to create Setting when missing profileId', async () => {
        const res = await testUtil.rpc(settingCommand, [settingSetCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(`Missing profileId.`);
    });

    test('Should fail to create Setting when missing key', async () => {
        const res = await testUtil.rpc(settingCommand, [settingSetCommand,
            defaultProfile.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(`Missing key.`);
    });

    test('Should fail to create Setting when missing value', async () => {
        const res = await testUtil.rpc(settingCommand, [settingSetCommand,
            defaultProfile.id,
            testData.key
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(`Missing value.`);
    });

    test('Should create one Setting', async () => {
        const res = await testUtil.rpc(settingCommand, [settingSetCommand,
            defaultProfile.id,
            testData.key,
            testData.value
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.Setting = res.getBody()['result'];
        expect(result.Profile).toBeDefined();
        expect(result.Profile.id).toBe(defaultProfile.id);
        expect(result.key).toBe(testData.key);
        expect(result.value).toBe(testData.value);
    });

    test('Should update the previously created Setting', async () => {
        const res = await testUtil.rpc(settingCommand, [settingSetCommand,
            defaultProfile.id,
            testDataUpdated.key,
            testDataUpdated.value
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        //
        const result: resources.Setting = res.getBody()['result'];
        expect(result.Profile).toBeDefined();
        expect(result.Profile.id).toBe(defaultProfile.id);
        expect(result.key).toBe(testDataUpdated.key);
        expect(result.value).toBe(testDataUpdated.value);
    });

    test('Should fail to update Setting using invalid profileId', async () => {
        const invalidProfile = 0;
        const res = await testUtil.rpc(settingCommand, [settingSetCommand,
            invalidProfile,
            testData.key,
            testData.value
        ]);
        res.expectJson();
        // res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(`Profile not found.`);
    });
});
