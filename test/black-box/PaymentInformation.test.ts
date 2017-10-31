import { api } from './lib/api';
import { DatabaseResetCommand } from '../../src/console/DatabaseResetCommand';
import { PaymentType } from '../../src/api/enums/PaymentType';
import { EscrowType } from '../../src/api/enums/EscrowType';
import { Currency } from '../../src/api/enums/Currency';
import { CryptocurrencyAddressType } from '../../src/api/enums/CryptocurrencyAddressType';

describe('/payment-informations', () => {

    const keys = [
        'id', 'updatedAt', 'createdAt', 'type' // , 'Related'
    ];

    // const keysWithoutRelated = [
    //    'id', 'updatedAt', 'createdAt', 'type'
    // ];

    const testData = {
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
    };

    const testDataUpdated = {
        type: PaymentType.FREE,
        escrow: {
            type: EscrowType.NOP,
            ratio: {
                buyer: 0,
                seller: 0
            }
        },
        itemPrice: {
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
        }
    };

    let createdId;
    beforeAll(async () => {
        const command = new DatabaseResetCommand();
        await command.run();
    });

    test('POST      /payment-informations        Should create a new payment information', async () => {
        const res = await api('POST', '/api/payment-informations', {
            body: testData
        });
        res.expectJson();
        res.expectStatusCode(201);
        res.expectData(keys);
        createdId = res.getData()['id'];

        const result: any = res.getData();
        expect(result.type).toBe(testData.type);
    });

    test('POST      /payment-informations        Should fail because we want to create a empty payment information', async () => {
        const res = await api('POST', '/api/payment-informations', {
            body: {}
        });
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('GET       /payment-informations        Should list payment informations with our new create one', async () => {
        const res = await api('GET', '/api/payment-informations');
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys); // keysWithoutRelated
        const data = res.getData<any[]>();
        expect(data.length).toBe(1);

        const result = data[0];
        expect(result.type).toBe(testData.type);
    });

    test('GET       /payment-informations/:id    Should return one payment information', async () => {
        const res = await api('GET', `/api/payment-informations/${createdId}`);
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys);

        const result: any = res.getData();
        expect(result.type).toBe(testData.type);
    });

    test('PUT       /payment-informations/:id    Should update the payment information', async () => {
        const res = await api('PUT', `/api/payment-informations/${createdId}`, {
            body: testDataUpdated
        });
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys);

        const result: any = res.getData();
        expect(result.type).toBe(testDataUpdated.type);
    });

    test('PUT       /payment-informations/:id    Should fail because we want to update the payment information with a invalid email', async () => {
        const res = await api('PUT', `/api/payment-informations/${createdId}`, {
            body: {
                email: 'abc'
            }
        });
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('DELETE    /payment-informations/:id    Should delete the payment information', async () => {
        const res = await api('DELETE', `/api/payment-informations/${createdId}`);
        res.expectStatusCode(200);
    });

    /**
     * 404 - NotFound Testing
     */
    test('GET       /payment-informations/:id    Should return with a 404, because we just deleted the payment information', async () => {
        const res = await api('GET', `/api/payment-informations/${createdId}`);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('DELETE    /payment-informations/:id    Should return with a 404, because we just deleted the payment information', async () => {
        const res = await api('DELETE', `/api/payment-informations/${createdId}`);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('PUT       /payment-informations/:id    Should return with a 404, because we just deleted the payment information', async () => {
        const res = await api('PUT', `/api/payment-informations/${createdId}`, {
            body: testDataUpdated
        });
        res.expectJson();
        res.expectStatusCode(404);
    });

});
