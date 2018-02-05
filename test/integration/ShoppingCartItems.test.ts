import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { ShoppingCartItems } from '../../src/api/models/ShoppingCartItems';
import { ListingItem } from '../../src/api/models/ListingItem';

import { MarketService } from '../../src/api/services/MarketService';
import { ProfileService } from '../../src/api/services/ProfileService';
import { ShoppingCartItemsService } from '../../src/api/services/ShoppingCartItemsService';
import { ListingItemService } from '../../src/api/services/ListingItemService';

import { ShoppingCartItemsCreateRequest } from '../../src/api/requests/ShoppingCartItemsCreateRequest';

import { TestDataCreateRequest } from '../../src/api/requests/TestDataCreateRequest';
import { reset } from 'chalk';

describe('ShoppingCartItems', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;
    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let marketService: MarketService;
    let profileService: ProfileService;
    let shoppingCartItemsService: ShoppingCartItemsService;
    let listingItemService: ListingItemService;

    let createdId;
    let createdListingItem;
    let defaultShoppingCart;

    const testData = {
        shopping_cart_id: 0,
        listing_item_id: 0
    } as ShoppingCartItemsCreateRequest;

    // const testDataUpdated = {
    // };

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.MarketService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.ProfileService);
        shoppingCartItemsService = app.IoC.getNamed<ShoppingCartItemsService>(Types.Service, Targets.Service.ShoppingCartItemsService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.ListingItemService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean([]);
        // listingItem
        let defaultMarket = await marketService.getDefault();
        defaultMarket = defaultMarket.toJSON();
        const defaultProfile = await profileService.getDefault();
        defaultShoppingCart = defaultProfile.toJSON().ShoppingCarts[0];
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
        const shoppingCartItemsModel: ShoppingCartItems = await shoppingCartItemsService.create(testData);
        createdId = shoppingCartItemsModel.Id;

        const result = shoppingCartItemsModel.toJSON();

        // test the values
        expect(result.id).not.toBeUndefined();
        expect(result.shoppingCartId).toBe(testData.shopping_cart_id);
        expect(result.listingItemId).toBe(testData.listing_item_id);
    });

    test('Should throw ValidationException because we want to create a empty shopping cart items', async () => {
        expect.assertions(1);
        await shoppingCartItemsService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list shopping cart itemss with our new create one', async () => {
        const shoppingCartItemsCollection = await shoppingCartItemsService.findAll();
        const shoppingCartItems = shoppingCartItemsCollection.toJSON();
        expect(shoppingCartItems.length).toBe(1);

        const result = shoppingCartItems[0];

        // test the values

        expect(result.shoppingCartId).toBe(testData.shopping_cart_id);
        expect(result.listingItemId).toBe(testData.listing_item_id);
    });

    test('Should return one shopping cart items', async () => {
        const shoppingCartItemsModel: ShoppingCartItems = await shoppingCartItemsService.findOne(createdId);
        const result = shoppingCartItemsModel.toJSON();

        // test the values
        expect(result.shoppingCartId).toBe(testData.shopping_cart_id);
        expect(result.listingItemId).toBe(testData.listing_item_id);
    });

    // /*
    // test('Should throw ValidationException because there is no related_id', async () => {
    //     expect.assertions(1);
    //     await shoppingCartItemsService.update(createdId, testDataUpdated).catch(e =>
    //         expect(e).toEqual(new ValidationException('Request body is not valid', []))
    //     );
    // });
    // */

    // test('Should update the shopping cart items', async () => {
    //     // testDataUpdated['related_id'] = 0;
    //     const shoppingCartItemsModel: ShoppingCartItems = await shoppingCartItemsService.update(createdId, testDataUpdated);
    //     const result = shoppingCartItemsModel.toJSON();

    //     // test the values
    //     // expect(result.value).toBe(testDataUpdated.value);
    // });

    test('Should delete the shopping cart items', async () => {
        expect.assertions(2);
        await shoppingCartItemsService.destroy(createdId);
        await shoppingCartItemsService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );

        await listingItemService.destroy(createdListingItem.id);
        await listingItemService.findOne(createdListingItem.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdListingItem.id))
        );
    });

});
