import * as Bookshelf from 'bookshelf';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { Profile } from '../../src/api/models/Profile';
import { Country } from '../../src/api/enums/Country';
import { TestDataGenerateRequest } from '../../src/api/requests/TestDataGenerateRequest';
import { ProfileCreateRequest } from '../../src/api/requests/ProfileCreateRequest';
import { ProfileUpdateRequest } from '../../src/api/requests/ProfileUpdateRequest';

import { ProfileService } from '../../src/api/services/ProfileService';
import { AddressService } from '../../src/api/services/AddressService';

describe('Profile', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let profileService: ProfileService;
    let addressService: AddressService;

    let createdId;

    const testData = {
        name: 'DEFAULT1',
        address: 'DEFAULT11-ADDRESS',
        shippingAddresses: [{
            title: 'Title',
            addressLine1: 'Add',
            addressLine2: 'ADD 22',
            city: 'city',
            country: Country.SWEDEN
        }, {
            title: 'Tite',
            addressLine1: 'Ad',
            addressLine2: 'ADD 222',
            city: 'city',
            country: Country.FINLAND
        }]
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

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean([], false);
    });

    afterAll(async () => {
        //
    });

    test('Should create a new profile with just delivery addresses', async () => {
        const profileModel: Profile = await profileService.create(testData);
        createdId = profileModel.Id;

        const result = profileModel.toJSON();

        expect(result.name).toBe(testData.name);
        expect(result.address).toBe(testData.address);
        expect(result.ShippingAddresses).toHaveLength(2);
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

    test('Should list profiles with our new create one', async () => {
        const profileCollection = await profileService.findAll();
        const profiles = profileCollection.toJSON();
        expect(profiles.length).toBe(1);

        const result = profiles[0];

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
        // expect(result.ShippingAddresses).toHaveLength(3);
    });

    test('Should delete the profile', async () => {
        expect.assertions(3);

        const profileModel: Profile = await profileService.findOne(createdId);
        const result = profileModel.toJSON();
        expect(result.ShippingAddresses).toHaveLength(2);

        const addressId1 = result.ShippingAddresses[0].id;

        await profileService.destroy(createdId);
        await profileService.findOne(createdId).catch(e => {
            expect(e).toEqual(new NotFoundException(createdId));
        });

        // make sure addresses were also deleted
        await profileService.findOne(addressId1).catch(e => {
            expect(e).toEqual(new NotFoundException(addressId1));
        });
    });

    test('Should create a new profile with delivery addresses and cryptoaddresses', async () => {

        const profiles: Bookshelf.Collection<Profile> = await testDataService.generate<Profile>({
            model: 'profile',
            amount: 1,
            withRelated: true
        } as TestDataGenerateRequest);

        const profileModel = profiles[0];
        const result = profileModel.toJSON();
        log.debug('result: ', JSON.stringify(result, null, 2));

        expect(result.name.substring(0, 5)).toBe('TEST-');
        expect(result.address).toBeDefined();
        expect(result.ShippingAddresses).not.toHaveLength(0);
        expect(result.CryptocurrencyAddresses).not.toHaveLength(0);
        expect(result.FavoriteItems).toHaveLength(0);

    });

    test('Should create a new profile with delivery addresses and cryptoaddresses and FavoriteItems', async () => {

        // TODO

    });

});
