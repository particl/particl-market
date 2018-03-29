import { app } from '../../../src/app';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { Types, Core, Targets } from '../../../src/constants';
import { TestUtil } from '../lib/TestUtil';

import { NotFoundException } from '../../../src/api/exceptions/NotFoundException';
import { ValidationException } from '../../../src/api/exceptions/ValidationException';

import { TestDataService } from '../../../src/api/services/TestDataService';
import { MarketService } from '../../../src/api/services/MarketService';
import { ListingItemService } from '../../../src/api/services/ListingItemService';

import { ListingItem } from '../../../src/api/models/ListingItem';
import { ListingItemCreateRequest } from '../../../src/api/requests/ListingItemCreateRequest';
import { TestDataCreateRequest } from '../../../src/api/requests/TestDataCreateRequest';
import { BidMessageType } from '../../../src/api/enums/BidMessageType';
import { BidMessage } from '../../../src/api/messages/BidMessage';

import * as bidSmsg1 from '../../testdata/message/smsgMessageWithListingItemMessage1.json';
import * as bidSmsg2 from '../../testdata/message/smsgMessageWithListingItemMessage2.json';
import * as bidSmsg3 from '../../testdata/message/smsgMessageWithListingItemMessage3.json';
import * as resources from 'resources';

describe('BidMessageProcessor', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    const testListingData = {
        hash: 'f08f3d6e',
        market_id: -1
    } as ListingItemCreateRequest;

    let testDataService: TestDataService;
    let bidMessageProcessor: BidMessageProcessor;
    let listingItemService: ListingItemService;
    let marketService: MarketService;

    let createdBidId;
    let createdListingItem;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.ListingItemService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.MarketService);
        bidMessageProcessor = app.IoC.getNamed<BidMessageProcessor>(Types.MessageProcessor, Targets.MessageProcessor.BidMessageProcessor);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();


        // listing-item
        const defaultMarket = await marketService.getDefault();
        createdListingItem = await testDataService.create<ListingItem>({
            model: 'listingitem',
            data: {
                market_id: defaultMarket.Id,
                hash: 'itemhash'
            } as any,
            withRelated: true
        } as TestDataCreateRequest);

    });

    afterAll(async () => {
        //
    });

    test('Should throw ValidationException because no action', async () => {
        expect.assertions(1);

        const testBidData = {
            listing: 'placeholderValueReplacedInBeforeAll()',
            objects: [{
                id: 'colour',
                value: 'black'
            }]
        } as BidMessage;

        const action: BidMessageType = testBidData.action;
        await bidMessageProcessor.process(testBidData).catch(e => {
            testBidData.action = action;
            expect(e).toEqual(new ValidationException('Message body is not valid', []));
        });
        testBidData.action = action;
    });

    test('Should throw ValidationException because no listing hash', async () => {
        expect.assertions(1);

        const testBidData = {
            action: BidMessageType.MPA_BID,
            listing: 'placeholderValueReplacedInBeforeAll()',
            objects: [{
                id: 'colour',
                value: 'black'
            }]
        } as BidMessage;

        const listing: string = testBidData.listing;
        delete testBidData.listing;
        await bidMessageProcessor.process(testBidData).catch(e => {
            testBidData.listing = listing;
            expect(e).toEqual(new ValidationException('Message body is not valid', []));
        });
        testBidData.listing = listing;
    });

    test('Should throw NotFoundException because invalid listing hash', async () => {
        expect.assertions(1);

        const testBidData = {
            action: BidMessageType.MPA_BID,
            listing: 'placeholderValueReplacedInBeforeAll()',
            objects: [{
                id: 'colour',
                value: 'black'
            }]
        } as BidMessage;

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

        const testBidData = {
            action: BidMessageType.MPA_BID,
            listing: createdListingItem.Hash,
            objects: [{
                id: 'colour',
                value: 'black'
            }]
        } as BidMessage;

        log.debug('testBidData: ', testBidData);
        // create bid
        const bidModel = await bidMessageProcessor.process(testBidData);
        const result = bidModel.toJSON();
        createdBidId = bidModel.Id;

        // test the values
        expect(result.action).toBe(testBidData.action);
        expect(result.listingItemId).toBe(createdListingItem.Id);
        expect(result.BidDatas.length).toBe(1);
        expect(result.BidDatas[0].dataId).toBe(testBidData.objects[0].id);
        expect(result.BidDatas[0].dataValue).toBe(testBidData.objects[0].value);
    });

});

