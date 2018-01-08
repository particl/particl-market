import { ObjectHash } from '../../../src/core/helpers/ObjectHash';

describe('ObjectHash', () => {
    const testCategory = {
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

    const testCategory2 = {
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
                        name: 'Something else',
                        parent_item_category_id: 2,
                        ChildItemCategories: []
                    }
                ]
            }
        ]
    };

    const testCategory3reordered2 = {
        Key: 'cat_ROOT',
        id: 1,
        name: 'ROOT',
        ChildItemCategories: [
            {
                Key: 'cat_high_value',
                ChildItemCategories: [
                    {
                        id: 3,
                        Key: 'cat_high_business_corporate',
                        name: 'Something else',
                        parent_item_category_id: 2,
                        ChildItemCategories: []
                    }
                ],
                name: 'High Value',
                parent_item_category_id: 1,
                id: 2
            }
        ]
    };

    test('getHash() should return correct hash', () => {
        expect(ObjectHash.getHash(testCategory)).toBe('639bf0f3e0f70e6d948d2715bbce1cb0232e0667e82639c31a183efa29a73397');
    });

    test('getHash() should return different hashes for objects that have different values', () => {
        expect(ObjectHash.getHash(testCategory)).not.toBe(ObjectHash.getHash(testCategory2));
    });

    test('getHash() should return same hashes for objects that have same values in different orders', () => {
        expect(ObjectHash.getHash(testCategory2)).toBe(ObjectHash.getHash(testCategory3reordered2));
    });

    test('getHash() on an object should return the same hash every time', () => {
        // Get the hash of the test object 100 times and ensure it returns the same hash every time.
        const firstHash = ObjectHash.getHash(testCategory);
        for (let i = 0; i < 100; ++i) {
            const hash = ObjectHash.getHash(testCategory);
            // console.log('hash = : ' + hash);
            expect(hash).toBe(firstHash);
        }
    });
});
