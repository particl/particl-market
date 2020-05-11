// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';

describe('ListingItemTemplateCloneCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtilSellerNode = new BlackBoxTestUtil(randomBoolean ? 0 : 1);
    const testUtilBuyerNode = new BlackBoxTestUtil(randomBoolean ? 1 : 0);

    const templateCommand = Commands.TEMPLATE_ROOT.commandName;
    const templateCloneCommand = Commands.TEMPLATE_CLONE.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;
    let listingItemTemplate: resources.ListingItemTemplate;

    beforeAll(async () => {
        await testUtilSellerNode.cleanDb();
        await testUtilBuyerNode.cleanDb();

        // get default profile and market
        defaultProfile = await testUtilSellerNode.getDefaultProfile();
        defaultMarket = await testUtilSellerNode.getDefaultMarket();

        // generate ListingItemTemplate
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,               // generateItemInformation
            true,               // generateItemLocation
            true,               // generateShippingDestinations
            true,               // generateItemImages
            true,               // generatePaymentInformation
            true,               // generateEscrow
            true,               // generateItemPrice
            true,               // generateMessagingInformation
            true,               // generateListingItemObjects
            true,               // generateObjectDatas
            defaultProfile.id,  // profileId
            false,              // generateListingItem
            defaultMarket.id    // marketId
        ]).toParamsArray();

        const listingItemTemplates = await testUtilSellerNode.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                    // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplate[];

        listingItemTemplate = listingItemTemplates[0];

    });

    test('Should clone a ListingItemTemplate', async () => {

        expect(listingItemTemplate.id).toBeDefined();

        const res: any = await testUtilSellerNode.rpc(templateCommand, [templateCloneCommand,
            listingItemTemplate.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.ListingItemTemplate = res.getBody()['result'];
        // log.debug('clonedListingItemTemplate: ', JSON.stringify(result, null, 2));

        expect(result).hasOwnProperty('Profile');
        expect(result).hasOwnProperty('ItemInformation');
        expect(result).hasOwnProperty('PaymentInformation');
        expect(result).hasOwnProperty('MessagingInformation');
        expect(result).hasOwnProperty('ListingItemObjects');
        expect(result).hasOwnProperty('ListingItems');

        expect(result.ParentListingItemTemplate).toBeUndefined();

        expect(result.Profile.id).toBe(listingItemTemplate.Profile.id);
        expect(result.ItemInformation.title).toBe(listingItemTemplate.ItemInformation.title);
        expect(result.ItemInformation.shortDescription).toBe(listingItemTemplate.ItemInformation.shortDescription);
        expect(result.ItemInformation.longDescription).toBe(listingItemTemplate.ItemInformation.longDescription);
        expect(result.ItemInformation.ItemCategory.key).toBe(listingItemTemplate.ItemInformation.ItemCategory.key);
        expect(result.PaymentInformation.type).toBe(listingItemTemplate.PaymentInformation.type);
        expect(result.PaymentInformation.ItemPrice.currency).toBe(listingItemTemplate.PaymentInformation.ItemPrice.currency);
        expect(result.PaymentInformation.ItemPrice.basePrice).toBe(listingItemTemplate.PaymentInformation.ItemPrice.basePrice);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.domestic).toBe(listingItemTemplate.PaymentInformation.ItemPrice.ShippingPrice.domestic);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.international)
            .toBe(listingItemTemplate.PaymentInformation.ItemPrice.ShippingPrice.international);


    });

});
