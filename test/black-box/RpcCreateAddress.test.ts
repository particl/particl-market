import * as _ from 'lodash';
import { api } from './lib/api';
import { DatabaseResetCommand } from '../../src/console/DatabaseResetCommand';
import { Country } from '../../src/api/enums/Country';

describe('/RpcCreateAddress', () => {

    const keys = [
        'id', 'updatedAt', 'createdAt', 'title', 'addressLine1', 'addressLine2', 'city', 'country'
    ];

    const testData = {
        method: 'createaddress',
        params: [
            'Work',
            '123 6th St',
            'Melbourne, FL 32904',
            'Melbourne',
            Country.FINLAND,
            0
        ],
        jsonrpc: '2.0'
    };

    beforeAll(async () => {
        const command = new DatabaseResetCommand();
        await command.run();
    });

    test('Should create a new address by RPC', async () => {
        const res = await api('POST', '/api/rpc', {
            body: testData
        });
        res.expectJson();
        res.expectStatusCode(200);
        res.expectDataRpc(keys);
        const result: any = res.getBody()['result'];
        expect(result.title).toBe(testData.params[0]);
        expect(result.addressLine1).toBe(testData.params[1]);
        expect(result.addressLine2).toBe(testData.params[2]);
        expect(result.city).toBe(testData.params[3]);
        expect(result.country).toBe(testData.params[4]);
    });

    test('Should fail because we want to create an empty address without required fields', async () => {
        testData.params[1] = '';
        const res = await api('POST', '/api/rpc', {
            body: testData
        });
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('Should fail because we want to create an empty address', async () => {
        testData.params = [];
        const res = await api('POST', '/api/rpc', {
            body: testData
        });
        res.expectJson();
        res.expectStatusCode(400);
    });
});
