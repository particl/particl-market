// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import * as Faker from 'faker';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Targets, Types } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { Market } from '../../src/api/models/Market';
import { MarketService } from '../../src/api/services/model/MarketService';
import { MarketCreateRequest } from '../../src/api/requests/model/MarketCreateRequest';
import { MarketUpdateRequest } from '../../src/api/requests/model/MarketUpdateRequest';
import { ProfileService } from '../../src/api/services/model/ProfileService';
import { MarketType } from '../../src/api/enums/MarketType';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { ValidationException } from '../../src/api/exceptions/ValidationException';

describe('Market', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let marketService: MarketService;
    let profileService: ProfileService;

    let profile: resources.Profile;
    let defaultMarket: resources.Market;
    let newMarket: resources.Market;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);

        profile = await profileService.getDefault().then(value => value.toJSON());

        // log.debug('profile: ', JSON.stringify(profile, null, 2));
    });

    it('Should get default defaultMarket', async () => {
        defaultMarket = await marketService.getDefaultForProfile(profile.id).then(value => value.toJSON());

        // test the values
        expect(defaultMarket.name).toBe('DEFAULT');
        expect(defaultMarket.receiveKey).toBeDefined();
        expect(defaultMarket.receiveKey).not.toBeNull();
        expect(defaultMarket.receiveAddress).toBeDefined();
        expect(defaultMarket.receiveAddress).not.toBeNull();
    });

    test('Should throw ValidationException because we want to create a empty Market', async () => {
        expect.assertions(1);
        await marketService.create({} as MarketCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    it('Should create a new Market', async () => {

        const testData = {
            identity_id: defaultMarket.Identity.id,
            profile_id: profile.id,
            name: 'TEST-MARKET',
            type: MarketType.MARKETPLACE,
            receiveKey: 'TEST-PRIVATE-KEY',
            receiveAddress: Faker.random.uuid()
        } as MarketCreateRequest;

        const result: resources.Market = await marketService.create(testData).then(value => value.toJSON());

        // test the values
        expect(result.name).toBe(testData.name);
        expect(result.receiveKey).toBe(testData.receiveKey);
        expect(result.receiveAddress).toBe(testData.receiveAddress);

        newMarket = result;
    });

    test('Should list Markets with our new create one', async () => {
        const markets: resources.Market[] = await marketService.findAll().then(value => value.toJSON());
        expect(markets.length).toBe(2);

        const result: resources.Market = markets[1];
        expect(result.name).toBe(newMarket.name);
        expect(result.receiveKey).toBe(newMarket.receiveKey);
        expect(result.receiveAddress).toBe(newMarket.receiveAddress);
    });

    test('Should return one Market', async () => {
        const result: resources.Market = await marketService.findOne(newMarket.id).then(value => value.toJSON());
        expect(result.name).toBe(newMarket.name);
        expect(result.receiveKey).toBe(newMarket.receiveKey);
        expect(result.receiveAddress).toBe(newMarket.receiveAddress);
    });

    test('Should update the Market', async () => {
        const testDataUpdated = {
            type: MarketType.MARKETPLACE,
            name: 'TEST-UPDATE-MARKET',
            receiveKey: 'TEST-UPDATE-PRIVATE-KEY',
            receiveAddress: Faker.random.uuid()
        } as MarketUpdateRequest;

        const result: resources.Market = await marketService.update(newMarket.id, testDataUpdated).then(value => value.toJSON());

        // test the values
        expect(result.name).toBe(testDataUpdated.name);
        expect(result.receiveKey).toBe(testDataUpdated.receiveKey);
        expect(result.receiveAddress).toBe(testDataUpdated.receiveAddress);

        newMarket = result;
    });

    test('Should find Market by address', async () => {
        const result: resources.Market = await marketService.findOneByProfileIdAndReceiveAddress(
            profile.id, newMarket.receiveAddress).then(value => value.toJSON());

        // test the values
        expect(result.name).toBe(newMarket.name);
        expect(result.receiveKey).toBe(newMarket.receiveKey);
        expect(result.receiveAddress).toBe(newMarket.receiveAddress);
    });

    test('Should delete the Market', async () => {
        expect.assertions(1);
        await marketService.destroy(newMarket.id);
        await marketService.findOne(newMarket.id).catch(e =>
            expect(e).toEqual(new NotFoundException(newMarket.id))
        );
    });

});
