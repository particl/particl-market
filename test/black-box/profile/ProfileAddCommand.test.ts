// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { rpc, api } from '../lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';

describe('ProfileAddCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const method = Commands.PROFILE_ROOT.commandName;
    const subCommand = Commands.PROFILE_ADD.commandName;
    const profileAddress = 'DEFAULT-TEST-ADDRESS';
    const profileName = 'DEFAULT-TEST-PROFILE';
    let createdProfile;

    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    test('Should create a new Profile', async () => {
        const res = await rpc(method, [subCommand, profileName, profileAddress]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        createdProfile = result;
        expect(result.name).toBe(profileName);
        expect(result.address).toBe(profileAddress);
        // check default shopping cart
        expect(result.ShoppingCart).toHaveLength(1);
        expect(result.ShoppingCart[0].name).toBe('DEFAULT');
    });

    test('Should return created Profile', async () => {
        const res = await rpc(method, [Commands.PROFILE_GET.commandName, createdProfile.id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.name).toBe(profileName);
        expect(result.address).toBe(profileAddress);
        // check default shopping cart
        expect(result.ShoppingCart).toHaveLength(1);
        expect(result.ShoppingCart[0].name).toBe('DEFAULT');
    });

    test('Should fail to create a new Profile because profile with given name allready exist', async () => {
        const res = await rpc(method, [subCommand, profileName, profileAddress]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(`Profile already exist for the given name = ${profileName}`);
    });

    test('Should fail because we want to create an empty Profile', async () => {
        const res = await rpc(method, [subCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Requires profile name arg.');
    });
});
