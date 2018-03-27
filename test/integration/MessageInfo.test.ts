import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { MessageInfo } from '../../src/api/models/MessageInfo';

import { MessageInfoService } from '../../src/api/services/MessageInfoService';

describe('MessageInfo', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let messageInfoService: MessageInfoService;

    // let createdId;

    const testData = {
        address: '20 seventeen street, march city, 2017',
        memo: 'Please deliver by 17 March 2017'
    };

    const testDataUpdated = {
        address: '20 seventeen street, march city, 2017 UPDATED',
        memo: 'Please deliver by 17 March 2017 UPDATED'
    };

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        messageInfoService = app.IoC.getNamed<MessageInfoService>(Types.Service, Targets.Service.MessageInfoService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean([]);
    });

    afterAll(async () => {
        //
    });

    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await messageInfoService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });
/*
    test('Should create a new message info', async () => {
        // testData['related_id'] = 0;
        const messageInfoModel: MessageInfo = await messageInfoService.create(testData);
        createdId = messageInfoModel.Id;

        const result = messageInfoModel.toJSON();

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.address).toBe(testData.address);
        expect(result.memo).toBe(testData.memo);
    });

    test('Should throw ValidationException because we want to create a empty message info', async () => {
        expect.assertions(1);
        await messageInfoService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list message infos with our new create one', async () => {
        const messageInfoCollection = await messageInfoService.findAll();
        const messageInfo = messageInfoCollection.toJSON();
        expect(messageInfo.length).toBe(1);

        const result = messageInfo[0];

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.address).toBe(testData.address);
        expect(result.memo).toBe(testData.memo);
    });

    test('Should return one message info', async () => {
        const messageInfoModel: MessageInfo = await messageInfoService.findOne(createdId);
        const result = messageInfoModel.toJSON();

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.address).toBe(testData.address);
        expect(result.memo).toBe(testData.memo);
    });

    test('Should update the message info', async () => {
        // testDataUpdated['related_id'] = 0;
        const messageInfoModel: MessageInfo = await messageInfoService.update(createdId, testDataUpdated);
        const result = messageInfoModel.toJSON();

        // test the values
        // expect(result.value).toBe(testDataUpdated.value);
        expect(result.address).toBe(testDataUpdated.address);
        expect(result.memo).toBe(testDataUpdated.memo);
    });

    test('Should delete the message info', async () => {
        expect.assertions(1);
        await messageInfoService.destroy(createdId);
        await messageInfoService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });
*/
});
