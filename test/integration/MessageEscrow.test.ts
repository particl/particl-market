import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { MessageEscrow } from '../../src/api/models/MessageEscrow';
import { ActionMessage } from '../../src/api/models/ActionMessage';

import { MessageEscrowService } from '../../src/api/services/MessageEscrowService';
import { ActionMessageService } from '../../src/api/services/ActionMessageService';

import { MessageInfoCreateRequest } from '../../src/api/requests/MessageInfoCreateRequest';
import { MessageDataCreateRequest } from '../../src/api/requests/MessageDataCreateRequest';
import { MessageEscrowCreateRequest } from '../../src/api/requests/MessageEscrowCreateRequest';
import { MessageEscrowUpdateRequest } from '../../src/api/requests/MessageEscrowUpdateRequest';
import { ActionMessageCreateRequest } from '../../src/api/requests/ActionMessageCreateRequest';
import { GenerateListingItemParams } from '../../src/api/requests/params/GenerateListingItemParams';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { TestDataGenerateRequest } from '../../src/api/requests/TestDataGenerateRequest';


describe('MessageEscrow', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let messageEscrowService: MessageEscrowService;
    let actionMessageService: ActionMessageService;

    let createdActionMessageId;
    let createdMessageData;

    const testData = {
        rawtx: 'rawtx',
        type: 'refund'
    } as MessageEscrowCreateRequest;

    const testDataActionMessage = {
        action: 'MPA_LOCK',
        nonce: 'randomness',
        accepted: true,
        info: {
            address: '20 seventeen street, march city, 2017',
            memo: 'Please deliver by 17 March 2017'
        } as MessageInfoCreateRequest,
        escrow: testData,
        data: {
            msgid: 'fdd0b25a000000007188f0fc4cd57a37aa5a9ab26463510568e99d7d',
            version: '0300',
            received: new Date(),
            sent: new Date(),
            from: 'piyLdJcTzR72DsYh2j5wPWUUmwURfczTR3',
            to: 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA'
        } as MessageDataCreateRequest,
        objects: []
    } as ActionMessageCreateRequest;

    const testDataUpdated = {
        rawtx: 'rawtx_UPDATED',
        type: 'refund_UPDATED'
    } as MessageEscrowUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        messageEscrowService = app.IoC.getNamed<MessageEscrowService>(Types.Service, Targets.Service.MessageEscrowService);
        actionMessageService = app.IoC.getNamed<ActionMessageService>(Types.Service, Targets.Service.ActionMessageService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        const generateParams = new GenerateListingItemParams().toParamsArray();
        const listingItems = await testDataService.generate({
            model: CreatableModel.LISTINGITEM,  // what to generate
            amount: 1,                          // how many to generate
            withRelated: true,                  // return model
            generateParams                      // what kind of data to generate
        } as TestDataGenerateRequest);

        testDataActionMessage.listing_item_id = listingItems[0].id;
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

    test('Should throw ValidationException because we want to create a empty message escrow', async () => {
        expect.assertions(1);
        await messageEscrowService.create({} as MessageEscrowCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new message escrow', async () => {
        let actionMessageModel: ActionMessage = await actionMessageService.create(testDataActionMessage);

        actionMessageModel = actionMessageModel.toJSON();
        createdActionMessageId = actionMessageModel.id;
        const result: any = actionMessageModel.MessageEscrow;
        createdMessageData = result;

        // MessageData
        expect(result.actionMessageId).toBe(createdActionMessageId);
        expect(result.type).toBe(testData.type);
        expect(result.rawtx).toBe(testData.rawtx);
    });

    test('Should list message escrows with our new create one', async () => {
        const messageEscrowCollection = await messageEscrowService.findAll();
        const messageEscrow = messageEscrowCollection.toJSON();
        expect(messageEscrow.length).toBe(1);

        const result = messageEscrow[0];

        // test the values
        expect(result.actionMessageId).toBe(createdActionMessageId);
        expect(result.type).toBe(testData.type);
        expect(result.rawtx).toBe(testData.rawtx);
    });

    test('Should return one message escrow', async () => {
        const messageEscrowModel: MessageEscrow = await messageEscrowService.findOne(createdMessageData.id);
        const result = messageEscrowModel.toJSON();

        // test the values
        expect(result.actionMessageId).toBe(createdActionMessageId);
        expect(result.type).toBe(testData.type);
        expect(result.rawtx).toBe(testData.rawtx);
    });

    test('Should update the message escrow', async () => {
        // testDataUpdated['related_id'] = 0;
        const messageEscrowModel: MessageEscrow = await messageEscrowService.update(createdMessageData.id, testDataUpdated);
        const result = messageEscrowModel.toJSON();

        // test the values
        expect(result.actionMessageId).toBe(createdActionMessageId);
        expect(result.type).toBe(testDataUpdated.type);
        expect(result.rawtx).toBe(testDataUpdated.rawtx);
    });

    test('Should delete the message escrow', async () => {
        expect.assertions(2);
        await messageEscrowService.destroy(createdMessageData.id);
        await messageEscrowService.findOne(createdMessageData.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdMessageData.id))
        );

        await actionMessageService.destroy(createdActionMessageId);
        await actionMessageService.findOne(createdActionMessageId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdActionMessageId))
        );
    });
});
