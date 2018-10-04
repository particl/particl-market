// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { Order } from '../../src/api/models/Order';
import { OrderService } from '../../src/api/services/OrderService';
import { OrderCreateRequest } from '../../src/api/requests/OrderCreateRequest';
import { ProfileService } from '../../src/api/services/ProfileService';
import { ListingItemService } from '../../src/api/services/ListingItemService';
import { MarketService } from '../../src/api/services/MarketService';
import { BidService } from '../../src/api/services/BidService';
import { GenerateListingItemTemplateParams } from '../../src/api/requests/params/GenerateListingItemTemplateParams';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { TestDataGenerateRequest } from '../../src/api/requests/TestDataGenerateRequest';
import * as orderCreateRequest1 from '../testdata/createrequest/orderCreateRequest1.json';
import * as resources from 'resources';
import { GenerateProfileParams } from '../../src/api/requests/params/GenerateProfileParams';
import { AddressType } from '../../src/api/enums/AddressType';
import { HashableObjectType } from '../../src/api/enums/HashableObjectType';
import { ObjectHash } from '../../src/core/helpers/ObjectHash';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { OrderItemService } from '../../src/api/services/OrderItemService';
import { OrderItemObjectService } from '../../src/api/services/OrderItemObjectService';
import { GenerateBidParams } from '../../src/api/requests/params/GenerateBidParams';
import { BidMessageType } from '../../src/api/enums/BidMessageType';


describe('Order', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let orderService: OrderService;
    let orderItemService: OrderItemService;
    let orderItemObjectService: OrderItemObjectService;
    let bidService: BidService;
    let marketService: MarketService;
    let profileService: ProfileService;
    let listingItemService: ListingItemService;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;
    let createdSellerProfile: resources.Profile;
    let createdListingItem1: resources.ListingItem;
    let createdListingItem2: resources.ListingItem;
    let createdListingItemTemplate1: resources.ListingItemTemplate;
    let createdListingItemTemplate2: resources.ListingItemTemplate;
    let createdBid1: resources.Bid;

    let createdOrder: resources.Order;

    // let testData: OrderCreateRequest = orderCreateRequest1;

    const testDataUpdated = {
        hash: undefined // TODO: Add test value
    };

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        orderService = app.IoC.getNamed<OrderService>(Types.Service, Targets.Service.OrderService);
        orderItemService = app.IoC.getNamed<OrderItemService>(Types.Service, Targets.Service.OrderItemService);
        orderItemObjectService = app.IoC.getNamed<OrderItemObjectService>(Types.Service, Targets.Service.OrderItemObjectService);
        bidService = app.IoC.getNamed<BidService>(Types.Service, Targets.Service.BidService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.MarketService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.ProfileService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.ListingItemService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        // get default profile
        const defaultProfileModel = await profileService.getDefault();
        defaultProfile = defaultProfileModel.toJSON();
        // log.debug('defaultProfile: ', defaultProfile);

        // get market
        const defaultMarketModel = await marketService.getDefault();
        defaultMarket = defaultMarketModel.toJSON();
        // log.debug('defaultMarket: ', defaultMarket);

        // generate a seller profile in addition to the default one used for buyer
        const generateProfileParams = new GenerateProfileParams().toParamsArray();
        const profiles = await testDataService.generate({
            model: CreatableModel.PROFILE,              // what to generate
            amount: 1,                                  // how many to generate
            withRelated: true,                          // return model
            generateParams: generateProfileParams       // what kind of data to generate
        } as TestDataGenerateRequest);
        createdSellerProfile = profiles[0];
        // log.debug('createdSellerProfile: ', createdSellerProfile.id);

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateShippingDestinations
            false,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            false,  // generateListingItemObjects
            false,  // generateObjectDatas
            createdSellerProfile.id, // profileId
            true,   // generateListingItem
            defaultMarket.id  // marketId
        ]).toParamsArray();

        // generate two ListingItemTemplates with ListingItems
        const listingItemTemplates = await testDataService.generate({
            model: CreatableModel.LISTINGITEMTEMPLATE,          // what to generate
            amount: 2,                                          // how many to generate
            withRelated: true,                                  // return model
            generateParams: generateListingItemTemplateParams   // what kind of data to generate
        } as TestDataGenerateRequest);

        createdListingItemTemplate1 = listingItemTemplates[0];
        createdListingItemTemplate2 = listingItemTemplates[1];
        createdListingItem1 = listingItemTemplates[0].ListingItems[0];
        createdListingItem2 = listingItemTemplates[1].ListingItems[0];

        // log.debug('createdListingItem1.hash: ', JSON.stringify(createdListingItem1.hash, null, 2));
        // log.debug('createdListingItem2.hash: ', JSON.stringify(createdListingItem2.hash, null, 2));

        // create a new bid from defaultProfile for ListingItem that is being sold by createdSellerProfile
        const bidParams = new GenerateBidParams([
            false,                              // generateListingItemTemplate
            false,                              // generateListingItem
            createdListingItem1.hash,           // listingItemhash
            BidMessageType.MPA_BID,             // action
            defaultProfile.address,             // bidder
            createdSellerProfile.address        // listingItemSeller
        ]).toParamsArray();

        const bids = await testDataService.generate({
            model: CreatableModel.BID,
            amount: 1,
            withRelated: true,
            generateParams: bidParams
        } as TestDataGenerateRequest).catch(reason => {
            log.error('REASON:', JSON.stringify(reason, null, 2));
        });
        createdBid1 = bids[0];

        // log.debug('createdBid1: ', JSON.stringify(createdBid1, null, 2));

