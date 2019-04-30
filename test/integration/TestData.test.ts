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
import { ItemCategoryService } from '../../src/api/services/model/ItemCategoryService';
import { AddressService } from '../../src/api/services/model/AddressService';
import { ProfileService } from '../../src/api/services/model/ProfileService';
import { MarketService } from '../../src/api/services/model/MarketService';
import { ListingItemTemplateService } from '../../src/api/services/model/ListingItemTemplateService';
import { TestDataGenerateRequest } from '../../src/api/requests/testdata/TestDataGenerateRequest';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { GenerateBidParams } from '../../src/api/requests/testdata/GenerateBidParams';
import { GenerateListingItemTemplateParams } from '../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { GenerateListingItemParams } from '../../src/api/requests/testdata/GenerateListingItemParams';
import { GenerateOrderParams } from '../../src/api/requests/testdata/GenerateOrderParams';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { OrderItemStatus } from '../../src/api/enums/OrderItemStatus';

describe('TestDataService', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let itemCategoryService: ItemCategoryService;
    let addressService: AddressService;
    let profileService: ProfileService;
    let marketService: MarketService;
    let listingItemTemplateService: ListingItemTemplateService;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        itemCategoryService = app.IoC.getNamed<ItemCategoryService>(Types.Service, Targets.Service.model.ItemCategoryService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);
        addressService = app.IoC.getNamed<AddressService>(Types.Service, Targets.Service.model.AddressService);
        listingItemTemplateService = app.IoC.getNamed<ListingItemTemplateService>(Types.Service, Targets.Service.model.ListingItemTemplateService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);

        // clean up the db
        await testDataService.clean();

        defaultMarket = await marketService.getDefault().then(value => value.toJSON());
        defaultProfile = await profileService.getDefault().then(value => value.toJSON());

    });

    const expectGenerateProfile = (result: resources.Profile,
                                   shouldHaveCryptocurrencyAddresses: boolean = true,
                                   shouldHaveFavoriteItems: boolean = true,
                                   shouldHaveShippingAddresses: boolean = true,
                                   shouldHaveShoppingCart: boolean = true) => {

        expect(result.address).not.toBeNull();
        expect(result.name).not.toBeNull();

        if (shouldHaveCryptocurrencyAddresses) {
            expect(result.CryptocurrencyAddresses).not.toHaveLength(0);
            expect(result.CryptocurrencyAddresses[0].profileId).toBe(result.id);
            expect(result.CryptocurrencyAddresses[0].address).not.toBeNull();
            expect(result.CryptocurrencyAddresses[0].type).not.toBeNull();
        } else {
            expect(result.CryptocurrencyAddresses).toHaveLength(0);
        }

        if (shouldHaveFavoriteItems) {
            // TODO
            expect(result.FavoriteItems).not.toHaveLength(0);
        } else {
            expect(result.FavoriteItems).toHaveLength(0);
        }

        if (shouldHaveShippingAddresses) {
            expect(result.ShippingAddresses).not.toHaveLength(0);
            expect(result.ShippingAddresses[0].profileId).toBe(result.id);
            expect(result.ShippingAddresses[0].firstName).not.toBeNull();
            expect(result.ShippingAddresses[0].lastName).not.toBeNull();
            expect(result.ShippingAddresses[0].addressLine1).not.toBeNull();
            expect(result.ShippingAddresses[0].addressLine2).not.toBeNull();
            expect(result.ShippingAddresses[0].city).not.toBeNull();
            expect(result.ShippingAddresses[0].country).not.toBeNull();
            expect(result.ShippingAddresses[0].title).not.toBeNull();
            expect(result.ShippingAddresses[0].zipCode).not.toBeNull();
        } else {
            expect(result.ShippingAddresses).toHaveLength(0);
        }

        if (shouldHaveShoppingCart) {
            expect(result.ShoppingCart).toHaveLength(1);
            expect(result.ShoppingCart[0].name).toBe('DEFAULT');
        } else {
            expect(result.ShoppingCart).toHaveLength(0);
        }
    };


    const expectGenerateBid = (bidGenerateParams: GenerateBidParams, result: resources.Bid,
                               shouldHaveBidDatas: boolean = true,
                               shouldHaveShippingAddress: boolean = true) => {

        // log.debug('result: ', JSON.stringify(result, null, 2));
        // log.debug('bidGenerateParams: ', JSON.stringify(bidGenerateParams, null, 2));

        expect(result.type).toBe(bidGenerateParams.type);
        expect(result.bidder).toBe(bidGenerateParams.bidder);

        if (bidGenerateParams.generateListingItem) {
            expect(result.ListingItem).toBeDefined();
            expect(result.ListingItem.hash).not.toBeNull();

            if (bidGenerateParams.generateListingItemTemplate) {
                // TODO: if both are generated, same data should be used
                // generated template contains different data than the item
                // expect(result.ListingItem.hash).toBe(result.ListingItem.ListingItemTemplate.hash);
                expect(result.ListingItem.ListingItemTemplate).toBeDefined();
                expect(result.ListingItem.ListingItemTemplate.hash).not.toBeNull();
            } else {
                expect(result.ListingItem.ListingItemTemplate).not.toBeDefined();
            }

            if (bidGenerateParams.listingItemHash) {
                expect(result.ListingItem.hash).toBe(bidGenerateParams.listingItemHash);
            }

        } else {
            if (bidGenerateParams.listingItemHash) {
                expect(result.ListingItem.hash).toBe(bidGenerateParams.listingItemHash);
            }
        }

        if (shouldHaveBidDatas) {
            expect(result.BidDatas).not.toHaveLength(0);
        } else {
            expect(result.BidDatas).toHaveLength(0);
        }

        if (shouldHaveShippingAddress) {
            expect(result.ShippingAddress.title).not.toBeNull();
            expect(result.ShippingAddress.firstName).not.toBeNull();
            expect(result.ShippingAddress.lastName).not.toBeNull();
            expect(result.ShippingAddress.addressLine1).not.toBeNull();
            expect(result.ShippingAddress.addressLine2).not.toBeNull();
            expect(result.ShippingAddress.city).not.toBeNull();
            expect(result.ShippingAddress.zipCode).not.toBeNull();
            expect(result.ShippingAddress.country).not.toBeNull();
        } else {
            expect(result.ShippingAddress).not.toBeDefined();
        }
    };

    const expectGenerateOrder = (orderGenerateParams: GenerateOrderParams, result: resources.Order) => {

        log.debug('result: ', JSON.stringify(result, null, 2));
        log.debug('orderGenerateParams: ', JSON.stringify(orderGenerateParams, null, 2));

        expect(result.hash).toBeDefined();

        if (orderGenerateParams.generateListingItem) {
            expect(result.OrderItems[0].status).toBe(OrderItemStatus.AWAITING_ESCROW);
            expect(result.OrderItems[0].Bid.ListingItem).toBeDefined();
            expect(result.OrderItems[0].Bid.ListingItem.hash).not.toBeNull();

            if (orderGenerateParams.generateListingItemTemplate) {
                // TODO: if both are generated, same data should be used
                expect(result.OrderItems[0].Bid.ListingItem.ListingItemTemplate).toBeDefined();
                expect(result.OrderItems[0].Bid.ListingItem.ListingItemTemplate.hash).not.toBeNull();
            } else {
                expect(result.OrderItems[0].Bid.ListingItem.ListingItemTemplate).not.toBeDefined();
            }

            if (orderGenerateParams.listingItemHash) {
                expect(result.OrderItems[0].Bid.ListingItem.hash).toBe(orderGenerateParams.listingItemHash);
                expect(result.OrderItems[0].Bid.ListingItem.ListingItemTemplate.hash).toBe(orderGenerateParams.listingItemHash);
            }

        } else {
            expect(result.OrderItems[0].Bid.ListingItem.ListingItemTemplate).not.toBeDefined();
        }

        if (orderGenerateParams.generateBid) {
            expect(result.OrderItems[0].Bid).toBeDefined();
        } else {
            expect(result.OrderItems[0].Bid).not.toBeDefined();
        }
    };

    test('Should generate three Profiles', async () => {

        let profiles: resources.Profile[] = await testDataService.generate({
            model: CreatableModel.PROFILE,
            amount: 3,
            withRelated: true
        } as TestDataGenerateRequest);

        profiles = await profileService.findAll().then(value => value.toJSON());
        expect(profiles).toHaveLength(4);
    }, 600000); // timeout to 600s

    test('Should generate ListingItemTemplate using GenerateListingItemTemplateParams', async () => {

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            true,   // generateShippingDestinations
            false,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            true,   // generateListingItemObjects
            true    // generateObjectDatas
        ]).toParamsArray();

        const listingItemTemplates: resources.ListingItemTemplate[] = await testDataService.generate({
            model: CreatableModel.LISTINGITEMTEMPLATE,
            amount: 1,
            withRelated: true,
            generateParams: generateListingItemTemplateParams
        } as TestDataGenerateRequest);

        expect(listingItemTemplates).toHaveLength(1);

    }, 600000); // timeout to 600s

    // TODO: listingitem and template generation not implemented
