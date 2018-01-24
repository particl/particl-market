import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';

describe('ProfileCreateCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const method = 'profile';

    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    test('Should create a new profile by RPC', async () => {
        const profileName = 'DEFAULT-TEST-PROFILE';
        const profileAddress = 'DEFAULT-TEST-ADDRESS';
        const res = await rpc(method, ['add', profileName, profileAddress]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.name).toBe(profileName);
        expect(result.address).toBe(profileAddress);
    });

    test('Should fail because we want to create an empty profile', async () => {
        const res = await rpc(method, ['add']);
        res.expectJson();
        res.expectStatusCode(400);
    });
});
