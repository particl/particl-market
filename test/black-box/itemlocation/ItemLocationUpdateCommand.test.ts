// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { PaymentType } from '../../../src/api/enums/PaymentType';
import { ListingItemTemplateCreateRequest } from '../../../src/api/requests/ListingItemTemplateCreateRequest';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemParams } from '../../../src/api/requests/params/GenerateListingItemParams';
import { ListingItem } from 'resources';
import { HashableObjectType } from '../../../src/api/enums/HashableObjectType';
import { ObjectHash } from '../../../src/core/helpers/ObjectHash';
import { Logger as LoggerType } from '../../../src/core/Logger';

describe('ItemLocationUpdateCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const itemLocationCommand = Commands.ITEMLOCATION_ROOT.commandName;
    const itemLocationUpdateCommand = Commands.ITEMLOCATION_UPDATE.commandName;

    const testDataListingItemTemplate = {
        profile_id: 0,
        hash: '',
        itemInformation: {
            title: 'Item Information with Templates',
            shortDescription: 'Item short description with Templates',
            longDescription: 'Item long description with Templates',
            listingItemId: null,
            itemCategory: {
                key: 'cat_high_luxyry_items'
            },
            itemLocation: {
                region: 'CN',
                address: 'USA'
            }
        },
        paymentInformation: {
            type: PaymentType.SALE
        }
    } as ListingItemTemplateCreateRequest;

    const testDataUpdated = ['CN', 'USA', 'TITLE', 'TEST DESCRIPTION', 25.7, 22.77];

    let createdTemplateId;
    let createdItemInformationId;

    const generateListingItemParams = new GenerateListingItemParams([
        false,   // generateItemInformation
        false,   // generateItemLocation
        false,   // generateShippingDestinations
        false,   // generateItemImages
        false,   // generatePaymentInformation
        false,   // generateEscrow
        false,   // generateItemPrice
        false,   // generateMessagingInformation
        false    // generateListingItemObjects
    ]).toParamsArray();

    beforeAll(async () => {
        await testUtil.cleanDb();

        // profile
        const defaultProfile = await testUtil.getDefaultProfile();
        testDataListingItemTemplate.profile_id = defaultProfile.id;

        // set hash
        testDataListingItemTemplate.hash = ObjectHash.getHash(testDataListingItemTemplate, HashableObjectType.LISTINGITEMTEMPLATE);
        // create item template
        const res: any = await testUtil.addData(CreatableModel.LISTINGITEMTEMPLATE, testDataListingItemTemplate);
        const result: any = res;
        createdTemplateId = result.id;
        createdItemInformationId = result.ItemInformation.id;
        testDataUpdated.unshift(createdTemplateId);

    });

    test('Should update ItemLocation and set null location marker fields', async () => {
        // update item location
        const res: any = await testUtil.rpc(itemLocationCommand, [itemLocationUpdateCommand,
            createdTemplateId,
            testDataUpdated[1],
            testDataUpdated[2]]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.region).toBe(testDataUpdated[1]);
        expect(result.address).toBe(testDataUpdated[2]);
        expect(result.itemInformationId).toBe(createdItemInformationId);
    });

    test('Should update ItemLocation', async () => {
        // update item location
        const testDataUpdated2 = testDataUpdated;
        testDataUpdated2.unshift(itemLocationUpdateCommand);
        const res: any = await testUtil.rpc(itemLocationCommand, testDataUpdated2);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.region).toBe(testDataUpdated2[2]);
        expect(result.address).toBe(testDataUpdated2[3]);
        expect(result.itemInformationId).toBe(createdItemInformationId);
        expect(result.LocationMarker.markerTitle).toBe(testDataUpdated2[4]);
        expect(result.LocationMarker.markerText).toBe(testDataUpdated2[5]);
        expect(result.LocationMarker.lat).toBe(testDataUpdated2[6]);
        expect(result.LocationMarker.lng).toBe(testDataUpdated2[7]);
    });

    test('Should fail because we want to update without Country code', async () => {
        const res: any = await testUtil.rpc(itemLocationCommand, [itemLocationUpdateCommand, createdTemplateId]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Country code can\'t be blank.');
    });

    test('Should fail because we want to update without address not valid', async () => {
        const res: any = await testUtil.rpc(itemLocationCommand, [itemLocationUpdateCommand, createdTemplateId, 'USA']);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(`Country code USA was not found!`);
    });

    // ItemLocation cannot be updated if there's a ListingItem related to ItemInformations ItemLocation. (the item has allready been posted)
    test('Should not update ItemLocation because ItemInformation is related with ListingItem', async () => {
        // generate listing item
        const listingItems = await testUtil.generateData(
            CreatableModel.LISTINGITEM, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemParams   // what kind of data to generate
        ) as ListingItem[];

        const listingItemId = listingItems[0]['id'];
        // set listing item id in item information
        testDataListingItemTemplate.itemInformation.listingItemId = listingItemId;

        // set hash
        testDataListingItemTemplate.itemInformation.title = 'New title';
        testDataListingItemTemplate.hash = ObjectHash.getHash(testDataListingItemTemplate, HashableObjectType.LISTINGITEMTEMPLATE);

        // create new item template
        const newListingItemTemplate = await testUtil.addData(CreatableModel.LISTINGITEMTEMPLATE, testDataListingItemTemplate);
        const newTemplateId = newListingItemTemplate.id;

        // update item location
        const res: any = await testUtil.rpc(itemLocationCommand, [itemLocationUpdateCommand,
            newTemplateId,
            'China',
            'TEST ADDRESS',
            'TEST TITLE',
            'TEST DESC',
            55.6,
            60.8
        ]);

        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('ItemLocation cannot be updated because the item has allready been posted!');
    });

});
