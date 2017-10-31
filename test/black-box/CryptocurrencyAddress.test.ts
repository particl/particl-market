import { api } from './lib/api';
import { DatabaseResetCommand } from '../../src/console/DatabaseResetCommand';
import { CryptocurrencyAddressType } from '../../src/api/enums/CryptocurrencyAddressType';

describe('/cryptocurrency-addresses', () => {

    const keys = [
        'id', 'updatedAt', 'createdAt', 'type', 'address' // , 'Related'
    ];

    // const keysWithoutRelated = [
    //    'id', 'updatedAt', 'createdAt', 'type', 'address'
    // ];

    const testData = {
        type: CryptocurrencyAddressType.NORMAL,
        address: '123'
    };

    const testDataUpdated = {
        type: CryptocurrencyAddressType.STEALTH,
        address: '456'
    };

    let createdId;
    beforeAll(async () => {
        const command = new DatabaseResetCommand();
        await command.run();
    });

    test('POST      /cryptocurrency-addresses        Should create a new cryptocurrency address', async () => {
        const res = await api('POST', '/api/cryptocurrency-addresses', {
            body: testData
        });
        res.expectJson();
        res.expectStatusCode(201);
        res.expectData(keys);
        createdId = res.getData()['id'];

        const result: any = res.getData();
        expect(result.type).toBe(testData.type);
        expect(result.address).toBe(testData.address);
    });

    test('POST      /cryptocurrency-addresses        Should fail because we want to create a empty cryptocurrency address', async () => {
        const res = await api('POST', '/api/cryptocurrency-addresses', {
            body: {}
        });
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('GET       /cryptocurrency-addresses        Should list cryptocurrency addresss with our new create one', async () => {
        const res = await api('GET', '/api/cryptocurrency-addresses');
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys); // keysWithoutRelated
        const data = res.getData<any[]>();
        expect(data.length).toBe(1);

        const result = data[0];
        expect(result.type).toBe(testData.type);
        expect(result.address).toBe(testData.address);
    });

    test('GET       /cryptocurrency-addresses/:id    Should return one cryptocurrency address', async () => {
        const res = await api('GET', `/api/cryptocurrency-addresses/${createdId}`);
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys);

        const result: any = res.getData();
        expect(result.type).toBe(testData.type);
        expect(result.address).toBe(testData.address);
    });

    test('PUT       /cryptocurrency-addresses/:id    Should update the cryptocurrency address', async () => {
        const res = await api('PUT', `/api/cryptocurrency-addresses/${createdId}`, {
            body: testDataUpdated
        });
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys);

        const result: any = res.getData();
        expect(result.type).toBe(testDataUpdated.type);
        expect(result.address).toBe(testDataUpdated.address);
    });

    test('PUT       /cryptocurrency-addresses/:id    Should fail because we want to update the cryptocurrency address with a invalid email', async () => {
        const res = await api('PUT', `/api/cryptocurrency-addresses/${createdId}`, {
            body: {
                email: 'abc'
            }
        });
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('DELETE    /cryptocurrency-addresses/:id    Should delete the cryptocurrency address', async () => {
        const res = await api('DELETE', `/api/cryptocurrency-addresses/${createdId}`);
        res.expectStatusCode(200);
    });

    /**
     * 404 - NotFound Testing
     */
    test('GET       /cryptocurrency-addresses/:id    Should return with a 404, because we just deleted the cryptocurrency address', async () => {
        const res = await api('GET', `/api/cryptocurrency-addresses/${createdId}`);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('DELETE    /cryptocurrency-addresses/:id    Should return with a 404, because we just deleted the cryptocurrency address', async () => {
        const res = await api('DELETE', `/api/cryptocurrency-addresses/${createdId}`);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('PUT       /cryptocurrency-addresses/:id    Should return with a 404, because we just deleted the cryptocurrency address', async () => {
        const res = await api('PUT', `/api/cryptocurrency-addresses/${createdId}`, {
            body: testDataUpdated
        });
        res.expectJson();
        res.expectStatusCode(404);
    });

});
