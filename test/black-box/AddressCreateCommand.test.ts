import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Commands } from '../../src/api/commands/CommandEnumType';
import { ShippingCountries } from '../../src/core/helpers/ShippingCountries';

describe('AddressCreateCommand', () => {
    const testUtil = new BlackBoxTestUtil();
    const method = Commands.ADDRESS_ROOT.commandName;
    const subCommand = Commands.ADDRESS_ADD.commandName;
    let defaultProfileId;

    const testData = {
        title: 'Work',
        addressLine1: '123 6th St',
        addressLine2: 'Melbourne, FL 32904',
        city: 'Melbourne',
        state: 'Mel State',
        country: 'Finland',
        zipCode: '85001'
    };

    let defaultProfile;

    beforeAll(async () => {
        await testUtil.cleanDb();
        defaultProfile = await testUtil.getDefaultProfile();
        defaultProfileId = defaultProfile.id;
    });

    test('Should create a new address by RPC', async () => {

        const res = await rpc(method, [subCommand,
            defaultProfileId,
            testData.title,
            testData.addressLine1, testData.addressLine2,
            testData.city, testData.state, testData.country, testData.zipCode]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.title).toBe(testData.title);
        expect(result.addressLine1).toBe(testData.addressLine1);
        expect(result.addressLine2).toBe(testData.addressLine2);
        expect(result.city).toBe(testData.city);
        expect(result.state).toBe(testData.state);
        expect(result.country).toBe(ShippingCountries.getCountryCode(testData.country));
        expect(result.zipCode).toBe(testData.zipCode);
    });

    test('Should fail because we want to create an empty address without required fields', async () => {
        const res = await rpc(method, [subCommand, testData.title, testData.addressLine1, testData.addressLine2, testData.city,
            testData.state, testData.country, 'test']);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('Should fail to create address because state is null', async () => {
        const res = await rpc(method, [subCommand,
            defaultProfileId,
            testData.title,
            testData.addressLine1, testData.addressLine2,
            testData.city, null, testData.country, testData.zipCode]);
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('Should fail to create address because state is undefined', async () => {
        const res = await rpc(method, [subCommand,
            defaultProfileId,
            testData.title,
            testData.addressLine1, testData.addressLine2,
            testData.city, undefined, testData.country, testData.zipCode]);
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('Should create a new address with blank state by RPC', async () => {

        const res = await rpc(method, [subCommand,
            defaultProfileId,
            testData.title,
            testData.addressLine1, testData.addressLine2,
            testData.city, '', testData.country, testData.zipCode]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.title).toBe(testData.title);
        expect(result.addressLine1).toBe(testData.addressLine1);
        expect(result.addressLine2).toBe(testData.addressLine2);
        expect(result.city).toBe(testData.city);
        expect(result.state).toBe('');
        expect(result.country).toBe(ShippingCountries.getCountryCode(testData.country));
        expect(result.zipCode).toBe(testData.zipCode);
    });
});
