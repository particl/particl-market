// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { NotFoundException } from '../../../src/api/exceptions/NotFoundException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';

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

    test('Should find root Category by key', async () => {

        const res = await testUtil.rpc(categoryCommand, [categoryGetCommand, 'cat_ROOT']);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        // check that the key matches
        expect(result.key).toBe(categoryIdToFind);
        expect(result.parentItemCategoryId).toBe(null);
    });

    test('Should fail to find Category by non-existing key', async () => {
        const fakeCategoryKey = 'THIS_CATEGORY_DOESNT_EXIST';
        const res = await testUtil.rpc(categoryCommand, [categoryGetCommand, fakeCategoryKey]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new NotFoundException(fakeCategoryKey).getMessage());
    });

    test('Should fail to find Category by non-existing id', async () => {
        const fakeCategoryKey = 0;
        const res = await testUtil.rpc(categoryCommand, [categoryGetCommand, fakeCategoryKey]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new NotFoundException(fakeCategoryKey).getMessage());
    });

    test('Should fail to find Category because invalid id', async () => {
        const fakeCategoryKey = true;
        const res = await testUtil.rpc(categoryCommand, [categoryGetCommand, fakeCategoryKey]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('categoryId/categoryKey', 'number|string').getMessage());
    });
});
