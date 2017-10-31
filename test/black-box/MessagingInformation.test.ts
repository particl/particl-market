import { api } from './lib/api';
import { DatabaseResetCommand } from '../../src/console/DatabaseResetCommand';
import { MessagingProtocolType } from '../../src/api/enums/MessagingProtocolType';

describe('/messaging-informations', () => {

    const keys = [
        'id', 'updatedAt', 'createdAt', 'protocol', 'publicKey' // , 'Related'
    ];

    // const keysWithoutRelated = [
    //    'id', 'updatedAt', 'createdAt', 'protocol', 'publicKey'
    // ];

    const testData = {
        protocol: MessagingProtocolType.SMSG,
        publicKey: 'publickey1'
    };

    const testDataUpdated = {
        protocol: MessagingProtocolType.SMSG,
        publicKey: 'publickey2'
    };

    let createdId;
    beforeAll(async () => {
        const command = new DatabaseResetCommand();
        await command.run();
    });

    test('POST      /messaging-informations        Should create a new messaging information', async () => {
        const res = await api('POST', '/api/messaging-informations', {
            body: testData
        });
        res.expectJson();
        res.expectStatusCode(201);
        res.expectData(keys);
        createdId = res.getData()['id'];

        const result: any = res.getData();
        expect(result.protocol).toBe(testData.protocol);
        expect(result.publicKey).toBe(testData.publicKey);
    });

    test('POST      /messaging-informations        Should fail because we want to create a empty messaging information', async () => {
        const res = await api('POST', '/api/messaging-informations', {
            body: {}
        });
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('GET       /messaging-informations        Should list messaging informations with our new create one', async () => {
        const res = await api('GET', '/api/messaging-informations');
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys); // keysWithoutRelated
        const data = res.getData<any[]>();
        expect(data.length).toBe(1);

        const result = data[0];
        expect(result.protocol).toBe(testData.protocol);
        expect(result.publicKey).toBe(testData.publicKey);
    });

    test('GET       /messaging-informations/:id    Should return one messaging information', async () => {
        const res = await api('GET', `/api/messaging-informations/${createdId}`);
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys);

        const result: any = res.getData();
        expect(result.protocol).toBe(testData.protocol);
        expect(result.publicKey).toBe(testData.publicKey);
    });

    test('PUT       /messaging-informations/:id    Should update the messaging information', async () => {
        const res = await api('PUT', `/api/messaging-informations/${createdId}`, {
            body: testDataUpdated
        });
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys);

        const result: any = res.getData();
        expect(result.protocol).toBe(testDataUpdated.protocol);
        expect(result.publicKey).toBe(testDataUpdated.publicKey);
    });

    test('PUT       /messaging-informations/:id    Should fail because we want to update the messaging information with a invalid email', async () => {
        const res = await api('PUT', `/api/messaging-informations/${createdId}`, {
            body: {
                email: 'abc'
            }
        });
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('DELETE    /messaging-informations/:id    Should delete the messaging information', async () => {
        const res = await api('DELETE', `/api/messaging-informations/${createdId}`);
        res.expectStatusCode(200);
    });

    /**
     * 404 - NotFound Testing
     */
    test('GET       /messaging-informations/:id    Should return with a 404, because we just deleted the messaging information', async () => {
        const res = await api('GET', `/api/messaging-informations/${createdId}`);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('DELETE    /messaging-informations/:id    Should return with a 404, because we just deleted the messaging information', async () => {
        const res = await api('DELETE', `/api/messaging-informations/${createdId}`);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('PUT       /messaging-informations/:id    Should return with a 404, because we just deleted the messaging information', async () => {
        const res = await api('PUT', `/api/messaging-informations/${createdId}`, {
            body: testDataUpdated
        });
        res.expectJson();
        res.expectStatusCode(404);
    });

});
