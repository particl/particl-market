import { rpc, api } from '../lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { AddressType } from '../../../src/api/enums/AddressType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemParams } from '../../../src/api/requests/params/GenerateListingItemParams';
import { ListingItem, Profile } from 'resources';
import { GenerateProfileParams } from '../../../src/api/requests/params/GenerateProfileParams';

describe('AddressListCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const addressCommand = Commands.ADDRESS_ROOT.commandName;
    const listCommand = Commands.ADDRESS_LIST.commandName;
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
        zipCode: '85001',
        type: AddressType.SHIPPING_OWN
    };

    const testDataNotOwn = {
        firstName: 'Johnny',
        lastName: 'Depp',
        title: 'Work',
        addressLine1: '123 6th St',
        addressLine2: 'Melbourne, FL 32904',
        city: 'Melbourne',
        state: 'Mel State',
        country: 'Finland',
        zipCode: '85001',
        type: AddressType.SHIPPING_ORDER
    };

    let defaultProfile;

    beforeAll(async () => {
        await testUtil.cleanDb();

        defaultProfile = await testUtil.getDefaultProfile(false);
        defaultProfileId = defaultProfile.id;
    });

    test('Should list empty address list for default profile id', async () => {
        // list all the address
        const addRes = await rpc(addressCommand, [listCommand, defaultProfileId]);
        addRes.expectJson();
        addRes.expectStatusCode(200);
        const result: any = addRes.getBody()['result'];
        expect(result.length).toBe(0);
    });

    test('Should return code 500 when no profile is given', async () => {
        // list all the address
        const addRes = await rpc(addressCommand, [listCommand]);
        addRes.expectJson();
        addRes.expectStatusCode(500);
    });

    test('Should list one address for default profile id', async () => {
        // add address
        // TODO: this could fail when api changes, create and use 'data generate address'
        const res = await rpc(addressCommand, [Commands.ADDRESS_ADD.commandName, defaultProfileId,
                    testData.firstName, testData.lastName, testData.title,
                    testData.addressLine1, testData.addressLine2,
                    testData.city, testData.state, testData.country, testData.zipCode]);
        res.expectJson();
        res.expectStatusCode(200);

        // list created addresses
        const addRes = await rpc(addressCommand, [listCommand, defaultProfileId]);
        addRes.expectJson();
        addRes.expectStatusCode(200);
        const result: any = addRes.getBody()['result'];
        expect(result.length).toBe(1);

    });

    test('Should list two addresses for default profile id', async () => {
        // add address
        const res = await rpc(addressCommand, [Commands.ADDRESS_ADD.commandName, defaultProfileId,
                    testData.firstName, testData.lastName, testData.title,
                    testData.addressLine1, testData.addressLine2,
                    testData.city, testData.state, testData.country, testData.zipCode]);
        res.expectJson();
        res.expectStatusCode(200);

        // list created addresses
        const addRes = await rpc(addressCommand, [listCommand, defaultProfileId]);
        addRes.expectJson();
        addRes.expectStatusCode(200);
        const result: any = addRes.getBody()['result'];
        expect(result.length).toBe(2);
    });

    test('Check against SHIPPING_OWN - should list two addresses by default and one otherwise', async () => {
        // add address
        const res = await rpc(addressCommand, [Commands.ADDRESS_ADD.commandName, defaultProfileId,
                    testDataNotOwn.firstName, testDataNotOwn.lastName, testDataNotOwn.title,
                    testDataNotOwn.addressLine1, testDataNotOwn.addressLine2,
                    testDataNotOwn.city, testDataNotOwn.state, testDataNotOwn.country, 
                    testDataNotOwn.zipCode, testDataNotOwn.type]);
        res.expectJson();
        res.expectStatusCode(200);

        // list created addresses
        const addRes = await rpc(addressCommand, [listCommand, defaultProfileId]);
        addRes.expectJson();
        addRes.expectStatusCode(200);
        const result: any = addRes.getBody()['result'];
        expect(result.length).toBe(2);
        const addResOrder = await rpc(addressCommand, [listCommand, defaultProfileId, AddressType.SHIPPING_ORDER]);
        addResOrder.expectJson();
        addResOrder.expectStatusCode(200);
        const resultOrder: any = addResOrder.getBody()['result'];
        expect(resultOrder.length).toBe(1);
    });

    test('Should return only for a particular profile', async () => {
        // create new profile
        const generateProfileParams = new GenerateProfileParams([
            false,
            false
        ]).toParamsArray();
        const profiles = await testUtil.generateData(
            CreatableModel.PROFILE,
            1,
            true,
            generateProfileParams
        ) as Profile[];
        const newProfileId = profiles[0].id;

        const res = await rpc(addressCommand, [Commands.ADDRESS_ADD.commandName, newProfileId,
                    testDataNotOwn.firstName, testDataNotOwn.lastName, testDataNotOwn.title,
                    testDataNotOwn.addressLine1, testDataNotOwn.addressLine2,
                    testDataNotOwn.city, testDataNotOwn.state, testDataNotOwn.country, 
                    testDataNotOwn.zipCode]);
        res.expectJson();
        res.expectStatusCode(200);

        // list created addresses
        const addRes = await rpc(addressCommand, [listCommand, newProfileId]);
        addRes.expectJson();
        addRes.expectStatusCode(200);
        const result: any = addRes.getBody()['result'];
        expect(result.length).toBe(1);
    });
});
