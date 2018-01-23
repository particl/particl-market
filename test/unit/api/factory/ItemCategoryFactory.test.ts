import { LogMock } from '../../lib/LogMock';
import { ItemCategoryFactory } from '../../../../src/api/factories/ItemCategoryFactory';

describe('ItemCategoryFactory', () => {

    let req;
    let itemCategoryFactory;
    const rootCategoryWithRelated = {
        id: 1,
        key: 'cat_ROOT',
        name: 'ROOT',
        parentCategoryId: null,
        ChildItemCategories: [
            {
                id: 2,
                key: 'cat_high_value',
                name: 'High Value',
                parentItemCategoryId: 1,
                ChildItemCategories: [
                    {
                        id: 5,
                        key: 'cat_high_business_corporate',
                        name: 'Business Corporate 5',
                        parentItemCategoryId: 2,
                        ChildItemCategories: [
                            {
                                id: 8,
                                key: 'cat_high_business_corporate_8',
                                name: 'Business Corporate 8',
                                parentItemCategoryId: 5,
                                ChildItemCategories: [
                                    {
                                        id: 10,
                                        key: 'cat_high_business_corporate_10',
                                        name: 'Business Corporate 10',
                                        parentItemCategoryId: 8,
                                        ChildItemCategories: []
                                    },
                                    {
                                        id: 11,
                                        key: 'cat_high_business_corporate_11',
                                        name: 'Business Corporate 11',
                                        parentItemCategoryId: 8,
                                        ChildItemCategories: []
                                    }
                                ]
                            },
                            {
                                id: 9,
                                key: 'cat_high_business_corporate_9',
                                name: 'Business Corporate 9',
                                parentItemCategoryId: 5,
                                ChildItemCategories: []
                            }
                        ]
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

    test('Should get the categoryCreateMessage from categoryFactory.getModal', () => {
        req = {
            name: 'categoryName',
            parentItemCategoryId: 10
        };
        itemCategoryFactory.getModel(req.name, req.parentItemCategoryId).then((res, error) => {
            expect(res.name).toBe(req.name);
            expect(res.parent_item_category_id).toBe(req.parentItemCategoryId);
        });
    });

    // test getArray function
    test('Should get the categoryArray when pass category', () => { // for length 2
        const category = {
            id: 4,
            key: 'cat_high_value_4',
            name: 'High Value 4',
            parentItemCategoryId: 1
        };
        itemCategoryFactory.getArray(category, rootCategoryWithRelated).then((res, error) => {
            expect(res).toHaveLength(2);
            expect(res[0]).toBe(rootCategoryWithRelated.key);
            expect(res[1]).toBe(category.key);
        });
    });

    test('Should get the categoryArray when pass category', () => { // for length 3
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

    test('Should get the categoryArray when pass category', () => { // for length 5
        const category = {
            id: 11,
            key: 'cat_high_business_corporate_11',
            name: 'Business Corporate',
            parentItemCategoryId: 8
        };
        itemCategoryFactory.getArray(category, rootCategoryWithRelated).then((res, error) => {
            expect(res).toHaveLength(5);
            expect(res[0]).toBe(rootCategoryWithRelated.key);
            expect(res[1]).toBe(rootCategoryWithRelated.ChildItemCategories[0].key);
            expect(res[2]).toBe(rootCategoryWithRelated.ChildItemCategories[0].ChildItemCategories[0].key);
            expect(res[3]).toBe(rootCategoryWithRelated.ChildItemCategories[0].ChildItemCategories[0].ChildItemCategories[0].key);
            expect(res[4]).toBe(category.key);
        });
    });

});
