// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import { api, rpc } from '../lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';

describe('SettingRemiveCommand', () => {
    const testUtil = new BlackBoxTestUtil();
    const method = Commands.SETTING_ROOT.commandName;
    const subCommand = Commands.SETTING_REMOVE.commandName;


    let defaultProfile;

    beforeAll(async () => {
        await testUtil.cleanDb();

        defaultProfile = await testUtil.getDefaultProfile();
    });

    test('Should remove setting by profile id and key', async () => {
        // create setting
        const res = await testUtil.rpc(method, [Commands.SETTING_SET.commandName, defaultProfile.id, 'key', 'value']);
        // call rpc api
        res.expectJson();
        res.expectStatusCode(200);

        const resMain = await testUtil.rpc(method, [subCommand, defaultProfile.id, 'key']);
        resMain.expectJson();
        resMain.expectStatusCode(200);

        const resGet = await testUtil.rpc(method, [Commands.SETTING_GET.commandName, defaultProfile.id, 'key']);
        resMain.expectJson();
        resMain.expectStatusCode(404);
        const resultMain: any = resMain.getBody()['result'];
        expect(resultMain.error.error.success).toBe(false);
        expect(resultMain.error.error.message).toBe(`Entity with identifier key does not exist`);
    });

    test('Should fail to delete already removed setting', async () => {
        const res = await testUtil.rpc(method, [subCommand, defaultProfile.id, 'newKey', 'newValue']);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(`Entity with identifier key does not exist`);
    });

    test('Should fail to remove setting with wrong profile', async () => {
        const resMain = await rpc(method, [subCommand, 123123, 'newkey', 'newvalue']);
        resMain.expectJson();
        resMain.expectStatusCode(404);
        expect(resMain.error.error.success).toBe(false);
        expect(resMain.error.error.message).toBe(`Entity with identifier 123123 does not exist`);
    });
});
