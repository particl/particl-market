import { rpc, api } from '../lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/params/GenerateListingItemTemplateParams';

import * as listingItemCreateRequestBasic1 from '../../testdata/createrequest/listingItemCreateRequestBasic1.json';
import * as listingItemCreateRequestBasic2 from '../../testdata/createrequest/listingItemCreateRequestBasic2.json';

import * as listingItemUpdateRequestBasic1 from '../../testdata/pdaterequest/listingItemUpdateRequestBasic1.json';

import * as listingItemTemplateCreateRequestBasic1 from '../../testdata/createrequest/listingItemTemplateCreateRequestBasic1.json';

import * as resources from 'resources';
import { ObjectHash } from '../../../src/core/helpers/ObjectHash';
import { HashableObjectType } from '../../../src/api/enums/HashableObjectType';
import {Logger as LoggerType} from '../../../src/core/Logger';
import {SearchOrder} from '../../../src/api/enums/SearchOrder';
import {GenerateListingItemParams} from '../../../src/api/requests/params/GenerateListingItemParams';

describe('ListingItemSearchCommand', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const testUtil = new BlackBoxTestUtil();

    const itemCommand = Commands.ITEM_ROOT.commandName;
    const itemSearchCommand = Commands.ITEM_SEARCH.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;

    let listingItemTemplates: resources.ListingItemTemplate[];

    beforeAll(async () => {
        await testUtil.cleanDb();

        defaultProfile = await testUtil.getDefaultProfile();
        defaultMarket = await testUtil.getDefaultMarket();

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateShippingDestinations
            false,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            false,  // generateListingItemObjects
            false,  // generateObjectDatas
            defaultProfile.id, // profileId
            true,   // generateListingItem
            defaultMarket.id  // marketId
        ]).toParamsArray();

        // generate ListingItemTemplate with ListingItem
        listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplate[];

        const listingItemTemplateWithListingItem = listingItemTemplates[0];

        // expect template is related to correct profile and listingitem posted to correct market
        expect(listingItemTemplateWithListingItem.Profile.id).toBe(defaultProfile.id);
        expect(listingItemTemplateWithListingItem.ListingItems[0].marketId).toBe(defaultMarket.id);

        // expect template hash created on the server matches what we create here
        const generatedTemplateHash = ObjectHash.getHash(listingItemTemplateWithListingItem, HashableObjectType.LISTINGITEMTEMPLATE);
        log.debug('listingItemTemplate.hash:', listingItemTemplateWithListingItem.hash);
        log.debug('generatedTemplateHash:', generatedTemplateHash);
        expect(listingItemTemplateWithListingItem.hash).toBe(generatedTemplateHash);

        // expect the item hash generated at the same time as template, matches with the templates one
        log.debug('listingItemTemplate.hash:', listingItemTemplateWithListingItem.hash);
        log.debug('listingItemTemplate.ListingItems[0].hash:', listingItemTemplateWithListingItem.ListingItems[0].hash);
        expect(listingItemTemplateWithListingItem.hash).toBe(listingItemTemplateWithListingItem.ListingItems[0].hash);

        // generate ListingItem without a ListingItemTemplate
        const generateListingItemParams = new GenerateListingItemParams([
            true,   // generateItemInformation
            true,   // generateShippingDestinations
            false,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            true    // generateListingItemObjects
        ]).toParamsArray();

        // create two items and store their id's for testing
        const listingItems = await testUtil.generateData(
            CreatableModel.LISTINGITEM,         // what to generate
            1,                          // how many to generate
            true,                    // return model
            generateListingItemParams           // what kind of data to generate
        ) as ListingItem[];
    });

    test('Should fail to get ListingItems if type is invalid', async () => {
/*
     *  [0]: page, number
     *  [1]: pageLimit, number
     *  [2]: order, SearchOrder
     *  [3]: category, number|string, if string, try to find using key, can be null
     *  [4]: type (FLAGGED | PENDING | LISTED | IN_ESCROW | SHIPPED | SOLD | EXPIRED | ALL)
     *  [5]: profileId, (NUMBER | OWN | ALL | *)
     *  [6]: minPrice, number to search item basePrice between 2 range
     *  [7]: maxPrice, number to search item basePrice between 2 range
     *  [8]: country, string, can be null
     *  [9]: shippingDestination, string, can be null
     *  [10]: searchString, string, can be null
     *  [11]: withRelated, boolean
 */
        const listingItemSearchCommandParams = [
            itemSearchCommand,
            1,                  // pageNumber, todo: start from 0?
            2,                  // pageLimit
            SearchOrder.ASC,    // order
            '',                 // category, todo: should we use * for all, and not just here?
            'FLAGGED',          // type, todo: not implemented
            '',                 // profileId
            null,               // minPrice, todo: null?
            null,               // maxPrice, todo: null?
            '',                 // country
            '',                 // shippingDestination
            ''                  // searchString
        ];

        const getDataRes: any = await rpc(itemCommand, listingItemSearchCommandParams);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(404);
        expect(getDataRes.error.error.success).toBe(false);
        expect(getDataRes.error.error.message).toBe('Type should be FLAGGED | PENDING | LISTED | IN_ESCROW | SHIPPED | SOLD | EXPIRED | ALL');
    });

    test('Should fail to get ListingItems if profileid is not (NUMBER | OWN | ALL)', async () => {
        const listingItemSearchCommandParams = [
            itemSearchCommand,
            1,                  // pageNumber, todo: start from 0?
            2,                  // pageLimit
            SearchOrder.ASC,    // order
            '',                 // category, todo: should we use * for all, and not just here?
            'FLAGGED',          // type, todo: not implemented
            'test',             // profileId
            null,               // minPrice, todo: null?
            null,               // maxPrice, todo: null?
            '',                 // country
            '',                 // shippingDestination
            ''                  // searchString
        ];

        const getDataRes: any = await rpc(itemCommand, listingItemSearchCommandParams);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(404);
        expect(getDataRes.error.error.success).toBe(false);
        expect(getDataRes.error.error.message).toBe('Value needs to be number | OWN | ALL. you could pass * as all too');
    });

    test('Should get OWN ListingItems when profileid = OWN', async () => {

        const listingItemSearchCommandParams = [
            itemSearchCommand,
            1,                  // pageNumber, todo: start from 0?
            2,                  // pageLimit
            SearchOrder.ASC,    // order
            '',                 // category, todo: should we use * for all, and not just here?
            'FLAGGED',          // type, todo: not implemented
            'OWN',              // profileId
            null,               // minPrice, todo: null?
            null,               // maxPrice, todo: null?
            '',                 // country
            '',                 // shippingDestination
            ''                  // searchString
        ];

        const getDataRes: any = await rpc(itemCommand, listingItemSearchCommandParams);
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
        expect(result[0].hash).toBe(createdListingItem2.hash);
        expect(result[1].hash).toBe(createdListingItem1.hash);
    });

    test('Should get ALL ListingItems when profileid is empty, since default is ALL', async () => {
        // get all listing items
        const getDataRes: any = await rpc(itemCommand, [searchCommand, pageNumber,
            pageLimit, order, category, type, '', minPrice, maxPrice, country, shippingDestination, searchString, withRelated]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(2);
        expect(result[0].hash).toBe(createdListingItem2.hash);
        expect(result[1].hash).toBe(createdListingItem1.hash);
    });

    test('Should get ALL ListingItems with default type = ALL ', async () => {
        // get all listing items
        const getDataRes: any = await rpc(itemCommand, [searchCommand, pageNumber,
            pageLimit, order, category, '', 'ALL', minPrice, maxPrice, country, shippingDestination, searchString, withRelated]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(2);
        expect(result[0].hash).toBe(createdListingItem2.hash);
        expect(result[1].hash).toBe(createdListingItem1.hash);
    });


    test('Should get ALL ListingItems with default type = ALL and default profileId = ALL', async () => {
        // get all listing items
        const getDataRes: any = await rpc(itemCommand, [searchCommand, pageNumber,
            pageLimit, order, category, '', '', minPrice, maxPrice, country, shippingDestination, searchString, withRelated]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(2);
        expect(result[0].hash).toBe(createdListingItem2.hash);
        expect(result[1].hash).toBe(createdListingItem1.hash);
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

    test('Should get ALL ListingItems, profileid = *', async () => {
        // get all listing items
        const getDataRes: any = await rpc(itemCommand, [searchCommand, pageNumber,
            pageLimit, order, category, type, '*', minPrice, maxPrice, country, shippingDestination, searchString, withRelated]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(2);
        expect(result[0].hash).toBe(createdListingItem2.hash);
        expect(result[1].hash).toBe(createdListingItem1.hash);
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
        expect(result[0].hash).toBe(createdListingItem1.hash);
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
        category = createdListingItem1.ItemInformation.ItemCategory.id;
        const getDataRes: any = await rpc(itemCommand, [searchCommand, pageNumber,
            pageLimit, order, category, type, profileId, minPrice, maxPrice, country, shippingDestination, searchString, withRelated]);

        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(2);
        expect(result[0].ItemInformation.ItemCategory.id).toBe(category);
        expect(result[0].ItemInformation.ItemCategory.id).toBe(category);
    });

    test('Should search ListingItems by searchString = ItemInformation title', async () => {
        // set search term
        searchString = createdListingItem1.ItemInformation.title;
        const getDataRes: any = await rpc(itemCommand, [searchCommand, pageNumber,
            pageLimit, order, category, type, profileId, minPrice, maxPrice, country, shippingDestination, searchString, withRelated]);

        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].ItemInformation.title).toBe(searchString);
    });

    test('Should return two ListingItems when searching by price', async () => {
        // set profile id
        category = '';
        searchString = '';
        profileId = 'ALL';
        minPrice = 65;
        maxPrice = 80;
        const getDataRes: any = await rpc(itemCommand, [searchCommand, pageNumber,
            pageLimit, order, category, type, profileId, minPrice, maxPrice, country, shippingDestination, searchString, withRelated]);

        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(2);
    });

    test('Should return one ListingItem when searching by price', async () => {
        category = '';
        searchString = '';
        profileId = 'ALL';
        minPrice = 75;
        maxPrice = 80;
        const getDataRes: any = await rpc(itemCommand, [searchCommand, pageNumber,
            pageLimit, order, category, type, profileId, minPrice, maxPrice, country, shippingDestination, searchString, withRelated]);

        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(1);
    });

    test('Should return no ListingItems swhen searching using invalid price range', async () => {
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

    test('Should return ListingItems without related', async () => {
        category = '';
        searchString = '';
        profileId = 'ALL';
        minPrice = 1;
        maxPrice = 101;
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

    test('Should search ListingItems by item location', async () => {
        category = '';
        searchString = '';
        profileId = 'ALL';
        minPrice = 0;
        maxPrice = 100;
        country = 'FI';
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
        maxPrice = 100;
        country = '';
        shippingDestination = 'FI';
        withRelated = true;
        const getDataRes: any = await rpc(itemCommand, [searchCommand, pageNumber,
            pageLimit, order, category, type, profileId, minPrice, maxPrice, country, shippingDestination, searchString, withRelated]);

        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].ItemInformation.ShippingDestinations[1].country).toBe(shippingDestination);
    });

    test('Should search listing item by shipping Destination, min-max price and SearchString = information title', async () => {
        category = '';
        searchString = createdListingItem1.ItemInformation.title;
        profileId = 'ALL';
        minPrice = 0;
        maxPrice = 100;
        country = '';
        shippingDestination = 'MA';
        withRelated = true;
        const getDataRes: any = await rpc(itemCommand, [searchCommand, pageNumber,
            pageLimit, order, category, type, profileId, minPrice, maxPrice, country, shippingDestination, searchString, withRelated]);

        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].ItemInformation.ShippingDestinations[0].country).toBe(shippingDestination);
        expect(result[0].ItemInformation.title).toBe(createdListingItem1.ItemInformation.title);
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
