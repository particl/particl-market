// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import * as Faker from 'faker';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Targets, Types } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { BidService } from '../../src/api/services/model/BidService';
import { MarketService } from '../../src/api/services/model/MarketService';
import { ListingItemService } from '../../src/api/services/model/ListingItemService';
import { BidDataService } from '../../src/api/services/model/BidDataService';
import { BidCreateRequest } from '../../src/api/requests/model/BidCreateRequest';
import { BidUpdateRequest } from '../../src/api/requests/model/BidUpdateRequest';
import { BidSearchParams } from '../../src/api/requests/search/BidSearchParams';
import { ProfileService } from '../../src/api/services/model/ProfileService';
import { OrderItemService } from '../../src/api/services/model/OrderItemService';
import { OrderService } from '../../src/api/services/model/OrderService';
import { AddressType } from '../../src/api/enums/AddressType';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { MPAction  } from 'omp-lib/dist/interfaces/omp-enums';
import { OrderItemStatus } from '../../src/api/enums/OrderItemStatus';
import { BidDataCreateRequest } from '../../src/api/requests/model/BidDataCreateRequest';
import { OrderCreateRequest } from '../../src/api/requests/model/OrderCreateRequest';
import { OrderItemCreateRequest } from '../../src/api/requests/model/OrderItemCreateRequest';
import { OrderStatus } from '../../src/api/enums/OrderStatus';
import { ListingItemTemplateService } from '../../src/api/services/model/ListingItemTemplateService';
import { DefaultMarketService } from '../../src/api/services/DefaultMarketService';

