import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Country } from '../../src/api/enums/Country';
import { ShippingAvailability } from '../../src/api/enums/ShippingAvailability';
import { ImageDataProtocolType } from '../../src/api/enums/ImageDataProtocolType';
import { EscrowType } from '../../src/api/enums/EscrowType';
import { Currency } from '../../src/api/enums/Currency';
import { CryptocurrencyAddressType } from '../../src/api/enums/CryptocurrencyAddressType';
import { PaymentType } from '../../src/api/enums/PaymentType';
import { MessagingProtocolType } from '../../src/api/enums/MessagingProtocolType';

describe('GetItem', () => {

    const testUtil = new BlackBoxTestUtil();
    const method = 'getitem';

    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    test('Should get the listing item by hash', async () => {

        // create listing item
        const listingItems = await testUtil.generateData('listingitem', 1);
        const testData = listingItems[0];
        const createdHash = testData['hash'];

        // find listing item using hash
        const res = await rpc(method, [createdHash]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result).hasOwnProperty('ItemInformation');
        expect(result).hasOwnProperty('PaymentInformation');
        expect(result).hasOwnProperty('MessagingInformation');
        expect(result).hasOwnProperty('ListingItemObjects');
        expect(result).hasOwnProperty('ListingItem');

        expect(result.hash).toBe(testData.hash);

        expect(result.ItemInformation.title).toBe(testData.ItemInformation.title);
        expect(result.ItemInformation.shortDescription).toBe(testData.ItemInformation.shortDescription);
        expect(result.ItemInformation.longDescription).toBe(testData.ItemInformation.longDescription);
        expect(result.ItemInformation.ItemCategory.name).toBe(testData.ItemInformation.ItemCategory.name);
        expect(result.ItemInformation.ItemCategory.description).toBe(testData.ItemInformation.ItemCategory.description);
        expect(result.ItemInformation.ItemLocation.region).toBe(testData.ItemInformation.ItemLocation.region);
        expect(result.ItemInformation.ItemLocation.address).toBe(testData.ItemInformation.ItemLocation.address);
        expect(result.ItemInformation.ItemLocation.LocationMarker.markerTitle).toBe(testData.ItemInformation.ItemLocation.LocationMarker.markerTitle);
        expect(result.ItemInformation.ItemLocation.LocationMarker.markerText).toBe(testData.ItemInformation.ItemLocation.LocationMarker.markerText);
        expect(result.ItemInformation.ItemLocation.LocationMarker.lat).toBe(testData.ItemInformation.ItemLocation.LocationMarker.lat);
        expect(result.ItemInformation.ItemLocation.LocationMarker.lng).toBe(testData.ItemInformation.ItemLocation.LocationMarker.lng);
        expect(result.ItemInformation.ShippingDestinations).toBeDefined();
        expect(result.ItemInformation.ItemImages).toBeDefined();

        expect(result.PaymentInformation.type).toBe(testData.PaymentInformation.type);
        expect(result.PaymentInformation.Escrow.type).toBe(testData.PaymentInformation.Escrow.type);
        expect(result.PaymentInformation.Escrow.Ratio.buyer).toBe(testData.PaymentInformation.Escrow.Ratio.buyer);
        expect(result.PaymentInformation.Escrow.Ratio.seller).toBe(testData.PaymentInformation.Escrow.Ratio.seller);
        expect(result.PaymentInformation.ItemPrice.currency).toBe(testData.PaymentInformation.ItemPrice.currency);
        expect(result.PaymentInformation.ItemPrice.basePrice).toBe(testData.PaymentInformation.ItemPrice.basePrice);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.domestic).toBe(testData.PaymentInformation.ItemPrice.ShippingPrice.domestic);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.international).toBe(testData.PaymentInformation.ItemPrice.ShippingPrice.international);
        expect(result.PaymentInformation.ItemPrice.CryptocurrencyAddress.type).toBe(testData.PaymentInformation.ItemPrice.CryptocurrencyAddress.type);
        expect(result.PaymentInformation.ItemPrice.CryptocurrencyAddress.address).toBe(testData.PaymentInformation.ItemPrice.CryptocurrencyAddress.address);

        expect(result.MessagingInformation[0].protocol).toBe(testData.MessagingInformation[0].protocol);
        expect(result.MessagingInformation[0].publicKey).toBe(testData.MessagingInformation[0].publicKey);
    });

    test('Should get the listing item by id', async () => {

        // create listing item
        const listingItems = await testUtil.generateData('listingitem', 1);
        const testData = listingItems[0];
        const createdId = testData['id'];

        // find listing item using id
        const res = await rpc(method, [createdId]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result).hasOwnProperty('ItemInformation');
        expect(result).hasOwnProperty('PaymentInformation');
        expect(result).hasOwnProperty('MessagingInformation');
        expect(result).hasOwnProperty('ListingItemObjects');
        expect(result).hasOwnProperty('ListingItem');

        expect(result.hash).toBe(testData.hash);

        expect(result.ItemInformation.title).toBe(testData.ItemInformation.title);
        expect(result.ItemInformation.shortDescription).toBe(testData.ItemInformation.shortDescription);
        expect(result.ItemInformation.longDescription).toBe(testData.ItemInformation.longDescription);
        expect(result.ItemInformation.ItemCategory.name).toBe(testData.ItemInformation.ItemCategory.name);
        expect(result.ItemInformation.ItemCategory.description).toBe(testData.ItemInformation.ItemCategory.description);
        expect(result.ItemInformation.ItemLocation.region).toBe(testData.ItemInformation.ItemLocation.region);
        expect(result.ItemInformation.ItemLocation.address).toBe(testData.ItemInformation.ItemLocation.address);
        expect(result.ItemInformation.ItemLocation.LocationMarker.markerTitle).toBe(testData.ItemInformation.ItemLocation.LocationMarker.markerTitle);
        expect(result.ItemInformation.ItemLocation.LocationMarker.markerText).toBe(testData.ItemInformation.ItemLocation.LocationMarker.markerText);
        expect(result.ItemInformation.ItemLocation.LocationMarker.lat).toBe(testData.ItemInformation.ItemLocation.LocationMarker.lat);
        expect(result.ItemInformation.ItemLocation.LocationMarker.lng).toBe(testData.ItemInformation.ItemLocation.LocationMarker.lng);
        expect(result.ItemInformation.ShippingDestinations).toBeDefined();
        expect(result.ItemInformation.ItemImages).toBeDefined();

        expect(result.PaymentInformation.type).toBe(testData.PaymentInformation.type);
        expect(result.PaymentInformation.Escrow.type).toBe(testData.PaymentInformation.Escrow.type);
        expect(result.PaymentInformation.Escrow.Ratio.buyer).toBe(testData.PaymentInformation.Escrow.Ratio.buyer);
        expect(result.PaymentInformation.Escrow.Ratio.seller).toBe(testData.PaymentInformation.Escrow.Ratio.seller);
        expect(result.PaymentInformation.ItemPrice.currency).toBe(testData.PaymentInformation.ItemPrice.currency);
        expect(result.PaymentInformation.ItemPrice.basePrice).toBe(testData.PaymentInformation.ItemPrice.basePrice);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.domestic).toBe(testData.PaymentInformation.ItemPrice.ShippingPrice.domestic);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.international).toBe(testData.PaymentInformation.ItemPrice.ShippingPrice.international);
        expect(result.PaymentInformation.ItemPrice.CryptocurrencyAddress.type).toBe(testData.PaymentInformation.ItemPrice.CryptocurrencyAddress.type);
        expect(result.PaymentInformation.ItemPrice.CryptocurrencyAddress.address).toBe(testData.PaymentInformation.ItemPrice.CryptocurrencyAddress.address);

        expect(result.MessagingInformation[0].protocol).toBe(testData.MessagingInformation[0].protocol);
        expect(result.MessagingInformation[0].publicKey).toBe(testData.MessagingInformation[0].publicKey);
    });
});
