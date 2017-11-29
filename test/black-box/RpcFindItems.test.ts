import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';

import { Country } from '../../src/api/enums/Country';
import { ShippingAvailability } from '../../src/api/enums/ShippingAvailability';
import { ImageDataProtocolType } from '../../src/api/enums/ImageDataProtocolType';
import { PaymentType } from '../../src/api/enums/PaymentType';
import { EscrowType } from '../../src/api/enums/EscrowType';
import { Currency } from '../../src/api/enums/Currency';
import { CryptocurrencyAddressType } from '../../src/api/enums/CryptocurrencyAddressType';
import { MessagingProtocolType } from '../../src/api/enums/MessagingProtocolType';

describe('FindItems', () => {

    const testUtil = new BlackBoxTestUtil();
    const method = 'finditems';

    const rootData = {
        key: 'cat_ROOT',
        name: 'ROOT',
        description: 'root'
    };

    const testCategoryData = {
        key: 'cat_electronics',
        name: 'Electronics and Technology',
        description: 'Electronics and Technology description'
    };

    let categories;

    let testData;
    let testDataTwo;

    beforeAll(async () => {
        await testUtil.cleanDb();

        const listingItemTemplates = await testUtil.generateData('listingitem', 2);
        testData = listingItemTemplates[0];
        testDataTwo = listingItemTemplates[1];

        // get categories
        const res = await rpc('getcategories', []);
        categories = res.getBody()['result'];

    });


    test('Should get all listing items', async () => {

        // [0]: page, number
        // [1]: pageLimit, number
        // [2]: order, SearchOrder
        // [3]: category, number|string, if string, try to find using key, can be null
        // [4]: searchString, string, can be null

        const res = await rpc(method, [1, 2, 'ASC']);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(2);
        expect(result[0].hash).toBe(testData.hash);
        expect(result[1].hash).toBe(testDataTwo.hash);

    });

    test('Should get only first listing item by pagination', async () => {

        const res = await rpc(method, [1, 1, 'ASC']);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(1);
        expect(result[0].hash).toBe(testData.hash);

    });

    test('Should get second listing item by pagination', async () => {

        const res = await rpc(method, [2, 1, 'ASC']);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(1);
        expect(result[0].hash).toBe(testDataTwo.hash);

    });

    // TODO: maybe we should rather return an error?
    test('Should return empty listing items array if invalid pagination', async () => {

        const res = await rpc(method, [2, 2, 'ASC']);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(0);
    });

    test('Should search listing items by category key', async () => {

        const categoryKey = testData.ItemInformation.ItemCategory.key;

        const res = await rpc(method, [1, 2, 'ASC', categoryKey]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBeGreaterThanOrEqual(1);

    });

    test('Should search listing items by category id', async () => {
        const categoryId = testData.ItemInformation.ItemCategory.id;

        const res = await rpc(method, [1, 2, 'ASC', categoryId]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBeGreaterThanOrEqual(1);
    });

    /**
     * TODO
     * result [{
     *      id: 1,
     *      hash: '694193c4-1ff2-45b3-94db-11ab45b4db61',
     *      listingItemTemplateId: null,
     *      updatedAt: 1511919276560,
     *      createdAt: 1511919276560
     * }]
     * ...search doesnt seem to be returning relations
     */
    test('Should search listing items by ItemInformation title', async () => {

        const title = testData.ItemInformation.title;

        const res = await rpc(method, [1, 2, 'ASC', null, title]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        console.log('result FIX THIS', result);

        expect(result.length).toBeGreaterThanOrEqual(1);
        expect(result[0].ItemInformation.title).toBe(testData.ItemInformation.title);
    });
});



