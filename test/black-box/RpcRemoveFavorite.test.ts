import * as _ from 'lodash';
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
describe('/RpcRemoveFavorite', () => {
    const keys = [
        'id', 'listingItemId', 'profileId', 'updatedAt', 'createdAt'  // , 'Related'
    ];
    const testProfileData = {
        name: 'DEFAULT',
        addresses: [{
            title: 'Title',
            addressLine1: 'Add',
            addressLine2: 'ADD 22',
            city: 'city',
            country: Country.SWEDEN
        }, {
            title: 'Tite',
            addressLine1: 'Ad',
            addressLine2: 'ADD 222',
            city: 'city',
            country: Country.FINLAND
        }]
    };

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

    let createdItemId;
    let createdProfileId;
    let createdHash;
    let createdDefaultProfileId;
    beforeAll(async () => {
        const command = new DatabaseResetCommand();
        await command.run();
    });

    test('Should remove favorite item by listing id and profile id', async () => {
        // create profile
        const res = await api('POST', '/api/rpc', {
            body: {
                method: 'createprofile',
                params: [
                    'TEST'
                ],
                jsonrpc: '2.0'
            }
        });
        res.expectJson();
        res.expectStatusCode(200);
        const profileResult: object = res.getBody()['result'];
        createdProfileId = profileResult['id'];

        // create listing item
        const listingRes = await api('POST', '/api/listing-items', {
            body: testData
        });
        listingRes.expectJson();
        listingRes.expectStatusCode(201);
        const listingResult: any = listingRes.getBody()['data'];
        createdItemId = listingResult['id'];
        createdHash = listingResult['hash'];

        // add favorite item
        const favoriteRes = await api('POST', '/api/rpc', {
            body: {
                method: 'addfavorite',
                params: [
                    createdItemId, createdProfileId
                ],
                jsonrpc: '2.0'
            }
        });

        favoriteRes.expectJson();
        favoriteRes.expectStatusCode(200);
        favoriteRes.expectDataRpc(keys);
        const favResult: any = favoriteRes.getBody()['result'];
        expect(favResult.listingItemId).toBe(createdItemId);
        expect(favResult.profileId).toBe(createdProfileId);

        // remove favorite item by item id and profile
        const removeRes = await api('POST', '/api/rpc', {
            body: {
                method: 'removefavorite',
                params: [ createdItemId, createdProfileId ],
                jsonrpc: '2.0'
            }
        });

        removeRes.expectJson();
        removeRes.expectStatusCode(200);

    });

    test('Should remove favorite item by listing id and with default profile', async () => {

        // create default profile
        const defaultPrfileRes = await api('POST', '/api/rpc', {
            body: {
                method: 'createprofile',
                params: [
                    'DEFAULT'
                ],
                jsonrpc: '2.0'
            }
        });


        defaultPrfileRes.expectJson();
        defaultPrfileRes.expectStatusCode(200);
        const defaultProfileResult: object = defaultPrfileRes.getBody()['result'];
        createdDefaultProfileId = defaultProfileResult['id'];

        // add favorite item
        const favoriteByHashRes = await api('POST', '/api/rpc', {
            body: {
                method: 'addfavorite',
                params: [
                    createdItemId, createdDefaultProfileId
                ],
                jsonrpc: '2.0'
            }
        });

        favoriteByHashRes.expectJson();
        favoriteByHashRes.expectStatusCode(200);
        favoriteByHashRes.expectDataRpc(keys);
        const favHashResult: any = favoriteByHashRes.getBody()['result'];
        expect(favHashResult.listingItemId).toBe(createdItemId);
        expect(favHashResult.profileId).toBe(createdDefaultProfileId);

        // remove favorite item with default profile
        const favoriteRes = await api('POST', '/api/rpc', {
            body: {
                method: 'removefavorite',
                params: [ createdItemId ],
                jsonrpc: '2.0'
            }
        });

        favoriteRes.expectJson();
        favoriteRes.expectStatusCode(200);
    });

    test('Should fail remove favorite because favorite already removed', async () => {

        // remove favorite
        const favoriteRes = await api('POST', '/api/rpc', {
            body: {
                method: 'removefavorite',
                params: [ createdItemId ],
                jsonrpc: '2.0'
            }
        });

        favoriteRes.expectJson();
        favoriteRes.expectStatusCode(404);
    });
});
