import * as _ from 'lodash';
import { api } from './lib/api';
import { DatabaseResetCommand } from '../../src/console/DatabaseResetCommand';

describe('/RpcUpdateItemInformation', () => {

    const keys = [
        'id', 'type', 'listingItemId', 'listingItemTemplateId', 'updatedAt', 'createdAt' // , 'Related'
    ];

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

    const testDataUpdate = {
        method: 'updatepaymentinformation',
        params: ['0', 'Payment-type-change', 'EUR', 15, 5, 7, 'new address'],
        jsonrpc: '2.0'
    };

    const testData = {
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
    test('Should update Payment-information by RPC', async () => {
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

        // update payment information
        testDataUpdate.params[0] = createdId;
        const resUpdatePaymentInformation = await api('POST', '/api/rpc', {
            body: testDataUpdate
        });
        resUpdatePaymentInformation.expectJson();
        resUpdatePaymentInformation.expectStatusCode(200);
        resUpdatePaymentInformation.expectDataRpc(keys);
        const result: any = resUpdatePaymentInformation.getBody()['result'];

        expect(result.type).toBe(testDataUpdate.params[1]);
        expect(result.listingItemTemplateId).toBe(testDataUpdate.params[0]);

        expect(result.ItemPrice.currency).toBe(testDataUpdate.params[2]);
        expect(result.ItemPrice.basePrice).toBe(testDataUpdate.params[3]);

        expect(result.ItemPrice.ShippingPrice.domestic).toBe(testDataUpdate.params[4]);
        expect(result.ItemPrice.ShippingPrice.international).toBe(testDataUpdate.params[5]);
        expect(result.ItemPrice.Address.address).toBe(testDataUpdate.params[6]);
    });

    test('Should fail update Payment Information, payment-information is not related with item-template', async () => {
        // update item information
        testDataUpdate.params[0] = 0;
        const resUpdatePaymentInformation = await api('POST', '/api/rpc', {
            body: testDataUpdate
        });
        const result: any = resUpdatePaymentInformation;
        resUpdatePaymentInformation.expectJson();
        resUpdatePaymentInformation.expectStatusCode(404);
    });
});
