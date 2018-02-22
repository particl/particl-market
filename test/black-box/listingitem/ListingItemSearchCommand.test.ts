import { rpc, api } from '../lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { ShippingAvailability } from '../../../src/api/enums/ShippingAvailability';
import { ImageDataProtocolType } from '../../../src/api/enums/ImageDataProtocolType';
import { EscrowType } from '../../../src/api/enums/EscrowType';
import { Currency } from '../../../src/api/enums/Currency';
import { CryptocurrencyAddressType } from '../../../src/api/enums/CryptocurrencyAddressType';
import { PaymentType } from '../../../src/api/enums/PaymentType';
import { MessagingProtocolType } from '../../../src/api/enums/MessagingProtocolType';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/params/GenerateListingItemTemplateParams';
import { ListingItemTemplate } from 'resources';

describe('ListingItemSearchCommand', () => {
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
    const type = 'FLAGGED'; // to do : only passing, Functionlity need to be implement
    let profileId = '';
    let minPrice = null;
    let maxPrice = null;
    let country = '';
    let shippingDestination = '';
    let searchString = '';
    let withRelated = true;

    beforeAll(async () => {
        await testUtil.cleanDb();

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            false,   // generateItemInformation
            false,   // generateShippingDestinations
            false,   // generateItemImages
            false,   // generatePaymentInformation
            false,   // generateEscrow
            false,   // generateItemPrice
            false,   // generateMessagingInformation
            false    // generateListingItemObjects
        ]).toParamsArray();


        // get default profile
        defaultProfile = await testUtil.getDefaultProfile();

        // add market
        const res = await rpc(marketRootMethod, [addMakretMethod, 'Test Market', 'privateKey', 'Market Address']);
        const result: any = res.getBody()['result'];
        testData.market_id = result.id;

        // create listing item
        const addListingItem1: any = await testUtil.addData(CreatableModel.LISTINGITEM, testData);
        const addListingItem1Result = addListingItem1;
        createdHashFirst = addListingItem1Result.hash;
        categoryId = addListingItem1Result.ItemInformation.ItemCategory.id;
        testDataTwo.market_id = result.id;


        // generate listingItemTemplate
        listingItemTemplate = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as ListingItemTemplate[];

        listingItemTemplate = listingItemTemplate[0];
        testDataTwo.listing_item_template_id = listingItemTemplate.id;
        const addListingItem2: any = await testUtil.addData(CreatableModel.LISTINGITEM, testDataTwo);
        createdHashSecond = addListingItem2.hash;
    });

    test('Should fail to get listing items if type is not pass', async () => {
        const getDataRes: any = await rpc(method, [subCommand, pageNumber,
            pageLimit, order, category, '', profileId, minPrice, maxPrice, country, shippingDestination, searchString, withRelated]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(404);
        expect(getDataRes.error.error.success).toBe(false);
        expect(getDataRes.error.error.message).toBe('Type can\'t be blank, should be FLAGGED | PENDING | LISTED | IN_ESCROW | SHIPPED | SOLD | EXPIRED | ALL');
    });

    test('Should fail to get listing items if profileid is not (NUMBER | OWN | ALL)', async () => {
        const getDataRes: any = await rpc(method, [subCommand, pageNumber,
            pageLimit, order, category, type, profileId, minPrice, maxPrice, country, shippingDestination, searchString, withRelated]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(404);
        expect(getDataRes.error.error.success).toBe(false);
        expect(getDataRes.error.error.message).toBe('Value needs to be number | OWN | ALL. you could pass * as all too');
    });

    test('Should get listing items if profileid = OWN', async () => {
        const getDataRes: any = await rpc(method, [subCommand, pageNumber,
            pageLimit, order, category, type, 'OWN', minPrice, maxPrice, country, shippingDestination, searchString, withRelated]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].hash).toBe(createdHashSecond);
        // expect(result[1].hash).toBe(createdHashSecond);
    });

    test('Should get all listing items, profileid = ALL', async () => {
        // get all listing items
        const getDataRes: any = await rpc(method, [subCommand, pageNumber,
            pageLimit, order, category, type, 'ALL', minPrice, maxPrice, country, shippingDestination, searchString, withRelated]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(2);
        expect(result[0].hash).toBe(createdHashFirst);
        expect(result[1].hash).toBe(createdHashSecond);
    });

    test('Should get all listing items, profileid = *', async () => {
        // get all listing items
        const getDataRes: any = await rpc(method, [subCommand, pageNumber,
            pageLimit, order, category, type, '*', minPrice, maxPrice, country, shippingDestination, searchString, withRelated]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(2);
        expect(result[0].hash).toBe(createdHashFirst);
        expect(result[1].hash).toBe(createdHashSecond);
    });

    test('Should search listing items by profileId = id', async () => {
        // set profile id
        profileId = defaultProfile.id;
        category = '';
        searchString = '';
        const getDataRes: any = await rpc(method, [subCommand, pageNumber,
            pageLimit, order, category, type, profileId, minPrice, maxPrice, country, shippingDestination, searchString, withRelated]);

        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].listingItemTemplateId).toBe(listingItemTemplate.id);
    });

    test('Should get only first listing item by pagination', async () => {
        pageLimit = 1;
        const getDataRes: any = await rpc(method, [subCommand, pageNumber, pageLimit, order, '', type, profileId]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].hash).toBe(createdHashSecond);
    });

    test('Should get second listing item by pagination', async () => {
        pageNumber = 2;
        pageLimit = 1;
        profileId = 'ALL';
        const getDataRes: any = await rpc(method, [subCommand, pageNumber, pageLimit, order, '', type, profileId]);
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
        const getDataRes: any = await rpc(method, [subCommand, pageNumber, pageLimit, order, '', type, profileId]);
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
            pageLimit, order, category, type, profileId, minPrice, maxPrice, country, shippingDestination, searchString, withRelated]);
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
            pageLimit, order, category, type, profileId, minPrice, maxPrice, country, shippingDestination, searchString, withRelated]);

        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(2);
        const categoryRes = result[0].ItemInformation.ItemCategory;
        expect(categoryId).toBe(categoryRes.id);
    });

    test('Should search listing items by searchString = ItemInformation title', async () => {
        // set search term
        searchString = testData.itemInformation.title;
        const getDataRes: any = await rpc(method, [subCommand, pageNumber,
            pageLimit, order, category, type, profileId, minPrice, maxPrice, country, shippingDestination, searchString, withRelated]);

        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(1);
        expect(testData.itemInformation.title).toBe(result[0].ItemInformation.title);
    });

    test('Should return two listing items searched by listing item price', async () => {
        // set profile id
        category = '';
        searchString = '';
        profileId = 'ALL';
        minPrice = 0;
        maxPrice = 4;
        const getDataRes: any = await rpc(method, [subCommand, pageNumber,
            pageLimit, order, category, type, profileId, minPrice, maxPrice, country, shippingDestination, searchString, withRelated]);

        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(2);
    });

    test('Should return one listing items searched by listing item price', async () => {
        category = '';
        searchString = '';
        profileId = 'ALL';
        minPrice = 1;
        maxPrice = 4;
        const getDataRes: any = await rpc(method, [subCommand, pageNumber,
            pageLimit, order, category, type, profileId, minPrice, maxPrice, country, shippingDestination, searchString, withRelated]);

        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(1);
    });

    test('Should return empty listing items searched by listing item invalid price range', async () => {
        category = '';
        searchString = '';
        profileId = 'ALL';
        minPrice = 4;
        maxPrice = 5;
        const getDataRes: any = await rpc(method, [subCommand, pageNumber,
            pageLimit, order, category, type, profileId, minPrice, maxPrice, country, shippingDestination, searchString, withRelated]);

        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(0);
    });

    test('Should return listing item without related', async () => {
        category = '';
        searchString = '';
        profileId = 'ALL';
        minPrice = 0;
        maxPrice = 5;
        country = '';
        shippingDestination = '';
        withRelated = false;
        const getDataRes: any = await rpc(method, [subCommand, pageNumber,
            pageLimit, order, category, type, profileId, minPrice, maxPrice, country, shippingDestination, searchString, withRelated]);

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

    test('Should search listing item by item location', async () => {
        category = '';
        searchString = '';
        profileId = 'ALL';
        minPrice = 0;
        maxPrice = 5;
        country = 'South Africa';
        shippingDestination = '';
        withRelated = true;
        const getDataRes: any = await rpc(method, [subCommand, pageNumber,
            pageLimit, order, category, type, profileId, minPrice, maxPrice, country, shippingDestination, searchString, withRelated]);

        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].ItemInformation.ItemLocation.region).toBe(country);

    });


    test('Should search listing item by shipping Destination', async () => {
        category = '';
        searchString = '';
        profileId = 'ALL';
        minPrice = 0;
        maxPrice = 5;
        country = '';
        shippingDestination = 'United Kingdom';
        withRelated = true;
        const getDataRes: any = await rpc(method, [subCommand, pageNumber,
            pageLimit, order, category, type, profileId, minPrice, maxPrice, country, shippingDestination, searchString, withRelated]);

        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].ItemInformation.ShippingDestinations[0].country).toBe(shippingDestination);
    });

    test('Should search listing item by shipping Destination, min-max price and SearchString = information title', async () => {
        category = '';
        searchString = testData.itemInformation.title;
        profileId = 'ALL';
        minPrice = 0;
        maxPrice = 5;
        country = '';
        shippingDestination = 'United Kingdom';
        withRelated = true;
        const getDataRes: any = await rpc(method, [subCommand, pageNumber,
            pageLimit, order, category, type, profileId, minPrice, maxPrice, country, shippingDestination, searchString, withRelated]);

        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(1);
        expect(testData.itemInformation.title).toBe(result[0].ItemInformation.title);
        expect(result[0].ItemInformation.ShippingDestinations[0].country).toBe(shippingDestination);
    });

});
