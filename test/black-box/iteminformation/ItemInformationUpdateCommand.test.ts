// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { Logger as LoggerType } from '../../../src/core/Logger';
import {MissingParamException} from '../../../src/api/exceptions/MissingParamException';
import {InvalidParamException} from '../../../src/api/exceptions/InvalidParamException';
import {ModelNotFoundException} from '../../../src/api/exceptions/ModelNotFoundException';

describe('ItemInformationUpdateCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const itemInformationCommand = Commands.ITEMINFORMATION_ROOT.commandName;
    const itemInformationUpdateCommand = Commands.ITEMINFORMATION_UPDATE.commandName;

    let listingItemTemplate: resources.ListingItemTemplate;
    let itemCategory: resources.ItemCategory;

    beforeAll(async () => {
        await testUtil.cleanDb();

        const defaultProfile: resources.Profile = await testUtil.getDefaultProfile();
        const defaultMarket: resources.Market = await testUtil.getDefaultMarket();

        // create ListingItemTemplate
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            true,   // generateShippingDestinations
            false,  // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            false,  // generateListingItemObjects
            false,  // generateObjectDatas
            defaultProfile.id, // profileId
            false,  // generateListingItem
            defaultMarket.id   // marketId
        ]).toParamsArray();

        const listingItemTemplates: resources.ListingItemTemplate[] = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE,
            2,
            true,
            generateListingItemTemplateParams
        );
        listingItemTemplate = listingItemTemplates[0];

        const itemCategoryList: any = await testUtil.rpc(Commands.CATEGORY_ROOT.commandName, [Commands.CATEGORY_LIST.commandName]);
        itemCategory = itemCategoryList.getBody()['result'];

    });

    test('Should fail because missing listingItemTemplateId', async () => {
        const testData = [itemInformationUpdateCommand];

        const res: any = await testUtil.rpc(itemInformationCommand, testData);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(new MissingParamException('listingItemTemplateId').getMessage());
    });

    test('Should fail because missing title', async () => {
        const testData = [itemInformationUpdateCommand,
            listingItemTemplate.id
        ];

        const res: any = await testUtil.rpc(itemInformationCommand, testData);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(new MissingParamException('title').getMessage());
    });

    test('Should fail because missing shortDescription', async () => {
        const testData = [itemInformationUpdateCommand,
            listingItemTemplate.id,
            'new title'
        ];

        const res: any = await testUtil.rpc(itemInformationCommand, testData);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(new MissingParamException('shortDescription').getMessage());
    });

    test('Should fail because missing longDescription', async () => {
        const testData = [itemInformationUpdateCommand,
            listingItemTemplate.id,
            'new title',
            'new short description'
        ];

        const res: any = await testUtil.rpc(itemInformationCommand, testData);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(new MissingParamException('longDescription').getMessage());
    });

    test('Should fail because missing categoryId', async () => {
        const testData = [itemInformationUpdateCommand,
            listingItemTemplate.id,
            'new title',
            'new short description',
            'new long description'
        ];

        const res: any = await testUtil.rpc(itemInformationCommand, testData);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(new MissingParamException('categoryId').getMessage());
    });

    test('Should fail because invalid listingItemTemplateId', async () => {
        const testData = [itemInformationUpdateCommand,
            'INVALID', // listingItemTemplate.id,
            'new title',
            'new short description',
            'new long description',
            itemCategory.id
        ];

        const res: any = await testUtil.rpc(itemInformationCommand, testData);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(new InvalidParamException('listingItemTemplateId', 'number').getMessage());
    });

    test('Should fail because invalid title', async () => {
        const testData = [itemInformationUpdateCommand,
            listingItemTemplate.id,
            0,
            'new short description',
            'new long description',
            itemCategory.id
        ];

        const res: any = await testUtil.rpc(itemInformationCommand, testData);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(new InvalidParamException('title', 'string').getMessage());
    });

    test('Should fail because invalid shortDescription', async () => {
        const testData = [itemInformationUpdateCommand,
            listingItemTemplate.id,
            'new title',
            0,
            'new long description',
            itemCategory.id
        ];

        const res: any = await testUtil.rpc(itemInformationCommand, testData);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(new InvalidParamException('shortDescription', 'string').getMessage());
    });

    test('Should fail because invalid longDescription', async () => {
        const testData = [itemInformationUpdateCommand,
            listingItemTemplate.id,
            'new title',
            'new short description',
            0,
            itemCategory.id
        ];

        const res: any = await testUtil.rpc(itemInformationCommand, testData);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(new InvalidParamException('longDescription', 'string').getMessage());
    });

    test('Should fail because invalid categoryId', async () => {
        const testData = [itemInformationUpdateCommand,
            listingItemTemplate.id,
            'new title',
            'new short description',
            'new long description',
            'INVALID'
        ];

        const res: any = await testUtil.rpc(itemInformationCommand, testData);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(new InvalidParamException('categoryId', 'number').getMessage());
    });

    test('Should fail because missing ListingItemTemplate', async () => {
        const testData = [itemInformationUpdateCommand,
            99999999,
            'new title',
            'new short description',
            'new long description',
            itemCategory.id
        ];

        const res: any = await testUtil.rpc(itemInformationCommand, testData);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(new ModelNotFoundException('ListingItemTemplate').getMessage());
    });

    // TODO: missing ItemInformation

    test('Should fail because missing ItemCategory', async () => {
        const testData = [itemInformationUpdateCommand,
            listingItemTemplate.id,
            'new title',
            'new short description',
            'new long description',
            99999999
        ];

        const res: any = await testUtil.rpc(itemInformationCommand, testData);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(new ModelNotFoundException('ItemCategory').getMessage());
    });

    test('Should update ItemInformation', async () => {
        const testData = [itemInformationUpdateCommand,
            listingItemTemplate.id,
            'new title',
            'new short description',
            'new long description',
            itemCategory.id
        ];

        const res: any = await testUtil.rpc(itemInformationCommand, testData);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        expect(result.title).toBe(testData[2]);
        expect(result.shortDescription).toBe(testData[3]);
        expect(result.longDescription).toBe(testData[4]);
        expect(result.ItemCategory.id).toBe(testData[5]);
    });
});
