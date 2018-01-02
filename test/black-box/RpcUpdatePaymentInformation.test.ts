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
            itemPrice: {
                currency: Currency.BITCOIN,
                basePrice: 0.0001,
                shippingPrice: {
                    domestic: 0.123,
                    international: 1.234
                },
                cryptocurrencyAddress: {
                    type: CryptocurrencyAddressType.NORMAL,
                    address: 'This is temp address.'
                }
            }
        }
    };

    const testData = {
        type: PaymentType.FREE,
        itemPrice: {
            currency: Currency.PARTICL,
            basePrice: 1,
            shippingPrice: {
                domestic: 2,
                international: 3
            },
            cryptocurrencyAddress: {
                type: CryptocurrencyAddressType.NORMAL,
                address: 'This is NEW address.'
            }
        }
    };

    beforeAll(async () => {
        await testUtil.cleanDb();
        const defaultProfile = await testUtil.getDefaultProfile();
        profileId = defaultProfile.id;
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
            testData.itemPrice.currency, testData.itemPrice.basePrice,
            testData.itemPrice.shippingPrice.domestic, testData.itemPrice.shippingPrice.international,
            testData.itemPrice.cryptocurrencyAddress.address]);
        updateDataRes.expectJson();
        updateDataRes.expectStatusCode(200);
        const resultUpdate: any = updateDataRes.getBody()['result'];
        expect(resultUpdate.listingItemTemplateId).toBe(createdTemplateId);
        expect(resultUpdate.type).toBe(testData.type);

        expect(resultUpdate.ItemPrice.currency).toBe(testData.itemPrice.currency);
        expect(resultUpdate.ItemPrice.basePrice).toBe(testData.itemPrice.basePrice);

        expect(resultUpdate.ItemPrice.ShippingPrice.domestic).toBe(testData.itemPrice.shippingPrice.domestic);
        expect(resultUpdate.ItemPrice.ShippingPrice.international).toBe(testData.itemPrice.shippingPrice.international);
        expect(resultUpdate.ItemPrice.CryptocurrencyAddress.address).toBe(testData.itemPrice.cryptocurrencyAddress.address);
    });

    test('Should fail update Payment Information, payment-information is not related with item-template', async () => {
        const updateDataRes: any = await rpc(method, [0, testData.type,
            testData.itemPrice.currency, testData.itemPrice.basePrice,
            testData.itemPrice.shippingPrice.domestic, testData.itemPrice.shippingPrice.international,
            testData.itemPrice.cryptocurrencyAddress.address]);
        updateDataRes.expectJson();
        updateDataRes.expectStatusCode(404);
    });
});
