import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { MessageInfo } from '../../src/api/models/MessageInfo';
import { ActionMessage } from '../../src/api/models/ActionMessage';

import { MessageInfoService } from '../../src/api/services/MessageInfoService';
import { ActionMessageService } from '../../src/api/services/ActionMessageService';

import { MessageInfoCreateRequest } from '../../src/api/requests/MessageInfoCreateRequest';
import { MessageInfoUpdateRequest } from '../../src/api/requests/MessageInfoUpdateRequest';
import { MessageDataCreateRequest } from '../../src/api/requests/MessageDataCreateRequest';
import { MessageEscrowCreateRequest } from '../../src/api/requests/MessageEscrowCreateRequest';
import { ActionMessageCreateRequest } from '../../src/api/requests/ActionMessageCreateRequest';
import { GenerateListingItemParams } from '../../src/api/requests/params/GenerateListingItemParams';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { TestDataGenerateRequest } from '../../src/api/requests/TestDataGenerateRequest';


describe('MessageInfo', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let messageInfoService: MessageInfoService;
    let actionMessageService: ActionMessageService;

    let createdActionMessageId;
    let createdInfoData;

    const testData = {
        address: '20 seventeen street, march city, 2017',
        memo: 'Please deliver by 17 March 2017'
    } as MessageInfoCreateRequest;

    const testDataActionMessage = {
        action: 'MPA_LOCK',
        nonce: 'randomness',
        accepted: true,
        info: testData,
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

    const testDataUpdated = {
        address: '20 seventeen street, march city, 2017 UPDATED',
        memo: 'Please deliver by 17 March 2017 UPDATED'
    } as MessageInfoUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        messageInfoService = app.IoC.getNamed<MessageInfoService>(Types.Service, Targets.Service.MessageInfoService);
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

    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await messageInfoService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should throw ValidationException because we want to create a empty message info', async () => {
        expect.assertions(1);
        await messageInfoService.create({} as MessageInfoCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new message info', async () => {
        let actionMessageModel: ActionMessage = await actionMessageService.create(testDataActionMessage);

        actionMessageModel = actionMessageModel.toJSON();
        createdActionMessageId = actionMessageModel.id;
        const result: any = actionMessageModel.MessageInfo;
        createdInfoData = result;

        // MessageData
        expect(result.actionMessageId).toBe(createdActionMessageId);
        expect(result.address).toBe(testData.address);
        expect(result.memo).toBe(testData.memo);
    });

    test('Should list message infos with our new create one', async () => {
        const messageInfoCollection = await messageInfoService.findAll();
        const messageInfo = messageInfoCollection.toJSON();
        expect(messageInfo.length).toBe(1);

        const result = messageInfo[0];

        // test the values
        expect(result.actionMessageId).toBe(createdActionMessageId);
        expect(result.address).toBe(testData.address);
        expect(result.memo).toBe(testData.memo);
    });

    test('Should return one message info', async () => {
        const messageInfoModel: MessageInfo = await messageInfoService.findOne(createdInfoData.id);
        const result = messageInfoModel.toJSON();

        // test the values
        expect(result.actionMessageId).toBe(createdActionMessageId);
        expect(result.address).toBe(testData.address);
        expect(result.memo).toBe(testData.memo);
    });

    test('Should update the message info', async () => {
        const messageInfoModel: MessageInfo = await messageInfoService.update(createdInfoData.id, testDataUpdated);
        const result = messageInfoModel.toJSON();

        // test the values
        expect(result.actionMessageId).toBe(createdActionMessageId);
        expect(result.address).toBe(testDataUpdated.address);
        expect(result.memo).toBe(testDataUpdated.memo);
    });

    test('Should delete the message info', async () => {
        expect.assertions(2);
        await messageInfoService.destroy(createdInfoData.id);
        await messageInfoService.findOne(createdInfoData.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdInfoData.id))
        );

        await actionMessageService.destroy(createdActionMessageId);
        await actionMessageService.findOne(createdActionMessageId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdActionMessageId))
        );
    });
});
