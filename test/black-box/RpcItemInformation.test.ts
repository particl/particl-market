import * as _ from 'lodash';
import { api } from './lib/api';
import { DatabaseResetCommand } from '../../src/console/DatabaseResetCommand';

describe('/RpcItemInformation', () => {

    const keys = [
        'id', 'updatedAt', 'createdAt', 'title', 'shortDescription', 'longDescription' // , 'Related'
    ];

    const testData = {
        method: 'createiteminformation',
        params: [
            'Item Title',
            'Item Short description',
            'Item Long description',
            '0'
        ],
        jsonrpc: '2.0'
    };

    const rootData = {
        key: 'cat_ROOT',
        name: 'ROOT',
        description: 'root'
    };

    const testDataCat = {
        key: 'cat_electronics',
        name: 'Electronics and Technologyyyyyy',
        description: 'Electronics and Technology description'
    };

    beforeAll(async () => {
        const command = new DatabaseResetCommand();
        await command.run();
    });

    test('Should create a new Item Information by RPC', async () => {
        // create root category
        const res = await api('POST', '/api/item-categories', {
            body: rootData
        });
        res.expectJson();
        res.expectStatusCode(201);
        const rootId = res.getData()['id'];

        testDataCat['parentItemCategoryId'] = rootId;
        // create category
        const rescat = await api('POST', '/api/item-categories', {
            body: testDataCat
        });
        rescat.expectJson();
        rescat.expectStatusCode(201);
        const catId = rescat.getData()['id'];
        const catKey = rescat.getData()['key'];

        // create item information
        testData.params[3] = catKey;
        const resMain = await api('POST', '/api/rpc', {
            body: testData
        });
        resMain.expectJson();
        resMain.expectStatusCode(200);
        resMain.expectDataRpc(keys);
        const result: any = resMain.getBody()['result'];
        expect(result.title).toBe(testData.params[0]);
        expect(result.shortDescription).toBe(testData.params[1]);
        expect(result.longDescription).toBe(testData.params[2]);
        expect(result.ItemCategory.key).toBe(testData.params[3]);
    });
});
