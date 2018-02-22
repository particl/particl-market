import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { FavoriteItemService } from '../../src/api/services/FavoriteItemService';
import { ProfileService } from '../../src/api/services/ProfileService';
import { MarketService } from '../../src/api/services/MarketService';
import { ListingItemService } from '../../src/api/services/ListingItemService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { MessageException } from '../../src/api/exceptions/MessageException';

import { FavoriteItem } from '../../src/api/models/FavoriteItem';
import { ListingItem } from '../../src/api/models/ListingItem';
import { TestDataCreateRequest } from '../../src/api/requests/TestDataCreateRequest';

import { FavoriteItemCreateRequest } from '../../src/api/requests/FavoriteItemCreateRequest';
import { FavoriteItemUpdateRequest } from '../../src/api/requests/FavoriteItemUpdateRequest';
import { FavoriteSearchParams } from '../../src/api/requests/FavoriteSearchParams';

describe('FavoriteItem', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let favoriteItemService: FavoriteItemService;
    let profileService: ProfileService;
    let marketService: MarketService;
    let listingItemService: ListingItemService;

    let createdId;
    let defaultProfile;
    let createdListingItem;

    const testData = {
        profile_id: 0,
        listing_item_id: 0
    } as FavoriteItemCreateRequest;

    const testDataUpdated = {
    } as FavoriteItemUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        favoriteItemService = app.IoC.getNamed<FavoriteItemService>(Types.Service, Targets.Service.FavoriteItemService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.ProfileService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.MarketService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.ListingItemService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        // listing-item
        defaultProfile = await profileService.getDefault();
        defaultProfile = defaultProfile.toJSON();

        const defaultMarket = await marketService.getDefault();
        createdListingItem = await testDataService.create<ListingItem>({
            model: 'listingitem',
            data: {
                market_id: defaultMarket.Id,
                hash: 'itemhash'
            } as any,
            withRelated: true
        } as TestDataCreateRequest);
        createdListingItem = createdListingItem.toJSON();
    });

    afterAll(async () => {
        //
    });


    test('Should throw ValidationException because there is no related_id and empty', async () => {
        expect.assertions(1);
        await favoriteItemService.create({} as FavoriteItemCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new favorite item', async () => {
        testData.profile_id = defaultProfile.id;
        testData.listing_item_id = createdListingItem.id;
        const favoriteItemModel: FavoriteItem = await favoriteItemService.create(testData);
        createdId = favoriteItemModel.Id;

        const result = favoriteItemModel.toJSON();
        // test the values
        expect(result.profileId).toBe(defaultProfile.id);
        expect(result.listingItemId).toBe(createdListingItem.id);
    });

    test('Should list favorite items with our new create one', async () => {
        const favoriteItemCollection = await favoriteItemService.findAll();
        const favoriteItem = favoriteItemCollection.toJSON();
        expect(favoriteItem.length).toBe(1);

        const result = favoriteItem[0];

        // test the values
        expect(result.profileId).toBe(defaultProfile.id);
        expect(result.listingItemId).toBe(createdListingItem.id);
    });

    test('Should return one favorite item', async () => {
        const favoriteItemModel: FavoriteItem = await favoriteItemService.findOne(createdId);
        const result = favoriteItemModel.toJSON();

        // test the values
        expect(result.profileId).toBe(defaultProfile.id);
        expect(result.listingItemId).toBe(createdListingItem.id);
    });


    test('Should throw ValidationException because there is no profile_id', async () => {
        expect.assertions(1);
        const testDataUpdated2 = testDataUpdated;
        delete testDataUpdated2.profile_id;
        await favoriteItemService.update(createdId, testDataUpdated2).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should update the favorite item', async () => {
        testDataUpdated.profile_id = defaultProfile.id;
        testDataUpdated.listing_item_id = createdListingItem.id;
        const favoriteItemModel: FavoriteItem = await favoriteItemService.update(createdId, testDataUpdated);
        const result = favoriteItemModel.toJSON();

        // test the values
        expect(result.profileId).toBe(defaultProfile.id);
        expect(result.listingItemId).toBe(createdListingItem.id);
    });

    test('Should return empty favorite item search result because invalid profile id or item id', async () => {
        testDataUpdated.profile_id = defaultProfile.id;
        testDataUpdated.listing_item_id = createdListingItem.id;
        const favoriteItemModel: FavoriteItem = await favoriteItemService.search({profileId: 0, itemId: 0} as FavoriteSearchParams);
        expect(favoriteItemModel).toBe(null);
    });

    test('Should return empty favorite item search result because invalid profile id', async () => {
        testDataUpdated.profile_id = defaultProfile.id;
        testDataUpdated.listing_item_id = createdListingItem.id;
        const favoriteItemModel: FavoriteItem = await favoriteItemService.search({profileId: 0, itemId: createdListingItem.id} as FavoriteSearchParams);
        expect(favoriteItemModel).toBe(null);
    });

    test('Should return empty favorite item search result because invalid item id', async () => {
        testDataUpdated.profile_id = defaultProfile.id;
        testDataUpdated.listing_item_id = createdListingItem.id;
        const favoriteItemModel: FavoriteItem = await favoriteItemService.search({profileId: defaultProfile.id, itemId: 0} as FavoriteSearchParams);
        expect(favoriteItemModel).toBe(null);
    });

    test('Should search favorite item by profile id and item id', async () => {
        testDataUpdated.profile_id = defaultProfile.id;
        testDataUpdated.listing_item_id = createdListingItem.id;
        const favoriteItemModel: FavoriteItem = await favoriteItemService.search({profileId: defaultProfile.id,
            itemId: createdListingItem.id} as FavoriteSearchParams);
        expect(favoriteItemModel).not.toBe(null);
        const result = favoriteItemModel.toJSON();
        expect(result.profileId).toBe(defaultProfile.id);
        expect(result.listingItemId).toBe(createdListingItem.id);
    });

    test('Should search favorite item by profile name and item id', async () => {
        testDataUpdated.profile_id = defaultProfile.id;
        testDataUpdated.listing_item_id = createdListingItem.id;
        const favoriteItemModel: FavoriteItem = await favoriteItemService.search({profileId: defaultProfile.name,
            itemId: createdListingItem.id} as FavoriteSearchParams);
        expect(favoriteItemModel).not.toBe(null);
        const result = favoriteItemModel.toJSON();
        expect(result.profileId).toBe(defaultProfile.id);
        expect(result.listingItemId).toBe(createdListingItem.id);
    });

    test('Should search favorite item by profile id and item hash', async () => {
        testDataUpdated.profile_id = defaultProfile.id;
        testDataUpdated.listing_item_id = createdListingItem.id;
        const favoriteItemModel: FavoriteItem = await favoriteItemService.search({profileId: defaultProfile.id,
            itemId: createdListingItem.hash} as FavoriteSearchParams);
        expect(favoriteItemModel).not.toBe(null);
        const result = favoriteItemModel.toJSON();
        expect(result.profileId).toBe(defaultProfile.id);
        expect(result.listingItemId).toBe(createdListingItem.id);
    });

    test('Should search favorite item by profile name and item hash', async () => {
        testDataUpdated.profile_id = defaultProfile.id;
        testDataUpdated.listing_item_id = createdListingItem.id;
        const favoriteItemModel: FavoriteItem = await favoriteItemService.search({profileId: defaultProfile.name,
            itemId: createdListingItem.hash} as FavoriteSearchParams);
        expect(favoriteItemModel).not.toBe(null);
        const result = favoriteItemModel.toJSON();
        expect(result.profileId).toBe(defaultProfile.id);
        expect(result.listingItemId).toBe(createdListingItem.id);
    });

    test('Should throw ValidationException because we want to search by invalid item hash', async () => {
        expect.assertions(1);
        await favoriteItemService.search({profileId: defaultProfile.name,
            itemId: 'TEST HASH'} as FavoriteSearchParams).catch(e =>
            expect(e).toEqual(new NotFoundException('TEST HASH'))
        );
    });

    test('Should throw MessageException because we want to search by invalid profile name', async () => {
        expect.assertions(1);
        await favoriteItemService.search({profileId: 'TEST PROFILE NAME',
            itemId: createdListingItem.id} as FavoriteSearchParams).catch(e =>
            expect(e).toEqual(new MessageException('Profile not found for the given name = TEST PROFILE NAME'))
        );
    });

    test('Should delete the favorite item', async () => {
        expect.assertions(2);
        await favoriteItemService.destroy(createdId);
        await favoriteItemService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
        // remove listingItem
        await listingItemService.destroy(createdListingItem.id);
        await listingItemService.findOne(createdListingItem.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdListingItem.id))
        );
    });

});