describe('Bid', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let defaultMarketService: DefaultMarketService;
    let bidService: BidService;
    let orderService: OrderService;
    let orderItemService: OrderItemService;
    let marketService: MarketService;
    let profileService: ProfileService;
    let bidDataService: BidDataService;
    let listingItemService: ListingItemService;
    let listingItemTemplateService: ListingItemTemplateService;

    let bidderMarket: resources.Market;
    let bidderProfile: resources.Profile;
    let sellerProfile: resources.Profile;
    let sellerMarket: resources.Market;
    let listingItem: resources.ListingItem;
    let listingItemTemplate: resources.ListingItemTemplate;

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
        defaultMarketService = app.IoC.getNamed<DefaultMarketService>(Types.Service, Targets.Service.DefaultMarketService);
        bidService = app.IoC.getNamed<BidService>(Types.Service, Targets.Service.model.BidService);
        orderService = app.IoC.getNamed<OrderService>(Types.Service, Targets.Service.model.OrderService);
        orderItemService = app.IoC.getNamed<OrderItemService>(Types.Service, Targets.Service.model.OrderItemService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);
        bidDataService = app.IoC.getNamed<BidDataService>(Types.Service, Targets.Service.model.BidDataService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.model.ListingItemService);
        listingItemTemplateService = app.IoC.getNamed<ListingItemTemplateService>(Types.Service, Targets.Service.model.ListingItemTemplateService);

        bidderProfile = await profileService.getDefault().then(value => value.toJSON());
        bidderMarket = await defaultMarketService.getDefaultForProfile(bidderProfile.id).then(value => value.toJSON());

        sellerProfile = await testDataService.generateProfile();
        // log.debug('sellerProfile: ', JSON.stringify(sellerProfile, null, 2));

        sellerMarket = await defaultMarketService.getDefaultForProfile(sellerProfile.id).then(value => value.toJSON());
        // log.debug('sellerMarket: ', JSON.stringify(sellerMarket, null, 2));

        listingItem = await testDataService.generateListingItemWithTemplate(sellerProfile, bidderMarket);
        listingItemTemplate = await listingItemTemplateService.findOne(listingItem.ListingItemTemplate.id).then(value => value.toJSON());

        // log.debug('listingItemTemplate: ', JSON.stringify(listingItemTemplate, null, 2));
        // log.debug('bidderMarket.Identity: ', JSON.stringify(bidderMarket.Identity, null, 2));
        // log.debug('sellerMarket.Identity: ', JSON.stringify(sellerMarket.Identity, null, 2));

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
            listingItemId: listingItem.id,
            bidders: [testData.bidder, bidderMarket.Identity.address, sellerMarket.Identity.address]
        } as BidSearchParams;

        // log.debug('bidSearchParams:', JSON.stringify(bidSearchParams, null, 2));

        const bids: resources.Bid[] = await bidService.search(bidSearchParams).then(value => value.toJSON());
        expect(bids.length).toBe(0);
    });

    test('Should create a new Bid for ListingItem', async () => {

        testData.listing_item_id = listingItem.id;
        testData.profile_id = bidderProfile.id;
        testData.address.profile_id = bidderProfile.id;
        testData.address.type = AddressType.SHIPPING_OWN;
        testData.bidder = bidderMarket.Identity.address;

        // log.debug('testData:', JSON.stringify(testData, null, 2));
        createdBid1 = await bidService.create(testData).then(value => value.toJSON());
        // log.debug('createdBid1:', JSON.stringify(createdBid1, null, 2));

        const result: resources.Bid = createdBid1;
        expect(result.type).toBe(testData.type);
        expect(result.bidder).toBe(testData.bidder);
        expect(result.ShippingAddress.type).toBe(testData.address.type);
        expect(result.Profile.id).toBe(testData.profile_id);

    });

    test('Should create accept Bid (MPA_ACCEPT) for the ListingItem', async () => {

        testData.listing_item_id = listingItem.id;
        testData.address.profile_id = sellerProfile.id;
        testData.address.type = AddressType.SHIPPING_BID;
        testData.type = MPAction.MPA_ACCEPT;
        testData.parent_bid_id = createdBid1.id;
        testData.bidder = bidderMarket.Identity.address;

        delete testData.address;
        delete testData.bidDatas;

        // log.debug('testData:', JSON.stringify(testData, null, 2));
        createdBid2 = await bidService.create(testData).then(value => value.toJSON());
        // log.debug('createdBid2:', JSON.stringify(createdBid2, null, 2));

        const result: resources.Bid = createdBid2;
        // test the values
        expect(result.type).toBe(testData.type);
        expect(result.bidder).toBe(testData.bidder);
    });

    test('Should return two Bids (MPA_BID & MPA_ACCEPT) for listingItem.id', async () => {
        const bidSearchParams = {
            listingItemId: listingItem.id
        } as BidSearchParams;

        const bids: resources.Bid[] = await bidService.search(bidSearchParams).then(value => value.toJSON());
        expect(bids.length).toBe(2);
    });

    test('Should return one Bid for listingItem.id and type (MPA_BID)', async () => {
        const bidSearchParams = {
            listingItemId: listingItem.id,
            type: MPAction.MPA_BID
        } as BidSearchParams;

        const bids: resources.Bid[] = await bidService.search(bidSearchParams).then(value => value.toJSON());
        expect(bids.length).toBe(1);
    });

    test('Should return one Bid for listingItem.id and status (MPA_ACCEPT)', async () => {
        const bidSearchParams = {
            listingItemId: listingItem.id,
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
                itemHash: listingItem.hash,
                bid_id: createdBid1.id,
                status: OrderItemStatus.AWAITING_ESCROW
            } as OrderItemCreateRequest],
            buyer: createdBid1.bidder,
            seller: 'selleraddress',
            generatedAt: +new Date().getTime()
        } as OrderCreateRequest).then(value => value.toJSON());

        // log.debug('createdOrder1:', JSON.stringify(createdOrder1, null, 2));

        const bidSearchParams = {
            listingItemId: listingItem.id,
            orderItemStatus: OrderItemStatus.AWAITING_ESCROW
        } as BidSearchParams;

        const bids: resources.Bid[] = await bidService.search(bidSearchParams).then(value => value.toJSON());
        expect(bids.length).toBe(1);
    });

    test('Should return one Bid for listingItem.id and status (AWAITING_ESCROW) and title', async () => {
        const bidSearchParams = {
            listingItemId: listingItem.id,
            orderItemStatus: OrderItemStatus.AWAITING_ESCROW,
            searchString: listingItem.ItemInformation.title.slice(0, 3)
        } as BidSearchParams;

        const bids: resources.Bid[] = await bidService.search(bidSearchParams).then(value => value.toJSON());
        expect(bids.length).toBe(1);
    });

    test('Should return one Bid for listingItem.id and status (AWAITING_ESCROW) and shortDescription', async () => {
        const bidSearchParams = {
            listingItemId: listingItem.id,
            orderItemStatus: OrderItemStatus.AWAITING_ESCROW,
            searchString: listingItem.ItemInformation.shortDescription.slice(0, 3)
        } as BidSearchParams;

        const bids: resources.Bid[] = await bidService.search(bidSearchParams).then(value => value.toJSON());
        expect(bids.length).toBe(1);
    });

    test('Should return one Bid for listingItem.id and status (AWAITING_ESCROW) and longDescription', async () => {
        const bidSearchParams = {
            listingItemId: listingItem.id,
            orderItemStatus: OrderItemStatus.AWAITING_ESCROW,
            searchString: listingItem.ItemInformation.longDescription.slice(0, 3)
        } as BidSearchParams;

        const bids: resources.Bid[] = await bidService.search(bidSearchParams).then(value => value.toJSON());
        expect(bids.length).toBe(1);
    });

    test('Should not find Bids by listingItem.id and status (AWAITING_ESCROW) and title', async () => {
        const bidSearchParams = {
            listingItemId: listingItem.id,
            orderItemStatus: OrderItemStatus.AWAITING_ESCROW,
            searchString: 'DOESNOTMATCH'
        } as BidSearchParams;

        const bids: resources.Bid[] = await bidService.search(bidSearchParams).then(value => value.toJSON());
        expect(bids.length).toBe(0);
    });

    test('Should return two Bids for listingItem.id and bidder', async () => {
        const bidSearchParams = {
            listingItemId: listingItem.id,
            bidders: [testData.bidder]
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
            listing_item_id: listingItem.id,
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

