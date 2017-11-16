import * as _ from 'lodash';
import { api } from './lib/api';
import { DatabaseResetCommand } from '../../src/console/DatabaseResetCommand';

describe('/RpcListingItemTemplate', () => {

    const keys = [
        'id', 'updatedAt', 'createdAt'
    ];

    const testData = {
        method: 'createlistingitemtemplate',
        params: [],
        jsonrpc: '2.0'
    };

    beforeAll(async () => {
        const command = new DatabaseResetCommand();
        await command.run();
    });

    test('Should create a new Listing Item Template by RPC', async () => {
        const res = await api('POST', '/api/rpc', {
            body: testData
        });
        res.expectJson();
        res.expectStatusCode(200);
        res.expectDataRpc(keys);
    });
});
