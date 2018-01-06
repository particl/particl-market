import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { Country } from '../../src/api/enums/Country';
import { Address } from '../../src/api/models/Address';

import { AddressCreateRequest } from '../../src/api/requests/AddressCreateRequest';
import { AddressUpdateRequest } from '../../src/api/requests/AddressUpdateRequest';

import { AddressService } from '../../src/api/services/AddressService';
import { ProfileService } from '../../src/api/services/ProfileService';

describe('Address', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let addressService: AddressService;
    let profileService: ProfileService;

    let createdId;
    let defaultProfileId;

    const testData = {
        title: 'Title',
        addressLine1: 'Add',
        addressLine2: 'ADD 22',
        city: 'city',
        country: Country.FINLAND,
        profile_id: 0
    } as AddressCreateRequest;

    const testDataUpdated = {
        title: 'Work',
        addressLine1: '123 6th St',
        addressLine2: 'Melbourne, FL 32904',
        city: 'Melbourne',
        country: Country.SWEDEN,
        profile_id: 0
    } as AddressUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        addressService = app.IoC.getNamed<AddressService>(Types.Service, Targets.Service.AddressService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.ProfileService);

        // clean up the db
        await testDataService.clean([]);
        const defaultProfile = await profileService.getDefault();
        defaultProfileId = defaultProfile.id;
    });


    test('Should throw ValidationException because there is no profile_id', async () => {
        expect.assertions(1);
        await addressService.create({
            title: 'Title',
            addressLine1: 'Add',
            addressLine2: 'ADD 22',
            city: 'city',
            country: Country.FINLAND
        } as AddressCreateRequest).catch(e => {
            expect(e).toEqual(new ValidationException('Request body is not valid', []));
        });
    });

    test('Should create a new address', async () => {
        testData.profile_id = defaultProfileId;
        const addressModel: Address = await addressService.create(testData);
        createdId = addressModel.Id;

        const result = addressModel.toJSON();
        expect(result.title).toBe(testData.title);
        expect(result.addressLine1).toBe(testData.addressLine1);
        expect(result.addressLine2).toBe(testData.addressLine2);
        expect(result.city).toBe(testData.city);
        expect(result.country).toBe(testData.country);
    });

    test('Should throw ValidationException because we want to create an empty address', async () => {
        expect.assertions(1);
        await addressService.create({} as AddressCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list addresses with our new create one', async () => {
        const addressesCollection = await addressService.findAll();
        const addresses = addressesCollection.toJSON();
        expect(addresses.length).toBe(1);

        const result = addresses[0];
        expect(result.title).toBe(testData.title);
        expect(result.addressLine1).toBe(testData.addressLine1);
        expect(result.addressLine2).toBe(testData.addressLine2);
        expect(result.city).toBe(testData.city);
        expect(result.country).toBe(testData.country);
    });

    test('Should return one address', async () => {
        const addressModel: Address = await addressService.findOne(createdId);
        const result = addressModel.toJSON();

        expect(result.title).toBe(testData.title);
        expect(result.addressLine1).toBe(testData.addressLine1);
        expect(result.addressLine2).toBe(testData.addressLine2);
        expect(result.city).toBe(testData.city);
        expect(result.country).toBe(testData.country);
    });

    test('Should throw ValidationException because there is no profile_id', async () => {
        expect.assertions(1);
        await addressService.update(createdId, {
            title: 'Title',
            addressLine1: 'Add',
            addressLine2: 'ADD 22',
            city: 'city',
            country: Country.FINLAND
        } as AddressUpdateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
            );
    });

    test('Should update the address', async () => {
        testDataUpdated.profile_id = defaultProfileId;
        const addressModel: Address = await addressService.update(createdId, testDataUpdated);
        const result = addressModel.toJSON();

        expect(result.title).toBe(testDataUpdated.title);
        expect(result.addressLine1).toBe(testDataUpdated.addressLine1);
        expect(result.addressLine2).toBe(testDataUpdated.addressLine2);
        expect(result.city).toBe(testDataUpdated.city);
        expect(result.country).toBe(testDataUpdated.country);
    });

    test('Should delete the address', async () => {
        expect.assertions(1);
        await addressService.destroy(createdId);
        await addressService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

});
