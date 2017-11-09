import { api } from './lib/api';
import { DatabaseResetCommand } from '../../src/console/DatabaseResetCommand';

describe('/profiles', () => {

    const keys = [
        'id', 'updatedAt', 'createdAt'
    ];

    // const keysWithoutRelated = [
    //    'id', 'updatedAt', 'createdAt',
    // ];

    const testData = {
        params: {
            userAddress: [{
                title: 'Title',
                address_line1: 'Add',
                address_line2: 'ADD 22',
                city: 'city',
                country: 'Country'
            }, {
                title: 'Title',
                address_line1: 'Add',
                address_line2: 'ADD 22',
                city: 'city',
                country: 'Country'
            }]
        }
    };

    const testDataUpdated = {
    };

    let createdId;
    beforeAll(async () => {
        const command = new DatabaseResetCommand();
        await command.run();
    });

    test('POST      /profiles        Should create a new profile', async () => {
        const res = await api('POST', '/api/profiles', {
            body: testData
        });
        res.expectJson();
        res.expectStatusCode(201);
        res.expectData(keys);
        createdId = res.getData()['id'];

        const result: any = res.getData();
    });

    test('POST      /profiles        Should fail because we want to create a empty profile', async () => {
        const res = await api('POST', '/api/profiles', {
            body: { params: {} }
        });
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('GET       /profiles        Should list profiles with our new create one', async () => {
        const res = await api('GET', '/api/profiles');
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys); // keysWithoutRelated
        const data = res.getData<any[]>();
        expect(data.length).not.toBe(0);

        const result = data[0];
    });

    test('GET       /profiles/:id    Should return one profile', async () => {
        const res = await api('GET', `/api/profiles/${createdId}`);
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys);

        const result: any = res.getData();
    });

    // test('PUT       /profiles/:id    Should update the profile', async () => {
    //     const res = await api('PUT', `/api/profiles/${createdId}`, {
    //         body: testDataUpdated
    //     });
    //     res.expectJson();
    //     res.expectStatusCode(200);
    //     res.expectData(keys);

    //     const result: any = res.getData();
    // });

    // test('PUT       /profiles/:id    Should fail because we want to update the profile with a invalid email', async () => {
    //     const res = await api('PUT', `/api/profiles/${createdId}`, {
    //         body: {
    //             email: 'abc'
    //         }
    //     });
    //     res.expectJson();
    //     res.expectStatusCode(400);
    // });

    test('DELETE    /profiles/:id    Should delete the profile', async () => {
        const res = await api('DELETE', `/api/profiles/${createdId}`);
        res.expectStatusCode(200);
    });

    /**
     * 404 - NotFound Testing
     */
    test('GET       /profiles/:id    Should return with a 404, because we just deleted the profile', async () => {
        const res = await api('GET', `/api/profiles/${createdId}`);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('DELETE    /profiles/:id    Should return with a 404, because we just deleted the profile', async () => {
        const res = await api('DELETE', `/api/profiles/${createdId}`);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('PUT       /profiles/:id    Should return with a 404, because we just deleted the profile', async () => {
        const res = await api('PUT', `/api/profiles/${createdId}`, {
            body: testDataUpdated
        });
        res.expectJson();
        res.expectStatusCode(404);
    });

});
