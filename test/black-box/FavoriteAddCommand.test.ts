import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { EscrowType } from '../../src/api/enums/EscrowType';
import { Currency } from '../../src/api/enums/Currency';
import { ShippingAvailability } from '../../src/api/enums/ShippingAvailability';
import { PaymentType } from '../../src/api/enums/PaymentType';
import { ImageDataProtocolType } from '../../src/api/enums/ImageDataProtocolType';

import { CryptocurrencyAddressType } from '../../src/api/enums/CryptocurrencyAddressType';
import { MessagingProtocolType } from '../../src/api/enums/MessagingProtocolType';
import { Commands } from '../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../src/api/enums/CreatableModel';

describe('/FavoriteAddCommand', () => {
    const testUtil = new BlackBoxTestUtil();
    const method =  Commands.FAVORITE_ROOT.commandName;
    const subCommand = Commands.FAVORITE_ADD.commandName;
    const addMakretMethod =  Commands.MARKET_ADD.commandName;

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
                region: 'South Africa',
                address: 'asdf, asdf, asdf',
                locationMarker: {
                    markerTitle: 'Helsinki',
                    markerText: 'Helsinki',
                    lat: 12.1234,
                    lng: 23.2314
                }
            },
            shippingDestinations: [{
                country: 'United Kingdom',
                shippingAvailability: ShippingAvailability.DOES_NOT_SHIP
            }, {
                country: 'China',
                shippingAvailability: ShippingAvailability.SHIPS
            }, {
                country: 'South Africa',
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
    };

    let defaultProfileId;
    let profileId;
    let listingItemHash;
    let listingItemId;

    beforeAll(async () => {
        await testUtil.cleanDb();
        const defaultProfile = await testUtil.getDefaultProfile();
        defaultProfileId = defaultProfile.id;
        const addProfileRes: any = await testUtil.addData(CreatableModel.PROFILE { name: 'TESTING-PROFILE-NAME', address: 'TESTING-PROFILE-ADDRESS' });
        profileId = addProfileRes.id;
        // create market
        const resMarket = await rpc(Commands.MARKET_ROOT.commandName, [addMakretMethod, 'Test Market', 'privateKey', 'Market Address']);
        const resultMarket: any = resMarket.getBody()['result'];
        testData.market_id = resultMarket.id;
        // create listing item
        const addListingItem: any = await testUtil.addData(CreatableModel.LISTINGITEM, testData);
        const addListingItemResult = addListingItem;
        listingItemHash = addListingItemResult.hash;
        listingItemId = addListingItemResult.id;
    });

    test('Should add favorite item by listing id and profile id', async () => {
        // add favorite item
        const getDataRes: any = await rpc(method, [subCommand, profileId, listingItemId]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.listingItemId).toBe(listingItemId);
        expect(result.profileId).toBe(profileId);
    });

    test('Should add favorite item by listing hash and profile id', async () => {
        // add favorite item by item hash and profile
        const getDataRes: any = await rpc(method, [subCommand, profileId, listingItemHash]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.listingItemId).toBe(listingItemId);
        expect(result.profileId).toBe(profileId);
    });

    test('Should add favorite item by listing id and with default profile', async () => {
        // add favorite item without profile
        const getDataRes: any = await rpc(method, [subCommand, null, listingItemId]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.listingItemId).toBe(listingItemId);
        expect(result.profileId).toBe(defaultProfileId);
    });

    test('Should fail because we want to create an empty favorite', async () => {
        const getDataRes: any = await rpc(method, [subCommand]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(404);
    });
});
