import { rpc, api } from './lib/api';
import { PaymentType } from '../../src/api/enums/PaymentType';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { ListingItemTemplateCreateRequest } from '../../src/api/requests/ListingItemTemplateCreateRequest';
import { ObjectHash } from '../../src/core/helpers/ObjectHash';
import { ItemImageAddCommand } from '../../src/api/commands/itemimage/ItemImageAddCommand';
import { Commands } from '../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { GenerateListingItemParams } from '../../src/api/requests/params/GenerateListingItemParams';
import { ListingItemTemplate } from 'resources';

describe('/ItemImageRemoveCommand', () => {
    const testUtil = new BlackBoxTestUtil();
    const method = Commands.ITEMIMAGE_ROOT.commandName;
    const subCommand = Commands.ITEMIMAGE_REMOVE.commandName;

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

        const generateListingItemParams = new GenerateListingItemParams([
            false,   // generateItemInformation
            false,   // generateShippingDestinations
            false,   // generateItemImages
            false,   // generatePaymentInformation
            false,   // generateEscrow
            false,   // generateItemPrice
            false,   // generateMessagingInformation
            false    // generateListingItemObjects
        ]).toParamsArray();

        const defaultProfile = await testUtil.getDefaultProfile();
        testDataListingItemTemplate.profile_id = defaultProfile.id;

        // set hash
        testDataListingItemTemplate.hash = ObjectHash.getHash(testDataListingItemTemplate);

        // create item template
        const addListingItemTempRes: any = await testUtil.addData(CreatableModel.LISTINGITEMTEMPLATE, testDataListingItemTemplate);
        const result: any = addListingItemTempRes;
        createdTemplateId = result.id;
        createdItemInfoId = result.ItemInformation.id;

        // generate listingitem
        const listingItems = await testUtil.generateData(
            CreatableModel.LISTINGITEM, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemParams   // what kind of data to generate
        ) as ListingItemTemplate[];

        listingItemId = listingItems[0]['id'];

        // add item image
        const addDataRes: any = await rpc(Commands.ITEMIMAGE_ROOT.commandName, [Commands.ITEMIMAGE_ADD.commandName, createdTemplateId]);
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

        const addListingItemTempRes: any = await testUtil.addData(CreatableModel.LISTINGITEMTEMPLATE, testDataListingItemTemplate);
        const result: any = addListingItemTempRes;
        const newCreatedTemplateId = result.id;

        // add item image
        const itemImageRes: any = await rpc(Commands.ITEMIMAGE_ROOT.commandName, [Commands.ITEMIMAGE_ADD.commandName, newCreatedTemplateId]);
        itemImageRes.expectJson();
        itemImageRes.expectStatusCode(200);
        createdItemImageIdNew = itemImageRes.getBody()['result'].id;
        const addDataRes: any = await rpc(method, [subCommand, createdItemImageIdNew]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(404);
        expect(addDataRes.error.error.message).toBe('Can\'t delete itemImage because the item has allready been posted!');
    });

    test('Should remove item images', async () => {
        // remove item image
        const addDataRes: any = await rpc(method, [subCommand, createdItemImageId]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(200);
    });

    test('Should fail to remove itemImage because itemImage already been removed', async () => {
        const addDataRes: any = await rpc(method, [subCommand, createdItemImageId]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(404);
    });

});
