import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Logger as LoggerType } from '../../src/core/Logger';
import { AddressCreateCommand } from '../../src/api/commands/address/AddressCreateCommand';
import { Commands } from '../../src/api/commands/CommandEnumType';

describe('CreateAddress', () => {
    const testUtil = new BlackBoxTestUtil();
    const addressService = null;
    const method = Commands.ADDRESS_ROOT.commandName;
    const subCommand = Commands.ADDRESS_ADD.commandName;
    let defaultProfileId;

    const testData = {
        title: 'Work',
        addressLine1: '123 6th St',
        addressLine2: 'Melbourne, FL 32904',
        city: 'Melbourne',
        country: 'Finland',
        zipCode: '85001'
    };

    let defaultProfile;

    beforeAll(async () => {
        await testUtil.cleanDb([]);
        defaultProfile = await testUtil.getDefaultProfile();
        defaultProfileId = defaultProfile.id;
    });

    test('Should create a new address by RPC', async () => {
        console.log(`ASDASFASDA: ${subCommand},${defaultProfileId},${testData.title},${testData.addressLine1},${testData.addressLine2},${testData.city},${testData.country},${testData.zipCode}`);
        console.log('ADSSA: ' + JSON.stringify(defaultProfile));
        const res = await rpc(method, [subCommand,
            defaultProfileId,
            testData.title,
            testData.addressLine1, testData.addressLine2,
            testData.city, testData.country, testData.zipCode]);
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
        const res = await rpc(method, [subCommand, testData.title, testData.addressLine1, testData.addressLine2, testData.city, testData.country]);
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('Should fail because we want to create an empty address', async () => {
        const res = await rpc(method, [subCommand]);
        res.expectJson();
        res.expectStatusCode(400);
    });
});
