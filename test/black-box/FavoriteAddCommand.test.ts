import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { EscrowType } from '../../src/api/enums/EscrowType';
import { Currency } from '../../src/api/enums/Currency';
import { Country } from '../../src/api/enums/Country';
import { ShippingAvailability } from '../../src/api/enums/ShippingAvailability';
import { PaymentType } from '../../src/api/enums/PaymentType';
import { ImageDataProtocolType } from '../../src/api/enums/ImageDataProtocolType';

import { CryptocurrencyAddressType } from '../../src/api/enums/CryptocurrencyAddressType';
import { MessagingProtocolType } from '../../src/api/enums/MessagingProtocolType';
import { Logger } from '../../src/core/Logger';
import { FavoriteAddCommand } from '../../src/api/commands/favorite/FavoriteAddCommand';
import { MarketCreateCommand } from '../../src/api/commands/market/MarketCreateCommand';

describe('/FavoriteAddCommand', () => {
    const testUtil = new BlackBoxTestUtil();
    const favoriteItemService = null;
    const listingItemService = null;
    const profileService = null;
    const marketService = null;
    const method =  new FavoriteAddCommand(favoriteItemService, listingItemService, profileService, Logger).name;
    const addMakretMethod =  new MarketCreateCommand(marketService, Logger).name;

    const testData = {
        market_id: 0,
        hash: 'hash',
        itemInformation: {
            title: 'item title',
            shortDescription: 'item short desc',
            longDescription: 'item long desc',
            itemCategory: {
                key: 'cat_high_luxyry_items'
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
                hash: 'imagehash',
                data: {
                    dataId: 'dataid',
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
                cryptocurrencyAddress: {
                    type: CryptocurrencyAddressType.NORMAL,
                    address: '1234'
                }
            }
        },
        messagingInformation: [{
            protocol: MessagingProtocolType.SMSG,
            publicKey: 'publickey'
        }]
        // TODO: ignoring listingitemobjects for now
    };

    let defaultProfileId;
    let profileId;
    let listingItemHash;
    let listingItemId;

    beforeAll(async () => {
        await testUtil.cleanDb();
        const defaultProfile = await testUtil.getDefaultProfile();
        defaultProfileId = defaultProfile.id;
        const addProfileRes: any = await testUtil.addData('profile', { name: 'TESTING-PROFILE-NAME', address: 'TESTING-PROFILE-ADDRESS' });
        profileId = addProfileRes.getBody()['result'].id;
        // create market
        const resMarket = await rpc(addMakretMethod, ['Test Market', 'privateKey', 'Market Address']);
        const resultMarket: any = resMarket.getBody()['result'];
        testData.market_id = resultMarket.id;
        // create listing item
        const addListingItem: any = await testUtil.addData('listingitem', testData);
        const addListingItemResult = addListingItem.getBody()['result'];
        listingItemHash = addListingItemResult.hash;
        listingItemId = addListingItemResult.id;
    });

    test('Should add favorite item by listing id and profile id', async () => {
        // add favorite item
        const getDataRes: any = await rpc(method, [listingItemId, profileId]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.listingItemId).toBe(listingItemId);
        expect(result.profileId).toBe(profileId);
    });

    test('Should add favorite item by listing hash and profile id', async () => {
        // add favorite item by item hash and profile
        const getDataRes: any = await rpc(method, [listingItemHash, profileId]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.listingItemId).toBe(listingItemId);
        expect(result.profileId).toBe(profileId);
    });

    test('Should add favorite item by listing id and with default profile', async () => {
        // add favorite item without profile
        const getDataRes: any = await rpc(method, [listingItemId]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.listingItemId).toBe(listingItemId);
        expect(result.profileId).toBe(defaultProfileId);
    });

    test('Should fail because we want to create an empty favorite', async () => {
        const getDataRes: any = await rpc(method, []);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(404);
    });
});
