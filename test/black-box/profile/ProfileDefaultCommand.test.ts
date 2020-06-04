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

describe('ProfileDefaultCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const profileCommand = Commands.PROFILE_ROOT.commandName;
    const profileDefaultCommand = Commands.PROFILE_DEFAULT.commandName;

    const profileName = 'test-profile-' + Faker.random.uuid();

    let profile: resources.Profile;

    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    test('Should be tested', async () => {
        const res = await testUtil.rpc(profileCommand, [profileDefaultCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('id').getMessage());
    });

});
