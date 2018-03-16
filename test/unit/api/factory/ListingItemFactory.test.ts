import { LogMock } from '../../lib/LogMock';
import { ObjectHash } from '../../../../src/core/helpers/ObjectHash';
import * as resources from 'resources';

import { ListingItemFactory } from '../../../../src/api/factories/ListingItemFactory';
import { ItemCategoryFactory } from '../../../../src/api/factories/ItemCategoryFactory';
import { ListingItemMessage } from '../../../../src/api/messages/ListingItemMessage';
import { ListingItemCreateRequest } from '../../../../src/api/requests/ListingItemCreateRequest';

import * as listingItemTemplateBasic from '../../../testdata/listingitemtemplate/listingItemTemplateBasic.json';
import * as listingItemCategoryWithRelated from '../../../testdata/category/listingItemCategoryWithRelated.json';
import * as listingItemCategoryRootWithRelated from '../../../testdata/category/listingItemCategoryRootWithRelated.json';

describe('ListingItemFactory', () => {

    const itemCategoryFactory = new ItemCategoryFactory(LogMock);
    const listingItemFactory = new ListingItemFactory(LogMock, itemCategoryFactory);

    let createdListingItemMessage: ListingItemMessage;

    beforeEach(() => {
        //
    });

    const expectMessageFromListingItem = (message: ListingItemMessage, testData: resources.ListingItemTemplate) => {
        expect(message.hash).toBe(testData.hash);
        expect(message).not.toHaveProperty('id');
        expect(message).not.toHaveProperty('profileId');
        expect(message).not.toHaveProperty('updatedAt');
        expect(message).not.toHaveProperty('createdAt');
        expect(message).not.toHaveProperty('ItemInformation');
        expect(message).not.toHaveProperty('PaymentInformation');
        expect(message).not.toHaveProperty('MessagingInformation');
        expect(message).not.toHaveProperty('ListingItemObjects');
        expect(message).not.toHaveProperty('Profile');
        expect(message).not.toHaveProperty('ListingItems');

        // message.information
        expect(message.information).toBeDefined();
        expect(message.information).not.toHaveProperty('id');
        expect(message.information).not.toHaveProperty('shortDescription');
        expect(message.information).not.toHaveProperty('longDescription');
        expect(message.information).not.toHaveProperty('itemCategoryId');
        expect(message.information).not.toHaveProperty('listingItemId');
        expect(message.information).not.toHaveProperty('listingItemTemplateId');
        expect(message.information).not.toHaveProperty('updatedAt');
        expect(message.information).not.toHaveProperty('createdAt');
        expect(message.information).not.toHaveProperty('ItemCategory');
        expect(message.information).not.toHaveProperty('ItemLocation');
        expect(message.information).not.toHaveProperty('ShippingDestinations');
        expect(message.information.title).toBe(testData.ItemInformation.title);
        expect(message.information.short_description).toBe(testData.ItemInformation.shortDescription);
        expect(message.information.long_description).toBe(testData.ItemInformation.longDescription);
        expect(message.information.category).toBeDefined();
        expect(message.information.category.length).toBe(3);
        expect(message.information.category[0]).toBe('cat_ROOT');
        expect(message.information.category[1]).toBe('cat_wholesale_science_industrial');
        expect(message.information.category[2]).toBe('cat_wholesale_consumer_goods');

        // message.information.location
        expect(message.information.location).toBeDefined();
        expect(message.information.location).not.toHaveProperty('id');
        expect(message.information.location).not.toHaveProperty('itemInformationId');
        expect(message.information.location).not.toHaveProperty('updatedAt');
        expect(message.information.location).not.toHaveProperty('createdAt');
        expect(message.information.location).not.toHaveProperty('LocationMarker');
        expect(message.information.location.country).toBe(testData.ItemInformation.ItemLocation.region);
        expect(message.information.location.address).toBe(testData.ItemInformation.ItemLocation.address);

        // message.information.location.gps
        expect(message.information.location.gps).toBeDefined();
        expect(message.information.location.gps).not.toHaveProperty('id');
        expect(message.information.location.gps).not.toHaveProperty('itemLocationId');
        expect(message.information.location.gps).not.toHaveProperty('updatedAt');
        expect(message.information.location.gps).not.toHaveProperty('createdAt');
        expect(message.information.location.gps).not.toHaveProperty('markerTitle');
        expect(message.information.location.gps).not.toHaveProperty('markerText');
        expect(message.information.location.gps.marker_title).toBe(testData.ItemInformation.ItemLocation.LocationMarker.markerTitle);
        expect(message.information.location.gps.marker_text).toBe(testData.ItemInformation.ItemLocation.LocationMarker.markerText);
        expect(message.information.location.gps.lat).toBe(testData.ItemInformation.ItemLocation.LocationMarker.lat);
        expect(message.information.location.gps.lng).toBe(testData.ItemInformation.ItemLocation.LocationMarker.lng);

        // message.information.shipping_destinations
        expect(message.information.shipping_destinations).toBeDefined();
        expect(message.information.shipping_destinations.length).toBe(2);
        expect(message.information.shipping_destinations).toContain('-MOROCCO');
        expect(message.information.shipping_destinations).toContain('PANAMA');

        // message.information.images
        expect(message.information.images).toBeDefined();
        expect(message.information.images.length).toBe(5);
        expect(message.information.images[0]).not.toHaveProperty('id');
        expect(message.information.images[0]).not.toHaveProperty('itemInformationId');
        expect(message.information.images[0]).not.toHaveProperty('updatedAt');
        expect(message.information.images[0]).not.toHaveProperty('createdAt');
        expect(message.information.images[0]).not.toHaveProperty('ItemImageDatas');
        expect(message.information.images[0].hash).toBe(testData.ItemInformation.ItemImages[0].hash);
        expect(message.information.images[0].data.length).toBe(1);
        expect(message.information.images[0].data[0].protocol).toBe(testData.ItemInformation.ItemImages[0].ItemImageDatas[0].protocol);
        expect(message.information.images[0].data[0].encoding).toBe(testData.ItemInformation.ItemImages[0].ItemImageDatas[0].encoding);
        expect(message.information.images[0].data[0].data).toBe(testData.ItemInformation.ItemImages[0].ItemImageDatas[0].data);

        // message.payment
        expect(message.payment).toBeDefined();
        expect(message.payment).not.toHaveProperty('id');
        expect(message.payment).not.toHaveProperty('listingItemId');
        expect(message.payment).not.toHaveProperty('listingItemTemplateId');
        expect(message.payment).not.toHaveProperty('updatedAt');
        expect(message.payment).not.toHaveProperty('createdAt');
        expect(message.payment).not.toHaveProperty('ItemPrice');
        expect(message.payment).not.toHaveProperty('Escrow');
        expect(message.payment.type).toBe(testData.PaymentInformation.type);

        // message.payment.cryptocurrency
        expect(message.payment.cryptocurrency).toBeDefined();
        expect(message.payment.cryptocurrency.length).toBe(1);
        expect(message.payment.cryptocurrency[0]).not.toHaveProperty('id');
        expect(message.payment.cryptocurrency[0]).not.toHaveProperty('basePrice');
        expect(message.payment.cryptocurrency[0]).not.toHaveProperty('paymentInformationId');
        expect(message.payment.cryptocurrency[0]).not.toHaveProperty('cryptocurrencyAddressId');
        expect(message.payment.cryptocurrency[0]).not.toHaveProperty('updatedAt');
        expect(message.payment.cryptocurrency[0]).not.toHaveProperty('createdAt');
        expect(message.payment.cryptocurrency[0]).not.toHaveProperty('CryptocurrencyAddress');
        expect(message.payment.cryptocurrency[0]).not.toHaveProperty('ShippingPrice');
        expect(message.payment.cryptocurrency[0].currency).toBe(testData.PaymentInformation.ItemPrice.currency);
        expect(message.payment.cryptocurrency[0].base_price).toBe(testData.PaymentInformation.ItemPrice.basePrice);

        // message.payment.cryptocurrency.address
        expect(message.payment.cryptocurrency[0].address).toBeDefined();
        expect(message.payment.cryptocurrency[0].address).not.toHaveProperty('id');
        expect(message.payment.cryptocurrency[0].address).not.toHaveProperty('profileId');
        expect(message.payment.cryptocurrency[0].address).not.toHaveProperty('updatedAt');
        expect(message.payment.cryptocurrency[0].address).not.toHaveProperty('createdAt');
        expect(message.payment.cryptocurrency[0].address.type).toBe(testData.PaymentInformation.ItemPrice.CryptocurrencyAddress.type);
        expect(message.payment.cryptocurrency[0].address.address).toBe(testData.PaymentInformation.ItemPrice.CryptocurrencyAddress.address);

        // message.payment.cryptocurrency.shipping_price
        expect(message.payment.cryptocurrency[0].shipping_price).toBeDefined();
        expect(message.payment.cryptocurrency[0].shipping_price).not.toHaveProperty('id');
        expect(message.payment.cryptocurrency[0].shipping_price).not.toHaveProperty('itemPriceId');
        expect(message.payment.cryptocurrency[0].shipping_price).not.toHaveProperty('updatedAt');
        expect(message.payment.cryptocurrency[0].shipping_price).not.toHaveProperty('createdAt');
        expect(message.payment.cryptocurrency[0].shipping_price.domestic).toBe(testData.PaymentInformation.ItemPrice.ShippingPrice.domestic);
        expect(message.payment.cryptocurrency[0].shipping_price.international)
            .toBe(testData.PaymentInformation.ItemPrice.ShippingPrice.international);

        // message.payment.escrow
        expect(message.payment.escrow).toBeDefined();
        expect(message.payment.escrow).not.toHaveProperty('id');
        expect(message.payment.escrow).not.toHaveProperty('paymentInformationId');
        expect(message.payment.escrow).not.toHaveProperty('updatedAt');
        expect(message.payment.escrow).not.toHaveProperty('createdAt');
        expect(message.payment.escrow).not.toHaveProperty('Ratio');
        expect(message.payment.escrow.type).toBe(testData.PaymentInformation.Escrow.type);

        // message.payment.escrow.ratio
        expect(message.payment.escrow.ratio).toBeDefined();
        expect(message.payment.escrow.ratio).not.toHaveProperty('id');
        expect(message.payment.escrow.ratio).not.toHaveProperty('escrowId');
        expect(message.payment.escrow.ratio).not.toHaveProperty('updatedAt');
        expect(message.payment.escrow.ratio).not.toHaveProperty('createdAt');
        expect(message.payment.escrow.ratio.buyer).toBe(testData.PaymentInformation.Escrow.Ratio.buyer);
        expect(message.payment.escrow.ratio.seller).toBe(testData.PaymentInformation.Escrow.Ratio.seller);

        // message.messaging
        expect(message.messaging).toBeDefined();
        expect(message.messaging.length).toBe(1);
        expect(message.messaging[0]).not.toHaveProperty('id');
        expect(message.messaging[0]).not.toHaveProperty('publicKey');
        expect(message.messaging[0]).not.toHaveProperty('listingItemId');
        expect(message.messaging[0]).not.toHaveProperty('listingItemTemplateId');
        expect(message.messaging[0]).not.toHaveProperty('updatedAt');
        expect(message.messaging[0]).not.toHaveProperty('createdAt');
        expect(message.messaging[0].protocol).toBe(testData.MessagingInformation[0].protocol);
        expect(message.messaging[0].public_key).toBe(testData.MessagingInformation[0].publicKey);

        // message.objects
        // TODO: test objects fields

    };

    const expectListingItemFromMessage = (result: ListingItemCreateRequest, message: ListingItemMessage) => {

        expect(result.hash).toBe(message.hash);

        // fields from message that we dont want to see
        expect(result).not.toHaveProperty('information');
        expect(result).not.toHaveProperty('payment');
        expect(result).not.toHaveProperty('messaging');
        expect(result).not.toHaveProperty('objects');

        // ItemInformation
        expect(result.itemInformation.title).toBe(message.information.title);
        expect(result.itemInformation.shortDescription).toBe(message.information.short_description);
        expect(result.itemInformation.longDescription).toBe(message.information.long_description);

        // ItemInformation.ItemCategory
        expect(result.itemInformation.itemCategory.key).toBe(message.information.category[2]);
        expect(result.itemInformation.itemCategory.parentItemCategoryId).not.toBeNull();

        // ItemInformation.ItemLocation
        expect(result.itemInformation.itemLocation.region).toBe(message.information.location.country);
        expect(result.itemInformation.itemLocation.address).toBe(message.information.location.address);

        // ItemInformation.ItemLocation.LocationMarker
        expect(result.itemInformation.itemLocation.locationMarker.markerTitle).toBe(message.information.location.gps.marker_title);
        expect(result.itemInformation.itemLocation.locationMarker.markerText).toBe(message.information.location.gps.marker_text);
        expect(result.itemInformation.itemLocation.locationMarker.lat).toBe(message.information.location.gps.lat);
        expect(result.itemInformation.itemLocation.locationMarker.lng).toBe(message.information.location.gps.lng);

        // ItemInformation.ShippingDestinations
        expect(result.itemInformation.shippingDestinations.length).toBe(2);
        // todo: test the shipping destinations
        // expect(message.information.shipping_destinations).toContain('-MOROCCO');
        // expect(message.information.shipping_destinations).toContain('PANAMA');

        // ItemInformation.ItemImages
        expect(result.itemInformation.itemImages.length).toBe(5);
        // todo: test the images
        // expect(message.information.images[0].hash).toBe(testData.ItemInformation.ItemImages[0].hash);
        // expect(message.information.images[0].data.length).toBe(1);
        // expect(message.information.images[0].data[0].protocol).toBe(testData.ItemInformation.ItemImages[0].ItemImageDatas[0].protocol);
        // expect(message.information.images[0].data[0].encoding).toBe(testData.ItemInformation.ItemImages[0].ItemImageDatas[0].encoding);
        // expect(message.information.images[0].data[0].data).toBe(testData.ItemInformation.ItemImages[0].ItemImageDatas[0].data);

        // PaymentInformation
        expect(result.paymentInformation.type).toBe(message.payment.type);

        // PaymentInformation.Escrow
        expect(result.paymentInformation.escrow.type).toBe(message.payment.escrow.type);

        // PaymentInformation.Escrow.Ratio
        expect(result.paymentInformation.escrow.ratio.buyer).toBe(message.payment.escrow.ratio.buyer);
        expect(result.paymentInformation.escrow.ratio.seller).toBe(message.payment.escrow.ratio.seller);

        // PaymentInformation.ItemPrice
        const itemPrice = result.paymentInformation.itemPrice;
        expect(itemPrice.currency).toBe(message.payment.cryptocurrency[0].currency);
        expect(itemPrice.basePrice).toBe(message.payment.cryptocurrency[0].base_price);

        // PaymentInformation.ItemPrice.CryptocurrencyAddress
        const cryptocurrencyAddress = result.paymentInformation.itemPrice.cryptocurrencyAddress;
        expect(cryptocurrencyAddress.type).toBe(message.payment.cryptocurrency[0].address.type);
        expect(cryptocurrencyAddress.address).toBe(message.payment.cryptocurrency[0].address.address);

        // PaymentInformation.ItemPrice.ShippingPrice
        const shippingPrice = result.paymentInformation.itemPrice.shippingPrice;
        expect(shippingPrice.domestic).toBe(message.payment.cryptocurrency[0].shipping_price.domestic);
        expect(shippingPrice.international).toBe(message.payment.cryptocurrency[0].shipping_price.international);

        // MessagingInformation
        expect(result.messagingInformation[0].protocol).toBe(message.messaging[0].protocol);
        expect(result.messagingInformation[0].publicKey).toBe(message.messaging[0].public_key);

        // listingitem-object
        // TODO test listingitemobjects
        // expect(result.ListingItemObjects[0].type).toBe(message.objects[0].type);
        // expect(result.ListingItemObjects[0].description).toBe(message.objects[0].description);
        // expect(result.ListingItemObjects[0].order).toBe(message.objects[0].order);
    };


    test('Should create ListingItemMessage', async () => {

        createdListingItemMessage = await listingItemFactory.getMessage(listingItemTemplateBasic, listingItemCategoryWithRelated);

        // console.log('message: ', JSON.stringify(createdListingItemMessage, null, 2));

        // test message conversion
        expectMessageFromListingItem(createdListingItemMessage, listingItemTemplateBasic);

    });

    // TODO: add tests checking the conversions using different data

    test('should create ListingItemCreateRequest using the previously created ListingItemMessage', async () => {

        const marketId = 1;
        const listingItemCreateRequest: ListingItemCreateRequest =
            await listingItemFactory.getModel(createdListingItemMessage, marketId, listingItemCategoryRootWithRelated);

        // console.log('message: ', JSON.stringify(message, null, 2));

        // test message conversion
        expectListingItemFromMessage(listingItemCreateRequest, createdListingItemMessage);
    });

});
