// Copyright (c) 2017-2020, The Particl Market developers
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
import { GenerateListingItemTemplateParams } from '../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { ListingItemService } from '../../src/api/services/model/ListingItemService';
import { OrderStatus } from '../../src/api/enums/OrderStatus';
import { DefaultMarketService } from '../../src/api/services/DefaultMarketService';

describe('TestDataService', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let defaultMarketService: DefaultMarketService;
    let itemCategoryService: ItemCategoryService;
    let addressService: AddressService;
    let profileService: ProfileService;
    let marketService: MarketService;
    let listingItemService: ListingItemService;
    let listingItemTemplateService: ListingItemTemplateService;

    let sellerProfile: resources.Profile;
    let sellerMarket: resources.Market;

    let bidderProfile: resources.Profile;
    let bidderMarket: resources.Market;

    let listingItem: resources.ListingItem;
    let listingItemTemplate: resources.ListingItemTemplate;
    let bids: resources.Bid[];
    let orders: resources.Order[];

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        defaultMarketService = app.IoC.getNamed<DefaultMarketService>(Types.Service, Targets.Service.DefaultMarketService);
        itemCategoryService = app.IoC.getNamed<ItemCategoryService>(Types.Service, Targets.Service.model.ItemCategoryService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);
        addressService = app.IoC.getNamed<AddressService>(Types.Service, Targets.Service.model.AddressService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.model.ListingItemService);
        listingItemTemplateService = app.IoC.getNamed<ListingItemTemplateService>(Types.Service, Targets.Service.model.ListingItemTemplateService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);

        sellerProfile = await profileService.getDefault().then(value => value.toJSON());
        sellerMarket = await defaultMarketService.getDefaultForProfile(sellerProfile.id).then(value => value.toJSON());
        // log.debug('sellerProfile: ', JSON.stringify(sellerProfile, null, 2));
        // log.debug('sellerMarket: ', JSON.stringify(sellerMarket, null, 2));

    });

    test('Should generate three Profiles', async () => {

        await testDataService.generate({
            model: CreatableModel.PROFILE,
            amount: 3,
            withRelated: true
        } as TestDataGenerateRequest);

        const result: resources.Profile[]  = await profileService.findAll().then(value => value.toJSON());
        expect(result).toHaveLength(1 + 3);

        bidderProfile = result[1];
        bidderMarket = await defaultMarketService.getDefaultForProfile(bidderProfile.id).then(value => value.toJSON());

        // log.debug('bidderProfile: ', JSON.stringify(bidderProfile, null, 2));
        // log.debug('bidderMarket: ', JSON.stringify(bidderMarket, null, 2));

        expect(bidderMarket.Identity.address).not.toBe(sellerMarket.Identity.address);
        expect(bidderMarket.Profile.id).toBe(bidderProfile.id);
        expect(sellerMarket.Profile.id).toBe(sellerProfile.id);

    }, 600000); // timeout to 600s

    test('Should generate ListingItemTemplate', async () => {

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,               // generateItemInformation
            true,               // generateItemLocation
            false,              // generateShippingDestinations
            false,              // generateImages
            true,               // generatePaymentInformation
            true,               // generateEscrow
            true,               // generateItemPrice
            true,               // generateMessagingInformation
            true,               // generateListingItemObjects
            true,               // generateObjectDatas
            sellerProfile.id,   // profileId
            false,              // generateListingItem
            sellerMarket.id,    // marketId
            null                // categoryId
        ]).toParamsArray();

        const listingItemTemplates: resources.ListingItemTemplate[] = await testDataService.generate({
            model: CreatableModel.LISTINGITEMTEMPLATE,
            amount: 1,
            withRelated: true,
            generateParams: generateListingItemTemplateParams
        } as TestDataGenerateRequest);

        expect(listingItemTemplates).toHaveLength(1);

        listingItemTemplate = listingItemTemplates[0];
    }, 600000); // timeout to 600s

    test('Should generate ListingItem', async () => {

        const result = await testDataService.generateListingItemWithTemplate(sellerProfile, bidderMarket, false);
        listingItem = await listingItemService.findOne(result.id).then(value => value.toJSON());
        expect(listingItem).toBeDefined();
        expect(listingItem.id).toBe(result.id);
        expect(listingItem.market).toBe(result.market);
        expect(listingItem.seller).toBe(sellerMarket.Identity.address);

    }, 600000); // timeout to 600s

    test('Should generate Bid for ListingItem', async () => {

        bids = await testDataService.generateBid(MPAction.MPA_BID, listingItem.id, bidderMarket, sellerMarket);
        const bidderBid: resources.Bid = bids[0];
        const sellerBid: resources.Bid = bids[1];

        expect(bidderBid.type).toBe(MPAction.MPA_BID);
        expect(bidderBid.bidder).toBe(bidderMarket.Identity.address);
        expect(bidderBid.ListingItem.id).toBe(listingItem.id);
        expect(bidderBid.ListingItem.market).toBe(bidderMarket.receiveAddress);
        expect(sellerBid.ListingItem.id).toBe(listingItem.id);
        expect(sellerBid.ListingItem.market).toBe(sellerMarket.receiveAddress);

    }, 600000); // timeout to 600s

    test('Should generate Order', async () => {

        const bidderBid: resources.Bid = bids[0];

        orders = await testDataService.generateOrder(bidderBid, true);
        const bidderOrder: resources.Order = orders[0];

        expect(bidderOrder.buyer).not.toBe(bidderOrder.seller);
        expect(bidderOrder.buyer).toBe(bidderMarket.Identity.address);
        expect(bidderOrder.seller).toBe(sellerMarket.Identity.address);
        expect(bidderOrder.status).toBe(OrderStatus.SENT);
        expect(bidderOrder.OrderItems[0].itemHash).toBe(bidderBid.ListingItem.hash);

    }, 600000); // timeout to 600s

    test('Should cleanup all tables', async () => {

        // TODO: needs to be updated, should check that all tables are cleaned

        expect.assertions(4);

        // clean up the db, do not seed with default data
        await testDataService.clean(false);

        const categories = await itemCategoryService.findAll();
        expect(categories).toHaveLength(0);

        const addresses = await addressService.findAll();
        expect(addresses).toHaveLength(0);

        const listingItems = await listingItemTemplateService.findAll();
        expect(listingItems).toHaveLength(0);

        const profiles = await profileService.findAll();
        expect(profiles).toHaveLength(0);
    });


});
