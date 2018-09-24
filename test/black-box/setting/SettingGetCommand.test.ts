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

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;
    let createdSetting: resources.Setting;

    beforeAll(async () => {
        await testUtil.cleanDb();

        // get default profile and market
        defaultProfile = await testUtil.getDefaultProfile();
        defaultMarket = await testUtil.getDefaultMarket();

        // create setting
        const res = await testUtil.rpc(settingCommand, [Commands.SETTING_SET.commandName, defaultProfile.id, 'key', 'value']);
        res.expectJson();
        res.expectStatusCode(200);
        createdSetting = res.getBody()['result'];

    });

    test('Should return setting by id and key', async () => {
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

    test('Should fail to return setting without key', async () => {
        const res = await testUtil.rpc(settingCommand, [settingGetCommand, defaultProfile.id]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('Missing params!');
    });

    test('Should fail to return setting for invalid profile', async () => {
        const res = await testUtil.rpc(settingCommand, [settingGetCommand, 123123, 'key']);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(`Entity with identifier 123123 does not exist`);
    });
});
