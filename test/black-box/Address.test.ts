import { api } from './lib/api';
import { DatabaseResetCommand } from '../../src/console/DatabaseResetCommand';

describe('/addresses', () => {

    const keys = [
        'id', 'updatedAt', 'createdAt'  // , 'Related'
    ];

    // const keysWithoutRelated = [
    //    'id', 'updatedAt', 'createdAt',
    // ];
    let createdId;
    let createdProfileId;

    const testData = {
        title: 'Title',
        address_line1: 'Add',
        address_line2: 'ADD 22',
        city: 'city',
        country: 'Country',
        profile_id: `${createdProfileId}`
    };

    const testDataProfile = {
        params: {
            userAddress: []
        }
    };

    const testDataUpdated = {
        title: 'Work',
        address_line1: '123 6th St',
        address_line2: 'Melbourne, FL 32904',
        city: 'Melbourne',
        country: 'USA',
        profile_id: `${createdProfileId}`
    };


    beforeAll(async () => {
        const command = new DatabaseResetCommand();
        await command.run();
    });

    test('POST      /addresses        Should create a new address', async () => {
        const resProfile = await api('POST', '/api/profiles', {
            body: testDataProfile
        });
        createdProfileId = resProfile.getData()['id'];
        const res = await api('POST', '/api/addresses', {
            body: testData
        });
        res.expectJson();
        res.expectStatusCode(201);
        res.expectData(keys);

        createdId = res.getData()['id'];
        const result: any = res.getData();
    });

    test('POST      /addresses        Should fail because we want to create a empty address', async () => {
        const res = await api('POST', '/api/addresses', {
            body: {}
        });
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('GET       /addresses        Should list addresss with our new create one', async () => {
        const res = await api('GET', '/api/addresses');
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys); // keysWithoutRelated
        const data = res.getData<any[]>();
        expect(data.length).not.toBe(0);

        const result = data[0];
    });

    test('GET       /addresses/:id    Should return one address', async () => {
        const res = await api('GET', `/api/addresses/${createdId}`);
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys);

        const result: any = res.getData();
    });

    test('PUT       /addresses/:id    Should update the address', async () => {
        const res = await api('PUT', `/api/addresses/${createdId}`, {
            body: testDataUpdated
        });
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys);

        const result: any = res.getData();
    });

    test('DELETE    /addresses/:id    Should delete the address', async () => {
        const res = await api('DELETE', `/api/addresses/${createdId}`);
        const resProfile = await api('DELETE', `/api/profiles/${createdProfileId}`);
        res.expectStatusCode(200);
    });

    // /**
    //  * 404 - NotFound Testing
    //  */
    test('GET       /addresses/:id    Should return with a 404, because we just deleted the address', async () => {
        const res = await api('GET', `/api/addresses/${createdId}`);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('DELETE    /addresses/:id    Should return with a 404, because we just deleted the address', async () => {
        const res = await api('DELETE', `/api/addresses/${createdId}`);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('PUT       /addresses/:id    Should return with a 404, because we just deleted the address', async () => {
        const res = await api('PUT', `/api/addresses/${createdId}`, {
            body: testDataUpdated
        });
        res.expectJson();
        res.expectStatusCode(404);
    });

});
