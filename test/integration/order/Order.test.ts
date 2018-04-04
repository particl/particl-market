import { app } from '../../../src/app';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { Types, Core, Targets } from '../../../src/constants';
import { TestUtil } from '../lib/TestUtil';
import { TestDataService } from '../../../src/api/services/TestDataService';

import { ValidationException } from '../../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../../src/api/exceptions/NotFoundException';

import { Order } from '../../../src/api/models/Order';

import { OrderService } from '../../../src/api/services/OrderService';
import { OrderCreateRequest } from '../../../src/api/requests/OrderCreateRequest';
import { OrderItemCreateRequest } from '../../../src/api/requests/OrderItemCreateRequest';
import { OrderStatus } from '../../../src/api/enums/OrderStatus';
import { OrderItemObjectCreateRequest } from '../../../src/api/requests/OrderItemObjectCreateRequest';
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
import * as listingItemCreateRequestBasic3 from '../../testdata/createrequest/listingItemCreateRequestBasic3.json';

import * as bidCreateRequest1 from '../../testdata/createrequest/bidCreateRequestMPA_BID.json';
import * as orderCreateRequest1 from '../../testdata/createrequest/orderCreateRequest1.json';
import * as resources from 'resources';


describe('Order', () => {

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
    let createdListingItem1: resources.ListingItem;
    let createdListingItem2: resources.ListingItem;
    let createdListingItemTemplate: resources.ListingItemTemplate;
    let createdBid1: resources.Bid;
    let createdBid2: resources.Bid;

    const testData: OrderCreateRequest = orderCreateRequest1;

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

        // get market
        const defaultMarketModel = await marketService.getDefault();
        defaultMarket = defaultMarketModel.toJSON();

        // generate template
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateShippingDestinations
            true,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            true    // generateListingItemObjects
        ]).toParamsArray();
        const listingItemTemplates = await testDataService.generate({
            model: CreatableModel.LISTINGITEMTEMPLATE,  // what to generate
            amount: 1,                                  // how many to generate
            withRelated: true,                          // return model
            generateParams: generateListingItemTemplateParams // what kind of data to generate
        } as TestDataGenerateRequest);
        createdListingItemTemplate = listingItemTemplates[0].toJSON();
        log.debug('createdListingItemTemplate: ', createdListingItemTemplate.id);

        // create listing item
        listingItemCreateRequestBasic1.market_id = defaultMarket.id;
        listingItemCreateRequestBasic1.listing_item_template_id = listingItemTemplates[0].id;
        const createdListingItemModel1 = await listingItemService.create(listingItemCreateRequestBasic1);
        createdListingItem1 = createdListingItemModel1.toJSON();
        log.debug('createdListingItem1: ', createdListingItem1.id);
        log.debug('createdListingItem1: ', createdListingItem1.hash);

        // create another listing item
        listingItemCreateRequestBasic2.market_id = defaultMarket.id;
        const createdListingItemModel2 = await listingItemService.create(listingItemCreateRequestBasic2);
        createdListingItem2 = createdListingItemModel2.toJSON();
        log.debug('createdListingItem2: ', createdListingItem2.id);
        log.debug('createdListingItem2: ', createdListingItem2.hash);

        // create a new bid for ListingItem that is being sold by local profile
        bidCreateRequest1.listing_item_id = createdListingItem1.id;
        bidCreateRequest1.bidder = createdListingItem1.ListingItemTemplate.Profile.address;
        const bidModel1: Bid = await bidService.create(bidCreateRequest1);
        createdBid1 = bidModel1.toJSON();
        log.debug('createdBid1:', createdBid1);

        // create a new bid for ListingItem that is being bought by local profile
        bidCreateRequest1.listing_item_id = createdListingItem2.id;
        bidCreateRequest1.bidder = defaultProfile.address;
        const bidModel2: Bid = await bidService.create(bidCreateRequest1);
        createdBid2 = bidModel2.toJSON();
        log.debug('createdBid2:', createdBid2);

    });

    afterAll(async () => {
        //
    });

    test('Should create a new order', async () => {

        // set some values
        testData.address_id = createdBid1.ShippingAddress.id;
        testData.buyer = createdBid1.bidder;
        testData.seller = createdListingItem1.ListingItemTemplate.Profile.address;

/*
        "address_id": 0,
        "buyer": "CHANGE",
        "seller": "CHANGE",
        "orderItems": [{
            "listing_item_id": 0,
            "bid_id": 0,
            "status": "AWAITING_ESCROW",
            "orderItemObjects": [{
                "dataId": "testid",
                "dataValue": "testdata"
            }]
        }]
*/
        const orderModel: Order = await orderService.create(testData);


        createdId = orderModel.Id;

        const result = orderModel.toJSON();

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.hash).toBe(testData.hash);
    });

    test('Should throw ValidationException because we want to create a empty order', async () => {
        expect.assertions(1);
        await orderService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list orders with our new create one', async () => {
        const orderCollection = await orderService.findAll();
        const order = orderCollection.toJSON();
        expect(order.length).toBe(1);

        const result = order[0];

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.hash).toBe(testData.hash);
    });

    test('Should return one order', async () => {
        const orderModel: Order = await orderService.findOne(createdId);
        const result = orderModel.toJSON();

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.hash).toBe(testData.hash);
    });

    /*
    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await orderService.update(createdId, testDataUpdated).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });
    */

    test('Should update the order', async () => {
        // testDataUpdated['related_id'] = 0;
        const orderModel: Order = await orderService.update(createdId, testDataUpdated);
        const result = orderModel.toJSON();

        // test the values
        // expect(result.value).toBe(testDataUpdated.value);
        expect(result.hash).toBe(testDataUpdated.hash);
    });

    test('Should delete the order', async () => {
        expect.assertions(1);
        await orderService.destroy(createdId);
        await orderService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

});
