import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { MessageValue } from '../../src/api/models/MessageValue';

import { MessageValueService } from '../../src/api/services/MessageValueService';

describe('MessageValue', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let messageValueService: MessageValueService;

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
        messageValueService = app.IoC.getNamed<MessageValueService>(Types.Service, Targets.Service.MessageValueService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();
    });

    afterAll(async () => {
        //
    });

    /*
    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await messageValueService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });
    */

    test('Should create a new message value', async () => {
        // testData['related_id'] = 0;
        const messageValueModel: MessageValue = await messageValueService.create(testData);
        createdId = messageValueModel.Id;

        const result = messageValueModel.toJSON();

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.key).toBe(testData.key);
        expect(result.value).toBe(testData.value);
    });

    test('Should throw ValidationException because we want to create a empty message value', async () => {
        expect.assertions(1);
        await messageValueService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list message values with our new create one', async () => {
        const messageValueCollection = await messageValueService.findAll();
        const messageValue = messageValueCollection.toJSON();
        expect(messageValue.length).toBe(1);

        const result = messageValue[0];

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.key).toBe(testData.key);
        expect(result.value).toBe(testData.value);
    });

    test('Should return one message value', async () => {
        const messageValueModel: MessageValue = await messageValueService.findOne(createdId);
        const result = messageValueModel.toJSON();

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.key).toBe(testData.key);
        expect(result.value).toBe(testData.value);
    });

    /*
    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await messageValueService.update(createdId, testDataUpdated).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });
    */

    test('Should update the message value', async () => {
        // testDataUpdated['related_id'] = 0;
        const messageValueModel: MessageValue = await messageValueService.update(createdId, testDataUpdated);
        const result = messageValueModel.toJSON();

        // test the values
        // expect(result.value).toBe(testDataUpdated.value);
        expect(result.key).toBe(testDataUpdated.key);
        expect(result.value).toBe(testDataUpdated.value);
    });

    test('Should delete the message value', async () => {
        expect.assertions(1);
        await messageValueService.destroy(createdId);
        await messageValueService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

});
