// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { OrderItemObjectService } from '../../src/api/services/OrderItemObjectService';
import { OrderItemObjectCreateRequest } from '../../src/api/requests/OrderItemObjectCreateRequest';
import { OrderItemObjectUpdateRequest } from '../../src/api/requests/OrderItemObjectUpdateRequest';
import { GenerateBidParams } from '../../src/api/requests/params/GenerateBidParams';
import { OrderItemService } from '../../src/api/services/OrderItemService';
import { ProfileService } from '../../src/api/services/ProfileService';
import { GenerateListingItemTemplateParams } from '../../src/api/requests/params/GenerateListingItemTemplateParams';
import { GenerateOrderParams } from '../../src/api/requests/params/GenerateOrderParams';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { TestDataGenerateRequest } from '../../src/api/requests/TestDataGenerateRequest';
import { MarketService } from '../../src/api/services/MarketService';
import { GenerateProfileParams } from '../../src/api/requests/params/GenerateProfileParams';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';

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

    let listingItemTemplate: resources.ListingItemTemplate;
    let listingItem: resources.ListingItem;
    let bid: resources.Bid;
    let order: resources.Order;
    let orderItem: resources.OrderItem;
    let orderItemObject: resources.OrderItemObject;

    const testData = {
        key: 'id1',
        value: 'value1'
    } as OrderItemObjectCreateRequest;

    const testDataUpdated = {
        key: 'id2',
        value: 'value2'
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

        defaultMarket = await marketService.getDefault().then(value => value.toJSON());
        buyerProfile = await profileService.getDefault().then(value => value.toJSON());

        // generate a seller profile in addition to the default one used for buyer
        const generateProfileParams = new GenerateProfileParams().toParamsArray();
        const profiles = await testDataService.generate({
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

        // generate two ListingItemTemplates with ListingItems
        const listingItemTemplates: resources.ListingItemTemplate[] = await testDataService.generate({
            model: CreatableModel.LISTINGITEMTEMPLATE,          // what to generate
            amount: 1,                                          // how many to generate
            withRelated: true,                                  // return model
            generateParams: generateListingItemTemplateParams   // what kind of data to generate
        } as TestDataGenerateRequest);

        listingItemTemplate = listingItemTemplates[0];
        listingItem = listingItemTemplates[0].ListingItems[0];

        // log.debug('listingItem.hash: ', JSON.stringify(listingItem.hash, null, 2));

        // create a new bid from defaultProfile for ListingItem that is being sold by createdSellerProfile
        const bidParams = new GenerateBidParams([
            false,                      // generateListingItemTemplate
            false,                      // generateListingItem
            listingItem.hash,    // listingItemhash
            MPAction.MPA_ACCEPT,  // type
            buyerProfile.address,       // bidder
            sellerProfile.address       // seller
        ]).toParamsArray();

        const bids: resources.Bid[] = await testDataService.generate({
            model: CreatableModel.BID,
            amount: 1,
            withRelated: true,
            generateParams: bidParams
        } as TestDataGenerateRequest).catch(reason => {
            log.error('REASON:', JSON.stringify(reason, null, 2));
        });
        bid = bids[0];

        // log.debug('bid: ', JSON.stringify(bid, null, 2));

        const orderGenerateParams = new GenerateOrderParams([
            false,                      // generateListingItemTemplate
            false,                      // generateListingItem
            false,                      // generateBid
            true,                       // generateOrderItems
            listingItem.hash,    // listingItemhash
            bid.id,              // bidId
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
        orderItem = orders[0].OrderItems[0];
        // log.debug('order: ', JSON.stringify(order, null, 2));
        // log.debug('orderItem: ', JSON.stringify(orderItem, null, 2));

    }, 1200000); // timeout to 1200s

    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await orderItemObjectService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new OrderItemObject', async () => {
        testData.order_item_id = orderItem.id;

        orderItemObject = await orderItemObjectService.create(testData).then(value => value.toJSON());

        expect(orderItemObject.key).toBe(testData.key);
        expect(orderItemObject.value).toBe(testData.value);
    });

    test('Should throw ValidationException because we want to create a empty OrderItemObject', async () => {
        expect.assertions(1);
        await orderItemObjectService.create({} as OrderItemObjectCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list OrderItemObjects with our newly created one', async () => {
        const orderItemObjects: resources.OrderItemObject[] = await orderItemObjectService.findAll()
            .then(value => value.toJSON());

        expect(orderItemObjects.length).toBe(18);

        const result = orderItemObjects[17];
        expect(result.key).toBe(testData.key);
        expect(result.value).toBe(testData.value);
    });

    test('Should return one OrderItemObject', async () => {
        const result: resources.OrderItemObject = await orderItemObjectService.findOne(orderItemObject.id)
            .then(value => value.toJSON());

        expect(result.key).toBe(testData.key);
        expect(result.value).toBe(testData.value);
        expect(result.OrderItem.id).toBe(testData.order_item_id);
    });

    test('Should update the OrderItemObject', async () => {
        const result: resources.OrderItemObject = await orderItemObjectService.update(orderItemObject.id, testDataUpdated)
            .then(value => value.toJSON());

        // test the values
        expect(result.key).toBe(testDataUpdated.key);
        expect(result.value).toBe(testDataUpdated.value);
    });

    test('Should delete the OrderItemObject', async () => {
        expect.assertions(1);
        await orderItemObjectService.destroy(orderItemObject.id);
        await orderItemObjectService.findOne(orderItemObject.id).catch(e =>
            expect(e).toEqual(new NotFoundException(orderItemObject.id))
        );
    });

});
