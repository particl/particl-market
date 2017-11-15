import * as _ from 'lodash';
import { api } from './lib/api';
import { DatabaseResetCommand } from '../../src/console/DatabaseResetCommand';

describe('/RpcGetProfile', () => {

    const keys = [
        'id', 'name', 'updatedAt', 'createdAt'
    ];

    const testData = {
        method: 'createprofile',
        params: [
            'DEFAULT-PROFILE'
        ],
        jsonrpc: '2.0'
    };

    const testDataGet = {
        method: 'getprofile',
        params: [
            '0'
        ],
        jsonrpc: '2.0'
    };

    let createdId;
    beforeAll(async () => {
        const command = new DatabaseResetCommand();
        await command.run();
    });

    test('Should return one profile by ID', async () => {
        // created profile
        const res = await api('POST', '/api/rpc', {
            body: testData
        });
        res.expectJson();
        res.expectStatusCode(200);
        res.expectDataRpc(keys);
        const result: object = res.getBody()['result'];
        createdId = result['id'];

        // get profile
        testDataGet.params[0] = createdId;
        const resMain = await api('POST', '/api/rpc', {
            body: testDataGet
        });
        resMain.expectJson();
        resMain.expectStatusCode(200);
        resMain.expectDataRpc(keys);
        const resultMain: any = resMain.getBody()['result'];
        expect(resultMain.id).toBe(testDataGet.params[0]);
    });

    test('Should return one profile by Name', async () => {
        testDataGet.params[0] = 'DEFAULT-PROFILE';
        const res = await api('POST', '/api/rpc', {
            body: testDataGet
        });
        res.expectJson();
        res.expectStatusCode(200);
        res.expectDataRpc(keys);
        const result: any = res.getBody()['result'];
        expect(result.name).toBe(testData.params[0]);
    });
});
