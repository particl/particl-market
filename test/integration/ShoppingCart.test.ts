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
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { ShoppingCart } from '../../src/api/models/ShoppingCart';
import { ShoppingCartService } from '../../src/api/services/model/ShoppingCartService';
import { ProfileService } from '../../src/api/services/model/ProfileService';
import { ShoppingCartCreateRequest } from '../../src/api/requests/model/ShoppingCartCreateRequest';
import { ShoppingCartUpdateRequest } from '../../src/api/requests/model/ShoppingCartUpdateRequest';
import { MarketService } from '../../src/api/services/model/MarketService';
import { ListingItemService } from '../../src/api/services/model/ListingItemService';
import { ListingItemTemplateService } from '../../src/api/services/model/ListingItemTemplateService';
import { DefaultMarketService } from '../../src/api/services/DefaultMarketService';

describe('ShoppingCart', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let defaultMarketService: DefaultMarketService;
    let shoppingCartService: ShoppingCartService;
    let profileService: ProfileService;
    let marketService: MarketService;
    let listingItemService: ListingItemService;
    let listingItemTemplateService: ListingItemTemplateService;

    let bidderProfile: resources.Profile;
    let bidderMarket: resources.Market;
    let sellerProfile: resources.Profile;
    let sellerMarket: resources.Market;
    let listingItem: resources.ListingItem;
    let listingItemTemplate: resources.ListingItemTemplate;

    let shoppingCart: resources.ShoppingCart;

    const testData = {
        name: 'test shopping cart',
        profile_id: 0
    } as ShoppingCartCreateRequest;

    const testDataUpdated = {
        name: 'Updated shopping cart'
    } as ShoppingCartUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        defaultMarketService = app.IoC.getNamed<DefaultMarketService>(Types.Service, Targets.Service.DefaultMarketService);
        shoppingCartService = app.IoC.getNamed<ShoppingCartService>(Types.Service, Targets.Service.model.ShoppingCartService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.model.ListingItemService);
        listingItemTemplateService = app.IoC.getNamed<ListingItemTemplateService>(Types.Service, Targets.Service.model.ListingItemTemplateService);

        bidderProfile = await profileService.getDefault().then(value => value.toJSON());
        bidderMarket = await defaultMarketService.getDefaultForProfile(bidderProfile.id).then(value => value.toJSON());
        sellerProfile = await testDataService.generateProfile();
        sellerMarket = await defaultMarketService.getDefaultForProfile(sellerProfile.id).then(value => value.toJSON());
        listingItem = await testDataService.generateListingItemWithTemplate(sellerProfile, bidderMarket);
        listingItemTemplate = await listingItemTemplateService.findOne(listingItem.ListingItemTemplate.id).then(value => value.toJSON());

    });

    afterAll(async () => {
        //
    });

    test('Should find the default Profiles (2) ShoppingCarts', async () => {
        const shoppingCarts: resources.ShoppingCart[] = await shoppingCartService.findAll().then(value => value.toJSON());
        expect(shoppingCarts.length).toBe(2);
        const result = shoppingCarts[0];
        expect(result.name).toBe('DEFAULT');
        expect(result.profileId).toBe(bidderProfile.id);
    });

    test('Should throw ValidationException because we want to create a empty ShoppingCart', async () => {
        expect.assertions(1);
        await shoppingCartService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new ShoppingCart', async () => {
        testData.profile_id = bidderProfile.id;
        const result: resources.ShoppingCart = await shoppingCartService.create(testData).then(value => value.toJSON());

        // test the values
        expect(result.name).toBe(testData.name);
        expect(result.profileId).toBe(testData.profile_id);

        shoppingCart = result;
    });

    test('Should list ShoppingCarts with our newly created one', async () => {
        const shoppingCarts = await shoppingCartService.findAll().then(value => value.toJSON());
        expect(shoppingCarts.length).toBe(3); // includes default ones
        const result = shoppingCarts[2];
        expect(result.name).toBe(testData.name);
        expect(result.profileId).toBe(testData.profile_id);
    });

    test('Should return one ShoppingCart', async () => {
        const result: resources.ShoppingCart = await shoppingCartService.findOne(shoppingCart.id).then(value => value.toJSON());
        expect(result.name).toBe(testData.name);
        expect(result.profileId).toBe(testData.profile_id);
    });

    test('Should update the ShoppingCart', async () => {
        const result: resources.ShoppingCart = await shoppingCartService.update(shoppingCart.id, testDataUpdated).then(value => value.toJSON());
        expect(result.name).toBe(testDataUpdated.name);
        expect(result.profileId).toBe(testData.profile_id);
    });

    test('Should delete the ShoppingCart', async () => {
        expect.assertions(1);
        await shoppingCartService.destroy(shoppingCart.id);
        await shoppingCartService.findOne(shoppingCart.id).catch(e =>
            expect(e).toEqual(new NotFoundException(shoppingCart.id))
        );
    });

});
