// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { ImageDataProtocolType } from '../../../src/api/enums/ImageDataProtocolType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { ImageProcessing } from '../../../src/core/helpers/ImageProcessing';
import { ListingItemTemplate } from '../../../src/api/models/ListingItemTemplate';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { ListingItemTemplateCreateRequest } from '../../../src/api/requests/ListingItemTemplateCreateRequest';
import { PaymentType } from '../../../src/api/enums/PaymentType';
import { ObjectHash } from '../../../src/core/helpers/ObjectHash';
import { HashableObjectType } from '../../../src/api/enums/HashableObjectType';
import { GenerateListingItemParams } from '../../../src/api/requests/params/GenerateListingItemParams';
import { MessageException } from '../../../src/api/exceptions/MessageException';

describe('ListingItemTemplateFeatureImageCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const itemImageCommand = Commands.ITEMIMAGE_ROOT.commandName;
    const featuredImgaeCommand = Commands.ITEMIMAGE_FEATURED.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;
    let createdListingItemTemplateWithoutItemInformation: resources.ListingItemTemplate;
    let createdListingItemTemplate: resources.ListingItemTemplate;
    let createdItemImageIdNew;
    let listingItemId;
    let listingItemTemplate;
    let listingItems;

    const keys = [
        'id', 'hash', 'updatedAt', 'createdAt'
    ];

    const testDataListingItemTemplate = {
        profile_id: 0,
        hash: '',
        itemInformation: {
            title: 'item title1',
            shortDescription: 'item short desc1',
            longDescription: 'item long desc1',
                itemCategory: {
                    key: 'cat_high_luxyry_items'
                }
        },
        paymentInformation: {
            type: PaymentType.SALE
        }
    } as ListingItemTemplateCreateRequest;

    const noListingTemplateID = [];
    const noFeaturedImage = [1];
    const WrongTypeListingTemplateID = ['string', 1];
    const wrongTypenoFeaturedImage = [1, 'string'];
    const imageIDNotFound = [1, 10];

    beforeAll(async () => {
        await testUtil.cleanDb();

        const generateListingItemParams = new GenerateListingItemParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            false,   // generateShippingDestinations
            false,   // generateItemImages
            false,   // generatePaymentInformation
            false,   // generateEscrow
            false,   // generateItemPrice
            false,   // generateMessagingInformation
            false    // generateListingItemObjects
        ]).toParamsArray();

        defaultProfile = await testUtil.getDefaultProfile();
        testDataListingItemTemplate.profile_id = defaultProfile.id;

        // set hash
        testDataListingItemTemplate.hash = ObjectHash.getHash(testDataListingItemTemplate, HashableObjectType.LISTINGITEMTEMPLATE);

        // create item template
        const addListingItemTempRes: any = await testUtil.addData(CreatableModel.LISTINGITEMTEMPLATE, testDataListingItemTemplate);
        const result: any = addListingItemTempRes;
        const createdTemplateId = result.id;
        const createdItemInfoId = result.ItemInformation.id;

        // generate listingitem
        listingItems = await testUtil.generateData(
            CreatableModel.LISTINGITEM, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemParams   // what kind of data to generate
        ) as ListingItemTemplate[];

        listingItemId = listingItems[0]['id'];

        // add item image
        const addDataRes: any = await testUtil.rpc(Commands.ITEMIMAGE_ROOT.commandName, [Commands.ITEMIMAGE_ADD.commandName,
            createdTemplateId,
            'TEST-DATA-ID',
            ImageDataProtocolType.LOCAL,
            'BASE64',
            ImageProcessing.milkcatSmall]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(200);
        addDataRes.expectDataRpc(keys);
        const createdItemImageId = addDataRes.getBody()['result'].id;
    });
    // tests if the params have been entered
    test('Should fail to set featured because missing ListingItemTemplate_ID', async () => {
        const res: any = await testUtil.rpc(itemImageCommand, [featuredImgaeCommand, noListingTemplateID]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(new InvalidParamException('state').getMessage());
    });

    test('Should fail to set featured because missing ImageID', async () => {
        const res: any = await testUtil.rpc(itemImageCommand, [featuredImgaeCommand, noFeaturedImage]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(new InvalidParamException('state').getMessage());
    });

    // tests the typeOf
    test('Should fail to set featured because ListingItemTemplate_ID is not the correct type', async () => {
        const res: any = await testUtil.rpc(itemImageCommand, [featuredImgaeCommand, WrongTypeListingTemplateID]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(new InvalidParamException('state').getMessage());
    });

    test('Should fail to set featured because ImageID is not the correct type', async () => {
        const res: any = await testUtil.rpc(itemImageCommand, [featuredImgaeCommand, wrongTypenoFeaturedImage]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(new InvalidParamException('state').getMessage());
    });

    // test if image is posted
    test('Should fail to set featured because Image is already posted', async () => {

        // set listing item id
        testDataListingItemTemplate.itemInformation.listingItemId = listingItemId;

        testDataListingItemTemplate.itemInformation.title = 'new title to give new hash';

        // set hash
        testDataListingItemTemplate.hash = await ObjectHash.getHash(testDataListingItemTemplate, HashableObjectType.LISTINGITEMTEMPLATE);

        const addListingItemTempRes: any = await testUtil.addData(CreatableModel.LISTINGITEMTEMPLATE, testDataListingItemTemplate);
        let result: any = addListingItemTempRes;
        const newCreatedTemplateId = result.id;

        // add item image
        const itemImageRes: any = await testUtil.rpc(Commands.ITEMIMAGE_ROOT.commandName, [
            Commands.ITEMIMAGE_ADD.commandName,
            newCreatedTemplateId,
            'TEST-DATA-ID',
            ImageDataProtocolType.LOCAL,
            'BASE64',
            ImageProcessing.milkcatSmall]);
        itemImageRes.expectJson();
        itemImageRes.expectStatusCode(200);
        createdItemImageIdNew = itemImageRes.getBody()['result'].id;

        const data = [newCreatedTemplateId, createdItemImageIdNew];
        result = await testUtil.rpc(itemImageCommand, [featuredImgaeCommand, ...data]);
        result.expectJson();
        result.expectStatusCode(404);
        expect(result.error.error.message).toBe('Can\'t set featured itemImage because the item has allready been posted!');
    });

    // test if image exists on template
    test('Should fail to set featured because ImageID is not found in the template', async () => {
        // set listing item id
        testDataListingItemTemplate.itemInformation.listingItemId = listingItemId;

        testDataListingItemTemplate.itemInformation.title = 'new title to give new hash';

        // set hash
        testDataListingItemTemplate.hash = await ObjectHash.getHash(testDataListingItemTemplate, HashableObjectType.LISTINGITEMTEMPLATE);

        const addListingItemTempRes: any = await testUtil.addData(CreatableModel.LISTINGITEMTEMPLATE, testDataListingItemTemplate);
        let result: any = addListingItemTempRes;
        const newCreatedTemplateId = result.id;

        // add item image
        const itemImageRes: any = await testUtil.rpc(Commands.ITEMIMAGE_ROOT.commandName, [
            Commands.ITEMIMAGE_ADD.commandName,
            newCreatedTemplateId,
            'TEST-DATA-ID',
            ImageDataProtocolType.LOCAL,
            'BASE64',
            ImageProcessing.milkcatSmall]);
        itemImageRes.expectJson();
        itemImageRes.expectStatusCode(200);
        createdItemImageIdNew = itemImageRes.getBody()['result'].id + 1;

        const data = [newCreatedTemplateId, createdItemImageIdNew];
        result = await testUtil.rpc(itemImageCommand, [featuredImgaeCommand, ...data]);
        result.expectJson();
        result.expectStatusCode(404);
        expect(result.error.error.message).toBe('Image ID doesnt exist on template');
    });
});


