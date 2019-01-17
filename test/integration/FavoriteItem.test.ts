// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { app } from '../../src/app';
import * as Bookshelf from 'bookshelf';
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
import { FavoriteItem } from '../../src/api/models/FavoriteItem';
import { FavoriteItemCreateRequest } from '../../src/api/requests/FavoriteItemCreateRequest';
import { FavoriteItemUpdateRequest } from '../../src/api/requests/FavoriteItemUpdateRequest';
import * as resources from 'resources';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { GenerateListingItemParams } from '../../src/api/requests/params/GenerateListingItemParams';
import { TestDataGenerateRequest } from '../../src/api/requests/TestDataGenerateRequest';

describe('FavoriteItem', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let favoriteItemService: FavoriteItemService;
    let profileService: ProfileService;
    let marketService: MarketService;
    let listingItemService: ListingItemService;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;

    let createdListingItem1: resources.ListingItem;
    let createdListingItem2: resources.ListingItem;
    let createdFavoriteItem: resources.FavoriteItem;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        favoriteItemService = app.IoC.getNamed<FavoriteItemService>(Types.Service, Targets.Service.FavoriteItemService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.ProfileService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.MarketService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.ListingItemService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        // get default profile
        const defaultProfileModel = await profileService.getDefault();
        defaultProfile = defaultProfileModel.toJSON();

        // get default market
        const defaultMarketModel = await marketService.getDefault();
        defaultMarket = defaultMarketModel.toJSON();

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
            defaultProfile.address              // seller
        ]).toParamsArray();

        // create ListingItem
        const listingItems = await testDataService.generate({
            model: CreatableModel.LISTINGITEM,  // what to generate
            amount: 2,                          // how many to generate
            withRelated: true,                  // return model
            generateParams: generateListingItemParams // what kind of data to generate
        } as TestDataGenerateRequest);
        createdListingItem1 = listingItems[0];
        createdListingItem2 = listingItems[1];

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

    test('Should create a new FavoriteItem', async () => {
        const testData = {
            profile_id: defaultProfile.id,
            listing_item_id: createdListingItem1.id
        } as FavoriteItemCreateRequest;

        const favoriteItemModel: FavoriteItem = await favoriteItemService.create(testData);
        createdFavoriteItem = favoriteItemModel.toJSON();

        expect(createdFavoriteItem.Profile.id).toBe(defaultProfile.id);
        expect(createdFavoriteItem.ListingItem.id).toBe(createdListingItem1.id);
    });

    test('Should list FavoriteItems with our new create one', async () => {
        const favoriteItemCollection = await favoriteItemService.findAll();
        const favoriteItems = favoriteItemCollection.toJSON();
        expect(favoriteItems.length).toBe(1);

    });

    test('Should return one FavoriteItem', async () => {
        const favoriteItemModel: FavoriteItem = await favoriteItemService.findOne(createdFavoriteItem.id);
        const result = favoriteItemModel.toJSON();

        // test the values
        expect(result.Profile.id).toBe(createdFavoriteItem.Profile.id);
        expect(result.ListingItem.id).toBe(createdFavoriteItem.ListingItem.id);
    });


    test('Should throw ValidationException because there is no profile_id', async () => {
        expect.assertions(1);
        const testData = {
            listing_item_id: createdListingItem1.id
        } as FavoriteItemUpdateRequest;

        await favoriteItemService.update(createdFavoriteItem.id, testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should update the FavoriteItem', async () => {
        const testData = {
            profile_id: defaultProfile.id,
            listing_item_id: createdListingItem2.id
        } as FavoriteItemUpdateRequest;

        const favoriteItemModel: FavoriteItem = await favoriteItemService.update(createdFavoriteItem.id, testData);
        const result = favoriteItemModel.toJSON();
        createdFavoriteItem = result;

        // test the values
        expect(result.Profile.id).toBe(testData.profile_id);
        expect(result.ListingItem.id).toBe(testData.listing_item_id);
    });

    test('Should throw because invalid profileId and itemId', async () => {
        expect.assertions(1);
        const invalidProfileId = 0;
        const invalidItemId = 0;
        await favoriteItemService.findOneByProfileIdAndListingItemId(invalidProfileId, invalidItemId).catch(e =>
            expect(e).toEqual(new NotFoundException(invalidProfileId + ' or ' + invalidItemId))
        );
    });

    test('Should throw because invalid profileId', async () => {
        expect.assertions(1);
        const invalidProfileId = 0;
        await favoriteItemService.findOneByProfileIdAndListingItemId(invalidProfileId, createdListingItem2.id).catch(e =>
            expect(e).toEqual(new NotFoundException(invalidProfileId + ' or ' + createdListingItem2.id))
        );
    });

    test('Should throw because invalid itemId', async () => {
        expect.assertions(1);
        const invalidItemId = 0;
        await favoriteItemService.findOneByProfileIdAndListingItemId(defaultProfile.id, invalidItemId).catch(e =>
            expect(e).toEqual(new NotFoundException(defaultProfile.id + ' or ' + invalidItemId))
        );
    });

    test('Should find FavoriteItem by profileId and itemId', async () => {
        const favoriteItemModel: FavoriteItem = await favoriteItemService.findOneByProfileIdAndListingItemId(defaultProfile.id, createdListingItem2.id);
        expect(favoriteItemModel).not.toBe(null);
        const result = favoriteItemModel.toJSON();
        expect(result.profileId).toBe(defaultProfile.id);
        expect(result.listingItemId).toBe(createdListingItem2.id);
    });

    test('Should find FavoriteItems by profileId and withRelated = true', async () => {
        const favoriteItemModel: Bookshelf.Collection<FavoriteItem> =
            await favoriteItemService.findAllByProfileId(
                defaultProfile.id,
                true
            );
        expect(favoriteItemModel).not.toBe(null);
        const result = favoriteItemModel.toJSON();
        expect(result).toHaveLength(1);
        expect(result[0].ListingItem).toBeDefined();
        expect(result[0].ListingItem.id).toBe(createdListingItem2.id);
        expect(result[0].ListingItem.Bids).toBeDefined();
        expect(result[0].ListingItem.FlaggedItem).toBeDefined();
        expect(result[0].ListingItem.ItemInformation).toBeDefined();
        expect(result[0].ListingItem.ListingItemObjects).toBeDefined();
        expect(result[0].ListingItem.Market).toBeDefined();
        expect(result[0].ListingItem.MessagingInformation).toBeDefined();
        expect(result[0].ListingItem.PaymentInformation).toBeDefined();
        expect(result[0].ListingItem.hash).not.toBeNull();
        expect(result[0].ListingItem.listingItemTemplateId).toBeNull();
        expect(result[0].ListingItem.marketId).toBe(defaultMarket.id);
        expect(result[0].Profile).toBeDefined();
        expect(result[0].Profile.id).toBe(defaultProfile.id);
    });

    test('Should delete the FavoriteItem', async () => {
        expect.assertions(2);
        await favoriteItemService.destroy(createdFavoriteItem.id);
        await favoriteItemService.findOne(createdFavoriteItem.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdFavoriteItem.id))
        );
        // remove listingItem
        await listingItemService.destroy(createdListingItem1.id);
        await listingItemService.findOne(createdListingItem1.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdListingItem1.id))
        );
    });

});
