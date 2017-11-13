import { api } from './lib/api';
import { DatabaseResetCommand } from '../../src/console/DatabaseResetCommand';
import { Country } from '../../src/api/enums/Country';

describe('/addresses', () => {

    const keys = [
        'id', 'updatedAt', 'createdAt', 'title', 'addressLine1', 'addressLine2', 'city', 'country'
    ];

    // const keysWithoutRelated = [
    //    'id', 'updatedAt', 'createdAt',
    // ];
    let createdId;

    const testData = {
        title: 'Title',
        addressLine1: 'Add',
        addressLine2: 'ADD 22',
        city: 'city',
        country: Country.FINLAND,
        profileId: 0
    };

    const testDataUpdated = {
        title: 'Work',
        addressLine1: '123 6th St',
        addressLine2: 'Melbourne, FL 32904',
        city: 'Melbourne',
        country: Country.SWEDEN,
        profileId: 0
    };


    beforeAll(async () => {
        const command = new DatabaseResetCommand();
        await command.run();
    });

    test('POST      /addresses        Should create a new address', async () => {
        const res = await api('POST', '/api/addresses', {
            body: testData
        });
        res.expectJson();
        res.expectStatusCode(201);
        res.expectData(keys);

        createdId = res.getData()['id'];
        const result: any = res.getData();
        expect(result.title).toBe(testData.title);
        expect(result.addressLine1).toBe(testData.addressLine1);
        expect(result.addressLine2).toBe(testData.addressLine2);
        expect(result.city).toBe(testData.city);
        expect(result.country).toBe(testData.country);
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
        expect(data.length).toBe(1);    // one, because if it's something else then the next expects might fail

        const result = data[0];
        expect(result.title).toBe(testData.title);
        expect(result.addressLine1).toBe(testData.addressLine1);
        expect(result.addressLine2).toBe(testData.addressLine2);
        expect(result.city).toBe(testData.city);
        expect(result.country).toBe(testData.country);
    });

    test('GET       /addresses/:id    Should return one address', async () => {
        const res = await api('GET', `/api/addresses/${createdId}`);
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys);

        const result: any = res.getData();
        expect(result.title).toBe(testData.title);
        expect(result.addressLine1).toBe(testData.addressLine1);
        expect(result.addressLine2).toBe(testData.addressLine2);
        expect(result.city).toBe(testData.city);
        expect(result.country).toBe(testData.country);
    });

    test('PUT       /addresses/:id    Should update the address', async () => {
        const res = await api('PUT', `/api/addresses/${createdId}`, {
            body: testDataUpdated
        });
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys);

        const result: any = res.getData();
        expect(result.title).toBe(testDataUpdated.title);
        expect(result.addressLine1).toBe(testDataUpdated.addressLine1);
        expect(result.addressLine2).toBe(testDataUpdated.addressLine2);
        expect(result.city).toBe(testDataUpdated.city);
        expect(result.country).toBe(testDataUpdated.country);
    });

    test('DELETE    /addresses/:id    Should delete the address', async () => {
        const res = await api('DELETE', `/api/addresses/${createdId}`);
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
