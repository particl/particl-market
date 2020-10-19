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


describe('IdentityFundCommand', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const identityCommand = Commands.IDENTITY_ROOT.commandName;
    const identityFundCommand = Commands.IDENTITY_FUND.commandName;

    let profile: resources.Profile;
    let market: resources.Market;

    beforeAll(async () => {
        await testUtil.cleanDb();

        profile = await testUtil.getDefaultProfile();
        expect(profile.id).toBeDefined();
        market = await testUtil.getDefaultMarket(profile.id);
        expect(market.id).toBeDefined();
    });


    test('Should fail because missing identityId', async () => {
        const res: any = await testUtil.rpc(identityCommand, [identityFundCommand
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('identityId').getMessage());
    });

    test('Should fail because missing walletFrom', async () => {
        const res: any = await testUtil.rpc(identityCommand, [identityFundCommand,
            market.Identity.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('walletFrom').getMessage());
    });

    test('Should fail because missing amount', async () => {
        const res: any = await testUtil.rpc(identityCommand, [identityFundCommand,
            market.Identity.id,
            market.Identity.wallet
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('amount').getMessage());
    });


    test('Should fail because invalid identityId', async () => {
        const res: any = await testUtil.rpc(identityCommand, [identityFundCommand,
            false,
            market.Identity.wallet,
            1
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('identityId', 'number').getMessage());
    });

    test('Should fail because invalid walletFrom', async () => {
        const res: any = await testUtil.rpc(identityCommand, [identityFundCommand,
            market.Identity.id,
            false,
            1
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('walletFrom', 'string').getMessage());
    });

    test('Should fail because invalid amount', async () => {
        const res: any = await testUtil.rpc(identityCommand, [identityFundCommand,
            market.Identity.id,
            market.Identity.wallet,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('amount', 'number').getMessage());
    });


    test('Should fail because Identity not found', async () => {
        const res: any = await testUtil.rpc(identityCommand, [identityFundCommand,
            0,
            market.Identity.wallet,
            1
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('Identity').getMessage());
    });

    test('Should fail because wallet not found', async () => {
        const res: any = await testUtil.rpc(identityCommand, [identityFundCommand,
            market.Identity.id,
            market.Identity.wallet + '_NOT_FOUND',
            1
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MessageException('Wallet with the name doesn\'t exist.').getMessage());
    });

    test('Should estimate the funding fee', async () => {
        const res: any = await testUtil.rpc(identityCommand, [identityFundCommand,
            market.Identity.id,
            market.Identity.wallet,
            1,
            3,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        log.debug('result:', JSON.stringify(result, null, 2));
        expect(result.fee).toBeGreaterThan(0);
    });

});
