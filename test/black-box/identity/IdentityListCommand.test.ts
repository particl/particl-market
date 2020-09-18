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

describe('IdentityListCommand', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const identityCommand = Commands.IDENTITY_ROOT.commandName;
    const identityListCommand = Commands.IDENTITY_LIST.commandName;

    let profile: resources.Profile;
    let market: resources.Market;

    beforeAll(async () => {
        await testUtil.cleanDb();

        profile = await testUtil.getDefaultProfile();
        expect(profile.id).toBeDefined();
        market = await testUtil.getDefaultMarket(profile.id);
        expect(market.id).toBeDefined();

    });


    test('Should fail because missing profileId', async () => {
        const res: any = await testUtil.rpc(identityCommand, [identityListCommand
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('profileId').getMessage());
    });


    test('Should fail because invalid profileId', async () => {
        const res: any = await testUtil.rpc(identityCommand, [identityListCommand,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('profileId', 'number').getMessage());
    });


    test('Should fail because Profile not found', async () => {
        const res: any = await testUtil.rpc(identityCommand, [identityListCommand,
            0
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('Profile').getMessage());
    });


    test('Should list all Profile Identities', async () => {
        const res: any = await testUtil.rpc(identityCommand, [identityListCommand,
            profile.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Identity[] = res.getBody()['result'];
        // log.debug('result:', JSON.stringify(result, null, 2));
        expect(result.length).toBeGreaterThan(0);
    });

});
