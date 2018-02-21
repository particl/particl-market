import { rpc, api } from '../lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemParams } from '../../../src/api/requests/params/GenerateListingItemParams';
import { ListingItem } from 'resources';

describe('ListingItemFlagCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const method = Commands.ITEM_ROOT.commandName;
    const subCommand = Commands.ITEM_FLAG.commandName;

    let createdListingItem;
    let createdNewListingItem;

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

        // create listing item for testing
        const listingItems = await testUtil.generateData(
            CreatableModel.LISTINGITEM,     // what to generate
            2,                      // how many to generate
            true,                   // return model
        generateListingItemParams           // what kind of data to generate
        ) as ListingItem[];
        createdListingItem = listingItems[0];
        createdNewListingItem = listingItems[1];

    });

    test('Should fail to flag item because of invalid listing item id', async () => {
        const res = await rpc(method, [subCommand, 0]);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('Should get empty related flagged item for the given item id, because Item not flagged yet', async () => {
        // get the ListingItem by id
        const itemRes = await rpc(Commands.ITEM_ROOT.commandName, [Commands.ITEM_GET.commandName, createdListingItem.id]);
        const itemResult: any = itemRes.getBody()['result'];
        expect(itemResult.FlaggedItem).toMatchObject({});
    });

    test('Should flag the listing item by id', async () => {
        // add flagged item by item id
        const res = await rpc(method, [subCommand, createdListingItem.id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.ListingItem).toBeDefined();
        expect(result.ListingItem.id).toEqual(createdListingItem.id);
        expect(result.listingItemId).toBe(createdListingItem.id);

        // get the listing item by id with related FlaggedItem
        const itemRes = await rpc(Commands.ITEM_ROOT.commandName, [Commands.ITEM_GET.commandName, createdListingItem.id]);
        const itemResult: any = itemRes.getBody()['result'];
        expect(itemResult.FlaggedItem).toBeDefined();
        expect(itemResult.FlaggedItem.listingItemId).toBe(createdListingItem.id);
    });

    test('Should fail to flag because the listing item already been flagged by id', async () => {
        // add flagged item by item id
        const res = await rpc(method, [subCommand, createdListingItem.id]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Item already beeing flagged!');
    });

    test('Should fail to flag item because of invalid listing item hash', async () => {
        const res = await rpc(method, [subCommand, 'INVALID_HASH']);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('Should get empty related flagged item for the given item hash, because Item not flagged yet', async () => {
        // get the ListingItem by id
        const itemRes = await rpc(Commands.ITEM_ROOT.commandName, [Commands.ITEM_GET.commandName, createdNewListingItem.hash]);
        const itemResult: any = itemRes.getBody()['result'];
        expect(itemResult.FlaggedItem).toMatchObject({});
    });

    test('Should flag the listing item by hash', async () => {
        // add flagged item by item hash
        const res = await rpc(method, [subCommand, createdNewListingItem.hash]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.ListingItem).toBeDefined();
        expect(result.ListingItem.id).toEqual(createdNewListingItem.id);
        expect(result.listingItemId).toBe(createdNewListingItem.id);

        // get the listing item by id with related FlaggedItem
        const itemRes = await rpc(Commands.ITEM_ROOT.commandName, [Commands.ITEM_GET.commandName, createdNewListingItem.id]);
        const itemResult: any = itemRes.getBody()['result'];
        expect(itemResult.FlaggedItem).toBeDefined();
        expect(itemResult.FlaggedItem.listingItemId).toBe(createdNewListingItem.id);
    });

    test('Should fail to flag because the listing item already been flagged by hash', async () => {
        // add flagged item by item hash
        const res = await rpc(method, [subCommand, createdNewListingItem.hash]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Item already beeing flagged!');
    });
});
