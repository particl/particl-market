// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { Logger as LoggerType } from '../../../src/core/Logger';

describe('ItemCategoryGetCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const categoryCommand = Commands.CATEGORY_ROOT.commandName;
    const categoryGetCommand = Commands.CATEGORY_GET.commandName;

    const categoryIdToFind = 'cat_ROOT';

    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    test('Should find category by key', async () => {

        const res = await testUtil.rpc(categoryCommand, [categoryGetCommand, categoryIdToFind]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        // check that the key matches
        expect(result.key).toBe(categoryIdToFind);
        expect(result.parentItemCategoryId).toBe(null);
    });

    test('Should fail to find category by key', async () => {
        const res = await testUtil.rpc(categoryCommand, [categoryGetCommand, 'A_CATEGORY_THAT_DOESNT_EXIST']);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(`Category not found`);
    });
});
