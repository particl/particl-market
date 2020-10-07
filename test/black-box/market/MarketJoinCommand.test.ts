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
import { ProtocolDSN } from 'omp-lib/dist/interfaces/dsn';
import { ImageProcessing } from '../../../src/core/helpers/ImageProcessing';


describe('MarketJoinCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtilSellerNode = new BlackBoxTestUtil(randomBoolean ? 0 : 1);
    const testUtilBuyerNode = new BlackBoxTestUtil(randomBoolean ? 1 : 0);

    const marketCommand = Commands.MARKET_ROOT.commandName;
    const marketAddCommand = Commands.MARKET_ADD.commandName;
    const marketListCommand = Commands.MARKET_LIST.commandName;
    const marketJoinCommand = Commands.MARKET_JOIN.commandName;
    const marketPostCommand = Commands.MARKET_POST.commandName;
    const imageCommand = Commands.IMAGE_ROOT.commandName;
    const imageAddCommand = Commands.IMAGE_ADD.commandName;

    let sellerProfile: resources.Profile;
    let buyerProfile: resources.Profile;
    let sellerMarket: resources.Market;
    let buyerMarket: resources.Market;

    let newMarketOnSellerNode: resources.Market;
    let newMarketOnBuyerNode: resources.Market;

    const marketData = {
        name: 'TEST-1',
        description: 'test market desc',
        type: MarketType.MARKETPLACE,
        region: MarketRegion.WORLDWIDE,
        receiveKey: 'receiveKey',
        publishKey: 'publishKey'
        // publishKey === receiveKey
    };

    let sent = false;
    const DAYS_RETENTION = 1;

    beforeAll(async () => {
        await testUtilSellerNode.cleanDb();
        await testUtilBuyerNode.cleanDb();

        // get seller and buyer profiles
        sellerProfile = await testUtilSellerNode.getDefaultProfile();
        buyerProfile = await testUtilBuyerNode.getDefaultProfile();
        expect(sellerProfile.id).toBeDefined();
        expect(buyerProfile.id).toBeDefined();
        // log.debug('sellerProfile: ', sellerProfile.address);
        // log.debug('buyerProfile: ', buyerProfile.address);

        sellerMarket = await testUtilSellerNode.getDefaultMarket(sellerProfile.id);
        buyerMarket = await testUtilBuyerNode.getDefaultMarket(buyerProfile.id);
        expect(sellerMarket.id).toBeDefined();
        expect(buyerMarket.id).toBeDefined();
        // log.debug('sellerMarket: ', JSON.stringify(sellerMarket, null, 2));
        // log.debug('buyerMarket: ', JSON.stringify(buyerMarket, null, 2));

        // marketplace
        const network = Networks.testnet;
        const privateKey: PrivateKey = PrivateKey.fromRandom(network);
        marketData.receiveKey = privateKey.toWIF();
        marketData.publishKey = marketData.receiveKey;          // same same
        // marketData.name = marketData.receiveKey;
        log.debug('marketData: ', JSON.stringify(marketData, null, 2));

    });


    test('Should fail because missing profileId', async () => {
        const res = await testUtilSellerNode.rpc(marketCommand, [marketJoinCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('profileId').getMessage());
    });


    test('Should fail because missing marketId', async () => {
        const res = await testUtilSellerNode.rpc(marketCommand, [marketJoinCommand,
            sellerProfile.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('marketId').getMessage());
    });


    test('Should fail because invalid profileId', async () => {

        const res: any = await testUtilSellerNode.rpc(marketCommand, [marketJoinCommand,
            false,
            sellerMarket.id
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('profileId', 'number').getMessage());
    });


    test('Should fail because invalid marketId', async () => {

        const res: any = await testUtilSellerNode.rpc(marketCommand, [marketJoinCommand,
            sellerProfile.id,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('marketId', 'number').getMessage());
    });


    test('Should fail because invalid identityId', async () => {

        const res: any = await testUtilSellerNode.rpc(marketCommand, [marketJoinCommand,
            sellerProfile.id,
            sellerMarket.id,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('identityId', 'number').getMessage());
    });


    test('Should fail because Profile not found', async () => {

        const res: any = await testUtilSellerNode.rpc(marketCommand, [marketJoinCommand,
            0,
            sellerMarket.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('Profile').getMessage());
    });


    test('Should fail because Market not found', async () => {

        const res: any = await testUtilSellerNode.rpc(marketCommand, [marketJoinCommand,
            sellerProfile.id,
            0
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('Market').getMessage());
    });


    test('Should fail because Identity not found', async () => {

        const res: any = await testUtilSellerNode.rpc(marketCommand, [marketJoinCommand,
            sellerProfile.id,
            sellerMarket.id,
            0
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('Identity').getMessage());
    });


    test('Should fail because Market has already been joined', async () => {

        const res: any = await testUtilSellerNode.rpc(marketCommand, [marketJoinCommand,
            sellerProfile.id,
            sellerMarket.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MessageException('Market has already been joined.').getMessage());
    });


    test('Should create a new joinable Market (MARKETPLACE)', async () => {
        const res = await testUtilSellerNode.rpc(marketCommand, [marketAddCommand,
            sellerProfile.id,
            marketData.name,
            null,
            null,
            null,
            sellerMarket.Identity.id,         // Identity required to create a receiveKey
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

        newMarketOnSellerNode = result;
    });


    test('Should add Image to Market', async () => {
        const res: any = await testUtilSellerNode.rpc(imageCommand, [imageAddCommand,
            'market',
            newMarketOnSellerNode.id,
            ProtocolDSN.REQUEST,
            ImageProcessing.milkcatSmall,
            false,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.Image = res.getBody()['result'];
        expect(result).toBeDefined();
    });


    test('Should post the newMarket Market', async () => {

        expect(sellerMarket.id).toBeDefined();
        const res: any = await testUtilSellerNode.rpc(marketCommand, [marketPostCommand,
            newMarketOnSellerNode.id,
            DAYS_RETENTION
        ]);
        res.expectJson();

        // make sure we got the expected result from posting the template
        const result: any = res.getBody()['result'];
        // log.debug('result:', JSON.stringify(result, null, 2));
        sent = result.result === 'Sent.';
        if (!sent) {
            log.debug(JSON.stringify(result, null, 2));
        }
        expect(result.result).toBe('Sent.');
    });


    test('Should receive and list the posted Market on the BUYER node', async () => {

        const response: any = await testUtilBuyerNode.rpcWaitFor(marketCommand, [marketListCommand],
            30 * 60,                    // maxSeconds
            200,                    // waitForStatusCode
            '.length',          // property name
            1,              // value
            '='
        );
        response.expectJson();
        response.expectStatusCode(200);

        const markets: resources.Market[] = response.getBody()['result'];
        log.debug('markets: ', JSON.stringify(markets, null, 2));
        expect(markets).toHaveLength(1);

        const result: resources.Market = markets[0];
        expect(result.title).toBe(newMarketOnSellerNode.title);
        expect(result.description).toBe(newMarketOnSellerNode.description);
        expect(result.Profile).toBeUndefined();

        newMarketOnBuyerNode = result;
    }, 600000); // timeout to 600s


/*
    test('Should list the created Market', async () => {
        const res: any = await testUtilSellerNode.rpc(marketCommand, [marketListCommand]);
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
*/

    test('Should join the created Market', async () => {

        const res: any = await testUtilBuyerNode.rpc(marketCommand, [marketJoinCommand,
            buyerProfile.id,
            newMarketOnBuyerNode.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Market = res.getBody()['result'];

        log.debug('result: ', JSON.stringify(result, null, 2));

        expect(result.name).toBe(marketData.name);
        expect(result.description).toBe(marketData.description);
        expect(result.region).toBe(marketData.region);
        expect(result.receiveKey).toBe(result.publishKey);
        expect(result.Profile.id).toBe(buyerProfile.id);
        expect(result.Image).not.toBeUndefined();
    });

});
