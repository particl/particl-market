import { api } from './lib/api';
import { DatabaseResetCommand } from '../../src/console/DatabaseResetCommand';

describe('/favorite-items', () => {

    const keys = [
        'id', 'updatedAt', 'createdAt'
    ];

    // const keysWithoutRelated = [
    //    'id', 'updatedAt', 'createdAt',
    // ];

    const testData = {
        profile_id: 1,
        listing_item_id: 1
    };

    const testDataUpdated = {
        profile_id: 1,
        listing_item_id: 1
    };

    let createdId;
    beforeAll(async () => {
        const command = new DatabaseResetCommand();
        await command.run();
    });

    test('POST      /favorite-items        Should create a new favorite item', async () => {
        const res = await api('POST', '/api/favorite-items', {
            body: testData
        });
        res.expectJson();
        res.expectStatusCode(201);
        res.expectData(keys);
        createdId = res.getData()['id'];

        const result: any = res.getData();
    });

    test('POST      /favorite-items        Should fail because we want to create a empty favorite item', async () => {
        const res = await api('POST', '/api/favorite-items', {
            body: {}
        });
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('GET       /favorite-items        Should list favorite items with our new create one', async () => {
        const res = await api('GET', '/api/favorite-items');
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys); // keysWithoutRelated
        const data = res.getData<any[]>();
        expect(data.length).toBe(1);

        const result = data[0];
    });

    test('GET       /favorite-items/:id    Should return one favorite item', async () => {
        const res = await api('GET', `/api/favorite-items/${createdId}`);
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys);

        const result: any = res.getData();
    });

    test('PUT       /favorite-items/:id    Should update the favorite item', async () => {
        const res = await api('PUT', `/api/favorite-items/${createdId}`, {
            body: testDataUpdated
        });
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys);

        const result: any = res.getData();
    });

    test('PUT       /favorite-items/:id    Should fail because we want to update the favorite item with a invalid email', async () => {
        const res = await api('PUT', `/api/favorite-items/${createdId}`, {
            body: {
                email: 'abc'
            }
        });
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('DELETE    /favorite-items/:id    Should delete the favorite item', async () => {
        const res = await api('DELETE', `/api/favorite-items/${createdId}`);
        res.expectStatusCode(200);
    });

    /**
     * 404 - NotFound Testing
     */
    test('GET       /favorite-items/:id    Should return with a 404, because we just deleted the favorite item', async () => {
        const res = await api('GET', `/api/favorite-items/${createdId}`);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('DELETE    /favorite-items/:id    Should return with a 404, because we just deleted the favorite item', async () => {
        const res = await api('DELETE', `/api/favorite-items/${createdId}`);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('PUT       /favorite-items/:id    Should return with a 404, because we just deleted the favorite item', async () => {
        const res = await api('PUT', `/api/favorite-items/${createdId}`, {
            body: testDataUpdated
        });
        res.expectJson();
        res.expectStatusCode(404);
    });

});
