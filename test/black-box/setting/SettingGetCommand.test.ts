// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';

describe('SettingGetCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const settingCommand = Commands.SETTING_ROOT.commandName;
    const settingGetCommand = Commands.SETTING_GET.commandName;
    const settingSetCommand = Commands.SETTING_SET.commandName;

    let profile: resources.Profile;
    let market: resources.Market;

    let setting1: resources.Setting;
    let setting2: resources.Setting;
    let setting3: resources.Setting;

    const testData = {
        key: 'key',
        value: 'value'
    };

    const testData2 = {
        key: 'key2',
        value: 'value2'
    };

    beforeAll(async () => {
        await testUtil.cleanDb();

        profile = await testUtil.getDefaultProfile();
        expect(profile.id).toBeDefined();
        market = await testUtil.getDefaultMarket(profile.id);
        expect(market.id).toBeDefined();

        let res = await testUtil.rpc(settingCommand, [settingSetCommand,
            testData.key,
            testData.value,
            profile.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        setting1 = res.getBody()['result'];

        res = await testUtil.rpc(settingCommand, [settingSetCommand,
            testData.key,
            testData.value,
            profile.id,
            market.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        setting2 = res.getBody()['result'];

        res = await testUtil.rpc(settingCommand, [settingSetCommand,
            testData2.key,
            testData2.value,
            profile.id,
            market.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        setting3 = res.getBody()['result'];

    });

    test('Should fail because missing key', async () => {
        const res = await testUtil.rpc(settingCommand, [settingGetCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('key').getMessage());
    });

    test('Should fail because missing profileId', async () => {
        const res = await testUtil.rpc(settingCommand, [settingGetCommand,
            testData.key
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('profileId').getMessage());
    });

    test('Should fail because invalid key', async () => {
        const res = await testUtil.rpc(settingCommand, [settingGetCommand,
            false,
            profile.id
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('key', 'string').getMessage());
    });

    test('Should fail because invalid profileId', async () => {
        const res = await testUtil.rpc(settingCommand, [settingGetCommand,
            testData.key,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('profileId', 'number').getMessage());
    });

    test('Should fail because missing Profile model', async () => {
        const res = await testUtil.rpc(settingCommand, [settingGetCommand,
            testData.key,
            0
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('Profile').getMessage());
    });

    test('Should return Setting1 and Setting2 by key and profileId', async () => {
        //
        const res = await testUtil.rpc(settingCommand, [settingGetCommand,
            testData.key,
            profile.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.Setting = res.getBody()['result'];
        expect(result[0].Profile).toBeDefined();
        expect(result[0].Profile.id).toBe(profile.id);
        expect(result[0].key).toBe(setting1.key);
        expect(result[0].value).toBe(setting1.value);
        expect(result[0].Market).toBeUndefined();

        expect(result[1].Profile).toBeDefined();
        expect(result[1].Profile.id).toBe(profile.id);
        expect(result[1].Market).toBeDefined();
        expect(result[1].Market.id).toBe(market.id);
        expect(result[1].key).toBe(setting2.key);
        expect(result[1].value).toBe(setting2.value);

    });

    test('Should return Setting3 by key and profileId and marketId', async () => {
        //
        const res = await testUtil.rpc(settingCommand, [settingGetCommand,
            testData.key,
            profile.id,
            market.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.Setting = res.getBody()['result'];
        expect(result[0].Profile).toBeDefined();
        expect(result[0].Profile.id).toBe(profile.id);
        expect(result[0].Market).toBeDefined();
        expect(result[0].Market.id).toBe(market.id);
        expect(result[0].key).toBe(setting2.key);
        expect(result[0].value).toBe(setting2.value);
    });

    test('Should return Setting3 by key and profileId and marketId', async () => {
        //
        const res = await testUtil.rpc(settingCommand, [settingGetCommand,
            testData2.key,
            profile.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.Setting = res.getBody()['result'];
        log.debug('result: ', JSON.stringify(result, null, 2));
        expect(result[0].Profile).toBeDefined();
        expect(result[0].Profile.id).toBe(profile.id);
        expect(result[0].Market).toBeDefined();
        expect(result[0].Market.id).toBe(market.id);
        expect(result[0].key).toBe(setting3.key);
        expect(result[0].value).toBe(setting3.value);
    });

});
