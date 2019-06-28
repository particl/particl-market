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
import { ModelNotModifiableException } from '../../../src/api/exceptions/ModelNotModifiableException';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';

describe('ItemImageAddCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const itemImageCommand = Commands.ITEMIMAGE_ROOT.commandName;
    const itemImageAddCommand = Commands.ITEMIMAGE_ADD.commandName;
    const templateCommand = Commands.TEMPLATE_ROOT.commandName;
    const templatePostCommand = Commands.TEMPLATE_POST.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;
    let image: resources.Image;

    const keys = [
        'id', 'hash', 'updatedAt', 'createdAt'
    ];

    let listingItemTemplateWithoutItemInformation: resources.ListingItemTemplate;
    let listingItemTemplate: resources.ListingItemTemplate;
    let itemImages: resources.ItemImageData[];

    beforeAll(async () => {
        await testUtil.cleanDb();

        defaultProfile = await testUtil.getDefaultProfile();
        defaultMarket = await testUtil.getDefaultMarket();

        let generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            false,      // generateItemInformation
            false,      // generateItemLocation
            false,      // generateShippingDestinations
            false,      // generateItemImages
            false,      // generatePaymentInformation
            false,      // generateEscrow
            false,      // generateItemPrice
            false,      // generateMessagingInformation
            false       // generateListingItemObjects
        ]).toParamsArray();

        let listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as ListingItemTemplate[];
        listingItemTemplateWithoutItemInformation = listingItemTemplates[0];

        generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,       // generateItemInformation
            true,       // generateItemLocation
            true,       // generateShippingDestinations
            true,       // generateItemImages
            true,       // generatePaymentInformation
            true,       // generateEscrow
            true,       // generateItemPrice
            false,      // generateMessagingInformation
            false       // generateListingItemObjects
        ]).toParamsArray();

        listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as ListingItemTemplate[];
        listingItemTemplate = listingItemTemplates[0];
    });

    test('Should fail to add ItemImage because missing param listingItemTemplateId', async () => {
        const res: any = await testUtil.rpc(itemImageCommand, [itemImageAddCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('listingItemTemplateId').getMessage());
    });

    test('Should fail to add ItemImage because ListingItemTemplate missing relation to ItemInformation', async () => {
        const res: any = await testUtil.rpc(itemImageCommand, [itemImageAddCommand,
            listingItemTemplateWithoutItemInformation.id,
            'TEST-DATA-ID',
            ProtocolDSN.LOCAL,
            'BASE64',
            ImageProcessing.milkcatWide
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('ItemInformation').getMessage());
    });

    test('Should fail to add ItemImage without ItemImageData', async () => {
        const res: any = await testUtil.rpc(itemImageCommand, [itemImageAddCommand,
            listingItemTemplate.id,
            'TEST-DATA-ID',
            ProtocolDSN.LOCAL,
            'BASE64'
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('data').getMessage());
    });

    test('Should fail to add ItemImage because invalid ItemImageData protocol', async () => {
        const res: any = await testUtil.rpc(itemImageCommand, [itemImageAddCommand,
            listingItemTemplate.id,
            'TEST-DATA-ID',
            'INVALID_PROTOCOL',
            'BASE64',
            ImageProcessing.milkcat
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('protocol').getMessage());
    });

    test('Should add ItemImage with ItemImageData', async () => {
        const res: any = await testUtil.rpc(itemImageCommand, [itemImageAddCommand,
            listingItemTemplate.id,
            'TEST-DATA-ID',
            ProtocolDSN.LOCAL,
            'BASE64',
            ImageProcessing.milkcatWide
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        res.expectDataRpc(keys);
        const result: any = res.getBody()['result'];
        image = result;
        itemImages = result.ItemImageDatas;
        // TODO: this test is just testing that the command response is 200, its not verifying that the itemimage was actually inserted

    });

    test('Should not be able to add ItemImage because ListingItemTemplate is not modifiable', async () => {
        let res: any = await testUtil.rpc(templateCommand, [templatePostCommand,
            listingItemTemplate.id,
            2,
            defaultMarket.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        // make sure we got the expected result from posting the template
        const result: any = res.getBody()['result'];
        expect(result.result).toBe('Sent.');

        await testUtil.waitFor(5);

        res = await testUtil.rpc(itemImageCommand, [itemImageAddCommand,
            listingItemTemplate.id,
            'TEST-DATA-ID',
            ProtocolDSN.LOCAL,
            'BASE64',
            ImageProcessing.milkcatWide
        ]);
        res.expectJson();
        expect(res.error.error.message).toBe(new ModelNotModifiableException('ListingItemTemplate').getMessage());
    });

    // TODO: this is not an api test and should be moved under unit/integration tests
    test('Should return valid versions of image', async () => {

        expect(itemImages.length).toBe(4);

        for ( const imageData of itemImages ) {
            const imageUrl = process.env.APP_HOST
                + (process.env.APP_PORT ? ':' + process.env.APP_PORT : '')
                + '/api/item-images/' + image.id + '/' + imageData.imageVersion;
            expect(imageData.dataId).toBe(imageUrl);
            expect(imageData.protocol).toBe(ProtocolDSN.LOCAL);
            expect(imageData.encoding).toBe('BASE64');
        }
    });

});


