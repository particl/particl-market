import { api } from './lib/api';
import { DatabaseResetCommand } from '../../src/console/DatabaseResetCommand';

describe('/listing-item-templates', () => {

    const keys = [
        'id', 'updatedAt', 'createdAt' // , 'Related'
    ];

    // const keysWithoutRelated = [
    //    'id', 'updatedAt', 'createdAt',
    // ];

    const testData = {
        profileId : 0
    };

    const testDataUpdated = {
    };

    let createdId;
    beforeAll(async () => {
        const command = new DatabaseResetCommand();
        await command.run();
    });

    test('POST      /listing-item-templates        Should create a new listing item template', async () => {
        const res = await api('POST', '/api/listing-item-templates', {
            body: testData
        });
        res.expectJson();
        res.expectStatusCode(201);
        res.expectData(keys);
        createdId = res.getData()['id'];

        const result: any = res.getData();
    });

    /*
    actually this should not fail :)

    test('POST      /listing-item-templates        Should fail because we want to create a empty listing item template', async () => {
        const res = await api('POST', '/api/listing-item-templates', {
            body: {}
        });
        res.expectJson();
        res.expectStatusCode(400);
    });
    */

    test('GET       /listing-item-templates        Should list listing item templates with our new create one', async () => {
        const res = await api('GET', '/api/listing-item-templates');
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys); // keysWithoutRelated
        const data = res.getData<any[]>();
        expect(data.length).toBe(1);

        const result = data[0];
    });

    test('GET       /listing-item-templates/:id    Should return one listing item template', async () => {
        const res = await api('GET', `/api/listing-item-templates/${createdId}`);
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys);

        const result: any = res.getData();
    });

    test('PUT       /listing-item-templates/:id    Should update the listing item template', async () => {
        const res = await api('PUT', `/api/listing-item-templates/${createdId}`, {
            body: testDataUpdated
        });
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys);

        const result: any = res.getData();
    });

    test('DELETE    /listing-item-templates/:id    Should delete the listing item template', async () => {
        const res = await api('DELETE', `/api/listing-item-templates/${createdId}`);
        res.expectStatusCode(200);
    });

    /**
     * 404 - NotFound Testing
     */
    test('GET       /listing-item-templates/:id    Should return with a 404, because we just deleted the listing item template', async () => {
        const res = await api('GET', `/api/listing-item-templates/${createdId}`);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('DELETE    /listing-item-templates/:id    Should return with a 404, because we just deleted the listing item template', async () => {
        const res = await api('DELETE', `/api/listing-item-templates/${createdId}`);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('PUT       /listing-item-templates/:id    Should return with a 404, because we just deleted the listing item template', async () => {
        const res = await api('PUT', `/api/listing-item-templates/${createdId}`, {
            body: testDataUpdated
        });
        res.expectJson();
        res.expectStatusCode(404);
    });

});
