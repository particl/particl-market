// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { Logger as LoggerType } from '../../../src/core/Logger';
import * as resources from 'resources';

describe('ProfileRemoveCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const profileCommand = Commands.PROFILE_ROOT.commandName;
    const profileRemoveCommand = Commands.PROFILE_REMOVE.commandName;

    let createdProfile1: resources.Profile;
    let createdProfile2: resources.Profile;

    beforeAll(async () => {
        await testUtil.cleanDb();

        const generatedProfiles: resources.Profile[] = await testUtil.generateData(CreatableModel.PROFILE, 2, true);
        expect(generatedProfiles).toHaveLength(2);
        createdProfile1 = generatedProfiles[0];
        createdProfile2 = generatedProfiles[1];

    });

    test('Should fail to delete Profile with invalid id', async () => {
        const invalidProfileId = 0;
        const res = await testUtil.rpc(profileCommand, [profileRemoveCommand, invalidProfileId]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Entity with identifier ' + invalidProfileId + ' does not exist');
    });

    test('Should delete the Profile by id', async () => {
        const res = await testUtil.rpc(profileCommand, [profileRemoveCommand, createdProfile1.id]);
        res.expectJson();
        res.expectStatusCode(200);
    });

    test('Should delete the Profile by name ', async () => {
        const res = await testUtil.rpc(profileCommand, [profileRemoveCommand, createdProfile2.name]);
        res.expectJson();
        res.expectStatusCode(200);
    });

    test('Should fail to delete Profile using id because it doesnt exist', async () => {
        const res = await testUtil.rpc(profileCommand, [profileRemoveCommand, createdProfile1.id]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Entity with identifier ' + createdProfile1.id + ' does not exist');
    });

    test('Should fail to delete Profile using name because it doesnt exist', async () => {
        const res = await testUtil.rpc(profileCommand, [profileRemoveCommand, createdProfile2.name]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Entity with identifier ' + createdProfile2.name + ' does not exist');
    });

});
