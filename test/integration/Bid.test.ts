// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import {app} from '../../src/app';
import {Logger as LoggerType} from '../../src/core/Logger';
import {Targets, Types} from '../../src/constants';
import {TestUtil} from './lib/TestUtil';
import {TestDataService} from '../../src/api/services/TestDataService';
import {BidService} from '../../src/api/services/model/BidService';
import {MarketService} from '../../src/api/services/model/MarketService';
import {ListingItemService} from '../../src/api/services/model/ListingItemService';
import {BidDataService} from '../../src/api/services/model/BidDataService';
import {BidCreateRequest} from '../../src/api/requests/model/BidCreateRequest';
import {BidUpdateRequest} from '../../src/api/requests/model/BidUpdateRequest';
import {CreatableModel} from '../../src/api/enums/CreatableModel';
import {TestDataGenerateRequest} from '../../src/api/requests/testdata/TestDataGenerateRequest';
import {BidSearchParams} from '../../src/api/requests/search/BidSearchParams';
import {ProfileService} from '../../src/api/services/model/ProfileService';
import {GenerateListingItemTemplateParams} from '../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import {GenerateListingItemParams} from '../../src/api/requests/testdata/GenerateListingItemParams';
import {OrderItemService} from '../../src/api/services/model/OrderItemService';
import {OrderService} from '../../src/api/services/model/OrderService';
import {AddressType} from '../../src/api/enums/AddressType';
import {ValidationException} from '../../src/api/exceptions/ValidationException';
import {NotFoundException} from '../../src/api/exceptions/NotFoundException';
import {DatabaseException} from '../../src/api/exceptions/DatabaseException';
import {MPAction} from 'omp-lib/dist/interfaces/omp-enums';
import {GenerateProfileParams} from '../../src/api/requests/testdata/GenerateProfileParams';
import {OrderItemStatus} from '../../src/api/enums/OrderItemStatus';
import {BidDataCreateRequest} from '../../src/api/requests/model/BidDataCreateRequest';
import {OrderCreateRequest} from '../../src/api/requests/model/OrderCreateRequest';
import {OrderItemCreateRequest} from '../../src/api/requests/model/OrderItemCreateRequest';
import {OrderStatus} from '../../src/api/enums/OrderStatus';

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

    let defaultMarket: resources.Market;
    let defaultProfile: resources.Profile;
    let sellerProfile: resources.Profile;
    let createdListingItem1: resources.ListingItem;
    let createdListingItemTemplate: resources.ListingItemTemplate;
    let createdBid1: resources.Bid;
    let createdBid2: resources.Bid;

    const testData = {
        type: MPAction.MPA_BID,
        bidder: 'bidderaddress',
        bidDatas: [{
            key: 'COLOR',
            value: 'RED'
        }, {
            key: 'COLOR',
            value: 'GREEN'
        }] as BidDataCreateRequest[],
        address: {
            title: 'SHIPPING_ADDRESS_FOR_BID',
            firstName: 'Robert',
            lastName: 'Downey',
            addressLine1: 'addressline1',
            addressLine2: 'addressline2',
            city: 'Vaajakoski',
            state: 'Keski-Suomi',
            country: 'FI',
            zipCode: '40800',
            type: AddressType.SHIPPING_BID
        },
        generatedAt: 123412341234,
        hash: 'asdfasdfadfasfd',
        msgid: 'asdf1234'
    } as BidCreateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        bidService = app.IoC.getNamed<BidService>(Types.Service, Targets.Service.model.BidService);
        orderService = app.IoC.getNamed<OrderService>(Types.Service, Targets.Service.model.OrderService);
        orderItemService = app.IoC.getNamed<OrderItemService>(Types.Service, Targets.Service.model.OrderItemService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);
        bidDataService = app.IoC.getNamed<BidDataService>(Types.Service, Targets.Service.model.BidDataService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.model.ListingItemService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        defaultProfile = await profileService.getDefault().then(value => value.toJSON());
        defaultMarket = await marketService.getDefault().then(value => value.toJSON());

        // generate seller profile
        const sellerProfileParams = new GenerateProfileParams([true, false]).toParamsArray();
        const profiles = await testDataService.generate({
            model: CreatableModel.PROFILE,
            amount: 1,
            withRelated: true,
            generateParams: sellerProfileParams
        } as TestDataGenerateRequest);
        sellerProfile = profiles[0];

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
        // log.debug('createdListingItemTemplate: ', createdListingItemTemplate.id);

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
            sellerProfile.address               // seller
        ]).toParamsArray();

        const listingItems = await testDataService.generate({
            model: CreatableModel.LISTINGITEM,          // what to generate
            amount: 2,                                  // how many to generate
            withRelated: true,                          // return model
            generateParams: generateListingItemParams   // what kind of data to generate
        } as TestDataGenerateRequest);

        createdListingItem1 = listingItems[0];
        // createdListingItem2 = listingItems[1];

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

    test('Should not return any Bids for listingItem.id and bidders', async () => {
        const bidSearchParams = {
            listingItemId: createdListingItem1.id,
            bidders: [testData.bidder, defaultProfile.address, sellerProfile.address]
        } as BidSearchParams;

        const bids: resources.Bid[] = await bidService.search(bidSearchParams)
            .then(value => value.toJSON());
        expect(bids.length).toBe(0);
    });

    test('Should create a new Bid for ListingItem', async () => {

        testData.listing_item_id = createdListingItem1.id;
        testData.address.profile_id = defaultProfile.id;
        testData.bidder = defaultProfile.address;

        log.debug('testData:', JSON.stringify(testData, null, 2));
        createdBid1 = await bidService.create(testData).then(value => value.toJSON());
        log.debug('createdBid1:', JSON.stringify(createdBid1, null, 2));

        const result: resources.Bid = createdBid1;
        expect(result.type).toBe(testData.type);
        expect(result.bidder).toBe(testData.bidder);
        expect(result.ShippingAddress.type).toBe(testData.address.type);
    });

    test('Should create accept Bid (MPA_ACCEPT) for the ListingItem', async () => {
        // set listing_item_id to bid
        testData.listing_item_id = createdListingItem1.id;
        testData.bidder = defaultProfile.address;
        testData.address.profile_id = defaultProfile.id;
        testData.type = MPAction.MPA_ACCEPT;
        testData.parent_bid_id = createdBid1.id;

        delete testData.address;
        delete testData.bidDatas;

        log.debug('testData:', JSON.stringify(testData, null, 2));
        createdBid2 = await bidService.create(testData).then(value => value.toJSON());
        log.debug('createdBid2:', JSON.stringify(createdBid2, null, 2));

        const result: resources.Bid = createdBid2;
        // test the values
        expect(result.type).toBe(testData.type);
        expect(result.bidder).toBe(testData.bidder);
    });

    test('Should return two Bids (MPA_BID & MPA_ACCEPT) for listingItem.id', async () => {
        const bidSearchParams = {
            listingItemId: createdListingItem1.id
        } as BidSearchParams;

        const bids: resources.Bid[] = await bidService.search(bidSearchParams).then(value => value.toJSON());
        expect(bids.length).toBe(2);
    });

    test('Should return one Bid for listingItem.id and type (MPA_BID)', async () => {
        const bidSearchParams = {
            listingItemId: createdListingItem1.id,
            type: MPAction.MPA_BID
        } as BidSearchParams;

        const bids: resources.Bid[] = await bidService.search(bidSearchParams).then(value => value.toJSON());
        expect(bids.length).toBe(1);
    });

    test('Should return one Bid for listingItem.id and status (MPA_ACCEPT)', async () => {
        const bidSearchParams = {
            listingItemId: createdListingItem1.id,
            type: MPAction.MPA_ACCEPT
        } as BidSearchParams;

        const bids: resources.Bid[] = await bidService.search(bidSearchParams).then(value => value.toJSON());
        expect(bids.length).toBe(1);
    });

    test('Should return one Bid for listingItem.id and status (AWAITING_ESCROW)', async () => {

        // create order and orderItem
        const createdOrder1: resources.Order = await orderService.create({
            address_id: createdBid1.ShippingAddress.id,
            hash: 'hash',
            status: OrderStatus.PROCESSING,
            orderItems: [{
                itemHash: createdListingItem1.hash,
                bid_id: createdBid1.id,
                status: OrderItemStatus.AWAITING_ESCROW
            } as OrderItemCreateRequest],
            buyer: createdBid1.bidder,
            seller: 'selleraddress',
            generatedAt: +new Date().getTime()
        } as OrderCreateRequest).then(value => value.toJSON());

        log.debug('createdOrder1:', JSON.stringify(createdOrder1, null, 2));


        const bidSearchParams = {
            listingItemId: createdListingItem1.id,
            type: OrderItemStatus.AWAITING_ESCROW
        } as BidSearchParams;

        const bids: resources.Bid[] = await bidService.search(bidSearchParams).then(value => value.toJSON());
        expect(bids.length).toBe(1);
    });

    test('Should return one Bid for listingItem.id and status (AWAITING_ESCROW) and title', async () => {
        const bidSearchParams = {
            listingItemId: createdListingItem1.id,
            type: OrderItemStatus.AWAITING_ESCROW,
            searchString: createdListingItem1.ItemInformation.title.slice(0, 3)
        } as BidSearchParams;

        const bids: resources.Bid[] = await bidService.search(bidSearchParams).then(value => value.toJSON());
        expect(bids.length).toBe(1);
    });

    test('Should return one Bid for listingItem.id and status (AWAITING_ESCROW) and shortDescription', async () => {
        const bidSearchParams = {
            listingItemId: createdListingItem1.id,
            type: OrderItemStatus.AWAITING_ESCROW,
            searchString: createdListingItem1.ItemInformation.shortDescription.slice(0, 3)
        } as BidSearchParams;

        const bids: resources.Bid[] = await bidService.search(bidSearchParams).then(value => value.toJSON());
        expect(bids.length).toBe(1);
    });

    test('Should return one Bid for listingItem.id and status (AWAITING_ESCROW) and longDescription', async () => {
        const bidSearchParams = {
            listingItemId: createdListingItem1.id,
            type: OrderItemStatus.AWAITING_ESCROW,
            searchString: createdListingItem1.ItemInformation.longDescription.slice(0, 3)
        } as BidSearchParams;

        const bids: resources.Bid[] = await bidService.search(bidSearchParams).then(value => value.toJSON());
        expect(bids.length).toBe(1);
    });

    test('Should not find Bids by listingItem.id and status (AWAITING_ESCROW) and title', async () => {
        const bidSearchParams = {
            listingItemId: createdListingItem1.id,
            type: OrderItemStatus.AWAITING_ESCROW,
            searchString: 'DOESNOTMATCH'
        } as BidSearchParams;

        const bids: resources.Bid[] = await bidService.search(bidSearchParams).then(value => value.toJSON());
        expect(bids.length).toBe(0);
    });

    test('Should return two Bids for listingItem.id and bidder', async () => {
        const bidSearchParams = {
            listingItemId: createdListingItem1.id,
            bidders: [testData.bidder]
        } as BidSearchParams;

        const bids: resources.Bid[] = await bidService.search(bidSearchParams).then(value => value.toJSON());
        expect(bids.length).toBe(2);
    });

    test('Should return two Bids for listingItem.hash', async () => {
        const bidSearchParams = {
            listingItemHash: createdListingItem1.hash
        } as BidSearchParams;

        const bids: resources.Bid[] = await bidService.search(bidSearchParams).then(value => value.toJSON());
        expect(bids.length).toBe(2);
    });

    test('Should return two Bids for bidder', async () => {
        const bidSearchParams = {
            bidders: [testData.bidder]
        } as BidSearchParams;

        const bids: resources.Bid[] = await bidService.search(bidSearchParams).then(value => value.toJSON());
        expect(bids.length).toBe(2);
    });

    test('Should throw ValidationException because we want to create a empty Bid', async () => {
        expect.assertions(1);
        await bidService.create({} as BidCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list Bids with our new create one', async () => {
        const bids: resources.Bid[] = await bidService.findAll()
            .then(value => value.toJSON());
        expect(bids.length).toBe(2);
        const result = bids[0];
        // test the values
        expect(result.type).toBe(MPAction.MPA_BID);
        expect(result.bidder).toBe(testData.bidder);
    });

    test('Should return one Bid', async () => {
        const result: resources.Bid = await bidService.findOne(createdBid1.id, true)
            .then(value => value.toJSON());

        // test the values
        expect(result.type).toBe(MPAction.MPA_BID);
        expect(result.bidder).toBe(testData.bidder);
        expect(result.BidDatas.length).toBe(2);
    });

    test('Should throw ValidationException because there is no listing_item_id', async () => {
        await bidService.update(createdBid1.id, {
            type: MPAction.MPA_CANCEL
        } as BidUpdateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should update the Bid', async () => {
        const testDataUpdated = {
            listing_item_id: createdListingItem1.id,
            type: MPAction.MPA_CANCEL,
            bidder: 'bidderaddress',
            hash: 'hash',
            generatedAt: 1234567890
        } as BidUpdateRequest;
        const result: resources.Bid = await bidService.update(createdBid1.id, testDataUpdated)
            .then(value => value.toJSON());

        expect(result.type).toBe(testDataUpdated.type);
        expect(result.bidder).toBe(createdBid1.bidder); // we dont update the bidder field
        expect(result.generatedAt).toBe(testDataUpdated.generatedAt);
        expect(result.hash).toBe(testDataUpdated.hash);
    });

    test('Should delete the MPA_ACCEPT Bid', async () => {
        expect.assertions(1);
        await bidService.destroy(createdBid2.id);
        await bidService.findOne(createdBid2.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdBid2.id))
        );
    });
});
