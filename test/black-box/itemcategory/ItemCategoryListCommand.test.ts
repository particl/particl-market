// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { MessageException } from '../../../src/api/exceptions/MessageException';
import { NotFoundException } from '../../../src/api/exceptions/NotFoundException';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';

describe('ItemCategoryListCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const categoryCommand = Commands.CATEGORY_ROOT.commandName;
    const categoryListCommand = Commands.CATEGORY_LIST.commandName;

    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    test('Should return all the Categories', async () => {
        //  test default category data
        const res = await testUtil.rpc(categoryCommand, [categoryListCommand]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        // check default-ROOT category
        expect(result.key).toBe('cat_ROOT');
        expect(result.parentItemCategoryId).toBe(null);
        // check category
        const category = result.ChildItemCategories;
        expect(category.length).not.toBe(0);
        // check child category
        const firstCategory = category[0];
        expect(firstCategory.parentItemCategoryId).not.toBe(null);
        const categoryChild = firstCategory.ChildItemCategories;
        expect(categoryChild.length).not.toBe(0);
    });

});
