import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { BidMessageType } from '../../src/api/enums/BidMessageType';

import { BidData } from '../../src/api/models/BidData';
import { Bid } from '../../src/api/models/Bid';
import { ListingItem } from '../../src/api/models/ListingItem';

import { BidDataService } from '../../src/api/services/BidDataService';
import { BidService } from '../../src/api/services/BidService';
import { MarketService } from '../../src/api/services/MarketService';
import { TestDataService } from '../../src/api/services/TestDataService';
import { ListingItemService } from '../../src/api/services/ListingItemService';

import { TestDataCreateRequest } from '../../src/api/requests/TestDataCreateRequest';
import { ListingItemCreateRequest } from '../../src/api/requests/ListingItemCreateRequest';
import { BidCreateRequest } from '../../src/api/requests/BidCreateRequest';
import { BidUpdateRequest } from '../../src/api/requests/BidUpdateRequest';
import { BidDataCreateRequest } from '../../src/api/requests/BidDataCreateRequest';
import { BidDataUpdateRequest } from '../../src/api/requests/BidDataUpdateRequest';
import { TestDataGenerateRequest } from '../../src/api/requests/TestDataGenerateRequest';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { GenerateListingItemParams } from '../../src/api/requests/params/GenerateListingItemParams';
import { AddressCreateRequest } from '../../src/api/requests/AddressCreateRequest';
import { ProfileService } from '../../src/api/services/ProfileService';

describe('BidDatas', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let bidDataService: BidDataService;
    let bidService: BidService;
    let marketService: MarketService;
    let profileService: ProfileService;
    let listingItemService: ListingItemService;

    let defaultProfile;
    let defaultMarket;
    let createdId;
    let createdListingItem;
    let createdBid;

    const testData = {
        bid_id: null,
        dataId: 'color',
        dataValue: 'black'
    } as BidDataCreateRequest;

    const testDataUpdated = {
        dataId: 'color',
        dataValue: 'black'
    } as BidDataUpdateRequest;

    const testBidData = {
        action: BidMessageType.MPA_BID,
        bidder: 'bidderaddress',
        listing_item_id: null,
        address: {
        title: 'Title',
            firstName: 'Robert',
            lastName: 'Downey',
            addressLine1: 'Add',
            addressLine2: 'ADD 22',
            city: 'city',
            state: 'test state',
            country: 'Finland',
            zipCode: '85001',
        } as AddressCreateRequest
    } as BidCreateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        bidDataService = app.IoC.getNamed<BidDataService>(Types.Service, Targets.Service.BidDataService);
        bidService = app.IoC.getNamed<BidService>(Types.Service, Targets.Service.BidService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.MarketService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.ProfileService);
        bidDataService = app.IoC.getNamed<BidDataService>(Types.Service, Targets.Service.BidDataService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.ListingItemService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        // get default profile
        const defaultProfileModel = await profileService.getDefault();
        defaultProfile = defaultProfileModel.toJSON();

        // get market
        const defaultMarketModel = await marketService.getDefault();
        defaultMarket = defaultMarketModel.toJSON();

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

        // create bid
        testBidData.listing_item_id = createdListingItem.id;
        testBidData.bidder = defaultProfile.address;

        const createdBidModel = await bidService.create(testBidData);
        createdBid = createdBidModel.toJSON();

    });

    afterAll(async () => {
        //
    });

    test('Should throw ValidationException because there is no bid_id', async () => {
        expect.assertions(1);

        const bidData = {dataId: 'color', dataValue: 'black'} as BidDataCreateRequest;
        await bidDataService.create(bidData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new bid data', async () => {
        // set bid id
        testData.bid_id = createdBid.id;

        log.debug('testData:', JSON.stringify(testData, null, 2));
        const bidDataModel: BidData = await bidDataService.create(testData);
        createdId = bidDataModel.Id;
        const result = bidDataModel.toJSON();
        // test the values
        expect(result.dataId).toBe(testDataUpdated.dataId);
        expect(result.dataValue).toBe(testDataUpdated.dataValue);
    });

    test('Should throw ValidationException because we want to create a empty bid data', async () => {
        expect.assertions(1);
        await bidDataService.create({} as BidDataCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list bid datas with our new create one', async () => {
        const bidDataCollection = await bidDataService.findAll();
        const bidData = bidDataCollection.toJSON();
        expect(bidData.length).toBe(1);
        const result = bidData[0];

        // test the values
        expect(result.dataId).toBe(testDataUpdated.dataId);
        expect(result.dataValue).toBe(testDataUpdated.dataValue);
    });

    test('Should return one bid data', async () => {
        const bidDataModel: BidData = await bidDataService.findOne(createdId);
        const result = bidDataModel.toJSON();

        // test the values
        expect(result.dataId).toBe(testDataUpdated.dataId);
        expect(result.dataValue).toBe(testDataUpdated.dataValue);
    });

    test('Should throw ValidationException because we want to update with out bid_id', async () => {
        expect.assertions(1);
        await bidDataService.update(createdId, testDataUpdated as BidDataUpdateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should update the bid data', async () => {
        testDataUpdated.bid_id = createdBid.id;
        const bidDataModel: BidData = await bidDataService.update(createdId, testDataUpdated as BidDataUpdateRequest);
        const result = bidDataModel.toJSON();

        // test the values
        expect(result.dataId).toBe(testDataUpdated.dataId);
        expect(result.dataValue).toBe(testDataUpdated.dataValue);
    });

    test('Should delete the bid data', async () => {
        expect.assertions(3);
        // delete created bid data
        await bidDataService.destroy(createdId);
        await bidDataService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
        // delete created bid
        await bidService.destroy(createdBid.id);
        await bidService.findOne(createdBid.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdBid.id))
        );
        // delete create listing item
        await listingItemService.destroy(createdListingItem.id);
        await listingItemService.findOne(createdListingItem.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdListingItem.id))
        );
    });

});
