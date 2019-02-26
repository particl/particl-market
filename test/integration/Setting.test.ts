// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { Setting } from '../../src/api/models/Setting';
import { SettingService } from '../../src/api/services/SettingService';
import { ProfileService } from '../../src/api/services/ProfileService';
import { SettingCreateRequest } from '../../src/api/requests/SettingCreateRequest';
import { SettingUpdateRequest } from '../../src/api/requests/SettingUpdateRequest';
import * as resources from 'resources';

describe('Setting', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let settingService: SettingService;
    let profileService: ProfileService;

    let defaultProfile: resources.Profile;
    let createdSetting: resources.Setting;

    const testData = {
        key: 'testkey',
        value: 'testvalue'
    } as SettingCreateRequest;

    const testDataUpdated = {
        key: 'testkeyUPDATED',
        value: 'testvalueUPDATED'
    } as SettingUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        settingService = app.IoC.getNamed<SettingService>(Types.Service, Targets.Service.SettingService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.ProfileService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        // get default profile
        const defaultProfileModel = await profileService.getDefault();
        defaultProfile = defaultProfileModel.toJSON();


    });

    afterAll(async () => {
        //
    });

    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await settingService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new Setting', async () => {

        testData.profile_id = defaultProfile.id;
        const settingModel: Setting = await settingService.create(testData);
        const result = settingModel.toJSON();
        createdSetting = result;

        // test the values
        expect(result.Profile.id).toBe(testData.profile_id);
        expect(result.key).toBe(testData.key);
        expect(result.value).toBe(testData.value);
    });

    test('Should throw ValidationException because we want to create a empty Setting', async () => {
        expect.assertions(1);
        await settingService.create({} as SettingCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list Settings with our new create one', async () => {
        const settingCollection = await settingService.findAll();
        const setting = settingCollection.toJSON();
        expect(setting.length).toBe(1);

        const result = setting[0];

        // test the values
        expect(result.key).toBe(testData.key);
        expect(result.value).toBe(testData.value);
    });

    test('Should find all Settings by profileId', async () => {
        const settingCollection = await settingService.findAllByProfileId(defaultProfile.id);
        const setting = settingCollection.toJSON();
        expect(setting.length).toBe(1);
        const result = setting[0];

        // test the values
        expect(result.key).toBe(testData.key);
        expect(result.value).toBe(testData.value);
    });

    test('Should return one Setting using id', async () => {
        const settingModel: Setting = await settingService.findOne(createdSetting.id);
        const result = settingModel.toJSON();

        // test the values
        expect(result.Profile.id).toBe(testData.profile_id);
        expect(result.key).toBe(testData.key);
        expect(result.value).toBe(testData.value);
    });

    test('Should return one Setting using key and profileId', async () => {
        const settingModel: Setting = await settingService.findOneByKeyAndProfileId(testData.key, testData.profile_id);
        const result = settingModel.toJSON();

        // test the values
        expect(result.Profile.id).toBe(testData.profile_id);
        expect(result.key).toBe(testData.key);
        expect(result.value).toBe(testData.value);
    });

    test('Should update the setting', async () => {
        const settingModel: Setting = await settingService.update(createdSetting.id, testDataUpdated);
        const result = settingModel.toJSON();

        // test the values
        // expect(result.value).toBe(testDataUpdated.value);
        expect(result.key).toBe(testDataUpdated.key);
        expect(result.value).toBe(testDataUpdated.value);
    });

    test('Should delete the setting', async () => {
        expect.assertions(1);
        await settingService.destroy(createdSetting.id);
        await settingService.findOne(createdSetting.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdSetting.id))
        );
    });

    // TODO: missing test for destroyByKeyAndProfileId

});
