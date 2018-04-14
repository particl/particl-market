import { rpc, api } from '../lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';

describe('ProfileUpdateCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const method = Commands.PROFILE_ROOT.commandName;
    const subCommand = Commands.PROFILE_UPDATE.commandName;

    const testData = {
        name: 'DEFAULT-PROFILE-TEST',
        address: 'DEFAULT-PROFILE-ADDRESS',
        shippingAddresses: [{
            firstName: 'Johnny',
            lastName: 'Depp',
            title: 'Title',
            addressLine1: 'Add',
            addressLine2: 'ADD 22',
            city: 'city',
            state: 'test state',
            country: 'Sweden',
            zipCode: '85001'
        }, {
            firstName: 'Robert',
            lastName: 'Downey',
            title: 'Tite',
            addressLine1: 'Ad',
            addressLine2: 'ADD 222',
            city: 'city',
            state: 'test state',
            country: 'Finland',
            zipCode: '85001'
        }]
    };

    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    test('Should update the profile by RPC', async () => {
        // set up the test data
        const addDataRes: any = await testUtil.addData(CreatableModel.PROFILE, testData);
        const createdId = addDataRes.id;

        // update profile
        const profileName = 'UPDATED-DEFAULT-PROFILE-TEST';
        const profileAddress = 'UPDATED-DEFAULT-PROFILE-TEST-ADDRESS';
        const res = await rpc(method, [subCommand, createdId, profileName, profileAddress]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.name).toBe(profileName);
        expect(result.address).toBe('DEFAULT-PROFILE-ADDRESS'); // we are not allowing the address to be updated
    });

});
