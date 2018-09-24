// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import { api, rpc } from '../lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';

describe('SettingGetCommand', () => {
    const testUtil = new BlackBoxTestUtil();
    const method = Commands.SETTING_ROOT.commandName;
    const subCommand = Commands.SETTING_GET.commandName;


    let defaultProfile;

    beforeAll(async () => {
        await testUtil.cleanDb();

        defaultProfile = await testUtil.getDefaultProfile();
    });

    test('Should return setting by id and key', async () => {
        // create setting
        const res = await testUtil.rpc(method, [Commands.SETTING_SET.commandName, defaultProfile.id, 'key', 'value']);
        // call rpc api
        res.expectJson();
        res.expectStatusCode(200);
        //
        const resMain = await testUtil.rpc(method, [subCommand, defaultProfile.id, 'key']);
        resMain.expectJson();
        resMain.expectStatusCode(200);
        const resultMain: any = resMain.getBody()['result'];
        expect(resultMain.Profile).toBeDefined();
        expect(resultMain.Profile.id).toBe(defaultProfile.id);
        expect(resultMain.key).toBe('key');
        expect(resultMain.value).toBe('value');
    });

    test('Should fail to return setting without key', async () => {
        const resMain = await rpc(method, [subCommand, 'profileName']);
        resMain.expectJson();
        resMain.expectStatusCode(404);
        expect(resMain.error.error.success).toBe(false);
        expect(resMain.error.error.message).toBe('Missing params!');
    });

    test('Should fail to return setting with wrong profile', async () => {
        const resMain = await rpc(method, [subCommand, 123123, 'key']);
        resMain.expectJson();
        resMain.expectStatusCode(404);
        expect(resMain.error.error.success).toBe(false);
        expect(resMain.error.error.message).toBe(`Entity with identifier 123123 does not exist`);
    });
});
