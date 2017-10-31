import { api } from './lib/api';
import { DatabaseResetCommand } from '../../src/console/DatabaseResetCommand';

describe('/item-informations', () => {

    const keys = [
        'id', 'updatedAt', 'createdAt', 'title', 'shortDescription', 'longDescription' // , 'Related'
    ];

    // const keysWithoutRelated = [
    //    'id', 'updatedAt', 'createdAt', 'title', 'shortDescription', 'longDescription'
    // ];

    const testData = {
        title: undefined, // TODO: Add test value
        shortDescription: undefined, // TODO: Add test value
        longDescription: undefined // TODO: Add test value
    };

    const testDataUpdated = {
        title: undefined, // TODO: Add test value
        shortDescription: undefined, // TODO: Add test value
        longDescription: undefined // TODO: Add test value
    };

    let createdId;
    beforeAll(async () => {
        const command = new DatabaseResetCommand();
        await command.run();
    });

    test('POST      /item-informations        Should create a new item information', async () => {
        const res = await api('POST', '/api/item-informations', {
            body: testData
        });
        res.expectJson();
        res.expectStatusCode(201);
        res.expectData(keys);
        createdId = res.getData()['id'];

        const result: any = res.getData();
        expect(result.title).toBe(testData.title);
        expect(result.shortDescription).toBe(testData.shortDescription);
        expect(result.longDescription).toBe(testData.longDescription);
    });

    test('POST      /item-informations        Should fail because we want to create a empty item information', async () => {
        const res = await api('POST', '/api/item-informations', {
            body: {}
        });
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('GET       /item-informations        Should list item informations with our new create one', async () => {
        const res = await api('GET', '/api/item-informations');
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys); // keysWithoutRelated
        const data = res.getData<any[]>();
        expect(data.length).toBe(1);

        const result = data[0];
        expect(result.title).toBe(testData.title);
        expect(result.shortDescription).toBe(testData.shortDescription);
        expect(result.longDescription).toBe(testData.longDescription);
    });

    test('GET       /item-informations/:id    Should return one item information', async () => {
        const res = await api('GET', `/api/item-informations/${createdId}`);
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys);

        const result: any = res.getData();
        expect(result.title).toBe(testData.title);
        expect(result.shortDescription).toBe(testData.shortDescription);
        expect(result.longDescription).toBe(testData.longDescription);
    });

    test('PUT       /item-informations/:id    Should update the item information', async () => {
        const res = await api('PUT', `/api/item-informations/${createdId}`, {
            body: testDataUpdated
        });
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys);

        const result: any = res.getData();
        expect(result.title).toBe(testDataUpdated.title);
        expect(result.shortDescription).toBe(testDataUpdated.shortDescription);
        expect(result.longDescription).toBe(testDataUpdated.longDescription);
    });

    test('PUT       /item-informations/:id    Should fail because we want to update the item information with a invalid email', async () => {
        const res = await api('PUT', `/api/item-informations/${createdId}`, {
            body: {
                email: 'abc'
            }
        });
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('DELETE    /item-informations/:id    Should delete the item information', async () => {
        const res = await api('DELETE', `/api/item-informations/${createdId}`);
        res.expectStatusCode(200);
    });

    /**
     * 404 - NotFound Testing
     */
    test('GET       /item-informations/:id    Should return with a 404, because we just deleted the item information', async () => {
        const res = await api('GET', `/api/item-informations/${createdId}`);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('DELETE    /item-informations/:id    Should return with a 404, because we just deleted the item information', async () => {
        const res = await api('DELETE', `/api/item-informations/${createdId}`);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('PUT       /item-informations/:id    Should return with a 404, because we just deleted the item information', async () => {
        const res = await api('PUT', `/api/item-informations/${createdId}`, {
            body: testDataUpdated
        });
        res.expectJson();
        res.expectStatusCode(404);
    });

});
