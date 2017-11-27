import { api } from './lib/api';
import { DatabaseResetCommand } from '../../src/console/DatabaseResetCommand';

describe('/RpcUpdateItemInformation', () => {

    const keys = [
        'id', 'updatedAt', 'createdAt', 'title', 'shortDescription', 'longDescription' // , 'Related'
    ];

    const testDataIteminformation = {
        method: 'createlistingitemtemplate',
        params: [
            0, 'Test Title', 'test short description', 'Long description', '0'
        ],
        jsonrpc: '2.0'
    };

    const testDataWithItemtemplates = {
        profile_id: 0,
        itemInformation: {
            title: 'Item Information with Templates',
            shortDescription: 'Item short description with Templates',
            longDescription: 'Item long description with Templates',
            itemCategory: {
                key: '0'
            }
        }
    };

    const testDataUpdate = {
        method: 'updateiteminformation',
        params: [
            '0',
            'Update Item Information',
            'Update Item Short description',
            'Update Item Long description',
            '0'
        ],
        jsonrpc: '2.0'
    };

    const testData = {
        title: 'Item Information',
        shortDescription: 'Item short description',
        longDescription: 'Item long description',
        itemCategory: {
            key: '0'
        }
    };

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

    let catKey;
    let catId;
    test('Should update Item Information by RPC', async () => {
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
        catId = rescat.getData()['id'];
        catKey = rescat.getData()['key'];

        testDataWithItemtemplates.itemInformation.itemCategory.key = catKey;
        // create Item information with item-template
        const resItemInformation = await api('POST', '/api/listing-item-templates', {
            body: testDataWithItemtemplates
        });
        resItemInformation.expectJson();
        resItemInformation.expectStatusCode(201);
        // resItemInformation.expectData(keys);
        const createdId = resItemInformation.getBody()['data']['ItemInformation']['id'];


        // update item information
        testDataUpdate.params[0] = createdId;
        testDataUpdate.params[4] = catKey;
        const resUpdateItemInformation = await api('POST', '/api/rpc', {
            body: testDataUpdate
        });
        resUpdateItemInformation.expectJson();
        resUpdateItemInformation.expectStatusCode(200);
        resUpdateItemInformation.expectDataRpc(keys);
        const result: any = resUpdateItemInformation.getBody()['result'];
        expect(result.title).toBe(testDataUpdate.params[1]);
        expect(result.shortDescription).toBe(testDataUpdate.params[2]);
        expect(result.longDescription).toBe(testDataUpdate.params[3]);
        expect(result.ItemCategory.key).toBe(testDataUpdate.params[4]);
    });

    test('Should fail update Item Information, item-information is not related with item-template', async () => {
        testData.itemCategory.key = catKey;
        // create Item information without item-template
        const resItemInformation = await api('POST', '/api/item-informations', {
            body: testData
        });
        resItemInformation.expectJson();
        resItemInformation.expectStatusCode(201);
        resItemInformation.expectData(keys);
        const createdId = resItemInformation.getData()['id'];

        // update item information
        testDataUpdate.params[0] = createdId;
        testDataUpdate.params[4] = catKey;
        const resUpdateItemInformation = await api('POST', '/api/rpc', {
            body: testDataUpdate
        });
        const result: any = resUpdateItemInformation;
        resUpdateItemInformation.expectJson();
        resUpdateItemInformation.expectStatusCode(404);
    });
});
