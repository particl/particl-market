import * as _ from 'lodash';
import { api } from './lib/api';
import { DatabaseResetCommand } from '../../src/console/DatabaseResetCommand';

describe('/RpcCreateListingItemTemplate', () => {

    const keys = [
        'id', 'updatedAt', 'createdAt', 'profileId'
    ];

    const testData = {
        method: 'createlistingitemtemplate',
        params: [
            0
        ],
        jsonrpc: '2.0'
    };

    const testDataIteminformation = {
        method: 'createlistingitemtemplate',
        params: [
            0, 'Test Title', 'test short description', 'Long description', '0', 'payment', 'USD', 10, 2, 4, 'testing-address'
        ],
        jsonrpc: '2.0'
    };

    // category data
    const rootData = {
        key: 'cat_ROOT',
        name: 'ROOT',
        description: 'root'
    };

    const testDataCat = {
        key: 'cat_electronics',
        name: 'Electronics and Technology',
        description: 'Electronics and Technology description'
    };

    beforeAll(async () => {
        const command = new DatabaseResetCommand();
        await command.run();
    });

    test('Should create a new Listing Item Template by RPC with Profile Id', async () => {
        const res = await api('POST', '/api/rpc', {
            body: testData
        });
        res.expectJson();
        res.expectStatusCode(200);
        res.expectDataRpc(keys);
        expect(res['profileId']).toBe(testData.params[1]);
        expect(res).hasOwnProperty('profile');
        expect(res).hasOwnProperty('ItemInformation');
        expect(res).hasOwnProperty('PaymentInformation');
        expect(res).hasOwnProperty('MessagingInformation');
        expect(res).hasOwnProperty('ListingItemObjects');
        expect(res).hasOwnProperty('ListingItem');
    });

    test('Should create a new Listing Item Template by RPC with Profile + Item-information + Payment-information', async () => {
        // create root category
        const resrc = await api('POST', '/api/item-categories', {
            body: rootData
        });
        resrc.expectJson();
        resrc.expectStatusCode(201);
        const rootId = resrc.getData()['id'];

        testDataCat['parentItemCategoryId'] = rootId;
        // create category
        const rescat = await api('POST', '/api/item-categories', {
            body: testDataCat
        });
        rescat.expectJson();
        rescat.expectStatusCode(201);
        const catId = rescat.getData()['id'];
        const catKey = rescat.getData()['key'];

        // create item template with item information
        testDataIteminformation.params[4] = catKey;
        const res = await api('POST', '/api/rpc', {
            body: testDataIteminformation
        });
        res.expectJson();
        res.expectStatusCode(200);
        res.expectDataRpc(keys);
        const result: any = res.getBody()['result'];
        expect(result['profileId']).toBe(testDataIteminformation.params[0]);
        expect(result).hasOwnProperty('profile');
        expect(result).hasOwnProperty('ItemInformation');
        expect(result['ItemInformation']['title']).toBe(testDataIteminformation.params[1]);
        expect(result['ItemInformation']['shortDescription']).toBe(testDataIteminformation.params[2]);
        expect(result['ItemInformation']['longDescription']).toBe(testDataIteminformation.params[3]);
        expect(result).hasOwnProperty('PaymentInformation');
        expect(result['PaymentInformation']['type']).toBe(testDataIteminformation.params[5]);

        expect(result).hasOwnProperty('MessagingInformation');
        expect(result).hasOwnProperty('ListingItemObjects');
        expect(result).hasOwnProperty('ListingItem');
    });

    test('Should fail because we want to create an empty ItemTemplate', async () => {
        testData.params = [];
        const res = await api('POST', '/api/rpc', {
            body: testData
        });
        res.expectJson();
        res.expectStatusCode(400);
    });
});
