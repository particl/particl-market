import { rpc, api } from './lib/api';

import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Logger } from '../../src/core/Logger';
import { ItemCategoryGetCommand } from '../../src/api/commands/itemcategory/ItemCategoryGetCommand';

describe('ItemCategoryGetCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const itemCategoryService = null;
    const method =  new ItemCategoryGetCommand(itemCategoryService, Logger).name;

    const categoryIdToFind = 'cat_ROOT';

    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    test('Should find category by key', async () => {
        //  test default category data
        const res = await rpc(method, [categoryIdToFind]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        // check that the key matches
        expect(result.key).toBe(categoryIdToFind);
        expect(result.parentItemCategoryId).toBe(null);

    });

});
