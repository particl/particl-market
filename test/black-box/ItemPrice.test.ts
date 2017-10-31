import { api } from './lib/api';
import { DatabaseResetCommand } from '../../src/console/DatabaseResetCommand';
import { Currency } from '../../src/api/enums/Currency';
import { CryptocurrencyAddressType } from '../../src/api/enums/CryptocurrencyAddressType';

describe('/item-prices', () => {

    const keys = [
        'currency', 'basePrice', 'updatedAt', 'createdAt', 'id', /*'paymentInformationId', */'ShippingPrice', 'Address'
    ];

    const keysWithoutRelated = [
        'currency', 'basePrice', 'updatedAt', 'createdAt', 'id'/*, 'paymentInformationId'*/
    ];

    const testData = {
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
    };

    const testDataUpdated = {
        currency: Currency.PARTICL,
        basePrice: 0.002,
        shippingPrice: {
            domestic: 1.234,
            international: 2.345
        },
        address: {
            type: CryptocurrencyAddressType.STEALTH,
            address: '4567'
        }
    };

    let createdId;
    beforeAll(async () => {
        const command = new DatabaseResetCommand();
        await command.run();
    });

    test('POST      /item-prices        Should create a new item price', async () => {
        const res = await api('POST', '/api/item-prices', {
            body: testData
        });
        res.expectJson();
        res.expectStatusCode(201);
        res.expectData(keys);
        createdId = res.getData()['id'];

        const result: any = res.getData();
        expect(result.currency).toBe(testData.currency);
        expect(result.basePrice).toBe(testData.basePrice);
        expect(result.ShippingPrice.domestic).toBe(testData.shippingPrice.domestic);
        expect(result.ShippingPrice.international).toBe(testData.shippingPrice.international);
        expect(result.Address.type).toBe(testData.address.type);
        expect(result.Address.address).toBe(testData.address.address);

    });

    test('POST      /item-prices        Should fail because we want to create a empty item price', async () => {
        const res = await api('POST', '/api/item-prices', {
            body: {}
        });
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('GET       /item-prices        Should list item prices with our new create one', async () => {
        const res = await api('GET', '/api/item-prices');
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keysWithoutRelated);
        const data = res.getData<any[]>();
        expect(data.length).toBe(1);

        const result = data[0];
        expect(result.currency).toBe(testData.currency);
        expect(result.basePrice).toBe(testData.basePrice);
        expect(result.ShippingPrice).toBe(undefined); // doesnt fetch related
        expect(result.Address).toBe(undefined); // doesnt fetch related

    });

    test('GET       /item-prices/:id    Should return one item price', async () => {
        const res = await api('GET', `/api/item-prices/${createdId}`);
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys);

        const result: any = res.getData();
        expect(result.currency).toBe(testData.currency);
        expect(result.basePrice).toBe(testData.basePrice);
        expect(result.ShippingPrice.domestic).toBe(testData.shippingPrice.domestic);
        expect(result.ShippingPrice.international).toBe(testData.shippingPrice.international);
        expect(result.Address.type).toBe(testData.address.type);
        expect(result.Address.address).toBe(testData.address.address);
    });

    test('PUT       /item-prices/:id    Should update the item price', async () => {
        const res = await api('PUT', `/api/item-prices/${createdId}`, {
            body: testDataUpdated
        });
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys);

        const result: any = res.getData();
        expect(result.currency).toBe(testDataUpdated.currency);
        expect(result.basePrice).toBe(testDataUpdated.basePrice);
        expect(result.ShippingPrice.domestic).toBe(testDataUpdated.shippingPrice.domestic);
        expect(result.ShippingPrice.international).toBe(testDataUpdated.shippingPrice.international);
        expect(result.Address.type).toBe(testDataUpdated.address.type);
        expect(result.Address.address).toBe(testDataUpdated.address.address);
    });

    test('PUT       /item-prices/:id    Should fail because we want to update the item price with a invalid email', async () => {
        const res = await api('PUT', `/api/item-prices/${createdId}`, {
            body: {
                email: 'abc'
            }
        });
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('DELETE    /item-prices/:id    Should delete the item price', async () => {
        const res = await api('DELETE', `/api/item-prices/${createdId}`);
        res.expectStatusCode(200);
    });

    /**
     * 404 - NotFound Testing
     */
    test('GET       /item-prices/:id    Should return with a 404, because we just deleted the item price', async () => {
        const res = await api('GET', `/api/item-prices/${createdId}`);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('DELETE    /item-prices/:id    Should return with a 404, because we just deleted the item price', async () => {
        const res = await api('DELETE', `/api/item-prices/${createdId}`);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('PUT       /item-prices/:id    Should return with a 404, because we just deleted the item price', async () => {
        const res = await api('PUT', `/api/item-prices/${createdId}`, {
            body: testDataUpdated
        });
        res.expectJson();
        res.expectStatusCode(404);
    });

});
