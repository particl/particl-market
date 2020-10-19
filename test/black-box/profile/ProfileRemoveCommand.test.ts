// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';


describe('ProfileRemoveCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const profileCommand = Commands.PROFILE_ROOT.commandName;
    const profileRemoveCommand = Commands.PROFILE_REMOVE.commandName;
    const profileAddCommand = Commands.PROFILE_ADD.commandName;

    let profile1: resources.Profile;

    beforeAll(async () => {
        await testUtil.cleanDb();

        const res = await testUtil.rpc(profileCommand, [profileAddCommand,
            'TEST-1',
            true
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        profile1 = result;
        expect(result.name).toBe('TEST-1');

    });

    test('Should fail because missing profileId', async () => {
        const res = await testUtil.rpc(profileCommand, [profileRemoveCommand]);
        res.expectJson();
        expect(res.error.error.message).toBe(new MissingParamException('profileId').getMessage());
    });


    test('Should fail because invalid profileId', async () => {
        const res = await testUtil.rpc(profileCommand, [profileRemoveCommand,
            false
        ]);
        res.expectJson();
        expect(res.error.error.message).toBe(new InvalidParamException('profileId', 'number').getMessage());
    });


    test('Should fail because Profile not found', async () => {
        const res = await testUtil.rpc(profileCommand, [profileRemoveCommand,
            0
        ]);
        res.expectJson();
        expect(res.error.error.message).toBe(new ModelNotFoundException('Profile').getMessage());

    });


    test('Should delete the Profile by id', async () => {
        const res = await testUtil.rpc(profileCommand, [profileRemoveCommand,
            profile1.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
    });

});
