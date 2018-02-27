import { rpc, api } from '../lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';

describe('AddressListCommand', () => {
    const testUtil = new BlackBoxTestUtil();
    const method = Commands.ADDRESS_ROOT.commandName;
    const subCommand = Commands.ADDRESS_LIST.commandName;
    let defaultProfileId;

    const testData = {
        firstName: 'Johnny',
        lastName: 'Depp',
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

    test('Should list empty address with profile id', async () => {
        // list all the address
        const addRes = await rpc(method, [subCommand, defaultProfileId]);
        addRes.expectJson();
        addRes.expectStatusCode(200);
        const result: any = addRes.getBody()['result'];
        expect(result.length).toBe(0);
    });

    test('Should list empty address without', async () => {
        // list all the address
        const addRes = await rpc(method, [subCommand]);
        addRes.expectJson();
        addRes.expectStatusCode(200);
        const result: any = addRes.getBody()['result'];
        expect(result.length).toBe(0);
    });

    test('Should list one address by profile id', async () => {
        // add address
        const res = await rpc(method, [Commands.ADDRESS_ADD.commandName,
            defaultProfileId,
        testData.firstName, testData.lastName, testData.title,
        testData.addressLine1, testData.addressLine2,
        testData.city, testData.state, testData.country, testData.zipCode]);
        res.expectJson();
        res.expectStatusCode(200);

        // list created address
        const addRes = await rpc(method, [subCommand, defaultProfileId]);
        addRes.expectJson();
        addRes.expectStatusCode(200);
        const result: any = addRes.getBody()['result'];
        expect(result.length).toBe(1);

    });

    test('Should list two address by profile id', async () => {
        // add address
        const res = await rpc(method, [Commands.ADDRESS_ADD.commandName,
            defaultProfileId,
        testData.firstName, testData.lastName, testData.title,
        testData.addressLine1, testData.addressLine2,
        testData.city, testData.state, testData.country, testData.zipCode]);
        res.expectJson();
        res.expectStatusCode(200);

        // list created address
        const addRes = await rpc(method, [subCommand, defaultProfileId]);
        addRes.expectJson();
        addRes.expectStatusCode(200);
        const result: any = addRes.getBody()['result'];
        expect(result.length).toBe(2);
    });

    test('Should list address without profile id', async () => {
        // list all the address without profile id
        const addRes = await rpc(method, [subCommand]);
        addRes.expectJson();
        addRes.expectStatusCode(200);
        const result: any = addRes.getBody()['result'];
        expect(result.length).toBe(2);
    });

});
