import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Commands } from '../../src/api/commands/CommandEnumType';

describe('ItemCategorySearchCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const method = Commands.CATEGORY_ROOT.commandName;
    const subCommand = Commands.CATEGORY_SEARCH.commandName;

    const parentCategory = {
        id: 0,
        key: 'cat_high_real_estate'
    };

    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    test('Should get categories, if found by category name string', async () => {

        // create category
        const categoryData = {
            name: 'Sample Category 1',
            description: 'Sample Category Description 1',
            parent_item_category_id: 'cat_ROOT'
        };
        await rpc(Commands.CATEGORY_ROOT.commandName, [
            Commands.CATEGORY_ADD.commandName,
            categoryData.name,
            categoryData.description,
            categoryData.parent_item_category_id
        ]);

        //  find categories
        const res = await rpc(method, [subCommand, 'Sample Category 1']);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.length).not.toBe(0);
    });

    test('Should fail to search item category because without searchString', async () => {
        //  find categories
        const res = await rpc(method, [subCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('SearchString can not be null');
    });

    test('Should not get any categories, if found by non-existing category name string', async () => {
        //  find categories
        const res = await rpc(method, [subCommand, 'NOTFOUNDCATEGORY']);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.length).toBe(0);
    });
});
