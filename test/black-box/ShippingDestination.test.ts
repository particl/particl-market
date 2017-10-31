import { api } from './lib/api';
import { DatabaseResetCommand } from '../../src/console/DatabaseResetCommand';
import { ShippingAvailability } from '../../src/api/enums/ShippingAvailability';
import { Country } from '../../src/api/enums/Country';

describe('/shipping-destinations', () => {

    const keys = [
        'id', 'updatedAt', 'createdAt', 'country', 'shippingAvailability' // , 'Related'
    ];

    // const keysWithoutRelated = [
    //    'id', 'updatedAt', 'createdAt', 'country', 'shippingAvailability'
    // ];

    const testData = {
        country: Country.UNITED_KINGDOM,
        shippingAvailability: ShippingAvailability.DOES_NOT_SHIP
    };

    const testDataUpdated = {
        country: Country.EU,
        shippingAvailability: ShippingAvailability.SHIPS
    };

    let createdId;
    beforeAll(async () => {
        const command = new DatabaseResetCommand();
        await command.run();
    });

    test('POST      /shipping-destinations        Should create a new shipping destination', async () => {
        const res = await api('POST', '/api/shipping-destinations', {
            body: testData
        });
        res.expectJson();
        res.expectStatusCode(201);
        res.expectData(keys);
        createdId = res.getData()['id'];

        const result: any = res.getData();
        expect(result.country).toBe(testData.country);
        expect(result.shippingAvailability).toBe(testData.shippingAvailability);
    });

    test('POST      /shipping-destinations        Should fail because we want to create a empty shipping destination', async () => {
        const res = await api('POST', '/api/shipping-destinations', {
            body: {}
        });
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('GET       /shipping-destinations        Should list shipping destinations with our new create one', async () => {
        const res = await api('GET', '/api/shipping-destinations');
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys); // keysWithoutRelated
        const data = res.getData<any[]>();
        expect(data.length).toBe(1);

        const result = data[0];
        expect(result.country).toBe(testData.country);
        expect(result.shippingAvailability).toBe(testData.shippingAvailability);
    });

    test('GET       /shipping-destinations/:id    Should return one shipping destination', async () => {
        const res = await api('GET', `/api/shipping-destinations/${createdId}`);
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys);

        const result: any = res.getData();
        expect(result.country).toBe(testData.country);
        expect(result.shippingAvailability).toBe(testData.shippingAvailability);
    });

    test('PUT       /shipping-destinations/:id    Should update the shipping destination', async () => {
        const res = await api('PUT', `/api/shipping-destinations/${createdId}`, {
            body: testDataUpdated
        });
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys);

        const result: any = res.getData();
        expect(result.country).toBe(testDataUpdated.country);
        expect(result.shippingAvailability).toBe(testDataUpdated.shippingAvailability);
    });

    test('PUT       /shipping-destinations/:id    Should fail because we want to update the shipping destination with a invalid email', async () => {
        const res = await api('PUT', `/api/shipping-destinations/${createdId}`, {
            body: {
                email: 'abc'
            }
        });
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('DELETE    /shipping-destinations/:id    Should delete the shipping destination', async () => {
        const res = await api('DELETE', `/api/shipping-destinations/${createdId}`);
        res.expectStatusCode(200);
    });

    /**
     * 404 - NotFound Testing
     */
    test('GET       /shipping-destinations/:id    Should return with a 404, because we just deleted the shipping destination', async () => {
        const res = await api('GET', `/api/shipping-destinations/${createdId}`);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('DELETE    /shipping-destinations/:id    Should return with a 404, because we just deleted the shipping destination', async () => {
        const res = await api('DELETE', `/api/shipping-destinations/${createdId}`);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('PUT       /shipping-destinations/:id    Should return with a 404, because we just deleted the shipping destination', async () => {
        const res = await api('PUT', `/api/shipping-destinations/${createdId}`, {
            body: testDataUpdated
        });
        res.expectJson();
        res.expectStatusCode(404);
    });

});