/*
        // create a new bid for ListingItem that is being bought by local profile
        bidCreateRequest2.listing_item_id = createdListingItem2.id;
        bidCreateRequest2.bidder = defaultProfile.address;
        bidCreateRequest2.address.profile_id = defaultProfile.id;
        const bidModel2: Bid = await bidService.create(bidCreateRequest2);
        createdBid2 = bidModel2.toJSON();
        log.debug('createdBid2:', createdBid2);
*/

        // TODO: after-alpha ValidationException: Request body is not valid, should explain why
    });

    afterAll(async () => {
        //
    });

    test('Should create a new Order', async () => {
        const testData = JSON.parse(JSON.stringify(orderCreateRequest1));

        // set some order values
        testData.buyer = createdBid1.bidder;
        testData.seller = createdListingItem1.seller;
        testData.orderItems[0].itemHash = createdListingItem1.hash;
        testData.orderItems[0].bid_id = createdBid1.id;
        testData.orderItems[0].orderItemObjects = [{
            dataId: createdBid1.BidDatas[0].dataId,
            dataValue: createdBid1.BidDatas[0].dataValue
        }, {
            dataId: createdBid1.BidDatas[1].dataId,
            dataValue: createdBid1.BidDatas[1].dataValue
        }];

        // copy the address from bid to order
        testData.address = {
            firstName: createdBid1.ShippingAddress.firstName,
            lastName: createdBid1.ShippingAddress.lastName,
            title: 'SHIPPING_ADDRESS_FOR_ORDER',
            addressLine1: createdBid1.ShippingAddress.addressLine1,
            addressLine2: createdBid1.ShippingAddress.addressLine2,
            city: createdBid1.ShippingAddress.city,
            state: createdBid1.ShippingAddress.state,
            country: createdBid1.ShippingAddress.country,
            zipCode: createdBid1.ShippingAddress.zipCode,
            type: AddressType.SHIPPING_ORDER,
            profile_id: createdBid1.ShippingAddress.profileId
        };

        // log.debug('order testData: ', JSON.stringify(testData, null, 2));

        // save order
        const orderModel: Order = await orderService.create(testData);
        const result = orderModel.toJSON();
        createdOrder = result;

        // log.debug('order result: ', JSON.stringify(result, null, 2));

        // test the result
        expect(result.hash).toBe(ObjectHash.getHash(testData, HashableObjectType.ORDER_CREATEREQUEST));

    }, 600000);

    test('Should throw ValidationException because we want to create a empty Order', async () => {
        expect.assertions(1);
        await orderService.create({} as OrderCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list Orders with the newly created one', async () => {

        const orderCollection = await orderService.findAll();
        const order = orderCollection.toJSON();
        expect(order.length).toBe(1);

        const result = order[0];

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.hash).toBe(createdOrder.hash);
    });

    test('Should return one Order', async () => {
        const orderModel: Order = await orderService.findOne(createdOrder.id);
        const result = orderModel.toJSON();

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.hash).toBe(createdOrder.hash);
    });

    test('Should delete the Order, related OrderItem and OrderItemObjects', async () => {
        expect.assertions(4);
        await orderService.destroy(createdOrder.id);
        await orderService.findOne(createdOrder.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdOrder.id))
        );
        await orderItemService.findOne(createdOrder.OrderItems[0].id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdOrder.OrderItems[0].id))
        );
        await orderItemObjectService.findOne(createdOrder.OrderItems[0].OrderItemObjects[0].id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdOrder.OrderItems[0].OrderItemObjects[0].id))
        );
        await orderItemObjectService.findOne(createdOrder.OrderItems[0].OrderItemObjects[1].id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdOrder.OrderItems[0].OrderItemObjects[1].id))
        );
    });

});
