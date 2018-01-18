import { LogMock } from '../../lib/LogMock';
import { ItemCategoryFactory } from '../../../../src/api/factories/ItemCategoryFactory';

describe('ItemCategoryFactory', () => {

    // TODO: missing tests for getArray

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
                parent_item_category_id: 1,
                ChildItemCategories: [
                    {
                        id: 3,
                        Key: 'cat_high_business_corporate',
                        name: 'Business Corporate',
                        parent_item_category_id: 2,
                        ChildItemCategories: []
                    }
                ]
            }
        ]
    };

    beforeEach(() => {
        itemCategoryFactory = new ItemCategoryFactory(LogMock);
    });

    test('Should get the item-category data when pass root category only', () => {
        req = ['cat_ROOT', 'Subcategory', 'SubSubcategory'];
        itemCategoryFactory.getModel(req, rootCategoryWithRelated).then((res, error) => {
            expect(res.createdCategories.length).toBe(1);
            expect(res.lastCheckIndex).toBe(0);

            expect(res.createdCategories[0].parentCategoryId).toBe(null); // should be null
            expect(res.createdCategories[0].id).toBe(rootCategoryWithRelated.id); // cat_ROOT id
        });
    });

    test('Should get the item-category data when pass two existing category', () => {
        req = ['cat_ROOT', 'cat_high_value', 'SubSubcategory'];
        itemCategoryFactory.getModel(req, rootCategoryWithRelated).then((res, error) => {
            expect(res.createdCategories.length).toBe(2);
            expect(res.lastCheckIndex).toBe(1);

            expect(res.createdCategories[0].parentCategoryId).toBe(null); // should be null
            expect(res.createdCategories[0].id).toBe(rootCategoryWithRelated.id); // cat_ROOT id

            expect(res.createdCategories[1].parentCategoryId).toBe(rootCategoryWithRelated.id);
            expect(res.createdCategories[1].parentCategoryId).toBe(rootCategoryWithRelated.ChildItemCategories[0].parent_item_category_id);
            expect(res.createdCategories[1].id).toBe(rootCategoryWithRelated.ChildItemCategories[0].id); // cat_high_value id
        });
    });

    test('Should get the item-category data when pass two existing category(key, name)', () => {
        req = ['cat_ROOT', 'High Value', 'SubSubcategory'];
        itemCategoryFactory.getModel(req, rootCategoryWithRelated).then((res, error) => {
            expect(res.createdCategories.length).toBe(2);
            expect(res.lastCheckIndex).toBe(1);

            expect(res.createdCategories[0].parentCategoryId).toBe(null); // should be null
            expect(res.createdCategories[0].id).toBe(rootCategoryWithRelated.id); // cat_ROOT id

            expect(res.createdCategories[1].parentCategoryId).toBe(rootCategoryWithRelated.id);
            expect(res.createdCategories[1].parentCategoryId).toBe(rootCategoryWithRelated.ChildItemCategories[0].parent_item_category_id);
            expect(res.createdCategories[1].id).toBe(rootCategoryWithRelated.ChildItemCategories[0].id); // cat_high_value id
        });
    });

    test('Should get the item-category data when pass all existing category', () => {
        req = ['cat_ROOT', 'cat_high_value', 'cat_high_business_corporate'];
        itemCategoryFactory.getModel(req, rootCategoryWithRelated).then((res, error) => {
            expect(res.createdCategories.length).toBe(req.length);
            expect(res.lastCheckIndex).toBe(req.length - 1);

            expect(res.createdCategories[0].parentCategoryId).toBe(null); // should be null
            expect(res.createdCategories[0].id).toBe(rootCategoryWithRelated.id); // cat_ROOT id

            expect(res.createdCategories[1].parentCategoryId).toBe(rootCategoryWithRelated.id);
            expect(res.createdCategories[1].parentCategoryId).toBe(rootCategoryWithRelated.ChildItemCategories[0].parent_item_category_id);
            expect(res.createdCategories[1].id).toBe(rootCategoryWithRelated.ChildItemCategories[0].id); // cat_high_value id

            const childCate = rootCategoryWithRelated.ChildItemCategories[0];
            expect(res.createdCategories[2].parentCategoryId).toBe(childCate.id);
            expect(res.createdCategories[2].parentCategoryId).toBe(childCate.ChildItemCategories[0].parent_item_category_id);
            expect(res.createdCategories[2].id).toBe(childCate.ChildItemCategories[0].id); // cat_high_business_corporate id
        });
    });

});
