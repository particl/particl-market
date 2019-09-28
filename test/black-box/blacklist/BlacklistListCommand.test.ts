// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands} from '../../../src/api/commands/CommandEnumType';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateBlacklistParams } from '../../../src/api/requests/testdata/GenerateBlacklistParams';
import { BlacklistType } from '../../../src/api/enums/BlacklistType';

describe('BlacklistListCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const blacklistCommand = Commands.BLACKLIST_ROOT.commandName;
    const blacklistListCommand = Commands.BLACKLIST_LIST.commandName;

    let blacklists: resources.Blacklist[];

    beforeAll(async () => {
        await testUtil.cleanDb();

        // generate a couple of profiles for voting
        const generateBlacklistParams = new GenerateBlacklistParams([
            BlacklistType.LISTINGITEM
        ]).toParamsArray();

        blacklists = await testUtil.generateData(
            CreatableModel.BLACKLIST,
            10,
            true,
            generateBlacklistParams
        ) as resources.Profile[];

    });

    test('Should fail to list Blacklists because invalid type', async () => {

        const res: any = await testUtil.rpc(blacklistCommand, [blacklistListCommand,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('type', 'string').getMessage());
    });

    test('Should list all 10 Blacklists by type', async () => {
        const res = await testUtil.rpc(blacklistCommand, [blacklistListCommand, BlacklistType.LISTINGITEM]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(10);
    });

    test('Should list all 0 Blacklists by type', async () => {
        const res = await testUtil.rpc(blacklistCommand, [blacklistListCommand, BlacklistType.MARKET]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(0);
    });

});
