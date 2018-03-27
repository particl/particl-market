import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { MessageEscrow } from '../../src/api/models/MessageEscrow';

import { MessageEscrowService } from '../../src/api/services/MessageEscrowService';

describe('MessageEscrow', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let messageEscrowService: MessageEscrowService;

    // let createdId;

    const testData = {
        rawtx: 'rawtx',
        type: 'refund'
    };

    const testDataUpdated = {
        rawtx: 'rawtx_UPDATED',
        type: 'refund_UPDATED'
    };

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        messageEscrowService = app.IoC.getNamed<MessageEscrowService>(Types.Service, Targets.Service.MessageEscrowService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean([]);
    });

    afterAll(async () => {
        //
    });

    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await messageEscrowService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

/*
    test('Should create a new message escrow', async () => {
        // testData['related_id'] = 0;
        const messageEscrowModel: MessageEscrow = await messageEscrowService.create(testData);
        createdId = messageEscrowModel.Id;

        const result = messageEscrowModel.toJSON();

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.type).toBe(testData.type);
        expect(result.rawtx).toBe(testData.rawtx);
    });

    test('Should throw ValidationException because we want to create a empty message escrow', async () => {
        expect.assertions(1);
        await messageEscrowService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list message escrows with our new create one', async () => {
        const messageEscrowCollection = await messageEscrowService.findAll();
        const messageEscrow = messageEscrowCollection.toJSON();
        expect(messageEscrow.length).toBe(1);

        const result = messageEscrow[0];

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.type).toBe(testData.type);
        expect(result.rawtx).toBe(testData.rawtx);
    });

    test('Should return one message escrow', async () => {
        const messageEscrowModel: MessageEscrow = await messageEscrowService.findOne(createdId);
        const result = messageEscrowModel.toJSON();

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.type).toBe(testData.type);
        expect(result.rawtx).toBe(testData.rawtx);
    });

    test('Should update the message escrow', async () => {
        // testDataUpdated['related_id'] = 0;
        const messageEscrowModel: MessageEscrow = await messageEscrowService.update(createdId, testDataUpdated);
        const result = messageEscrowModel.toJSON();

        // test the values
        // expect(result.value).toBe(testDataUpdated.value);
        expect(result.type).toBe(testDataUpdated.type);
        expect(result.rawtx).toBe(testDataUpdated.rawtx);
    });

    test('Should delete the message escrow', async () => {
        expect.assertions(1);
        await messageEscrowService.destroy(createdId);
        await messageEscrowService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });
*/
});
