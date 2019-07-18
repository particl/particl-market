// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
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
import { GenerateListingItemTemplateParams } from '../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { TestDataGenerateRequest } from '../../src/api/requests/testdata/TestDataGenerateRequest';
import { GenerateProfileParams } from '../../src/api/requests/testdata/GenerateProfileParams';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { OrderItemService } from '../../src/api/services/model/OrderItemService';
import { GenerateBidParams } from '../../src/api/requests/testdata/GenerateBidParams';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { OrderStatus } from '../../src/api/enums/OrderStatus';
import { OrderItemCreateRequest } from '../../src/api/requests/model/OrderItemCreateRequest';
import { OrderItemStatus } from '../../src/api/enums/OrderItemStatus';

describe('Order', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let orderService: OrderService;
    let orderItemService: OrderItemService;
    let bidService: BidService;
    let marketService: MarketService;
    let profileService: ProfileService;
    let listingItemService: ListingItemService;

    let defaultMarket: resources.Market;
    let defaultProfile: resources.Profile;
    let sellerProfile: resources.Profile;

    let listingItem1: resources.ListingItem;
    let listingItem2: resources.ListingItem;
    let listingItemTemplate1: resources.ListingItemTemplate;
    let listingItemTemplate2: resources.ListingItemTemplate;
    let bid: resources.Bid;
    let order: resources.Order;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        orderService = app.IoC.getNamed<OrderService>(Types.Service, Targets.Service.model.OrderService);
        orderItemService = app.IoC.getNamed<OrderItemService>(Types.Service, Targets.Service.model.OrderItemService);
        bidService = app.IoC.getNamed<BidService>(Types.Service, Targets.Service.model.BidService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.model.ListingItemService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        defaultProfile = await profileService.getDefault().then(value => value.toJSON());
        defaultMarket = await marketService.getDefaultForProfile(defaultProfile.id).then(value => value.toJSON());

        // generate seller profile
        const generateParams = new GenerateProfileParams([true, true, true]).toParamsArray();
        const profiles: resources.Profile[] = await testDataService.generate({
            model: CreatableModel.PROFILE,
            amount: 1,
            withRelated: true,
            generateParams
        } as TestDataGenerateRequest);
        sellerProfile = profiles[0];

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,               // generateItemInformation
            true,               // generateItemLocation
            true,               // generateShippingDestinations
            false,              // generateItemImages
            true,               // generatePaymentInformation
            true,               // generateEscrow
            true,               // generateItemPrice
            true,               // generateMessagingInformation
            false,              // generateListingItemObjects
            false,              // generateObjectDatas
            sellerProfile.id,   // profileId
            true,               // generateListingItem
            defaultMarket.id    // marketId
        ]).toParamsArray();

        // generate two ListingItemTemplates with ListingItems
        const listingItemTemplates: resources.ListingItemTemplate[] = await testDataService.generate({
            model: CreatableModel.LISTINGITEMTEMPLATE,          // what to generate
            amount: 2,                                          // how many to generate
            withRelated: true,                                  // return model
            generateParams: generateListingItemTemplateParams   // what kind of data to generate
        } as TestDataGenerateRequest);

        listingItemTemplate1 = listingItemTemplates[0];
        listingItemTemplate2 = listingItemTemplates[1];
        listingItem1 = listingItemTemplates[0].ListingItems[0];
        listingItem2 = listingItemTemplates[1].ListingItems[0];

        // create a new bid from defaultProfile for ListingItem that is being sold by sellerProfile
        const bidParams = new GenerateBidParams([
            false,                       // generateListingItemTemplate
            false,                       // generateListingItem
            listingItem1.hash,           // listingItemhash
            MPAction.MPA_BID,            // type
            defaultProfile.address,      // bidder
            sellerProfile.address        // seller
        ]).toParamsArray();

        const bids: resources.Bid[] = await testDataService.generate({
            model: CreatableModel.BID,
            amount: 1,
            withRelated: true,
            generateParams: bidParams
        } as TestDataGenerateRequest);
        bid = bids[0];

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
        const testData = {
            hash: 'WILLBESETWHENSAVED',
            status: OrderStatus.PROCESSING,
            buyer: bid.bidder,
            seller: listingItem1.seller,
            orderItems: [{
                itemHash: listingItem1.hash,
                status: OrderItemStatus.BIDDED,
                bid_id: bid.id
            }] as OrderItemCreateRequest[],
            generatedAt: +new Date().getTime()
        } as OrderCreateRequest;

        testData.address_id = bid.ShippingAddress.id;

        // copy the address from bid to order
        /*
        testData.address = {
            firstName: bid.ShippingAddress.firstName,
            lastName: bid.ShippingAddress.lastName,
            title: 'SHIPPING_ADDRESS_FOR_ORDER',
            addressLine1: bid.ShippingAddress.addressLine1,
            addressLine2: bid.ShippingAddress.addressLine2,
            city: bid.ShippingAddress.city,
            state: bid.ShippingAddress.state,
            country: bid.ShippingAddress.country,
            zipCode: bid.ShippingAddress.zipCode,
            type: AddressType.SHIPPING_ORDER,
            profile_id: bid.ShippingAddress.profileId
        } as AddressCreateRequest;
        */

        log.debug('order testData: ', JSON.stringify(testData, null, 2));

        // save order
        order = await orderService.create(testData).then(value => value.toJSON());

        // test the result
        // expect(order.hash).toBe(ObjectHashDeprecated.getHash(testData, HashableObjectTypeDeprecated.ORDER_CREATEREQUEST));

    }, 600000); // timeout to 600s


    test('Should throw ValidationException because we want to create a empty Order', async () => {
        expect.assertions(1);
        await orderService.create({} as OrderCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list Orders with the newly created one', async () => {
        const orders: resources.Order = await orderService.findAll().then(value => value.toJSON());
        expect(orders.length).toBe(1);
        expect(orders[0].hash).toBe(order.hash);
    });

    test('Should return one Order', async () => {
        const result: resources.Order = await orderService.findOne(order.id).then(value => value.toJSON());
        expect(result.hash).toBe(order.hash);
    });

    test('Should delete the Order, related OrderItem', async () => {
        expect.assertions(2);
        await orderService.destroy(order.id);
        await orderService.findOne(order.id).catch(e =>
            expect(e).toEqual(new NotFoundException(order.id))
        );
        await orderItemService.findOne(order.OrderItems[0].id).catch(e =>
            expect(e).toEqual(new NotFoundException(order.OrderItems[0].id))
        );
    });

});
