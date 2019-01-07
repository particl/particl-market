// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemParams } from '../../../src/api/requests/params/GenerateListingItemParams';
import { Logger as LoggerType } from '../../../src/core/Logger';
import * as resources from 'resources';

describe('ListingItemGetCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const itemCommand = Commands.ITEM_ROOT.commandName;
    const itemGetCommand = Commands.ITEM_GET.commandName;

    let createdListingItem: resources.ListingItem;

    beforeAll(async () => {
        await testUtil.cleanDb();

        const generateListingItemParams = new GenerateListingItemParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            true,   // generateShippingDestinations
            false,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            true    // generateListingItemObjects
        ]).toParamsArray();

        // create listing item for testing
        const listingItems = await testUtil.generateData(
            CreatableModel.LISTINGITEM,     // what to generate
            1,                      // how many to generate
            true,                // return model
        generateListingItemParams           // what kind of data to generate
        ) as resources.ListingItem[];
        createdListingItem = listingItems[0];

    });

    test('Should get the ListingItem by hash', async () => {

        // find listing item using hash
        const res = await testUtil.rpc(itemCommand, [itemGetCommand, createdListingItem.hash]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        // log.debug('listingItem:', JSON.stringify(result, null, 2));
        expect(result).hasOwnProperty('ItemInformation');
        expect(result).hasOwnProperty('PaymentInformation');
        expect(result).hasOwnProperty('MessagingInformation');
        expect(result).hasOwnProperty('ListingItemObjects');
        expect(result).hasOwnProperty('ListingItem');

        expect(result.hash).toBe(createdListingItem.hash);

        expect(result.ItemInformation.title).toBe(createdListingItem.ItemInformation.title);
        expect(result.ItemInformation.shortDescription).toBe(createdListingItem.ItemInformation.shortDescription);
        expect(result.ItemInformation.longDescription).toBe(createdListingItem.ItemInformation.longDescription);
        expect(result.ItemInformation.ItemCategory.name).toBe(createdListingItem.ItemInformation.ItemCategory.name);
        expect(result.ItemInformation.ItemCategory.description).toBe(createdListingItem.ItemInformation.ItemCategory.description);
        expect(result.ItemInformation.ItemLocation.region).toBe(createdListingItem.ItemInformation.ItemLocation.region);
        expect(result.ItemInformation.ItemLocation.address).toBe(createdListingItem.ItemInformation.ItemLocation.address);
        expect(result.ItemInformation.ItemLocation.LocationMarker.markerTitle).toBe(createdListingItem.ItemInformation.ItemLocation.LocationMarker.markerTitle);
        expect(result.ItemInformation.ItemLocation.LocationMarker.markerText).toBe(createdListingItem.ItemInformation.ItemLocation.LocationMarker.markerText);
        expect(result.ItemInformation.ItemLocation.LocationMarker.lat).toBe(createdListingItem.ItemInformation.ItemLocation.LocationMarker.lat);
        expect(result.ItemInformation.ItemLocation.LocationMarker.lng).toBe(createdListingItem.ItemInformation.ItemLocation.LocationMarker.lng);
        expect(result.ItemInformation.ShippingDestinations).toBeDefined();
        expect(result.ItemInformation.ItemImages).toBeDefined();

        expect(result.PaymentInformation.type).toBe(createdListingItem.PaymentInformation.type);
        expect(result.PaymentInformation.Escrow.type).toBe(createdListingItem.PaymentInformation.Escrow.type);
        expect(result.PaymentInformation.Escrow.Ratio.buyer).toBe(createdListingItem.PaymentInformation.Escrow.Ratio.buyer);
        expect(result.PaymentInformation.Escrow.Ratio.seller).toBe(createdListingItem.PaymentInformation.Escrow.Ratio.seller);
        expect(result.PaymentInformation.ItemPrice.currency).toBe(createdListingItem.PaymentInformation.ItemPrice.currency);
        expect(result.PaymentInformation.ItemPrice.basePrice).toBe(createdListingItem.PaymentInformation.ItemPrice.basePrice);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.domestic)
            .toBe(createdListingItem.PaymentInformation.ItemPrice.ShippingPrice.domestic);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.international)
            .toBe(createdListingItem.PaymentInformation.ItemPrice.ShippingPrice.international);
        expect(result.PaymentInformation.ItemPrice.CryptocurrencyAddress.type)
            .toBe(createdListingItem.PaymentInformation.ItemPrice.CryptocurrencyAddress.type);
        expect(result.PaymentInformation.ItemPrice.CryptocurrencyAddress.address)
            .toBe(createdListingItem.PaymentInformation.ItemPrice.CryptocurrencyAddress.address);

        expect(result.MessagingInformation[0].protocol).toBe(createdListingItem.MessagingInformation[0].protocol);
        expect(result.MessagingInformation[0].publicKey).toBe(createdListingItem.MessagingInformation[0].publicKey);

        // todo: missing FlaggedItem, Proposal, ...
    });

    test('Should get the ListingItem by id', async () => {

        // find listing item using id
        const res = await testUtil.rpc(itemCommand, [itemGetCommand, createdListingItem.id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result).hasOwnProperty('ItemInformation');
        expect(result).hasOwnProperty('PaymentInformation');
        expect(result).hasOwnProperty('MessagingInformation');
        expect(result).hasOwnProperty('ListingItemObjects');
        expect(result).hasOwnProperty('ListingItem');

        expect(result.hash).toBe(createdListingItem.hash);

        expect(result.ItemInformation.title).toBe(createdListingItem.ItemInformation.title);
        expect(result.ItemInformation.shortDescription).toBe(createdListingItem.ItemInformation.shortDescription);
        expect(result.ItemInformation.longDescription).toBe(createdListingItem.ItemInformation.longDescription);
        expect(result.ItemInformation.ItemCategory.name).toBe(createdListingItem.ItemInformation.ItemCategory.name);
        expect(result.ItemInformation.ItemCategory.description).toBe(createdListingItem.ItemInformation.ItemCategory.description);
        expect(result.ItemInformation.ItemLocation.region).toBe(createdListingItem.ItemInformation.ItemLocation.region);
        expect(result.ItemInformation.ItemLocation.address).toBe(createdListingItem.ItemInformation.ItemLocation.address);
        expect(result.ItemInformation.ItemLocation.LocationMarker.markerTitle).toBe(createdListingItem.ItemInformation.ItemLocation.LocationMarker.markerTitle);
        expect(result.ItemInformation.ItemLocation.LocationMarker.markerText).toBe(createdListingItem.ItemInformation.ItemLocation.LocationMarker.markerText);
        expect(result.ItemInformation.ItemLocation.LocationMarker.lat).toBe(createdListingItem.ItemInformation.ItemLocation.LocationMarker.lat);
        expect(result.ItemInformation.ItemLocation.LocationMarker.lng).toBe(createdListingItem.ItemInformation.ItemLocation.LocationMarker.lng);
        expect(result.ItemInformation.ShippingDestinations).toBeDefined();
        expect(result.ItemInformation.ItemImages).toBeDefined();

        expect(result.PaymentInformation.type).toBe(createdListingItem.PaymentInformation.type);
        expect(result.PaymentInformation.Escrow.type).toBe(createdListingItem.PaymentInformation.Escrow.type);
        expect(result.PaymentInformation.Escrow.Ratio.buyer).toBe(createdListingItem.PaymentInformation.Escrow.Ratio.buyer);
        expect(result.PaymentInformation.Escrow.Ratio.seller).toBe(createdListingItem.PaymentInformation.Escrow.Ratio.seller);
        expect(result.PaymentInformation.ItemPrice.currency).toBe(createdListingItem.PaymentInformation.ItemPrice.currency);
        expect(result.PaymentInformation.ItemPrice.basePrice).toBe(createdListingItem.PaymentInformation.ItemPrice.basePrice);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.domestic)
            .toBe(createdListingItem.PaymentInformation.ItemPrice.ShippingPrice.domestic);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.international)
            .toBe(createdListingItem.PaymentInformation.ItemPrice.ShippingPrice.international);
        expect(result.PaymentInformation.ItemPrice.CryptocurrencyAddress.type)
            .toBe(createdListingItem.PaymentInformation.ItemPrice.CryptocurrencyAddress.type);
        expect(result.PaymentInformation.ItemPrice.CryptocurrencyAddress.address)
            .toBe(createdListingItem.PaymentInformation.ItemPrice.CryptocurrencyAddress.address);

        expect(result.MessagingInformation[0].protocol).toBe(createdListingItem.MessagingInformation[0].protocol);
        expect(result.MessagingInformation[0].publicKey).toBe(createdListingItem.MessagingInformation[0].publicKey);
    });
});
