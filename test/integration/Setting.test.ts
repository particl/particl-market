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
import { Setting } from '../../src/api/models/Setting';
import { SettingService } from '../../src/api/services/model/SettingService';
import { ProfileService } from '../../src/api/services/model/ProfileService';
import { SettingCreateRequest } from '../../src/api/requests/model/SettingCreateRequest';
import { SettingUpdateRequest } from '../../src/api/requests/model/SettingUpdateRequest';
import { MarketService } from '../../src/api/services/model/MarketService';
import { DefaultMarketService } from '../../src/api/services/DefaultMarketService';

describe('Setting', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let defaultMarketService: DefaultMarketService;
    let settingService: SettingService;
    let profileService: ProfileService;
    let marketService: MarketService;

    let profile: resources.Profile;
    let market: resources.Market;

    let setting: resources.Setting;

    const testData = {
        key: 'TEST-' + Faker.random.uuid(),
        value: Faker.random.uuid()
    } as SettingCreateRequest;

    const testDataUpdated = {
        key: 'TEST-' + Faker.random.uuid(),
        value: Faker.random.uuid()
    } as SettingUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        defaultMarketService = app.IoC.getNamed<DefaultMarketService>(Types.Service, Targets.Service.DefaultMarketService);
        settingService = app.IoC.getNamed<SettingService>(Types.Service, Targets.Service.model.SettingService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);

        profile = await profileService.getDefault().then(value => value.toJSON());
        market = await defaultMarketService.getDefaultForProfile(profile.id).then(value => value.toJSON());

    });

    afterAll(async () => {
        //
    });

    test('Should throw ValidationException because we want to create a empty Setting', async () => {
        expect.assertions(1);
        await settingService.create({} as SettingCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new Setting', async () => {

        testData.profile_id = profile.id;

        // log.debug('testData: ', JSON.stringify(testData, null, 2));
        const result: resources.Setting = await settingService.create(testData).then(value => value.toJSON());

        expect(result.Profile.id).toBe(testData.profile_id);
        expect(result.key).toBe(testData.key);
        expect(result.value).toBe(testData.value);

        setting = result;
    });

    test('Should list Settings with our newly created one', async () => {
        const settings: resources.Setting[] = await settingService.findAll().then(value => value.toJSON());
        expect(settings.length).toBe(5);
        const result = settings[4];

        expect(result.key).toBe(testData.key);
        expect(result.value).toBe(testData.value);
    });

    test('Should find all Settings by profileId', async () => {
        const settings: resources.Setting[] =  await settingService.findAllByProfileId(profile.id).then(value => value.toJSON());

        expect(settings.length).toBe(2);
        const result = settings[1];

        expect(result.key).toBe(testData.key);
        expect(result.value).toBe(testData.value);
    });

    test('Should return one Setting using id', async () => {
        const result: resources.Setting = await settingService.findOne(setting.id).then(value => value.toJSON());

        expect(result.Profile.id).toBe(testData.profile_id);
        expect(result.key).toBe(testData.key);
        expect(result.value).toBe(testData.value);
    });
/*
    test('Should return one Setting using key, profileId and marketId', async () => {
        const result: resources.Setting = await settingService.findOneByKeyAndProfileIdAndMarketId(testData.key, testData.profile_id, market.id)
            .then(value => value.toJSON());

        expect(result.Profile.id).toBe(testData.profile_id);
        expect(result.key).toBe(testData.key);
        expect(result.value).toBe(testData.value);
    });
*/
    test('Should update the setting', async () => {
        const result: resources.Setting = await settingService.update(setting.id, testDataUpdated).then(value => value.toJSON());

        expect(result.key).toBe(testDataUpdated.key);
        expect(result.value).toBe(testDataUpdated.value);
    });

    test('Should delete the setting', async () => {
        expect.assertions(1);
        await settingService.destroy(setting.id);
        await settingService.findOne(setting.id).catch(e =>
            expect(e).toEqual(new NotFoundException(setting.id))
        );
    });

});
