// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemParams } from '../../../src/api/requests/testdata/GenerateListingItemParams';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';

describe('ListingItemGetCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const itemCommand = Commands.ITEM_ROOT.commandName;
    const itemGetCommand = Commands.ITEM_GET.commandName;

    let profile: resources.Profile;
    let market: resources.Market;

    let listingItem: resources.ListingItem;

    beforeAll(async () => {
        await testUtil.cleanDb();

        profile = await testUtil.getDefaultProfile();
        expect(profile.id).toBeDefined();
        market = await testUtil.getDefaultMarket(profile.id);
        expect(market.id).toBeDefined();

        const generateListingItemParams = new GenerateListingItemParams([
            true,       // generateItemInformation
            true,       // generateItemLocation
            true,       // generateShippingDestinations
            true,       // generateItemImages
            true,       // generatePaymentInformation
            true,       // generateEscrow
            true,       // generateItemPrice
            true,       // generateMessagingInformation
            true,       // generateListingItemObjects
            true        // generateObjectDatas
        ]).toParamsArray();

        // create listing item for testing
        const listingItems = await testUtil.generateData(
            CreatableModel.LISTINGITEM,     // what to generate
            1,                      // how many to generate
            true,                // return model
        generateListingItemParams           // what kind of data to generate
        ) as resources.ListingItem[];
        listingItem = listingItems[0];

    });

    test('Should fail because missing listingItemTemplateId', async () => {
        const res: any = await testUtil.rpc(itemCommand, [itemGetCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('listingItemId').getMessage());
    });


    test('Should get the ListingItem by id', async () => {

        // find listing item using id
        const res = await testUtil.rpc(itemCommand, [itemGetCommand,
            listingItem.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result).hasOwnProperty('ItemInformation');
        expect(result).hasOwnProperty('PaymentInformation');
        expect(result).hasOwnProperty('MessagingInformation');
        expect(result).hasOwnProperty('ListingItemObjects');
        expect(result).hasOwnProperty('ListingItem');

        expect(result.hash).toBe(listingItem.hash);

        expect(result.ItemInformation.title).toBe(listingItem.ItemInformation.title);
        expect(result.ItemInformation.shortDescription).toBe(listingItem.ItemInformation.shortDescription);
        expect(result.ItemInformation.longDescription).toBe(listingItem.ItemInformation.longDescription);
        expect(result.ItemInformation.ItemCategory.name).toBe(listingItem.ItemInformation.ItemCategory.name);
        expect(result.ItemInformation.ItemCategory.description).toBe(listingItem.ItemInformation.ItemCategory.description);
        expect(result.ItemInformation.ItemLocation.country).toBe(listingItem.ItemInformation.ItemLocation.country);
        expect(result.ItemInformation.ItemLocation.address).toBe(listingItem.ItemInformation.ItemLocation.address);
        expect(result.ItemInformation.ItemLocation.LocationMarker.title).toBe(listingItem.ItemInformation.ItemLocation.LocationMarker.title);
        expect(result.ItemInformation.ItemLocation.LocationMarker.description).toBe(listingItem.ItemInformation.ItemLocation.LocationMarker.description);
        expect(result.ItemInformation.ItemLocation.LocationMarker.lat).toBe(listingItem.ItemInformation.ItemLocation.LocationMarker.lat);
        expect(result.ItemInformation.ItemLocation.LocationMarker.lng).toBe(listingItem.ItemInformation.ItemLocation.LocationMarker.lng);
        expect(result.ItemInformation.ShippingDestinations).toBeDefined();
        expect(result.ItemInformation.ItemImages).toBeDefined();

        expect(result.PaymentInformation.type).toBe(listingItem.PaymentInformation.type);
        expect(result.PaymentInformation.Escrow.type).toBe(listingItem.PaymentInformation.Escrow.type);
        expect(result.PaymentInformation.Escrow.Ratio.buyer).toBe(listingItem.PaymentInformation.Escrow.Ratio.buyer);
        expect(result.PaymentInformation.Escrow.Ratio.seller).toBe(listingItem.PaymentInformation.Escrow.Ratio.seller);
        expect(result.PaymentInformation.ItemPrice.currency).toBe(listingItem.PaymentInformation.ItemPrice.currency);
        expect(result.PaymentInformation.ItemPrice.basePrice).toBe(listingItem.PaymentInformation.ItemPrice.basePrice);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.domestic)
            .toBe(listingItem.PaymentInformation.ItemPrice.ShippingPrice.domestic);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.international)
            .toBe(listingItem.PaymentInformation.ItemPrice.ShippingPrice.international);
        expect(result.PaymentInformation.ItemPrice.CryptocurrencyAddress.type)
            .toBe(listingItem.PaymentInformation.ItemPrice.CryptocurrencyAddress.type);
        expect(result.PaymentInformation.ItemPrice.CryptocurrencyAddress.address)
            .toBe(listingItem.PaymentInformation.ItemPrice.CryptocurrencyAddress.address);

        expect(result.MessagingInformation[0].protocol).toBe(listingItem.MessagingInformation[0].protocol);
        expect(result.MessagingInformation[0].publicKey).toBe(listingItem.MessagingInformation[0].publicKey);
    });

    test('Should return base64 of image if return image data is true', async () => {

        const res = await testUtil.rpc(itemCommand, [itemGetCommand,
            listingItem.id,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.ListingItem = res.getBody()['result'];

        // log.debug('result.ItemInformation.ItemImages[0].ItemImageDatas[0].data: ', result.ItemInformation.ItemImages[0].ItemImageDatas[0].data);

        // todo: check that the data is actually an image
        expect(result.ItemInformation.ItemImages[0].ItemImageDatas[0].data.length).toBeGreaterThan(200);
    });


});
