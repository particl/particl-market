import { api } from './lib/api';
import { DatabaseResetCommand } from '../../src/console/DatabaseResetCommand';

describe('/shipping-prices', () => {

    const keys = [
        'id', 'updatedAt', 'createdAt', 'domestic', 'international' // , 'Related'
    ];

    // const keysWithoutRelated = [
    //    'id', 'updatedAt', 'createdAt', 'domestic', 'international'
    // ];

    const testData = {
        domestic: 2.12,
        international: 4.2
    };

    const testDataUpdated = {
        domestic: 1.2,
        international: 3.4
    };

    let createdId;
    beforeAll(async () => {
        const command = new DatabaseResetCommand();
        await command.run();
    });

    test('POST      /shipping-prices        Should create a new shipping price', async () => {
        const res = await api('POST', '/api/shipping-prices', {
            body: testData
        });
        res.expectJson();
        res.expectStatusCode(201);
        res.expectData(keys);
        createdId = res.getData()['id'];

        const result: any = res.getData();
        expect(result.domestic).toBe(testData.domestic);
        expect(result.international).toBe(testData.international);
    });

    test('POST      /shipping-prices        Should fail because we want to create a empty shipping price', async () => {
        const res = await api('POST', '/api/shipping-prices', {
            body: {}
        });
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('GET       /shipping-prices        Should list shipping prices with our new create one', async () => {
        const res = await api('GET', '/api/shipping-prices');
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys); // keysWithoutRelated
        const data = res.getData<any[]>();
        expect(data.length).toBe(1);

        const result = data[0];
        expect(result.domestic).toBe(testData.domestic);
        expect(result.international).toBe(testData.international);
    });

    test('GET       /shipping-prices/:id    Should return one shipping price', async () => {
        const res = await api('GET', `/api/shipping-prices/${createdId}`);
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys);

        const result: any = res.getData();
        expect(result.domestic).toBe(testData.domestic);
        expect(result.international).toBe(testData.international);
    });

    test('PUT       /shipping-prices/:id    Should update the shipping price', async () => {
        const res = await api('PUT', `/api/shipping-prices/${createdId}`, {
            body: testDataUpdated
        });
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys);

        const result: any = res.getData();
        expect(result.domestic).toBe(testDataUpdated.domestic);
        expect(result.international).toBe(testDataUpdated.international);
    });

    test('PUT       /shipping-prices/:id    Should fail because we want to update the shipping price with a invalid email', async () => {
        const res = await api('PUT', `/api/shipping-prices/${createdId}`, {
            body: {
                email: 'abc'
            }
        });
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('DELETE    /shipping-prices/:id    Should delete the shipping price', async () => {
        const res = await api('DELETE', `/api/shipping-prices/${createdId}`);
        res.expectStatusCode(200);
    });

    /**
     * 404 - NotFound Testing
     */
    test('GET       /shipping-prices/:id    Should return with a 404, because we just deleted the shipping price', async () => {
        const res = await api('GET', `/api/shipping-prices/${createdId}`);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('DELETE    /shipping-prices/:id    Should return with a 404, because we just deleted the shipping price', async () => {
        const res = await api('DELETE', `/api/shipping-prices/${createdId}`);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('PUT       /shipping-prices/:id    Should return with a 404, because we just deleted the shipping price', async () => {
        const res = await api('PUT', `/api/shipping-prices/${createdId}`, {
            body: testDataUpdated
        });
        res.expectJson();
        res.expectStatusCode(404);
    });

});
