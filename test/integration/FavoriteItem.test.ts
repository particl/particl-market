// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * from 'jest';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { FavoriteItemService } from '../../src/api/services/model/FavoriteItemService';
import { ProfileService } from '../../src/api/services/model/ProfileService';
import { MarketService } from '../../src/api/services/model/MarketService';
import { ListingItemService } from '../../src/api/services/model/ListingItemService';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { FavoriteItem } from '../../src/api/models/FavoriteItem';
import { FavoriteItemCreateRequest } from '../../src/api/requests/model/FavoriteItemCreateRequest';
import { FavoriteItemUpdateRequest } from '../../src/api/requests/model/FavoriteItemUpdateRequest';
import { ListingItemTemplateService } from '../../src/api/services/model/ListingItemTemplateService';
import { DefaultMarketService } from '../../src/api/services/DefaultMarketService';

describe('FavoriteItem', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let defaultMarketService: DefaultMarketService;
    let favoriteItemService: FavoriteItemService;
    let profileService: ProfileService;
    let marketService: MarketService;
    let listingItemService: ListingItemService;
    let listingItemTemplateService: ListingItemTemplateService;

    let bidderMarket: resources.Market;
    let bidderProfile: resources.Profile;
    let sellerProfile: resources.Profile;
    let sellerMarket: resources.Market;

    let listingItem1: resources.ListingItem;
    let listingItem2: resources.ListingItem;
    let createdFavoriteItem: resources.FavoriteItem;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        defaultMarketService = app.IoC.getNamed<DefaultMarketService>(Types.Service, Targets.Service.DefaultMarketService);
        favoriteItemService = app.IoC.getNamed<FavoriteItemService>(Types.Service, Targets.Service.model.FavoriteItemService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.model.ListingItemService);
        listingItemTemplateService = app.IoC.getNamed<ListingItemTemplateService>(Types.Service, Targets.Service.model.ListingItemTemplateService);

        bidderProfile = await profileService.getDefault().then(value => value.toJSON());
        bidderMarket = await defaultMarketService.getDefaultForProfile(bidderProfile.id).then(value => value.toJSON());

        sellerProfile = await testDataService.generateProfile();
        sellerMarket = await defaultMarketService.getDefaultForProfile(sellerProfile.id).then(value => value.toJSON());

        listingItem1 = await testDataService.generateListingItemWithTemplate(sellerProfile, bidderMarket);
        listingItem2 = await testDataService.generateListingItemWithTemplate(sellerProfile, bidderMarket);

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
            profile_id: bidderProfile.id,
            listing_item_id: listingItem1.id
        } as FavoriteItemCreateRequest;

        createdFavoriteItem = await favoriteItemService.create(testData).then(value => value.toJSON());

        expect(createdFavoriteItem.Profile.id).toBe(testData.profile_id);
        expect(createdFavoriteItem.ListingItem.id).toBe(testData.listing_item_id);
    });

    test('Should list FavoriteItems with our new create one', async () => {
        const favoriteItems: resources.FavoriteItem[] = await favoriteItemService.findAll().then(value => value.toJSON());
        expect(favoriteItems.length).toBe(1);

    });

    test('Should return one FavoriteItem', async () => {
        const result: resources.FavoriteItem = await favoriteItemService.findOne(createdFavoriteItem.id).then(value => value.toJSON());

        // test the values
        expect(result.Profile.id).toBe(createdFavoriteItem.Profile.id);
        expect(result.ListingItem.id).toBe(createdFavoriteItem.ListingItem.id);
    });

    test('Should update the FavoriteItem', async () => {
        const testData = {
            profile_id: bidderProfile.id,
            listing_item_id: listingItem2.id
        } as FavoriteItemUpdateRequest;

        const result: resources.FavoriteItem = await favoriteItemService.update(createdFavoriteItem.id, testData).then(value => value.toJSON());

        // test the values
        expect(result.Profile.id).toBe(testData.profile_id);
        expect(result.ListingItem.id).toBe(testData.listing_item_id);

        createdFavoriteItem = result;
    });

    test('Should find FavoriteItem by profileId and itemId', async () => {
        const result: resources.FavoriteItem = await favoriteItemService.findOneByProfileIdAndListingItemId(bidderProfile.id, listingItem2.id)
            .then(value => value.toJSON());
        expect(result.profileId).toBe(bidderProfile.id);
        expect(result.listingItemId).toBe(listingItem2.id);
    });

    test('Should find FavoriteItems by profileId and withRelated = true', async () => {
        const result: resources.FavoriteItem[] = await favoriteItemService.findAllByProfileId(bidderProfile.id, true).then(value => value.toJSON());

        expect(result).toHaveLength(1);
        expect(result[0].ListingItem).toBeDefined();
        expect(result[0].Profile).toBeDefined();
        expect(result[0].Profile.id).toBe(bidderProfile.id);
    });

    test('Should delete the FavoriteItem', async () => {
        expect.assertions(1);
        await favoriteItemService.destroy(createdFavoriteItem.id);
        await favoriteItemService.findOne(createdFavoriteItem.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdFavoriteItem.id))
        );
    });

});
