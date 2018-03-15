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

import * as listingItemCreateRequestBasic1 from '../../testdata/createrequest/listingItemCreateRequestBasic1.json';
import * as listingItemCreateRequestBasic2 from '../../testdata/createrequest/listingItemCreateRequestBasic2.json';
import * as listingItemCreateRequestBasic3 from '../../testdata/createrequest/listingItemCreateRequestBasic3.json';

import * as listingItemUpdateRequestBasic1 from '../../testdata/pdaterequest/listingItemUpdateRequestBasic1.json';

import * as listingItemTemplateCreateRequestBasic1 from '../../testdata/createrequest/listingItemTemplateCreateRequestBasic1.json';
import * as listingItemTemplateCreateRequestBasic2 from '../../testdata/createrequest/listingItemTemplateCreateRequestBasic2.json';

import * as resources from 'resources';
import {ObjectHash} from '../../../src/core/helpers/ObjectHash';

describe('ListingItemSearchCommand', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const testUtil = new BlackBoxTestUtil();
    const itemCommand = Commands.ITEM_ROOT.commandName;
    const searchCommand = Commands.ITEM_SEARCH.commandName;

    const marketCommand = Commands.MARKET_ROOT.commandName;
    const addCommand = Commands.MARKET_ADD.commandName;

    let defaultProfile;
    let customMarket: resources.Market;
    let listingItemTemplates: resources.ListingItemTemplate[];
    let createdListingItem1: resources.ListingItem;
    let createdListingItem2: resources.ListingItem;

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
        const res = await rpc(marketCommand, [addCommand, 'Test Market', 'privateKey', 'Market Address']);
        customMarket = res.getBody()['result'];

        // create first listing item
        listingItemCreateRequestBasic1.market_id = customMarket.id;
        listingItemCreateRequestBasic1.hash = ObjectHash.getHash(listingItemCreateRequestBasic1);
        createdListingItem1 = await testUtil.addData(CreatableModel.LISTINGITEM, listingItemCreateRequestBasic1);

        // generate listingItemTemplate
        listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplates[];

        // create second listing item
        listingItemCreateRequestBasic2.market_id = customMarket.id;
        listingItemCreateRequestBasic2.listing_item_template_id = listingItemTemplates[0].id;
        listingItemCreateRequestBasic2.hash = ObjectHash.getHash(listingItemCreateRequestBasic2);

        createdListingItem2 = await testUtil.addData(CreatableModel.LISTINGITEM, listingItemCreateRequestBasic2);

    });

    test('Should fail to get ListingItems if type is invalid', async () => {
        const getDataRes: any = await rpc(itemCommand, [searchCommand, pageNumber,
            pageLimit, order, category, 'TEST', profileId, minPrice, maxPrice, country, shippingDestination, searchString, withRelated]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(404);
        expect(getDataRes.error.error.success).toBe(false);
        expect(getDataRes.error.error.message).toBe('Type should be FLAGGED | PENDING | LISTED | IN_ESCROW | SHIPPED | SOLD | EXPIRED | ALL');
    });

    test('Should fail to get ListingItems if profileid is not (NUMBER | OWN | ALL)', async () => {
        profileId = 'test';
        const getDataRes: any = await rpc(itemCommand, [searchCommand, pageNumber,
            pageLimit, order, category, type, profileId, minPrice, maxPrice, country, shippingDestination, searchString, withRelated]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(404);
        expect(getDataRes.error.error.success).toBe(false);
        expect(getDataRes.error.error.message).toBe('Value needs to be number | OWN | ALL. you could pass * as all too');
    });

    test('Should get OWN ListingItems when profileid = OWN', async () => {
        const getDataRes: any = await rpc(itemCommand, [searchCommand, pageNumber,
            pageLimit, order, category, type, 'OWN', minPrice, maxPrice, country, shippingDestination, searchString, withRelated]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].hash).toBe(createdListingItem2.hash);
    });

    test('Should get ALL ListingItems when profileid = ALL', async () => {
        // get all listing items
        const getDataRes: any = await rpc(itemCommand, [searchCommand, pageNumber,
            pageLimit, order, category, type, 'ALL', minPrice, maxPrice, country, shippingDestination, searchString, withRelated]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(2);
        expect(result[0].hash).toBe(createdListingItem1.hash);
        expect(result[1].hash).toBe(createdListingItem2.hash);
    });

    test('Should get ALL ListingItems when profileid is empty, since default is ALL', async () => {
        // get all listing items
        const getDataRes: any = await rpc(itemCommand, [searchCommand, pageNumber,
            pageLimit, order, category, type, '', minPrice, maxPrice, country, shippingDestination, searchString, withRelated]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(2);
        expect(result[0].hash).toBe(createdListingItem1.hash);
        expect(result[1].hash).toBe(createdListingItem2.hash);
    });

    test('Should get ALL ListingItems with default type = ALL ', async () => {
        // get all listing items
        const getDataRes: any = await rpc(itemCommand, [searchCommand, pageNumber,
            pageLimit, order, category, '', 'ALL', minPrice, maxPrice, country, shippingDestination, searchString, withRelated]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(2);
        expect(result[0].hash).toBe(createdListingItem1.hash);
        expect(result[1].hash).toBe(createdListingItem2.hash);
    });


    test('Should get all ListingItems with default type = ALL and default profileId = ALL', async () => {
        // get all listing items
        const getDataRes: any = await rpc(itemCommand, [searchCommand, pageNumber,
            pageLimit, order, category, '', '', minPrice, maxPrice, country, shippingDestination, searchString, withRelated]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(2);
        expect(result[0].hash).toBe(createdListingItem1.hash);
        expect(result[1].hash).toBe(createdListingItem2.hash);
    });

    test('Should fail to search ListingItems with invalid profile Id', async () => {
        // get all listing items
        const getDataRes: any = await rpc(itemCommand, [searchCommand, pageNumber,
            pageLimit, order, category, '', 'INVALID', minPrice, maxPrice, country, shippingDestination, searchString, withRelated]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(404);
        expect(getDataRes.error.error.success).toBe(false);
        expect(getDataRes.error.error.message).toBe('Value needs to be number | OWN | ALL. you could pass * as all too');
    });

    test('Should get all ListingItems, profileid = *', async () => {
        // get all listing items
        const getDataRes: any = await rpc(itemCommand, [searchCommand, pageNumber,
            pageLimit, order, category, type, '*', minPrice, maxPrice, country, shippingDestination, searchString, withRelated]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(2);
        expect(result[0].hash).toBe(createdListingItem1.hash);
        expect(result[1].hash).toBe(createdListingItem2.hash);
    });

    test('Should search ListingItems by profileId = id', async () => {
        // set profile id
        profileId = defaultProfile.id;
        category = '';
        searchString = '';
        const getDataRes: any = await rpc(itemCommand, [searchCommand, pageNumber,
            pageLimit, order, category, type, profileId, minPrice, maxPrice, country, shippingDestination, searchString, withRelated]);

        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].listingItemTemplateId).toBe(listingItemTemplates[0].id);
    });

    test('Should get only first listing item by pagination', async () => {
        pageLimit = 1;
        const getDataRes: any = await rpc(itemCommand, [searchCommand, pageNumber, pageLimit, order, '', type, profileId]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].hash).toBe(createdListingItem2.hash);
    });

    test('Should get second listing item by pagination', async () => {
        pageNumber = 2;
        pageLimit = 1;
        profileId = 'ALL';
        const getDataRes: any = await rpc(itemCommand, [searchCommand, pageNumber, pageLimit, order, '', type, profileId]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].hash).toBe(createdListingItem2.hash);
    });

    test('Should return empty ListingItems array if invalid pagination', async () => {
        pageNumber = 2;
        pageLimit = 2;
        const getDataRes: any = await rpc(itemCommand, [searchCommand, pageNumber, pageLimit, order, '', type, profileId]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(0);
    });

    test('Should search ListingItems by category key', async () => {
        pageNumber = 1;
        pageLimit = 2;
        category = 'cat_high_luxyry_items';

        const getDataRes: any = await rpc(itemCommand, [searchCommand, pageNumber,
            pageLimit, order, category, type, profileId, minPrice, maxPrice, country, shippingDestination, searchString, withRelated]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(2);

        const categoryRes = result[0].ItemInformation.ItemCategory;
        expect('cat_high_luxyry_items').toBe(categoryRes.key);
    });

    test('Should search ListingItems by category id', async () => {
        category = listingItemCreateRequestBasic2.itemInformation.itemCategory.id;
        const getDataRes: any = await rpc(itemCommand, [searchCommand, pageNumber,
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
        const getDataRes: any = await rpc(itemCommand, [searchCommand, pageNumber,
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
        const getDataRes: any = await rpc(itemCommand, [searchCommand, pageNumber,
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
        const getDataRes: any = await rpc(itemCommand, [searchCommand, pageNumber,
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
        const getDataRes: any = await rpc(itemCommand, [searchCommand, pageNumber,
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
        const getDataRes: any = await rpc(itemCommand, [searchCommand, pageNumber,
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
        const getDataRes: any = await rpc(itemCommand, [searchCommand, pageNumber,
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
        const getDataRes: any = await rpc(itemCommand, [searchCommand, pageNumber,
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
        const getDataRes: any = await rpc(itemCommand, [searchCommand, pageNumber,
            pageLimit, order, category, type, profileId, minPrice, maxPrice, country, shippingDestination, searchString, withRelated]);

        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(1);
        expect(testData.itemInformation.title).toBe(result[0].ItemInformation.title);
        expect(result[0].ItemInformation.ShippingDestinations[0].country).toBe(shippingDestination);
    });

    test('Should search all listing item without any searching criteria', async () => {
        const getDataRes: any = await rpc(itemCommand, [searchCommand, pageNumber,
            pageLimit, order]);

        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(2);
    });

});
