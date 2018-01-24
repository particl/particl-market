import { rpc, api } from './lib/api';

import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Logger } from '../../src/core/Logger';
import { ProfileUpdateCommand } from '../../src/api/commands/profile/ProfileUpdateCommand';

describe('ProfileUpdateCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const method = 'profile';

    const testData = {
        name: 'DEFAULT-PROFILE-TEST',
        address: 'DEFAULT-PROFILE-ADDRESS',
        shippingAddresses: [{
            title: 'Title',
            addressLine1: 'Add',
            addressLine2: 'ADD 22',
            city: 'city',
            country: 'Sweden',
            zipCode: '85001'
        }, {
            title: 'Tite',
            addressLine1: 'Ad',
            addressLine2: 'ADD 222',
            city: 'city',
            country: 'Finland',
            zipCode: '85001'
        }]
    };

    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    test('Should update the profile by RPC', async () => {
        // set up the test data
        const addDataRes: any = await testUtil.addData('profile', testData);
        const createdId = addDataRes.getBody()['result'].id;

        // update profile
        const profileName = 'UPDATED-DEFAULT-PROFILE-TEST';
        const profileAddress = 'UPDATED-DEFAULT-PROFILE-TEST-ADDRESS';
        const res = await rpc(method, ['update', createdId, profileName, profileAddress]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.name).toBe(profileName);
        expect(result.address).toBe('DEFAULT-PROFILE-ADDRESS'); // we are not allowing the address to be updated
    });

});
