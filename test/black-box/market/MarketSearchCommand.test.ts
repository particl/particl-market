// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import * as _ from 'lodash';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { SearchOrder } from '../../../src/api/enums/SearchOrder';
import { MarketSearchOrderField } from '../../../src/api/enums/SearchOrderField';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { MarketType } from '../../../src/api/enums/MarketType';
import { MarketRegion } from '../../../src/api/enums/MarketRegion';

describe('MarketSearchCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtilSellerNode = new BlackBoxTestUtil(randomBoolean ? 0 : 1);
    const testUtilBuyerNode = new BlackBoxTestUtil(randomBoolean ? 1 : 0);

    const marketCommand = Commands.MARKET_ROOT.commandName;
    const marketSearchCommand = Commands.MARKET_SEARCH.commandName;

    let sellerMarket: resources.Market;
    let sellerProfile: resources.Profile;

    let buyerProfile: resources.Profile;
    let buyerMarket: resources.Market;

    const PAGE = 0;
    const PAGE_LIMIT = 10;
    const SEARCHORDER = SearchOrder.ASC;
    const MARKET_SEARCHORDERFIELD = MarketSearchOrderField.CREATED_AT;

    beforeAll(async () => {
        await testUtilSellerNode.cleanDb();
        await testUtilBuyerNode.cleanDb();

        sellerProfile = await testUtilSellerNode.getDefaultProfile();
        expect(sellerProfile.id).toBeDefined();
        sellerMarket = await testUtilSellerNode.getDefaultMarket(sellerProfile.id);
        expect(sellerMarket.id).toBeDefined();

        buyerProfile = await testUtilBuyerNode.getDefaultProfile();
        expect(buyerProfile.id).toBeDefined();
        buyerMarket = await testUtilBuyerNode.getDefaultMarket(buyerProfile.id);
        expect(buyerMarket.id).toBeDefined();

    });


    test('Should fail because invalid searchString', async () => {
        const res: any = await testUtilSellerNode.rpc(marketCommand, [marketSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, MARKET_SEARCHORDERFIELD,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('searchString', 'string').getMessage());
    });


    test('Should fail because invalid type', async () => {
        const res: any = await testUtilSellerNode.rpc(marketCommand, [marketSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, MARKET_SEARCHORDERFIELD,
            'searchString',
            true
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('type', 'string').getMessage());
    });


    test('Should fail because invalid type', async () => {
        const res: any = await testUtilSellerNode.rpc(marketCommand, [marketSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, MARKET_SEARCHORDERFIELD,
            'searchString',
            'INVALID'
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('type', 'MarketType').getMessage());
    });


    test('Should fail because invalid region', async () => {
        const res: any = await testUtilSellerNode.rpc(marketCommand, [marketSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, MARKET_SEARCHORDERFIELD,
            'searchString',
            MarketType.MARKETPLACE,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('region', 'string').getMessage());
    });


    test('Should fail because invalid region', async () => {
        const res: any = await testUtilSellerNode.rpc(marketCommand, [marketSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, MARKET_SEARCHORDERFIELD,
            'searchString',
            MarketType.MARKETPLACE,
            'INVALID'
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('region', 'MarketRegion').getMessage());
    });


    test('Should return empty result because nothing found', async () => {
        const res: any = await testUtilSellerNode.rpc(marketCommand, [marketSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, MARKET_SEARCHORDERFIELD,
            'searchString',
            MarketType.MARKETPLACE,
            MarketRegion.WORLDWIDE
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.length).toBe(0);
    });


    test('Should find the default Market', async () => {

        const res: any = await testUtilSellerNode.rpc(marketCommand, [marketSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, MARKET_SEARCHORDERFIELD,
            '*',
            MarketType.MARKETPLACE,
            MarketRegion.WORLDWIDE
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const results: resources.Market[] = res.getBody()['result'];

        log.debug('results: ', JSON.stringify(results, null, 2));
        const market = results[0];
        expect(results.length).toBe(1);
        expect(market.name).toBe(buyerMarket.name);
        expect(market.description).toBe(buyerMarket.description);
        expect(market.type).toBe(buyerMarket.type);
        expect(market.region).toBe(buyerMarket.region);
    });

    // todo: add more markets and tests
});
