import { api } from './lib/api';
import { DatabaseResetCommand } from '../../src/console/DatabaseResetCommand';

describe('/escrow-ratios', () => {

    const keys = [
        'id', 'updatedAt', 'createdAt', 'buyer', 'seller' // , 'Related'
    ];

    // const keysWithoutRelated = [
    //    'id', 'updatedAt', 'createdAt', 'buyer', 'seller'
    // ];

    const testData = {
        buyer: undefined, // TODO: Add test value
        seller: undefined // TODO: Add test value
    };

    const testDataUpdated = {
        buyer: undefined, // TODO: Add test value
        seller: undefined // TODO: Add test value
    };

    let createdId;
    beforeAll(async () => {
        const command = new DatabaseResetCommand();
        await command.run();
    });

    test('POST      /escrow-ratios        Should create a new escrow ratio', async () => {
        const res = await api('POST', '/api/escrow-ratios', {
            body: testData
        });
        res.expectJson();
        res.expectStatusCode(201);
        res.expectData(keys);
        createdId = res.getData()['id'];

        const result: any = res.getData();
        expect(result.buyer).toBe(testData.buyer);
        expect(result.seller).toBe(testData.seller);
    });

    test('POST      /escrow-ratios        Should fail because we want to create a empty escrow ratio', async () => {
        const res = await api('POST', '/api/escrow-ratios', {
            body: {}
        });
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('GET       /escrow-ratios        Should list escrow ratios with our new create one', async () => {
        const res = await api('GET', '/api/escrow-ratios');
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys); // keysWithoutRelated
        const data = res.getData<any[]>();
        expect(data.length).toBe(1);

        const result = data[0];
        expect(result.buyer).toBe(testData.buyer);
        expect(result.seller).toBe(testData.seller);
    });

    test('GET       /escrow-ratios/:id    Should return one escrow ratio', async () => {
        const res = await api('GET', `/api/escrow-ratios/${createdId}`);
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys);

        const result: any = res.getData();
        expect(result.buyer).toBe(testData.buyer);
        expect(result.seller).toBe(testData.seller);
    });

    test('PUT       /escrow-ratios/:id    Should update the escrow ratio', async () => {
        const res = await api('PUT', `/api/escrow-ratios/${createdId}`, {
            body: testDataUpdated
        });
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys);

        const result: any = res.getData();
        expect(result.buyer).toBe(testDataUpdated.buyer);
        expect(result.seller).toBe(testDataUpdated.seller);
    });

    test('PUT       /escrow-ratios/:id    Should fail because we want to update the escrow ratio with a invalid email', async () => {
        const res = await api('PUT', `/api/escrow-ratios/${createdId}`, {
            body: {
                email: 'abc'
            }
        });
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('DELETE    /escrow-ratios/:id    Should delete the escrow ratio', async () => {
        const res = await api('DELETE', `/api/escrow-ratios/${createdId}`);
        res.expectStatusCode(200);
    });

    /**
     * 404 - NotFound Testing
     */
    test('GET       /escrow-ratios/:id    Should return with a 404, because we just deleted the escrow ratio', async () => {
        const res = await api('GET', `/api/escrow-ratios/${createdId}`);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('DELETE    /escrow-ratios/:id    Should return with a 404, because we just deleted the escrow ratio', async () => {
        const res = await api('DELETE', `/api/escrow-ratios/${createdId}`);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('PUT       /escrow-ratios/:id    Should return with a 404, because we just deleted the escrow ratio', async () => {
        const res = await api('PUT', `/api/escrow-ratios/${createdId}`, {
            body: testDataUpdated
        });
        res.expectJson();
        res.expectStatusCode(404);
    });

});
