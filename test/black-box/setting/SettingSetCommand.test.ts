// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { Logger as LoggerType } from '../../../src/core/Logger';
import {MissingParamException} from '../../../src/api/exceptions/MissingParamException';
import {InvalidParamException} from '../../../src/api/exceptions/InvalidParamException';
import {ModelNotFoundException} from '../../../src/api/exceptions/ModelNotFoundException';

describe('SettingSetCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const settingCommand = Commands.SETTING_ROOT.commandName;
    const settingSetCommand = Commands.SETTING_SET.commandName;

    let market: resources.Market;
    let profile: resources.Profile;

    const testData = {
        key: 'key',
        value: 'value'
    };

    const testDataUpdated = {
        key: 'keyUPDATED',
        value: 'valueUPDATED'
    };

    beforeAll(async () => {
        await testUtil.cleanDb();

        // get default profile and market
        profile = await testUtil.getDefaultProfile();
        market = await testUtil.getDefaultMarket();

    });

    test('Should fail to set Setting because missing key', async () => {
        const res = await testUtil.rpc(settingCommand, [settingSetCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('key').getMessage());
    });

    test('Should fail to set Setting because missing value', async () => {
        const res = await testUtil.rpc(settingCommand, [settingSetCommand,
            testData.key
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('value').getMessage());
    });

    test('Should fail to set Setting because missing profileId', async () => {
        const res = await testUtil.rpc(settingCommand, [settingSetCommand,
            testData.key,
            testData.value
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('profileId').getMessage());
    });

    test('Should fail to set Setting because invalid key', async () => {
        const res = await testUtil.rpc(settingCommand, [settingSetCommand,
            0,
            testData.value,
            profile.id
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('key', 'string').getMessage());
    });

    test('Should fail to set Setting because invalid value', async () => {
        const res = await testUtil.rpc(settingCommand, [settingSetCommand,
            testData.key,
            0,
            profile.id
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('value', 'string').getMessage());
    });

    test('Should fail to set Setting because invalid profileId', async () => {
        const res = await testUtil.rpc(settingCommand, [settingSetCommand,
            testData.key,
            testData.value,
            'INVALID'
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('profileId', 'number').getMessage());
    });

    test('Should fail to set Setting because missing Profile model', async () => {
        const missingProfileId = 0;
        const res = await testUtil.rpc(settingCommand, [settingSetCommand,
            testData.key,
            testData.value,
            missingProfileId
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('Profile').getMessage());
    });

    test('Should set a Setting', async () => {
        const res = await testUtil.rpc(settingCommand, [settingSetCommand,
            testData.key,
            testData.value,
            profile.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Setting = res.getBody()['result'];
        expect(result.Profile).toBeDefined();
        expect(result.Profile.id).toBe(profile.id);
        expect(result.key).toBe(testData.key);
        expect(result.value).toBe(testData.value);
    });

    test('Should update the previously created Setting', async () => {
        const res = await testUtil.rpc(settingCommand, [settingSetCommand,
            testDataUpdated.key,
            testDataUpdated.value,
            profile.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Setting = res.getBody()['result'];
        expect(result.Profile).toBeDefined();
        expect(result.Profile.id).toBe(profile.id);
        expect(result.key).toBe(testDataUpdated.key);
        expect(result.value).toBe(testDataUpdated.value);
    });


});
