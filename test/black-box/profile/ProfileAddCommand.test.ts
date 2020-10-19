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
import { MessageException } from '../../../src/api/exceptions/MessageException';


describe('ProfileAddCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const profileCommand = Commands.PROFILE_ROOT.commandName;
    const profileAddCommand = Commands.PROFILE_ADD.commandName;

    let profile: resources.Profile;

    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    test('Should fail to create because missing name', async () => {
        const res = await testUtil.rpc(profileCommand, [profileAddCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('name').getMessage());
    });

    test('Should fail to add because invalid name', async () => {
        const res = await testUtil.rpc(profileCommand, [profileAddCommand,
            0
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('name', 'string').getMessage());
    });

    test('Should fail to create because wallet already exist', async () => {
        const res = await testUtil.rpc(profileCommand, [profileAddCommand,
            'TEST-1'
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MessageException('Wallet with the same name already exists.').getMessage());
    });

    test('Should create a new Profile even with existing wallet', async () => {
        const res = await testUtil.rpc(profileCommand, [profileAddCommand,
            'TEST-1',
            true
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        profile = result;
        expect(result.name).toBe('TEST-1');
    });

    test('Should fail to create because given name already exist', async () => {
        const res = await testUtil.rpc(profileCommand, [profileAddCommand,
            'TEST-1'
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MessageException('Profile with the same name already exists.').getMessage());
    });

});
