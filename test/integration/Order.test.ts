// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import * as Faker from 'faker';
import { app} from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Targets, Types } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { OrderService } from '../../src/api/services/model/OrderService';
import { OrderCreateRequest } from '../../src/api/requests/model/OrderCreateRequest';
import { ProfileService } from '../../src/api/services/model/ProfileService';
import { ListingItemService } from '../../src/api/services/model/ListingItemService';
import { MarketService } from '../../src/api/services/model/MarketService';
import { BidService } from '../../src/api/services/model/BidService';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { OrderItemService } from '../../src/api/services/model/OrderItemService';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { OrderStatus } from '../../src/api/enums/OrderStatus';
import { OrderItemCreateRequest } from '../../src/api/requests/model/OrderItemCreateRequest';
import { OrderItemStatus } from '../../src/api/enums/OrderItemStatus';
import { ListingItemTemplateService } from '../../src/api/services/model/ListingItemTemplateService';
import { DefaultMarketService } from '../../src/api/services/DefaultMarketService';

describe('Order', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let defaultMarketService: DefaultMarketService;
    let orderService: OrderService;
    let orderItemService: OrderItemService;
    let bidService: BidService;
    let marketService: MarketService;
    let profileService: ProfileService;
    let listingItemService: ListingItemService;
    let listingItemTemplateService: ListingItemTemplateService;

    let bidderProfile: resources.Profile;
    let bidderMarket: resources.Market;
    let sellerProfile: resources.Profile;
    let sellerMarket: resources.Market;

    let listingItem1: resources.ListingItem;
    // let listingItem2: resources.ListingItem;
    let listingItemTemplate1: resources.ListingItemTemplate;
    // let listingItemTemplate2: resources.ListingItemTemplate;

    let bidderBid: resources.Bid;
    let sellerBid: resources.Bid;

    let bidderOrder: resources.Order;
    let sellerOrder: resources.Order;


    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        defaultMarketService = app.IoC.getNamed<DefaultMarketService>(Types.Service, Targets.Service.DefaultMarketService);
        orderService = app.IoC.getNamed<OrderService>(Types.Service, Targets.Service.model.OrderService);
        orderItemService = app.IoC.getNamed<OrderItemService>(Types.Service, Targets.Service.model.OrderItemService);
        bidService = app.IoC.getNamed<BidService>(Types.Service, Targets.Service.model.BidService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.model.ListingItemService);
        listingItemTemplateService = app.IoC.getNamed<ListingItemTemplateService>(Types.Service, Targets.Service.model.ListingItemTemplateService);

        bidderProfile = await profileService.getDefault().then(value => value.toJSON());
        bidderMarket = await defaultMarketService.getDefaultForProfile(bidderProfile.id).then(value => value.toJSON());

        sellerProfile = await testDataService.generateProfile();
        sellerMarket = await defaultMarketService.getDefaultForProfile(sellerProfile.id).then(value => value.toJSON());

        listingItem1 = await testDataService.generateListingItemWithTemplate(sellerProfile, bidderMarket);
        listingItemTemplate1 = await listingItemTemplateService.findOne(listingItem1.ListingItemTemplate.id).then(value => value.toJSON());

        const bids: resources.Bid[]  = await testDataService.generateBid(MPAction.MPA_BID, listingItem1.id, bidderMarket, sellerMarket);
        bidderBid = bids[0];
        sellerBid = bids[1];


    });

    afterAll(async () => {
        //
    });

    test('Should throw ValidationException because we want to create a empty Order', async () => {
        expect.assertions(1);
        await orderService.create({} as OrderCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new Order (bidder)', async () => {
        const testData = {
            address_id: bidderBid.ShippingAddress.id,
            hash: 'WILLBESETINTHEFACTORY-' + Faker.random.uuid(),
            status: OrderStatus.PROCESSING,
            orderItems: [{
                itemHash: listingItem1.hash,
                status: OrderItemStatus.BIDDED,
                bid_id: bidderBid.id
            }] as OrderItemCreateRequest[],
            buyer: bidderBid.bidder,
            seller: listingItem1.seller,
            generatedAt: +new Date().getTime()
        } as OrderCreateRequest;

        log.debug('order testData: ', JSON.stringify(testData, null, 2));
        bidderOrder = await orderService.create(testData).then(value => value.toJSON());

        expect(bidderOrder.hash).toBe(testData.hash);
    }, 600000); // timeout to 600s

    test('Should create a new Order (seller)', async () => {
        const testData = {
            address_id: sellerBid.ShippingAddress.id,
            hash: bidderOrder.hash,
            status: OrderStatus.PROCESSING,
            orderItems: [{
                itemHash: listingItem1.hash,
                status: OrderItemStatus.BIDDED,
                bid_id: sellerBid.id
            }] as OrderItemCreateRequest[],
            buyer: bidderBid.bidder,
            seller: listingItem1.seller,
            generatedAt: +new Date().getTime()
        } as OrderCreateRequest;

        log.debug('order testData: ', JSON.stringify(testData, null, 2));
        sellerOrder = await orderService.create(testData).then(value => value.toJSON());

        expect(sellerOrder.hash).toBe(testData.hash);

    }, 600000); // timeout to 600s

    test('Should list Orders with the newly created ones', async () => {
        const orders: resources.Order = await orderService.findAll().then(value => value.toJSON());
        expect(orders.length).toBe(2);
        expect(orders[0].hash).toBe(bidderOrder.hash);
    });

    test('Should return one Order', async () => {
        const result: resources.Order = await orderService.findOne(bidderOrder.id).then(value => value.toJSON());
        expect(result.hash).toBe(bidderOrder.hash);
    });

    test('Should delete the Order, related OrderItem', async () => {
        expect.assertions(2);
        await orderService.destroy(bidderOrder.id);
        await orderService.findOne(bidderOrder.id).catch(e =>
            expect(e).toEqual(new NotFoundException(bidderOrder.id))
        );
        await orderItemService.findOne(bidderOrder.OrderItems[0].id).catch(e =>
            expect(e).toEqual(new NotFoundException(bidderOrder.OrderItems[0].id))
        );
    });

});
