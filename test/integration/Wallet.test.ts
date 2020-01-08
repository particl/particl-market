// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import * as Faker from 'faker';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { IdentityService } from 'IdentityService.ts';
import { IdentityCreateRequest } from 'IdentityCreateRequest.ts';
import { IdentityUpdateRequest } from 'IdentityUpdateRequest.ts';
import { ProfileService } from '../../src/api/services/model/ProfileService';

describe('Wallet', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let walletService: IdentityService;
    let profileService: ProfileService;

    let profile: resources.Profile;
    let wallet: resources.Identity;

    const testData = {
        name: Faker.random.uuid()
    } as IdentityCreateRequest;

    const testDataUpdated = {
        name: Faker.random.uuid()
    } as IdentityUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        walletService = app.IoC.getNamed<IdentityService>(Types.Service, Targets.Service.model.WalletService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        profile = await profileService.getDefault()
            .then(value => value.toJSON());

    });

    afterAll(async () => {
        //
    });

    test('Should create a new wallet', async () => {

        testData.profile_id = profile.id;
        wallet = await walletService.create(testData).then(value => value.toJSON());
        const result: resources.Identity = wallet;

        expect(result.name).toBe(testData.name);
    });

    test('Should throw ValidationException because we want to create a empty wallet', async () => {
        expect.assertions(1);
        await walletService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list wallets with our new create one', async () => {
        const wallets: resources.Identity[] = await walletService.findAll().then(value => value.toJSON());
        expect(wallets.length).toBe(2);

        expect(wallets[0].name).toBe('market');
        expect(wallets[1].name).toBe(testData.name);
    });

    test('Should return one wallet', async () => {
        const result: resources.Identity = await walletService.findOne(wallet.id).then(value => value.toJSON());
        expect(result.name).toBe(testData.name);
    });

    test('Should update the wallet', async () => {
        const result: resources.Identity = await walletService.update(wallet.id, testDataUpdated).then(value => value.toJSON());
        expect(result.name).toBe(testDataUpdated.name);
    });

    test('Should delete the wallet', async () => {
        expect.assertions(1);
        await walletService.destroy(wallet.id);
        await walletService.findOne(wallet.id).catch(e =>
            expect(e).toEqual(new NotFoundException(wallet.id))
        );
    });

});
