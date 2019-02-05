// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { Logger as LoggerType } from '../../../src/core/Logger';
import * as resources from 'resources';
import { MessageException } from '../../../src/api/exceptions/MessageException';
import { NotFoundException } from '../../../src/api/exceptions/NotFoundException';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';

describe('ProfileAddCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const profileCommand = Commands.PROFILE_ROOT.commandName;
    const profileAddCommand = Commands.PROFILE_ADD.commandName;

    const profileAddress = 'DEFAULT-TEST-ADDRESS';
    const profileName = 'DEFAULT-TEST-PROFILE';

    let createdProfile: resources.Profile;

    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    test('Should create a new Profile', async () => {
        const res = await testUtil.rpc(profileCommand, [profileAddCommand, profileName, profileAddress]);
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
        const res = await testUtil.rpc(profileCommand, [Commands.PROFILE_GET.commandName, createdProfile.id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.name).toBe(profileName);
        expect(result.address).toBe(profileAddress);
        expect(result.ShoppingCart).toHaveLength(1);
        expect(result.ShoppingCart[0].name).toBe('DEFAULT');
    });

    test('Should fail to create a new Profile because profile with given name allready exist', async () => {
        const res = await testUtil.rpc(profileCommand, [profileAddCommand, profileName, profileAddress]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(`Profile already exist for the given name = ${profileName}`);
    });

    test('Should fail because we want to create a Profile without a name', async () => {
        const res = await testUtil.rpc(profileCommand, [profileAddCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('profileName').getMessage());
    });
});
