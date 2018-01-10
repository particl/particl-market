import { rpc, api } from './lib/api';
import * as crypto from 'crypto-js';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Logger } from '../../src/core/Logger';
import { ItemCategoryRemoveCommand } from '../../src/api/commands/itemcategory/ItemCategoryRemoveCommand';
import { MarketCreateCommand } from '../../src/api/commands/market/MarketCreateCommand';
import { ItemCategoryGetCommand } from '../../src/api/commands/itemcategory/ItemCategoryGetCommand';

describe('ItemCategoryRemoveCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const itemCategoryService = null;
    const listingItemService = null;
    const listingItemTemplateService = null;
    const marketService = null;
    const method =  new ItemCategoryRemoveCommand(itemCategoryService, listingItemService, listingItemTemplateService, Logger).name;
    const addMakretMethod =  new MarketCreateCommand(marketService, Logger).name;
    const getCategoryMethod =  new ItemCategoryGetCommand(itemCategoryService, Logger).name;

    const parentCategory = {
        id: 0,
        key: 'cat_high_real_estate'
    };

    let newCategory;
    let profileId;
    let marketId;

    beforeAll(async () => {
        await testUtil.cleanDb();

        // create category
        const res = await rpc(getCategoryMethod, [parentCategory.key]);
        const categoryResult: any = res.getBody()['result'];

        parentCategory.id = categoryResult.id;
        const addCategoryRes: any = await testUtil.addData('itemcategory', {
            name: 'sample category',
            description: 'sample category description',
            parent_item_category_id: parentCategory.id
        });
        newCategory = addCategoryRes.getBody()['result'];
        // profile
        const defaultProfile = await testUtil.getDefaultProfile();
        profileId = defaultProfile.id;

        // market
        const resMarket = await rpc(addMakretMethod, ['Test Market', 'privateKey', 'Market Address']);
        const resultMarket: any = resMarket.getBody()['result'];
        marketId = resultMarket.id;
    });

    test('Should delete the category', async () => {
        const res = await rpc(method, [newCategory.id]);
        res.expectJson();
        res.expectStatusCode(200);
    });

    test('Should not delete the default category', async () => {
        const res = await rpc(method, [parentCategory.id]);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('Should not delete the category if listing-item related with category', async () => {
        // create category
        const addCategoryRes: any = await testUtil.addData('itemcategory', {
            name: 'sample category 2',
            description: 'sample category description 2',
            parent_item_category_id: parentCategory.id
        });
        newCategory = addCategoryRes.getBody()['result'];

        const hash = crypto.SHA256(new Date().getTime().toString()).toString();
        const listingitemData = {
            market_id: marketId,
            hash,
            itemInformation: {
                title: 'item title',
                shortDescription: 'item short desc',
                longDescription: 'item long desc',
                itemCategory: {
                    id: newCategory.id
                }
            }
        };
        const listingItems = await testUtil.addData('listingitem', listingitemData);
        const res = await rpc(method, [newCategory.id]);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('Should not delete the category if listing-item-template related with category', async () => {
        // create category
        const addCategoryRes: any = await testUtil.addData('itemcategory', {
            name: 'sample category 3',
            description: 'sample category description 3',
            parent_item_category_id: parentCategory.id
        });
        newCategory = addCategoryRes.getBody()['result'];
        // create listing-item-template with category
        const listingItemTemplate = {
            profile_id: profileId,
            itemInformation: {
                title: 'Item Information',
                shortDescription: 'Item short description',
                longDescription: 'Item long description',
                itemCategory: {
                    id: newCategory.id
                }
            }
        };
        const listingItems = await testUtil.addData('listingitemtemplate', listingItemTemplate);
        const res = await rpc(method, [newCategory.id]);
        res.expectJson();
        res.expectStatusCode(404);
    });

});
