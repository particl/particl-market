// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestDataService } from '../../src/api/services/TestDataService';
import { TestUtil } from './lib/TestUtil';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { OrderItem } from '../../src/api/models/OrderItem';
import { OrderItemService } from '../../src/api/services/OrderItemService';
import { OrderItemCreateRequest } from '../../src/api/requests/OrderItemCreateRequest';
import { OrderItemUpdateRequest } from '../../src/api/requests/OrderItemUpdateRequest';
import { OrderItemStatus } from 'OrderItemStatus.ts';
import { GenerateListingItemTemplateParams } from '../../src/api/requests/params/GenerateListingItemTemplateParams';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { TestDataGenerateRequest } from '../../src/api/requests/TestDataGenerateRequest';
import { GenerateProfileParams } from '../../src/api/requests/params/GenerateProfileParams';
import { ProfileService } from '../../src/api/services/ProfileService';
import { MarketService } from '../../src/api/services/MarketService';
import { GenerateBidParams } from '../../src/api/requests/params/GenerateBidParams';
import { GenerateOrderParams } from '../../src/api/requests/params/GenerateOrderParams';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';

describe('OrderItem', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let orderItemService: OrderItemService;
    let marketService: MarketService;
    let profileService: ProfileService;

    let buyerProfile: resources.Profile;
    let sellerProfile: resources.Profile;
    let defaultMarket: resources.Market;

    let createdListingItemTemplate: resources.ListingItemTemplate;
    let createdListingItem: resources.ListingItem;
    let createdBid: resources.Bid;
    let createdOrder: resources.Order;
    let createdOrderItem: resources.OrderItem;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        orderItemService = app.IoC.getNamed<OrderItemService>(Types.Service, Targets.Service.OrderItemService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.MarketService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.ProfileService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        // get market
        const defaultMarketModel = await marketService.getDefault();
        defaultMarket = defaultMarketModel.toJSON();
        log.debug('defaultMarket: ', defaultMarket);

        // get default profile
        const defaultProfileModel = await profileService.getDefault();
        buyerProfile = defaultProfileModel.toJSON();
        log.debug('buyerProfile: ', buyerProfile);

        // generate a seller profile in addition to the default one used for buyer
        const generateProfileParams = new GenerateProfileParams().toParamsArray();
        const profiles = await testDataService.generate({
            model: CreatableModel.PROFILE,              // what to generate
            amount: 1,                                  // how many to generate
            withRelated: true,                          // return model
            generateParams: generateProfileParams       // what kind of data to generate
        } as TestDataGenerateRequest);
        sellerProfile = profiles[0];
        log.debug('sellerProfile: ', sellerProfile.id);

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,                   // generateItemInformation
            true,                   // generateItemLocation
            true,                   // generateShippingDestinations
            false,                  // generateItemImages
            true,                   // generatePaymentInformation
            true,                   // generateEscrow
            true,                   // generateItemPrice
            true,                   // generateMessagingInformation
            false,                  // generateListingItemObjects
            false,                  // generateObjectDatas
            sellerProfile.id,       // profileId
            true,                   // generateListingItem
            defaultMarket.id        // marketId
        ]).toParamsArray();

        // generate two ListingItemTemplates with ListingItems
        const listingItemTemplates = await testDataService.generate({
            model: CreatableModel.LISTINGITEMTEMPLATE,          // what to generate
            amount: 1,                                          // how many to generate
            withRelated: true,                                  // return model
            generateParams: generateListingItemTemplateParams   // what kind of data to generate
        } as TestDataGenerateRequest);

        createdListingItemTemplate = listingItemTemplates[0];
        createdListingItem = listingItemTemplates[0].ListingItems[0];

        log.debug('createdListingItem.hash: ', JSON.stringify(createdListingItem.hash, null, 2));

        // create a new bid from defaultProfile for ListingItem that is being sold by createdSellerProfile
        const bidParams = new GenerateBidParams([
            false,                      // generateListingItemTemplate
            false,                      // generateListingItem
            createdListingItem.hash,    // listingItemhash
            MPAction.MPA_ACCEPT,  // action
            buyerProfile.address,       // bidder
            sellerProfile.address       // listingItemSeller
        ]).toParamsArray();

        const bids = await testDataService.generate({
            model: CreatableModel.BID,
            amount: 1,
            withRelated: true,
            generateParams: bidParams
        } as TestDataGenerateRequest).catch(reason => {
            log.error('REASON:', JSON.stringify(reason, null, 2));
        });
        createdBid = bids[0];

        log.debug('createdBid: ', JSON.stringify(createdBid, null, 2));

        const orderGenerateParams = new GenerateOrderParams([
            false,                      // generateListingItemTemplate
            false,                      // generateListingItem
            false,                      // generateBid
            false,                      // generateOrderItems
            createdListingItem.hash,    // listingItemhash
            createdBid.id,              // bidId
            buyerProfile.address,       // bidder
            sellerProfile.address       // listingItemSeller
        ]);

        const generatedOrders = await testDataService.generate({
            model: CreatableModel.ORDER,
            amount: 1,
            withRelated: true,
            generateParams: orderGenerateParams.toParamsArray()
        } as TestDataGenerateRequest);

        createdOrder = generatedOrders[0];

        log.debug('createdOrder: ', JSON.stringify(createdOrder, null, 2));

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
            itemHash: createdBid.ListingItem.hash,
            bid_id: createdBid.id,
            status: OrderItemStatus.AWAITING_ESCROW,
            order_id: createdOrder.id
        } as OrderItemCreateRequest;

        const orderItemModel: OrderItem = await orderItemService.create(testData);
        createdOrderItem = orderItemModel.toJSON();

        expect(createdOrderItem.status).toBe(testData.status);
    });

    test('Should throw ValidationException because we want to create a empty OrderItem', async () => {
        expect.assertions(1);
        await orderItemService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list OrderItems with our newly created one', async () => {
        const orderItemCollection = await orderItemService.findAll();
        const orderItems = orderItemCollection.toJSON();
        expect(orderItems.length).toBe(1);

        const result = orderItems[0];
        log.debug('result:', JSON.stringify(result, null, 2));
        expect(result.itemHash).toBe(createdOrderItem.itemHash);
        expect(result.status).toBe(createdOrderItem.status);
    });

    test('Should return one OrderItem', async () => {
        const orderItemModel: OrderItem = await orderItemService.findOne(createdOrderItem.id);
        const result = orderItemModel.toJSON();

        expect(result.itemHash).toBe(createdOrderItem.itemHash);
        expect(result.status).toBe(createdOrderItem.status);
        expect(result.Order.id).toBe(createdOrder.id);
        expect(result.Bid.id).toBe(createdBid.id);
    });

    test('Should update the OrderItem', async () => {
        const testDataUpdated = {
            itemHash: createdBid.ListingItem.hash,
            status: OrderItemStatus.SHIPPING
        } as OrderItemUpdateRequest;

        const orderItemModel: OrderItem = await orderItemService.update(createdOrderItem.id, testDataUpdated);
        const result = orderItemModel.toJSON();

        expect(result.itemHash).toBe(testDataUpdated.itemHash);
        expect(result.status).toBe(testDataUpdated.status);
        expect(result.Order.id).toBe(createdOrder.id);
        expect(result.Bid.id).toBe(createdBid.id);

    });

    test('Should delete the OrderItem', async () => {
        expect.assertions(1);
        await orderItemService.destroy(createdOrderItem.id);
        await orderItemService.findOne(createdOrderItem.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdOrderItem.id))
        );
    });
});
