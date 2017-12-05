import { rpc, api } from './lib/api';
import { Currency } from '../../src/api/enums/Currency';
import { CryptocurrencyAddressType } from '../../src/api/enums/CryptocurrencyAddressType';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';

describe('/removeItemImage', () => {
    const testUtil = new BlackBoxTestUtil();
    const method = 'removeitemimage';
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
            },
            listingItemId: 0
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
                address: {
                    type: CryptocurrencyAddressType.STEALTH,
                    address: 'This is temp address.'
                }
            }
        }
    };

    let createdTemplateId;
    let createdItemInfoId;
    let createdItemImageId;
    let createdItemImageIdNew;

    beforeAll(async () => {
        await testUtil.cleanDb();
        // create item template
        const addListingItemTempRes: any = await testUtil.addData('listingitemtemplate', testDataListingItemTemplate);
        const result: any = addListingItemTempRes.getBody()['result'];
        createdTemplateId = result.id;
        createdItemInfoId = result.ItemInformation.id;

        // add item image
        const addDataRes: any = await rpc('additemimage', [createdTemplateId]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(200);
        addDataRes.expectDataRpc(keys);
        createdItemImageId = addDataRes.getBody()['result'].id;
    });

    test('Should fail to remove ItemImage because there is a ListingItem related to ItemInformation.', async () => {
        // set listing item id
        testDataListingItemTemplate.itemInformation.listingItemId = 1;
        const addListingItemTempRes: any = await testUtil.addData('listingitemtemplate', testDataListingItemTemplate);
        const result: any = addListingItemTempRes.getBody()['result'];
        const newCreatedTemplateId = result.id;

        // add item image
        const itemImageRes: any = await rpc('additemimage', [newCreatedTemplateId]);
        itemImageRes.expectJson();
        itemImageRes.expectStatusCode(200);
        createdItemImageIdNew = itemImageRes.getBody()['result'].id;

        const addDataRes: any = await rpc(method, [createdItemImageIdNew]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(404);
        expect(addDataRes.error.error.message).toBe('Can\'t delete itemImage because the item has allready been posted!');
    });
    test('Should remove item images', async () => {
        // remove item image
        const addDataRes: any = await rpc(method, [createdItemImageId]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(200);
    });

    test('Should fail to remove itemImage because itemImage already been removed', async () => {
        const addDataRes: any = await rpc(method, [createdItemImageId]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(404);
    });

});
