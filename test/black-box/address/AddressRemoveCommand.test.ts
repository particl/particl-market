import { rpc, api } from '../lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import * as _ from 'lodash';

describe('AddressRemoveCommand', () => {
    const testUtil = new BlackBoxTestUtil();
    const method = Commands.ADDRESS_ROOT.commandName;
    const subCommand = Commands.ADDRESS_REMOVE.commandName;
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
    let addressId = 0;

    beforeAll(async () => {
        await testUtil.cleanDb();
        defaultProfile = await testUtil.getDefaultProfile();
        defaultProfileId = defaultProfile.id;
    });

    test('Should fail because we want to create an invalid address id', async () => {
        const res = await rpc(method, [subCommand, addressId]);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('Should remove address RPC', async () => {
        // add address
        const res = await rpc(method, [Commands.ADDRESS_ADD.commandName,
            defaultProfileId,
            testData.title,
            testData.addressLine1, testData.addressLine2,
            testData.city, testData.state, testData.country, testData.zipCode]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        addressId = result.id;

        // delete address
        const addRes = await rpc(method, [subCommand, addressId]);
        addRes.expectJson();
        addRes.expectStatusCode(200);
    });

    test('Should fail to remove because address already been removed', async () => {
        // remove address
        const res = await rpc(method, [subCommand, addressId]);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('Should not contain the removed address in address list', async () => {
        // get list of already created address
        const res = await rpc(method, [Commands.ADDRESS_LIST.commandName]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        _.each(result, (address) => {
            expect(address.id).not.toBe(addressId);
        });
    });
});
