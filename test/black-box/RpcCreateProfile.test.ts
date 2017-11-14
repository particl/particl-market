import * as _ from 'lodash';
import { api } from './lib/api';
import { DatabaseResetCommand } from '../../src/console/DatabaseResetCommand';

describe('/RpcCreateProfile', () => {

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
        const result: any = res.getBody()['result'];
        expect(result.name).toBe(testData.params[0]);
    });
});
