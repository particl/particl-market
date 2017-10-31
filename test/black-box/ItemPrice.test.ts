import { api } from './lib/api';
import { DatabaseResetCommand } from '../../src/console/DatabaseResetCommand';

describe('/item-prices', () => {

    const keys = [
        'id', 'updatedAt', 'createdAt', 'currency', 'basePrice' // , 'Related'
    ];

    // const keysWithoutRelated = [
    //    'id', 'updatedAt', 'createdAt', 'currency', 'basePrice'
    // ];

    const testData = {
        currency: undefined, // TODO: Add test value
        basePrice: undefined // TODO: Add test value
    };

    const testDataUpdated = {
        currency: undefined, // TODO: Add test value
        basePrice: undefined // TODO: Add test value
    };

    let createdId;
    beforeAll(async () => {
        const command = new DatabaseResetCommand();
        await command.run();
    });

    test('POST      /item-prices        Should create a new item price', async () => {
        const res = await api('POST', '/api/item-prices', {
            body: testData
        });
        res.expectJson();
        res.expectStatusCode(201);
        res.expectData(keys);
        createdId = res.getData()['id'];

        const result: any = res.getData();
        expect(result.currency).toBe(testData.currency);
        expect(result.basePrice).toBe(testData.basePrice);
    });

    test('POST      /item-prices        Should fail because we want to create a empty item price', async () => {
        const res = await api('POST', '/api/item-prices', {
            body: {}
        });
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('GET       /item-prices        Should list item prices with our new create one', async () => {
        const res = await api('GET', '/api/item-prices');
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys); // keysWithoutRelated
        const data = res.getData<any[]>();
        expect(data.length).toBe(1);

        const result = data[0];
        expect(result.currency).toBe(testData.currency);
        expect(result.basePrice).toBe(testData.basePrice);
    });

    test('GET       /item-prices/:id    Should return one item price', async () => {
        const res = await api('GET', `/api/item-prices/${createdId}`);
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys);

        const result: any = res.getData();
        expect(result.currency).toBe(testData.currency);
        expect(result.basePrice).toBe(testData.basePrice);
    });

    test('PUT       /item-prices/:id    Should update the item price', async () => {
        const res = await api('PUT', `/api/item-prices/${createdId}`, {
            body: testDataUpdated
        });
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys);

        const result: any = res.getData();
        expect(result.currency).toBe(testDataUpdated.currency);
        expect(result.basePrice).toBe(testDataUpdated.basePrice);
    });

    test('PUT       /item-prices/:id    Should fail because we want to update the item price with a invalid email', async () => {
        const res = await api('PUT', `/api/item-prices/${createdId}`, {
            body: {
                email: 'abc'
            }
        });
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('DELETE    /item-prices/:id    Should delete the item price', async () => {
        const res = await api('DELETE', `/api/item-prices/${createdId}`);
        res.expectStatusCode(200);
    });

    /**
     * 404 - NotFound Testing
     */
    test('GET       /item-prices/:id    Should return with a 404, because we just deleted the item price', async () => {
        const res = await api('GET', `/api/item-prices/${createdId}`);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('DELETE    /item-prices/:id    Should return with a 404, because we just deleted the item price', async () => {
        const res = await api('DELETE', `/api/item-prices/${createdId}`);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('PUT       /item-prices/:id    Should return with a 404, because we just deleted the item price', async () => {
        const res = await api('PUT', `/api/item-prices/${createdId}`, {
            body: testDataUpdated
        });
        res.expectJson();
        res.expectStatusCode(404);
    });

});
