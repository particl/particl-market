// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { BidService } from '../../src/api/services/BidService';
import { MarketService } from '../../src/api/services/MarketService';
import { ListingItemService } from '../../src/api/services/ListingItemService';
import { BidDataService } from '../../src/api/services/BidDataService';
import { Bid } from '../../src/api/models/Bid';
import { BidMessageType } from '../../src/api/enums/BidMessageType';
import { BidCreateRequest } from '../../src/api/requests/BidCreateRequest';
import { BidUpdateRequest } from '../../src/api/requests/BidUpdateRequest';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { TestDataGenerateRequest } from '../../src/api/requests/TestDataGenerateRequest';
import { BidSearchParams } from '../../src/api/requests/BidSearchParams';
import { ProfileService } from '../../src/api/services/ProfileService';
import { GenerateListingItemTemplateParams } from '../../src/api/requests/params/GenerateListingItemTemplateParams';
import * as bidCreateRequest1 from '../testdata/createrequest/bidCreateRequestMPA_BID.json';
import * as resources from 'resources';
import { GenerateListingItemParams } from '../../src/api/requests/params/GenerateListingItemParams';
import { OrderItemService } from '../../src/api/services/OrderItemService';
import { OrderService } from '../../src/api/services/OrderService';
import { Order } from '../../src/api/models/Order';
import { AddressType } from '../../src/api/enums/AddressType';
import { AddressCreateRequest } from '../../src/api/requests/AddressCreateRequest';
import { OrderItemCreateRequest } from '../../src/api/requests/OrderItemCreateRequest';
import { OrderStatus } from '../../src/api/enums/OrderStatus';
import { OrderCreateRequest } from '../../src/api/requests/OrderCreateRequest';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { DatabaseException } from '../../src/api/exceptions/DatabaseException';

