import { LogMock } from '../../lib/LogMock';
import { ItemCategoryFactory } from '../../../../src/api/factories/ItemCategoryFactory';

describe('ItemCategoryFactory', () => {

    let req;
    let itemCategoryFactory;
    const rootCategoryWithRelated = {
        id: 1,
        Key: 'cat_ROOT',
        name: 'ROOT',
        ChildItemCategories: [
            {
                id: 2,
                Key: 'cat_high_value',
                name: 'High Value',
                parentItemCategoryId: 1,
                ChildItemCategories: [
                    {
                        id: 3,
                        Key: 'cat_high_business_corporate',
                        name: 'Business Corporate',
                        parentItemCategoryId: 2,
                        ChildItemCategories: []
                    }
                ]
            }
        ]
    };
    beforeEach(() => {
        process.env.AUTH0_HOST = 'test';
        itemCategoryFactory = new ItemCategoryFactory(LogMock);
    });

    test('Should get the item-category data when pass root category only', () => {
        req = ['cat_ROOT', 'Subcategory', 'SubSubcategory'];
        itemCategoryFactory.get(req, rootCategoryWithRelated).then((res, error) => {
            expect(res.length).toBe(2);
            expect(res[0].parent_item_category_id).not.toBe(0);
            expect(res[0].name).toBe(req[1]);

            expect(res[1].parent_item_category_id).toBe('0');
            expect(res[1].name).toBe(req[2]);
        });
    });

    test('Should get the item-category data when pass two existing category', () => {
        req = ['cat_ROOT', 'cat_high_value', 'SubSubcategory'];
        itemCategoryFactory.get(req, rootCategoryWithRelated).then((res, error) => {
            expect(res.length).toBe(1);
            expect(res[0].parent_item_category_id).not.toBe(0);
            expect(res[0].name).toBe(req[2]);
        });
    });

    test('Should get the item-category data when pass two existing category(key, name)', () => {
        req = ['cat_ROOT', 'High Value', 'SubSubcategory'];
        itemCategoryFactory.get(req, rootCategoryWithRelated).then((res, error) => {
            expect(res.length).toBe(1);
            expect(res[0].parent_item_category_id).not.toBe(0);
            expect(res[0].name).toBe(req[2]);
        });
    });

    test('Should get the item-category data when pass all existing category', () => {
        req = ['cat_ROOT', 'cat_high_value', 'cat_high_business_corporate'];
        itemCategoryFactory.get(req, rootCategoryWithRelated).then((res, error) => {
            expect(res.ItemCategory).not.toBe(null);
        });
    });

});
