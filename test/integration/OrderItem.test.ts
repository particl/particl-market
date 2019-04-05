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
import { OrderItemService } from '../../src/api/services/OrderItemService';
import { OrderItemCreateRequest } from '../../src/api/requests/OrderItemCreateRequest';
import { OrderItemUpdateRequest } from '../../src/api/requests/OrderItemUpdateRequest';
import { GenerateListingItemTemplateParams } from '../../src/api/requests/params/GenerateListingItemTemplateParams';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { TestDataGenerateRequest } from '../../src/api/requests/TestDataGenerateRequest';
import { GenerateProfileParams } from '../../src/api/requests/params/GenerateProfileParams';
import { ProfileService } from '../../src/api/services/ProfileService';
import { MarketService } from '../../src/api/services/MarketService';
import { GenerateBidParams } from '../../src/api/requests/params/GenerateBidParams';
import { GenerateOrderParams } from '../../src/api/requests/params/GenerateOrderParams';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { OrderItemStatus } from '../../src/api/enums/OrderItemStatus';

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

    let listingItemTemplate: resources.ListingItemTemplate;
    let listingItem: resources.ListingItem;
    let bid: resources.Bid;
    let order: resources.Order;
    let orderItem: resources.OrderItem;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        orderItemService = app.IoC.getNamed<OrderItemService>(Types.Service, Targets.Service.OrderItemService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.MarketService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.ProfileService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        defaultMarket = await marketService.getDefault().then(value => value.toJSON());
        buyerProfile = await profileService.getDefault().then(value => value.toJSON());

        // generate a seller profile in addition to the default one used for buyer
        const generateProfileParams = new GenerateProfileParams().toParamsArray();
        const profiles: resources.Profile[] = await testDataService.generate({
            model: CreatableModel.PROFILE,              // what to generate
            amount: 1,                                  // how many to generate
            withRelated: true,                          // return model
            generateParams: generateProfileParams       // what kind of data to generate
        } as TestDataGenerateRequest);
        sellerProfile = profiles[0];

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

        // generate ListingItemTemplate with ListingItem
        const listingItemTemplates: resources.ListingItemTemplate[] = await testDataService.generate({
            model: CreatableModel.LISTINGITEMTEMPLATE,          // what to generate
            amount: 1,                                          // how many to generate
            withRelated: true,                                  // return model
            generateParams: generateListingItemTemplateParams   // what kind of data to generate
        } as TestDataGenerateRequest);

        listingItemTemplate = listingItemTemplates[0];
        listingItem = listingItemTemplates[0].ListingItems[0];

        // create a new bid from defaultProfile for ListingItem that is being sold by createdSellerProfile
        const bidParams = new GenerateBidParams([
            false,                      // generateListingItemTemplate
            false,                      // generateListingItem
            listingItem.hash,           // listingItemHash
            MPAction.MPA_ACCEPT,        // type
            buyerProfile.address,       // bidder
            sellerProfile.address       // seller
        ]).toParamsArray();

        const bids: resources.Bid[] = await testDataService.generate({
            model: CreatableModel.BID,
            amount: 1,
            withRelated: true,
            generateParams: bidParams
        } as TestDataGenerateRequest);
        bid = bids[0];

        const orderGenerateParams = new GenerateOrderParams([
            false,                      // generateListingItemTemplate
            false,                      // generateListingItem
            false,                      // generateBid
            false,                      // generateOrderItems
            listingItem.hash,           // listingItemhash
            bid.id,                     // bidId
            buyerProfile.address,       // bidder
            sellerProfile.address       // seller
        ]);

        const orders: resources.Order[] = await testDataService.generate({
            model: CreatableModel.ORDER,
            amount: 1,
            withRelated: true,
            generateParams: orderGenerateParams.toParamsArray()
        } as TestDataGenerateRequest);

        order = orders[0];
        log.debug('order: ', JSON.stringify(order, null, 2));

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
            itemHash: bid.ListingItem.hash,
            bid_id: bid.id,
            status: OrderItemStatus.AWAITING_ESCROW,
            order_id: order.id
        } as OrderItemCreateRequest;

        orderItem = await orderItemService.create(testData).then(value => value.toJSON());
        expect(orderItem.status).toBe(testData.status);
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
        expect(result.itemHash).toBe(orderItem.itemHash);
        expect(result.status).toBe(orderItem.status);
    });

    test('Should return one OrderItem', async () => {
        orderItem = await orderItemService.findOne(orderItem.id).then(value => value.toJSON());
        const result = orderItem;
        expect(result.itemHash).toBe(orderItem.itemHash);
        expect(result.status).toBe(orderItem.status);
        expect(result.Order.id).toBe(order.id);
        expect(result.Bid.id).toBe(bid.id);
    });

    test('Should update the OrderItem', async () => {
        const testDataUpdated = {
            itemHash: bid.ListingItem.hash,
            status: OrderItemStatus.SHIPPING
        } as OrderItemUpdateRequest;

        orderItem = await orderItemService.update(orderItem.id, testDataUpdated).then(value => value.toJSON());
        const result = orderItem;
        expect(result.itemHash).toBe(testDataUpdated.itemHash);
        expect(result.status).toBe(testDataUpdated.status);
        expect(result.Order.id).toBe(order.id);
        expect(result.Bid.id).toBe(bid.id);
    });

    test('Should delete the OrderItem', async () => {
        expect.assertions(1);
        await orderItemService.destroy(orderItem.id);
        await orderItemService.findOne(orderItem.id).catch(e =>
            expect(e).toEqual(new NotFoundException(orderItem.id))
        );
    });
});
