// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';

import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { MessageException } from '../../../src/api/exceptions/MessageException';
import {GenerateListingItemParams} from '../../../src/api/requests/testdata/GenerateListingItemParams';
import {ModelNotModifiableException} from '../../../src/api/exceptions/ModelNotModifiableException';

describe('ListingItemTemplateFeatureImageCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const templateCommand = Commands.TEMPLATE_ROOT.commandName;
    const featuredImageCommand = Commands.TEMPLATE_FEATURED_IMAGE.commandName;

    let listingItemTemplate: resources.ListingItemTemplate;
    let postedListingItemTemplate: resources.ListingItemTemplate;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;

    beforeAll(async () => {
        await testUtil.cleanDb();

        // get default profile and market
        defaultProfile = await testUtil.getDefaultProfile();
        defaultMarket = await testUtil.getDefaultMarket();

        let generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
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

        let listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                    // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplate[];
        listingItemTemplate = listingItemTemplates[0];

        generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
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
            true,   // generateListingItem
            defaultMarket.id  // marketId
        ]).toParamsArray();

        listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                    // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplate[];
        postedListingItemTemplate = listingItemTemplates[0];

    });

    test('Should fail to set featured because missing listingItemTemplateId', async () => {
        const res: any = await testUtil.rpc(templateCommand, [featuredImageCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('listingItemTemplateId').getMessage());
    });

    test('Should fail to set featured because missing itemImageId', async () => {
        const res: any = await testUtil.rpc(templateCommand, [featuredImageCommand,
            listingItemTemplate.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('itemImageId').getMessage());
    });

    test('Should fail to set featured because invalid listingItemTemplateId', async () => {
        const res: any = await testUtil.rpc(templateCommand, [featuredImageCommand,
            'INVALID',
            listingItemTemplate.ItemInformation.ItemImages[0].id
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('listingItemTemplateId', 'number').getMessage());
    });

    test('Should fail to set featured because invalid itemImageId', async () => {
        const res: any = await testUtil.rpc(templateCommand, [featuredImageCommand,
            listingItemTemplate.id,
            'INVALID'
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('itemImageId', 'number').getMessage());
    });

    test('Should set the featured flag on ItemImage', async () => {
        log.debug('listingItemTemplate', JSON.stringify(listingItemTemplate, null, 2));
        const res = await testUtil.rpc(templateCommand, [featuredImageCommand,
            listingItemTemplate.id,
            listingItemTemplate.ItemInformation.ItemImages[0].id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.ItemImage = res.getBody()['result'];
        expect(result.id).toBe(listingItemTemplate.ItemInformation.ItemImages[0].id);
        expect(result.featured).toBeTruthy();
    });

    test('Should fail to set featured because ListingItemTemplate is already posted', async () => {
        const res: any = await testUtil.rpc(templateCommand, [featuredImageCommand,
            postedListingItemTemplate.id,
            postedListingItemTemplate.ItemInformation.ItemImages[0].id
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new ModelNotModifiableException('ListingItemTemplate').getMessage());
    });

});


