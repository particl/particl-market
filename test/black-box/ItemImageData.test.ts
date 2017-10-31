import { api } from './lib/api';
import { DatabaseResetCommand } from '../../src/console/DatabaseResetCommand';

describe('/item-image-data', () => {

    const keys = [
        'id', 'updatedAt', 'createdAt', 'dataId', 'protocol', 'encoding', 'data' // , 'Related'
    ];

    // const keysWithoutRelated = [
    //    'id', 'updatedAt', 'createdAt', 'dataId', 'protocol', 'encoding', 'data'
    // ];

    const testData = {
        dataId: undefined, // TODO: Add test value
        protocol: undefined, // TODO: Add test value
        encoding: undefined, // TODO: Add test value
        data: undefined // TODO: Add test value
    };

    const testDataUpdated = {
        dataId: undefined, // TODO: Add test value
        protocol: undefined, // TODO: Add test value
        encoding: undefined, // TODO: Add test value
        data: undefined // TODO: Add test value
    };

    let createdId;
    beforeAll(async () => {
        const command = new DatabaseResetCommand();
        await command.run();
    });

    test('POST      /item-image-data        Should create a new item image data', async () => {
        const res = await api('POST', '/api/item-image-data', {
            body: testData
        });
        res.expectJson();
        res.expectStatusCode(201);
        res.expectData(keys);
        createdId = res.getData()['id'];

        const result: any = res.getData();
        expect(result.dataId).toBe(testData.dataId);
        expect(result.protocol).toBe(testData.protocol);
        expect(result.encoding).toBe(testData.encoding);
        expect(result.data).toBe(testData.data);
    });

    test('POST      /item-image-data        Should fail because we want to create a empty item image data', async () => {
        const res = await api('POST', '/api/item-image-data', {
            body: {}
        });
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('GET       /item-image-data        Should list item image datas with our new create one', async () => {
        const res = await api('GET', '/api/item-image-data');
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys); // keysWithoutRelated
        const data = res.getData<any[]>();
        expect(data.length).toBe(1);

        const result = data[0];
        expect(result.dataId).toBe(testData.dataId);
        expect(result.protocol).toBe(testData.protocol);
        expect(result.encoding).toBe(testData.encoding);
        expect(result.data).toBe(testData.data);
    });

    test('GET       /item-image-data/:id    Should return one item image data', async () => {
        const res = await api('GET', `/api/item-image-data/${createdId}`);
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys);

        const result: any = res.getData();
        expect(result.dataId).toBe(testData.dataId);
        expect(result.protocol).toBe(testData.protocol);
        expect(result.encoding).toBe(testData.encoding);
        expect(result.data).toBe(testData.data);
    });

    test('PUT       /item-image-data/:id    Should update the item image data', async () => {
        const res = await api('PUT', `/api/item-image-data/${createdId}`, {
            body: testDataUpdated
        });
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys);

        const result: any = res.getData();
        expect(result.dataId).toBe(testDataUpdated.dataId);
        expect(result.protocol).toBe(testDataUpdated.protocol);
        expect(result.encoding).toBe(testDataUpdated.encoding);
        expect(result.data).toBe(testDataUpdated.data);
    });

    test('PUT       /item-image-data/:id    Should fail because we want to update the item image data with a invalid email', async () => {
        const res = await api('PUT', `/api/item-image-data/${createdId}`, {
            body: {
                email: 'abc'
            }
        });
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('DELETE    /item-image-data/:id    Should delete the item image data', async () => {
        const res = await api('DELETE', `/api/item-image-data/${createdId}`);
        res.expectStatusCode(200);
    });

    /**
     * 404 - NotFound Testing
     */
    test('GET       /item-image-data/:id    Should return with a 404, because we just deleted the item image data', async () => {
        const res = await api('GET', `/api/item-image-data/${createdId}`);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('DELETE    /item-image-data/:id    Should return with a 404, because we just deleted the item image data', async () => {
        const res = await api('DELETE', `/api/item-image-data/${createdId}`);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('PUT       /item-image-data/:id    Should return with a 404, because we just deleted the item image data', async () => {
        const res = await api('PUT', `/api/item-image-data/${createdId}`, {
            body: testDataUpdated
        });
        res.expectJson();
        res.expectStatusCode(404);
    });

});
