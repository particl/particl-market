import * as _ from 'lodash';
import { api } from './lib/api';
import { DatabaseResetCommand } from '../../src/console/DatabaseResetCommand';
import { PaymentType } from '../../src/api/enums/PaymentType';
import { EscrowType } from '../../src/api/enums/EscrowType';
import { Currency } from '../../src/api/enums/Currency';
import { CryptocurrencyAddressType } from '../../src/api/enums/CryptocurrencyAddressType';

describe('/RpcUpdateEscrow', () => {

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
            type: PaymentType.SALE,
            escrow: {
                type: EscrowType.MAD,
                ratio: {
                    buyer: 100,
                    seller: 100
                }
            },
            itemPrice: {
                currency: Currency.BITCOIN,
                basePrice: 0.0001,
                shippingPrice: {
                    domestic: 0.123,
                    international: 1.234
                },
                address: {
                    type: CryptocurrencyAddressType.NORMAL,
                    address: '1234'
                }
            }
        }
    };
    const updateEscrow = {
        method: 'updateescrow',
        params: [
            0, EscrowType.NOP, 1000, 1000
        ],
        jsonrpc: '2.0'
    };

    beforeAll(async () => {
        const command = new DatabaseResetCommand();
        await command.run();
    });

    let catKey;
    let catId;
    test('Should update Escrow by RPC', async () => {
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
        // create Escrow
        const resItemInformation = await api('POST', '/api/listing-item-templates', {
            body: testDataListingItemTemplates
        });
        resItemInformation.expectJson();
        resItemInformation.expectStatusCode(201);
        const createdId = resItemInformation.getBody()['data']['id'];

        updateEscrow.params[0] = createdId;
        const resEscrow = await api('POST', '/api/rpc', {
            body: updateEscrow
        });
        resEscrow.expectJson();
        resEscrow.expectStatusCode(200);
        resEscrow.expectDataRpc(keys);
        const result: any = resEscrow.getBody()['result'];
        expect(result.paymentInformationId).toBe(updateEscrow.params[0]);
        expect(result.type).toBe(updateEscrow.params[1]);
        expect(result.Ratio.buyer).toBe(updateEscrow.params[2]);
        expect(result.Ratio.seller).toBe(updateEscrow.params[3]);
    });
});
