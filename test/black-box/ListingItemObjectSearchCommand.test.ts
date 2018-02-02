import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { ShippingAvailability } from '../../src/api/enums/ShippingAvailability';
import { ImageDataProtocolType } from '../../src/api/enums/ImageDataProtocolType';
import { EscrowType } from '../../src/api/enums/EscrowType';
import { Currency } from '../../src/api/enums/Currency';
import { CryptocurrencyAddressType } from '../../src/api/enums/CryptocurrencyAddressType';
import { PaymentType } from '../../src/api/enums/PaymentType';
import { MessagingProtocolType } from '../../src/api/enums/MessagingProtocolType';
import { Commands } from '../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { ListingItemObjectType } from '../../src/api/enums/ListingItemObjectType';
import { ObjectHash } from '../../src/core/helpers/ObjectHash';

describe('/ListingItemObjectSearchCommand', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const testUtil = new BlackBoxTestUtil();
    const method = Commands.ITEMOBJECT_ROOT.commandName;
    const addMakretMethod = Commands.MARKET_ADD.commandName;
    const subCommand = Commands.ITEMOBJECT_SEARCH.commandName;
    const marketRootMethod = Commands.MARKET_ROOT.commandName;

    const testData = {
        market_id: 0,
        hash: '',
        itemInformation: {
            title: 'item title1',
            shortDescription: 'item short desc1',
            longDescription: 'item long desc1',
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
                hash: 'imagehash1',
                data: {
                    dataId: 'dataid1',
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
            publicKey: 'publickey1'
        }],
        listingItemObjects: [{
            type: ListingItemObjectType.CHECKBOX,
            description: 'Test description checkbox',
            order: 1,
            searchable: true
        }, {
            type: ListingItemObjectType.TABLE,
            description: 'Test description table',
            order: 2
        }, {
            type: ListingItemObjectType.DROPDOWN,
            description: 'Test description dropdown',
            order: 7
        }]
    };

    const testDataTwo = {
        market_id: 0,
        hash: '',
        itemInformation: {
            title: 'title UPDATED',
            shortDescription: 'item UPDATED',
            longDescription: 'item UPDATED',
            itemCategory: {
                key: 'cat_high_luxyry_items'
            },
            itemLocation: {
                region: 'Finland',
                address: 'UPDATED',
                locationMarker: {
                    markerTitle: 'UPDATED',
                    markerText: 'UPDATED',
                    lat: 33.333,
                    lng: 44.333
                }
            },
            shippingDestinations: [{
                country: 'EU',
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
                cryptocurrencyAddress: {
                    type: CryptocurrencyAddressType.STEALTH,
                    address: 'UPDATED'
                }
            }
        },
        messagingInformation: [{
            protocol: MessagingProtocolType.SMSG,
            publicKey: 'publickey1 UPDATED'
        }],

        listingItemObjects: [{
            type: ListingItemObjectType.CHECKBOX,
            description: 'Test description checkbox 2 CHECKBOX',
            order: 1
        }, {
            type: ListingItemObjectType.TABLE,
            description: 'Test description table 2',
            order: 2
        }, {
            type: ListingItemObjectType.DROPDOWN,
            description: 'Test description dropdown 2',
            order: 7
        }]
    };

    beforeAll(async () => {
        await testUtil.cleanDb();
        // set hash
        testData.hash = ObjectHash.getHash(testData);
        testDataTwo.hash = ObjectHash.getHash(testDataTwo);

        // add market
        const res = await rpc(marketRootMethod, [addMakretMethod, 'Test Market', 'privateKey', 'Market Address']);
        const result: any = res.getBody()['result'];
        testData.market_id = result.id;
        testDataTwo.market_id = result.id;

        // create listing item
        await testUtil.addData(CreatableModel.LISTINGITEM, testData);
        await testUtil.addData(CreatableModel.LISTINGITEM, testDataTwo);
    });

    test('Should fail to search listing item object for the null searchString', async () => {
        // search listing item objects
        const getDataRes: any = await rpc(method, [subCommand]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(400);
    });

    test('Should search empty listing item object for the invalid string search', async () => {
        // search listing item objects
        const getDataRes: any = await rpc(method, [subCommand, 'dapp']);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(0);
    });

    test('Should return 2 listing item object searched by listing item object type', async () => {
        // search listing item objects
        const getDataRes: any = await rpc(method, [subCommand, ListingItemObjectType.CHECKBOX]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(2);
        expect(result[0].type).toBe(ListingItemObjectType.CHECKBOX);
        expect(result[1].type).toBe(ListingItemObjectType.CHECKBOX);
    });

    test('Should return all listing item object searched by Test text with type or description', async () => {
        // search listing item objects
        const getDataRes: any = await rpc(method, [subCommand, 'Test']);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(6);
        expect(result[0].description).toMatch('Test');
        expect(result[0].searchable).toBe(1);
        expect(result[1].searchable).toBe(0);
    });

    test('Should return all listing item object matching with given search string in listing item object type or description', async () => {
        // search listing item objects
        const getDataRes: any = await rpc(method, [subCommand, 'CHECKBOX']);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(2);
        expect(result[0].type).toMatch('CHECKBOX');
        expect(result[0].description).toContain('checkbox');
        expect(result[1].type).toMatch('CHECKBOX');
        expect(result[1].description).toContain('checkbox');
        expect(result[0].searchable).toBe(1);
        expect(result[1].searchable).toBe(0);
    });

});

