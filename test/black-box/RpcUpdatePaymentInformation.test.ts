import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { EscrowType } from '../../src/api/enums/EscrowType';
import { Currency } from '../../src/api/enums/Currency';
import { CryptocurrencyAddressType } from '../../src/api/enums/CryptocurrencyAddressType';
import { PaymentType } from '../../src/api/enums/PaymentType';

describe('/UpdateItemInformation', () => {

    const testUtil = new BlackBoxTestUtil();
    const method = 'updatepaymentinformation';
    let profileId;
    const testDataListingItemTemplate = {
        profile_id: 0,
        itemInformation: {
            title: 'Item Information with Templates',
            shortDescription: 'Item short description with Templates',
            longDescription: 'Item long description with Templates',
            itemCategory: {
                key: 'cat_high_luxyry_items'
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
            itemPrice: [{
                currency: Currency.BITCOIN,
                basePrice: 0.0001,
                shippingPrice: {
                    domestic: 0.123,
                    international: 1.234
                },
                address: {
                    type: CryptocurrencyAddressType.NORMAL,
                    address: 'This is temp address.'
                }
            }]
        }
    };

    const testData = {
        type: PaymentType.FREE,
        itemPrice: [{
            currency: Currency.PARTICL,
            basePrice: 1,
            shippingPrice: {
                domestic: 2,
                international: 3
            },
            address: {
                type: CryptocurrencyAddressType.NORMAL,
                address: 'This is NEW address.'
            }
        }]
    };

    beforeAll(async () => {
        await testUtil.cleanDb();
        const addProfileRes: any = await testUtil.addData('profile', { name: 'TESTING-PROFILE-ESCROW' });
        profileId = addProfileRes.getBody()['result'].id;
    });

    test('Should update Payment-information by RPC', async () => {

        testDataListingItemTemplate.profile_id = profileId;

        const addListingItemTempRes: any = await testUtil.addData('listingitemtemplate', testDataListingItemTemplate);

        addListingItemTempRes.expectJson();
        addListingItemTempRes.expectStatusCode(200);
        const addListingItemTempResult = addListingItemTempRes.getBody()['result'];
        const createdTemplateId = addListingItemTempResult.id;
        const paymentInformationId = addListingItemTempResult.PaymentInformation.id;
        const updateDataRes: any = await rpc(method, [createdTemplateId, testData.type,
            testData.itemPrice[0].currency, testData.itemPrice[0].basePrice,
            testData.itemPrice[0].shippingPrice.domestic, testData.itemPrice[0].shippingPrice.international,
            testData.itemPrice[0].address.address]);
        updateDataRes.expectJson();
        updateDataRes.expectStatusCode(200);
        const resultUpdate: any = updateDataRes.getBody()['result'];
        expect(resultUpdate.listingItemTemplateId).toBe(createdTemplateId);
        expect(resultUpdate.type).toBe(testData.type);

        expect(resultUpdate.ItemPrice[0].currency).toBe(testData.itemPrice[0].currency);
        expect(resultUpdate.ItemPrice[0].basePrice).toBe(testData.itemPrice[0].basePrice);

        expect(resultUpdate.ItemPrice[0].ShippingPrice.domestic).toBe(testData.itemPrice[0].shippingPrice.domestic);
        expect(resultUpdate.ItemPrice[0].ShippingPrice.international).toBe(testData.itemPrice[0].shippingPrice.international);
        expect(resultUpdate.ItemPrice[0].Address.address).toBe(testData.itemPrice[0].address.address);
    });

    test('Should fail update Payment Information, payment-information is not related with item-template', async () => {
        const updateDataRes: any = await rpc(method, [0, testData.type,
            testData.itemPrice[0].currency, testData.itemPrice[0].basePrice,
            testData.itemPrice[0].shippingPrice.domestic, testData.itemPrice[0].shippingPrice.international,
            testData.itemPrice[0].address.address]);
        updateDataRes.expectJson();
        updateDataRes.expectStatusCode(404);
    });
});
