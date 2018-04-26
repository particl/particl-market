import { app } from '../../src/app';

import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { ActionMessage } from '../../src/api/models/ActionMessage';

import { ActionMessageService } from '../../src/api/services/ActionMessageService';
import { MessageInfoService } from '../../src/api/services/MessageInfoService';
import { MessageEscrowService } from '../../src/api/services/MessageEscrowService';
import { MessageDataService } from '../../src/api/services/MessageDataService';

import { ActionMessageCreateRequest } from '../../src/api/requests/ActionMessageCreateRequest';
import { MessageInfoCreateRequest } from '../../src/api/requests/MessageInfoCreateRequest';
import { MessageEscrowCreateRequest } from '../../src/api/requests/MessageEscrowCreateRequest';
import { MessageDataCreateRequest } from '../../src/api/requests/MessageDataCreateRequest';
import { GenerateListingItemParams } from '../../src/api/requests/params/GenerateListingItemParams';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { TestDataGenerateRequest } from '../../src/api/requests/TestDataGenerateRequest';
import { MessageObjectCreateRequest } from '../../src/api/requests/MessageObjectCreateRequest';

describe('ActionMessage', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let actionMessageService: ActionMessageService;
    let messageInfoService: MessageInfoService;
    let messageEscrowService: MessageEscrowService;
    let messageDataService: MessageDataService;

    // TODO: create test data
    const testData = {
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
        objects: [{
            dataId: 'colour',
            dataValue: 'black'
        } as MessageObjectCreateRequest, {
            dataId: 'size',
            dataValue: 'XL'
        } as MessageObjectCreateRequest
        ]
    } as ActionMessageCreateRequest;

    let createdActionMessage;
    let createdListingItem;
    let startNumActionMessages;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        log.debug('========================================');
        log.debug('app bootstrap done');
        log.debug('========================================');

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        actionMessageService = app.IoC.getNamed<ActionMessageService>(Types.Service, Targets.Service.ActionMessageService);
        messageInfoService = app.IoC.getNamed<MessageInfoService>(Types.Service, Targets.Service.MessageInfoService);
        messageEscrowService = app.IoC.getNamed<MessageEscrowService>(Types.Service, Targets.Service.MessageEscrowService);
        messageDataService = app.IoC.getNamed<MessageDataService>(Types.Service, Targets.Service.MessageDataService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        const generateParams = new GenerateListingItemParams([
            true,   // generateItemInformation
            true,   // generateShippingDestinations
            false,   // generateItemImages
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
        // createdListingItem = listingItems[0].toJSON();
        createdListingItem = listingItems[0];
        const actionMessageCollection = await actionMessageService.findAll();
        const actionMessage = actionMessageCollection.toJSON();
        startNumActionMessages = actionMessage.length;
    });

    afterAll(async () => {
        //
    });


    test('Should create a new action message', async () => {

        testData.listing_item_id = createdListingItem.id;

        const actionMessageModel: ActionMessage = await actionMessageService.create(testData);
        const result = actionMessageModel.toJSON();
        createdActionMessage = result;
        // test the values
        expect(result.action).toBe(testData.action);
        expect(result.nonce).toBe(testData.nonce);
        expect(Boolean(Number(result.accepted))).toBe(testData.accepted); // TODO: fix, boolean received as number
        expect(result.createdAt).toBeDefined();
        expect(result.updatedAt).toBeDefined();
        expect(result.listingItemId).toBe(createdListingItem.id);

        // MessageData
        expect(result.MessageData.actionMessageId).toBe(createdActionMessage.id);
        expect(result.MessageData.createdAt).toBeDefined();
        expect(result.MessageData.updatedAt).toBeDefined();
        expect(result.MessageData.from).toBe(testData.data.from);
        expect(result.MessageData.msgid).toBe(testData.data.msgid);
        expect(result.MessageData.received).toBeDefined();
        expect(result.MessageData.sent).toBeDefined();
        expect(result.MessageData.to).toBe(testData.data.to);
        expect(result.MessageData.version).toBe(testData.data.version);

        // MessageEscrow
        expect(result.MessageEscrow.actionMessageId).toBe(createdActionMessage.id);
        expect(result.MessageEscrow.createdAt).toBeDefined();
        expect(result.MessageEscrow.updatedAt).toBeDefined();
        expect(result.MessageEscrow.rawtx).toBe(testData.escrow.rawtx);
        expect(result.MessageEscrow.type).toBe(testData.escrow.type);

        // MessageInfo
        expect(result.MessageInfo.actionMessageId).toBe(createdActionMessage.id);
        expect(result.MessageInfo.createdAt).toBeDefined();
        expect(result.MessageInfo.updatedAt).toBeDefined();
        expect(result.MessageInfo.address).toBe(testData.info.address);
        expect(result.MessageInfo.memo).toBe(testData.info.memo);

        // MessageObjects
        expect(result.MessageObjects[0].actionMessageId).toBe(createdActionMessage.id);
        expect(result.MessageObjects[0].createdAt).toBeDefined();
        expect(result.MessageObjects[0].updatedAt).toBeDefined();
        expect(result.MessageObjects[0].dataId).toBe(testData.objects[0].dataId);
        expect(result.MessageObjects[0].dataValue).toBe(testData.objects[0].dataValue);

        expect(result.MessageObjects[1].actionMessageId).toBe(createdActionMessage.id);
        expect(result.MessageObjects[1].createdAt).toBeDefined();
        expect(result.MessageObjects[1].updatedAt).toBeDefined();
        expect(result.MessageObjects[1].dataId).toBe(testData.objects[1].dataId);
        expect(result.MessageObjects[1].dataValue).toBe(testData.objects[1].dataValue);
    });

    test('Should throw ValidationException because we want to create a empty action message', async () => {

        expect.assertions(1);
        await actionMessageService.create({} as ActionMessageCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list action messages with our new create one', async () => {

        const actionMessageCollection = await actionMessageService.findAll();
        const actionMessage = actionMessageCollection.toJSON();
        expect(actionMessage.length).toBe(startNumActionMessages + 1);

        const result = actionMessage[startNumActionMessages];

        // test the values
        expect(result.action).toBe(testData.action);
        expect(result.nonce).toBe(testData.nonce);
        expect(Boolean(Number(result.accepted))).toBe(testData.accepted); // TODO: fix, boolean received as number
        expect(result.createdAt).toBeDefined();
        expect(result.updatedAt).toBeDefined();
        expect(result.listingItemId).toBe(createdListingItem.id);
    });

    test('Should return one action message', async () => {

        const actionMessageModel: ActionMessage = await actionMessageService.findOne(createdActionMessage.id);
        const result = actionMessageModel.toJSON();

        // test the values
        expect(result.action).toBe(testData.action);
        expect(result.nonce).toBe(testData.nonce);
        expect(Boolean(Number(result.accepted))).toBe(testData.accepted); // TODO: fix, boolean received as number
        expect(result.createdAt).toBeDefined();
        expect(result.updatedAt).toBeDefined();
        expect(result.listingItemId).toBe(createdListingItem.id);

        // MessageData
        expect(result.MessageData.actionMessageId).toBe(createdActionMessage.id);
        expect(result.MessageData.createdAt).toBeDefined();
        expect(result.MessageData.updatedAt).toBeDefined();
        expect(result.MessageData.from).toBe(testData.data.from);
        expect(result.MessageData.msgid).toBe(testData.data.msgid);
        expect(result.MessageData.received).toBeDefined();
        expect(result.MessageData.sent).toBeDefined();
        expect(result.MessageData.to).toBe(testData.data.to);
        expect(result.MessageData.version).toBe(testData.data.version);

        // MessageEscrow
        expect(result.MessageEscrow.actionMessageId).toBe(createdActionMessage.id);
        expect(result.MessageEscrow.createdAt).toBeDefined();
        expect(result.MessageEscrow.updatedAt).toBeDefined();
        expect(result.MessageEscrow.rawtx).toBe(testData.escrow.rawtx);
        expect(result.MessageEscrow.type).toBe(testData.escrow.type);

        // MessageInfo
        expect(result.MessageInfo.actionMessageId).toBe(createdActionMessage.id);
        expect(result.MessageInfo.createdAt).toBeDefined();
        expect(result.MessageInfo.updatedAt).toBeDefined();
        expect(result.MessageInfo.address).toBe(testData.info.address);
        expect(result.MessageInfo.memo).toBe(testData.info.memo);

        // MessageObjects
        expect(result.MessageObjects[0].actionMessageId).toBe(createdActionMessage.id);
        expect(result.MessageObjects[0].createdAt).toBeDefined();
        expect(result.MessageObjects[0].updatedAt).toBeDefined();
        expect(result.MessageObjects[0].dataId).toBe(testData.objects[0].dataId);
        expect(result.MessageObjects[0].dataValue).toBe(testData.objects[0].dataValue);

        expect(result.MessageObjects[1].actionMessageId).toBe(createdActionMessage.id);
        expect(result.MessageObjects[1].createdAt).toBeDefined();
        expect(result.MessageObjects[1].updatedAt).toBeDefined();
        expect(result.MessageObjects[1].dataId).toBe(testData.objects[1].dataId);
        expect(result.MessageObjects[1].dataValue).toBe(testData.objects[1].dataValue);
    });
    /*
        test('Should throw ValidationException because there is no related_id', async () => {
            expect.assertions(1);
            await actionMessageService.update(createdId, testDataUpdated).catch(e =>
                expect(e).toEqual(new ValidationException('Request body is not valid', []))
            );
        });

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
    */
    test('Should delete the action message', async () => {
        expect.assertions(5);
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

        // MessageObjects
        await messageDataService.findOne(createdActionMessage.MessageObjects[0].id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdActionMessage.MessageObjects[0].id))
        );
    });


    test('Should create a new action message with empty objects', async () => {
        expect.assertions(30);

        testData.listing_item_id = createdListingItem.id;
        testData.objects = [];
        const actionMessageModel: ActionMessage = await actionMessageService.create(testData);
        const result = actionMessageModel.toJSON();
        createdActionMessage = result;
        // test the values
        expect(result.action).toBe(testData.action);
        expect(result.nonce).toBe(testData.nonce);
        expect(Boolean(Number(result.accepted))).toBe(testData.accepted); // TODO: fix, boolean received as number
        expect(result.createdAt).toBeDefined();
        expect(result.updatedAt).toBeDefined();
        expect(result.listingItemId).toBe(createdListingItem.id);

        // MessageData
        expect(result.MessageData.actionMessageId).toBe(createdActionMessage.id);
        expect(result.MessageData.createdAt).toBeDefined();
        expect(result.MessageData.updatedAt).toBeDefined();
        expect(result.MessageData.from).toBe(testData.data.from);
        expect(result.MessageData.msgid).toBe(testData.data.msgid);
        expect(result.MessageData.received).toBeDefined();
        expect(result.MessageData.sent).toBeDefined();
        expect(result.MessageData.to).toBe(testData.data.to);
        expect(result.MessageData.version).toBe(testData.data.version);

        // MessageEscrow
        expect(result.MessageEscrow.actionMessageId).toBe(createdActionMessage.id);
        expect(result.MessageEscrow.createdAt).toBeDefined();
        expect(result.MessageEscrow.updatedAt).toBeDefined();
        expect(result.MessageEscrow.rawtx).toBe(testData.escrow.rawtx);
        expect(result.MessageEscrow.type).toBe(testData.escrow.type);

        // MessageInfo
        expect(result.MessageInfo.actionMessageId).toBe(createdActionMessage.id);
        expect(result.MessageInfo.createdAt).toBeDefined();
        expect(result.MessageInfo.updatedAt).toBeDefined();
        expect(result.MessageInfo.address).toBe(testData.info.address);
        expect(result.MessageInfo.memo).toBe(testData.info.memo);

        // MessageObjects
        expect(result.MessageObjects).toHaveLength(0);

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
