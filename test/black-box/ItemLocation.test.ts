import { api } from './lib/api';
import { DatabaseResetCommand } from '../../src/console/DatabaseResetCommand';

describe('/item-locations', () => {

    const keys = [
        'id', 'updatedAt', 'createdAt', 'region', 'address' // , 'Related'
    ];

    // const keysWithoutRelated = [
    //    'id', 'updatedAt', 'createdAt', 'region', 'address'
    // ];

    const testData = {
        region: undefined, // TODO: Add test value
        address: undefined // TODO: Add test value
    };

    const testDataUpdated = {
        region: undefined, // TODO: Add test value
        address: undefined // TODO: Add test value
    };

    let createdId;
    beforeAll(async () => {
        const command = new DatabaseResetCommand();
        await command.run();
    });

    test('POST      /item-locations        Should create a new item location', async () => {
        const res = await api('POST', '/api/item-locations', {
            body: testData
        });
        res.expectJson();
        res.expectStatusCode(201);
        res.expectData(keys);
        createdId = res.getData()['id'];

        const result: any = res.getData();
        expect(result.region).toBe(testData.region);
        expect(result.address).toBe(testData.address);
    });

    test('POST      /item-locations        Should fail because we want to create a empty item location', async () => {
        const res = await api('POST', '/api/item-locations', {
            body: {}
        });
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('GET       /item-locations        Should list item locations with our new create one', async () => {
        const res = await api('GET', '/api/item-locations');
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys); // keysWithoutRelated
        const data = res.getData<any[]>();
        expect(data.length).toBe(1);

        const result = data[0];
        expect(result.region).toBe(testData.region);
        expect(result.address).toBe(testData.address);
    });

    test('GET       /item-locations/:id    Should return one item location', async () => {
        const res = await api('GET', `/api/item-locations/${createdId}`);
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys);

        const result: any = res.getData();
        expect(result.region).toBe(testData.region);
        expect(result.address).toBe(testData.address);
    });

    test('PUT       /item-locations/:id    Should update the item location', async () => {
        const res = await api('PUT', `/api/item-locations/${createdId}`, {
            body: testDataUpdated
        });
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys);

        const result: any = res.getData();
        expect(result.region).toBe(testDataUpdated.region);
        expect(result.address).toBe(testDataUpdated.address);
    });

    test('PUT       /item-locations/:id    Should fail because we want to update the item location with a invalid email', async () => {
        const res = await api('PUT', `/api/item-locations/${createdId}`, {
            body: {
                email: 'abc'
            }
        });
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('DELETE    /item-locations/:id    Should delete the item location', async () => {
        const res = await api('DELETE', `/api/item-locations/${createdId}`);
        res.expectStatusCode(200);
    });

    /**
     * 404 - NotFound Testing
     */
    test('GET       /item-locations/:id    Should return with a 404, because we just deleted the item location', async () => {
        const res = await api('GET', `/api/item-locations/${createdId}`);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('DELETE    /item-locations/:id    Should return with a 404, because we just deleted the item location', async () => {
        const res = await api('DELETE', `/api/item-locations/${createdId}`);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('PUT       /item-locations/:id    Should return with a 404, because we just deleted the item location', async () => {
        const res = await api('PUT', `/api/item-locations/${createdId}`, {
            body: testDataUpdated
        });
        res.expectJson();
        res.expectStatusCode(404);
    });

});
