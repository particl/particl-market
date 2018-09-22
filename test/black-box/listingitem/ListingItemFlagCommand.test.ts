// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemParams } from '../../../src/api/requests/params/GenerateListingItemParams';
import * as resources from 'resources';
import { Logger as LoggerType } from '../../../src/core/Logger';

describe('ListingItemFlagCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const itemCommand = Commands.ITEM_ROOT.commandName;
    const itemFlagCommand = Commands.ITEM_FLAG.commandName;

    let createdListingItem: resources.ListingItem;
    let createdNewListingItem: resources.ListingItem;

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
            generateListingItemParams    // what kind of data to generate
        ) as resources.ListingItem[];
        createdListingItem = listingItems[0];
        createdNewListingItem = listingItems[1];

    });

    test('Should fail to flag item because of invalid listing item id', async () => {
        const res = await testUtil.rpc(itemCommand, [itemFlagCommand, 0]);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('Should get empty related flagged item for the given item id, because Item not flagged yet', async () => {
        // get the ListingItem by id
        const itemRes = await testUtil.rpc(Commands.ITEM_ROOT.commandName, [Commands.ITEM_GET.commandName, createdListingItem.id]);
        const itemResult: any = itemRes.getBody()['result'];
        expect(itemResult.FlaggedItem).toMatchObject({});
    });

    test('Should flag the listing item by id', async () => {
        // add flagged item by item id
        const res = await testUtil.rpc(itemCommand, [itemFlagCommand, createdListingItem.id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.ListingItem).toBeDefined();
        expect(result.ListingItem.id).toEqual(createdListingItem.id);
        expect(result.listingItemId).toBe(createdListingItem.id);

        // get the listing item by id with related FlaggedItem
        const itemRes = await testUtil.rpc(Commands.ITEM_ROOT.commandName, [Commands.ITEM_GET.commandName, createdListingItem.id]);
        const itemResult: any = itemRes.getBody()['result'];
        expect(itemResult.FlaggedItem).toBeDefined();
        expect(itemResult.FlaggedItem.listingItemId).toBe(createdListingItem.id);
    });

    test('Should fail to flag because the listing item already been flagged by id', async () => {
        // add flagged item by item id
        const res = await testUtil.rpc(itemCommand, [itemFlagCommand, createdListingItem.id]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Item already being flagged!');
    });

    test('Should fail to flag item because of invalid listing item hash', async () => {
        const res = await testUtil.rpc(itemCommand, [itemFlagCommand, 'INVALID_HASH']);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('Should get empty related flagged item for the given item hash, because Item not flagged yet', async () => {
        // get the ListingItem by id
        const itemRes = await testUtil.rpc(Commands.ITEM_ROOT.commandName, [Commands.ITEM_GET.commandName, createdNewListingItem.hash]);
        const itemResult: any = itemRes.getBody()['result'];
        expect(itemResult.FlaggedItem).toMatchObject({});
    });

    test('Should flag the listing item by hash', async () => {
        // add flagged item by item hash
        const res = await testUtil.rpc(itemCommand, [itemFlagCommand, createdNewListingItem.hash]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.ListingItem).toBeDefined();
        expect(result.ListingItem.id).toEqual(createdNewListingItem.id);
        expect(result.listingItemId).toBe(createdNewListingItem.id);

        // get the listing item by id with related FlaggedItem
        const itemRes = await testUtil.rpc(Commands.ITEM_ROOT.commandName, [Commands.ITEM_GET.commandName, createdNewListingItem.id]);
        const itemResult: any = itemRes.getBody()['result'];
        expect(itemResult.FlaggedItem).toBeDefined();
        expect(itemResult.FlaggedItem.listingItemId).toBe(createdNewListingItem.id);
    });

    test('Should fail to flag because the listing item already been flagged by hash', async () => {
        // add flagged item by item hash
        const res = await testUtil.rpc(itemCommand, [itemFlagCommand, createdNewListingItem.hash]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Item already being flagged!');
    });
});
