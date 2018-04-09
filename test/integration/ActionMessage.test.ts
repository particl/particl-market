import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { ActionMessage } from '../../src/api/models/ActionMessage';

import { ActionMessageService } from '../../src/api/services/ActionMessageService';
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

    let createdListingItem;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
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
        createdListingItem = listingItems[0];

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

        testData.listing_item_id = createdListingItem.id;

        const actionMessageModel: ActionMessage = await actionMessageService.create(testData);
        const result = actionMessageModel.toJSON();

        // test the values
        expect(result.action).toBe(testData.action);
        expect(result.nonce).toBe(testData.nonce);
        expect(result.accepted).toBe(1); // TODO: fix, boolean received as number

    });

    // TODO: fix
/*
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

    test('Should delete the action message', async () => {
        expect.assertions(1);
        await actionMessageService.destroy(createdId);
        await actionMessageService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });
*/

});
