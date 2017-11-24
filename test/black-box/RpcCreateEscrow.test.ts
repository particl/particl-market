import * as _ from 'lodash';
import { api } from './lib/api';
import { DatabaseResetCommand } from '../../src/console/DatabaseResetCommand';

describe('/RpcCreateEscrow', () => {

    const keys = [
        'id', 'type', 'updatedAt', 'createdAt' // , 'Related'
    ];

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
    const testDataListingItemTemplates = {
        profile_id: 0,
        itemInformation: {
            title: 'Item Information with Templates',
            shortDescription: 'Item short description with Templates',
            longDescription: 'Item long description with Templates',
            itemCategory: {
                key: '0'
            }
        },
        paymentInformation: {
            type: 'payment',
            itemPrice: {
                currency: 'USD',
                basePrice: 12,
                shippingPrice: {
                    domestic: 5,
                    international: 7
                },
                address: {
                    type: 'address-type',
                    address: 'This is temp address.'
                }
            }
        }
    };
    const testDataEscrow = {
        method: 'createescrow',
        params: [
            0, 'MAD', 100, 100
        ],
        jsonrpc: '2.0'
    };

    beforeAll(async () => {
        const command = new DatabaseResetCommand();
        await command.run();
    });

    let catKey;
    let catId;
    test('Should Create new Escrow by RPC', async () => {
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

        testDataListingItemTemplates.itemInformation.itemCategory.key = catKey;
        // create payment-information
        const resItemInformation = await api('POST', '/api/listing-item-templates', {
            body: testDataListingItemTemplates
        });
        resItemInformation.expectJson();
        resItemInformation.expectStatusCode(201);
        const createdId = resItemInformation.getBody()['data']['id'];

        testDataEscrow.params[0] = createdId;
        const resEscrow = await api('POST', '/api/rpc', {
            body: testDataEscrow
        });
        resEscrow.expectJson();
        resEscrow.expectStatusCode(200);
        resEscrow.expectDataRpc(keys);
        const result: any = resEscrow.getBody()['result'];
        expect(result.paymentInformationId).toBe(testDataEscrow.params[0]);
        expect(result.type).toBe(testDataEscrow.params[1]);
        expect(result.Ratio.buyer).toBe(testDataEscrow.params[2]);
        expect(result.Ratio.seller).toBe(testDataEscrow.params[3]);
    });

    test('Should fail create Escrow, payment-information is not related with item-template', async () => {
        delete testDataListingItemTemplates.itemInformation;
        delete testDataListingItemTemplates.paymentInformation;
        // create listing-template-id
        const resItemInformation = await api('POST', '/api/listing-item-templates', {
            body: testDataListingItemTemplates
        });
        resItemInformation.expectJson();
        resItemInformation.expectStatusCode(201);
        const createdId = resItemInformation.getBody()['data']['id'];

        // create escrow
        testDataEscrow.params[0] = createdId;
        const resEscrow = await api('POST', '/api/rpc', {
            body: testDataEscrow
        });
        const result: any = resEscrow;
        resEscrow.expectJson();
        resEscrow.expectStatusCode(404);
    });
});
