// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import * as Faker from 'faker';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Targets, Types } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { ProfileService } from '../../src/api/services/model/ProfileService';
import { IdentityService } from '../../src/api/services/model/IdentityService';
import { IdentityCreateRequest } from '../../src/api/requests/model/IdentityCreateRequest';
import { IdentityUpdateRequest } from '../../src/api/requests/model/IdentityUpdateRequest';
import { IdentityType } from '../../src/api/enums/IdentityType';

describe('Identity', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let identityService: IdentityService;
    let profileService: ProfileService;

    let profile: resources.Profile;
    let wallet: resources.Identity;

    const testData = {
        profile_id: 0,
        wallet: Faker.random.uuid(),
        address: Faker.random.uuid(),
        type: IdentityType.MARKET
    } as IdentityCreateRequest;

    const testDataUpdated = {
        wallet: Faker.random.uuid()
    } as IdentityUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        identityService = app.IoC.getNamed<IdentityService>(Types.Service, Targets.Service.model.IdentityService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);

        profile = await profileService.getDefault().then(value => value.toJSON());

    });

    afterAll(async () => {
        //
    });

    test('Should throw ValidationException because we want to create a empty wallet', async () => {
        expect.assertions(1);
        await identityService.create({} as IdentityCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new Identity', async () => {

        testData.profile_id = profile.id;
        wallet = await identityService.create(testData).then(value => value.toJSON());
        const result: resources.Identity = wallet;

        expect(result.wallet).toBe(testData.wallet);
    });

    test('Should list Identities with our newly create one', async () => {
        const identities: resources.Identity[] = await identityService.findAll().then(value => value.toJSON());
        expect(identities.length).toBe(3);

        expect(identities[0].wallet).toBe('profiles/DEFAULT');
        expect(identities[1].wallet).toBe('profiles/DEFAULT/particl-market');
        expect(identities[2].wallet).toBe(testData.wallet);
    });

    test('Should return one Identity', async () => {
        const result: resources.Identity = await identityService.findOne(wallet.id).then(value => value.toJSON());
        expect(result.wallet).toBe(testData.wallet);
    });

    // todo: missing tests for findOneByXXX

    test('Should update the Identity', async () => {
        const result: resources.Identity = await identityService.update(wallet.id, testDataUpdated).then(value => value.toJSON());
        expect(result.wallet).toBe(testDataUpdated.wallet);
    });

    test('Should delete the Identity', async () => {
        expect.assertions(1);
        await identityService.destroy(wallet.id);
        await identityService.findOne(wallet.id).catch(e =>
            expect(e).toEqual(new NotFoundException(wallet.id))
        );
    });

});
