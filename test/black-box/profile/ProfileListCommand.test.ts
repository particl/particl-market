// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { Logger as LoggerType } from '../../../src/core/Logger';


describe('ProfileListCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);
    const testUtil2 = new BlackBoxTestUtil(randomBoolean ? 1 : 0);

    const profileCommand = Commands.PROFILE_ROOT.commandName;
    const profileListCommand = Commands.PROFILE_LIST.commandName;
    const profileAddCommand = Commands.PROFILE_ADD.commandName;

    beforeAll(async () => {
        await testUtil.cleanDb();
        await testUtil2.cleanDb();

    });

    test('Should return the default Profile', async () => {
        const res = await testUtil.rpc(profileCommand, [profileListCommand]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(1); // getting default one
    });

    test('Should create a new Profile', async () => {
        const res = await testUtil.rpc(profileCommand, [profileAddCommand,
            'TEST-1',
            true        // force
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        expect(result.name).toBe('TEST-1');
    });

    test('Should return one more Profile', async () => {
        const res = await testUtil.rpc(profileCommand, [profileListCommand]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(2);
    });

});
