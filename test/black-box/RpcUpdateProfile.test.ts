import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';

describe('/RpcUpdateProfile', () => {

    const testUtil = new BlackBoxTestUtil();
    const method = 'createprofile';

    const testData = {
        method: 'createprofile',
        params: [
            'DEFAULT-PROFILE'
        ],
        jsonrpc: '2.0'
    };

    const testDataUpdate = {
        method: 'updateprofile',
        params: [
            0,
            'NEW-DEFAULT-PROFILE'
        ],
        jsonrpc: '2.0'
    };

    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    test('Should update the profile by RPC', async () => {
        // create profile
        const res = await api('POST', '/api/rpc', {
            body: testData
        });
        res.expectJson();
        res.expectStatusCode(200);
        res.expectDataRpc(keys);
        const result: any = res.getBody()['result'];
        const createdId = result.id;

        // update profile
        testDataUpdate.params[0] = createdId;
        const resMain = await api('POST', '/api/rpc', {
            body: testDataUpdate
        });
        resMain.expectJson();
        resMain.expectStatusCode(200);
        resMain.expectDataRpc(keys);
        const resultMain: any = resMain.getBody()['result'];
        expect(resultMain.name).toBe(testDataUpdate.params[1]);
    });

});
