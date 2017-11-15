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

    let createdId;
    const testDataUpdated = {
        method: 'updateaddress',
        params: [
            0,
            'Home',
            '456 9th St',
            'Melb, FL 32904',
            'Melb',
            Country.SWEDEN,
            0
        ],
        jsonrpc: '2.0'
    };


    beforeAll(async () => {
        const command = new DatabaseResetCommand();
        await command.run();
    });

    test('Should update the address', async () => {
        // create address
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

        // update address
        testDataUpdated.params[0] = createdId;
        const resMain = await api('POST', '/api/rpc', {
            body: testDataUpdated
        });
        resMain.expectJson();
        resMain.expectStatusCode(200);
        resMain.expectDataRpc(keys);
        const resultMain: any = resMain.getBody()['result'];
        expect(resultMain.title).toBe(testDataUpdated.params[1]);
        expect(resultMain.addressLine1).toBe(testDataUpdated.params[2]);
        expect(resultMain.addressLine2).toBe(testDataUpdated.params[3]);
        expect(resultMain.city).toBe(testDataUpdated.params[4]);
        expect(resultMain.country).toBe(testDataUpdated.params[5]);
    });
});
