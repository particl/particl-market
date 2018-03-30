import * as listingItemTemplateBasic1 from '../../testdata/model/listingItemTemplateBasic1.json';
import * as listingItemTemplateBasic2 from '../../testdata/model/listingItemTemplateBasic2.json';
import * as listingItemTemplateBasic3 from '../../testdata/model/listingItemTemplateBasic3.json';
import { HashableObjectType } from '../../../src/api/enums/HashableObjectType';
import { ObjectHash } from '../../../src/core/helpers/ObjectHash';

describe('ObjectHash', () => {

    const testData1 = JSON.parse(JSON.stringify(listingItemTemplateBasic1));
    const testData2 = JSON.parse(JSON.stringify(listingItemTemplateBasic2));
    const testData3 = JSON.parse(JSON.stringify(listingItemTemplateBasic3));

    // TODO: test the hash generation from CreateRequests which is the object they are first created from.
    // TODO: then test generation from the Model data created from the CreateRequest and check that those two match

    test('Should get hash for listingItemTemplate', async () => {
        expect.assertions(1);
        const listingItemTemplateHash = ObjectHash.getHash(testData1, HashableObjectType.LISTINGITEMTEMPLATE);
        expect(listingItemTemplateHash).not.toBeNull();
    });

    test('Should get hash for ItemImage', async () => {
        expect.assertions(1);
        const itemImageData = listingItemTemplateBasic1.ItemInformation.ItemImages[0].ItemImageDatas[0];
        const itemImageHash = ObjectHash.getHash(itemImageData, HashableObjectType.ITEMIMAGE);
        expect(itemImageHash).toBe('ed06cccab6f1dd1004ec21429058a72efa0beb6e9ba3606b16450e928bdb3e14');
    });

    test('Should return different hashes for objects that have different values', async () => {
        expect.assertions(1);
        const objectHash1 = ObjectHash.getHash(testData1, HashableObjectType.LISTINGITEMTEMPLATE);
        const objectHash2 = ObjectHash.getHash(testData2, HashableObjectType.LISTINGITEMTEMPLATE);

        expect(objectHash1).not.toBe(objectHash2);
    });

    test('getHash() should return same hashes for objects that have same values in different orders', async () => {
        expect.assertions(1);
        // TODO: different testdata files should contain different data or the same data and difference in
        // order should we known from the filename
        const objectHash1 = ObjectHash.getHash(testData1, HashableObjectType.LISTINGITEMTEMPLATE);
        const objectHash3 = ObjectHash.getHash(testData3, HashableObjectType.LISTINGITEMTEMPLATE);

        expect(objectHash1).toBe(objectHash3);
    });

    test('getHash() on an object should return the same hash every time', async () => {
        // Get the hash of the test object 100 times and ensure it returns the same hash every time.
        const firstHash = ObjectHash.getHash(testData1, HashableObjectType.LISTINGITEMTEMPLATE);
        for (let i = 0; i < 100; ++i) {
            const hash = ObjectHash.getHash(testData1, HashableObjectType.LISTINGITEMTEMPLATE);
            // console.log('hash = : ' + hash);
            expect(hash).toBe(firstHash);
        }
    });



});
