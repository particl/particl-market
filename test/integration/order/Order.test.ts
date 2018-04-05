import { app } from '../../../src/app';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { Types, Core, Targets } from '../../../src/constants';
import { TestUtil } from '../lib/TestUtil';
import { TestDataService } from '../../../src/api/services/TestDataService';

import { Order } from '../../../src/api/models/Order';

import { OrderService } from '../../../src/api/services/OrderService';
import { OrderCreateRequest } from '../../../src/api/requests/OrderCreateRequest';

import { ProfileService } from '../../../src/api/services/ProfileService';
import { ListingItemService } from '../../../src/api/services/ListingItemService';
import { MarketService } from '../../../src/api/services/MarketService';
import { BidService } from '../../../src/api/services/BidService';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/params/GenerateListingItemTemplateParams';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { TestDataGenerateRequest } from '../../../src/api/requests/TestDataGenerateRequest';
import { Bid } from '../../../src/api/models/Bid';

import * as listingItemCreateRequestBasic1 from '../../testdata/createrequest/listingItemCreateRequestBasic1.json';
import * as listingItemCreateRequestBasic2 from '../../testdata/createrequest/listingItemCreateRequestBasic2.json';

import * as bidCreateRequest1 from '../../testdata/createrequest/bidCreateRequestMPA_BID.json';
import * as orderCreateRequest1 from '../../testdata/createrequest/orderCreateRequest1.json';
import * as resources from 'resources';

import { GenerateProfileParams } from '../../../src/api/requests/params/GenerateProfileParams';
import { AddressType } from '../../../src/api/enums/AddressType';
import { AddressCreateRequest } from '../../../src/api/requests/AddressCreateRequest';
import { HashableObjectType } from '../../../src/api/enums/HashableObjectType';
import { ObjectHash } from '../../../src/core/helpers/ObjectHash';
import { ValidationException } from '../../../src/api/exceptions/ValidationException';
import {NotFoundException} from '../../../src/api/exceptions/NotFoundException';


describe('Order', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let orderService: OrderService;
    let bidService: BidService;
    let marketService: MarketService;
    let profileService: ProfileService;
    let listingItemService: ListingItemService;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;
    let createdSellerProfile: resources.Profile;
    let createdListingItem1: resources.ListingItem;
    let createdListingItem2: resources.ListingItem;
    let createdListingItemTemplate: resources.ListingItemTemplate;
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
        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        bidService = app.IoC.getNamed<BidService>(Types.Service, Targets.Service.BidService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.MarketService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.ProfileService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.ListingItemService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        // get default profile
        const defaultProfileModel = await profileService.getDefault();
        defaultProfile = defaultProfileModel.toJSON();
        log.debug('defaultProfile: ', defaultProfile);

        // get market
        const defaultMarketModel = await marketService.getDefault();
        defaultMarket = defaultMarketModel.toJSON();
        log.debug('defaultMarket: ', defaultMarket);

        // generate a seller profile in addition to the default one used for buyer
        const generateProfileParams = new GenerateProfileParams().toParamsArray();
        const profiles = await testDataService.generate({
            model: CreatableModel.PROFILE,              // what to generate
            amount: 1,                                  // how many to generate
            withRelated: true,                          // return model
            generateParams: generateProfileParams       // what kind of data to generate
        } as TestDataGenerateRequest);
        createdSellerProfile = profiles[0].toJSON();
        log.debug('createdSellerProfile: ', createdSellerProfile.id);

        // generate template
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams().toParamsArray();
        const listingItemTemplates = await testDataService.generate({
            model: CreatableModel.LISTINGITEMTEMPLATE,          // what to generate
            amount: 1,                                          // how many to generate
            withRelated: true,                                  // return model
            generateParams: generateListingItemTemplateParams   // what kind of data to generate
        } as TestDataGenerateRequest);
        createdListingItemTemplate = listingItemTemplates[0].toJSON();
        log.debug('createdListingItemTemplate: ', createdListingItemTemplate.id);

        // create listing item, seller = createdSellerProfile
        listingItemCreateRequestBasic1.market_id = defaultMarket.id;
        listingItemCreateRequestBasic1.listing_item_template_id = listingItemTemplates[0].id;
        listingItemCreateRequestBasic1.seller = createdSellerProfile.address;
        const createdListingItemModel1 = await listingItemService.create(listingItemCreateRequestBasic1);
        createdListingItem1 = createdListingItemModel1.toJSON();
        log.debug('createdListingItem1: ', createdListingItem1.id);
        log.debug('createdListingItem1: ', createdListingItem1.hash);

        // create another listing item, seller = createdSellerProfile
        listingItemCreateRequestBasic2.market_id = defaultMarket.id;
        listingItemCreateRequestBasic2.seller = createdSellerProfile.address;
        const createdListingItemModel2 = await listingItemService.create(listingItemCreateRequestBasic2);
        createdListingItem2 = createdListingItemModel2.toJSON();
        log.debug('createdListingItem2: ', createdListingItem2.id);
        log.debug('createdListingItem2: ', createdListingItem2.hash);

        // create a new bid from defaultProfile for ListingItem that is being sold by createdSellerProfile
        bidCreateRequest1.listing_item_id = createdListingItem1.id;
        bidCreateRequest1.bidder = createdListingItem1.ListingItemTemplate.Profile.address;
        bidCreateRequest1.address.profile_id = defaultProfile.id;  // bidder/seller profile

        const bidModel1: Bid = await bidService.create(bidCreateRequest1);
        createdBid1 = bidModel1.toJSON();

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

        log.debug('order result: ', JSON.stringify(result, null, 2));

        // test the result
        expect(result.hash).toBe(ObjectHash.getHash(testData, HashableObjectType.ORDER_CREATEREQUEST));

    });

    test('Should throw ValidationException because we want to create a empty Order', async () => {
        expect.assertions(1);
        await orderService.create({} as OrderCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list Orders with our new create one', async () => {

        const orderCollection = await orderService.findAll();
        const order = orderCollection.toJSON();
        expect(order.length).toBe(1);

        const result = order[0];

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.hash).toBe(createdOrder.hash);
    });

    test('Should return one order', async () => {
        const orderModel: Order = await orderService.findOne(createdOrder.id);
        const result = orderModel.toJSON();

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.hash).toBe(createdOrder.hash);
    });

    test('Should delete the order', async () => {
        expect.assertions(1);
        await orderService.destroy(createdOrder.id);
        await orderService.findOne(createdOrder.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdOrder.id))
        );
    });

});
