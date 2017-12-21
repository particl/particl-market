import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { EscrowType } from '../../src/api/enums/EscrowType';
import { Currency } from '../../src/api/enums/Currency';
import { CryptocurrencyAddressType } from '../../src/api/enums/CryptocurrencyAddressType';

describe('/CreateEscrow', () => {

    const testUtil = new BlackBoxTestUtil();
    const method = 'createescrow';
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
            type: 'payment',
            itemPrice: {
                currency: Currency.PARTICL,
                basePrice: 12,
                shippingPrice: {
                    domestic: 5,
                    international: 7
                },
                cryptocurrencyAddress: {
                    type: CryptocurrencyAddressType.STEALTH,
                    address: 'This is temp address.'
                }
            }
        }
    };
    const testData = {
        type: EscrowType.MAD,
        ratio: {
            buyer: 100,
            seller: 100
        }
    };

    beforeAll(async () => {
        await testUtil.cleanDb();
        const addProfileRes: any = await testUtil.addData('profile', { name: 'TESTING-PROFILE-ESCROW' });
        profileId = addProfileRes.getBody()['result'].id;
    });

    test('Should Create new Escrow by RPC', async () => {

        testDataListingItemTemplate.profile_id = profileId;

        const addListingItemTempRes: any = await testUtil.addData('listingitemtemplate', testDataListingItemTemplate);

        addListingItemTempRes.expectJson();
        addListingItemTempRes.expectStatusCode(200);
        const addListingItemTempResult = addListingItemTempRes.getBody()['result'];
        const createdTemplateId = addListingItemTempResult.id;
        const paymentInformationId = addListingItemTempResult.PaymentInformation.id;
        const addDataRes: any = await rpc(method, [createdTemplateId, testData.type, testData.ratio.buyer, testData.ratio.seller]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(200);

        const result: any = addDataRes.getBody()['result'];
        expect(result.paymentInformationId).toBe(paymentInformationId);
        expect(result.type).toBe(testData.type);
        expect(result.Ratio.buyer).toBe(testData.ratio.buyer);
        expect(result.Ratio.seller).toBe(testData.ratio.seller);
    });

    test('Should fail create Escrow, payment-information is not related with item-template', async () => {

        delete testDataListingItemTemplate.itemInformation;
        delete testDataListingItemTemplate.paymentInformation;

        const addListingItemTempRes: any = await testUtil.addData('listingitemtemplate', testDataListingItemTemplate);
        const createdTemplateId = addListingItemTempRes.getBody()['result'].id;

        // create escrow
        const addDataRes: any = await rpc(method, [createdTemplateId, testData.type, testData.ratio.buyer, testData.ratio.seller]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(404);
    });
});
