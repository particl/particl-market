import { app } from '../../../src/app';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { Types, Core, Targets } from '../../../src/constants';
import { TestUtil } from '../lib/TestUtil';
import { TestDataService } from '../../../src/api/services/TestDataService';
import { MarketService } from '../../../src/api/services/MarketService';
import { NotFoundException } from '../../../src/api/exceptions/NotFoundException';
import { ValidationException } from '../../../src/api/exceptions/ValidationException';
import { ListingItem } from '../../../src/api/models/ListingItem';
import { ListingItemService } from '../../../src/api/services/ListingItemService';
import { BidMessageProcessor } from '../../../src/api/messageprocessors/BidMessageProcessor';
import { BidMessageType } from '../../../src/api/enums/BidMessageType';
import { BidMessage } from '../messages/BidMessage';

describe('BidMessageProcessor', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();
    const testBidData = {
        action: BidMessageType.MPA_BID,
        listing: 'placeholderValueReplacedInBeforeAll()',
        objects: [{
            id: 'colour',
            value: 'black'
        }]
    } as BidMessage;

    const testListingData = {
        hash: 'f08f3d6e',
        market_id: -1
    } as ListingItemCreateRequest;

    let testDataService: TestDataService;
    let bidMessageProcessor: BidMessageProcessor;
    let listingItemService: ListingItemService;
    let marketService: MarketService;
    let createdBidId;
    let createdHash;
    let listingItemModel;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.ListingItemService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.MarketService);

        bidMessageProcessor = app.IoC.getNamed<BidMessageProcessor>(Types.MessageProcessor, Targets.MessageProcessor.BidMessageProcessor);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean([]);

        // const listingItemModel: ListingItem = await listingItemService.create(testListingData);
        let defaultMarket = await marketService.getDefault(true).catch(e => {
            log.error('marketService.getDefault(): ' + e);
            throw e;
        });
        log.debug('defaultMarket: ' + JSON.stringify(defaultMarket));
        defaultMarket = defaultMarket.toJSON();
        testListingData.market_id = defaultMarket.id;
        listingItemModel = await testDataService.create({
            model: 'listingitem',
            data: testListingData,
            withRelated: true
        }).catch(e => {
            log.error('beforeAll(): ' + e);
        });
        // log.debug('listingItemModel = ' + JSON.stringify(listingItemModel));
        listingItemModel = listingItemModel.toJSON();
        createdHash = listingItemModel.hash;
        testBidData.listing = createdHash;
    });

    afterAll(async () => {
        //
    });

    /*
     * Uncomment when you can do parameter validation for message type objects in BidMessageProcessor
     */
    /* test('Should throw ValidationException because no action', async () => {
        expect.assertions(1);
        const action: BidMessageType = testBidData.action;
        delete testBidData.action;
        await bidMessageProcessor.process(testBidData).catch(e => {
            testBidData.action = action;
            expect(e).toEqual(new ValidationException('Request body is not valid', []));
        });
        testBidData.action = action;
    });

    test('Should throw ValidationException because no listing hash', async () => {
        expect.assertions(1);
        const listing: string = testBidData.listing;
        delete testBidData.listing;
        await bidMessageProcessor.process(testBidData).catch(e => {
            testBidData.listing = listing;
            expect(e).toEqual(new ValidationException('Request body is not valid', []));
        });
        testBidData.listing = listing;
    });*/

    test('Should throw NotFoundException because invalid listing hash', async () => {
        expect.assertions(1);
        const listing = testBidData.listing;
        const invalidListing = 'SomeInvalidHash';
        testBidData.listing = invalidListing;
        await bidMessageProcessor.process(testBidData).catch(e => {
            // log.error('A100: ' + e);
            testBidData.listing = listing;
            expect(e).toEqual(new NotFoundException(invalidListing));
        });
        testBidData.listing = listing;
    });

    /*
     * Uncomment when there's some kind of bid action validation.
     */
    /* test('Should throw NotFoundException because invalid bid action', async () => {
        expect.assertions(1);
        const action = testBidData.action;
        const invalidAction = 'SomeInvalidAction';
        testBidData.action = invalidAction;
        await bidMessageProcessor.process(testBidData).catch(e => {
            log.error('B100: ' + e);
            invalidAction.action = action;
            expect(e).toEqual(new SomeKindOfException(testBidData.listing));
        });
        testBidData.action = action;
    }); */

    test('Should create a new bid by bidMessage', async () => {
        log.error('testBidData.listing = ' + testBidData.listing);
        // create bid
        const bidModel = await bidMessageProcessor.process(testBidData);
        const result = bidModel.toJSON();
        createdBidId = bidModel.id;

        // test the values
        expect(result.action).toBe(BidMessageType.MPA_BID);
        expect(result.listingItemId).toBe(listingItemModel.id);
        expect(result.BidData.length).toBe(1);
        expect(result.BidData[0].dataId).toBe(testBidData.objects[0].id);
        expect(result.BidData[0].dataValue).toBe(testBidData.objects[0].value);
    });

});

