import { rpc, api } from './lib/api';

import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Country } from '../../src/api/enums/Country';

describe('/RpcUpdateAddress', () => {

    const testUtil = new BlackBoxTestUtil();
    const method = 'updateaddress';

    const testData = {
        name: 'TESTING-ADDRESS-PROFILE-NAME',
        address: 'TESTING-ADDRESS-PROFILE-ADDRESS',
        shippingAddresses: [{
            title: 'Title',
            addressLine1: 'Add',
            addressLine2: 'ADD 22',
            city: 'city',
            country: Country.SWEDEN
        }]
    };

    const testDataUpdated = {
        title: 'Work',
        addressLine1: '123 6th St',
        addressLine2: 'Melbourne, FL 32904',
        city: 'Melbourne',
        country: Country.FINLAND
    };

    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    test('Should update the address', async () => {

        // set up the test data, create profile + addresses
        const addDataRes: any = await testUtil.addData('profile', testData);
        const profileId = addDataRes.getBody()['result'].id;
        const addressId = addDataRes.getBody()['result'].ShippingAddresses[0].id;

        // update address
        const res = await rpc(method, [
            addressId,
            testDataUpdated.title,
            testDataUpdated.addressLine1,
            testDataUpdated.addressLine2,
            testDataUpdated.city,
            testDataUpdated.country,
            profileId
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.title).toBe(testDataUpdated.title);
        expect(result.addressLine1).toBe(testDataUpdated.addressLine1);
        expect(result.addressLine2).toBe(testDataUpdated.addressLine2);
        expect(result.city).toBe(testDataUpdated.city);
        expect(result.country).toBe(testDataUpdated.country);
    });
});
