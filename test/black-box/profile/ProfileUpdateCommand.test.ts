// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';

describe('ProfileUpdateCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const profileCommand = Commands.PROFILE_ROOT.commandName;
    const profileUpdateCommand = Commands.PROFILE_UPDATE.commandName;

    let profile: resources.Profile;

    beforeAll(async () => {
        await testUtil.cleanDb();

        // set up the test data
        const generatedProfiles: resources.Profile[] = await testUtil.generateData(CreatableModel.PROFILE, 1, true);
        expect(generatedProfiles).toHaveLength(1);
        profile = generatedProfiles[0];

    });

    test('Should fail because missing profileId', async () => {
        const res = await testUtil.rpc(profileCommand, [profileUpdateCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('id').getMessage());
    });

    test('Should fail because missing profileName', async () => {
        const res = await testUtil.rpc(profileCommand, [profileUpdateCommand,
            profile.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('name').getMessage());
    });

    test('Should fail because invalid profileId', async () => {
        const res = await testUtil.rpc(profileCommand, [profileUpdateCommand,
            false,
            'UPDATED-DEFAULT-PROFILE-TEST'
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('id', 'number').getMessage());
    });

    test('Should fail because invalid profileName', async () => {
        const res = await testUtil.rpc(profileCommand, [profileUpdateCommand,
            profile.id,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('name', 'string').getMessage());
    });

    test('Should update the Profile', async () => {
        const res = await testUtil.rpc(profileCommand, [profileUpdateCommand,
            profile.id,
            'UPDATED-DEFAULT-PROFILE-TEST'
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.name).toBe('UPDATED-DEFAULT-PROFILE-TEST');
    });

});
