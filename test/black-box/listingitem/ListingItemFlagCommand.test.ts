// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemParams } from '../../../src/api/requests/testdata/GenerateListingItemParams';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';

describe('ListingItemFlagCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtilSellerNode = new BlackBoxTestUtil(randomBoolean ? 0 : 1);  // SELLER
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 1 : 0);

    const itemCommand = Commands.ITEM_ROOT.commandName;
    const itemFlagCommand = Commands.ITEM_FLAG.commandName;
    const itemGetCommand = Commands.ITEM_GET.commandName;

    let profile: resources.Profile;
    let market: resources.Market;

    let listingItem: resources.ListingItem;


    beforeAll(async () => {
        await testUtil.cleanDb();
        await testUtilSellerNode.cleanDb();

        profile = await testUtil.getDefaultProfile();
        expect(profile.id).toBeDefined();
        market = await testUtil.getDefaultMarket(profile.id);
        expect(market.id).toBeDefined();

        const generateListingItemParams = new GenerateListingItemParams([
            true,                           // generateItemInformation
            true,                           // generateItemLocation
            true,                           // generateShippingDestinations
            false,                          // generateItemImages
            true,                           // generatePaymentInformation
            true,                           // generateEscrow
            true,                           // generateItemPrice
            true,                           // generateMessagingInformation
            true,                           // generateListingItemObjects
            false,                          // generateObjectDatas
            undefined,                      // listingItemTemplateHash
            market.Identity.address,        // seller
            undefined,                      // categoryId
            market.id                       // soldOnMarketId
        ]).toParamsArray();

        // create ListingItem for testing
        const listingItems = await testUtil.generateData(
            CreatableModel.LISTINGITEM,     // what to generate
            1,                      // how many to generate
            true,                // return model
            generateListingItemParams       // what kind of data to generate
        ) as resources.ListingItem[];
        listingItem = listingItems[0];

    });

    test('Should fail to flag ListingItem because of missing listingItemId', async () => {
        const res = await testUtil.rpc(itemCommand, [itemFlagCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('listingItemId').getMessage());
    });

    test('Should fail to flag ListingItem because of missing identityId', async () => {
        const res = await testUtil.rpc(itemCommand, [itemFlagCommand,
            listingItem.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('identityId').getMessage());
    });

    test('Should fail to flag ListingItem because of invalid listingItemId', async () => {
        const res = await testUtil.rpc(itemCommand, [itemFlagCommand,
            'INVALID',
            profile.id
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('listingItemId', 'number').getMessage());
    });

    test('Should fail to flag ListingItem because of invalid identityId (string)', async () => {
        const res = await testUtil.rpc(itemCommand, [itemFlagCommand,
            listingItem.id,
            'INVALID-PROFILE-ID'
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('identityId', 'number').getMessage());
    });

    test('Should fail to flag the ListingItem because Identity not found', async () => {
        const res = await testUtil.rpc(itemCommand, [itemFlagCommand,
            listingItem.id,
            0
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('Identity').getMessage());
    });

    test('Should fail to flag the ListingItem because ListingItem not found', async () => {
        const res = await testUtil.rpc(itemCommand, [itemFlagCommand,
            0,
            profile.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('ListingItem').getMessage());
    });

    test('Should get empty FlaggedItem relation for the ListingItem, because ListingItem is not flagged yet', async () => {
        const res = await testUtil.rpc(itemCommand, [itemGetCommand,
            listingItem.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.FlaggedItem).toMatchObject({});
    });

    test('Should flag the ListingItem using listingItemId and identityId', async () => {
        let res = await testUtil.rpc(itemCommand, [itemFlagCommand,
            listingItem.id,
            market.Identity.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        // make sure we got the expected result from posting the proposal
        const result: any = res.getBody()['result'];
        expect(result.result).toBe('Sent.');

        log.debug('==> PROPOSAL SENT.');

        res = await testUtil.rpcWaitFor(
            itemCommand,
            [itemGetCommand, listingItem.id],
            8 * 60,
            200,
            'FlaggedItem.reason',
            'This ListingItem should be removed.'
        );
        res.expectJson();
        res.expectStatusCode(200);

        const item: resources.ListingItem = res.getBody()['result'];
        // log.debug('listingItem:', JSON.stringify(listingItem, null, 2));

        expect(item.FlaggedItem.Proposal.title).toBe(listingItem.hash);
    }, 600000); // timeout to 600s

    test('Should fail to flag the ListingItem because the ListingItem has already been flagged', async () => {
        const res = await testUtil.rpc(itemCommand, [itemFlagCommand,
            listingItem.id,
            market.Identity.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('ListingItem is already flagged.');
    });

});
