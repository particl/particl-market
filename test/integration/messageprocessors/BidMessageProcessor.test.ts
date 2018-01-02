import { app } from '../../../src/app';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { Types, Core, Targets } from '../../../src/constants';
import { TestUtil } from '../lib/TestUtil';
import { TestDataService } from '../../../src/api/services/TestDataService';
import { NotFoundException } from '../../../src/api/exceptions/NotFoundException';
import { ListingItem } from '../../../src/api/models/ListingItem';
import { ListingItemService } from '../../../src/api/services/ListingItemService';
import { BidMessageProcessor } from '../../../src/api/messageprocessors/BidMessageProcessor';
import { BidStatus } from '../../../src/api/enums/BidStatus';

describe('BidMessageProcessor', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();
    const testBidData = {
        action: 'MPA_BID',
        item: '',
        objects: [{
           id: 'colour',
           value: 'black'
        }]
    };

    const testListingData = {
       hash: 'f08f3d6e'
    };

    let testDataService: TestDataService;
    let bidMessageProcessor: BidMessageProcessor;
    let listingItemService: ListingItemService;
    let createdBidId;
    let createdHash;


    beforeAll(async () => {

        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.ListingItemService);

        bidMessageProcessor = app.IoC.getNamed<BidMessageProcessor>(Types.MessageProcessor, Targets.MessageProcessor.BidMessageProcessor);
        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean([], false);
    });

    afterAll(async () => {
        //
    });

    test('Should throw NotFoundException because invalid listing hash', async () => {
        expect.assertions(1);
        await bidMessageProcessor.process(testBidData).catch(e =>
            expect(e).toEqual(new NotFoundException(testBidData.item))
        );
    });

    test('Should create a new bid by bidMessage', async () => {
        // create the listingItem
        const listingItemModel: ListingItem = await listingItemService.create(testListingData);
        createdHash = listingItemModel.Hash;
        testBidData.item = createdHash;

        // create bid
        const bidModel = await bidMessageProcessor.process(testBidData);
        const result = bidModel.toJSON();
        createdBidId = bidModel.id;

        // test the values
        expect(result.status).toBe(BidStatus.ACTIVE);
        expect(result.listingItemId).toBe(listingItemModel.id);
        expect(result.BidData.length).toBe(1);
        expect(result.BidData[0].dataId).toBe(testBidData.objects[0].id);
        expect(result.BidData[0].dataValue).toBe(testBidData.objects[0].value);
    });

});
