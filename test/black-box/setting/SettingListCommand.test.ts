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

describe('SettingListCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const settingCommand = Commands.SETTING_ROOT.commandName;
    const settingListCommand = Commands.SETTING_LIST.commandName;
    const settingSetCommand = Commands.SETTING_SET.commandName;

    let market: resources.Market;
    let profile: resources.Profile;

    let setting1: resources.Setting;
    let setting2: resources.Setting;
    let setting3: resources.Setting;

    const testData1 = {
        key: 'key1',
        value: 'value1'
    };

    const testData2 = {
        key: 'key2',
        value: 'value2'
    };

    const testData3 = {
        key: 'key3',
        value: 'value3'
    };

    beforeAll(async () => {
        await testUtil.cleanDb();

        profile = await testUtil.getDefaultProfile();
        expect(profile.id).toBeDefined();
        market = await testUtil.getDefaultMarket(profile.id);
        expect(market.id).toBeDefined();

        // create setting1
        let res = await testUtil.rpc(settingCommand, [settingSetCommand,
            testData1.key,
            testData1.value,
            profile.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        setting1 = res.getBody()['result'];

        // create setting2
        res = await testUtil.rpc(settingCommand, [settingSetCommand,
            testData2.key,
            testData2.value,
            profile.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        setting2 = res.getBody()['result'];

        // create setting3
        res = await testUtil.rpc(settingCommand, [settingSetCommand,
            testData3.key,
            testData3.value,
            profile.id,
            market.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        setting3 = res.getBody()['result'];

    });

    test('Should fail to list Settings because missing profileId', async () => {
        const res = await testUtil.rpc(settingCommand, [settingListCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('profileId').getMessage());
    });

    test('Should fail to list Settings because invalid profileId', async () => {
        const res = await testUtil.rpc(settingCommand, [settingListCommand,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('profileId', 'number').getMessage());
    });

    test('Should fail to list Settings because invalid marketId', async () => {
        const res = await testUtil.rpc(settingCommand, [settingListCommand,
            profile.id,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('marketId', 'number').getMessage());
    });

    test('Should fail to list Settings because missing Profile model', async () => {
        const missingProfileId = 0;
        const res = await testUtil.rpc(settingCommand, [settingListCommand,
            missingProfileId
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('Profile').getMessage());
    });

    test('Should fail to list Settings because missing Market model', async () => {
        const res = await testUtil.rpc(settingCommand, [settingListCommand,
            profile.id,
            0
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('Market').getMessage());
    });

    test('Should list three Settings using profileId', async () => {
        const res = await testUtil.rpc(settingCommand, [settingListCommand,
            profile.id]
        );
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        expect(result.length).toBe(4);  // there is only PROFILE_DEFAULT_MARKETPLACE_ID + 3 settings we created
    });

    test('Should list 1 Setting using profileId and marketId', async () => {
        const res = await testUtil.rpc(settingCommand, [settingListCommand,
            profile.id,
            market.id]
        );
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        log.debug('result:', JSON.stringify(result, null, 2));
        expect(result.length).toBe(1);
    });

});
