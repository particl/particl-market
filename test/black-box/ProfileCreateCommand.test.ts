import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Commands } from '../../src/api/commands/CommandEnumType';

describe('ProfileCreateCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const method: any = Commands.PROFILE_ROOT;
    const subCommand = Commands.PROFILE_ADD;
    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    test('Should create a new profile by RPC', async () => {
        const profileName = 'DEFAULT-TEST-PROFILE';
        const profileAddress = 'DEFAULT-TEST-ADDRESS';
        const res = await rpc(method, [subCommand, profileName, profileAddress]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.name).toBe(profileName);
        expect(result.address).toBe(profileAddress);
    });

    test('Should fail because we want to create an empty profile', async () => {
        const res = await rpc(method, [subCommand]);
        res.expectJson();
        res.expectStatusCode(400);
    });
});
