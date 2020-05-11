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
    let createdId;

    const testData = {
        type: MarketType.MARKETPLACE,
        name: 'TEST-MARKET',
        receiveKey: 'TEST-PRIVATE-KEY',
        receiveAddress: Faker.random.uuid()
    } as MarketCreateRequest;

    const testDataUpdated = {
        type: MarketType.MARKETPLACE,
        name: 'TEST-UPDATE-MARKET',
        receiveKey: 'TEST-UPDATE-PRIVATE-KEY',
        receiveAddress: Faker.random.uuid()
    } as MarketUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        profile = await profileService.getDefault().then(value => value.toJSON());
        log.debug('profile: ', JSON.stringify(profile, null, 2));
    });

    it('Should get default market', async () => {
        const result: resources.Market = await marketService.getDefaultForProfile(profile.id)
            .then(value => value.toJSON());
        log.debug('result: ', JSON.stringify(result, null, 2));

        // test the values
        expect(result.name).toBe('DEFAULT');
        expect(result.receiveKey).toBeDefined();
        expect(result.receiveKey).not.toBeNull();
        expect(result.receiveAddress).toBeDefined();
        expect(result.receiveAddress).not.toBeNull();
    });

    it('Should create a new market', async () => {

        testData.profile_id = profile.id;
        testData.wallet_id = profile.Wallets[0].id;

        const marketModel: Market = await marketService.create(testData);
        createdId = marketModel.Id;

        const result: resources.Market = marketModel.toJSON();

        // test the values
        expect(result.name).toBe(testData.name);
        expect(result.receiveKey).toBe(testData.receiveKey);
        expect(result.receiveAddress).toBe(testData.receiveAddress);
    });

    test('Should throw ValidationException because we want to create a empty market', async () => {
        expect.assertions(1);
        await marketService.create({} as MarketCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list markets with our new create one', async () => {
        const marketCollection = await marketService.findAll();
        const market = marketCollection.toJSON();
        expect(market.length).toBe(2); // include with default market

        const result: resources.Market = market[1];

        // test the values
        expect(result.name).toBe(testData.name);
        expect(result.receiveKey).toBe(testData.receiveKey);
        expect(result.receiveAddress).toBe(testData.receiveAddress);
    });

    test('Should return one market', async () => {
        const marketModel: Market = await marketService.findOne(createdId);
        const result: resources.Market = marketModel.toJSON();

        // test the values
        expect(result.name).toBe(testData.name);
        expect(result.receiveKey).toBe(testData.receiveKey);
        expect(result.receiveAddress).toBe(testData.receiveAddress);
    });

    test('Should update the market', async () => {
        const marketModel: Market = await marketService.update(createdId, testDataUpdated);
        const result: resources.Market = marketModel.toJSON();

        // test the values
        expect(result.name).toBe(testDataUpdated.name);
        expect(result.receiveKey).toBe(testDataUpdated.receiveKey);
        expect(result.receiveAddress).toBe(testDataUpdated.receiveAddress);
    });

    test('Should find market by address', async () => {
        const result: resources.Market = await marketService.findOneByProfileIdAndReceiveAddress(
            profile.id, testDataUpdated.receiveAddress)
            .then(value => value.toJSON());

        // test the values
        expect(result.name).toBe(testDataUpdated.name);
        expect(result.receiveKey).toBe(testDataUpdated.receiveKey);
        expect(result.receiveAddress).toBe(testDataUpdated.receiveAddress);
    });

    test('Should delete the market', async () => {
        expect.assertions(1);
        await marketService.destroy(createdId);
        await marketService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

});
