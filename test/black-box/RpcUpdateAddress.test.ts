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

    const testDataUpdated = {
        method: 'updateaddress',
        params: [
            ,
            'Home',
            '456 9th St',
            'Melb, FL 32904',
            'Melb',
            Country.SWEDEN,
            0
        ],
        jsonrpc: '2.0'
    };

    let createdId;
    beforeAll(async () => {
        const command = new DatabaseResetCommand();
        await command.run();
    });

    test('POST      /addresses        Should create a new profile by RPC', async () => {
        const res = await api('POST', '/api/rpc', {
            body: testData
        });
        res.expectJson();
        res.expectStatusCode(200);
        res.expectDataRpc(keys);
        const result: any = res.getBody()['result'];
        createdId = result.id;
        expect(result.title).toBe(testData.params[0]);
        expect(result.addressLine1).toBe(testData.params[1]);
        expect(result.addressLine2).toBe(testData.params[2]);
        expect(result.city).toBe(testData.params[3]);
        expect(result.country).toBe(testData.params[4]);
    });

    test('POST       /addresses/:id    Should update the address', async () => {
        testDataUpdated.params[0] = createdId;
        const res = await api('POST', '/api/rpc', {
            body: testDataUpdated
        });
        res.expectJson();
        res.expectStatusCode(200);
        res.expectDataRpc(keys);
        const result: any = res.getBody()['result'];
        expect(result.title).toBe(testDataUpdated.params[1]);
        expect(result.addressLine1).toBe(testDataUpdated.params[2]);
        expect(result.addressLine2).toBe(testDataUpdated.params[3]);
        expect(result.city).toBe(testDataUpdated.params[4]);
        expect(result.country).toBe(testDataUpdated.params[5]);
    });
});
