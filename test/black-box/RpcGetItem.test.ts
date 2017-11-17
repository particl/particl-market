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
        'id', 'updatedAt', 'createdAt'  // , 'Related'
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

    let createdId;
    let createdHash;
    beforeAll(async () => {
        const command = new DatabaseResetCommand();
        await command.run();
    });


    test('Should get the listing item by hash', async () => {
        // create listing item
        const res = await api('POST', '/api/listing-items', {
            body: testData
        });
        res.expectJson();
        res.expectStatusCode(201);
        res.expectData(keys);
        createdHash = res.getData()['hash'];
        createdId = res.getData()['id'];
        // find listing item by hash
        const resMain = await api('POST', `/api/rpc`, {
            body: {
                method: 'getitem',
                params:  [createdHash],
                id: 1,
                jsonrpc: '2.0'
            }

        });

        resMain.expectJson();
        resMain.expectStatusCode(200);
        resMain.expectDataRpc(keys);
        const resultMain: any = resMain.getBody()['result'];

        expect(resultMain.hash).toBe(testData.hash);
        expect(createdHash).toBe(resultMain.hash);
        expect(resultMain.ItemInformation.title).toBe(testData.itemInformation.title);
        expect(resultMain.ItemInformation.shortDescription).toBe(testData.itemInformation.shortDescription);
        expect(resultMain.ItemInformation.longDescription).toBe(testData.itemInformation.longDescription);
        expect(resultMain.ItemInformation.ItemCategory.name).toBe(testData.itemInformation.itemCategory.name);
        expect(resultMain.ItemInformation.ItemCategory.description).toBe(testData.itemInformation.itemCategory.description);
        expect(resultMain.ItemInformation.ItemLocation.region).toBe(testData.itemInformation.itemLocation.region);
        expect(resultMain.ItemInformation.ItemLocation.address).toBe(testData.itemInformation.itemLocation.address);
        expect(resultMain.ItemInformation.ItemLocation.LocationMarker.markerTitle).toBe(testData.itemInformation.itemLocation.locationMarker.markerTitle);
        expect(resultMain.ItemInformation.ItemLocation.LocationMarker.markerText).toBe(testData.itemInformation.itemLocation.locationMarker.markerText);
        expect(resultMain.ItemInformation.ItemLocation.LocationMarker.lat).toBe(testData.itemInformation.itemLocation.locationMarker.lat);
        expect(resultMain.ItemInformation.ItemLocation.LocationMarker.lng).toBe(testData.itemInformation.itemLocation.locationMarker.lng);
        expect(resultMain.ItemInformation.ShippingDestinations).toHaveLength(3);
        expect(resultMain.ItemInformation.ItemImages).toHaveLength(3);
        expect(resultMain.PaymentInformation.type).toBe(testData.paymentInformation.type);
        expect(resultMain.PaymentInformation.Escrow.type).toBe(testData.paymentInformation.escrow.type);
        expect(resultMain.PaymentInformation.Escrow.Ratio.buyer).toBe(testData.paymentInformation.escrow.ratio.buyer);
        expect(resultMain.PaymentInformation.Escrow.Ratio.seller).toBe(testData.paymentInformation.escrow.ratio.seller);
        expect(resultMain.PaymentInformation.ItemPrice.currency).toBe(testData.paymentInformation.itemPrice.currency);
        expect(resultMain.PaymentInformation.ItemPrice.basePrice).toBe(testData.paymentInformation.itemPrice.basePrice);
        expect(resultMain.PaymentInformation.ItemPrice.ShippingPrice.domestic).toBe(testData.paymentInformation.itemPrice.shippingPrice.domestic);
        expect(resultMain.PaymentInformation.ItemPrice.ShippingPrice.international).toBe(testData.paymentInformation.itemPrice.shippingPrice.international);
        expect(resultMain.PaymentInformation.ItemPrice.Address.type).toBe(testData.paymentInformation.itemPrice.address.type);
        expect(resultMain.PaymentInformation.ItemPrice.Address.address).toBe(testData.paymentInformation.itemPrice.address.address);
        expect(resultMain.MessagingInformation.protocol).toBe(testData.messagingInformation.protocol);
        expect(resultMain.MessagingInformation.publicKey).toBe(testData.messagingInformation.publicKey);
    });

    test('Should get the listing item by id', async () => {
        // find listing item by id
        const resMainById = await api('POST', `/api/rpc`, {
            body: {
                method: 'getitem',
                params:  [createdId],
                id: 1,
                jsonrpc: '2.0'
            }
        });

        resMainById.expectJson();
        resMainById.expectStatusCode(200);
        resMainById.expectDataRpc(keys);
        const resultMainById: any = resMainById.getBody()['result'];

        expect(resultMainById.hash).toBe(testData.hash);
        expect(createdHash).toBe(resultMainById.hash);
        expect(resultMainById.ItemInformation.title).toBe(testData.itemInformation.title);
        expect(resultMainById.ItemInformation.shortDescription).toBe(testData.itemInformation.shortDescription);
        expect(resultMainById.ItemInformation.longDescription).toBe(testData.itemInformation.longDescription);
        expect(resultMainById.ItemInformation.ItemCategory.name).toBe(testData.itemInformation.itemCategory.name);
        expect(resultMainById.ItemInformation.ItemCategory.description).toBe(testData.itemInformation.itemCategory.description);
        expect(resultMainById.ItemInformation.ItemLocation.region).toBe(testData.itemInformation.itemLocation.region);
        expect(resultMainById.ItemInformation.ItemLocation.address).toBe(testData.itemInformation.itemLocation.address);
        expect(resultMainById.ItemInformation.ItemLocation.LocationMarker.markerTitle).toBe(testData.itemInformation.itemLocation.locationMarker.markerTitle);
        expect(resultMainById.ItemInformation.ItemLocation.LocationMarker.markerText).toBe(testData.itemInformation.itemLocation.locationMarker.markerText);
        expect(resultMainById.ItemInformation.ItemLocation.LocationMarker.lat).toBe(testData.itemInformation.itemLocation.locationMarker.lat);
        expect(resultMainById.ItemInformation.ItemLocation.LocationMarker.lng).toBe(testData.itemInformation.itemLocation.locationMarker.lng);
        expect(resultMainById.ItemInformation.ShippingDestinations).toHaveLength(3);
        expect(resultMainById.ItemInformation.ItemImages).toHaveLength(3);
        expect(resultMainById.PaymentInformation.type).toBe(testData.paymentInformation.type);
        expect(resultMainById.PaymentInformation.Escrow.type).toBe(testData.paymentInformation.escrow.type);
        expect(resultMainById.PaymentInformation.Escrow.Ratio.buyer).toBe(testData.paymentInformation.escrow.ratio.buyer);
        expect(resultMainById.PaymentInformation.Escrow.Ratio.seller).toBe(testData.paymentInformation.escrow.ratio.seller);
        expect(resultMainById.PaymentInformation.ItemPrice.currency).toBe(testData.paymentInformation.itemPrice.currency);
        expect(resultMainById.PaymentInformation.ItemPrice.basePrice).toBe(testData.paymentInformation.itemPrice.basePrice);
        expect(resultMainById.PaymentInformation.ItemPrice.ShippingPrice.domestic).toBe(testData.paymentInformation.itemPrice.shippingPrice.domestic);
        expect(resultMainById.PaymentInformation.ItemPrice.ShippingPrice.international).toBe(testData.paymentInformation.itemPrice.shippingPrice.international);
        expect(resultMainById.PaymentInformation.ItemPrice.Address.type).toBe(testData.paymentInformation.itemPrice.address.type);
        expect(resultMainById.PaymentInformation.ItemPrice.Address.address).toBe(testData.paymentInformation.itemPrice.address.address);
        expect(resultMainById.MessagingInformation.protocol).toBe(testData.messagingInformation.protocol);
        expect(resultMainById.MessagingInformation.publicKey).toBe(testData.messagingInformation.publicKey);

    });

});
