// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';

describe('SettingRemoveCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const settingCommand = Commands.SETTING_ROOT.commandName;
    const settingRemoveCommand = Commands.SETTING_REMOVE.commandName;
    const settingSetCommand = Commands.SETTING_SET.commandName;

    let market: resources.Market;
    let profile: resources.Profile;
    let setting: resources.Setting;

    const testData = {
        key: 'key',
        value: 'value'
    };

    beforeAll(async () => {
        await testUtil.cleanDb();

        // get default profile and market
        profile = await testUtil.getDefaultProfile();
        market = await testUtil.getDefaultMarket();

        // create setting
        const res = await testUtil.rpc(settingCommand, [settingSetCommand,
            testData.key,
            testData.value,
            profile.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        setting = res.getBody()['result'];

    });

    test('Should fail to remove Setting because missing settingId', async () => {
        const res = await testUtil.rpc(settingCommand, [settingRemoveCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('settingId').getMessage());
    });

    test('Should fail to remove Setting because invalid settingId', async () => {
        const res = await testUtil.rpc(settingCommand, [settingRemoveCommand,
            'INVALID'
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('settingId', 'number').getMessage());
    });

    test('Should fail to remove Setting because Setting model not found', async () => {
        const res = await testUtil.rpc(settingCommand, [settingRemoveCommand,
            0
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('Setting').getMessage());
    });

    test('Should remove Setting by settingId', async () => {
        const res = await testUtil.rpc(settingCommand, [settingRemoveCommand,
            setting.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
    });

    test('Should fail to remove already removed Setting', async () => {
        const res = await testUtil.rpc(settingCommand, [settingRemoveCommand,
            setting.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('Setting').getMessage());
    });

});
