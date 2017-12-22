import { rpc, api } from './lib/api';
import { Currency } from '../../src/api/enums/Currency';
import { CryptocurrencyAddressType } from '../../src/api/enums/CryptocurrencyAddressType';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';

describe('/addItemImage', () => {
    const testUtil = new BlackBoxTestUtil();
    const method = 'additemimage';
    const keys = [
        'id', 'hash', 'updatedAt', 'createdAt'
    ];
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

    let createdTemplateId;
    let createdItemInfoId;

    beforeAll(async () => {
        await testUtil.cleanDb();
        // create item template
        const addListingItemTempRes: any = await testUtil.addData('listingitemtemplate', testDataListingItemTemplate);
        const result: any = addListingItemTempRes.getBody()['result'];
        createdTemplateId = result.id;
        createdItemInfoId = result.ItemInformation.id;
    });

    test('Should add item image for Item information with blank ItemImageData', async () => {
        // add item image
        const addDataRes: any = await rpc(method, [createdTemplateId]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(200);
        addDataRes.expectDataRpc(keys);
        const result: any = addDataRes.getBody()['result'];
        expect(createdItemInfoId).toBe(result.itemInformationId);
        expect(result.ItemImageData.dataId).toBe('');
        expect(result.ItemImageData.protocol).toBe('');
        expect(result.ItemImageData.encoding).toBe('');
        expect(result.ItemImageData.data).toBe('');
        expect(result.ItemImageData.itemImageId).toBe(result.id);
    });

    test('Should add item image with ItemImageData', async () => {
        // add item image
        const addDataRes: any = await rpc(method, [createdTemplateId, 'TEST-DATA-ID', 'TEST-PROTOCOL', 'TEST-ENCODING', 'TEST-DATA']);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(200);
        addDataRes.expectDataRpc(keys);
        const result: any = addDataRes.getBody()['result'];
        expect(createdItemInfoId).toBe(result.itemInformationId);
        expect(result.ItemImageData.dataId).toBe('TEST-DATA-ID');
        expect(result.ItemImageData.protocol).toBe('TEST-PROTOCOL');
        expect(result.ItemImageData.encoding).toBe('TEST-ENCODING');
        expect(result.ItemImageData.data).toBe('TEST-DATA');
        expect(result.ItemImageData.itemImageId).toBe(result.id);
    });
});



