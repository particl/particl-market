import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { Bid } from '../../src/api/models/Bid';

import { BidService } from '../../src/api/services/BidService';
import { BidStatus } from '../../src/api/enums/BidStatus';

describe('Bid', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let bidService: BidService;

    let createdId;

    const testData = {
        status: BidStatus.ACTIVE,
        listing_item_id: null
    };

    const testDataUpdated = {
        status: BidStatus.CANCELLED,
        listing_item_id: null
    };

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        bidService = app.IoC.getNamed<BidService>(Types.Service, Targets.Service.BidService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean([], false);
    });

    afterAll(async () => {
        //
    });


    test('Should throw ValidationException because there is no listing_item_id', async () => {
        expect.assertions(1);
        await bidService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });


    test('Should create a new bid', async () => {
        testData['listing_item_id'] = 1;
        const bidModel: Bid = await bidService.create(testData);
        createdId = bidModel.Id;

        const result = bidModel.toJSON();

        // test the values
        expect(result.status).toBe(testData.status);
        expect(result.listingItemId).toBe(testData.listing_item_id);
    });

    test('Should throw ValidationException because we want to create a empty bid', async () => {
        expect.assertions(1);
        await bidService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list bids with our new create one', async () => {
        const bidCollection = await bidService.findAll();
        const bid = bidCollection.toJSON();
        expect(bid.length).toBe(1);

        const result = bid[0];

        // test the values
        expect(result.status).toBe(testData.status);
        expect(result.listingItemId).toBe(testData.listing_item_id);
    });

    test('Should return one bid', async () => {
        const bidModel: Bid = await bidService.findOne(createdId);
        const result = bidModel.toJSON();

        // test the values
        expect(result.status).toBe(testData.status);
        expect(result.listingItemId).toBe(testData.listing_item_id);
    });


    test('Should throw ValidationException because there is no listing_item_id', async () => {
        await bidService.update(createdId, testDataUpdated).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });


    test('Should update the bid', async () => {
        testDataUpdated['listing_item_id'] = 1;
        testDataUpdated['status'] = BidStatus.CANCELLED;
        const bidModel: Bid = await bidService.update(createdId, testDataUpdated);
        const result = bidModel.toJSON();

        // test the values
        expect(result.status).toBe(testDataUpdated.status);
        expect(result.listingItemId).toBe(testDataUpdated.listing_item_id);
    });

    test('Should delete the bid', async () => {
        expect.assertions(1);
        await bidService.destroy(createdId);
        await bidService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

});
