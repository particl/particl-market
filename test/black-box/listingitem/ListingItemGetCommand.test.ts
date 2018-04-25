import { rpc, api } from '../lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemParams } from '../../../src/api/requests/params/GenerateListingItemParams';
import { ListingItem } from 'resources';

describe('ListingItemGetCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const method = Commands.ITEM_ROOT.commandName;
    const subCommand = Commands.ITEM_GET.commandName;

    let createdListingItem;

    beforeAll(async () => {
        await testUtil.cleanDb();

        const generateListingItemParams = new GenerateListingItemParams([
            true,   // generateItemInformation
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
        ) as ListingItem[];
        createdListingItem = listingItems[0];

    });

    test('Should get the listing item by hash', async () => {

        // find listing item using hash
        const res = await rpc(method, [subCommand, createdListingItem.hash]);
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

    test('Should get the listing item by id', async () => {

        // find listing item using id
        const res = await rpc(method, [subCommand, createdListingItem.id]);
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
