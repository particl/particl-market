import { api } from './lib/api';
import { DatabaseResetCommand } from '../../src/console/DatabaseResetCommand';
import { Country } from '../../src/api/enums/Country';
import { ShippingAvailability } from '../../src/api/enums/ShippingAvailability';
import { ImageDataProtocolType } from '../../src/api/enums/ImageDataProtocolType';
import { PaymentType } from '../../src/api/enums/PaymentType';
import { EscrowType } from '../../src/api/enums/EscrowType';
import { Currency } from '../../src/api/enums/Currency';
import { CryptocurrencyAddressType } from '../../src/api/enums/CryptocurrencyAddressType';
import { MessagingProtocolType } from '../../src/api/enums/MessagingProtocolType';

describe('/listing-items', () => {

    const keys = [
        'id', 'updatedAt', 'createdAt', 'hash' // , 'Related'
    ];

    // const keysWithoutRelated = [
    //    'id', 'updatedAt', 'createdAt',
    // ];

    const testData = {
        hash: 'hash1',
        itemInformation: {
            title: 'item title1',
            shortDescription: 'item short desc1',
            longDescription: 'item long desc1',
            itemCategory: {
                name: 'ROOT',
                description: 'item category description 1'
            },
            itemLocation: {
                region: Country.SOUTH_AFRICA,
                address: 'asdf, asdf, asdf',
                locationMarker: {
                    markerTitle: 'Helsinki',
                    markerText: 'Helsinki',
                    lat: 12.1234,
                    lng: 23.2314
                }
            },
            shippingDestinations: [{
                country: Country.UNITED_KINGDOM,
                shippingAvailability: ShippingAvailability.DOES_NOT_SHIP
            }, {
                country: Country.ASIA,
                shippingAvailability: ShippingAvailability.SHIPS
            }, {
                country: Country.SOUTH_AFRICA,
                shippingAvailability: ShippingAvailability.ASK
            }],
            itemImages: [{
                hash: 'imagehash1',
                data: {
                    dataId: 'dataid1',
                    protocol: ImageDataProtocolType.IPFS,
                    encoding: null,
                    data: null
                }
            }, {
                hash: 'imagehash2',
                data: {
                    dataId: 'dataid2',
                    protocol: ImageDataProtocolType.LOCAL,
                    encoding: 'BASE64',
                    data: 'BASE64 encoded image data'
                }
            }, {
                hash: 'imagehash3',
                data: {
                    dataId: 'dataid3',
                    protocol: ImageDataProtocolType.SMSG,
                    encoding: null,
                    data: 'smsgdata'
                }
            }]
        },
        paymentInformation: {
            type: PaymentType.SALE,
            escrow: {
                type: EscrowType.MAD,
                ratio: {
                    buyer: 100,
                    seller: 100
                }
            },
            itemPrice: {
                currency: Currency.BITCOIN,
                basePrice: 0.0001,
                shippingPrice: {
                    domestic: 0.123,
                    international: 1.234
                },
                address: {
                    type: CryptocurrencyAddressType.NORMAL,
                    address: '1234'
                }
            }
        },
        messagingInformation: {
            protocol: MessagingProtocolType.SMSG,
            publicKey: 'publickey1'
        }
        // TODO: ignoring listingitemobjects for now
    };

    const testDataUpdated = {
        hash: 'hash2',
        itemInformation: {
            title: 'title UPDATED',
            shortDescription: 'item UPDATED',
            longDescription: 'item UPDATED',
            itemCategory: {
                name: 'CHILD',
                description: 'item UPDATED'
            },
            itemLocation: {
                region: Country.FINLAND,
                address: 'asdf UPDATED',
                locationMarker: {
                    markerTitle: 'UPDATED',
                    markerText: 'UPDATED',
                    lat: 33.333,
                    lng: 44.333
                }
            },
            shippingDestinations: [{
                country: Country.EU,
                shippingAvailability: ShippingAvailability.SHIPS
            }],
            itemImages: [{
                hash: 'imagehash1 UPDATED',
                data: {
                    dataId: 'dataid1 UPDATED',
                    protocol: ImageDataProtocolType.IPFS,
                    encoding: null,
                    data: null
                }
            }]
        },
        paymentInformation: {
            type: PaymentType.FREE,
            escrow: {
                type: EscrowType.MAD,
                ratio: {
                    buyer: 1,
                    seller: 1
                }
            },
            itemPrice: {
                currency: Currency.PARTICL,
                basePrice: 3.333,
                shippingPrice: {
                    domestic: 1.111,
                    international: 2.222
                },
                address: {
                    type: CryptocurrencyAddressType.STEALTH,
                    address: '1234 UPDATED'
                }
            }
        },
        messagingInformation: {
            protocol: MessagingProtocolType.SMSG,
            publicKey: 'publickey1 UPDATED'
        }
        // TODO: ignoring listingitemobjects for now
    };

    let createdId;
    let createdHash;
    beforeAll(async () => {
        const command = new DatabaseResetCommand();
        await command.run();
    });

    test('POST      /listing-items        Should create a new listing item', async () => {
        const res = await api('POST', '/api/listing-items', {
            body: testData
        });
        res.expectJson();
        res.expectStatusCode(201);
        res.expectData(keys);
        createdId = res.getData()['id'];
        createdHash = res.getData()['hash'];
        const result: any = res.getData();
        expect(result.hash).toBe(testData.hash);
        expect(result.ItemInformation.title).toBe(testData.itemInformation.title);
        expect(result.ItemInformation.shortDescription).toBe(testData.itemInformation.shortDescription);
        expect(result.ItemInformation.longDescription).toBe(testData.itemInformation.longDescription);
        expect(result.ItemInformation.ItemCategory.name).toBe(testData.itemInformation.itemCategory.name);
        expect(result.ItemInformation.ItemCategory.description).toBe(testData.itemInformation.itemCategory.description);
        expect(result.ItemInformation.ItemLocation.region).toBe(testData.itemInformation.itemLocation.region);
        expect(result.ItemInformation.ItemLocation.address).toBe(testData.itemInformation.itemLocation.address);
        expect(result.ItemInformation.ItemLocation.LocationMarker.markerTitle).toBe(testData.itemInformation.itemLocation.locationMarker.markerTitle);
        expect(result.ItemInformation.ItemLocation.LocationMarker.markerText).toBe(testData.itemInformation.itemLocation.locationMarker.markerText);
        expect(result.ItemInformation.ItemLocation.LocationMarker.lat).toBe(testData.itemInformation.itemLocation.locationMarker.lat);
        expect(result.ItemInformation.ItemLocation.LocationMarker.lng).toBe(testData.itemInformation.itemLocation.locationMarker.lng);
        expect(result.ItemInformation.ShippingDestinations).toHaveLength(3);
        expect(result.ItemInformation.ItemImages).toHaveLength(3);
        expect(result.PaymentInformation.type).toBe(testData.paymentInformation.type);
        expect(result.PaymentInformation.Escrow.type).toBe(testData.paymentInformation.escrow.type);
        expect(result.PaymentInformation.Escrow.Ratio.buyer).toBe(testData.paymentInformation.escrow.ratio.buyer);
        expect(result.PaymentInformation.Escrow.Ratio.seller).toBe(testData.paymentInformation.escrow.ratio.seller);
        expect(result.PaymentInformation.ItemPrice.currency).toBe(testData.paymentInformation.itemPrice.currency);
        expect(result.PaymentInformation.ItemPrice.basePrice).toBe(testData.paymentInformation.itemPrice.basePrice);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.domestic).toBe(testData.paymentInformation.itemPrice.shippingPrice.domestic);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.international).toBe(testData.paymentInformation.itemPrice.shippingPrice.international);
        expect(result.PaymentInformation.ItemPrice.Address.type).toBe(testData.paymentInformation.itemPrice.address.type);
        expect(result.PaymentInformation.ItemPrice.Address.address).toBe(testData.paymentInformation.itemPrice.address.address);
        expect(result.MessagingInformation.protocol).toBe(testData.messagingInformation.protocol);
        expect(result.MessagingInformation.publicKey).toBe(testData.messagingInformation.publicKey);
    });

    test('POST      /listing-items        Should fail because we want to create a empty listing item', async () => {
        const res = await api('POST', '/api/listing-items', {
            body: {}
        });
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('GET       /listing-items        Should list listing items with our new create one', async () => {
        const res = await api('GET', '/api/listing-items');
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys); // keysWithoutRelated
        const data = res.getData<any[]>();
        expect(data.length).toBe(1);

        const result = data[0];
        expect(result.hash).toBe(testData.hash);
    });

    test('GET       /listing-items/:id    Should return one listing item', async () => {
        const res = await api('GET', `/api/listing-items/${createdId}`);
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys);

        const result: any = res.getData();
        expect(result.hash).toBe(testData.hash);
        expect(result.ItemInformation.title).toBe(testData.itemInformation.title);
        expect(result.ItemInformation.shortDescription).toBe(testData.itemInformation.shortDescription);
        expect(result.ItemInformation.longDescription).toBe(testData.itemInformation.longDescription);
        expect(result.ItemInformation.ItemCategory.name).toBe(testData.itemInformation.itemCategory.name);
        expect(result.ItemInformation.ItemCategory.description).toBe(testData.itemInformation.itemCategory.description);
        expect(result.ItemInformation.ItemLocation.region).toBe(testData.itemInformation.itemLocation.region);
        expect(result.ItemInformation.ItemLocation.address).toBe(testData.itemInformation.itemLocation.address);
        expect(result.ItemInformation.ItemLocation.LocationMarker.markerTitle).toBe(testData.itemInformation.itemLocation.locationMarker.markerTitle);
        expect(result.ItemInformation.ItemLocation.LocationMarker.markerText).toBe(testData.itemInformation.itemLocation.locationMarker.markerText);
        expect(result.ItemInformation.ItemLocation.LocationMarker.lat).toBe(testData.itemInformation.itemLocation.locationMarker.lat);
        expect(result.ItemInformation.ItemLocation.LocationMarker.lng).toBe(testData.itemInformation.itemLocation.locationMarker.lng);
        expect(result.ItemInformation.ShippingDestinations).toHaveLength(3);
        expect(result.ItemInformation.ItemImages).toHaveLength(3);
        expect(result.PaymentInformation.type).toBe(testData.paymentInformation.type);
        expect(result.PaymentInformation.Escrow.type).toBe(testData.paymentInformation.escrow.type);
        expect(result.PaymentInformation.Escrow.Ratio.buyer).toBe(testData.paymentInformation.escrow.ratio.buyer);
        expect(result.PaymentInformation.Escrow.Ratio.seller).toBe(testData.paymentInformation.escrow.ratio.seller);
        expect(result.PaymentInformation.ItemPrice.currency).toBe(testData.paymentInformation.itemPrice.currency);
        expect(result.PaymentInformation.ItemPrice.basePrice).toBe(testData.paymentInformation.itemPrice.basePrice);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.domestic).toBe(testData.paymentInformation.itemPrice.shippingPrice.domestic);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.international).toBe(testData.paymentInformation.itemPrice.shippingPrice.international);
        expect(result.PaymentInformation.ItemPrice.Address.type).toBe(testData.paymentInformation.itemPrice.address.type);
        expect(result.PaymentInformation.ItemPrice.Address.address).toBe(testData.paymentInformation.itemPrice.address.address);
        expect(result.MessagingInformation.protocol).toBe(testData.messagingInformation.protocol);
        expect(result.MessagingInformation.publicKey).toBe(testData.messagingInformation.publicKey);

    });

    test('PUT       /listing-items/:id    Should update the listing item', async () => {
        const res = await api('PUT', `/api/listing-items/${createdId}`, {
            body: testDataUpdated
        });
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys);

        const result: any = res.getData();
        expect(result.hash).toBe(testDataUpdated.hash);
        expect(result.ItemInformation.title).toBe(testDataUpdated.itemInformation.title);
        expect(result.ItemInformation.shortDescription).toBe(testDataUpdated.itemInformation.shortDescription);
        expect(result.ItemInformation.longDescription).toBe(testDataUpdated.itemInformation.longDescription);
        expect(result.ItemInformation.ItemCategory.name).toBe(testDataUpdated.itemInformation.itemCategory.name);
        expect(result.ItemInformation.ItemCategory.description).toBe(testDataUpdated.itemInformation.itemCategory.description);
        expect(result.ItemInformation.ItemLocation.region).toBe(testDataUpdated.itemInformation.itemLocation.region);
        expect(result.ItemInformation.ItemLocation.address).toBe(testDataUpdated.itemInformation.itemLocation.address);
        expect(result.ItemInformation.ItemLocation.LocationMarker.markerTitle).toBe(testDataUpdated.itemInformation.itemLocation.locationMarker.markerTitle);
        expect(result.ItemInformation.ItemLocation.LocationMarker.markerText).toBe(testDataUpdated.itemInformation.itemLocation.locationMarker.markerText);
        expect(result.ItemInformation.ItemLocation.LocationMarker.lat).toBe(testDataUpdated.itemInformation.itemLocation.locationMarker.lat);
        expect(result.ItemInformation.ItemLocation.LocationMarker.lng).toBe(testDataUpdated.itemInformation.itemLocation.locationMarker.lng);
        expect(result.ItemInformation.ShippingDestinations).toHaveLength(1);
        expect(result.ItemInformation.ItemImages).toHaveLength(1);
        expect(result.PaymentInformation.type).toBe(testDataUpdated.paymentInformation.type);
        expect(result.PaymentInformation.Escrow.type).toBe(testDataUpdated.paymentInformation.escrow.type);
        expect(result.PaymentInformation.Escrow.Ratio.buyer).toBe(testDataUpdated.paymentInformation.escrow.ratio.buyer);
        expect(result.PaymentInformation.Escrow.Ratio.seller).toBe(testDataUpdated.paymentInformation.escrow.ratio.seller);
        expect(result.PaymentInformation.ItemPrice.currency).toBe(testDataUpdated.paymentInformation.itemPrice.currency);
        expect(result.PaymentInformation.ItemPrice.basePrice).toBe(testDataUpdated.paymentInformation.itemPrice.basePrice);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.domestic).toBe(testDataUpdated.paymentInformation.itemPrice.shippingPrice.domestic);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.international).toBe(testDataUpdated.paymentInformation.itemPrice.shippingPrice.international);
        expect(result.PaymentInformation.ItemPrice.Address.type).toBe(testDataUpdated.paymentInformation.itemPrice.address.type);
        expect(result.PaymentInformation.ItemPrice.Address.address).toBe(testDataUpdated.paymentInformation.itemPrice.address.address);
        expect(result.MessagingInformation.protocol).toBe(testDataUpdated.messagingInformation.protocol);
        expect(result.MessagingInformation.publicKey).toBe(testDataUpdated.messagingInformation.publicKey);

    });
/*
    test('PUT       /listing-items/:id    Should fail because we want to update the listing item with a invalid email', async () => {
        const res = await api('PUT', `/api/listing-items/${createdId}`, {
            body: {
                email: 'abc'
            }
        });
        res.expectJson();
        res.expectStatusCode(400);
    });
*/
    test('DELETE    /listing-items/:id    Should delete the listing item', async () => {
        const res = await api('DELETE', `/api/listing-items/${createdId}`);
        res.expectStatusCode(200);
    });

    /**
     * 404 - NotFound Testing
     */
    test('GET       /listing-items/:id    Should return with a 404, because we just deleted the listing item', async () => {
        const res = await api('GET', `/api/listing-items/${createdId}`);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('DELETE    /listing-items/:id    Should return with a 404, because we just deleted the listing item', async () => {
        const res = await api('DELETE', `/api/listing-items/${createdId}`);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('PUT       /listing-items/:id    Should return with a 404, because we just deleted the listing item', async () => {
        const res = await api('PUT', `/api/listing-items/${createdId}`, {
            body: testDataUpdated
        });
        res.expectJson();
        res.expectStatusCode(404);
    });

});
