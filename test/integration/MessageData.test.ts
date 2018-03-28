import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { MessageData } from '../../src/api/models/MessageData';
import { ActionMessage } from '../../src/api/models/ActionMessage';

import { MessageDataService } from '../../src/api/services/MessageDataService';
import { ActionMessageCreateRequest } from '../../src/api/requests/ActionMessageCreateRequest';
import { MessageDataCreateRequest } from '../../src/api/requests/MessageDataCreateRequest';
import { MessageDataUpdateRequest } from '../../src/api/requests/MessageDataUpdateRequest';
import { GenerateListingItemParams } from '../../src/api/requests/params/GenerateListingItemParams';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { TestDataGenerateRequest } from '../../src/api/requests/TestDataGenerateRequest';
import { MessageInfoCreateRequest } from '../../src/api/requests/MessageInfoCreateRequest';
import { MessageEscrowCreateRequest } from '../../src/api/requests/MessageEscrowCreateRequest';
import { MessageObjectCreateRequest } from '../../src/api/requests/MessageObjectCreateRequest';
import { ActionMessageService } from '../../src/api/services/ActionMessageService';


describe('MessageData', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let messageDataService: MessageDataService;
    let actionMessageService: ActionMessageService;

    let createdMessageData;
    let createdActionMessageId;

    const testData = {
        msgid: 'fdd0b25a000000007188f0fc4cd57a37aa5a9ab26463510568e99d7d',
        version: '0300',
        received: new Date(),
        sent: new Date(),
        from: 'piyLdJcTzR72DsYh2j5wPWUUmwURfczTR3',
        to: 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA'
    } as MessageDataCreateRequest;

    const testDataActionMessage = {
        action: 'MPA_LOCK',
        nonce: 'randomness',
        accepted: true,
        info: {
            address: '20 seventeen street, march city, 2017',
            memo: 'Please deliver by 17 March 2017'
        } as MessageInfoCreateRequest,
        escrow: {
            rawtx: 'rawtx',
            type: 'refund'
        } as MessageEscrowCreateRequest,
        data: testData,
        objects: []
    } as ActionMessageCreateRequest;


    const testDataUpdated = {
        msgid: 'fdd0b25a000000007188f0fc4cd57a37aa5a9ab26463510568e99d7d_UPDATED',
        version: '0300_UPDATED',
        received: new Date(),
        sent: new Date(),
        from: 'piyLdJcTzR72DsYh2j5wPWUUmwURfczTR3_UPDATED',
        to: 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA_UPDATED'
    } as MessageDataUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        messageDataService = app.IoC.getNamed<MessageDataService>(Types.Service, Targets.Service.MessageDataService);
        actionMessageService = app.IoC.getNamed<ActionMessageService>(Types.Service, Targets.Service.ActionMessageService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        const generateParams = new GenerateListingItemParams([
            true,   // generateItemInformation
            true,   // generateShippingDestinations
            true,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            true    // generateListingItemObjects
        ]).toParamsArray();

        // create listingitem without ShippingDestinations and store its id for testing
        const listingItems = await testDataService.generate({
            model: CreatableModel.LISTINGITEM,  // what to generate
            amount: 1,                          // how many to generate
            withRelated: true,                  // return model
            generateParams                      // what kind of data to generate
        } as TestDataGenerateRequest);
        const createdListingItem = listingItems[0].toJSON();

        // create actionMessage
        testDataActionMessage.listing_item_id = createdListingItem.id;
    });

    afterAll(async () => {
        //
    });


    test('Should create a new message data', async () => {
        let actionMessageModel: ActionMessage = await actionMessageService.create(testDataActionMessage);

        actionMessageModel = actionMessageModel.toJSON();
        createdActionMessageId = actionMessageModel.id;
        const result: any = actionMessageModel.MessageData;
        createdMessageData = result;

        // MessageData
        expect(result.actionMessageId).toBe(createdActionMessageId);
        expect(result.from).toBe(testData.from);
        expect(result.msgid).toBe(testData.msgid);
        expect(result.received).toBeDefined();
        expect(result.sent).toBeDefined();
        expect(result.to).toBe(testData.to);
        expect(result.version).toBe(testData.version);
    });

    test('Should throw ValidationException because we want to create a empty message data', async () => {
        expect.assertions(1);
        await messageDataService.create({} as MessageDataCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list message datas with our new create one', async () => {
        const messageDataCollection = await messageDataService.findAll();
        const messageData = messageDataCollection.toJSON();
        expect(messageData.length).toBe(1);

        const result = messageData[0];

        // test the values
        expect(result.actionMessageId).toBe(createdActionMessageId);
        expect(result.from).toBe(testData.from);
        expect(result.msgid).toBe(testData.msgid);
        expect(result.received).toBeDefined();
        expect(result.sent).toBeDefined();
        expect(result.to).toBe(testData.to);
        expect(result.version).toBe(testData.version);
    });

    test('Should return one message data', async () => {
        const messageDataModel: MessageData = await messageDataService.findOne(createdMessageData.id);
        const result = messageDataModel.toJSON();

        // test the values
        expect(result.actionMessageId).toBe(createdActionMessageId);
        expect(result.from).toBe(testData.from);
        expect(result.msgid).toBe(testData.msgid);
        expect(result.received).toBeDefined();
        expect(result.sent).toBeDefined();
        expect(result.to).toBe(testData.to);
        expect(result.version).toBe(testData.version);
    });

    test('Should update the message data', async () => {
        const messageDataModel: MessageData = await messageDataService.update(createdMessageData.id, testDataUpdated);
        const result = messageDataModel.toJSON();

        // test the values
        expect(result.actionMessageId).toBe(createdActionMessageId);
        expect(result.msgid).toBe(testDataUpdated.msgid);
        expect(result.version).toBe(testDataUpdated.version);
        expect(result.received).not.toBe(createdMessageData.received);
        expect(result.sent).not.toBe(createdMessageData.sent);
        expect(result.from).toBe(testDataUpdated.from);
        expect(result.to).toBe(testDataUpdated.to);
    });

    test('Should delete the message data', async () => {
        expect.assertions(2);
        await messageDataService.destroy(createdMessageData.id);
        await messageDataService.findOne(createdMessageData.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdMessageData.id))
        );

        await actionMessageService.destroy(createdActionMessageId);
        await actionMessageService.findOne(createdActionMessageId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdActionMessageId))
        );

    });
});
