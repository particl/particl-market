// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import { api, rpc } from '../lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';

describe('SettingSetCommand', () => {
    const testUtil = new BlackBoxTestUtil();
    const method = Commands.SETTING_ROOT.commandName;
    const subCommand = Commands.SETTING_SET.commandName;


    let defaultProfile;

    beforeAll(async () => {
        await testUtil.cleanDb();

        defaultProfile = await testUtil.getDefaultProfile();
    });

    test('Should create one setting by id and key', async () => {
        // create setting
        const res = await testUtil.rpc(method, [subCommand, defaultProfile.id, 'key', 'value']);
        res.expectJson();
        res.expectStatusCode(200);
        const resultMain: any = res.getBody()['result'];
        expect(resultMain.Profile).toBeDefined();
        expect(resultMain.Profile.id).toBe(defaultProfile.id);
        expect(resultMain.key).toBe('key');
        expect(resultMain.value).toBe('value');
    });

    test('Should update the setting', async () => {
        // create setting
        const res = await testUtil.rpc(method, [Commands.SETTING_SET.commandName, defaultProfile.id, 'newKey', 'newValue']);
        // call rpc api
        res.expectJson();
        res.expectStatusCode(200);
        //
        const resultMain: any = res.getBody()['result'];
        expect(resultMain.Profile).toBeDefined();
        expect(resultMain.Profile.id).toBe(defaultProfile.id);
        expect(resultMain.key).toBe('newKey');
        expect(resultMain.value).toBe('newValue');
    });

    test('Should fail to update setting with wrong profile', async () => {
        const resMain = await rpc(method, [subCommand, 123123, 'newkey', 'newvalue']);
        resMain.expectJson();
        resMain.expectStatusCode(404);
        expect(resMain.error.error.success).toBe(false);
        expect(resMain.error.error.message).toBe(`Entity with identifier 123123 does not exist`);
    });
});
