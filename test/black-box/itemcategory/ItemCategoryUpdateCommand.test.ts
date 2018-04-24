import { rpc, api } from '../lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { HashableObjectType } from '../../../src/api/enums/HashableObjectType';
import {ObjectHash} from '../../../src/core/helpers/ObjectHash';

describe('ItemCategoryUpdateCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const method = Commands.CATEGORY_ROOT.commandName;
    const subCommand = Commands.CATEGORY_UPDATE.commandName;
    const makretMethod = Commands.MARKET_ROOT.commandName;
    const subCommandMarket = Commands.MARKET_ADD.commandName;

    const categoryMethod = Commands.CATEGORY_ROOT.commandName;
    const subCommandCategory = Commands.CATEGORY_ADD.commandName;

    const parentCategory = {
        id: 0,
        key: 'cat_high_real_estate',
        parentItemCategoryId: 0
    };

    let newCategory;
    let marketId;

    beforeAll(async () => {
        await testUtil.cleanDb();

        // create category
        const res = await rpc(categoryMethod, [subCommandCategory, parentCategory.key, '', 'cat_ROOT']);
        const categoryResult: any = res.getBody()['result'];
        parentCategory.id = categoryResult.id;
        const addCategoryRes: any = await testUtil.addData(CreatableModel.ITEMCATEGORY, {
            name: 'sample category',
            description: 'sample category description',
            parent_item_category_id: parentCategory.id
        });
        newCategory = addCategoryRes;
        // market
        const resMarket = await rpc(makretMethod, [subCommandMarket, 'Test Market', 'privateKey', 'Market Address']);
        const resultMarket: any = resMarket.getBody()['result'];
        marketId = resultMarket.id;
    });

    let categoryData = {
        id: 0,
        name: 'Sample Category update',
        description: 'Sample Category Description update'
    };

    test('Should update the category with parent category id', async () => {
        /*
         *  [0]: category id
         *  [1]: category name
         *  [2]: description
         *  [3]: parentItemCategoryId
         */
        categoryData.id = newCategory.id;
        const res = await rpc(method, [subCommand, categoryData.id, categoryData.name, categoryData.description, parentCategory.id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.name).toBe(categoryData.name);
        expect(result.description).toBe(categoryData.description);
        expect(result.parentItemCategoryId).toBe(parentCategory.id);
        expect(result.ParentItemCategory.name).toBe(parentCategory.key);
    });

    categoryData = {
        id: 0,
        name: 'Sample Cat update',
        description: 'Sample Cat Description update'
    };

    let defaultCategory;

    test('Should update the category with parent category key', async () => {
        categoryData.id = newCategory.id;
        const res = await rpc(method, [subCommand, categoryData.id, categoryData.name, categoryData.description, parentCategory.key]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.name).toBe(categoryData.name);
        expect(result.description).toBe(categoryData.description);
        expect(result.parentItemCategoryId).toBe(parentCategory.id);
        expect(result.ParentItemCategory.name).toBe(parentCategory.key);

        defaultCategory = result.ParentItemCategory.ParentItemCategory;
    });

    test('Should not update the default category', async () => {
        const res = await rpc(method, [subCommand, defaultCategory.id, categoryData.name, categoryData.description, parentCategory.parentItemCategoryId]);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('Should not update the category if listing-item related with category', async () => {
        const listingitemData = {
            market_id: marketId,
            hash: '',
            seller: 'some seller',
            itemInformation: {
                title: 'item title1',
                shortDescription: 'item short desc1',
                longDescription: 'item long desc1',
                itemCategory: {
                    id: categoryData.id
                }
            }
        };
        listingitemData.hash = ObjectHash.getHash(listingitemData, HashableObjectType.LISTINGITEM);
        const listingItems = await testUtil.addData(CreatableModel.LISTINGITEM, listingitemData);
        const res = await rpc(method, [subCommand, categoryData.id, categoryData.name, categoryData.description, parentCategory.id]);
        res.expectJson();
        res.expectStatusCode(404);
    });

});
