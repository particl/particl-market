import { api } from './lib/api';
import { DatabaseResetCommand } from '../../src/console/DatabaseResetCommand';
import { ImageDataProtocolType } from '../../src/api/enums/ImageDataProtocolType';

describe('/item-images', () => {

    const keys = [
        'id', 'updatedAt', 'createdAt', 'hash' // , 'Related'
    ];

    // const keysWithoutRelated = [
    //    'id', 'updatedAt', 'createdAt', 'hash'
    // ];

    const testData = {
        hash: 'asdfasdfasdfasdf',
        data: {
            dataId: 'QmUwHMFY9GSiKgjqyZpgAv2LhBrh7GV8rtLuagbry9wmMU',
            protocol: ImageDataProtocolType.IPFS,
            encoding: null,
            data: null
        }
    };

    const testDataUpdated = {
        hash: 'wqerqwerqwerqwerqwer',
        data: {
            dataId: null,
            protocol: ImageDataProtocolType.LOCAL,
            encoding: 'BASE64',
            data: 'BASE64 encoded image data'
        }
    };

    let createdId;
    beforeAll(async () => {
        const command = new DatabaseResetCommand();
        await command.run();
    });

    test('POST      /item-images        Should create a new item image', async () => {
        const res = await api('POST', '/api/item-images', {
            body: testData
        });
        res.expectJson();
        res.expectStatusCode(201);
        res.expectData(keys);
        createdId = res.getData()['id'];

        const result: any = res.getData();
        expect(result.hash).toBe(testData.hash);
        expect(result.ItemImageData.dataId).toBe(testData.data.dataId);
        expect(result.ItemImageData.protocol).toBe(testData.data.protocol);
        expect(result.ItemImageData.encoding).toBe(testData.data.encoding);
        expect(result.ItemImageData.data).toBe(testData.data.data);
    });

    test('POST      /item-images        Should fail because we want to create a empty item image', async () => {
        const res = await api('POST', '/api/item-images', {
            body: {}
        });
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('GET       /item-images        Should list item images with our new create one', async () => {
        const res = await api('GET', '/api/item-images');
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys); // keysWithoutRelated
        const data = res.getData<any[]>();
        expect(data.length).toBe(1);

        const result = data[0];
        expect(result.hash).toBe(testData.hash);
        expect(result.ItemImageData).toBe(undefined); // doesnt fetch related
    });

    test('GET       /item-images/:id    Should return one item image', async () => {
        const res = await api('GET', `/api/item-images/${createdId}`);
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys);

        const result: any = res.getData();
        expect(result.hash).toBe(testData.hash);
        expect(result.ItemImageData.dataId).toBe(testData.data.dataId);
        expect(result.ItemImageData.protocol).toBe(testData.data.protocol);
        expect(result.ItemImageData.encoding).toBe(testData.data.encoding);
        expect(result.ItemImageData.data).toBe(testData.data.data);
    });

    test('PUT       /item-images/:id    Should update the item image', async () => {
        const res = await api('PUT', `/api/item-images/${createdId}`, {
            body: testDataUpdated
        });
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys);

        const result: any = res.getData();
        expect(result.hash).toBe(testDataUpdated.hash);
        expect(result.ItemImageData.dataId).toBe(testDataUpdated.data.dataId);
        expect(result.ItemImageData.protocol).toBe(testDataUpdated.data.protocol);
        expect(result.ItemImageData.encoding).toBe(testDataUpdated.data.encoding);
        expect(result.ItemImageData.data).toBe(testDataUpdated.data.data);
    });

    test('PUT       /item-images/:id    Should fail because we want to update the item image with a invalid email', async () => {
        const res = await api('PUT', `/api/item-images/${createdId}`, {
            body: {
                email: 'abc'
            }
        });
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('DELETE    /item-images/:id    Should delete the item image', async () => {
        const res = await api('DELETE', `/api/item-images/${createdId}`);
        res.expectStatusCode(200);
    });

    /**
     * 404 - NotFound Testing
     */
    test('GET       /item-images/:id    Should return with a 404, because we just deleted the item image', async () => {
        const res = await api('GET', `/api/item-images/${createdId}`);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('DELETE    /item-images/:id    Should return with a 404, because we just deleted the item image', async () => {
        const res = await api('DELETE', `/api/item-images/${createdId}`);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('PUT       /item-images/:id    Should return with a 404, because we just deleted the item image', async () => {
        const res = await api('PUT', `/api/item-images/${createdId}`, {
            body: testDataUpdated
        });
        res.expectJson();
        res.expectStatusCode(404);
    });

});
