import { api } from './lib/api';
import { DatabaseResetCommand } from '../../src/console/DatabaseResetCommand';
import { Country } from '../../src/api/enums/Country';

describe('/profiles', () => {

    const keys = [
        'id', 'updatedAt', 'createdAt'
    ];

    // const keysWithoutRelated = [
    //    'id', 'updatedAt', 'createdAt',
    // ];
    let createdId;

    const testData = {
        name: 'DEFAULT',
        addresses: [{
            title: 'Title',
            addressLine1: 'Add',
            addressLine2: 'ADD 22',
            city: 'city',
            country: Country.SWEDEN
        }, {
            title: 'Tite',
            addressLine1: 'Ad',
            addressLine2: 'ADD 222',
            city: 'city',
            country: Country.FINLAND
        }]
    };

    const testDataUpdated = {
        name: 'DEFAULT2',
        addresses: [{
            title: 'Title New',
            addressLine1: 'Add New',
            addressLine2: 'ADD 22 New',
            city: 'city New',
            country: Country.UNITED_KINGDOM
        }, {
            title: 'Title 2',
            addressLine1: 'Add 2',
            addressLine2: 'ADD 22 22',
            city: 'city 22',
            country: Country.USA
        }, {
            title: 'Title 3',
            addressLine1: 'Add 3',
            addressLine2: 'ADD 3',
            city: 'city 3',
            country: Country.SOUTH_AFRICA
        }]
    };

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
        expect(result.name).toBe(testData.name);
        expect(result.Addresses).toHaveLength(2);
    });

    test('POST      /profiles        Should fail because we want to create a empty profile', async () => {
        const res = await api('POST', '/api/profiles', {
            body: {}
        });
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('GET       /profiles        Should list profiles with our new create one', async () => {
        const res = await api('GET', '/api/profiles');
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys);
        const data = res.getData<any[]>();
        expect(data.length).toBe(1);

        const result = data[0];
        expect(result.name).toBe(testData.name);
        expect(result.Addresses).toBe(undefined); // doesnt fetch related
    });

    test('GET       /profiles/:id    Should return one profile', async () => {
        const res = await api('GET', `/api/profiles/${createdId}`);
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys);

        const result: any = res.getData();
        expect(result.name).toBe(testData.name);
        expect(result.Addresses).toHaveLength(2);
    });

    test('PUT       /profiles/:id    Should update the profile', async () => {
        const res = await api('PUT', `/api/profiles/${createdId}`, {
            body: testDataUpdated
        });
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys);

        const result: any = res.getData();
        expect(result.name).toBe(testDataUpdated.name);
        expect(result.Addresses).toHaveLength(3);

    });

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
