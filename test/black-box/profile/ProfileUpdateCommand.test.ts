// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { Logger as LoggerType } from '../../../src/core/Logger';

describe('ProfileUpdateCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const profileCommand = Commands.PROFILE_ROOT.commandName;
    const profileUpdateCommand = Commands.PROFILE_UPDATE.commandName;

    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    test('Should fail to update the Profile because bad id', async () => {
        // set up the test data
        const createdId = 123123;

        const profileName = 'UPDATED-DEFAULT-PROFILE-TEST';
        const res = await testUtil.rpc(profileCommand, [profileUpdateCommand, createdId, profileName]);

        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(`Entity with identifier ${createdId} does not exist`);
    });

    test('Should fail to update the Profile because null id', async () => {
        // set up the test data
        const createdId = null;

        const profileName = 'UPDATED-DEFAULT-PROFILE-TEST';
        const res = await testUtil.rpc(profileCommand, [profileUpdateCommand, createdId, profileName]);

        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(`Invalid ${createdId}, should be of type: number`);
    });

    test('Should fail to update the Profile because string id', async () => {
        // set up the test data
        const createdId = 'BAD STRING ID';

        const profileName = 'UPDATED-DEFAULT-PROFILE-TEST';
        const res = await testUtil.rpc(profileCommand, [profileUpdateCommand, createdId, profileName]);

        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(`Invalid ${createdId}, should be of type: number`);
    });

    test('Should fail to update the Profile because null profileName', async () => {
        // set up the test data
        let generatedProfile: any = await testUtil.generateData(CreatableModel.PROFILE, 1, true);
        generatedProfile = generatedProfile[0];
        const createdId = generatedProfile.id;

        const profileName = null;
        const res = await testUtil.rpc(profileCommand, [profileUpdateCommand, createdId, profileName]);

        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(`Invalid ${profileName}, should be of type: string`);
    });

    test('Should fail to update the Profile because bad profileName', async () => {
        // set up the test data
        let generatedProfile: any = await testUtil.generateData(CreatableModel.PROFILE, 1, true);
        generatedProfile = generatedProfile[0];
        const createdId = generatedProfile.id;

        const profileName = -1;
        const res = await testUtil.rpc(profileCommand, [profileUpdateCommand, createdId, profileName]);

        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(`Invalid ${profileName}, should be of type: string`);
    });

    test('Should update the Profile', async () => {
        // set up the test data
        let generatedProfile: any = await testUtil.generateData(CreatableModel.PROFILE, 1, true);
        generatedProfile = generatedProfile[0];
        const createdId = generatedProfile.id;

        const profileName = 'UPDATED-DEFAULT-PROFILE-TEST';
        const profileAddress = 'UPDATED-DEFAULT-PROFILE-TEST-ADDRESS';
        const res = await testUtil.rpc(profileCommand, [profileUpdateCommand, createdId, profileName]);

        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.name).toBe(profileName);
        expect(result.address).toBe(generatedProfile.address); // we are not allowing the address to be updated
    });

});
