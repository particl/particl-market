import { rpc, api } from './lib/api';
import { Currency } from '../../src/api/enums/Currency';
import { CryptocurrencyAddressType } from '../../src/api/enums/CryptocurrencyAddressType';
import { PaymentType } from '../../src/api/enums/PaymentType';
import { EscrowType } from '../../src/api/enums/EscrowType';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';

describe('/removeItemLocation', () => {
    const testUtil = new BlackBoxTestUtil();
    const method = 'removeitemlocation';

    const testDataListingItemTemplate = {
        profile_id: 0,
        itemInformation: {
            title: 'Item Information with Templates First',
            shortDescription: 'Item short description with Templates First',
            longDescription: 'Item long description with Templates First',
            itemCategory: {
                key: 'cat_high_luxyry_items'
            },
            listingItemId: null
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

    let createdTemplateId;
    let createdlistingitemId;

    beforeAll(async () => {
        await testUtil.cleanDb();
        // create profile
        const defaultProfile = await testUtil.getDefaultProfile();
        testDataListingItemTemplate.profile_id = defaultProfile.id;

        // create item template
        const addListingItemTempRes: any = await testUtil.addData('listingitemtemplate', testDataListingItemTemplate);
        createdTemplateId = addListingItemTempRes.getBody()['result'].id;

        // create listing item
        const listingItems = await testUtil.generateData('listingitem', 1);
        createdlistingitemId = listingItems[0]['id'];

    });

    test('Should not remove item location because item information is related with listing item', async () => {
        // set listing item id in item information
        testDataListingItemTemplate.itemInformation.listingItemId = createdlistingitemId;

        // create new item template
        const newListingItemTemplate = await testUtil.addData('listingitemtemplate', testDataListingItemTemplate);
        const newTemplateId = newListingItemTemplate.getBody()['result'].id;

        // remove item location
        const addDataRes: any = await rpc(method, [newTemplateId]);

        addDataRes.expectJson();
        addDataRes.expectStatusCode(404);
        expect(addDataRes.error.error.success).toBe(false);
        expect(addDataRes.error.error.message).toBe('Item Information or Item Location with the listing template id=' + newTemplateId + ' was not found!');
    });

    test('Should remove item location', async () => {
        // create new item template
        const listingitemtemplate = await testUtil.generateData('listingitemtemplate', 1);
        const createdTemplateId2 = listingitemtemplate[0]['id'];
        // remove item location
        const addDataRes: any = await rpc(method, [createdTemplateId2]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(200);
        const result: any = addDataRes.getBody();
    });

    test('Should fail remove item location because item location already removed', async () => {
        // remove item location
        const addDataRes: any = await rpc(method, [createdTemplateId]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(404);
    });
});


