import { rpc, api } from './lib/api';

import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Country } from '../../src/api/enums/Country';

describe('CreateAddress', () => {

    const testUtil = new BlackBoxTestUtil();
    const method = 'createaddress';
    let defaultProfileId;

    const testData = {
        title: 'Work',
        addressLine1: '123 6th St',
        addressLine2: 'Melbourne, FL 32904',
        city: 'Melbourne',
        country: Country.FINLAND,
        zipCode: 85001
    };

    beforeAll(async () => {
        await testUtil.cleanDb();
        const defaultProfile = await testUtil.getDefaultProfile();
        defaultProfileId = defaultProfile.id;
    });

    test('Should create a new address by RPC', async () => {
        const res = await rpc(method, [testData.title, testData.addressLine1, testData.addressLine2, testData.city, testData.country, defaultProfileId]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        expect(result.title).toBe(testData.title);
        expect(result.addressLine1).toBe(testData.addressLine1);
        expect(result.addressLine2).toBe(testData.addressLine2);
        expect(result.city).toBe(testData.city);
        expect(result.country).toBe(testData.country);
        expect(result.zipCode).toBe(testData.zipCode);
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
