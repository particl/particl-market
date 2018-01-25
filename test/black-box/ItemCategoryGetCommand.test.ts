import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Commands } from '../../src/api/commands/CommandEnumType';

describe('ItemCategoryGetCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const method = Commands.CATEGORY_ROOT.commandName;
    const subCommand = Commands.CATEGORY_GET.commandName;

    const categoryIdToFind = 'cat_ROOT';

    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    test('Should find category by key', async () => {
        //  test default category data
        const res = await rpc(method, [subCommand, categoryIdToFind]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        // check that the key matches
        expect(result.key).toBe(categoryIdToFind);
        expect(result.parentItemCategoryId).toBe(null);

    });

});
