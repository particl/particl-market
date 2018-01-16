import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { ShippingAvailability } from '../../src/api/enums/ShippingAvailability';
import { ImageDataProtocolType } from '../../src/api/enums/ImageDataProtocolType';
import { EscrowType } from '../../src/api/enums/EscrowType';
import { Currency } from '../../src/api/enums/Currency';
import { CryptocurrencyAddressType } from '../../src/api/enums/CryptocurrencyAddressType';
import { PaymentType } from '../../src/api/enums/PaymentType';
import { MessagingProtocolType } from '../../src/api/enums/MessagingProtocolType';
import { Logger } from '../../src/core/Logger';
import { ListingItemSearchCommand } from '../../src/api/commands/listingitem/ListingItemSearchCommand';
import { MarketCreateCommand } from '../../src/api/commands/market/MarketCreateCommand';


describe('/ListingItemSearchCommand', () => {
    const testUtil = new BlackBoxTestUtil();
    const listingItemService = null;
    const method =  new ListingItemSearchCommand(listingItemService, Logger).name;
    const addMakretMethod =  new MarketCreateCommand(listingItemService, Logger).name;

    const testData = {
        market_id: 0,
        hash: 'hash1',
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
            publicKey: 'publickey1'
        }]
    };

    const testDataTwo = {
        market_id: 0,
        hash: 'hash2',
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
        }]
    };

    let createdHashFirst;
    let createdHashSecond;
    let categoryId;

    beforeAll(async () => {
        await testUtil.cleanDb();
        // add market
        const res = await rpc(addMakretMethod, ['Test Market', 'privateKey', 'Market Address']);
        const result: any = res.getBody()['result'];
        testData.market_id = result.id;
        // create listing item
        const addListingItem1: any = await testUtil.addData('listingitem', testData);
        const addListingItem1Result = addListingItem1.getBody()['result'];
        createdHashFirst = addListingItem1Result.hash;
        categoryId = addListingItem1Result.ItemInformation.ItemCategory.id;
        testDataTwo.market_id = result.id;
        const addListingItem2: any = await testUtil.addData('listingitem', testDataTwo);
        createdHashSecond = addListingItem2.getBody()['result'].hash;
    });


    test('Should get all listing items', async () => {
        // get all listing items
        const getDataRes: any = await rpc(method, [1, 2, 'ASC', '', '', true]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(2);
        expect(result[0].hash).toBe(createdHashFirst);
        expect(result[1].hash).toBe(createdHashSecond);
    });

    test('Should get only first listing item by pagination', async () => {
        const getDataRes: any = await rpc(method, [1, 1, 'ASC']);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].hash).toBe(createdHashFirst);
    });

    test('Should get second listing item by pagination', async () => {
        const getDataRes: any = await rpc(method, [2, 1, 'ASC']);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].hash).toBe(createdHashSecond);
    });

    // TODO: maybe we should rather return an error?
    test('Should return empty listing items array if invalid pagination', async () => {
        const getDataRes: any = await rpc(method, [2, 2, 'ASC']);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(0);
    });

    test('Should search listing items by category key', async () => {
        const getDataRes: any = await rpc(method, [1, 2, 'ASC', 'cat_high_luxyry_items', '', true]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(2);

        const category = result[0].ItemInformation.ItemCategory;
        expect('cat_high_luxyry_items').toBe(category.key);
    });

    test('Should search listing items by category id', async () => {
        const getDataRes: any = await rpc(method, [1, 2, 'ASC', categoryId, '', true]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(2);
        const category = result[0].ItemInformation.ItemCategory;
        expect(categoryId).toBe(category.id);
    });

    /**
     * TODO
     * result [{
     *      id: 1,
     *      hash: '694193c4-1ff2-45b3-94db-11ab45b4db61',
     *      listingItemTemplateId: null,
     *      updatedAt: 1511919276560,
     *      createdAt: 1511919276560
     * }]
     * ...search doesnt seem to be returning relations
     */
    test('Should search listing items by ItemInformation title', async () => {
        const getDataRes: any = await rpc(method, [1, 2, 'ASC', '', testData.itemInformation.title, true]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(1);
        expect(testData.itemInformation.title).toBe(result[0].ItemInformation.title);
    });
});



