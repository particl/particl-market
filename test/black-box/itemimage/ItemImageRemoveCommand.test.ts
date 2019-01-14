// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { PaymentType } from '../../../src/api/enums/PaymentType';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { ListingItemTemplateCreateRequest } from '../../../src/api/requests/ListingItemTemplateCreateRequest';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemParams } from '../../../src/api/requests/params/GenerateListingItemParams';
import { ListingItemTemplate } from 'resources';
import { ImageDataProtocolType } from '../../../src/api/enums/ImageDataProtocolType';
import { ImageProcessing } from '../../../src/core/helpers/ImageProcessing';
import { HashableObjectType } from '../../../src/api/enums/HashableObjectType';
import { ObjectHash } from '../../../src/core/helpers/ObjectHash';
import {Logger as LoggerType} from '../../../src/core/Logger';

describe('ItemImageRemoveCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const itemImageCommand = Commands.ITEMIMAGE_ROOT.commandName;
    const itemImageRemoveCommand = Commands.ITEMIMAGE_REMOVE.commandName;

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

    let createdTemplateId;
    let createdItemInfoId;
    let createdItemImageId;
    let createdItemImageIdNew;
    let listingItemId;

    beforeAll(async () => {
        await testUtil.cleanDb();

        const generateListingItemParams = new GenerateListingItemParams([
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

        const defaultProfile = await testUtil.getDefaultProfile();
        testDataListingItemTemplate.profile_id = defaultProfile.id;

        // set hash
        testDataListingItemTemplate.hash = ObjectHash.getHash(testDataListingItemTemplate, HashableObjectType.LISTINGITEMTEMPLATE);

        // create item template
        const addListingItemTempRes: any = await testUtil.addData(CreatableModel.LISTINGITEMTEMPLATE, testDataListingItemTemplate);
        const result: any = addListingItemTempRes;
        createdTemplateId = result.id;
        createdItemInfoId = result.ItemInformation.id;

        // generate listingitem
        const listingItems = await testUtil.generateData(
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
        createdItemImageId = addDataRes.getBody()['result'].id;

    });

    test('Should fail to remove ItemImage because no args', async () => {
        const result: any = await testUtil.rpc(itemImageCommand, [itemImageRemoveCommand]);
        result.expectJson();
        result.expectStatusCode(404);
        expect(result.error.error.success).toBe(false);
        expect(result.error.error.message).toBe('Requires arg: ItemImageId');
    });

    test('Should fail to remove ItemImage because there is a ListingItem related to ItemInformation.', async () => {

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

        result = await testUtil.rpc(itemImageCommand, [itemImageRemoveCommand, createdItemImageIdNew]);
        result.expectJson();
        result.expectStatusCode(404);
        expect(result.error.error.message).toBe('Can\'t delete itemImage because the item has allready been posted!');
    });

    test('Should remove ItemImage', async () => {
        // remove item image
        const result: any = await testUtil.rpc(itemImageCommand, [itemImageRemoveCommand, createdItemImageId]);
        result.expectJson();
        result.expectStatusCode(200);
    });

    test('Should fail to remove ItemImage because itemImage already been removed', async () => {
        const result: any = await testUtil.rpc(itemImageCommand, [itemImageRemoveCommand, createdItemImageId]);
        result.expectJson();
        result.expectStatusCode(404);
    });

});
