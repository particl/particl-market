import { api } from './lib/api';
import { DatabaseResetCommand } from '../../src/console/DatabaseResetCommand';
import { EscrowType } from '../../src/api/enums/EscrowType';

describe('/escrows', () => {

    const keys = [
        'id', 'updatedAt', 'createdAt', 'type' // , 'Related'
    ];

    // const keysWithoutRelated = [
    //    'id', 'updatedAt', 'createdAt', 'type'
    // ];

    const testData = {
        type: EscrowType.MAD,
        ratio: {
            buyer: 50,
            seller: 50
        }
    };

    const testDataUpdated = {
        type: EscrowType.NOP,
        ratio: {
            buyer: 100,
            seller: 100
        }
    };

    let createdId;
    beforeAll(async () => {
        const command = new DatabaseResetCommand();
        await command.run();
    });

    test('POST      /escrows        Should create a new escrow', async () => {
        const res = await api('POST', '/api/escrows', {
            body: testData
        });
        res.expectJson();
        res.expectStatusCode(201);
        res.expectData(keys);
        createdId = res.getData()['id'];

        const result: any = res.getData();
        expect(result.type).toBe(testData.type);
        expect(result.Ratio.buyer).toBe(testData.ratio.buyer);
        expect(result.Ratio.seller).toBe(testData.ratio.seller);
    });

    test('POST      /escrows        Should fail because we want to create a empty escrow', async () => {
        const res = await api('POST', '/api/escrows', {
            body: {}
        });
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('GET       /escrows        Should list escrows with our new create one', async () => {
        const res = await api('GET', '/api/escrows');
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys); // keysWithoutRelated
        const data = res.getData<any[]>();
        expect(data.length).toBe(1);

        const result = data[0];
        expect(result.type).toBe(testData.type);
        expect(result.Ratio).toBe(undefined); // doesnt fetch related
    });

    test('GET       /escrows/:id    Should return one escrow', async () => {
        const res = await api('GET', `/api/escrows/${createdId}`);
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys);

        const result: any = res.getData();
        expect(result.type).toBe(testData.type);
        expect(result.Ratio.buyer).toBe(testData.ratio.buyer);
        expect(result.Ratio.seller).toBe(testData.ratio.seller);
    });

    test('PUT       /escrows/:id    Should update the escrow', async () => {
        const res = await api('PUT', `/api/escrows/${createdId}`, {
            body: testDataUpdated
        });
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys);

        const result: any = res.getData();
        expect(result.type).toBe(testDataUpdated.type);
        expect(result.Ratio.buyer).toBe(testDataUpdated.ratio.buyer);
        expect(result.Ratio.seller).toBe(testDataUpdated.ratio.seller);
    });

    test('PUT       /escrows/:id    Should fail because we want to update the escrow with a invalid email', async () => {
        const res = await api('PUT', `/api/escrows/${createdId}`, {
            body: {
                email: 'abc'
            }
        });
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('DELETE    /escrows/:id    Should delete the escrow', async () => {
        const res = await api('DELETE', `/api/escrows/${createdId}`);
        res.expectStatusCode(200);
    });

    /**
     * 404 - NotFound Testing
     */
    test('GET       /escrows/:id    Should return with a 404, because we just deleted the escrow', async () => {
        const res = await api('GET', `/api/escrows/${createdId}`);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('DELETE    /escrows/:id    Should return with a 404, because we just deleted the escrow', async () => {
        const res = await api('DELETE', `/api/escrows/${createdId}`);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('PUT       /escrows/:id    Should return with a 404, because we just deleted the escrow', async () => {
        const res = await api('PUT', `/api/escrows/${createdId}`, {
            body: testDataUpdated
        });
        res.expectJson();
        res.expectStatusCode(404);
    });

});
