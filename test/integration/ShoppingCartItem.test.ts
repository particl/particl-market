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
import { MarketService } from '../../src/api/services/model/MarketService';
import { ProfileService } from '../../src/api/services/model/ProfileService';
import { ShoppingCartItemService } from '../../src/api/services/model/ShoppingCartItemService';
import { ListingItemService } from '../../src/api/services/model/ListingItemService';
import { ShoppingCartItemCreateRequest } from '../../src/api/requests/model/ShoppingCartItemCreateRequest';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { TestDataGenerateRequest } from '../../src/api/requests/testdata/TestDataGenerateRequest';
import { GenerateListingItemTemplateParams } from '../../src/api/requests/testdata/GenerateListingItemTemplateParams';

describe('ShoppingCartItem', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let marketService: MarketService;
    let profileService: ProfileService;
    let shoppingCartItemService: ShoppingCartItemService;
    let listingItemService: ListingItemService;

    let profile: resources.Profile;
    let market: resources.Market;
    let shoppingCart: resources.ShoppingCart;

    let listingItem: resources.ListingItem;
    let shoppingCartItem: resources.ShoppingCartItem;

    const testData = {
        shopping_cart_id: 0,
        listing_item_id: 0
    } as ShoppingCartItemCreateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);
        shoppingCartItemService = app.IoC.getNamed<ShoppingCartItemService>(Types.Service, Targets.Service.model.ShoppingCartItemService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.model.ListingItemService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        // get default profile + market + shoppingcart
        profile = await profileService.getDefault().then(value => value.toJSON());
        market = await marketService.getDefaultForProfile(profile.id).then(value => value.toJSON());
        shoppingCart = profile.ShoppingCart[0];

        const generateParams = new GenerateListingItemTemplateParams([
            true,       // generateItemInformation
            true,       // generateItemLocation
            false,      // generateShippingDestinations
            false,      // generateItemImages
            true,       // generatePaymentInformation
            true,       // generateEscrow
            true,       // generateItemPrice
            false,      // generateMessagingInformation
            false,      // generateListingItemObjects
            false,      // generateObjectDatas
            profile.id, // profileId
            true,       // generateListingItem
            market.id   // marketId
        ]).toParamsArray();
        const listingItemTemplates: resources.ListingItemTemplate[] = await testDataService.generate({
            model: CreatableModel.LISTINGITEMTEMPLATE,
            amount: 1,
            withRelated: true,
            generateParams
        } as TestDataGenerateRequest);
        listingItem = listingItemTemplates[0].ListingItems[0];

    });

    afterAll(async () => {
        //
    });

    test('Should create a new ShoppingCartItem', async () => {

        testData.shopping_cart_id = shoppingCart.id;
        testData.listing_item_id = listingItem.id;

        shoppingCartItem = await shoppingCartItemService.create(testData).then(value => value.toJSON());

        expect(shoppingCartItem.id).not.toBeUndefined();
        expect(shoppingCartItem.ShoppingCart.id).toBe(testData.shopping_cart_id);
        expect(shoppingCartItem.ListingItem.id).toBe(testData.listing_item_id);
    });

    test('Should throw ValidationException because we want to create a empty ShoppingCartItem', async () => {
        expect.assertions(1);
        await shoppingCartItemService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list ShoppingCartItem with our new create one', async () => {
        const result: resources.ShoppingCartItem[] = await shoppingCartItemService.findAll().then(value => value.toJSON());
        log.debug('result:', JSON.stringify(result, null, 2));
        expect(result.length).toBe(1);
        expect(result[0].id).toBe(shoppingCartItem.id);
    });

    test('Should return one ShoppingCartItem', async () => {
        shoppingCartItem = await shoppingCartItemService.findOne(shoppingCartItem.id).then(value => value.toJSON());
        const result: resources.ShoppingCartItem = shoppingCartItem;

        expect(result.ShoppingCart.id).toBe(testData.shopping_cart_id);
        expect(result.ListingItem.id).toBe(testData.listing_item_id);
    });

    test('Should find ShoppingCartItems using shoppingCartId', async () => {
        const result: resources.ShoppingCartItem[] = await shoppingCartItemService.findAllByCartId(shoppingCart.id).then(value => value.toJSON());

        expect(result[0].ListingItem.Bids).toBeDefined();
        expect(result[0].ListingItem.FlaggedItem).toBeDefined();
        expect(result[0].ListingItem.ItemInformation).toBeDefined();
        expect(result[0].ListingItem.ListingItemObjects).toBeDefined();
        expect(result[0].ListingItem.MessagingInformation).toBeDefined();
        expect(result[0].ListingItem.PaymentInformation).toBeDefined();

        expect(result[0].ShoppingCart.id).toBe(testData.shopping_cart_id);
        expect(result[0].ListingItem.id).toBe(testData.listing_item_id);
    });

    test('Should find ShoppingCartItems by shoppingCartId and listingItemId', async () => {
        const result: resources.ShoppingCartItem = await shoppingCartItemService.findOneByCartIdAndListingItemId(shoppingCart.id, testData.listing_item_id)
            .then(value => value.toJSON());

        expect(result.ListingItem.Bids).toBeDefined();
        expect(result.ListingItem.FlaggedItem).toBeDefined();
        expect(result.ListingItem.ItemInformation).toBeDefined();
        expect(result.ListingItem.ListingItemObjects).toBeDefined();
        expect(result.ListingItem.MessagingInformation).toBeDefined();
        expect(result.ListingItem.PaymentInformation).toBeDefined();

        expect(result.ShoppingCart.id).toBe(testData.shopping_cart_id);
        expect(result.ListingItem.id).toBe(testData.listing_item_id);
    });

    test('Should clear all ShoppingCartItems of ShoppingCart by shoppingCartId', async () => {
        const clearCart = await shoppingCartItemService.clearCart(shoppingCart.id);
        const result: resources.ShoppingCartItem[] = await shoppingCartItemService.findAllByCartId(shoppingCart.id).then(value => value.toJSON());
        expect(result).toHaveLength(0);
    });

    test('Should delete the ShoppingCartItems', async () => {
        expect.assertions(4);

        testData.shopping_cart_id = shoppingCart.id;
        testData.listing_item_id = listingItem.id;

        shoppingCartItem = await shoppingCartItemService.create(testData).then(value => value.toJSON());

        expect(shoppingCartItem.id).not.toBeUndefined();
        expect(shoppingCartItem.shoppingCartId).toBe(testData.shopping_cart_id);
        expect(shoppingCartItem.listingItemId).toBe(testData.listing_item_id);

        await shoppingCartItemService.destroy(shoppingCartItem.id);
        await shoppingCartItemService.findOne(shoppingCartItem.id).catch(e =>
            expect(e).toEqual(new NotFoundException(shoppingCartItem.id))
        );

    });
});
