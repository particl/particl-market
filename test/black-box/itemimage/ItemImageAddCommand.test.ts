// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { ImageProcessing } from '../../../src/core/helpers/ImageProcessing';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { ListingItemTemplate } from '../../../src/api/models/ListingItemTemplate';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { ProtocolDSN } from 'omp-lib/dist/interfaces/dsn';

describe('ItemImageAddCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const itemImageCommand = Commands.ITEMIMAGE_ROOT.commandName;
    const itemImageAddCommand = Commands.ITEMIMAGE_ADD.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;
    let createdImage: resources.Image;

    const keys = [
        'id', 'hash', 'updatedAt', 'createdAt'
    ];

    let createdListingItemTemplateWithoutItemInformation: resources.ListingItemTemplate;
    let createdListingItemTemplate: resources.ListingItemTemplate;
    let itemImages: resources.ItemImageData[];

    beforeAll(async () => {
        await testUtil.cleanDb();

        defaultProfile = await testUtil.getDefaultProfile();
        defaultMarket = await testUtil.getDefaultMarket();

        let generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            false,   // generateItemInformation
            true,   // generateItemLocation
            false,   // generateShippingDestinations
            false,   // generateItemImages
            false,   // generatePaymentInformation
            false,   // generateEscrow
            false,   // generateItemPrice
            false,   // generateMessagingInformation
            false    // generateListingItemObjects
        ]).toParamsArray();

        let listingItemTemplate = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as ListingItemTemplate[];
        createdListingItemTemplateWithoutItemInformation = listingItemTemplate[0];

        generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            false,   // generateShippingDestinations
            true,   // generateItemImages
            false,   // generatePaymentInformation
            false,   // generateEscrow
            false,   // generateItemPrice
            false,   // generateMessagingInformation
            false    // generateListingItemObjects
        ]).toParamsArray();

        listingItemTemplate = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as ListingItemTemplate[];
        createdListingItemTemplate = listingItemTemplate[0];
    });

    test('Should fail to add ItemImage because missing ListingItemTemplate.Id', async () => {
        const res: any = await testUtil.rpc(itemImageCommand, [itemImageAddCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('ListingItemTemplate id can not be null.');
    });

    test('Should fail to add ItemImage because given ListingItemTemplate does not have ItemInformation', async () => {
        // add item image
        const res: any = await testUtil.rpc(itemImageCommand, [itemImageAddCommand, createdListingItemTemplateWithoutItemInformation.id]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Request body is not valid');
    });

    test('Should fail to add ItemImage without ItemImageData', async () => {
        // add item image
        const res: any = await testUtil.rpc(itemImageCommand, [itemImageAddCommand, createdListingItemTemplate.id]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Invalid image protocol.');
    });

    test('Should fail to add ItemImage because invalid ItemImageData protocol', async () => {
        const res: any = await testUtil.rpc(itemImageCommand,
            [itemImageAddCommand, createdListingItemTemplate.id, 'TEST-DATA-ID', 'INVALID_PROTOCOL', 'BASE64', ImageProcessing.milkcat]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Invalid image protocol.');
    });

    test('Should add ItemImage with ItemImageData', async () => {
        // add item image
        const res: any = await testUtil.rpc(itemImageCommand, [
            itemImageAddCommand,
            createdListingItemTemplate.id,
            'TEST-DATA-ID',
            ProtocolDSN.LOCAL,
            'BASE64',
            ImageProcessing.milkcatWide
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        res.expectDataRpc(keys);
        const result: any = res.getBody()['result'];
        createdImage = result;
        itemImages = result.ItemImageDatas;
        // TODO: this test is just testing that the command response is 200, its not verifying that the itemimage was actually inserted

    });

    // TODO: this is not an api test and should be moved under unit/integration tests
    test('Should return valid versions of createdImage', async () => {

        expect(itemImages.length).toBe(4);

        for ( const imageData of itemImages ) {
            const imageUrl = process.env.APP_HOST
                + (process.env.APP_PORT ? ':' + process.env.APP_PORT : '')
                + '/api/item-images/' + createdImage.id + '/' + imageData.imageVersion;
            expect(imageData.dataId).toBe(imageUrl);
            expect(imageData.protocol).toBe(ProtocolDSN.LOCAL);
            expect(imageData.encoding).toBe('BASE64');
        }
    });

});


