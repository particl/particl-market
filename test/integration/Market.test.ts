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
import { MarketService } from '../../src/api/services/model/MarketService';
import { MarketCreateRequest } from '../../src/api/requests/model/MarketCreateRequest';
import { MarketUpdateRequest } from '../../src/api/requests/model/MarketUpdateRequest';
import { ProfileService } from '../../src/api/services/model/ProfileService';
import { MarketType } from '../../src/api/enums/MarketType';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { DefaultMarketService } from '../../src/api/services/DefaultMarketService';
import { ConfigurableHasher } from 'omp-lib/dist/hasher/hash';
import { HashableMarketCreateRequestConfig } from '../../src/api/factories/hashableconfig/createrequest/HashableMarketCreateRequestConfig';
import { MarketAddMessage } from '../../src/api/messages/action/MarketAddMessage';
import { MarketCreateParams } from '../../src/api/factories/ModelCreateParams';
import { MarketFactory } from '../../src/api/factories/model/MarketFactory';
import { RpcBlockchainInfo } from 'omp-lib/dist/interfaces/rpc';
import { PrivateKey, Networks } from 'particl-bitcore-lib';
import { CoreRpcService } from '../../src/api/services/CoreRpcService';


describe('Market', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let coreRpcService: CoreRpcService;
    let defaultMarketService: DefaultMarketService;
    let marketService: MarketService;
    let profileService: ProfileService;
    let marketFactory: MarketFactory;

    let profile: resources.Profile;
    let market: resources.Market;

    let newMarket: resources.Market;
    let blockchainInfo: RpcBlockchainInfo;
    let network: Networks;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        coreRpcService = app.IoC.getNamed<CoreRpcService>(Types.Service, Targets.Service.CoreRpcService);
        defaultMarketService = app.IoC.getNamed<DefaultMarketService>(Types.Service, Targets.Service.DefaultMarketService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);
        marketFactory = app.IoC.getNamed<MarketFactory>(Types.Factory, Targets.Factory.model.MarketFactory);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);

        profile = await profileService.getDefault().then(value => value.toJSON());

        blockchainInfo = await coreRpcService.getBlockchainInfo();
        network = blockchainInfo.chain === 'main' ? Networks.mainnet : Networks.testnet;

        // log.debug('profile: ', JSON.stringify(profile, null, 2));
    });

    test('Should throw ValidationException because we want to create a empty Market', async () => {
        expect.assertions(1);
        await marketService.create({} as MarketCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should get default default Market for Profile', async () => {
        market = await defaultMarketService.getDefaultForProfile(profile.id).then(value => value.toJSON());

        expect(market.name).toBe('DEFAULT');
        expect(market.receiveKey).toBeDefined();
        expect(market.receiveAddress).toBeDefined();
        expect(market.publishKey).toBeDefined();
        expect(market.publishAddress).toBeDefined();
    });

    test('Should create a new Market', async () => {

        const privateKey: PrivateKey = PrivateKey.fromRandom(network);
        const receiveKey = privateKey.toWIF();

        const createRequest: MarketCreateRequest = await marketFactory.get({
            actionMessage: {
                name: 'TEST-MARKET',
                description: 'testing markets',
                marketType: MarketType.MARKETPLACE,
                receiveKey,
                publishKey: receiveKey,
                generated: Date.now()
            } as MarketAddMessage,
            identity: market.Identity,
            skipJoin: false
        } as MarketCreateParams);

        createRequest.hash = ConfigurableHasher.hash(createRequest, new HashableMarketCreateRequestConfig());

        const result: resources.Market = await marketService.create(createRequest).then(value => value.toJSON());
        expect(result.name).toBe(createRequest.name);
        expect(result.type).toBe(createRequest.type);
        expect(result.receiveKey).toBe(createRequest.receiveKey);
        expect(result.publishKey).toBe(createRequest.publishKey);

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
            profile.id, newMarket.receiveAddress).then(value => value.toJSON());
        expect(result.name).toBe(newMarket.name);
        expect(result.receiveKey).toBe(newMarket.receiveKey);
        expect(result.receiveAddress).toBe(newMarket.receiveAddress);
    });


    test('Should find all Markets by Profile', async () => {
        const markets: resources.Market[] = await marketService.findAllByProfileId(profile.id).then(value => value.toJSON());
        expect(markets.length).toBe(2);
    });


    test('Should find all Markets by receiveAddress', async () => {
        const markets: resources.Market[] = await marketService.findAllByReceiveAddress(newMarket.receiveAddress).then(value => value.toJSON());
        expect(markets.length).toBe(1);
    });


    test('Should update the Market', async () => {
        const privateKey: PrivateKey = PrivateKey.fromRandom(network);
        const receiveKey = privateKey.toWIF();
        const receiveAddress = privateKey.toPublicKey().toAddress(network).toString();

        const testDataUpdated = {
            type: MarketType.MARKETPLACE,
            name: 'TEST-UPDATE-MARKET',
            description: 'newdesc',
            receiveKey,
            receiveAddress
        } as MarketUpdateRequest;

        const result: resources.Market = await marketService.update(newMarket.id, testDataUpdated).then(value => value.toJSON());

        expect(result.name).toBe(testDataUpdated.name);
        expect(result.description).toBe(testDataUpdated.description);
        expect(result.receiveKey).not.toBe(testDataUpdated.receiveKey);         // these are not updated
        expect(result.receiveAddress).not.toBe(testDataUpdated.receiveAddress); // these are not updated

        expect(result.hash).not.toBe(newMarket.hash);   // should have been changed

        newMarket = result;
    });


    test('Should delete the Market', async () => {
        expect.assertions(1);
        await marketService.destroy(newMarket.id);
        await marketService.findOne(newMarket.id).catch(e =>
            expect(e).toEqual(new NotFoundException(newMarket.id))
        );
    });


    test('Should be able to create a new Market without Profile relation', async () => {
        const privateKey: PrivateKey = PrivateKey.fromRandom(network);
        const receiveKey = privateKey.toWIF();
        const receiveAddress = privateKey.toPublicKey().toAddress(network).toString();

        const testData = {
            name: 'TEST-MARKET',
            type: MarketType.MARKETPLACE,
            receiveKey,
            receiveAddress,
            publishKey: receiveKey,
            publishAddress: receiveAddress,
            description: '' // todo: fix this, hashing breaks when description === undefined
        } as MarketCreateRequest;

        testData.hash = ConfigurableHasher.hash(testData, new HashableMarketCreateRequestConfig());

        const result: resources.Market = await marketService.create(testData).then(value => value.toJSON());
        expect(result.name).toBe(testData.name);
        expect(result.type).toBe(testData.type);
        expect(result.receiveKey).toBe(testData.receiveKey);
        expect(result.receiveAddress).toBe(testData.receiveAddress);
        expect(result.publishKey).toBe(testData.publishKey);
        expect(result.publishAddress).toBe(testData.publishAddress);

        newMarket = result;
    });

});
