// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { rpc, api } from '../lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';

describe('ItemCategoriesGetCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const method = Commands.CATEGORY_ROOT.commandName;
    const subCommand = Commands.CATEGORY_LIST.commandName;

    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    test('Should return all the Categories', async () => {
        //  test default category data
        const res = await rpc(method, [subCommand]);
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
