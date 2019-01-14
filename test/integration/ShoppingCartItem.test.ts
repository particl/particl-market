// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as Bookshelf from 'bookshelf';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { ShoppingCartItem } from '../../src/api/models/ShoppingCartItem';
import { MarketService } from '../../src/api/services/MarketService';
import { ProfileService } from '../../src/api/services/ProfileService';
import { ShoppingCartItemService } from '../../src/api/services/ShoppingCartItemService';
import { ListingItemService } from '../../src/api/services/ListingItemService';
import { ShoppingCartItemCreateRequest } from '../../src/api/requests/ShoppingCartItemCreateRequest';
import * as resources from 'resources';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { TestDataGenerateRequest } from '../../src/api/requests/TestDataGenerateRequest';
import { GenerateListingItemParams } from '../../src/api/requests/params/GenerateListingItemParams';

describe('ShoppingCartList', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let marketService: MarketService;
    let profileService: ProfileService;
    let shoppingCartItemService: ShoppingCartItemService;
    let listingItemService: ListingItemService;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;
    let defaultShoppingCart: resources.ShoppingCart;

    let createdListingItem: resources.ListingItem;
    let createdShoppingCartItem: resources.ShoppingCartItem;

    const testData = {
        shopping_cart_id: 0,
        listing_item_id: 0
    } as ShoppingCartItemCreateRequest;


    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.MarketService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.ProfileService);
        shoppingCartItemService = app.IoC.getNamed<ShoppingCartItemService>(Types.Service, Targets.Service.ShoppingCartItemService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.ListingItemService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        // get default profile
        const defaultProfileModel = await profileService.getDefault();
        defaultProfile = defaultProfileModel.toJSON();

        // get default market
        const defaultMarketModel = await marketService.getDefault();
        defaultMarket = defaultMarketModel.toJSON();

        // get default shoppingcart
        defaultShoppingCart = defaultProfile.ShoppingCart[0];

        const generateParams = new GenerateListingItemParams([
            true,                               // generateItemInformation
            true,                               // generateItemLocation
            true,                               // generateShippingDestinations
            false,                              // generateItemImages
            true,                               // generatePaymentInformation
            true,                               // generateEscrow
            true,                               // generateItemPrice
            true,                               // generateMessagingInformation
            false,                              // generateListingItemObjects
        ]).toParamsArray();

        const listingItems = await testDataService.generate({
            model: CreatableModel.LISTINGITEM,  // what to generate
            amount: 1,                          // how many to generate
            withRelated: true,                  // return model
            generateParams                      // what kind of data to generate
        } as TestDataGenerateRequest);
        createdListingItem = listingItems[0];

    });

    afterAll(async () => {
        //
    });

    test('Should create a new ShoppingCartItem', async () => {
        testData.shopping_cart_id = defaultShoppingCart.id;
        testData.listing_item_id = createdListingItem.id;

        const shoppingCartItemModel: ShoppingCartItem = await shoppingCartItemService.create(testData);
        createdShoppingCartItem = shoppingCartItemModel.toJSON();

        // test the values
        expect(createdShoppingCartItem.id).not.toBeUndefined();
        expect(createdShoppingCartItem.ShoppingCart.id).toBe(testData.shopping_cart_id);
        expect(createdShoppingCartItem.ListingItem.id).toBe(testData.listing_item_id);
    });

    test('Should throw ValidationException because we want to create a empty ShoppingCartItem', async () => {
        expect.assertions(1);
        await shoppingCartItemService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list ShoppingCartItem with our new create one', async () => {
        const shoppingCartItemCollection = await shoppingCartItemService.findAll();
        const result = shoppingCartItemCollection.toJSON();

        log.debug('result:', JSON.stringify(result, null, 2));
        expect(result.length).toBe(1);
        expect(result[0].id).toBe(createdShoppingCartItem.id);
    });

    test('Should return one ShoppingCartItem', async () => {
        const shoppingCartItemModel: ShoppingCartItem = await shoppingCartItemService.findOne(createdShoppingCartItem.id);
        const result = shoppingCartItemModel.toJSON();

        // test the values
        expect(result.ShoppingCart.id).toBe(testData.shopping_cart_id);
        expect(result.ListingItem.id).toBe(testData.listing_item_id);
    });

    test('Should find ShoppingCartItems by shoppingCart.id', async () => {
        const listingItem: Bookshelf.Collection<ShoppingCartItem> = await shoppingCartItemService.findAllByCartId(defaultShoppingCart.id);
        const result = listingItem.toJSON();

        expect(result[0].ListingItem.Bids).toBeDefined();
        expect(result[0].ListingItem.FlaggedItem).toBeDefined();
        expect(result[0].ListingItem.ItemInformation).toBeDefined();
        expect(result[0].ListingItem.ListingItemObjects).toBeDefined();
        expect(result[0].ListingItem.Market).toBeDefined();
        expect(result[0].ListingItem.MessagingInformation).toBeDefined();
        expect(result[0].ListingItem.PaymentInformation).toBeDefined();

        expect(result[0].ShoppingCart.id).toBe(testData.shopping_cart_id);
        expect(result[0].ListingItem.id).toBe(testData.listing_item_id);
    });

    test('Should find ShoppingCartItems by shoppingCart.id and listingItem.id', async () => {
        const listingItem: ShoppingCartItem = await shoppingCartItemService.findOneByCartIdAndListingItemId(defaultShoppingCart.id, testData.listing_item_id);
        const result = listingItem.toJSON();

        expect(result.ListingItem.Bids).toBeDefined();
        expect(result.ListingItem.FlaggedItem).toBeDefined();
        expect(result.ListingItem.ItemInformation).toBeDefined();
        expect(result.ListingItem.ListingItemObjects).toBeDefined();
        expect(result.ListingItem.Market).toBeDefined();
        expect(result.ListingItem.MessagingInformation).toBeDefined();
        expect(result.ListingItem.PaymentInformation).toBeDefined();

        expect(result.ShoppingCart.id).toBe(testData.shopping_cart_id);
        expect(result.ListingItem.id).toBe(testData.listing_item_id);
    });

    test('Should clear all ShoppingCartItems of ShoppingCart by shoppingCart.id', async () => {

        const clearCart = await shoppingCartItemService.clearCart(defaultShoppingCart.id);

        const listingItem: Bookshelf.Collection<ShoppingCartItem> = await shoppingCartItemService.findAllByCartId(defaultShoppingCart.id);
        const result = listingItem.toJSON();
        expect(result).toHaveLength(0); // check cart empty
    });

    test('Should delete the ShoppingCartItems', async () => {

        expect.assertions(4);

        testData.shopping_cart_id = defaultShoppingCart.id;
        testData.listing_item_id = createdListingItem.id;

        const shoppingCartItemModel: ShoppingCartItem = await shoppingCartItemService.create(testData);
        createdShoppingCartItem = shoppingCartItemModel.toJSON();

        expect(createdShoppingCartItem.id).not.toBeUndefined();
        expect(createdShoppingCartItem.shoppingCartId).toBe(testData.shopping_cart_id);
        expect(createdShoppingCartItem.listingItemId).toBe(testData.listing_item_id);

        await shoppingCartItemService.destroy(createdShoppingCartItem.id);
        await shoppingCartItemService.findOne(createdShoppingCartItem.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdShoppingCartItem.id))
        );

    });
});
