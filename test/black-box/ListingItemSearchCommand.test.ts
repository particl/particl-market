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
import { Commands } from '../../src/api/commands/CommandEnumType';

describe('/ListingItemSearchCommand', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const testUtil = new BlackBoxTestUtil();
    const method = Commands.ITEM_ROOT.commandName;
    const addMakretMethod = Commands.MARKET_ADD.commandName;
    const subCommand = Commands.ITEM_SEARCH.commandName;
    const marketRootMethod = Commands.MARKET_ROOT.commandName;

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
        listing_item_template_id: null,
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
    let defaultProfile;
    let listingItemTemplate;

    // listingItemSearch parameter
    let pageNumber = 1;
    let pageLimit = 2;
    const order = 'ASC';
    let category = '';
    let profileId = '';
    let minPrice = null;
    let maxPrice = null;
    let searchString = '';
    let withRelated = true;

    beforeAll(async () => {
        await testUtil.cleanDb();
        // get default profile
        defaultProfile = await testUtil.getDefaultProfile();

        // add market
        const res = await rpc(marketRootMethod, [addMakretMethod, 'Test Market', 'privateKey', 'Market Address']);
        const result: any = res.getBody()['result'];
        testData.market_id = result.id;

        // create listing item
        const addListingItem1: any = await testUtil.addData('listingitem', testData);
        const addListingItem1Result = addListingItem1.getBody()['result'];
        createdHashFirst = addListingItem1Result.hash;
        categoryId = addListingItem1Result.ItemInformation.ItemCategory.id;
        testDataTwo.market_id = result.id;

        // generate item template
        listingItemTemplate = await testUtil.generateData('listingitemtemplate', 1);
        listingItemTemplate = listingItemTemplate[0];
        testDataTwo.listing_item_template_id = listingItemTemplate.id;
        const addListingItem2: any = await testUtil.addData('listingitem', testDataTwo);
        createdHashSecond = addListingItem2.getBody()['result'].hash;
    });


    test('Should get all listing items', async () => {
        // get all listing items
        const getDataRes: any = await rpc(method, [subCommand, pageNumber,
            pageLimit, order, category, profileId, minPrice, maxPrice, searchString, withRelated]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(2);
        expect(result[0].hash).toBe(createdHashFirst);
        expect(result[1].hash).toBe(createdHashSecond);
    });

    test('Should get only first listing item by pagination', async () => {
        pageLimit = 1;
        const getDataRes: any = await rpc(method, [subCommand, pageNumber, pageLimit, order]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].hash).toBe(createdHashFirst);
    });

    test('Should get second listing item by pagination', async () => {
        pageNumber = 2;
        pageLimit = 1;
        const getDataRes: any = await rpc(method, [subCommand, pageNumber, pageLimit, order]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].hash).toBe(createdHashSecond);
    });

    // TODO: maybe we should rather return an error?
    test('Should return empty listing items array if invalid pagination', async () => {
        pageNumber = 2;
        pageLimit = 2;
        const getDataRes: any = await rpc(method, [subCommand, pageNumber, pageLimit, order]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(0);
    });

    test('Should search listing items by category key', async () => {
        pageNumber = 1;
        pageLimit = 2;
        category = 'cat_high_luxyry_items';

        const getDataRes: any = await rpc(method, [subCommand, pageNumber,
            pageLimit, order, category, profileId, minPrice, maxPrice, searchString, withRelated]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(2);

        const categoryRes = result[0].ItemInformation.ItemCategory;
        expect('cat_high_luxyry_items').toBe(categoryRes.key);
    });

    test('Should search listing items by category id', async () => {
        category = categoryId;
        const getDataRes: any = await rpc(method, [subCommand, pageNumber,
            pageLimit, order, category, profileId, minPrice, maxPrice, searchString, withRelated]);

        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(2);
        const categoryRes = result[0].ItemInformation.ItemCategory;
        expect(categoryId).toBe(categoryRes.id);
    });

    test('Should search listing items by ItemInformation title', async () => {
        // set search term
        searchString = testData.itemInformation.title;
        const getDataRes: any = await rpc(method, [subCommand, pageNumber,
            pageLimit, order, category, profileId, minPrice, maxPrice, searchString, withRelated]);

        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(1);
        expect(testData.itemInformation.title).toBe(result[0].ItemInformation.title);
    });

    test('Should search listing items by profileId', async () => {
        // set profile id
        profileId = defaultProfile.id;
        category = '';
        searchString = '';
        const getDataRes: any = await rpc(method, [subCommand, pageNumber,
            pageLimit, order, category, profileId, minPrice, maxPrice, searchString, withRelated]);

        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].listingItemTemplateId).toBe(listingItemTemplate.id);
    });

    test('Should return two listing items searched by listing item price', async () => {
        // set profile id
        category = '';
        searchString = '';
        profileId = '';
        minPrice = 0;
        maxPrice = 4;
        const getDataRes: any = await rpc(method, [subCommand, pageNumber,
            pageLimit, order, category, profileId, minPrice, maxPrice, searchString, withRelated]);

        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(2);
    });

    test('Should return one listing items searched by listing item price', async () => {
        // set profile id
        profileId = '';
        category = '';
        searchString = '';
        profileId = '';
        minPrice = 1;
        maxPrice = 4;
        const getDataRes: any = await rpc(method, [subCommand, pageNumber,
            pageLimit, order, category, profileId, minPrice, maxPrice, searchString, withRelated]);

        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(1);
    });

    test('Should return empty listing items searched by listing item invalid price range', async () => {
        // set profile id
        profileId = '';
        category = '';
        searchString = '';
        profileId = '';
        minPrice = 4;
        maxPrice = 5;
        const getDataRes: any = await rpc(method, [subCommand, pageNumber,
            pageLimit, order, category, profileId, minPrice, maxPrice, searchString, withRelated]);

        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(0);
    });

    test('Should return listing item without related', async () => {
        profileId = '';
        category = '';
        searchString = '';
        profileId = '';
        minPrice = 0;
        maxPrice = 5;
        withRelated = false;
        const getDataRes: any = await rpc(method, [subCommand, pageNumber,
            pageLimit, order, category, profileId, minPrice, maxPrice, searchString, withRelated]);

        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(2);
        expect(result.ItemInformation).toBeUndefined();
        expect(result.PaymentInformation).toBeUndefined();
        expect(result.MessagingInformation).toBeUndefined();
        expect(result.ListingItemObjects).toBeUndefined();
        expect(result.Bids).toBeUndefined();
        expect(result.Market).toBeUndefined();
    });
});
