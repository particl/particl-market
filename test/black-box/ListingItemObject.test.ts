import { api } from './lib/api';
import { DatabaseResetCommand } from '../../src/console/DatabaseResetCommand';
import { ListingItemObjectType } from '../../src/api/enums/ListingItemObjectType';

describe('/listing-item-objects', () => {

    const keys = [
        'id', 'updatedAt', 'createdAt', 'type', 'description', 'order' // , 'Related'
    ];

    // const keysWithoutRelated = [
    //    'id', 'updatedAt', 'createdAt', 'type', 'description', 'order'
    // ];

    const testData = {
        type: ListingItemObjectType.DROPDOWN,
        description: 'where to store the dropdown data...',
        order: 0
    };

    const testDataUpdated = {
        type: ListingItemObjectType.TABLE,
        description: 'table desc',
        order: 1
    };

    let createdId;
    beforeAll(async () => {
        const command = new DatabaseResetCommand();
        await command.run();
    });

    test('POST      /listing-item-objects        Should create a new listing item object', async () => {
        const res = await api('POST', '/api/listing-item-objects', {
            body: testData
        });
        res.expectJson();
        res.expectStatusCode(201);
        res.expectData(keys);
        createdId = res.getData()['id'];

        const result: any = res.getData();
        expect(result.type).toBe(testData.type);
        expect(result.description).toBe(testData.description);
        expect(result.order).toBe(testData.order);
    });

    test('POST      /listing-item-objects        Should fail because we want to create a empty listing item object', async () => {
        const res = await api('POST', '/api/listing-item-objects', {
            body: {}
        });
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('GET       /listing-item-objects        Should list listing item objects with our new create one', async () => {
        const res = await api('GET', '/api/listing-item-objects');
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys); // keysWithoutRelated
        const data = res.getData<any[]>();
        expect(data.length).toBe(1);

        const result = data[0];
        expect(result.type).toBe(testData.type);
        expect(result.description).toBe(testData.description);
        expect(result.order).toBe(testData.order);
    });

    test('GET       /listing-item-objects/:id    Should return one listing item object', async () => {
        const res = await api('GET', `/api/listing-item-objects/${createdId}`);
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys);

        const result: any = res.getData();
        expect(result.type).toBe(testData.type);
        expect(result.description).toBe(testData.description);
        expect(result.order).toBe(testData.order);
    });

    test('PUT       /listing-item-objects/:id    Should update the listing item object', async () => {
        const res = await api('PUT', `/api/listing-item-objects/${createdId}`, {
            body: testDataUpdated
        });
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys);

        const result: any = res.getData();
        expect(result.type).toBe(testDataUpdated.type);
        expect(result.description).toBe(testDataUpdated.description);
        expect(result.order).toBe(testDataUpdated.order);
    });

    test('PUT       /listing-item-objects/:id    Should fail because we want to update the listing item object with a invalid email', async () => {
        const res = await api('PUT', `/api/listing-item-objects/${createdId}`, {
            body: {
                email: 'abc'
            }
        });
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('DELETE    /listing-item-objects/:id    Should delete the listing item object', async () => {
        const res = await api('DELETE', `/api/listing-item-objects/${createdId}`);
        res.expectStatusCode(200);
    });

    /**
     * 404 - NotFound Testing
     */
    test('GET       /listing-item-objects/:id    Should return with a 404, because we just deleted the listing item object', async () => {
        const res = await api('GET', `/api/listing-item-objects/${createdId}`);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('DELETE    /listing-item-objects/:id    Should return with a 404, because we just deleted the listing item object', async () => {
        const res = await api('DELETE', `/api/listing-item-objects/${createdId}`);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('PUT       /listing-item-objects/:id    Should return with a 404, because we just deleted the listing item object', async () => {
        const res = await api('PUT', `/api/listing-item-objects/${createdId}`, {
            body: testDataUpdated
        });
        res.expectJson();
        res.expectStatusCode(404);
    });

});
