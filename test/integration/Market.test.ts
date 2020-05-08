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
import { DefaultMarketService } from '../../src/api/services/DefaultMarketService';

describe('Market', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let defaultMarketService: DefaultMarketService;
    let marketService: MarketService;
    let profileService: ProfileService;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;

    let newMarket: resources.Market;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        defaultMarketService = app.IoC.getNamed<DefaultMarketService>(Types.Service, Targets.Service.DefaultMarketService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);

        defaultProfile = await profileService.getDefault().then(value => value.toJSON());

        // log.debug('defaultProfile: ', JSON.stringify(defaultProfile, null, 2));
    });

    test('Should throw ValidationException because we want to create a empty Market', async () => {
        expect.assertions(1);
        await marketService.create({} as MarketCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should get default default Market for Profile', async () => {
        defaultMarket = await defaultMarketService.getDefaultForProfile(defaultProfile.id).then(value => value.toJSON());

        expect(defaultMarket.name).toBe('DEFAULT');
        expect(defaultMarket.receiveKey).toBeDefined();
        expect(defaultMarket.receiveAddress).toBeDefined();
        expect(defaultMarket.publishKey).toBeDefined();
        expect(defaultMarket.publishAddress).toBeDefined();
    });

    test('Should create a new Market', async () => {
        const key = 'TEST-PRIVATE-KEY';
        const address = Faker.random.uuid();

        const testData = {
            identity_id: defaultMarket.Identity.id,
            profile_id: defaultProfile.id,
            name: 'TEST-MARKET',
            type: MarketType.MARKETPLACE,
            receiveKey: key,
            receiveAddress: address,
            publishKey: key,
            publishAddress: address
        } as MarketCreateRequest;

        const result: resources.Market = await marketService.create(testData).then(value => value.toJSON());
        expect(result.name).toBe(testData.name);
        expect(result.type).toBe(testData.type);
        expect(result.receiveKey).toBe(testData.receiveKey);
        expect(result.receiveAddress).toBe(testData.receiveAddress);
        expect(result.publishKey).toBe(testData.publishKey);
        expect(result.publishAddress).toBe(testData.publishAddress);

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

    test('Should find one Market by id', async () => {
        const result: resources.Market = await marketService.findOne(newMarket.id).then(value => value.toJSON());
        expect(result.name).toBe(newMarket.name);
        expect(result.receiveKey).toBe(newMarket.receiveKey);
        expect(result.receiveAddress).toBe(newMarket.receiveAddress);
    });

    test('Should find one Market by Profile and receiveAddress', async () => {
        const result: resources.Market = await marketService.findOneByProfileIdAndReceiveAddress(
            defaultProfile.id, newMarket.receiveAddress).then(value => value.toJSON());
        expect(result.name).toBe(newMarket.name);
        expect(result.receiveKey).toBe(newMarket.receiveKey);
        expect(result.receiveAddress).toBe(newMarket.receiveAddress);
    });

    test('Should find one Market by Profile and name', async () => {
        const result: resources.Market = await marketService.findOneByProfileIdAndName(defaultProfile.id, newMarket.name).then(value => value.toJSON());
        expect(result.name).toBe(newMarket.name);
        expect(result.receiveKey).toBe(newMarket.receiveKey);
        expect(result.receiveAddress).toBe(newMarket.receiveAddress);
    });

    test('Should find all Markets by Profile', async () => {
        const markets: resources.Market[] = await marketService.findAllByProfileId(defaultProfile.id).then(value => value.toJSON());
        expect(markets.length).toBe(2);
    });

    test('Should find all Markets by receiveAddress', async () => {
        const markets: resources.Market[] = await marketService.findAllByReceiveAddress(newMarket.receiveAddress).then(value => value.toJSON());
        expect(markets.length).toBe(1);
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

    test('Should delete the Market', async () => {
        expect.assertions(1);
        await marketService.destroy(newMarket.id);
        await marketService.findOne(newMarket.id).catch(e =>
            expect(e).toEqual(new NotFoundException(newMarket.id))
        );
    });

});
