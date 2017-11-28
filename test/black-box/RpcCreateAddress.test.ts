import { rpc, api } from './lib/api';

import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Country } from '../../src/api/enums/Country';

describe('CreateAddress', () => {

    const testUtil = new BlackBoxTestUtil();
    const method = 'createaddress';

    const testData = {
        title: 'Work',
        addressLine1: '123 6th St',
        addressLine2: 'Melbourne, FL 32904',
        city: 'Melbourne',
        country: Country.FINLAND
    };

    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    test('Should create a new address by RPC', async () => {
        const addDataRes: any = await testUtil.addData('profile', { name: 'TESTING-ADDRESS-PROFILE-NAME' });
        const profileId = addDataRes.getBody()['result'].id;

        const res = await rpc(method, [testData.title, testData.addressLine1, testData.addressLine2, testData.city, testData.country, profileId]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        expect(result.title).toBe(testData.title);
        expect(result.addressLine1).toBe(testData.addressLine1);
        expect(result.addressLine2).toBe(testData.addressLine2);
        expect(result.city).toBe(testData.city);
        expect(result.country).toBe(testData.country);
    });

    test('Should fail because we want to create an empty address without required fields', async () => {
        const res = await rpc(method, [testData.title, testData.addressLine1, testData.addressLine2, testData.city, testData.country]);
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('Should fail because we want to create an empty address', async () => {
        const res = await rpc(method, []);
        res.expectJson();
        res.expectStatusCode(400);
    });
});
