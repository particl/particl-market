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
    const subCommand = Commands.SETTING_LIST.commandName;


    let defaultProfile;

    beforeAll(async () => {
        await testUtil.cleanDb();

        defaultProfile = await testUtil.getDefaultProfile();
    });

    test('Should list two setting by id and key', async () => {
        // create setting
        const res1 = await testUtil.rpc(method, [Commands.SETTING_SET.commandName, defaultProfile.id, 'key1', 'value1']);
        // call rpc api
        res1.expectJson();
        res1.expectStatusCode(200);
        // create setting
        const res2 = await testUtil.rpc(method, [Commands.SETTING_SET.commandName, defaultProfile.id, 'key2', 'value2']);
        // call rpc api
        res2.expectJson();
        res2.expectStatusCode(200);
        //
        const resMain = await testUtil.rpc(method, [subCommand, defaultProfile.id]);
        resMain.expectJson();
        resMain.expectStatusCode(200);
        const resultMain: any = resMain.getBody()['result'];
        expect(resultMain.length).toBe(2);
        expect(resultMain[0].Profile).toBeDefined();
        expect(resultMain[0].Profile.id).toBe(defaultProfile.id);
        expect(resultMain[0].key).toBe('key1');
        expect(resultMain[0].value).toBe('value1');
        expect(resultMain[1].Profile).toBeDefined();
        expect(resultMain[1].Profile.id).toBe(defaultProfile.id);
        expect(resultMain[1].key).toBe('key2');
        expect(resultMain[1].value).toBe('value2');
    });

    test('Should fail to list settings with wrong profile', async () => {
        const resMain = await rpc(method, [subCommand, 123123]);
        resMain.expectJson();
        resMain.expectStatusCode(404);
        expect(resMain.error.error.success).toBe(false);
        expect(resMain.error.error.message).toBe(`Entity with identifier 123123 does not exist`);
    });
});
