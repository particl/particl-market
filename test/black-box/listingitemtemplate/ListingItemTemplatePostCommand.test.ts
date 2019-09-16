// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';

describe('ListingItemTemplatePostCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const templateCommand = Commands.TEMPLATE_ROOT.commandName;
    const templatePostCommand = Commands.TEMPLATE_POST.commandName;
    const templateGetCommand = Commands.TEMPLATE_GET.commandName;

    let profile: resources.Profile;
    let market: resources.Market;

    let listingItemTemplate: resources.ListingItemTemplate;
    let brokenListingItemTemplate: resources.ListingItemTemplate;

    let sent = false;
    const daysRetention = 1;

    beforeAll(async () => {
        await testUtil.cleanDb();

        // get default profile and market
        profile = await testUtil.getDefaultProfile();
        market = await testUtil.getDefaultMarket();

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
            profile.id, // profileId
            false,   // generateListingItem
            market.id  // marketId
        ]).toParamsArray();

        const listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            2,                          // how many to generate
            true,                    // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplate[];

        listingItemTemplate = listingItemTemplates[0];
        brokenListingItemTemplate = listingItemTemplates[1];

    });

    test('Should fail to post because missing listingItemTemplateId', async () => {
        const res = await testUtil.rpc(templateCommand, [templatePostCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('listingItemTemplateId').getMessage());
    });

    test('Should fail to post because missing daysRetention', async () => {
        const res = await testUtil.rpc(templateCommand, [templatePostCommand,
            listingItemTemplate.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('daysRetention').getMessage());
    });

    test('Should fail to post because missing marketId', async () => {
        const res = await testUtil.rpc(templateCommand, [templatePostCommand,
            listingItemTemplate.id,
            daysRetention
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('marketId').getMessage());
    });

    test('Should fail to add because invalid listingItemTemplateId', async () => {
        const res = await testUtil.rpc(templateCommand, [templatePostCommand,
            'INVALID',
            daysRetention,
            market.id
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('listingItemTemplateId', 'number').getMessage());
    });

    test('Should fail to add because invalid daysRetention', async () => {
        const res = await testUtil.rpc(templateCommand, [templatePostCommand,
            listingItemTemplate.id,
            'INVALID',
            market.id
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('daysRetention', 'number').getMessage());
    });

    test('Should fail to add because invalid marketId', async () => {
        const res = await testUtil.rpc(templateCommand, [templatePostCommand,
            listingItemTemplate.id,
            daysRetention,
            'INVALID'
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('marketId', 'number').getMessage());
    });

    test('Should fail to add because invalid estimateFee', async () => {
        const res = await testUtil.rpc(templateCommand, [templatePostCommand,
            listingItemTemplate.id,
            daysRetention,
            market.id,
            0
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('estimateFee', 'boolean').getMessage());
    });

    test('Should fail to add because ListingItemTemplate not found', async () => {
        const res = await testUtil.rpc(templateCommand, [templatePostCommand,
            0,
            daysRetention,
            market.id,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('ListingItemTemplate').getMessage());
    });

    test('Should fail to add because Market not found', async () => {
        const res = await testUtil.rpc(templateCommand, [templatePostCommand,
            listingItemTemplate.id,
            daysRetention,
            0,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('Market').getMessage());
    });

    test('Should post a ListingItem in to the default market', async () => {

        expect(listingItemTemplate.id).toBeDefined();
        const res: any = await testUtil.rpc(templateCommand, [templatePostCommand,
            listingItemTemplate.id,
            daysRetention,
            market.id
        ]);
        res.expectJson();

        // make sure we got the expected result from posting the template
        const result: any = res.getBody()['result'];
        log.debug('result:', JSON.stringify(result, null, 2));
        sent = result.result === 'Sent.';
        if (!sent) {
            log.debug(JSON.stringify(result, null, 2));
        }
        expect(result.result).toBe('Sent.');

        expect(result.txid).toBeDefined();
        expect(result.fee).toBeGreaterThan(0);

        log.debug('==[ POSTED ITEM ]=============================================================================');
        log.debug('id: ' + listingItemTemplate.id + ', ' + listingItemTemplate.ItemInformation.title);
        log.debug('desc: ' + listingItemTemplate.ItemInformation.shortDescription);
        log.debug('category: ' + listingItemTemplate.ItemInformation.ItemCategory.id + ', '
            + listingItemTemplate.ItemInformation.ItemCategory.name);
        log.debug('==============================================================================================');

    });

    test('Should get the updated ListingItemTemplate with the hash', async () => {
        const res: any = await testUtil.rpc(templateCommand, [templateGetCommand,
            listingItemTemplate.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        listingItemTemplate = res.getBody()['result'];

        expect(listingItemTemplate.hash).toBeDefined();
        log.debug('listingItemTemplate.hash: ', listingItemTemplate.hash);

    });
/*
    // TODO: implement these as integration tests
    test('Should receive MPA_LISTING_ADD message on the same sellerNode, create a ListingItem and match with the existing ListingItemTemplate', async () => {

        // sending should have succeeded for this test to work
        expect(sent).toBeTruthy();

        // wait for some time...
        await testUtil.waitFor(5);

        const response: any = await testUtil.rpcWaitFor(
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

        // sending should have succeeded for this test to work
        expect(sent).toBeTruthy();

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

        // sending should have succeeded for this test to work
        expect(sent).toBeTruthy();

        expect(brokenListingItemTemplate.id).toBeDefined();

        // Upload large image to template
        const filename = path.join('test', 'testdata', 'images', 'testimage2.jpg');
        log.debug('loadImageFile(): ', filename);
        const filedata = fs.readFileSync(filename, { encoding: 'base64' });

        let res = await testUtil.rpc(itemImageCommand, [itemImageAddCommand,
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
        res = await testUtil.rpc(templateCommand, [templatePostCommand,
            brokenListingItemTemplate.id,
            daysRetention,
            market.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBeDefined();
        expect(res.error.error.message).toBe('ListingItemTemplate information exceeds message size limitations');
    });
*/
});
