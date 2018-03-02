import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { FlaggedItem } from '../../src/api/models/FlaggedItem';

import { FlaggedItemService } from '../../src/api/services/FlaggedItemService';
import { GenerateListingItemParams } from '../../src/api/requests/params/GenerateListingItemParams';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { TestDataGenerateRequest } from '../../src/api/requests/TestDataGenerateRequest';
import { FlaggedItemCreateRequest } from '../../src/api/requests/FlaggedItemCreateRequest';
import { FlaggedItemUpdateRequest } from '../../src/api/requests/FlaggedItemUpdateRequest';

describe('FlaggedItem', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let flaggedItemService: FlaggedItemService;

    let createdId;

    const testData = {
        listingItemId: null;
    };

    const testDataUpdated = {
        listingItemId: null;
    };

    let createdListingItem;
    let createdListingItemSecond;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        flaggedItemService = app.IoC.getNamed<FlaggedItemService>(Types.Service, Targets.Service.FlaggedItemService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        const generateParams = new GenerateListingItemParams([
            false,   // generateItemInformation
            false,   // generateShippingDestinations
            false,   // generateItemImages
            false,   // generatePaymentInformation
            false,   // generateEscrow
            false,   // generateItemPrice
            false,   // generateMessagingInformation
            false    // generateListingItemObjects
        ]).toParamsArray();

        // generate listingitem
        const listingItems = await testDataService.generate({
            model: CreatableModel.LISTINGITEM,  // what to generate
            amount: 1,                          // how many to generate
            withRelated: true,                  // return model
            generateParams                      // what kind of data to generate
        } as TestDataGenerateRequest);
        createdListingItem = listingItems[0];

        // generate another listingitem
        const listingItemsTwo = await testDataService.generate({
            model: CreatableModel.LISTINGITEM,  // what to generate
            amount: 1,                          // how many to generate
            withRelated: true,                  // return model
            generateParams                      // what kind of data to generate
        } as TestDataGenerateRequest);
        createdListingItemSecond = listingItemsTwo[0];
    });

    afterAll(async () => {
        //
    });


    test('Should throw ValidationException because there is no listing_item_id', async () => {
        expect.assertions(1);
        await flaggedItemService.create(testData as FlaggedItemCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new flagged item', async () => {
        testData['listingItemId'] = createdListingItem.id;
        const flaggedItemModel: FlaggedItem = await flaggedItemService.create(testData as FlaggedItemCreateRequest);
        createdId = flaggedItemModel.Id;

        const result = flaggedItemModel.toJSON();

        // test the values
        expect(result.listingItemId).toBe(testData.listingItemId);
    });

    test('Should throw ValidationException because we want to create a empty flagged item', async () => {
        expect.assertions(1);
        await flaggedItemService.create({} as FlaggedItemCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list flagged items with our new create one', async () => {
        const flaggedItemCollection = await flaggedItemService.findAll();
        const flaggedItem = flaggedItemCollection.toJSON();
        expect(flaggedItem.length).toBe(1);

        const result = flaggedItem[0];

        // test the values
        expect(result.listingItemId).toBe(testData.listingItemId);
    });

    test('Should return one flagged item', async () => {
        const flaggedItemModel: FlaggedItem = await flaggedItemService.findOne(createdId);
        const result = flaggedItemModel.toJSON();

        // test the values
        expect(result.listingItemId).toBe(testData.listingItemId);
    });

    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await flaggedItemService.update(createdId, testDataUpdated as FlaggedItemUpdateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should update the flagged item', async () => {
        testDataUpdated['listingItemId'] = createdListingItem.id;
        const flaggedItemModel: FlaggedItem = await flaggedItemService.update(createdId, testDataUpdated as FlaggedItemUpdateRequest);
        const result = flaggedItemModel.toJSON();

        expect(result.listingItemId).toBe(testDataUpdated.listingItemId);
    });

    test('Should delete the flagged item', async () => {
        expect.assertions(1);
        await flaggedItemService.destroy(createdId);
        await flaggedItemService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

});
