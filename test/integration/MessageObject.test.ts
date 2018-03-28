import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { MessageObject } from '../../src/api/models/MessageObject';
import { ActionMessage } from '../../src/api/models/ActionMessage';

import { ActionMessageService } from '../../src/api/services/ActionMessageService';
import { MessageInfoService } from '../../src/api/services/MessageInfoService';
import { MessageEscrowService } from '../../src/api/services/MessageEscrowService';
import { MessageDataService } from '../../src/api/services/MessageDataService';
import { MessageObjectService } from '../../src/api/services/MessageObjectService';

import { MessageInfoCreateRequest } from '../../src/api/requests/MessageInfoCreateRequest';
import { MessageDataCreateRequest } from '../../src/api/requests/MessageDataCreateRequest';
import { MessageEscrowCreateRequest } from '../../src/api/requests/MessageEscrowCreateRequest';
import { ActionMessageCreateRequest } from '../../src/api/requests/ActionMessageCreateRequest';
import { GenerateListingItemParams } from '../../src/api/requests/params/GenerateListingItemParams';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { TestDataGenerateRequest } from '../../src/api/requests/TestDataGenerateRequest';

import { MessageObjectCreateRequest } from '../../src/api/requests/MessageObjectCreateRequest';
import { MessageObjectUpdateRequest } from '../../src/api/requests/MessageObjectUpdateRequest';

describe('MessageObject', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let actionMessageService: ActionMessageService;
    let messageInfoService: MessageInfoService;
    let messageEscrowService: MessageEscrowService;
    let messageDataService: MessageDataService;
    let messageObjectService: MessageObjectService;

    let createdId;
    let createdActionMessage;

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

    const testData = {
        dataId: 'colour',
        dataValue: 'black'
    } as MessageObjectCreateRequest;

    const testDataUpdated = {
        dataId: 'size',
        dataValue: 'XL'
    } as MessageObjectUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        actionMessageService = app.IoC.getNamed<ActionMessageService>(Types.Service, Targets.Service.ActionMessageService);
        messageInfoService = app.IoC.getNamed<MessageInfoService>(Types.Service, Targets.Service.MessageInfoService);
        messageEscrowService = app.IoC.getNamed<MessageEscrowService>(Types.Service, Targets.Service.MessageEscrowService);
        messageDataService = app.IoC.getNamed<MessageDataService>(Types.Service, Targets.Service.MessageDataService);
        messageObjectService = app.IoC.getNamed<MessageObjectService>(Types.Service, Targets.Service.MessageObjectService);

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

        let actionMessageModel: ActionMessage = await actionMessageService.create(testDataActionMessage);

        actionMessageModel = actionMessageModel.toJSON();
        createdActionMessage = actionMessageModel;
    });

    afterAll(async () => {
        //
    });

    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await messageObjectService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new message object', async () => {
        testData.action_message_id = createdActionMessage.id;
        const messageObjectModel: MessageObject = await messageObjectService.create(testData);
        createdId = messageObjectModel.Id;

        const result = messageObjectModel.toJSON();

        // test the values
        expect(result.dataId).toBe(testData.dataId);
        expect(result.dataValue).toBe(testData.dataValue);
    });

    test('Should throw ValidationException because we want to create a empty message object', async () => {
        expect.assertions(1);
        await messageObjectService.create({} as MessageObjectCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list message objects with our new create one', async () => {
        const messageObjectCollection = await messageObjectService.findAll();
        const messageObject = messageObjectCollection.toJSON();
        expect(messageObject.length).toBe(1);

        const result = messageObject[0];

        // test the values
        expect(result.dataId).toBe(testData.dataId);
        expect(result.dataValue).toBe(testData.dataValue);
    });

    test('Should return one message object', async () => {
        const messageObjectModel: MessageObject = await messageObjectService.findOne(createdId);
        const result = messageObjectModel.toJSON();

        // test the values
        expect(result.dataId).toBe(testData.dataId);
        expect(result.dataValue).toBe(testData.dataValue);
    });

    test('Should update the message object', async () => {
        const messageObjectModel: MessageObject = await messageObjectService.update(createdId, testDataUpdated);
        const result = messageObjectModel.toJSON();

        // test the values
        // expect(result.value).toBe(testDataUpdated.value);
        expect(result.dataId).toBe(testDataUpdated.dataId);
        expect(result.dataValue).toBe(testDataUpdated.dataValue);
    });

    test('Should delete the message object', async () => {
        expect.assertions(5);
        await messageObjectService.destroy(createdId);
        await messageObjectService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );

        // delete
        await actionMessageService.destroy(createdActionMessage.id);
        await actionMessageService.findOne(createdActionMessage.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdActionMessage.id))
        );

        // MessageInfo
        await messageInfoService.findOne(createdActionMessage.MessageInfo.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdActionMessage.MessageInfo.id))
        );

        // MessageEscrow
        await messageEscrowService.findOne(createdActionMessage.MessageEscrow.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdActionMessage.MessageEscrow.id))
        );

        // MessageData
        await messageDataService.findOne(createdActionMessage.MessageData.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdActionMessage.MessageData.id))
        );
    });

});
