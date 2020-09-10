// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as _ from 'lodash';
import * as resources from 'resources';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands} from '../../../src/api/commands/CommandEnumType';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { MarketType } from '../../../src/api/enums/MarketType';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { MessageException } from '../../../src/api/exceptions/MessageException';
import { PrivateKey, Networks } from 'particl-bitcore-lib';
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';
import { MarketRegion } from '../../../src/api/enums/MarketRegion';


describe('MarketJoinCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const marketCommand = Commands.MARKET_ROOT.commandName;
    const marketAddCommand = Commands.MARKET_ADD.commandName;
    const marketListCommand = Commands.MARKET_LIST.commandName;
    const marketJoinCommand = Commands.MARKET_JOIN.commandName;

    let profile: resources.Profile;
    let market: resources.Market;
    let newMarket: resources.Market;

    const marketData = {
        name: 'TEST-1',
        description: 'test market desc',
        type: MarketType.MARKETPLACE,
        region: MarketRegion.WORLDWIDE,
        receiveKey: 'receiveKey',
        publishKey: 'publishKey'
        // publishKey === receiveKey
    };

    beforeAll(async () => {
        await testUtil.cleanDb();

        profile = await testUtil.getDefaultProfile();
        expect(profile.id).toBeDefined();
        market = await testUtil.getDefaultMarket(profile.id);
        expect(market.id).toBeDefined();

        // marketplace
        const network = Networks.testnet;
        const privateKey: PrivateKey = PrivateKey.fromRandom(Networks.testnet);
        marketData.receiveKey = privateKey.toWIF();
        marketData.publishKey = marketData.receiveKey;          // same same
        // marketData.name = marketData.receiveKey;
        log.debug('marketData: ', JSON.stringify(marketData, null, 2));

    });


    test('Should fail because missing profileId', async () => {
        const res = await testUtil.rpc(marketCommand, [marketJoinCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('profileId').getMessage());
    });


    test('Should fail because missing marketId', async () => {
        const res = await testUtil.rpc(marketCommand, [marketJoinCommand,
            profile.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('marketId').getMessage());
    });


    test('Should fail because invalid profileId', async () => {

        const res: any = await testUtil.rpc(marketCommand, [marketJoinCommand,
            false,
            market.id
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('profileId', 'number').getMessage());
    });


    test('Should fail because invalid marketId', async () => {

        const res: any = await testUtil.rpc(marketCommand, [marketJoinCommand,
            profile.id,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('marketId', 'number').getMessage());
    });


    test('Should fail because invalid identityId', async () => {

        const res: any = await testUtil.rpc(marketCommand, [marketJoinCommand,
            profile.id,
            market.id,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('identityId', 'number').getMessage());
    });


    test('Should fail because Profile not found', async () => {

        const res: any = await testUtil.rpc(marketCommand, [marketJoinCommand,
            0,
            market.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('Profile').getMessage());
    });


    test('Should fail because Market not found', async () => {

        const res: any = await testUtil.rpc(marketCommand, [marketJoinCommand,
            profile.id,
            0
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('Market').getMessage());
    });


    test('Should fail because Identity not found', async () => {

        const res: any = await testUtil.rpc(marketCommand, [marketJoinCommand,
            profile.id,
            market.id,
            0
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('Identity').getMessage());
    });


    test('Should fail because Market has already been joined', async () => {

        const res: any = await testUtil.rpc(marketCommand, [marketJoinCommand,
            profile.id,
            market.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MessageException('Market has already been joined.').getMessage());
    });


    test('Should create a new joinable Market (MARKETPLACE)', async () => {
        const res = await testUtil.rpc(marketCommand, [marketAddCommand,
            profile.id,
            marketData.name,
            null,
            null,
            null,
            market.Identity.id,         // Identity required to create a receiveKey
            marketData.description,
            marketData.region,
            true

        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.Market = res.getBody()['result'];
        expect(result.name).toBe(marketData.name);
        expect(result.description).toBe(marketData.description);
        expect(result.region).toBe(marketData.region);
        expect(result.receiveKey).toBe(result.publishKey);
        expect(result.Profile).toBeUndefined();
        expect(result.Image).toBeUndefined();

        newMarket = result;
    });


    test('Should list the created Market', async () => {
        const res: any = await testUtil.rpc(marketCommand, [marketListCommand]);
        res.expectJson();
        res.expectStatusCode(200);

        const markets: resources.Market[] = res.getBody()['result'];
        // log.debug('markets: ', JSON.stringify(markets, null, 2));
        expect(markets).toHaveLength(1);

        const result: resources.Market = markets[0];
        expect(result.name).toBe(newMarket.name);
        expect(result.description).toBe(newMarket.description);
        expect(result.region).toBe(newMarket.region);
        expect(result.receiveKey).toBe(result.publishKey);
        expect(result.Profile).toBeUndefined();
        expect(result.Identity).toBeUndefined();
        expect(result.Image).toBeUndefined();
    }, 600000); // timeout to 600s


    test('Should join the created Market', async () => {

        const res: any = await testUtil.rpc(marketCommand, [marketJoinCommand,
            profile.id,
            newMarket.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Market = res.getBody()['result'];
        expect(result.name).toBe(marketData.name);
        expect(result.description).toBe(marketData.description);
        expect(result.region).toBe(marketData.region);
        expect(result.receiveKey).toBe(result.publishKey);
        expect(result.Profile.id).toBe(profile.id);
        expect(result.Image).toBeUndefined();
    });

});
