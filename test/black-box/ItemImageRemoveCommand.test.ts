import { rpc, api } from './lib/api';
import { Currency } from '../../src/api/enums/Currency';
import { CryptocurrencyAddressType } from '../../src/api/enums/CryptocurrencyAddressType';
import { PaymentType } from '../../src/api/enums/PaymentType';
import { EscrowType } from '../../src/api/enums/EscrowType';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { ListingItemTemplateCreateRequest } from '../../src/api/requests/ListingItemTemplateCreateRequest';
import { ObjectHash } from '../../src/core/helpers/ObjectHash';
import { ItemImageRemoveCommand } from '../../src/api/commands/itemimage/ItemImageRemoveCommand';
import { ItemImageAddCommand } from '../../src/api/commands/itemimage/ItemImageAddCommand';
import { Logger } from '../../src/core/Logger';

describe('/ItemImageRemoveCommand', () => {
    const testUtil = new BlackBoxTestUtil();
    const itemImageService = null;
    const listingItemTemplateService = null;
    const method =  new ItemImageRemoveCommand(itemImageService, Logger).name;
    const addItemImageMethod =  new ItemImageAddCommand(itemImageService, listingItemTemplateService, Logger).name;

    const keys = [
        'id', 'hash', 'updatedAt', 'createdAt'
    ];

    const testDataListingItemTemplate = {
        profile_id: 0,
        hash: '',
        itemInformation: {
        title: 'item title1',
        shortDescription: 'item short desc1',
        longDescription: 'item long desc1',
            itemCategory: {
                key: 'cat_high_luxyry_items'
            }
        },
        paymentInformation: {
            type: PaymentType.SALE
        }
    } as ListingItemTemplateCreateRequest;

    let createdTemplateId;
    let createdItemInfoId;
    let createdItemImageId;
    let createdItemImageIdNew;
    let listingItemId;

    beforeAll(async () => {
        await testUtil.cleanDb();
        const defaultProfile = await testUtil.getDefaultProfile();
        testDataListingItemTemplate.profile_id = defaultProfile.id;

        // set hash
        testDataListingItemTemplate.hash = ObjectHash.getHash(testDataListingItemTemplate);

        // create item template
        const addListingItemTempRes: any = await testUtil.addData('listingitemtemplate', testDataListingItemTemplate);
        const result: any = addListingItemTempRes.getBody()['result'];
        createdTemplateId = result.id;
        createdItemInfoId = result.ItemInformation.id;

        // listingitem
        const listingItems = await testUtil.generateData('listingitem', 1);
        listingItemId = listingItems[0]['id'];

        // add item image
        const addDataRes: any = await rpc(addItemImageMethod, [createdTemplateId]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(200);
        addDataRes.expectDataRpc(keys);
        createdItemImageId = addDataRes.getBody()['result'].id;
    });

    test('Should fail to remove ItemImage because there is a ListingItem related to ItemInformation.', async () => {
        // set listing item id
        testDataListingItemTemplate.itemInformation.listingItemId = listingItemId;
        // set hash
        testDataListingItemTemplate.hash = ObjectHash.getHash(testDataListingItemTemplate);

        const addListingItemTempRes: any = await testUtil.addData('listingitemtemplate', testDataListingItemTemplate);
        const result: any = addListingItemTempRes.getBody()['result'];
        const newCreatedTemplateId = result.id;

        // add item image
        const itemImageRes: any = await rpc(addItemImageMethod, [newCreatedTemplateId]);
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
