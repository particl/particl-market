import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';

import { TestDataService } from '../../src/api/services/TestDataService';
import { BidService } from '../../src/api/services/BidService';
import { MarketService } from '../../src/api/services/MarketService';
import { ListingItemService } from '../../src/api/services/ListingItemService';
import { BidDataService } from '../../src/api/services/BidDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { Bid } from '../../src/api/models/Bid';
import { ListingItem } from '../../src/api/models/ListingItem';

import { BidMessageType } from '../../src/api/enums/BidMessageType';
// import { Country } from '../../src/api/enums/Country';

import { TestDataCreateRequest } from '../../src/api/requests/TestDataCreateRequest';
import { ListingItemCreateRequest } from '../../src/api/requests/ListingItemCreateRequest';
import { BidCreateRequest } from '../../src/api/requests/BidCreateRequest';
import { BidUpdateRequest } from '../../src/api/requests/BidUpdateRequest';
import { GenerateListingItemParams } from '../../src/api/requests/params/GenerateListingItemParams';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { TestDataGenerateRequest } from '../../src/api/requests/TestDataGenerateRequest';

describe('Bid', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let bidService: BidService;
    let marketService: MarketService;
    let bidDataService: BidDataService;
    let listingItemService: ListingItemService;

    let createdBidId;
    let createdListingItem;

    const testData = {
        action: BidMessageType.MPA_BID,
        listing_item_id: null,
        bidder: 'bidderaddress',
        bidDatas: [{
            dataId: 'COLOR',
            dataValue: 'RED'
        }, {
            dataId: 'COLOR',
            dataValue: 'GREEN'
        }]
    } as BidCreateRequest;

    const testDataUpdated = {
        action: BidMessageType.MPA_CANCEL,
        bidder: 'bidderaddress',
        listing_item_id: null
    } as BidUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        bidService = app.IoC.getNamed<BidService>(Types.Service, Targets.Service.BidService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.MarketService);
        bidDataService = app.IoC.getNamed<BidDataService>(Types.Service, Targets.Service.BidDataService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.ListingItemService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();


        let defaultMarket = await marketService.getDefault();
        defaultMarket = defaultMarket.toJSON();

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

        // create listingitem without images and store its id for testing
        const listingItems = await testDataService.generate({
            model: CreatableModel.LISTINGITEM,  // what to generate
            amount: 1,                          // how many to generate
            withRelated: true,                  // return model
            generateParams                      // what kind of data to generate
        } as TestDataGenerateRequest);
        createdListingItem = listingItems[0].toJSON();
    });

    afterAll(async () => {
        //
    });

    test('Should throw ValidationException because listing_item_id is null', async () => {
        expect.assertions(1);
        await bidService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new bid', async () => {
        // set listing item id with bid
        testData.listing_item_id = createdListingItem.id;

        log.debug('testData:', testData);
        const bidModel: Bid = await bidService.create(testData);
        createdBidId = bidModel.Id;
        const result = bidModel.toJSON();
        // test the values
        expect(result.action).toBe(testData.action);
        expect(result.bidder).toBe(testData.bidder);
        expect(result.listingItemId).toBe(testData.listing_item_id);
    });

    test('Should throw ValidationException because we want to create a empty bid', async () => {
        expect.assertions(1);
        await bidService.create({} as BidCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list bids with our new create one', async () => {
        const bidCollection = await bidService.findAll();
        const bid = bidCollection.toJSON();
        expect(bid.length).toBe(1);
        const result = bid[0];
        // test the values
        expect(result.action).toBe(testData.action);
        expect(result.bidder).toBe(testData.bidder);
        expect(result.listingItemId).toBe(testData.listing_item_id); // TODO: why is there listingItemId?
    });

    test('Should return one bid', async () => {
        const bidModel: Bid = await bidService.findOne(createdBidId, true);
        const result = bidModel.toJSON();
        // test the values
        expect(result.action).toBe(testData.action);
        expect(result.bidder).toBe(testData.bidder);
        expect(result.listingItemId).toBe(testData.listing_item_id);
        expect(result.BidDatas.length).toBe(2);
    });

    test('Should throw ValidationException because there is no listing_item_id', async () => {
        await bidService.update(createdBidId, {
            action: BidMessageType.MPA_CANCEL
        } as BidUpdateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should update the bid', async () => {
        testDataUpdated.listing_item_id = createdListingItem.id;
        testDataUpdated.action = BidMessageType.MPA_CANCEL;
        const bidModel: Bid = await bidService.update(createdBidId, testDataUpdated as BidUpdateRequest);
        const result = bidModel.toJSON();
        // test the values
        expect(result.action).toBe(testDataUpdated.action);
        expect(result.bidder).toBe(testDataUpdated.bidder);
        expect(result.listingItemId).toBe(testDataUpdated.listing_item_id);
    });

    test('Should delete the bid', async () => {
        expect.assertions(2);
        await bidService.destroy(createdBidId);
        await bidService.findOne(createdBidId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdBidId))
        );

        // delete the created listing item
        await listingItemService.destroy(createdListingItem.id);
        await listingItemService.findOne(createdListingItem.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdListingItem.id))
        );
    });

    test('Should not have bid data because bid has been deleted', async () => {
        const bidData = await bidDataService.findAll();
        expect(bidData.length).toBe(0);
    });

});
