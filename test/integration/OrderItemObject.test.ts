// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { OrderItemObject } from '../../src/api/models/OrderItemObject';
import { OrderItemObjectService } from '../../src/api/services/OrderItemObjectService';
import { OrderItemObjectCreateRequest } from '../../src/api/requests/OrderItemObjectCreateRequest';
import { OrderItemObjectUpdateRequest } from '../../src/api/requests/OrderItemObjectUpdateRequest';
import { GenerateBidParams } from '../../src/api/requests/params/GenerateBidParams';
import { OrderItemService } from '../../src/api/services/OrderItemService';
import { ProfileService } from '../../src/api/services/ProfileService';
import { BidMessageType } from '../../src/api/enums/BidMessageType';
import { GenerateListingItemTemplateParams } from '../../src/api/requests/params/GenerateListingItemTemplateParams';
import { GenerateOrderParams } from '../../src/api/requests/params/GenerateOrderParams';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { TestDataGenerateRequest } from '../../src/api/requests/TestDataGenerateRequest';
import { MarketService } from '../../src/api/services/MarketService';
import { GenerateProfileParams } from '../../src/api/requests/params/GenerateProfileParams';
import * as resources from 'resources';

describe('OrderItemObject', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let orderItemService: OrderItemService;
    let orderItemObjectService: OrderItemObjectService;
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
    let createdOrderItemObject: resources.OrderItemObject;

    const testData = {
        dataId: 'id1',
        dataValue: 'value1'
    } as OrderItemObjectCreateRequest;

    const testDataUpdated = {
        dataId: 'id2',
        dataValue: 'value2'
    } as OrderItemObjectUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        orderItemService = app.IoC.getNamed<OrderItemService>(Types.Service, Targets.Service.OrderItemService);
        orderItemObjectService = app.IoC.getNamed<OrderItemObjectService>(Types.Service, Targets.Service.OrderItemObjectService);
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

        // log.debug('createdListingItem.hash: ', JSON.stringify(createdListingItem.hash, null, 2));

        // create a new bid from defaultProfile for ListingItem that is being sold by createdSellerProfile
        const bidParams = new GenerateBidParams([
            false,                      // generateListingItemTemplate
            false,                      // generateListingItem
            createdListingItem.hash,    // listingItemhash
            BidMessageType.MPA_ACCEPT,  // action
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

        // log.debug('createdBid: ', JSON.stringify(createdBid, null, 2));

        const orderGenerateParams = new GenerateOrderParams([
            false,                      // generateListingItemTemplate
            false,                      // generateListingItem
            false,                      // generateBid
            true,                       // generateOrderItems
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
        createdOrderItem = generatedOrders[0].OrderItems[0];
        // log.debug('createdOrder: ', JSON.stringify(createdOrder, null, 2));
        // log.debug('createdOrderItem: ', JSON.stringify(createdOrderItem, null, 2));

    }, 1200000); // timeout to 1200s

    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await orderItemObjectService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new OrderItemObject', async () => {
        testData.order_item_id = createdOrderItem.id;

        const orderItemObjectModel: OrderItemObject = await orderItemObjectService.create(testData);
        createdOrderItemObject = orderItemObjectModel.toJSON();

        expect(createdOrderItemObject.dataId).toBe(testData.dataId);
        expect(createdOrderItemObject.dataValue).toBe(testData.dataValue);
    });

    test('Should throw ValidationException because we want to create a empty OrderItemObject', async () => {
        expect.assertions(1);
        await orderItemObjectService.create({} as OrderItemObjectCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list OrderItemObjects with our newly created one', async () => {
        const orderItemObjectCollection = await orderItemObjectService.findAll();
        const orderItemObjects = orderItemObjectCollection.toJSON();

        expect(orderItemObjects.length).toBe(18);

        const result = orderItemObjects[17];

        expect(result.dataId).toBe(testData.dataId);
        expect(result.dataValue).toBe(testData.dataValue);
    });

    test('Should return one OrderItemObject', async () => {
        const orderItemObjectModel: OrderItemObject = await orderItemObjectService.findOne(createdOrderItemObject.id);
        const result = orderItemObjectModel.toJSON();

        expect(result.dataId).toBe(testData.dataId);
        expect(result.dataValue).toBe(testData.dataValue);
        expect(result.OrderItem.id).toBe(testData.order_item_id);
    });

    test('Should update the OrderItemObject', async () => {
        // testDataUpdated['related_id'] = 0;
        const orderItemObjectModel: OrderItemObject = await orderItemObjectService.update(createdOrderItemObject.id, testDataUpdated);
        const result = orderItemObjectModel.toJSON();

        // test the values
        expect(result.dataId).toBe(testDataUpdated.dataId);
        expect(result.dataValue).toBe(testDataUpdated.dataValue);
    });

    test('Should delete the OrderItemObject', async () => {
        expect.assertions(1);
        await orderItemObjectService.destroy(createdOrderItemObject.id);
        await orderItemObjectService.findOne(createdOrderItemObject.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdOrderItemObject.id))
        );
    });

});
