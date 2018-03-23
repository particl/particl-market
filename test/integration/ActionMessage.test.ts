import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { ActionMessage } from '../../src/api/models/ActionMessage';

import { ActionMessageService } from '../../src/api/services/ActionMessageService';

describe('ActionMessage', () => {

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let actionMessageService: ActionMessageService;

    let createdId;

    const testData = {
        action: undefined, // TODO: Add test value
        nonce: undefined, // TODO: Add test value
        accepted: undefined // TODO: Add test value
    };

    const testDataUpdated = {
        action: undefined, // TODO: Add test value
        nonce: undefined, // TODO: Add test value
        accepted: undefined // TODO: Add test value
    };

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        actionMessageService = app.IoC.getNamed<ActionMessageService>(Types.Service, Targets.Service.ActionMessageService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean([]);
    });

    afterAll(async () => {
        //
    });

    /*
    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await actionMessageService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });
    */

    test('Should create a new action message', async () => {
        // testData['related_id'] = 0;
        const actionMessageModel: ActionMessage = await actionMessageService.create(testData);
        createdId = actionMessageModel.Id;

        const result = actionMessageModel.toJSON();

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.action).toBe(testData.action);
        expect(result.nonce).toBe(testData.nonce);
        expect(result.accepted).toBe(testData.accepted);
    });

    test('Should throw ValidationException because we want to create a empty action message', async () => {
        expect.assertions(1);
        await actionMessageService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list action messages with our new create one', async () => {
        const actionMessageCollection = await actionMessageService.findAll();
        const actionMessage = actionMessageCollection.toJSON();
        expect(actionMessage.length).toBe(1);

        const result = actionMessage[0];

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.action).toBe(testData.action);
        expect(result.nonce).toBe(testData.nonce);
        expect(result.accepted).toBe(testData.accepted);
    });

    test('Should return one action message', async () => {
        const actionMessageModel: ActionMessage = await actionMessageService.findOne(createdId);
        const result = actionMessageModel.toJSON();

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.action).toBe(testData.action);
        expect(result.nonce).toBe(testData.nonce);
        expect(result.accepted).toBe(testData.accepted);
    });

    /*
    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await actionMessageService.update(createdId, testDataUpdated).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });
    */

    test('Should update the action message', async () => {
        // testDataUpdated['related_id'] = 0;
        const actionMessageModel: ActionMessage = await actionMessageService.update(createdId, testDataUpdated);
        const result = actionMessageModel.toJSON();

        // test the values
        // expect(result.value).toBe(testDataUpdated.value);
        expect(result.action).toBe(testDataUpdated.action);
        expect(result.nonce).toBe(testDataUpdated.nonce);
        expect(result.accepted).toBe(testDataUpdated.accepted);
    });

    test('Should delete the action message', async () => {
        expect.assertions(1);
        await actionMessageService.destroy(createdId);
        await actionMessageService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

});
