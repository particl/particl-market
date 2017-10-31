import { api } from './lib/api';
import { DatabaseResetCommand } from '../../src/console/DatabaseResetCommand';

describe('/location-markers', () => {

    const keys = [
        'id', 'updatedAt', 'createdAt', 'markerTitle', 'markerText', 'lat', 'lng' // , 'Related'
    ];

    // const keysWithoutRelated = [
    //    'id', 'updatedAt', 'createdAt', 'markerTitle', 'markerText', 'lat', 'lng'
    // ];

    const testData = {
        markerTitle: undefined, // TODO: Add test value
        markerText: undefined, // TODO: Add test value
        lat: undefined, // TODO: Add test value
        lng: undefined // TODO: Add test value
    };

    const testDataUpdated = {
        markerTitle: undefined, // TODO: Add test value
        markerText: undefined, // TODO: Add test value
        lat: undefined, // TODO: Add test value
        lng: undefined // TODO: Add test value
    };

    let createdId;
    beforeAll(async () => {
        const command = new DatabaseResetCommand();
        await command.run();
    });

    test('POST      /location-markers        Should create a new location marker', async () => {
        const res = await api('POST', '/api/location-markers', {
            body: testData
        });
        res.expectJson();
        res.expectStatusCode(201);
        res.expectData(keys);
        createdId = res.getData()['id'];

        const result: any = res.getData();
        expect(result.markerTitle).toBe(testData.markerTitle);
        expect(result.markerText).toBe(testData.markerText);
        expect(result.lat).toBe(testData.lat);
        expect(result.lng).toBe(testData.lng);
    });

    test('POST      /location-markers        Should fail because we want to create a empty location marker', async () => {
        const res = await api('POST', '/api/location-markers', {
            body: {}
        });
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('GET       /location-markers        Should list location markers with our new create one', async () => {
        const res = await api('GET', '/api/location-markers');
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys); // keysWithoutRelated
        const data = res.getData<any[]>();
        expect(data.length).toBe(1);

        const result = data[0];
        expect(result.markerTitle).toBe(testData.markerTitle);
        expect(result.markerText).toBe(testData.markerText);
        expect(result.lat).toBe(testData.lat);
        expect(result.lng).toBe(testData.lng);
    });

    test('GET       /location-markers/:id    Should return one location marker', async () => {
        const res = await api('GET', `/api/location-markers/${createdId}`);
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys);

        const result: any = res.getData();
        expect(result.markerTitle).toBe(testData.markerTitle);
        expect(result.markerText).toBe(testData.markerText);
        expect(result.lat).toBe(testData.lat);
        expect(result.lng).toBe(testData.lng);
    });

    test('PUT       /location-markers/:id    Should update the location marker', async () => {
        const res = await api('PUT', `/api/location-markers/${createdId}`, {
            body: testDataUpdated
        });
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys);

        const result: any = res.getData();
        expect(result.markerTitle).toBe(testDataUpdated.markerTitle);
        expect(result.markerText).toBe(testDataUpdated.markerText);
        expect(result.lat).toBe(testDataUpdated.lat);
        expect(result.lng).toBe(testDataUpdated.lng);
    });

    test('PUT       /location-markers/:id    Should fail because we want to update the location marker with a invalid email', async () => {
        const res = await api('PUT', `/api/location-markers/${createdId}`, {
            body: {
                email: 'abc'
            }
        });
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('DELETE    /location-markers/:id    Should delete the location marker', async () => {
        const res = await api('DELETE', `/api/location-markers/${createdId}`);
        res.expectStatusCode(200);
    });

    /**
     * 404 - NotFound Testing
     */
    test('GET       /location-markers/:id    Should return with a 404, because we just deleted the location marker', async () => {
        const res = await api('GET', `/api/location-markers/${createdId}`);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('DELETE    /location-markers/:id    Should return with a 404, because we just deleted the location marker', async () => {
        const res = await api('DELETE', `/api/location-markers/${createdId}`);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('PUT       /location-markers/:id    Should return with a 404, because we just deleted the location marker', async () => {
        const res = await api('PUT', `/api/location-markers/${createdId}`, {
            body: testDataUpdated
        });
        res.expectJson();
        res.expectStatusCode(404);
    });

});
