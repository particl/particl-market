import { rpc, api } from '../lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { MessageException } from '../../../src/api/exceptions/MessageException';

describe('ProfileUpdateCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const method = Commands.PROFILE_ROOT.commandName;
    const subCommand = Commands.PROFILE_UPDATE.commandName;

    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    test('Should update the profile by RPC', async () => {
        // set up the test data
        let generatedProfile: any = await testUtil.generateData(CreatableModel.PROFILE, 1, true);
        generatedProfile = generatedProfile[0];
        const createdId = generatedProfile.id;

        // update profile
        const profileName = 'UPDATED-DEFAULT-PROFILE-TEST';
        const profileAddress = 'UPDATED-DEFAULT-PROFILE-TEST-ADDRESS';
        const res = await rpc(method, [subCommand, createdId, profileName]);
        console.log(JSON.stringify(res));
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.name).toBe(profileName);
        expect(result.address).toBe(generatedProfile.address); // we are not allowing the address to be updated
    });

});