/*
    test('Should generate Bid using GenerateBidParams, generating a ListingItemTemplate and a ListingItem', async () => {

        const bidGenerateParams = new GenerateBidParams([
            true,                       // generateListingItemTemplate
            true,                       // generateListingItem
            null,                       // listingItemhash
            MPAction.MPA_BID,           // type
            defaultProfile.address      // bidder
        ]);

        const generatedBids: resources.Bid[] = await testDataService.generate({
            model: CreatableModel.BID,
            amount: 1,
            withRelated: true,
            generateParams: bidGenerateParams.toParamsArray()
        } as TestDataGenerateRequest);

        const bid = generatedBids[0];

        expectGenerateBid(bidGenerateParams, bid, true, true);
    }, 600000); // timeout to 600s
*/
    test('Should generate Bid using GenerateBidParams, with a relation to existing ListingItem', async () => {

        // create ListingItems
        const generateListingItemParams = new GenerateListingItemParams([
            true,                               // generateItemInformation
            true,                               // generateItemLocation
            true,                               // generateShippingDestinations
            false,                              // generateItemImages
            true,                               // generatePaymentInformation
            true,                               // generateEscrow
            true,                               // generateItemPrice
            true,                               // generateMessagingInformation
            true,                               // generateListingItemObjects
            false,                              // generateObjectDatas
            null,                               // listingItemTemplateHash
            defaultProfile.address              // bidder
        ]).toParamsArray();

        const listingItems = await testDataService.generate({
            model: CreatableModel.LISTINGITEM,
            amount: 1,
            withRelated: true,
            generateParams: generateListingItemParams
        } as TestDataGenerateRequest);

        const bidGenerateParams = new GenerateBidParams([
            false,                          // generateListingItemTemplate
            false,                          // generateListingItem
            listingItems[0].hash,           // listingItemHash
            MPAction.MPA_BID,               // type
            defaultProfile.address          // bidder
        ]);

        const generatedBids = await testDataService.generate({
            model: CreatableModel.BID,
            amount: 1,
            withRelated: true,
            generateParams: bidGenerateParams.toParamsArray()
        } as TestDataGenerateRequest);

        const bid = generatedBids[0];
        expectGenerateBid(bidGenerateParams, bid, true, true);

        expect(bid.ListingItem.hash).toBe(listingItems[0].hash);
        // expect(bid.ListingItem.seller).toBe(defaultProfile.address);

    }, 600000); // timeout to 600s

    // TODO: listingitem and template generation not implemented

