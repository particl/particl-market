// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import * as Faker from 'faker';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { MarketService } from '../../src/api/services/model/MarketService';
import { ProfileService } from '../../src/api/services/model/ProfileService';
import { AddressService } from '../../src/api/services/model/AddressService';
import { CryptocurrencyAddressService } from '../../src/api/services/model/CryptocurrencyAddressService';
import { FavoriteItemService } from '../../src/api/services/model/FavoriteItemService';
import { ShoppingCartService } from '../../src/api/services/model/ShoppingCartService';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { ProfileCreateRequest } from '../../src/api/requests/model/ProfileCreateRequest';
import { ProfileUpdateRequest } from '../../src/api/requests/model/ProfileUpdateRequest';
import { AddressCreateRequest } from '../../src/api/requests/model/AddressCreateRequest';
import { AddressType } from '../../src/api/enums/AddressType';

describe('Profile', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let profileService: ProfileService;
    let addressService: AddressService;
    let cryptocurAddService: CryptocurrencyAddressService;
    let marketService: MarketService;
    let favoriteItemService: FavoriteItemService;
    let shoppingCartService: ShoppingCartService;

    let profile: resources.Profile;

    const testData = {
        name: 'TEST-' + Faker.random.uuid(),
        shippingAddresses: [{
            firstName: 'Robert',
            lastName: 'Downey',
            title: 'Title',
            addressLine1: 'Add',
            addressLine2: 'ADD 22',
            city: 'city',
            state: 'test state',
            country: 'Sweden',
            zipCode: '85001',
            type: AddressType.SHIPPING_OWN
        }, {
            firstName: 'Johnny',
            lastName: 'Depp',
            title: 'Tite',
            addressLine1: 'Ad',
            addressLine2: 'ADD 222',
            city: 'city',
            state: 'test state',
            country: 'Finland',
            zipCode: '85001',
            type: AddressType.SHIPPING_OWN
        }] as AddressCreateRequest[]
    } as ProfileCreateRequest;

    const testDataUpdated = {
        name: 'TEST-' + Faker.random.uuid()
    } as ProfileUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);
        addressService = app.IoC.getNamed<AddressService>(Types.Service, Targets.Service.model.AddressService);
        cryptocurAddService = app.IoC.getNamed<CryptocurrencyAddressService>(Types.Service, Targets.Service.model.CryptocurrencyAddressService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);
        favoriteItemService = app.IoC.getNamed<FavoriteItemService>(Types.Service, Targets.Service.model.FavoriteItemService);
        shoppingCartService = app.IoC.getNamed<ShoppingCartService>(Types.Service, Targets.Service.model.ShoppingCartService);

    });

    afterAll(async () => {
        //
    });

    test('Should throw ValidationException because we want to create a empty Profile', async () => {
        expect.assertions(1);
        await profileService.create({} as ProfileCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new Profile with just delivery addresses', async () => {
        const result: resources.Profile = await profileService.create(testData).then(value => value.toJSON());

        expect(result.name).toBe(testData.name);
        expect(result.ShippingAddresses).toHaveLength(2);
        profile = result;
    });

    test('Should list all Profiles with our new create one', async () => {
        const profiles: resources.Profile[] = await profileService.findAll().then(value => value.toJSON());
        expect(profiles.length).toBe(2); // including default one

        const result = profiles[1];

        expect(result.name).toBe(testData.name);
        expect(result.ShippingAddresses).toBe(undefined);           // doesnt fetch related
        expect(result.CryptocurrencyAddresses).toBe(undefined);     // doesnt fetch related
        expect(result.FavoriteItems).toBe(undefined);               // doesnt fetch related
    });

    test('Should return one Profile', async () => {
        const result: resources.Profile = await profileService.findOne(profile.id).then(value => value.toJSON());

        expect(result.name).toBe(testData.name);
        expect(result.ShippingAddresses).toHaveLength(2);
        expect(result.CryptocurrencyAddresses).toHaveLength(0);
        expect(result.FavoriteItems).toHaveLength(0);
    });

    test('Should update the Profile', async () => {
        const result: resources.Profile = await profileService.update(profile.id, testDataUpdated).then(value => value.toJSON());

        expect(result.name).toBe(testDataUpdated.name);
        expect(result.ShippingAddresses).toHaveLength(2);

        profile = result;
    });

    test('Should delete the Profile', async () => {
        expect.assertions(5);

        const result: resources.Profile = await profileService.findOne(profile.id).then(value => value.toJSON());
        expect(result.ShippingAddresses).toHaveLength(2);

        await profileService.destroy(profile.id);
        await profileService.findOne(profile.id).catch(e => {
            expect(e).toEqual(new NotFoundException(profile.id));
        });

        // make sure addresses were also deleted
        await addressService.findOne(result.ShippingAddresses[0].id).catch(e => {
            expect(e).toEqual(new NotFoundException(result.ShippingAddresses[0].id));
        });
        await addressService.findOne(result.ShippingAddresses[1].id).catch(e => {
            expect(e).toEqual(new NotFoundException(result.ShippingAddresses[1].id));
        });
    });

});
