import { LogMock } from '../../lib/LogMock';
import { ItemCategoryFactory } from '../../../../src/api/factories/ItemCategoryFactory';
import { ItemCategoryCreateRequest } from '../../../../src/api/requests/ItemCategoryCreateRequest';
import * as listingItemCategoryWithRelated from '../../../testdata/category/listingItemCategoryWithRelated.json';
import * as listingItemCategoryWithRelated5levels from '../../../testdata/category/listingItemCategoryWithRelated5levels.json';
import * as listingItemCategoryRootWithRelated from '../../../testdata/category/listingItemCategoryRootWithRelated.json';
import * as resources from 'resources';

describe('ItemCategoryFactory', () => {

    let itemCategoryFactory;

    beforeEach(() => {
        itemCategoryFactory = new ItemCategoryFactory(LogMock);
    });

    // getModel tests
    test('Should get the ItemCategoryCreateRequest from itemCategoryFactory.getModel', async () => {
        const categoryArray = ['cat_ROOT', 'cat_high_value', 'cat_high_business_corporate'];
        const result: ItemCategoryCreateRequest = await itemCategoryFactory.getModel(categoryArray, listingItemCategoryRootWithRelated);
        expect(result.name).toBe('Business / Corporate');
        expect(result.key).toBe('cat_high_business_corporate');
        expect(result.parent_item_category_id).toBe(962);
    });

    // getArray tests
    // TODO: there's no test cases for duplicate category cases, and propably there's no functionality for validating those cases either
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