/*
    test('Should generate Order using GenerateOrderParams, with a relation to existing ListingItem', async () => {

        // [0]: generateListingItemTemplate, generate a ListingItemTemplate
        // [1]: generateListingItem, generate a ListingItem
        // [2]: generateBid, generate a Bid
        // [3]: generateOrderItem, generate OrderItem
        // [4]: listingItemhash, attach bid to existing ListingItem
        // [5]: bidId, attach Order to existing Bid
        // [6]: bidder, bidders address
        // [7]: seller, ListingItem sellers address

        const orderGenerateParams = new GenerateOrderParams([
            true,                       // generateListingItemTemplate
            true,                       // generateListingItem
            true,                       // generateBid
            true,                       // generateOrderItem
            null,                       // listingItemhash
            null,                       // bidId
            null,                       // bidder
            defaultProfile.address      // seller
        ]);

        const generatedOrders: resources.Order[] = await testDataService.generate({
            model: CreatableModel.ORDER,
            amount: 1,
            withRelated: true,
            generateParams: orderGenerateParams.toParamsArray()
        } as TestDataGenerateRequest);

        const order = generatedOrders[0];

        expectGenerateOrder(orderGenerateParams, order);

    }, 600000); // timeout to 600s
*/

    test('Should cleanup all tables', async () => {

        // TODO: needs to be updated, should check that all tables are cleaned

        expect.assertions(4);
        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        const categories = await itemCategoryService.findAll();
        expect(categories).toHaveLength(82);

        // default profile should not contain addresses
        const addresses = await addressService.findAll();
        expect(addresses).toHaveLength(0);

        // listingitemTemplates should have been be removed
        const listingItems = await listingItemTemplateService.findAll();
        expect(listingItems).toHaveLength(0);

        // only default profile
        const profiles = await profileService.findAll();
        expect(profiles).toHaveLength(1);
    });

});
