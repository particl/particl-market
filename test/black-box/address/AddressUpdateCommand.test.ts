import { rpc, api } from '../lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { AddressType } from '../../../src/api/enums/AddressType';

describe('AddressUpdateCommand', () => {
    const testUtil = new BlackBoxTestUtil();
    const method = Commands.ADDRESS_ROOT.commandName;
    const subCommand = Commands.ADDRESS_UPDATE.commandName;
    const addSubCommand = Commands.ADDRESS_ADD.commandName;

    const testData = {
        name: 'TESTING-ADDRESS-PROFILE-NAME' + new Date().getTime(),
        address: 'TESTING-ADDRESS-PROFILE-ADDRESS',
        shippingAddresses: [{
            firstName: 'Johnny',
            lastName: 'Depp',
            title: 'Title',
            addressLine1: 'Add',
            addressLine2: 'ADD 22',
            city: 'city',
            state: 'test state',
            country: 'SW',
            zipCode: '85001',
            type: AddressType.SHIPPING_OWN
        }]
    };

    const testDataUpdated = {
        firstName: 'Robert',
        lastName: 'Downey',
        title: 'Work',
        addressLine1: '123 6th St',
        addressLine2: 'Melbourne, FL 32904',
        city: 'Melbourne',
        state: 'test state updated',
        country: 'FI',
        zipCode: '85001'
    };

    const testData2 = [{
        name: 'TESTING-ADDRESS-PROFILE-NAME1' + new Date().getTime(),
        address: 'TESTING-ADDRESS-PROFILE-ADDRESS1',
        shippingAddresses: [{
            firstName: 'Johnny1',
            lastName: 'Depp1',
            title: 'Title1',
            addressLine1: 'Add1',
            addressLine2: 'ADD 221',
            city: 'city1',
            state: 'test state1',
            country: 'FI',
            zipCode: '85001',
            type: AddressType.SHIPPING_OWN
        }]
    },
    {
        name: 'TESTING-ADDRESS-PROFILE-NAME2' + new Date().getTime(),
        address: 'TESTING-ADDRESS-PROFILE-ADDRESS2',
        shippingAddresses: [{
            firstName: 'Johnny2',
            lastName: 'Depp2',
            title: 'Title2',
            addressLine1: 'Add2',
            addressLine2: 'ADD 222',
            city: 'city2',
            state: 'test state2',
            country: 'FI',
            zipCode: '85002',
            type: AddressType.SHIPPING_OWN
        }]
    },
    {
        name: 'TESTING-ADDRESS-PROFILE-NAME3' + new Date().getTime(),
        address: 'TESTING-ADDRESS-PROFILE-ADDRESS3',
        shippingAddresses: [{
            firstName: 'Johnny3',
            lastName: 'Depp3',
            title: 'Title3',
            addressLine1: 'Add3',
            addressLine2: 'ADD 223',
            city: 'city3',
            state: 'test state3',
            country: 'FI',
            zipCode: '85003',
            type: AddressType.SHIPPING_OWN
        }]
    }];

    const testDataUpdate2 = [{
        name: 'TESTING-ADDRESS-PROFILE-NAME4' + new Date().getTime(),
        address: 'TESTING-ADDRESS-PROFILE-ADDRESS4',
        shippingAddresses: [{
            firstName: 'Johnny4',
            lastName: 'Depp4',
            title: 'Title4',
            addressLine1: 'Add4',
            addressLine2: 'ADD 224',
            city: 'city4',
            state: 'test state4',
            country: 'FI',
            zipCode: '85004',
            type: AddressType.SHIPPING_OWN
        }]
    },
    {
        name: 'TESTING-ADDRESS-PROFILE-NAME5' + new Date().getTime(),
        address: 'TESTING-ADDRESS-PROFILE-ADDRESS5',
        shippingAddresses: [{
            firstName: 'Johnny5',
            lastName: 'Depp5',
            title: 'Title5',
            addressLine1: 'Add5',
            addressLine2: 'ADD 225',
            city: 'city5',
            state: 'test state5',
            country: 'FI',
            zipCode: '85005',
            type: AddressType.SHIPPING_OWN
        }]
    },
    {
        name: 'TESTING-ADDRESS-PROFILE-NAME6' + new Date().getTime(),
        address: 'TESTING-ADDRESS-PROFILE-ADDRESS6',
        shippingAddresses: [{
            firstName: 'Johnny6',
            lastName: 'Depp6',
            title: 'Title6',
            addressLine1: 'Add6',
            addressLine2: 'ADD 226',
            city: 'city6',
            state: 'test state6',
            country: 'FI',
            zipCode: '85006',
            type: AddressType.SHIPPING_OWN
        }]
    }];

    let profileId;
    let addressId;
    let defaultProfileId;

    beforeAll(async () => {
        await testUtil.cleanDb();

        const defaultProfile = await testUtil.getDefaultProfile();
        defaultProfileId = defaultProfile.id;
    });

    test('Should update the address', async () => {
        // set up the test data, create profile + addresses
        const addDataRes: any = await testUtil.addData(CreatableModel.PROFILE, testData);
        profileId = addDataRes.id;
        addressId = addDataRes.ShippingAddresses[0].id;

        // update address
        const res = await rpc(method, [subCommand,
            addressId,
            testDataUpdated.firstName,
            testDataUpdated.lastName,
            testDataUpdated.title,
            testDataUpdated.addressLine1,
            testDataUpdated.addressLine2,
            testDataUpdated.city,
            testDataUpdated.state,
            testDataUpdated.country,
            testDataUpdated.zipCode,
            profileId
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.firstName).toBe(testDataUpdated.firstName);
        expect(result.lastName).toBe(testDataUpdated.lastName);
        expect(result.title).toBe(testDataUpdated.title);
        expect(result.addressLine1).toBe(testDataUpdated.addressLine1);
        expect(result.addressLine2).toBe(testDataUpdated.addressLine2);
        expect(result.city).toBe(testDataUpdated.city);
        expect(result.state).toBe(testDataUpdated.state);
        expect(result.country).toBe(testDataUpdated.country);
        expect(result.zipCode).toBe(testDataUpdated.zipCode);

    });

    test('Should fail because we want to update without required fields', async () => {
        const getDataRes = await rpc(method, [subCommand, testDataUpdated.firstName,
            testDataUpdated.lastName,
            testDataUpdated.title, testDataUpdated.addressLine1, testDataUpdated.addressLine2,
            testDataUpdated.city, testDataUpdated.state, testDataUpdated.country, 'test']);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(404);
    });

    test('Should fail because we want to update with null state field', async () => {
        const getDataRes = await rpc(method, [subCommand,
            addressId,
            testDataUpdated.firstName,
            testDataUpdated.lastName,
            testDataUpdated.title,
            testDataUpdated.addressLine1,
            testDataUpdated.addressLine2,
            testDataUpdated.city,
            null,
            testDataUpdated.country,
            testDataUpdated.zipCode,
            profileId
        ]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(400);
    });

    test('Should fail because we want to update with undefined state field', async () => {
        const getDataRes = await rpc(method, [subCommand,
            addressId,
            testDataUpdated.firstName,
            testDataUpdated.lastName,
            testDataUpdated.title,
            testDataUpdated.addressLine1,
            testDataUpdated.addressLine2,
            testDataUpdated.city,
            undefined,
            testDataUpdated.country,
            testDataUpdated.zipCode,
            profileId
        ]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(400);
    });

    test('Should update the address with blank state field', async () => {
        // update address
        const res = await rpc(method, [subCommand,
            addressId,
            testDataUpdated.firstName,
            testDataUpdated.lastName,
            testDataUpdated.title,
            testDataUpdated.addressLine1,
            testDataUpdated.addressLine2,
            testDataUpdated.city,
            '',
            testDataUpdated.country,
            testDataUpdated.zipCode,
            profileId
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.firstName).toBe(testDataUpdated.firstName);
        expect(result.lastName).toBe(testDataUpdated.lastName);
        expect(result.title).toBe(testDataUpdated.title);
        expect(result.addressLine1).toBe(testDataUpdated.addressLine1);
        expect(result.addressLine2).toBe(testDataUpdated.addressLine2);
        expect(result.city).toBe(testDataUpdated.city);
        expect(result.state).toBe('');
        expect(result.country).toBe(testDataUpdated.country);
        expect(result.zipCode).toBe(testDataUpdated.zipCode);
    });

});
