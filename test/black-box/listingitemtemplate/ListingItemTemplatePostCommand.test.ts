// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

// tslint:disable:max-line-length
import * from 'jest';
import * as resources from 'resources';
import * as fs from 'fs';
import * as path from 'path';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/params/GenerateListingItemTemplateParams';
import { ProtocolDSN } from 'omp-lib/dist/interfaces/dsn';
// tslint:enable:max-line-length

describe('ListingItemTemplatePostCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

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
        await testUtil.cleanDb();

        // get default profile and market
        defaultProfile = await testUtil.getDefaultProfile();
        defaultMarket = await testUtil.getDefaultMarket();

        // generate listingItemTemplate
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            true,   // generateShippingDestinations
            false,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            false    // generateListingItemObjects
        ]).toParamsArray();

        const listingItemTemplates: resources.ListingItemTemplate[] = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            2,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplates[];
        listingItemTemplate = listingItemTemplates[0];
        brokenListingItemTemplate = listingItemTemplates[1];
    });

    test('Should post a ListingItem in to the default marketplace', async () => {

        expect(listingItemTemplate.id).toBeDefined();

        const daysRetention = 4;
        const res: any = await testUtil.rpc(templateCommand, [templatePostCommand,
            listingItemTemplate.id,
            daysRetention,
            defaultMarket.id
        ]);
        res.expectJson();

        const result: any = res.getBody()['result'];
        if (result.result === 'Send failed.') {
            log.debug(JSON.stringify(result, null, 2));
        }

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

    test('Should receive MP_ITEM_ADD message on the same node, create a ListingItem and matched with the existing ListingItemTemplate', async () => {

        // wait for some time to make sure it's received
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

        // log.debug('listingItem: ', JSON.stringify(result, null, 2));

        expect(result.hash).toBe(listingItemTemplate.hash);
        expect(result.ListingItemTemplate.hash).toBe(listingItemTemplate.hash);

    }, 600000); // timeout to 600s

    test('Should fail to post a ListingItem due to excessive smsgmessage size', async () => {

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
            defaultMarket.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBeDefined();
        expect(res.error.error.message).toBe('Template details exceed message size limitations');
    });

});
