// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { Logger as LoggerType } from '../../../src/core/Logger';

describe('ListingItemTemplateGetCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const templateCommand = Commands.TEMPLATE_ROOT.commandName;
    const templateGetCommand = Commands.TEMPLATE_GET.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;
    let listingItemTemplate: resources.ListingItemTemplate;


    beforeAll(async () => {
        await testUtil.cleanDb();

        // get default profile and market
        defaultProfile = await testUtil.getDefaultProfile();
        defaultMarket = await testUtil.getDefaultMarket();

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            true,   // generateShippingDestinations
            true,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            false    // generateListingItemObjects
        ]).toParamsArray();

        const listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplate[];
        listingItemTemplate = listingItemTemplates[0];

    });

    test('Should return ListingItemTemplate by Id', async () => {
        const res = await testUtil.rpc(templateCommand, [templateGetCommand, listingItemTemplate.id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.ListingItemTemplate = res.getBody()['result'];
        expect(result.Profile.id).toBe(defaultProfile.id);
        expect(result.Profile.name).toBe(defaultProfile.name);
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
        expect(result.ItemInformation.ItemLocation.LocationMarker.markerTitle)
            .toBe(listingItemTemplate.ItemInformation.ItemLocation.LocationMarker.markerTitle);
        expect(result.ItemInformation.ItemLocation.LocationMarker.markerText).toBe(listingItemTemplate.ItemInformation.ItemLocation.LocationMarker.markerText);
        expect(result.ItemInformation.ItemLocation.LocationMarker.lat).toBe(listingItemTemplate.ItemInformation.ItemLocation.LocationMarker.lat);
        expect(result.ItemInformation.ItemLocation.LocationMarker.lng).toBe(listingItemTemplate.ItemInformation.ItemLocation.LocationMarker.lng);
        expect(result.ItemInformation.ShippingDestinations).toBeDefined();
        expect(result.ItemInformation.ItemImages).toBeDefined();

        expect(result.PaymentInformation.type).toBe(listingItemTemplate.PaymentInformation.type);
        expect(result.PaymentInformation.Escrow.type).toBe(listingItemTemplate.PaymentInformation.Escrow.type);
        expect(result.PaymentInformation.Escrow.Ratio.buyer).toBe(listingItemTemplate.PaymentInformation.Escrow.Ratio.buyer);
        expect(result.PaymentInformation.Escrow.Ratio.seller).toBe(listingItemTemplate.PaymentInformation.Escrow.Ratio.seller);
        expect(result.PaymentInformation.ItemPrice.currency).toBe(listingItemTemplate.PaymentInformation.ItemPrice.currency);
        expect(result.PaymentInformation.ItemPrice.basePrice).toBe(listingItemTemplate.PaymentInformation.ItemPrice.basePrice);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.domestic).toBe(listingItemTemplate.PaymentInformation.ItemPrice.ShippingPrice.domestic);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.international)
            .toBe(listingItemTemplate.PaymentInformation.ItemPrice.ShippingPrice.international);
        expect(result.PaymentInformation.ItemPrice.CryptocurrencyAddress.type)
            .toBe(listingItemTemplate.PaymentInformation.ItemPrice.CryptocurrencyAddress.type);
        expect(result.PaymentInformation.ItemPrice.CryptocurrencyAddress.address)
            .toBe(listingItemTemplate.PaymentInformation.ItemPrice.CryptocurrencyAddress.address);

        expect(result.MessagingInformation.protocol).toBe(listingItemTemplate.MessagingInformation.protocol);
        expect(result.MessagingInformation.publicKey).toBe(listingItemTemplate.MessagingInformation.publicKey);
    });

    test('Should return base64 of image if return image data is true', async () => {

        const res = await testUtil.rpc(templateCommand, [templateGetCommand, listingItemTemplate.id, true]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.ListingItemTemplate = res.getBody()['result'];

        log.debug('result.ItemInformation.ItemImages[0].ItemImageDatas[0].data: ', result.ItemInformation.ItemImages[0].ItemImageDatas[0].data);
        // todo: check that the data is actually an image
        expect(result.ItemInformation.ItemImages[0].ItemImageDatas[0].data.length).toBeGreaterThan(200);

    });
});
