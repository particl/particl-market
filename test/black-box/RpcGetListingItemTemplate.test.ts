import { rpc, api } from './lib/api';

import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';

describe('GetListingItemTemplate', () => {

    const testUtil = new BlackBoxTestUtil();
    const method = 'getlistingitemtemplate';

    let profile;

    beforeAll(async () => {
        await testUtil.cleanDb();
        profile = await testUtil.getDefaultProfile();

    });

    test('Should return one ListingItemTemplate by Id', async () => {
        const listingItemTemplates = await testUtil.generateData('listingitemtemplate', 1);
        const testData = listingItemTemplates[0];

        // fetch using id
        const res = await rpc(method, [listingItemTemplates[0].id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.Profile.id).toBe(profile.id);
        expect(result.Profile.name).toBe(profile.name);
        expect(result).hasOwnProperty('Profile');
        expect(result).hasOwnProperty('ItemInformation');
        expect(result).hasOwnProperty('PaymentInformation');
        expect(result).hasOwnProperty('MessagingInformation');
        expect(result).hasOwnProperty('ListingItemObjects');
        expect(result).hasOwnProperty('ListingItem');

        expect(result.hash).toBe(testData.hash);

        expect(result.ItemInformation.title).toBe(testData.ItemInformation.title);
        expect(result.ItemInformation.shortDescription).toBe(testData.ItemInformation.shortDescription);
        expect(result.ItemInformation.longDescription).toBe(testData.ItemInformation.longDescription);
        expect(result.ItemInformation.ItemCategory.key).toBe(testData.ItemInformation.ItemCategory.key);
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
        expect(result.PaymentInformation.ItemPrice.Address.type).toBe(testData.PaymentInformation.ItemPrice.Address.type);
        expect(result.PaymentInformation.ItemPrice.Address.address).toBe(testData.PaymentInformation.ItemPrice.Address.address);

        expect(result.MessagingInformation.protocol).toBe(testData.MessagingInformation.protocol);
        expect(result.MessagingInformation.publicKey).toBe(testData.MessagingInformation.publicKey);
    });
});
