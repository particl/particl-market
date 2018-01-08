import * as Bookshelf from 'bookshelf';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { MarketService } from '../../src/api/services/MarketService';
import { ListingItemService } from '../../src/api/services/ListingItemService';
import { ProfileService } from '../../src/api/services/ProfileService';
import { AddressService } from '../../src/api/services/AddressService';
import { CryptocurrencyAddressService } from '../../src/api/services/CryptocurrencyAddressService';
import { FavoriteItemService } from '../../src/api/services/FavoriteItemService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { Profile } from '../../src/api/models/Profile';
import { Address } from '../../src/api/models/Address';
import { ListingItem } from '../../src/api/models/ListingItem';
import { FavoriteItem } from '../../src/api/models/FavoriteItem';

import { Country } from '../../src/api/enums/Country';
import { ProfileCreateRequest } from '../../src/api/requests/ProfileCreateRequest';
import { ProfileUpdateRequest } from '../../src/api/requests/ProfileUpdateRequest';
import { TestDataCreateRequest } from '../../src/api/requests/TestDataCreateRequest';
import { TestDataGenerateRequest } from '../../src/api/requests/TestDataGenerateRequest';
import { FavoriteItemCreateRequest } from '../../src/api/requests/FavoriteItemCreateRequest';

describe('Profile', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let profileService: ProfileService;
    let addressService: AddressService;
    let cryptocurAddService: CryptocurrencyAddressService;
    let marketService: MarketService;
    let listingItemService: ListingItemService;
    let favoriteItemService: FavoriteItemService;

    let createdId;
    let createdListingItem;

    const testData = {
        name: 'DEFAULT1',
        address: 'DEFAULT11-ADDRESS',
        shippingAddresses: [{
            title: 'Title',
            addressLine1: 'Add',
            addressLine2: 'ADD 22',
            city: 'city',
            country: Country.SWEDEN,
            zipCode: 452001
        }, {
            title: 'Tite',
            addressLine1: 'Ad',
            addressLine2: 'ADD 222',
            city: 'city',
            country: Country.FINLAND,
            zipCode: 452001
        }] as any
    } as ProfileCreateRequest;

    const testDataUpdated = {
        name: 'DEFAULT2',
        address: 'DEFAULT12-ADDRESS'
    } as ProfileUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.ProfileService);
        addressService = app.IoC.getNamed<AddressService>(Types.Service, Targets.Service.AddressService);
        cryptocurAddService = app.IoC.getNamed<CryptocurrencyAddressService>(Types.Service, Targets.Service.CryptocurrencyAddressService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.MarketService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.ListingItemService);
        favoriteItemService = app.IoC.getNamed<FavoriteItemService>(Types.Service, Targets.Service.FavoriteItemService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean([]);

        // create market
        let defaultMarket = await marketService.getDefault();
        defaultMarket = defaultMarket.toJSON();

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

    test('Should throw ValidationException because we want to create a empty profile', async () => {
        expect.assertions(1);
        await profileService.create({} as ProfileCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should throw ValidationException because missing profile address', async () => {
        expect.assertions(1);
        await profileService.create({ name: 'test' } as ProfileCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new profile with just delivery addresses', async () => {
        const profileModel: Profile = await profileService.create(testData);
        createdId = profileModel.Id;

        const result = profileModel.toJSON();

        expect(result.name).toBe(testData.name);
        expect(result.address).toBe(testData.address);
        expect(result.ShippingAddresses).toHaveLength(2);
    });

    test('Should list profiles with our new create one', async () => {
        const profileCollection = await profileService.findAll();
        const profiles = profileCollection.toJSON();
        expect(profiles.length).toBe(2); // including default one

        const result = profiles[1];

        expect(result.name).toBe(testData.name);
        expect(result.address).toBe(testData.address);
        expect(result.ShippingAddresses).toBe(undefined);           // doesnt fetch related
        expect(result.CryptocurrencyAddresses).toBe(undefined);     // doesnt fetch related
        expect(result.FavoriteItems).toBe(undefined);               // doesnt fetch related
    });

    test('Should return one profile', async () => {
        const profileModel: Profile = await profileService.findOne(createdId);
        const result = profileModel.toJSON();

        expect(result.name).toBe(testData.name);
        expect(result.address).toBe(testData.address);
        expect(result.ShippingAddresses).toHaveLength(2);
        expect(result.CryptocurrencyAddresses).toHaveLength(0);
        expect(result.FavoriteItems).toHaveLength(0);
    });

    // TODO: updating profile does not affect related models
    test('Should update the profile', async () => {
        const profileModel: Profile = await profileService.update(createdId, testDataUpdated);
        const result = profileModel.toJSON();

        expect(result.name).toBe(testDataUpdated.name);
        expect(result.address).toBe(testDataUpdated.address);
        expect(result.ShippingAddresses).toHaveLength(2);
    });

    test('Should delete the profile', async () => {
        expect.assertions(4);

        const profileModel: Profile = await profileService.findOne(createdId);
        const result = profileModel.toJSON();
        expect(result.ShippingAddresses).toHaveLength(2);

        const addressId1 = result.ShippingAddresses[0].id;
        const addressId2 = result.ShippingAddresses[1].id;

        await profileService.destroy(createdId);
        await profileService.findOne(createdId).catch(e => {
            expect(e).toEqual(new NotFoundException(createdId));
        });

        // make sure addresses were also deleted
        await addressService.findOne(addressId1).catch(e => {
            expect(e).toEqual(new NotFoundException(addressId1));
        });
        await addressService.findOne(addressId2).catch(e => {
            expect(e).toEqual(new NotFoundException(addressId2));
        });
    });

    test('Should create a new profile with delivery addresses and cryptoaddresses', async () => {

        const profiles: Bookshelf.Collection<Profile> = await testDataService.generate<Profile>({
            model: 'profile',
            amount: 1,
            withRelated: true
        } as TestDataGenerateRequest);

        const profileModel = profiles[0];
        // expect(profileModel).toBe(1);
        const result = profileModel.toJSON();
        // expect(result.id).toBe(1);

        expect(result.name.substring(0, 5)).toBe('TEST-');
        expect(result.address).toBeDefined();
        expect(result.ShippingAddresses).not.toHaveLength(0);
        expect(result.CryptocurrencyAddresses).not.toHaveLength(0);
        expect(result.FavoriteItems).toHaveLength(0);

        await profileService.destroy(result.id);
        await profileService.findOne(result.id).catch(e => {
            expect(e).toEqual(new NotFoundException(result.id));
        });

        const firstAddressId = result.ShippingAddresses[0].id;
        // make sure addresses were also deleted
        await addressService.findOne(firstAddressId).catch(e => {
            expect(e).toEqual(new NotFoundException(firstAddressId));
        });
        const firstCryptoCurrAddId = result.CryptocurrencyAddresses[0].id;
        // make sure addresses were also deleted
        await cryptocurAddService.findOne(firstCryptoCurrAddId).catch(e => {
            expect(e).toEqual(new NotFoundException(firstCryptoCurrAddId));
        });

    });

    test('Should create a new profile with delivery addresses and cryptoaddresses and FavoriteItems', async () => {
        const profiles: Bookshelf.Collection<Profile> = await testDataService.generate<Profile>({
            model: 'profile',
            amount: 1,
            withRelated: true
        } as TestDataGenerateRequest);

        // add fav-item for that profile.
        const favoriteItemModel: FavoriteItem = await favoriteItemService.create({
            profile_id: profiles[0].id,
            listing_item_id: createdListingItem.id
        } as FavoriteItemCreateRequest);

        // get profile
        const profileModel: Profile = await profileService.findOne(profiles[0].id);
        const result = profileModel.toJSON();

        expect(result.name.substring(0, 5)).toBe('TEST-');
        expect(result.address).toBeDefined();
        expect(result.ShippingAddresses).not.toHaveLength(0);
        expect(result.CryptocurrencyAddresses).not.toHaveLength(0);
        expect(result.FavoriteItems).toHaveLength(1);

        await profileService.destroy(result.id);
        await profileService.findOne(result.id).catch(e => {
            expect(e).toEqual(new NotFoundException(result.id));
        });

        const firstAddressId = result.ShippingAddresses[0].id;
        // make sure addresses were also deleted
        await addressService.findOne(firstAddressId).catch(e => {
            expect(e).toEqual(new NotFoundException(firstAddressId));
        });

        const firstCryptoCurrAddId = result.CryptocurrencyAddresses[0].id;
        // make sure CryptocurAddress were also deleted
        await cryptocurAddService.findOne(firstCryptoCurrAddId).catch(e => {
            expect(e).toEqual(new NotFoundException(firstCryptoCurrAddId));
        });

        const favItemId = result.FavoriteItems[0].id;
        // make sure favItem were also deleted
        await favoriteItemService.findOne(favItemId).catch(e => {
            expect(e).toEqual(new NotFoundException(favItemId));
        });
    });

});
