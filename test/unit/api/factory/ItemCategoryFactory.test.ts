import { LogMock } from '../../lib/LogMock';
import { ItemCategoryFactory } from '../../../../src/api/factories/ItemCategoryFactory';
import { ItemCategoryCreateRequest } from '../../../../src/api/requests/ItemCategoryCreateRequest';
import * as listingItemCategoryWithRelated from '../../testdata/category/listingItemCategoryWithRelated.json';
import * as listingItemCategoryWithRelated5levels from '../../testdata/category/listingItemCategoryWithRelated5levels.json';
import * as listingItemCategoryRootWithRelated from '../../testdata/category/listingItemCategoryRootWithRelated.json';
import * as resources from 'resources';

describe('ItemCategoryFactory', () => {

    let itemCategoryFactory;

    beforeEach(() => {
        itemCategoryFactory = new ItemCategoryFactory(LogMock);
    });

    test('Should get the categoryCreateMessage from categoryFactory.getModal', async () => {
        const categoryName = 'categoryName';
        const parentItemCategoryId = 10;

        const result: ItemCategoryCreateRequest = await itemCategoryFactory.getModel(categoryName, parentItemCategoryId);
        expect(result.name).toBe(categoryName);
        expect(result.parent_item_category_id).toBe(parentItemCategoryId);
    });

    // TODO: no test cases for duplicate category cases, and propably no functionality testing those cases

    test('Should convert ListingItemCategory to categoryArray, 3 levels', async () => {
        const result: string[] = await itemCategoryFactory.getArray(listingItemCategoryWithRelated);
        expect(result).toHaveLength(3);
        expect(result[2]).toBe(listingItemCategoryWithRelated.key);
        expect(result[1]).toBe((listingItemCategoryWithRelated as resources.ListingItemCategory).ParentItemCategory.key);
        expect(result[0]).toBe((listingItemCategoryWithRelated as resources.ListingItemCategory).ParentItemCategory.ParentItemCategory.key);
    });

    test('Should convert ListingItemCategory to categoryArray, 5 levels', async () => { // for length 3
        const result: string[] = await itemCategoryFactory.getArray(listingItemCategoryWithRelated5levels);
        const category = listingItemCategoryWithRelated5levels as resources.ListingItemCategory;
        expect(result).toHaveLength(5);
        expect(result[4]).toBe(category.key);
        expect(result[3]).toBe(category.ParentItemCategory.key);
        expect(result[2]).toBe(category.ParentItemCategory.ParentItemCategory.key);
        expect(result[1]).toBe(category.ParentItemCategory.ParentItemCategory.ParentItemCategory.key);
        expect(result[0]).toBe(category.ParentItemCategory.ParentItemCategory.ParentItemCategory.ParentItemCategory.key);
    });

    // TODO: getArray to work with custom categories

});
