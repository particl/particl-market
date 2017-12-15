import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { EscrowType } from '../../src/api/enums/EscrowType';
import { Currency } from '../../src/api/enums/Currency';
import { CryptocurrencyAddressType } from '../../src/api/enums/CryptocurrencyAddressType';
import { PaymentType } from '../../src/api/enums/PaymentType';

describe('/DestroyEscrow', () => {

    const testUtil = new BlackBoxTestUtil();
    const method = 'destroyescrow';
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

    beforeAll(async () => {
        await testUtil.cleanDb();
        const addProfileRes: any = await testUtil.addData('profile', { name: 'TESTING-PROFILE-ESCROW' });
        profileId = addProfileRes.getBody()['result'].id;
    });

    test('Should destroy Escrow by RPC', async () => {
        testDataListingItemTemplate.profile_id = profileId;

        const addListingItemTempRes: any = await testUtil.addData('listingitemtemplate', testDataListingItemTemplate);

        addListingItemTempRes.expectJson();
        addListingItemTempRes.expectStatusCode(200);
        const addListingItemTempResult = addListingItemTempRes.getBody()['result'];
        const createdTemplateId = addListingItemTempResult.id;

        const destroyDataRes: any = await rpc(method, [createdTemplateId]);
        destroyDataRes.expectJson();
        destroyDataRes.expectStatusCode(200);
    });
});
