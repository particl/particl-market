import { api } from './lib/api';
import { DatabaseResetCommand } from '../../src/console/DatabaseResetCommand';
import { Country } from '../../src/api/enums/Country';
import { ShippingAvailability } from '../../src/api/enums/ShippingAvailability';
import { ImageDataProtocolType } from '../../src/api/enums/ImageDataProtocolType';
import { PaymentType } from '../../src/api/enums/PaymentType';
import { EscrowType } from '../../src/api/enums/EscrowType';
import { Currency } from '../../src/api/enums/Currency';
import { CryptocurrencyAddressType } from '../../src/api/enums/CryptocurrencyAddressType';
import { MessagingProtocolType } from '../../src/api/enums/MessagingProtocolType';

describe('/RpcFindItemTemplates', () => {

    const keys = [
        'id', 'updatedAt', 'createdAt', 'profileId'  // , 'Related'
    ];

    // for getting item templates
    const searchItemTemplates = {
        method: 'searchlistingitemtemplate',
        params: [1, 2, 'ASC', 0], // [page, pageLimit, order, profileId, category, search-string]
        jsonrpc: '2.0'
    };

    // for creating item templates
    const firstItemInformation = {
        method: 'createlistingitemtemplate',
        params: [
            0, 'First Title', 'First Short Description', 'First Long Description', '0'
        ],
        jsonrpc: '2.0'
    };

    const secondItemInformation = {
        method: 'createlistingitemtemplate',
        params: [
            0, 'Second Title', 'Second Short Description', 'Second Long Description', '0'
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

    let firstItemTemplateResponse;
    let secondItemTemplateResponse;
    let categoryId;
    let categoryKey;


    test('Should get all Item Templates', async () => {
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
        categoryId = rescat.getData()['id'];
        categoryKey = rescat.getData()['key'];
        // create item template with item information
        firstItemInformation.params[4] = categoryKey;
        const resFirst = await api('POST', '/api/rpc', {
            body: firstItemInformation
        });
        resFirst.expectJson();
        resFirst.expectStatusCode(200);
        resFirst.expectDataRpc(keys);
        firstItemTemplateResponse = resFirst.getBody()['result'];
        secondItemInformation.params[4] = categoryKey;
        const resSecond = await api('POST', '/api/rpc', {
            body: secondItemInformation
        });
        resSecond.expectJson();
        resSecond.expectStatusCode(200);
        resSecond.expectDataRpc(keys);
        secondItemTemplateResponse = resSecond.getBody()['result'];
        // get all listing items
        const resMain = await api('POST', '/api/rpc', {
            body: searchItemTemplates
        });

        resMain.expectJson();
        resMain.expectStatusCode(200);
        resMain.expectDataRpc(keys);
        const resultMain: any = resMain.getBody()['result'];
        expect(resultMain.length).toBe(2);
    });

    test('Should get only first item template by pagination', async () => {
        searchItemTemplates.params[1] = 1;
        const resPageOne = await api('POST', '/api/rpc', {
            body: searchItemTemplates
        });
        resPageOne.expectJson();
        resPageOne.expectStatusCode(200);
        resPageOne.expectDataRpc(keys);
        const resultPageOne: any = resPageOne.getBody()['result'];
        expect(resultPageOne.length).toBe(1);
        // check itemInformation
        expect(resultPageOne[0]['ItemInformation'].title).toBe(firstItemInformation.params[1]);
        expect(resultPageOne[0]['ItemInformation'].shortDescription).toBe(firstItemInformation.params[2]);
        expect(resultPageOne[0]['ItemInformation'].longDescription).toBe(firstItemInformation.params[3]);
        // check profile
        expect(resultPageOne[0]['profileId']).toBe(firstItemInformation.params[0]);
        // check realted models
        expect(resultPageOne).hasOwnProperty('profile');

        expect(resultPageOne).hasOwnProperty('ItemInformation');

        expect(resultPageOne).hasOwnProperty('PaymentInformation');

        expect(resultPageOne).hasOwnProperty('MessagingInformation');

        expect(resultPageOne).hasOwnProperty('ListingItemObjects');

        expect(resultPageOne).hasOwnProperty('ListingItem');
    });

    test('Should get second item template by pagination', async () => {
        searchItemTemplates.params[0] = 2;
        const resPageSecond = await api('POST', '/api/rpc', {
            body: searchItemTemplates
        });
        resPageSecond.expectJson();
        resPageSecond.expectStatusCode(200);
        resPageSecond.expectDataRpc(keys);
        const resultPageSecond: any = resPageSecond.getBody()['result'];
        expect(resultPageSecond.length).toBe(1);
        // check itemInformation
        expect(resultPageSecond[0]['ItemInformation'].title).toBe(secondItemInformation.params[1]);
        expect(resultPageSecond[0]['ItemInformation'].shortDescription).toBe(secondItemInformation.params[2]);
        expect(resultPageSecond[0]['ItemInformation'].longDescription).toBe(secondItemInformation.params[3]);
        // check profile
        expect(resultPageSecond[0]['profileId']).toBe(secondItemInformation.params[0]);
        // check realted models
        expect(resultPageSecond).hasOwnProperty('profile');

        expect(resultPageSecond).hasOwnProperty('ItemInformation');

        expect(resultPageSecond).hasOwnProperty('PaymentInformation');

        expect(resultPageSecond).hasOwnProperty('MessagingInformation');

        expect(resultPageSecond).hasOwnProperty('ListingItemObjects');

        expect(resultPageSecond).hasOwnProperty('ListingItem');
    });

    test('Should return empty listing items array if invalid pagination', async () => {
        searchItemTemplates.params[1] = 2;
        const resEmpty = await api('POST', '/api/rpc', {
            body: searchItemTemplates
        });
        resEmpty.expectJson();
        resEmpty.expectStatusCode(200);
        const emptyResults: any = resEmpty.getBody()['result'];
        expect(emptyResults.length).toBe(0);
    });

    test('Should search listing items by category key', async () => {
        searchItemTemplates.params[0] = 1;
        searchItemTemplates.params[1] = 2;
        searchItemTemplates.params[4] = categoryKey;
        const res = await api('POST', '/api/rpc', {
            body: searchItemTemplates
        });
        res.expectJson();
        res.expectStatusCode(200);
        const searchResult: any = res.getBody()['result'];
        const category = searchResult[0].ItemInformation.ItemCategory;
        expect(searchResult.length).toBe(2);
    });

    test('Should search listing items by category id', async () => {
        searchItemTemplates.params[0] = 1;
        searchItemTemplates.params[1] = 2;
        searchItemTemplates.params[4] = categoryId;
        const res = await api('POST', '/api/rpc', {
            body: searchItemTemplates
        });
        res.expectJson();
        res.expectStatusCode(200);
        const searchResult: any = res.getBody()['result'];
        expect(searchResult.length).toBe(2);
        const category = searchResult[0].ItemInformation.itemCategoryId;
        expect(category).toBe(categoryId);
    });

    test('Should search item templates by ItemInformation title', async () => {
        searchItemTemplates.params[5] = firstItemInformation.params[1];
        const res = await api('POST', '/api/rpc', {
            body: searchItemTemplates
        });
        res.expectJson();
        res.expectStatusCode(200);
        const searchResult: any = res.getBody()['result'];

        const ItemInformation = searchResult[0].ItemInformation;
        expect(searchResult.length).toBe(1);
        expect(firstItemInformation.params[1]).toBe(ItemInformation.title);
    });

    test('Should fail because we want to search without profileId', async () => {
        searchItemTemplates.params[3] = '';
        const res = await api('POST', '/api/rpc', {
            body: searchItemTemplates
        });
        res.expectJson();
        res.expectStatusCode(400);
    });
});



