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

import { BidMessageType } from '../../src/api/enums/BidMessageType';

import { BidCreateRequest } from '../../src/api/requests/BidCreateRequest';
import { BidUpdateRequest } from '../../src/api/requests/BidUpdateRequest';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { TestDataGenerateRequest } from '../../src/api/requests/TestDataGenerateRequest';
import { BidSearchParams } from '../../src/api/requests/BidSearchParams';
import { AddressCreateRequest } from '../../src/api/requests/AddressCreateRequest';
import { ProfileService } from '../../src/api/services/ProfileService';
import { GenerateListingItemTemplateParams } from '../../src/api/requests/params/GenerateListingItemTemplateParams';

import * as listingItemCreateRequestBasic1 from '../testdata/createrequest/listingItemCreateRequestBasic1.json';
import * as listingItemCreateRequestBasic2 from '../testdata/createrequest/listingItemCreateRequestBasic2.json';

import * as bidCreateRequest1 from '../testdata/createrequest/bidCreateRequestMPA_BID.json';
import * as resources from 'resources';


describe('Bid', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let bidService: BidService;
    let marketService: MarketService;
    let profileService: ProfileService;
    let bidDataService: BidDataService;
    let listingItemService: ListingItemService;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;
    let createdListingItem1: resources.ListingItem;
    let createdListingItem2: resources.ListingItem;
    let createdListingItemTemplate: resources.ListingItemTemplate;
    let createdBid1: resources.Bid;
    let createdBid2: resources.Bid;

    const testData: BidCreateRequest = bidCreateRequest1;

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

        // generate template
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams().toParamsArray();
        const listingItemTemplates = await testDataService.generate({
            model: CreatableModel.LISTINGITEMTEMPLATE,  // what to generate
            amount: 1,                                  // how many to generate
            withRelated: true,                          // return model
            generateParams: generateListingItemTemplateParams // what kind of data to generate
        } as TestDataGenerateRequest);
        createdListingItemTemplate = listingItemTemplates[0];
        log.debug('createdListingItemTemplate: ', createdListingItemTemplate.id);

        // create listing item
        listingItemCreateRequestBasic1.market_id = defaultMarket.id;
        listingItemCreateRequestBasic1.seller = defaultProfile.address;
        listingItemCreateRequestBasic1.listing_item_template_id = listingItemTemplates[0].id;
        const createdListingItemModel1 = await listingItemService.create(listingItemCreateRequestBasic1);
        createdListingItem1 = createdListingItemModel1.toJSON();
        log.debug('createdListingItem1: ', createdListingItem1.id);
        log.debug('createdListingItem1: ', createdListingItem1.hash);

        // create another listing item
        listingItemCreateRequestBasic2.market_id = defaultMarket.id;
        listingItemCreateRequestBasic2.seller = defaultProfile.address;
        const createdListingItemModel2 = await listingItemService.create(listingItemCreateRequestBasic2);
        createdListingItem2 = createdListingItemModel2.toJSON();
        log.debug('createdListingItem2: ', createdListingItem2.id);
        log.debug('createdListingItem2: ', createdListingItem2.hash);

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

    test('Should not return any Bids for listingItem.id and bidder', async () => {
        const bidSearchParams = {
            listingItemId: createdListingItem1.id,
            bidders: [testData.bidder]
        } as BidSearchParams;

        const bidCollection = await bidService.search(bidSearchParams);
        const bids = bidCollection.toJSON();
        expect(bids.length).toBe(0);
    });

    test('Should create a new Bid for ListingItem that is being sold by local Profile', async () => {
        // set listing item id with bidder and address with a profile_id
        testData.listing_item_id = createdListingItem1.id;
        testData.bidder = createdListingItem1.ListingItemTemplate.Profile.address;
        testData.address.profile_id = defaultProfile.id;

        log.debug('testData:', JSON.stringify(testData, null, 2));
        const bidModel: Bid = await bidService.create(testData);
        createdBid1 = bidModel.toJSON();
        log.debug('createdBid1:', createdBid1);

        const result = createdBid1;
        // test the values
        expect(result.action).toBe(testData.action);
        expect(result.bidder).toBe(testData.bidder);
        expect(result.ShippingAddress.type).toBe(testData.address.type);
    });

    test('Should create a new Bid for ListingItem that is being bought by local Profile', async () => {
        // set listing item id with bid
        testData.listing_item_id = createdListingItem2.id;
        testData.bidder = defaultProfile.address;
        testData.address.profile_id = defaultProfile.id;

        log.debug('testData:', JSON.stringify(testData, null, 2));
        const bidModel: Bid = await bidService.create(testData);
        createdBid2 = bidModel.toJSON();
        log.debug('createdBid2:', createdBid2);

        const result = createdBid2;
        // test the values
        expect(result.action).toBe(testData.action);
        expect(result.bidder).toBe(testData.bidder);
    });

    test('Should return one Bid for listingItem.id and bidder', async () => {
        const bidSearchParams = {
            listingItemId: createdListingItem1.id,
            bidders: [testData.bidder]
        } as BidSearchParams;

        const bidCollection = await bidService.search(bidSearchParams);
        const bids = bidCollection.toJSON();
        expect(bids.length).toBe(2);
    });

    test('Should return one Bid for listingItem.hash', async () => {
        const bidSearchParams = {
            listingItemHash: createdListingItem1.hash
        } as BidSearchParams;

        const bidCollection = await bidService.search(bidSearchParams);
        const bids = bidCollection.toJSON();
        expect(bids.length).toBe(1);
    });

    test('Should return two Bids for bidder', async () => {
        const bidSearchParams = {
            bidders: [testData.bidder]
        } as BidSearchParams;

        const bidCollection = await bidService.search(bidSearchParams);
        const bids = bidCollection.toJSON();
        expect(bids.length).toBe(2);
    });

    test('Should throw ValidationException because we want to create a empty Bid', async () => {
        expect.assertions(1);
        await bidService.create({} as BidCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list Bids with our new create one', async () => {
        const bidCollection = await bidService.findAll();
        const bid = bidCollection.toJSON();
        expect(bid.length).toBe(2);
        const result = bid[0];
        // test the values
        expect(result.action).toBe(testData.action);
        expect(result.bidder).toBe(testData.bidder);
    });

    test('Should return one Bid', async () => {
        const bidModel: Bid = await bidService.findOne(createdBid1.id, true);
        const result = bidModel.toJSON();
        // test the values
        expect(result.action).toBe(testData.action);
        expect(result.bidder).toBe(testData.bidder);
        expect(result.BidDatas.length).toBe(2);
    });

    test('Should throw ValidationException because there is no listing_item_id', async () => {
        await bidService.update(createdBid1.id, {
            action: BidMessageType.MPA_CANCEL
        } as BidUpdateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should update the Bid', async () => {
        testDataUpdated.listing_item_id = createdListingItem1.id;
        testDataUpdated.action = BidMessageType.MPA_CANCEL;
        const bidModel: Bid = await bidService.update(createdBid1.id, testDataUpdated as BidUpdateRequest);
        const result = bidModel.toJSON();
        // test the values
        expect(result.action).toBe(testDataUpdated.action);
        expect(result.bidder).toBe(testDataUpdated.bidder);
    });

    test('Should delete the first Bid', async () => {
        expect.assertions(1);
        await bidService.destroy(createdBid1.id);
        await bidService.findOne(createdBid1.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdBid1.id))
        );
    });

    test('Should delete the second Bid', async () => {
        expect.assertions(1);
        await bidService.destroy(createdBid2.id);
        await bidService.findOne(createdBid2.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdBid2.id))
        );
    });

    test('Should not have BidData because bid has been deleted', async () => {
        const bidData = await bidDataService.findAll();
        expect(bidData.length).toBe(0);
    });

});
