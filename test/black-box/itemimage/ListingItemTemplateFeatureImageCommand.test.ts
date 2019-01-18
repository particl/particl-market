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
import { ImageVersions } from '../../../src/core/helpers/ImageVersionEnumType';
import * as Jimp from 'jimp';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/params/GenerateListingItemTemplateParams';
import { ListingItemTemplate } from '../../../src/api/models/ListingItemTemplate';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { ListingItemTemplateCreateRequest } from '../../../src/api/requests/ListingItemTemplateCreateRequest';
import { PaymentType } from '../../../src/api/enums/PaymentType';
import { ObjectHash } from '../../../src/core/helpers/ObjectHash';
import { HashableObjectType } from '../../../src/api/enums/HashableObjectType';

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

        defaultProfile = await testUtil.getDefaultProfile();
        defaultMarket = await testUtil.getDefaultMarket();

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
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

//     // test if image is posted
//     test('Should fail to set featured because Image is already posted', async () => {

//         // set listing item id
//         testDataListingItemTemplate.itemInformation.listingItemId = listingItemId;

//         testDataListingItemTemplate.itemInformation.title = 'new title to give new hash';

//         // set hash
//         testDataListingItemTemplate.hash = await ObjectHash.getHash(testDataListingItemTemplate, HashableObjectType.LISTINGITEMTEMPLATE);

//         const addListingItemTempRes: any = await testUtil.addData(CreatableModel.LISTINGITEMTEMPLATE, testDataListingItemTemplate);
//         let res: any = addListingItemTempRes;
//         const newCreatedTemplateId = res.id;

//         // add item image
//         const itemImageRes: any = await testUtil.rpc(Commands.ITEMIMAGE_ROOT.commandName, [
//             Commands.ITEMIMAGE_ADD.commandName,
//             newCreatedTemplateId,
//             'TEST-DATA-ID',
//             ImageDataProtocolType.LOCAL,
//             'BASE64',
//             ImageProcessing.milkcatSmall]);
//         console.log(itemImageRes);
//         itemImageRes.expectJson();
//         itemImageRes.expectStatusCode(200);
//         createdItemImageIdNew = [1, itemImageRes.getBody()['result'].id];

//         res = await testUtil.rpc(itemImageCommand, [featuredImgaeCommand, createdItemImageIdNew]);
//         res.expectJson();
//         res.expectStatusCode(404);
//         expect(res.error.error.success).toBe(false);
//         expect(res.error.error.message).toBe('Can\'t set featured itemImage because the item has allready been posted!');
//     });

//     // test if image exists on template
//     test('Should fail to set featured because ImageID is not found in the template', async () => {
//         const res: any = await testUtil.rpc(itemImageCommand, [featuredImgaeCommand, imageIDNotFound]);
//         res.expectJson();
//         res.expectStatusCode(404);
//         expect(res.error.error.success).toBe(false);
//         expect(res.error.error.message).toBe('Image ID doesnt exist on template');
//     });
// });


