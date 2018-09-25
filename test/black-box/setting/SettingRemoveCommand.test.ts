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

    let defaultMarket: resources.Market;
    let defaultProfile: resources.Profile;
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

    test('Should fail to remove setting with invalid profileId', async () => {
        const invalidProfileId = 0;
        const resMain = await testUtil.rpc(settingCommand, [settingRemoveCommand, invalidProfileId, 'newkey']);
        resMain.expectJson();
        resMain.expectStatusCode(404);
        expect(resMain.error.error.success).toBe(false);
        expect(resMain.error.error.message).toBe(`Entity with identifier 123123 does not exist`);
    });

    test('Should fail to remove Setting using invalid key', async () => {
        const invalidKey = 'invalid-key';
        const res = await testUtil.rpc(settingCommand, [Commands.SETTING_GET.commandName, defaultProfile.id, invalidKey]);
        res.expectJson();
        res.expectStatusCode(404);
        const resultMain: any = res.getBody()['result'];
        expect(resultMain.error.error.message).toBe(`Entity with identifier key does not exist`);
    });

    test('Should fail to remove Setting because missing both parameters', async () => {
        const invalidKey = 'invalid-key';
        const res = await testUtil.rpc(settingCommand, [Commands.SETTING_GET.commandName]);
        res.expectJson();
        res.expectStatusCode(404);
        const resultMain: any = res.getBody()['result'];
        expect(resultMain.error.error.message).toBe(`Entity with identifier key does not exist`);
    });

    test('Should fail to remove Setting because missing key', async () => {
        const res = await testUtil.rpc(settingCommand, [Commands.SETTING_GET.commandName, defaultProfile.id]);
        res.expectJson();
        res.expectStatusCode(404);
        const resultMain: any = res.getBody()['result'];
        expect(resultMain.error.error.message).toBe(`Entity with identifier key does not exist`);
    });

    test('Should remove Setting by profileId and key', async () => {
        const res = await testUtil.rpc(settingCommand, [Commands.SETTING_GET.commandName, defaultProfile.id, 'key']);
        res.expectJson();
        res.expectStatusCode(200);
    });

    test('Should fail to delete already removed Setting', async () => {
        const res = await testUtil.rpc(settingCommand, [settingRemoveCommand, defaultProfile.id, 'newKey', 'newValue']);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(`Entity with identifier key does not exist`);
    });

});
