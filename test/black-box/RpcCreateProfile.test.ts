import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';

describe('CreateProfile', () => {

    const testUtil = new BlackBoxTestUtil();
    const method = 'createprofile';

    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    test('Should create a new profile by RPC', async () => {
        const profileName = 'DEFAULT-TEST-PROFILE';
        const res = await rpc(method, [profileName]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.name).toBe(profileName);
    });

    test('Should fail because we want to create an empty profile', async () => {
        const res = await rpc(method, []);
        res.expectJson();
        res.expectStatusCode(400);
    });
});
