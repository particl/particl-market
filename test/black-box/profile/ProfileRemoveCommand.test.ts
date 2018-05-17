import { rpc, api } from '../lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import * as _ from 'lodash';

describe('ProfileRemoveCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const method = Commands.PROFILE_ROOT.commandName;
    const subCommand = Commands.PROFILE_REMOVE.commandName;

    let createdId = 0;
    let profileName;

    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    test('Should fail to delete profile for invalid id by RPC', async () => {
        // delete profile
        const res = await rpc(method, [subCommand, createdId]);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('Should delete the profile by id', async () => {
        // set up the test data
        let generatedProfile: any = await testUtil.generateData(CreatableModel.PROFILE, 1, true);
        generatedProfile = generatedProfile[0];
        createdId = generatedProfile.id;

        // delete profile
        const res = await rpc(method, [subCommand, createdId]);
        res.expectJson();
        res.expectStatusCode(200);
    });

    test('Should delete the profile by name ', async () => {
        // set up the test data
        let generatedProfile: any = await testUtil.generateData(CreatableModel.PROFILE, 1, true);
        generatedProfile = generatedProfile[0];
        profileName = generatedProfile.name;

        // delete profile by name
        const res = await rpc(method, [subCommand, profileName]);
        res.expectJson();
        res.expectStatusCode(200);
    });

    test('Should fail to delete profile because already been deleted by profile id ', async () => {
        // delete profile by name
        const res = await rpc(method, [subCommand, createdId]);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('Should fail to delete profile because already been deleted by profile name ', async () => {
        // delete profile by name
        const res = await rpc(method, [subCommand, profileName]);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('Should fail to get profile by id for the delete profile', async () => {
        const res = await rpc(method, [Commands.PROFILE_GET.commandName, createdId]);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('Should get empty profile by name for the delete profile', async () => {
        const res = await rpc(method, [Commands.PROFILE_GET.commandName, profileName]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toBe(null);
    });

    test('Should not contain the delete profile', async () => {
        const res = await rpc(method, [Commands.PROFILE_LIST.commandName]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        _.each(result, (pro) => {
            expect(pro.id).not.toBe(createdId);
        });
    });

});
