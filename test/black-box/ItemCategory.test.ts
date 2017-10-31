import { api } from './lib/api';
import { DatabaseResetCommand } from '../../src/console/DatabaseResetCommand';

describe('/item-categories', () => {

    const keys = [
        'id', 'updatedAt', 'createdAt', 'name', 'description',
        'parentItemCategoryId', 'ItemCategory'
    ];

    const keysWithoutRelated = [
        'id', 'updatedAt', 'createdAt', 'name', 'description',
        'parentItemCategoryId'
    ];

    const testData = {
        name: 'Electronics and Technology',
        description: 'Electronics and Technology description'
    };

    const testDataUpdated = {
        name: 'Computer Systems and Parts',
        description: 'Computer Systems and Parts description'
    };

    let createdId;
    beforeAll(async () => {
        const command = new DatabaseResetCommand();
        await command.run();
    });

    test('POST      /item-categories        Should create a new item category', async () => {
        const res = await api('POST', '/api/item-categories', {
            body: testData
        });
        res.expectJson();
        res.expectStatusCode(201);
        res.expectData(keys);
        createdId = res.getData()['id'];

        const result: any = res.getData();
        expect(result.name).toBe(testData.name);
        expect(result.description).toBe(testData.description);
    });

    test('POST      /item-categories        Should fail because we want to create a empty item category', async () => {
        const res = await api('POST', '/api/item-categories', {
            body: {}
        });
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('GET       /item-categories        Should list item categorys with our new create one', async () => {
        const res = await api('GET', '/api/item-categories');
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keysWithoutRelated);
        const data = res.getData<any[]>();
        expect(data.length).toBe(1);

        const result = data[0];
        expect(result.name).toBe(testData.name);
        expect(result.description).toBe(testData.description);
    });

    test('GET       /item-categories/:id    Should return one item category', async () => {
        const res = await api('GET', `/api/item-categories/${createdId}`);
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys);

        const result: any = res.getData();
        expect(result.name).toBe(testData.name);
        expect(result.description).toBe(testData.description);
    });

    test('PUT       /item-categories/:id    Should update the item category', async () => {
        const res = await api('PUT', `/api/item-categories/${createdId}`, {
            body: testDataUpdated
        });
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys);

        const result: any = res.getData();
        expect(result.name).toBe(testDataUpdated.name);
        expect(result.description).toBe(testDataUpdated.description);
    });

    test('PUT       /item-categories/:id    Should fail because we want to update the item category with a invalid email', async () => {
        const res = await api('PUT', `/api/item-categories/${createdId}`, {
            body: {
                email: 'abc'
            }
        });
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('DELETE    /item-categories/:id    Should delete the item category', async () => {
        const res = await api('DELETE', `/api/item-categories/${createdId}`);
        res.expectStatusCode(200);
    });

    /**
     * 404 - NotFound Testing
     */
    test('GET       /item-categories/:id    Should return with a 404, because we just deleted the item category', async () => {
        const res = await api('GET', `/api/item-categories/${createdId}`);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('DELETE    /item-categories/:id    Should return with a 404, because we just deleted the item category', async () => {
        const res = await api('DELETE', `/api/item-categories/${createdId}`);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('PUT       /item-categories/:id    Should return with a 404, because we just deleted the item category', async () => {
        const res = await api('PUT', `/api/item-categories/${createdId}`, {
            body: testDataUpdated
        });
        res.expectJson();
        res.expectStatusCode(404);
    });

});
