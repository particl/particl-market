// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { Logger as LoggerType } from '../../../src/core/Logger';
import * as resources from 'resources';

describe('SettingRemoveCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const settingCommand = Commands.SETTING_ROOT.commandName;
    const settingRemoveCommand = Commands.SETTING_REMOVE.commandName;
    const settingSetCommand = Commands.SETTING_SET.commandName;

    let defaultMarket: resources.Market;
    let defaultProfile: resources.Profile;
    let createdSetting: resources.Setting;

    const testData = {
        key: 'key',
        value: 'value'
    };

    beforeAll(async () => {
        await testUtil.cleanDb();

        // get default profile and market
        defaultProfile = await testUtil.getDefaultProfile();
        defaultMarket = await testUtil.getDefaultMarket();

        // create setting
        const res = await testUtil.rpc(settingCommand, [settingSetCommand,
            defaultProfile.id,
            testData.key,
            testData.value
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        createdSetting = res.getBody()['result'];

    });

    test('Should fail to remove Setting using invalid profileId', async () => {
        const invalidProfileId = 0;
        const res = await testUtil.rpc(settingCommand, [settingRemoveCommand,
            invalidProfileId,
            testData.key
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(`Profile not found.`);
    });

    test('Should fail to remove Setting using invalid key', async () => {
        const invalidKey = 'invalid-key';
        const res = await testUtil.rpc(settingCommand, [settingRemoveCommand,
            defaultProfile.id,
            invalidKey
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(`Entity with identifier ${invalidKey} and ${defaultProfile.id} does not exist`);
    });

    test('Should fail to remove Setting because missing profileId', async () => {
        const res = await testUtil.rpc(settingCommand, [settingRemoveCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(`Missing profileId.`);
    });

    test('Should fail to remove Setting because missing key', async () => {
        const res = await testUtil.rpc(settingCommand, [settingRemoveCommand,
            defaultProfile.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(`Missing key.`);
    });

    test('Should remove Setting by profileId and key', async () => {
        const res = await testUtil.rpc(settingCommand, [settingRemoveCommand,
            defaultProfile.id,
            testData.key
        ]);
        res.expectJson();
        res.expectStatusCode(200);
    });

    test('Should fail to delete already removed Setting', async () => {
        const res = await testUtil.rpc(settingCommand, [settingRemoveCommand,
            defaultProfile.id,
            testData.key
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(`Entity with identifier ${testData.key} and ${defaultProfile.id} does not exist`);
    });

});
