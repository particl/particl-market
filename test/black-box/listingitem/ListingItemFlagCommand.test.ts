// Copyright (c) 2017-2019, The Particl Market developers
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
    const itemGetCommand = Commands.ITEM_GET.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;

    let createdListingItem1: resources.ListingItem;
    let createdListingItem2: resources.ListingItem;

    const invalidListingItemHash = 0;
    const invalidListingItemHashNotFound = 'INVALID-HASH';
    const invalidProfileId = 'INVALID-PROFILE-ID';
    const invalidProfileIdNotFound = 0;

    beforeAll(async () => {
        await testUtil.cleanDb();

        // get default profile and market
        defaultProfile = await testUtil.getDefaultProfile();
        defaultMarket = await testUtil.getDefaultMarket();

        const generateListingItemParams = new GenerateListingItemParams([
            true,                       // generateItemInformation
            true,                       // generateItemLocation
            true,                       // generateShippingDestinations
            false,                      // generateItemImages
            true,                       // generatePaymentInformation
            true,                       // generateEscrow
            true,                       // generateItemPrice
            true,                       // generateMessagingInformation
            true,                       // generateListingItemObjects
            false,                      // generateObjectDatas
            null,                       // listingItemTemplateHash
            defaultProfile.address,     // seller
            null                        // categoryId
        ]).toParamsArray();

        // create listing item for testing
        const listingItems = await testUtil.generateData(
            CreatableModel.LISTINGITEM,     // what to generate
            2,                      // how many to generate
            true,                   // return model
            generateListingItemParams    // what kind of data to generate
        ) as resources.ListingItem[];
        createdListingItem1 = listingItems[0];
        createdListingItem2 = listingItems[1];

    });

    test('Should fail to flag ListingItem because of missing listingItemHash', async () => {
        const res = await testUtil.rpc(itemCommand, [itemFlagCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('Missing listingItemHash.');
    });

    test('Should fail to flag ListingItem because of missing profileId', async () => {
        const res = await testUtil.rpc(itemCommand, [itemFlagCommand,
            createdListingItem1.hash
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('Missing profileId.');
    });

    test('Should fail to flag ListingItem because of invalid listingItemHash (number)', async () => {
        const res = await testUtil.rpc(itemCommand, [itemFlagCommand,
            invalidListingItemHash,
            defaultProfile.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(`Invalid listingItemHash.`);
    });

    test('Should fail to flag ListingItem because of invalid profileId (string)', async () => {
        const res = await testUtil.rpc(itemCommand, [itemFlagCommand,
            createdListingItem1.hash,
            invalidProfileId
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(`profileId needs to be a number.`);
    });

    test('Should fail to flag the ListingItem because of invalid profileId (not found)', async () => {
        const res = await testUtil.rpc(itemCommand, [itemFlagCommand,
            createdListingItem1.hash,
            invalidProfileIdNotFound
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(`Profile not found.`);
    });

    test('Should fail to flag the ListingItem because of invalid listingItemHash (not found)', async () => {
        const res = await testUtil.rpc(itemCommand, [itemFlagCommand,
            invalidListingItemHashNotFound,
            defaultProfile.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(`ListingItem not found.`);
    });

    test('Should get empty FlaggedItem relation for the ListingItem, because ListingItem is not flagged yet', async () => {
        const res = await testUtil.rpc(itemCommand, [itemGetCommand, createdListingItem1.id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.FlaggedItem).toMatchObject({});
    });

    test('Should flag the ListingItem by listingItemHash and profileId', async () => {
        let res = await testUtil.rpc(itemCommand, [itemFlagCommand,
            createdListingItem1.hash,
            defaultProfile.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        // make sure we got the expected result from posting the proposal
        const result: any = res.getBody()['result'];
        expect(result.result).toBe('Sent.');

        log.debug('==> PROPOSAL SENT.');

        res = await testUtil.rpcWaitFor(
            itemCommand,
            [itemGetCommand, createdListingItem1.id],
            8 * 60,
            200,
            'FlaggedItem.reason',
            'This ListingItem should be removed.'
        );
        res.expectJson();
        res.expectStatusCode(200);

        const listingItem: resources.ListingItem = res.getBody()['result'];
        // log.debug('listingItem:', JSON.stringify(listingItem, null, 2));

        expect(listingItem.FlaggedItem.Proposal.title).toBe(createdListingItem1.hash);
    }, 600000); // timeout to 600s

    test('Should fail to flag the ListingItem because the ListingItem has already been flagged', async () => {
        // add flagged item by item id
        const res = await testUtil.rpc(itemCommand, [itemFlagCommand,
            createdListingItem1.hash,
            defaultProfile.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('Item is already flagged.');
    });

});
