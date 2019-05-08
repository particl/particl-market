// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import * as fs from 'fs';
import * as path from 'path';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { ProtocolDSN } from 'omp-lib/dist/interfaces/dsn';

describe('ListingItemTemplatePostCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtilSellerNode = new BlackBoxTestUtil(randomBoolean ? 0 : 1);
    const testUtilBuyerNode = new BlackBoxTestUtil(randomBoolean ? 1 : 0);

    // TODO: randomize posting from one of the two nodes

    const templateCommand = Commands.TEMPLATE_ROOT.commandName;
    const templatePostCommand = Commands.TEMPLATE_POST.commandName;
    const listingItemCommand = Commands.ITEM_ROOT.commandName;
    const listingItemGetCommand = Commands.ITEM_GET.commandName;

    const itemImageCommand = Commands.ITEMIMAGE_ROOT.commandName;
    const itemImageAddCommand = Commands.ITEMIMAGE_ADD.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;
    let listingItemTemplate: resources.ListingItemTemplate;
    let brokenListingItemTemplate: resources.ListingItemTemplate;

    beforeAll(async () => {
        await testUtilSellerNode.cleanDb();
        await testUtilBuyerNode.cleanDb();

        // get default profile and market
        defaultProfile = await testUtilSellerNode.getDefaultProfile();
        defaultMarket = await testUtilSellerNode.getDefaultMarket();

        // generate ListingItemTemplate
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            true,   // generateShippingDestinations
            false,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            false,  // generateListingItemObjects
            false,  // generateObjectDatas
            defaultProfile.id, // profileId
            false,   // generateListingItem
            defaultMarket.id  // marketId
        ]).toParamsArray();

        const listingItemTemplates = await testUtilSellerNode.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            2,                          // how many to generate
            true,                    // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplate[];

        listingItemTemplate = listingItemTemplates[0];
        brokenListingItemTemplate = listingItemTemplates[1];

    });

    test('Should post a ListingItem in to the default market', async () => {

        expect(listingItemTemplate.id).toBeDefined();

        const daysRetention = 4;
        const res: any = await testUtilSellerNode.rpc(templateCommand, [templatePostCommand,
            listingItemTemplate.id,
            daysRetention,
            defaultMarket.id
        ]);
        res.expectJson();
        const result: any = res.getBody()['result'];

        log.debug('result:', JSON.stringify(result, null, 2));
        res.expectStatusCode(200);

        expect(result.result).toBe('Sent.');
        expect(result.txid).toBeDefined();
        expect(result.fee).toBeGreaterThan(0);

        log.debug('==[ POSTED ITEM ]=============================================================================');
        log.debug('id: ' + listingItemTemplate.id + ', ' + listingItemTemplate.ItemInformation.title);
        log.debug('desc: ' + listingItemTemplate.ItemInformation.shortDescription);
        log.debug('category: ' + listingItemTemplate.ItemInformation.ItemCategory.id + ', '
            + listingItemTemplate.ItemInformation.ItemCategory.name);
        log.debug('hash: ' + listingItemTemplate.hash);
        log.debug('==============================================================================================');

    });

    test('Should receive MPA_LISTING_ADD message on the same sellerNode, create a ListingItem and match with the existing ListingItemTemplate', async () => {

        // wait for some time...
        await testUtilSellerNode.waitFor(5);

        const response: any = await testUtilSellerNode.rpcWaitFor(
            listingItemCommand,
            [listingItemGetCommand, listingItemTemplate.hash],
            8 * 60,
            200,
            'hash',
            listingItemTemplate.hash
        );
        response.expectJson();
        response.expectStatusCode(200);

        // make sure we got the expected result from seller node
        // -> meaning item hash was matched with the existing template hash
        const result: resources.ListingItem = response.getBody()['result'];
        expect(result.hash).toBe(listingItemTemplate.hash);
        expect(result.ListingItemTemplate.hash).toBe(listingItemTemplate.hash);

    }, 600000); // timeout to 600s

    test('Should receive MPA_LISTING_ADD message on the buyerNode and create a ListingItem', async () => {

        const response: any = await testUtilBuyerNode.rpcWaitFor(
            listingItemCommand,
            [listingItemGetCommand, listingItemTemplate.hash],
            8 * 60,
            200,
            'hash',
            listingItemTemplate.hash
        );
        response.expectJson();
        response.expectStatusCode(200);

        // make sure we got the expected result from seller node
        // -> meaning item hash was matched with the existing template hash
        const result: resources.ListingItem = response.getBody()['result'];
        expect(result.hash).toBe(listingItemTemplate.hash);

    }, 600000); // timeout to 600s

    test('Should fail to post a ListingItem due to excessive SmsgMessage size', async () => {

        expect(brokenListingItemTemplate.id).toBeDefined();

        // Upload large image to template
        const filename = path.join('test', 'testdata', 'images', 'testimage2.jpg');
        log.debug('loadImageFile(): ', filename);
        const filedata = fs.readFileSync(filename, { encoding: 'base64' });

        let res = await testUtilSellerNode.rpc(itemImageCommand, [itemImageAddCommand,
            brokenListingItemTemplate.id,
            'TEST-DATA-ID',
            ProtocolDSN.LOCAL,
            'BASE64',
            filedata,
            true        // skip resize
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        // Attempt to post listing
        const daysRetention = 4;
        res = await testUtilSellerNode.rpc(templateCommand, [templatePostCommand,
            brokenListingItemTemplate.id,
            daysRetention,
            defaultMarket.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBeDefined();
        expect(res.error.error.message).toBe('ListingItemTemplate information exceeds message size limitations');
    });

});
