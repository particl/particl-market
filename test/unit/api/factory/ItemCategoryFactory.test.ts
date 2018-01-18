import { LogMock } from '../../lib/LogMock';
import { ItemCategoryFactory } from '../../../../src/api/factories/ItemCategoryFactory';

describe('ItemCategoryFactory', () => {

    // TODO: missing tests for getArray

    let req;
    let itemCategoryFactory;
    const rootCategoryWithRelated = {
        id: 1,
        key: 'cat_ROOT',
        name: 'ROOT',
        ChildItemCategories: [
            {
                id: 2,
                key: 'cat_high_value',
                name: 'High Value 2',
                parentItemCategoryId: 1,
                ChildItemCategories: [
                    {
                        id: 5,
                        key: 'cat_high_business_corporate',
                        name: 'Business Corporate',
                        parentItemCategoryId: 2,
                        ChildItemCategories: []
                    }
                ]
            }, {
                id: 3,
                key: 'cat_high_value_3',
                name: 'High Value 3',
                parentItemCategoryId: 1,
                ChildItemCategories: [
                    {
                        id: 6,
                        key: 'cat_high_business_corporate_3',
                        name: 'Business Corporate 3',
                        parentItemCategoryId: 3,
                        ChildItemCategories: []
                    }
                ]
            }, {
                id: 4,
                key: 'cat_high_value_4',
                name: 'High Value 4',
                parentItemCategoryId: 1,
                ChildItemCategories: [
                    {
                        id: 7,
                        key: 'cat_high_business_corporate_4',
                        name: 'Business Corporate 4',
                        parentItemCategoryId: 4,
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
            expect(res.createdCategories[1].parentCategoryId).toBe(rootCategoryWithRelated.ChildItemCategories[0].parentItemCategoryId);
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
            expect(res.createdCategories[1].parentCategoryId).toBe(rootCategoryWithRelated.ChildItemCategories[0].parentItemCategoryId);
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
            expect(res.createdCategories[1].parentCategoryId).toBe(rootCategoryWithRelated.ChildItemCategories[0].parentItemCategoryId);
            expect(res.createdCategories[1].id).toBe(rootCategoryWithRelated.ChildItemCategories[0].id); // cat_high_value id

            const childCate = rootCategoryWithRelated.ChildItemCategories[0];
            expect(res.createdCategories[2].parentCategoryId).toBe(childCate.id);
            expect(res.createdCategories[2].parentCategoryId).toBe(childCate.ChildItemCategories[0].parentItemCategoryId);
            expect(res.createdCategories[2].id).toBe(childCate.ChildItemCategories[0].id); // cat_high_business_corporate id
        });
    });

    // test getArray function
    test('Should get the categoryArray when pass category', () => {
        const category = {
            id: 7,
            key: 'cat_high_business_corporate_4',
            name: 'Business Corporate 4',
            parentItemCategoryId: 4
        };
        itemCategoryFactory.getArray(category, rootCategoryWithRelated).then((res, error) => {
            expect(res).toHaveLength(3);
            expect(res[0]).toBe(rootCategoryWithRelated.key);
            expect(res[1]).toBe(rootCategoryWithRelated.ChildItemCategories[2].key);
            expect(res[2]).toBe(category.key);
        });
    });

});
