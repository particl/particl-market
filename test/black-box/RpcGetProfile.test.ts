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

    let createdId;
    beforeAll(async () => {
        const command = new DatabaseResetCommand();
        await command.run();
    });

    test('POST      /profiles        Should create a new profile by RPC', async () => {
        const res = await api('POST', '/api/rpc', {
            body: testData
        });
        res.expectJson();
        res.expectStatusCode(200);
        res.expectDataRpc(keys);
        const result: object = res.getBody()['result'];
        createdId = result['id'];
        expect(result['name']).toBe(testData.params[0]);
    });

    test('GET       /profiles/:id    Should return one profile by ID', async () => {
        testData.method = 'getprofile';
        testData.params[0] = createdId;
        const res = await api('POST', '/api/rpc', {
            body: testData
        });
        res.expectJson();
        res.expectStatusCode(200);
        res.expectDataRpc(keys);
        const result: any = res.getBody()['result'];
        expect(result.id).toBe(testData.params[0]);
    });

    test('GET       /profiles/:name    Should return one profile by Name', async () => {
        testData.method = 'getprofile';
        testData.params[0] = 'DEFAULT-PROFILE';
        const res = await api('POST', '/api/rpc', {
            body: testData
        });
        res.expectJson();
        res.expectStatusCode(200);
        res.expectDataRpc(keys);
        const result: any = res.getBody()['result'];
        expect(result.name).toBe(testData.params[0]);
    });
});
