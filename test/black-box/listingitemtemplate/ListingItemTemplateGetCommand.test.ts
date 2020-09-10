// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';


describe('ListingItemTemplateGetCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const templateCommand = Commands.TEMPLATE_ROOT.commandName;
    const templateGetCommand = Commands.TEMPLATE_GET.commandName;

    let profile: resources.Profile;
    let market: resources.Market;
    let listingItemTemplate: resources.ListingItemTemplate;
    let randomCategory: resources.ItemCategory;


    beforeAll(async () => {
        await testUtil.cleanDb();

        // get default profile and market
        profile = await testUtil.getDefaultProfile();
        market = await testUtil.getDefaultMarket(profile.id);

        randomCategory = await testUtil.getRandomCategory();

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,                           // generateItemInformation
            true,                           // generateItemLocation
            true,                           // generateShippingDestinations
            true,                           // generateImages
            true,                           // generatePaymentInformation
            true,                           // generateEscrow
            true,                           // generateItemPrice
            true,                           // generateMessagingInformation
            false,                          // generateListingItemObjects
            false,                          // generateObjectDatas
            profile.id,                     // profileId
            true,                           // generateListingItem
            market.id,                      // soldOnMarketId
            randomCategory.id               // categoryId
        ]).toParamsArray();

        const listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplate[];
        listingItemTemplate = listingItemTemplates[0];

    });

    test('Should fail because missing listingItemTemplateId', async () => {
        const res: any = await testUtil.rpc(templateCommand, [templateGetCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('listingItemTemplateId').getMessage());
    });


    test('Should fail because invalid listingItemTemplateId', async () => {
        const res: any = await testUtil.rpc(templateCommand, [templateGetCommand,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('listingItemTemplateId', 'number').getMessage());
    });


    test('Should return by listingItemTemplateId', async () => {
        const res = await testUtil.rpc(templateCommand, [templateGetCommand,
            listingItemTemplate.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.ListingItemTemplate = res.getBody()['result'];

        // log.debug('result:', JSON.stringify(result, null, 2));
        expect(result.Profile.id).toBe(profile.id);
        expect(result.Profile.name).toBe(profile.name);
        expect(result).hasOwnProperty('Profile');
        expect(result).hasOwnProperty('ItemInformation');
        expect(result).hasOwnProperty('PaymentInformation');
        expect(result).hasOwnProperty('MessagingInformation');
        expect(result).hasOwnProperty('ListingItemObjects');
        expect(result).hasOwnProperty('ListingItem');

        expect(result.hash).toBe(listingItemTemplate.hash);

        expect(result.ItemInformation.title).toBe(listingItemTemplate.ItemInformation.title);
        expect(result.ItemInformation.shortDescription).toBe(listingItemTemplate.ItemInformation.shortDescription);
        expect(result.ItemInformation.longDescription).toBe(listingItemTemplate.ItemInformation.longDescription);
        expect(result.ItemInformation.ItemCategory.key).toBe(listingItemTemplate.ItemInformation.ItemCategory.key);
        expect(result.ItemInformation.ItemCategory.name).toBe(listingItemTemplate.ItemInformation.ItemCategory.name);
        expect(result.ItemInformation.ItemCategory.description).toBe(listingItemTemplate.ItemInformation.ItemCategory.description);
        expect(result.ItemInformation.ItemLocation.country).toBe(listingItemTemplate.ItemInformation.ItemLocation.country);
        expect(result.ItemInformation.ItemLocation.address).toBe(listingItemTemplate.ItemInformation.ItemLocation.address);
        expect(result.ItemInformation.ItemLocation.LocationMarker.title)
            .toBe(listingItemTemplate.ItemInformation.ItemLocation.LocationMarker.title);
        expect(result.ItemInformation.ItemLocation.LocationMarker.description)
            .toBe(listingItemTemplate.ItemInformation.ItemLocation.LocationMarker.description);
        expect(result.ItemInformation.ItemLocation.LocationMarker.lat).toBe(listingItemTemplate.ItemInformation.ItemLocation.LocationMarker.lat);
        expect(result.ItemInformation.ItemLocation.LocationMarker.lng).toBe(listingItemTemplate.ItemInformation.ItemLocation.LocationMarker.lng);
        expect(result.ItemInformation.ShippingDestinations).toBeDefined();
        expect(result.ItemInformation.Images).toBeDefined();

        expect(result.PaymentInformation.type).toBe(listingItemTemplate.PaymentInformation.type);
        expect(result.PaymentInformation.Escrow.type).toBe(listingItemTemplate.PaymentInformation.Escrow.type);
        expect(result.PaymentInformation.Escrow.Ratio.buyer).toBe(listingItemTemplate.PaymentInformation.Escrow.Ratio.buyer);
        expect(result.PaymentInformation.Escrow.Ratio.seller).toBe(listingItemTemplate.PaymentInformation.Escrow.Ratio.seller);
        expect(result.PaymentInformation.ItemPrice.currency).toBe(listingItemTemplate.PaymentInformation.ItemPrice.currency);
        expect(result.PaymentInformation.ItemPrice.basePrice).toBe(listingItemTemplate.PaymentInformation.ItemPrice.basePrice);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.domestic).toBe(listingItemTemplate.PaymentInformation.ItemPrice.ShippingPrice.domestic);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.international)
            .toBe(listingItemTemplate.PaymentInformation.ItemPrice.ShippingPrice.international);

        expect(result.MessagingInformation.protocol).toBe(listingItemTemplate.MessagingInformation.protocol);
        expect(result.MessagingInformation.publicKey).toBe(listingItemTemplate.MessagingInformation.publicKey);
    });

    test('Should return base64 of image if returnImageData is true', async () => {

        const res = await testUtil.rpc(templateCommand, [templateGetCommand,
            listingItemTemplate.id,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.ListingItemTemplate = res.getBody()['result'];

        // log.debug('result.ItemInformation.Images[0].ImageDatas[0].data: ', result.ItemInformation.Images[0].ImageDatas[0].data);
        expect(result.ItemInformation.Images[0].ImageDatas[0].data.length).toBeGreaterThan(200);
    });

});
