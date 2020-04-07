// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import * as Faker from 'faker';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestDataService } from '../../src/api/services/TestDataService';
import { TestUtil } from './lib/TestUtil';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { OrderItemService } from '../../src/api/services/model/OrderItemService';
import { OrderItemCreateRequest } from '../../src/api/requests/model/OrderItemCreateRequest';
import { OrderItemUpdateRequest } from '../../src/api/requests/model/OrderItemUpdateRequest';
import { ProfileService } from '../../src/api/services/model/ProfileService';
import { MarketService } from '../../src/api/services/model/MarketService';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { OrderItemStatus } from '../../src/api/enums/OrderItemStatus';
import { ListingItemService } from '../../src/api/services/model/ListingItemService';
import { ListingItemTemplateService } from '../../src/api/services/model/ListingItemTemplateService';

describe('OrderItem', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let orderItemService: OrderItemService;
    let marketService: MarketService;
    let profileService: ProfileService;
    let listingItemService: ListingItemService;
    let listingItemTemplateService: ListingItemTemplateService;

    let bidderMarket: resources.Market;
    let bidderProfile: resources.Profile;
    let sellerProfile: resources.Profile;
    let sellerMarket: resources.Market;
    let listingItem: resources.ListingItem;
    let listingItemTemplate: resources.ListingItemTemplate;

    let bidderBid: resources.Bid;
    let sellerBid: resources.Bid;

    let bidderOrder: resources.Order;
    let sellerOrder: resources.Order;

    let bidderOrderItem: resources.Order;
    // let sellerOrderItem: resources.Order;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        orderItemService = app.IoC.getNamed<OrderItemService>(Types.Service, Targets.Service.model.OrderItemService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.model.ListingItemService);
        listingItemTemplateService = app.IoC.getNamed<ListingItemTemplateService>(Types.Service, Targets.Service.model.ListingItemTemplateService);

        bidderProfile = await profileService.getDefault().then(value => value.toJSON());
        bidderMarket = await marketService.getDefaultForProfile(bidderProfile.id).then(value => value.toJSON());

        sellerProfile = await testDataService.generateProfile();
        sellerMarket = await marketService.getDefaultForProfile(sellerProfile.id).then(value => value.toJSON());

        listingItem = await testDataService.generateListingItemWithTemplate(sellerProfile, bidderMarket);
        listingItemTemplate = await listingItemTemplateService.findOne(listingItem.ListingItemTemplate.id).then(value => value.toJSON());

        const bids: resources.Bid[]  = await testDataService.generateBid(MPAction.MPA_BID, listingItem.id, bidderMarket, sellerMarket);
        bidderBid = bids[0];
        sellerBid = bids[1];

        const orders: resources.Order[]  = await testDataService.generateOrder(bidderBid, sellerBid, bidderMarket, sellerMarket, false);
        bidderOrder = orders[0];
        sellerOrder = orders[1];

    });

    afterAll(async () => {
        //
    });

    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await orderItemService.create({} as OrderItemCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new OrderItem', async () => {

        const testData = {
            itemHash: bidderBid.ListingItem.hash,
            bid_id: bidderBid.id,
            status: OrderItemStatus.AWAITING_ESCROW,
            order_id: bidderOrder.id
        } as OrderItemCreateRequest;

        bidderOrderItem = await orderItemService.create(testData).then(value => value.toJSON());
        expect(bidderOrderItem.status).toBe(testData.status);
    });

    test('Should throw ValidationException because we want to create a empty OrderItem', async () => {
        expect.assertions(1);
        await orderItemService.create({} as OrderItemCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list OrderItems with our newly created one', async () => {
        const orderItems: resources.OrderItem[] = await orderItemService.findAll().then(value => value.toJSON());
        expect(orderItems.length).toBe(1);

        const result = orderItems[0];
        expect(result.itemHash).toBe(bidderOrderItem.itemHash);
        expect(result.status).toBe(bidderOrderItem.status);
    });

    test('Should return one OrderItem', async () => {
        bidderOrderItem = await orderItemService.findOne(bidderOrderItem.id).then(value => value.toJSON());
        const result = bidderOrderItem;
        expect(result.itemHash).toBe(bidderOrderItem.itemHash);
        expect(result.status).toBe(bidderOrderItem.status);
        expect(result.Order.id).toBe(bidderOrder.id);
        expect(result.Bid.id).toBe(bidderBid.id);
    });

    test('Should update the OrderItem', async () => {
        const testDataUpdated = {
            itemHash: bidderBid.ListingItem.hash,
            status: OrderItemStatus.SHIPPING
        } as OrderItemUpdateRequest;

        bidderOrderItem = await orderItemService.update(bidderOrderItem.id, testDataUpdated).then(value => value.toJSON());
        const result = bidderOrderItem;
        expect(result.itemHash).toBe(testDataUpdated.itemHash);
        expect(result.status).toBe(testDataUpdated.status);
        expect(result.Order.id).toBe(bidderOrder.id);
        expect(result.Bid.id).toBe(bidderBid.id);
    });

    test('Should delete the OrderItem', async () => {
        expect.assertions(1);
        await orderItemService.destroy(bidderOrderItem.id);
        await orderItemService.findOne(bidderOrderItem.id).catch(e =>
            expect(e).toEqual(new NotFoundException(bidderOrderItem.id))
        );
    });

});
