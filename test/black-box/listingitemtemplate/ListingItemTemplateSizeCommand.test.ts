// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import * as path from 'path';
import * as fs from 'fs';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { MessageSize } from '../../../src/api/responses/MessageSize';
import { ProtocolDSN } from 'omp-lib/dist/interfaces/dsn';

describe('ListingItemTemplatSizeCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const templateCommand = Commands.TEMPLATE_ROOT.commandName;
    const templateSizeCommand = Commands.TEMPLATE_SIZE.commandName;
    const itemImageCommand = Commands.ITEMIMAGE_ROOT.commandName;
    const itemImageAddCommand = Commands.ITEMIMAGE_ADD.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;

    let listingItemTemplate: resources.ListingItemTemplate;

    beforeAll(async () => {
        await testUtil.cleanDb();

        defaultProfile = await testUtil.getDefaultProfile();
        defaultMarket = await testUtil.getDefaultMarket();

        // generate ListingItemTemplate
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            true,   // generateShippingDestinations
            true,   // generateItemImages
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

        const listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                    // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplate[];
        listingItemTemplate = listingItemTemplates[0];

    });

    test('Should return MessageSize for ListingItemTemplate, fits', async () => {
        const res = await testUtil.rpc(templateCommand, [templateSizeCommand, listingItemTemplate.id]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: MessageSize = res.getBody()['result'];
        log.debug('MessageSize: ', JSON.stringify(result, null, 2));
        expect(result.messageData).toBeGreaterThan(0);
        expect(result.imageData).toBeGreaterThan(0);
        expect(result.spaceLeft).toBeGreaterThan(500000);
        expect(result.fits).toBe(true);
    });

    test('Should return MessageSize for ListingItemTemplate, doesnt fit', async () => {

        const filename = path.join('test', 'testdata', 'images', 'testimage2.jpg');
        log.debug('loadImageFile(): ', filename);
        const filedata = fs.readFileSync(filename, { encoding: 'base64' });

        let res = await testUtil.rpc(itemImageCommand, [itemImageAddCommand,
            listingItemTemplate.id,
            'TEST-DATA-ID',
            ProtocolDSN.LOCAL,
            'BASE64',
            filedata,
            true        // skip resize
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        let result: resources.ItemImage = res.getBody()['result'];

        log.debug('added image: ', result);

        res = await testUtil.rpc(templateCommand, [templateSizeCommand, listingItemTemplate.id]);
        res.expectJson();
        res.expectStatusCode(200);

        result = res.getBody()['result'];
        log.debug('MessageSize: ', JSON.stringify(result, null, 2));
        expect(result.messageData).toBeGreaterThan(0);
        expect(result.imageData).toBeGreaterThan(0);
        expect(result.spaceLeft).toBeLessThan(0);
        expect(result.fits).toBe(false);
    });


});
