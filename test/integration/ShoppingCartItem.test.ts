import * as Bookshelf from 'bookshelf';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { ShoppingCartItem } from '../../src/api/models/ShoppingCartItem';
import { ListingItem } from '../../src/api/models/ListingItem';

import { MarketService } from '../../src/api/services/MarketService';
import { ProfileService } from '../../src/api/services/ProfileService';
import { ShoppingCartItemService } from '../../src/api/services/ShoppingCartItemService';
import { ListingItemService } from '../../src/api/services/ListingItemService';

import { ShoppingCartItemCreateRequest } from '../../src/api/requests/ShoppingCartItemCreateRequest';

import { TestDataCreateRequest } from '../../src/api/requests/TestDataCreateRequest';
import { reset } from 'chalk';

describe('ShoppingCartItem', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;
    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let marketService: MarketService;
    let profileService: ProfileService;
    let shoppingCartItemService: ShoppingCartItemService;
    let listingItemService: ListingItemService;

    let createdId;
    let createdListingItem;
    let defaultShoppingCart;

    const testData = {
        shopping_cart_id: 0,
        listing_item_id: 0
    } as ShoppingCartItemCreateRequest;

    // const testDataUpdated = {
    // };

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.MarketService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.ProfileService);
        shoppingCartItemService = app.IoC.getNamed<ShoppingCartItemService>(Types.Service, Targets.Service.ShoppingCartItemService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.ListingItemService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        // listingItem
        let defaultMarket = await marketService.getDefault();
        defaultMarket = defaultMarket.toJSON();
        const defaultProfile = await profileService.getDefault();
        defaultShoppingCart = defaultProfile.toJSON().ShoppingCart[0];
        createdListingItem = await testDataService.create<ListingItem>({
            model: 'listingitem',
            data: {
                market_id: defaultMarket.id,
                hash: 'itemhash'
            } as any,
            withRelated: true
        } as TestDataCreateRequest);
    });

    afterAll(async () => {
        //
    });

    test('Should create a new shopping cart items', async () => {
        testData.shopping_cart_id = defaultShoppingCart.id;
        testData.listing_item_id = createdListingItem.id;
        const shoppingCartItemModel: ShoppingCartItem = await shoppingCartItemService.create(testData);
        createdId = shoppingCartItemModel.Id;

        const result = shoppingCartItemModel.toJSON();

        // test the values
        expect(result.id).not.toBeUndefined();
        expect(result.shoppingCartId).toBe(testData.shopping_cart_id);
        expect(result.listingItemId).toBe(testData.listing_item_id);
    });

    test('Should throw ValidationException because we want to create a empty shopping cart items', async () => {
        expect.assertions(1);
        await shoppingCartItemService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list shopping cart itemss with our new create one', async () => {
        const shoppingCartItemCollection = await shoppingCartItemService.findAll();
        const shoppingCartItem = shoppingCartItemCollection.toJSON();
        expect(shoppingCartItem.length).toBe(1);

        const result = shoppingCartItem[0];

        // test the values

        expect(result.shoppingCartId).toBe(testData.shopping_cart_id);
        expect(result.listingItemId).toBe(testData.listing_item_id);
    });

    test('Should return one shopping cart items', async () => {
        const shoppingCartItemModel: ShoppingCartItem = await shoppingCartItemService.findOne(createdId);
        const result = shoppingCartItemModel.toJSON();

        // test the values
        expect(result.shoppingCartId).toBe(testData.shopping_cart_id);
        expect(result.listingItemId).toBe(testData.listing_item_id);
    });

    test('Should find shopping cart items by cart id', async () => {
        const listingItem: Bookshelf.Collection<ShoppingCartItem> = await shoppingCartItemService.findListItemsByCartId(defaultShoppingCart.id);
        const result = listingItem.toJSON();

        expect(result[0].ListingItem.Bids).toBeDefined();
        expect(result[0].ListingItem.FlaggedItem).toBeDefined();
        expect(result[0].ListingItem.ItemInformation).toBeDefined();
        expect(result[0].ListingItem.ListingItemObjects).toBeDefined();
        expect(result[0].ListingItem.Market).toBeDefined();
        expect(result[0].ListingItem.MessagingInformation).toBeDefined();
        expect(result[0].ListingItem.PaymentInformation).toBeDefined();

        expect(result[0].listingItemId).toBe(testData.listing_item_id);
        expect(result[0].shoppingCartId).toBe(defaultShoppingCart.id);
    });

    test('Should find shopping cart items by cart id and listingItem id', async () => {
        const listingItem: ShoppingCartItem = await shoppingCartItemService.findOneByListingItemOnCart(defaultShoppingCart.id, testData.listing_item_id);
        const result = listingItem.toJSON();

        expect(result.ListingItem.Bids).toBeDefined();
        expect(result.ListingItem.FlaggedItem).toBeDefined();
        expect(result.ListingItem.ItemInformation).toBeDefined();
        expect(result.ListingItem.ListingItemObjects).toBeDefined();
        expect(result.ListingItem.Market).toBeDefined();
        expect(result.ListingItem.MessagingInformation).toBeDefined();
        expect(result.ListingItem.PaymentInformation).toBeDefined();

        expect(result.listingItemId).toBe(testData.listing_item_id);
        expect(result.shoppingCartId).toBe(defaultShoppingCart.id);
    });

    test('Should clear all shopping cart items of cart by cartId', async () => {
        const clearCart = await shoppingCartItemService.clearCart(defaultShoppingCart.id);

        const listingItem: Bookshelf.Collection<ShoppingCartItem> = await shoppingCartItemService.findListItemsByCartId(defaultShoppingCart.id);
        const result = listingItem.toJSON();
        expect(result).toHaveLength(0); // check cart empty
    });

    test('Should delete the shopping cart items', async () => {
        // add new Item on cart
        expect.assertions(5);

        testData.shopping_cart_id = defaultShoppingCart.id;
        testData.listing_item_id = createdListingItem.id;
        const shoppingCartItemModel: ShoppingCartItem = await shoppingCartItemService.create(testData);
        createdId = shoppingCartItemModel.Id;

        const result = shoppingCartItemModel.toJSON();

        expect(result.id).not.toBeUndefined();
        expect(result.shoppingCartId).toBe(testData.shopping_cart_id);
        expect(result.listingItemId).toBe(testData.listing_item_id);

        await shoppingCartItemService.destroy(createdId);
        await shoppingCartItemService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );

        await listingItemService.destroy(createdListingItem.id);
        await listingItemService.findOne(createdListingItem.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdListingItem.id))
        );
    });
});
