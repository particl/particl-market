import * as Bookshelf from 'bookshelf';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { ObjectHashService } from '../../src/api/services/ObjectHashService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import * as listingItemTemplateBasic1 from '../testdata/model/listingItemTemplateBasic1';
import * as listingItemTemplateBasic2 from '../testdata/model/listingItemTemplateBasic2';
import * as listingItemTemplateBasic3 from '../testdata/model/listingItemTemplateBasic3';
import { HashableObjectType } from '../../src/api/enums/HashableObjectType';

describe('ObjectHash', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let objectHashService: ObjectHashService;

    const testData1 = JSON.parse(JSON.stringify(listingItemTemplateBasic1));
    const testData2 = JSON.parse(JSON.stringify(listingItemTemplateBasic2));
    const testData3 = JSON.parse(JSON.stringify(listingItemTemplateBasic3));
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

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        objectHashService = app.IoC.getNamed<ObjectHashService>(Types.Service, Targets.Service.ObjectHashService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();
    });

    afterAll(async () => {
        //
    });

    test('Should get hash for listingItemTemplate', async () => {
        expect.assertions(1);
        const listingItemTemplateHash = await objectHashService.getHash(testData1, HashableObjectType.LISTINGITEMTEMPLATE);
        expect(listingItemTemplateHash).not.toBeNull();
    });

    // todo
    // test('Should get hash for ItemImage', async () => {
    //     expect.assertions(1);
    //     const itemImageData = listingItemTemplateBasic1.ItemInformation.ItemImages[0].ItemImageDatas[0];
    //     expect(itemImageData).toBe(1);
    //     const itemImageHash = await objectHashService.getHash(testData1, HashableObjectType.ITEMIMAGE);
    //     expect(itemImageHash).toBeNull();
    // });


    test('Should return correct hash', async () => {
        expect.assertions(1);
        const objectHash = await objectHashService.getHash(testCategory, HashableObjectType.DEFAULT);
        expect(objectHash).toBe('639bf0f3e0f70e6d948d2715bbce1cb0232e0667e82639c31a183efa29a73397');
    });

    test('Should return different hashes for objects that have different values', async () => {
        expect.assertions(1);
        const objectHash1 = await objectHashService.getHash(testData1, HashableObjectType.LISTINGITEMTEMPLATE);
        const objectHash2 = await objectHashService.getHash(testData2, HashableObjectType.LISTINGITEMTEMPLATE);

        expect(objectHash1).not.toBe(objectHash2);
    });

    test('getHash() should return same hashes for objects that have same values in different orders', async () => {
        expect.assertions(1);
        const objectHash1 = await objectHashService.getHash(testData1, HashableObjectType.LISTINGITEMTEMPLATE);
        const objectHash3 = await objectHashService.getHash(testData3, HashableObjectType.LISTINGITEMTEMPLATE);

        expect(objectHash1).toBe(objectHash3);
    });

    test('getHash() on an object should return the same hash every time', async () => {
        // Get the hash of the test object 100 times and ensure it returns the same hash every time.
        const firstHash = await objectHashService.getHash(testData1, HashableObjectType.LISTINGITEMTEMPLATE);
        for (let i = 0; i < 100; ++i) {
            const hash = await objectHashService.getHash(testData1, HashableObjectType.LISTINGITEMTEMPLATE);
            // console.log('hash = : ' + hash);
            expect(hash).toBe(firstHash);
        }
    });




});
