import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Logger as LoggerType } from '../../src/core/Logger';
import { AddressUpdateCommand } from '../../src/api/commands/address/AddressUpdateCommand';
import { Commands } from '../../src/api/commands/CommandEnumType';

describe('/RpcUpdateAddress', () => {
    const testUtil = new BlackBoxTestUtil();
    const addressService = null;
    const method = Commands.ADDRESS_ROOT.commandName;
    const subCommand = Commands.ADDRESS_UPDATE.commandName;

    const testData = {
        name: 'TESTING-ADDRESS-PROFILE-NAME',
        address: 'TESTING-ADDRESS-PROFILE-ADDRESS',
        shippingAddresses: [{
            title: 'Title',
            addressLine1: 'Add',
            addressLine2: 'ADD 22',
            city: 'city',
            state: 'test state',
            country: 'SW',
            zipCode: '85001'
        }]
    };

    const testDataUpdated = {
        title: 'Work',
        addressLine1: '123 6th St',
        addressLine2: 'Melbourne, FL 32904',
        city: 'Melbourne',
        state: 'test state updated',
        country: 'FI',
        zipCode: '85001'
    };

    let profileId;
    let addressId;

    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    test('Should update the address', async () => {
        // set up the test data, create profile + addresses
        const addDataRes: any = await testUtil.addData('profile', testData);
        profileId = addDataRes.getBody()['result'].id;
        addressId = addDataRes.getBody()['result'].ShippingAddresses[0].id;

        // update address
        const res = await rpc(method, [ subCommand,
            addressId,
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
        expect(result.title).toBe(testDataUpdated.title);
        expect(result.addressLine1).toBe(testDataUpdated.addressLine1);
        expect(result.addressLine2).toBe(testDataUpdated.addressLine2);
        expect(result.city).toBe(testDataUpdated.city);
        expect(result.state).toBe(testDataUpdated.state);
        expect(result.country).toBe(testDataUpdated.country);
        expect(result.zipCode).toBe(testDataUpdated.zipCode);

    });

    test('Should fail because we want to update without required fields', async () => {
        const getDataRes = await rpc(method, [subCommand,
            testDataUpdated.title, testDataUpdated.addressLine1, testDataUpdated.addressLine2,
            testDataUpdated.city, testDataUpdated.state, testDataUpdated.country, 'test']);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(404);
    });

    test('Should fail because we want to update with null state field', async () => {
        const getDataRes = await rpc(method, [ subCommand,
            addressId,
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
        const getDataRes = await rpc(method, [ subCommand,
            addressId,
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
        const res = await rpc(method, [ subCommand,
            addressId,
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
        expect(result.title).toBe(testDataUpdated.title);
        expect(result.addressLine1).toBe(testDataUpdated.addressLine1);
        expect(result.addressLine2).toBe(testDataUpdated.addressLine2);
        expect(result.city).toBe(testDataUpdated.city);
        expect(result.state).toBe('');
        expect(result.country).toBe(testDataUpdated.country);
        expect(result.zipCode).toBe(testDataUpdated.zipCode);

    });
});
