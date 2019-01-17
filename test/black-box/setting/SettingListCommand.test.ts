// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { Logger as LoggerType } from '../../../src/core/Logger';
import * as resources from 'resources';

describe('SettingListCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const settingCommand = Commands.SETTING_ROOT.commandName;
    const settingListCommand = Commands.SETTING_LIST.commandName;
    const settingSetCommand = Commands.SETTING_SET.commandName;

    let defaultMarket: resources.Market;
    let defaultProfile: resources.Profile;
    let createdSetting1: resources.Setting;
    let createdSetting2: resources.Setting;

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
        defaultProfile = await testUtil.getDefaultProfile();
        defaultMarket = await testUtil.getDefaultMarket();

        // create setting
        let res = await testUtil.rpc(settingCommand, [settingSetCommand,
            defaultProfile.id,
            testData1.key,
            testData1.value
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        createdSetting1 = res.getBody()['result'];

        // create setting
        res = await testUtil.rpc(settingCommand, [settingSetCommand,
            defaultProfile.id,
            testData2.key,
            testData2.value
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        createdSetting2 = res.getBody()['result'];

    });

    test('Should list two Settings using profileId', async () => {
        const res = await testUtil.rpc(settingCommand, [settingListCommand, defaultProfile.id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.length).toBe(2);
        expect(result[0].Profile.id).toBe(defaultProfile.id);
        expect(result[0].key).toBe(testData1.key);
        expect(result[0].value).toBe(testData1.value);
        expect(result[1].Profile.id).toBe(defaultProfile.id);
        expect(result[1].key).toBe(testData2.key);
        expect(result[1].value).toBe(testData2.value);
    });

    test('Should fail to list Settings using invalid profileId', async () => {
        const invalidProfile = 0;
        const resMain = await testUtil.rpc(settingCommand, [settingListCommand, invalidProfile]);
        resMain.expectJson();
        resMain.expectStatusCode(404);
        expect(resMain.error.error.message).toBe(`Profile not found.`);
    });
});
