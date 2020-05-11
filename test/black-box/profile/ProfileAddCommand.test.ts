// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import * as Faker from 'faker';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { MessageException } from '../../../src/api/exceptions/MessageException';

describe('ProfileAddCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const profileCommand = Commands.PROFILE_ROOT.commandName;
    const profileAddCommand = Commands.PROFILE_ADD.commandName;

    const profileName = 'test-profile-' + Faker.random.uuid();

    let createdProfile: resources.Profile;

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

    test('Should create a new Profile', async () => {
        const res = await testUtil.rpc(profileCommand, [profileAddCommand,
            profileName
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        createdProfile = result;
        expect(result.name).toBe(profileName);
        expect(result.ShoppingCart).toHaveLength(1);
        expect(result.ShoppingCart[0].name).toBe('DEFAULT');
    });

    test('Should fail to create because given name already exist', async () => {
        const res = await testUtil.rpc(profileCommand, [profileAddCommand,
            profileName
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MessageException('Profile with the same name already exists.').getMessage());
    });


});
