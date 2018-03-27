import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { MessageData } from '../../src/api/models/MessageData';

import { MessageDataService } from '../../src/api/services/MessageDataService';

describe('MessageData', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let messageDataService: MessageDataService;

    // let createdId;

    const testData = {
        msgid: 'fdd0b25a000000007188f0fc4cd57a37aa5a9ab26463510568e99d7d',
        version: '0300',
        received: new Date(),
        sent: new Date(),
        from: 'piyLdJcTzR72DsYh2j5wPWUUmwURfczTR3',
        to: 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA'
    };

    const testDataUpdated = {
        msgid: 'fdd0b25a000000007188f0fc4cd57a37aa5a9ab26463510568e99d7d_UPDATED',
        version: '0300_UPDATED',
        received: new Date(),
        sent: new Date(),
        from: 'piyLdJcTzR72DsYh2j5wPWUUmwURfczTR3_UPDATED',
        to: 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA_UPDATED'
    };

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        messageDataService = app.IoC.getNamed<MessageDataService>(Types.Service, Targets.Service.MessageDataService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean([]);
    });

    afterAll(async () => {
        //
    });

    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await messageDataService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });
/*
    test('Should create a new message data', async () => {
        // testData['related_id'] = 0;
        const messageDataModel: MessageData = await messageDataService.create(testData);
        createdId = messageDataModel.Id;

        const result = messageDataModel.toJSON();

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.msgid).toBe(testData.msgid);
        expect(result.version).toBe(testData.version);
        expect(result.received).toBe(testData.received);
        expect(result.sent).toBe(testData.sent);
        expect(result.from).toBe(testData.from);
        expect(result.to).toBe(testData.to);
    });

    test('Should throw ValidationException because we want to create a empty message data', async () => {
        expect.assertions(1);
        await messageDataService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list message datas with our new create one', async () => {
        const messageDataCollection = await messageDataService.findAll();
        const messageData = messageDataCollection.toJSON();
        expect(messageData.length).toBe(1);

        const result = messageData[0];

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.msgid).toBe(testData.msgid);
        expect(result.version).toBe(testData.version);
        expect(result.received).toBe(testData.received);
        expect(result.sent).toBe(testData.sent);
        expect(result.from).toBe(testData.from);
        expect(result.to).toBe(testData.to);
    });

    test('Should return one message data', async () => {
        const messageDataModel: MessageData = await messageDataService.findOne(createdId);
        const result = messageDataModel.toJSON();

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.msgid).toBe(testData.msgid);
        expect(result.version).toBe(testData.version);
        expect(result.received).toBe(testData.received);
        expect(result.sent).toBe(testData.sent);
        expect(result.from).toBe(testData.from);
        expect(result.to).toBe(testData.to);
    });

    test('Should update the message data', async () => {
        // testDataUpdated['related_id'] = 0;
        const messageDataModel: MessageData = await messageDataService.update(createdId, testDataUpdated);
        const result = messageDataModel.toJSON();

        // test the values
        // expect(result.value).toBe(testDataUpdated.value);
        expect(result.msgid).toBe(testDataUpdated.msgid);
        expect(result.version).toBe(testDataUpdated.version);
        expect(result.received).toBe(testDataUpdated.received);
        expect(result.sent).toBe(testDataUpdated.sent);
        expect(result.from).toBe(testDataUpdated.from);
        expect(result.to).toBe(testDataUpdated.to);
    });

    test('Should delete the message data', async () => {
        expect.assertions(1);
        await messageDataService.destroy(createdId);
        await messageDataService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });
*/
});
