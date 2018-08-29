// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { rpc, api } from '../lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/params/GenerateListingItemTemplateParams';

describe('ItemInformationGetCommand', () => {
    const testUtil = new BlackBoxTestUtil();
    const method = Commands.ITEMINFORMATION_ROOT.commandName;
    const subCommand = Commands.ITEMINFORMATION_GET.commandName;

    let createdListingItemTemplate;
    let createdListingItemTemplateId;

    beforeAll(async () => {
        await testUtil.cleanDb();
        const defaultProfile = await testUtil.getDefaultProfile();
        const profileId = defaultProfile.id;

        const defaultMarket = await testUtil.getDefaultMarket();
        const marketId = defaultMarket.id;

        // add item template
        // todo: use generate
        // create listing item
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateShippingDestinations
            false,  // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            false,  // generateListingItemObjects
            false,  // generateObjectDatas
            profileId, // profileId
            false,  // generateListingItem
            marketId   // marketId
        ]).toParamsArray();
        const addListingItemTemplates: any = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, 2, true, generateListingItemTemplateParams);
        createdListingItemTemplate = addListingItemTemplates[0];
        createdListingItemTemplateId = createdListingItemTemplate.id;
    });

    test('Should fail to get a ListingItemInformation because of a non-existent listingItemTemplateId', async () => {
        // get listingItemInformation by listingItemTemplateId
        const fakeId = 1000000000;
        const res: any = await testUtil.rpc(method, [subCommand, fakeId]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(`Entity with identifier ${fakeId} does not exist`);
    });

    test('Should get a ListingItemInformation using listingItemTemplateId', async () => {
        // get listingItemInformation by listingItemTemplateId
        const getDataRes: any = await testUtil.rpc(method, [subCommand, createdListingItemTemplateId]);

        const result: any = getDataRes.getBody()['result'];
        expect(result.title).toBe(createdListingItemTemplate.ItemInformation.title);
        expect(result.shortDescription).toBe(createdListingItemTemplate.ItemInformation.shortDescription);
        expect(result.longDescription).toBe(createdListingItemTemplate.ItemInformation.longDescription);
        expect(result.ItemCategory.id).toBe(createdListingItemTemplate.ItemInformation.itemCategoryId);
    });
});
