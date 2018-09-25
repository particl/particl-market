// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import * as resources from 'resources';

describe('SettingGetCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const settingCommand = Commands.SETTING_ROOT.commandName;
    const settingGetCommand = Commands.SETTING_GET.commandName;
    const settingSetCommand = Commands.SETTING_SET.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;
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

    test('Should return Setting using profileId and key', async () => {
        //
        const res = await testUtil.rpc(settingCommand, [settingGetCommand, defaultProfile.id, createdSetting.key]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.Profile).toBeDefined();
        expect(result.Profile.id).toBe(defaultProfile.id);
        expect(result.key).toBe('key');
        expect(result.value).toBe('value');
    });

    test('Should fail to return Setting when missing profileId and key', async () => {
        const res = await testUtil.rpc(settingCommand, [settingGetCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('Missing profileId.');
    });

    test('Should fail to return Setting when missing key', async () => {
        const res = await testUtil.rpc(settingCommand, [settingGetCommand, defaultProfile.id]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('Missing key.');
    });

    test('Should fail to return Setting for invalid profileId', async () => {
        const invalidProfile = 0;
        const res = await testUtil.rpc(settingCommand, [settingGetCommand,
            invalidProfile,
            testData.key
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(`Profile not found.`);
    });
});
