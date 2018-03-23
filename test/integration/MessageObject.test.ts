import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { MessageObject } from '../../src/api/models/MessageObject';

import { MessageObjectService } from '../../src/api/services/MessageObjectService';

describe('MessageObject', () => {

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let messageObjectService: MessageObjectService;

    let createdId;

    const testData = {
        dataId: undefined, // TODO: Add test value
        dataValue: undefined // TODO: Add test value
    };

    const testDataUpdated = {
        dataId: undefined, // TODO: Add test value
        dataValue: undefined // TODO: Add test value
    };

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        messageObjectService = app.IoC.getNamed<MessageObjectService>(Types.Service, Targets.Service.MessageObjectService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean([]);
    });

    afterAll(async () => {
        //
    });

    /*
    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await messageObjectService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });
    */

    test('Should create a new message object', async () => {
        // testData['related_id'] = 0;
        const messageObjectModel: MessageObject = await messageObjectService.create(testData);
        createdId = messageObjectModel.Id;

        const result = messageObjectModel.toJSON();

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.dataId).toBe(testData.dataId);
        expect(result.dataValue).toBe(testData.dataValue);
    });

    test('Should throw ValidationException because we want to create a empty message object', async () => {
        expect.assertions(1);
        await messageObjectService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list message objects with our new create one', async () => {
        const messageObjectCollection = await messageObjectService.findAll();
        const messageObject = messageObjectCollection.toJSON();
        expect(messageObject.length).toBe(1);

        const result = messageObject[0];

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.dataId).toBe(testData.dataId);
        expect(result.dataValue).toBe(testData.dataValue);
    });

    test('Should return one message object', async () => {
        const messageObjectModel: MessageObject = await messageObjectService.findOne(createdId);
        const result = messageObjectModel.toJSON();

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.dataId).toBe(testData.dataId);
        expect(result.dataValue).toBe(testData.dataValue);
    });

    /*
    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await messageObjectService.update(createdId, testDataUpdated).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });
    */

    test('Should update the message object', async () => {
        // testDataUpdated['related_id'] = 0;
        const messageObjectModel: MessageObject = await messageObjectService.update(createdId, testDataUpdated);
        const result = messageObjectModel.toJSON();

        // test the values
        // expect(result.value).toBe(testDataUpdated.value);
        expect(result.dataId).toBe(testDataUpdated.dataId);
        expect(result.dataValue).toBe(testDataUpdated.dataValue);
    });

    test('Should delete the message object', async () => {
        expect.assertions(1);
        await messageObjectService.destroy(createdId);
        await messageObjectService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

});
