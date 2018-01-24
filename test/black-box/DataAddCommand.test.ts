import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';

describe('DataAddCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const marketService = null;
    const method =  'data';

    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    const modelName = 'profile';
    const testProfileData = {
        name: 'test-profile',
        address: 'test-address'
    };

    test('Should create a test data for profile', async () => {
        const res = await rpc('data', ['add', modelName, JSON.stringify(testProfileData)]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.name).toBe(testProfileData.name);
        expect(result.address).toBe(testProfileData.address);
    });

    // todo : need to put more test after adding market and profile root command.
});
