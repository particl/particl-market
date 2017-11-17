import * as _ from 'lodash';
import { api } from './lib/api';
import { DatabaseResetCommand } from '../../src/console/DatabaseResetCommand';

describe('/RpcGetListingItemTemplate', () => {

    const keys = [
        'id', 'updatedAt', 'createdAt'
    ];

    const testDataCreate = {
        method: 'createlistingitemtemplate',
        params: [
            0
        ],
        jsonrpc: '2.0'
    };

    const testDataForGet = {
        method: 'getlistingitemtemplate',
        params: [],
        jsonrpc: '2.0'
    };

    beforeAll(async () => {
        const command = new DatabaseResetCommand();
        await command.run();
    });

    test('Should return one Item Template by Id', async () => {
        // create item template
        const res = await api('POST', '/api/rpc', {
            body: testDataCreate
        });
        res.expectJson();
        res.expectStatusCode(200);
        res.expectDataRpc(keys);
        const result: object = res.getBody()['result'];
        const createdId = result['id'];

        // get item template
        testDataForGet.params[0] = createdId;
        const resMain = await api('POST', '/api/rpc', {
            body: testDataForGet
        });
        resMain.expectJson();
        resMain.expectStatusCode(200);
        resMain.expectDataRpc(keys);
        const resultMain: object = resMain.getBody()['result'];
        expect(resultMain['id']).toBe(testDataForGet.params[0]);
        // check profile
        expect(resultMain['profileId']).toBe(0);
        // check realted models
        expect(resultMain).hasOwnProperty('profile');

        expect(resultMain).hasOwnProperty('ItemInformation');

        expect(resultMain).hasOwnProperty('PaymentInformation');

        expect(resultMain).hasOwnProperty('MessagingInformation');

        expect(resultMain).hasOwnProperty('ListingItemObjects');

        expect(resultMain).hasOwnProperty('ListingItem');
    });
});
