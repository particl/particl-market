// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { Setting } from '../../src/api/models/Setting';

import { SettingService } from '../../src/api/services/SettingService';

describe('Setting', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let settingService: SettingService;

    let createdId;

    const testData = {
        key: undefined, // TODO: Add test value
        value: undefined // TODO: Add test value
    };

    const testDataUpdated = {
        key: undefined, // TODO: Add test value
        value: undefined // TODO: Add test value
    };

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        settingService = app.IoC.getNamed<SettingService>(Types.Service, Targets.Service.SettingService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();
    });

    afterAll(async () => {
        //
    });

    /*
    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await settingService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });
    */

    test('Should create a new setting', async () => {
        // testData['related_id'] = 0;
        const settingModel: Setting = await settingService.create(testData);
        createdId = settingModel.Id;

        const result = settingModel.toJSON();

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.key).toBe(testData.key);
        expect(result.value).toBe(testData.value);
    });

    test('Should throw ValidationException because we want to create a empty setting', async () => {
        expect.assertions(1);
        await settingService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list settings with our new create one', async () => {
        const settingCollection = await settingService.findAll();
        const setting = settingCollection.toJSON();
        expect(setting.length).toBe(1);

        const result = setting[0];

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.key).toBe(testData.key);
        expect(result.value).toBe(testData.value);
    });

    test('Should return one setting', async () => {
        const settingModel: Setting = await settingService.findOne(createdId);
        const result = settingModel.toJSON();

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.key).toBe(testData.key);
        expect(result.value).toBe(testData.value);
    });

    /*
    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await settingService.update(createdId, testDataUpdated).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });
    */

    test('Should update the setting', async () => {
        // testDataUpdated['related_id'] = 0;
        const settingModel: Setting = await settingService.update(createdId, testDataUpdated);
        const result = settingModel.toJSON();

        // test the values
        // expect(result.value).toBe(testDataUpdated.value);
        expect(result.key).toBe(testDataUpdated.key);
        expect(result.value).toBe(testDataUpdated.value);
    });

    test('Should delete the setting', async () => {
        expect.assertions(1);
        await settingService.destroy(createdId);
        await settingService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

});