describe('Bid', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let bidService: BidService;
    let orderService: OrderService;
    let orderItemService: OrderItemService;
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
    let createdOrder1: resources.Order;

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
        orderService = app.IoC.getNamed<OrderService>(Types.Service, Targets.Service.OrderService);
        orderItemService = app.IoC.getNamed<OrderItemService>(Types.Service, Targets.Service.OrderItemService);
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
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            true,   // generateShippingDestinations
            false,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            true    // generateListingItemObjects
        ]).toParamsArray();

        const listingItemTemplates = await testDataService.generate({
            model: CreatableModel.LISTINGITEMTEMPLATE,  // what to generate
            amount: 1,                                  // how many to generate
            withRelated: true,                          // return model
            generateParams: generateListingItemTemplateParams // what kind of data to generate
        } as TestDataGenerateRequest);
        createdListingItemTemplate = listingItemTemplates[0];
        log.debug('createdListingItemTemplate: ', createdListingItemTemplate.id);

        // create ListingItems
        const generateListingItemParams = new GenerateListingItemParams([
            true,                               // generateItemInformation
            true,                               // generateItemLocation
            true,                               // generateShippingDestinations
            false,                              // generateItemImages
            true,                               // generatePaymentInformation
            true,                               // generateEscrow
            true,                               // generateItemPrice
            true,                               // generateMessagingInformation
            true,                               // generateListingItemObjects
            false,                              // generateObjectDatas
            createdListingItemTemplate.hash,    // listingItemTemplateHash
            defaultProfile.address              // seller
        ]).toParamsArray();

        const listingItems = await testDataService.generate({
            model: CreatableModel.LISTINGITEM,          // what to generate
            amount: 2,                                  // how many to generate
            withRelated: true,                          // return model
            generateParams: generateListingItemParams   // what kind of data to generate
        } as TestDataGenerateRequest);

        createdListingItem1 = listingItems[0];
        createdListingItem2 = listingItems[1];

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

        // log.debug('testData:', JSON.stringify(testData, null, 2));
        const bidModel: Bid = await bidService.create(testData);
        createdBid1 = bidModel.toJSON();
        log.debug('createdBid1:', JSON.stringify(createdBid1, null, 2));

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
        testData.action = BidMessageType.MPA_ACCEPT;

        // log.debug('testData:', JSON.stringify(testData, null, 2));
        const bidModel: Bid = await bidService.create(testData);
        createdBid2 = bidModel.toJSON();
        log.debug('createdBid2:', JSON.stringify(createdBid2, null, 2));

        // create order and orderItem
        const orderModel: Order = await orderService.create({
            address: {
                profile_id: defaultProfile.id,
                title: 'title',
                firstName: 'fn',
                lastName: 'ln',
                addressLine1: '1',
                addressLine2: '2',
                city: 'city',
                state: 'state',
                country: 'FI',
                zipCode: '1234',
                type: AddressType.SHIPPING_ORDER
            } as AddressCreateRequest,
            hash: 'hash',
            orderItems: [{
                itemHash: createdListingItem2.hash,
                bid_id: createdBid2.id,
                status: OrderStatus.AWAITING_ESCROW,
            } as OrderItemCreateRequest],
            buyer: createdBid2.bidder,
            seller: 'selleraddress'
        } as OrderCreateRequest);
        createdOrder1 = orderModel.toJSON();
        log.debug('createdOrder1:', JSON.stringify(createdOrder1, null, 2));

        const result = createdBid2;
        // test the values
        expect(result.action).toBe(testData.action);
        expect(result.bidder).toBe(testData.bidder);
    });

    test('Should return one Bid for listingItem.id', async () => {
        const bidSearchParams = {
            listingItemId: createdListingItem1.id
        } as BidSearchParams;

        const bidCollection = await bidService.search(bidSearchParams);
        const bids = bidCollection.toJSON();
        expect(bids.length).toBe(1);
    });

    test('Should return one Bid for listingItem.id and status (MPA_BID)', async () => {
        const bidSearchParams = {
            listingItemId: createdListingItem1.id,
            status: BidMessageType.MPA_BID
        } as BidSearchParams;

        const bidCollection = await bidService.search(bidSearchParams);
        const bids = bidCollection.toJSON();
        expect(bids.length).toBe(1);
    });

    test('Should return one Bid for listingItem.id and status (MPA_ACCEPT)', async () => {
        const bidSearchParams = {
            listingItemId: createdListingItem2.id,
            status: BidMessageType.MPA_ACCEPT
        } as BidSearchParams;

        const bidCollection = await bidService.search(bidSearchParams);
        const bids = bidCollection.toJSON();
        expect(bids.length).toBe(1);
    });

    test('Should return one Bid for listingItem.id and status (AWAITING_ESCROW)', async () => {
        const bidSearchParams = {
            listingItemId: createdListingItem2.id,
            status: OrderStatus.AWAITING_ESCROW
        } as BidSearchParams;

        const bidCollection = await bidService.search(bidSearchParams);
        const bids = bidCollection.toJSON();
        expect(bids.length).toBe(1);
    });

    test('Should return one Bid for listingItem.id and status (AWAITING_ESCROW) and title', async () => {
        const bidSearchParams = {
            listingItemId: createdListingItem2.id,
            status: OrderStatus.AWAITING_ESCROW,
            searchString: createdListingItem2.ItemInformation.title.slice(0, 3)
        } as BidSearchParams;

        const bidCollection = await bidService.search(bidSearchParams);
        const bids = bidCollection.toJSON();
        expect(bids.length).toBe(1);
    });

    test('Should return one Bid for listingItem.id and status (AWAITING_ESCROW) and shortDescription', async () => {
        const bidSearchParams = {
            listingItemId: createdListingItem2.id,
            status: OrderStatus.AWAITING_ESCROW,
            searchString: createdListingItem2.ItemInformation.shortDescription.slice(0, 3)
        } as BidSearchParams;

        const bidCollection = await bidService.search(bidSearchParams);
        const bids = bidCollection.toJSON();
        expect(bids.length).toBe(1);
    });

    test('Should return one Bid for listingItem.id and status (AWAITING_ESCROW) and longDescription', async () => {
        const bidSearchParams = {
            listingItemId: createdListingItem2.id,
            status: OrderStatus.AWAITING_ESCROW,
            searchString: createdListingItem2.ItemInformation.longDescription.slice(0, 3)
        } as BidSearchParams;

        const bidCollection = await bidService.search(bidSearchParams);
        const bids = bidCollection.toJSON();
        expect(bids.length).toBe(1);
    });

    test('Should not find Bids by listingItem.id and status (AWAITING_ESCROW) and title', async () => {
        const bidSearchParams = {
            listingItemId: createdListingItem2.id,
            status: OrderStatus.AWAITING_ESCROW,
            searchString: 'DOESNOTMATCH'
        } as BidSearchParams;

        const bidCollection = await bidService.search(bidSearchParams);
        const bids = bidCollection.toJSON();
        expect(bids.length).toBe(0);
    });

    test('Should return one Bid for listingItem.id and bidder', async () => {
        const bidSearchParams = {
            listingItemId: createdListingItem1.id,
            bidders: [testData.bidder]
        } as BidSearchParams;

        const bidCollection = await bidService.search(bidSearchParams);
        const bids = bidCollection.toJSON();
        expect(bids.length).toBe(1);
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
        expect(result.action).toBe(BidMessageType.MPA_BID);
        expect(result.bidder).toBe(testData.bidder);
    });

    test('Should return one Bid', async () => {
        const bidModel: Bid = await bidService.findOne(createdBid1.id, true);
        const result = bidModel.toJSON();
        // test the values
        expect(result.action).toBe(BidMessageType.MPA_BID);
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
        expect(result.bidder).toBe(createdBid1.bidder); // we dont update the bidder field
    });

    test('Should delete the first Bid', async () => {
        expect.assertions(1);
        await bidService.destroy(createdBid1.id);
        await bidService.findOne(createdBid1.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdBid1.id))
        );
    });

    test('Should not delete the second Bid, since theres a relation to OrderItem', async () => {
        expect.assertions(1);
        await bidService.destroy(createdBid2.id).catch(e =>
            expect(e).toEqual(new DatabaseException('Could not delete the bid!', e))
        );
    });

    test('Should delete the second Bid', async () => {
        await orderItemService.destroy(createdOrder1.OrderItems[0].id);
        await orderService.destroy(createdOrder1.id);

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
