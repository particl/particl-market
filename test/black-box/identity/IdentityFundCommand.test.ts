// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';
import { MessageException } from '../../../src/api/exceptions/MessageException';
import { OutputType } from 'omp-lib/dist/interfaces/crypto';


describe('IdentityFundCommand', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtilSellerNode = new BlackBoxTestUtil(randomBoolean ? 0 : 1);
    const testUtilBuyerNode = new BlackBoxTestUtil(randomBoolean ? 1 : 0);

    const identityCommand = Commands.IDENTITY_ROOT.commandName;
    const identityFundCommand = Commands.IDENTITY_FUND.commandName;

    let sellerProfile: resources.Profile;
    let buyerProfile: resources.Profile;
    let sellerMarket: resources.Market;
    let buyerMarket: resources.Market;

    beforeAll(async () => {
        await testUtilSellerNode.cleanDb();
        await testUtilBuyerNode.cleanDb();

        sellerProfile = await testUtilSellerNode.getDefaultProfile();
        buyerProfile = await testUtilBuyerNode.getDefaultProfile();
        expect(sellerProfile.id).toBeDefined();
        expect(buyerProfile.id).toBeDefined();
        // log.debug('sellerProfile.id: ', sellerProfile.id);
        // log.debug('buyerProfile.id: ', buyerProfile.id);

        sellerMarket = await testUtilSellerNode.getDefaultMarket(sellerProfile.id);
        buyerMarket = await testUtilBuyerNode.getDefaultMarket(buyerProfile.id);
        expect(sellerMarket.id).toBeDefined();
        expect(buyerMarket.id).toBeDefined();
        // log.debug('sellerMarket: ', JSON.stringify(sellerMarket, null, 2));
        // log.debug('buyerMarket: ', JSON.stringify(buyerMarket, null, 2));
    });


    test('Should fail because missing identityId', async () => {
        const res: any = await testUtilSellerNode.rpc(identityCommand, [identityFundCommand
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('identityId').getMessage());
    });

    test('Should fail because missing walletFrom', async () => {
        const res: any = await testUtilSellerNode.rpc(identityCommand, [identityFundCommand,
            sellerMarket.Identity.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('walletFrom').getMessage());
    });

    test('Should fail because missing amount', async () => {
        const res: any = await testUtilSellerNode.rpc(identityCommand, [identityFundCommand,
            sellerMarket.Identity.id,
            sellerMarket.Identity.wallet
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('amount').getMessage());
    });


    test('Should fail because invalid identityId', async () => {
        const res: any = await testUtilSellerNode.rpc(identityCommand, [identityFundCommand,
            false,
            sellerMarket.Identity.wallet,
            1
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('identityId', 'number').getMessage());
    });

    test('Should fail because invalid walletFrom', async () => {
        const res: any = await testUtilSellerNode.rpc(identityCommand, [identityFundCommand,
            sellerMarket.Identity.id,
            false,
            1
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('walletFrom', 'string').getMessage());
    });

    test('Should fail because invalid amount', async () => {
        const res: any = await testUtilSellerNode.rpc(identityCommand, [identityFundCommand,
            sellerMarket.Identity.id,
            sellerMarket.Identity.wallet,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('amount', 'number').getMessage());
    });


    test('Should fail because Identity not found', async () => {
        const res: any = await testUtilSellerNode.rpc(identityCommand, [identityFundCommand,
            0,
            sellerMarket.Identity.wallet,
            1
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('Identity').getMessage());
    });

    test('Should fail because wallet not found', async () => {
        const res: any = await testUtilSellerNode.rpc(identityCommand, [identityFundCommand,
            sellerMarket.Identity.id,
            sellerMarket.Identity.wallet + '_NOT_FOUND',
            1
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MessageException('Wallet with the name doesn\'t exist.').getMessage());
    });

    test('Should estimate the funding fee', async () => {
        const res: any = await testUtilSellerNode.rpc(identityCommand, [identityFundCommand,
            sellerMarket.Identity.id,
            sellerMarket.Identity.wallet,
            1,
            3,
            OutputType.PART,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        // log.debug('result:', JSON.stringify(result, null, 2));
        expect(result.fee).toBeGreaterThan(0);
    });

    test('Should fund from sellerMarket Identity with ANON', async () => {
        const res: any = await testUtilSellerNode.rpc(identityCommand, [identityFundCommand,
            sellerMarket.Identity.id,
            sellerMarket.Identity.wallet,
            2,
            8,
            OutputType.ANON,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        log.debug('txid:', result.txid);
        expect(result.txid).not.toBeNull();
    });

    test('Should fund from buyerMarket Identity with ANON', async () => {
        const res: any = await testUtilBuyerNode.rpc(identityCommand, [identityFundCommand,
            buyerMarket.Identity.id,
            buyerMarket.Identity.wallet,
            2,
            8,
            OutputType.ANON,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        log.debug('txid:', result.txid);
        expect(result.txid).not.toBeNull();
    });
});
