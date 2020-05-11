// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import * as _ from 'lodash';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { GenerateListingItemParams } from '../../../src/api/requests/testdata/GenerateListingItemParams';
import { ListingItemSearchParams } from '../../../src/api/requests/search/ListingItemSearchParams';
import { ShippingAvailability } from '../../../src/api/enums/ShippingAvailability';
import { SearchOrder } from '../../../src/api/enums/SearchOrder';

describe('ListingItemSearchCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const itemCommand = Commands.ITEM_ROOT.commandName;
    const itemSearchCommand = Commands.ITEM_SEARCH.commandName;
    const itemFlagCommand = Commands.ITEM_FLAG.commandName;
    const itemGetCommand = Commands.ITEM_GET.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;

    let listingItemTemplate: resources.ListingItemTemplate;
    let listingItem: resources.ListingItem;

    const defaultListingItemSearchParams = new ListingItemSearchParams();

    beforeAll(async () => {
        await testUtil.cleanDb();

        defaultProfile = await testUtil.getDefaultProfile();
        defaultMarket = await testUtil.getDefaultMarket();

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
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
        const listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplate[];

        listingItemTemplate = listingItemTemplates[0];
        // log.debug('listingItemTemplate:', JSON.stringify(createdListingItemTemplate, null, 2));

        // expect template is related to correct profile and ListingItem posted to correct market
        expect(listingItemTemplate.Profile.id).toBe(defaultProfile.id);
        expect(listingItemTemplate.ListingItems[0].market).toBe(defaultMarket.receiveAddress);

        // generate ListingItem without a ListingItemTemplate
        const generateListingItemParams = new GenerateListingItemParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            true,   // generateShippingDestinations
            false,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            true    // generateListingItemObjects
        ]).toParamsArray();

        const listingItems = await testUtil.generateData(
            CreatableModel.LISTINGITEM,         // what to generate
            1,                          // how many to generate
            true,                    // return model
            generateListingItemParams           // what kind of data to generate
        ) as resources.ListingItem[];

        listingItem = listingItems[0];
    });

    const PAGE = 0;
    const PAGELIMIT = 10;
    const SEARCHORDER = SearchOrder.ASC;

    test('Should fail to searchBy ListingItems if profileId is not (NUMBER | OWN | ALL)', async () => {

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand,
            PAGE, PAGELIMIT, SEARCHORDER,
            '',                 // category, number|string, if string, try to find using key, can be null
            'ALL',              // type, DEPRECATED
            'INVALID',          // profileId, (NUMBER | OWN | ALL | *)
            null,               // minPrice
            null,               // maxPrice
            '',                 // country, string, can be null
            '',                 // shippingDestination, string, can be null
            '',                 // searchString, string, can be null
            false,              // flagged, boolean, can be null
            true                // withRelated
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('Value needs to be number | OWN | ALL.');
    });

    test('Should searchBy OWN ListingItems when profileid = OWN', async () => {

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand,
            PAGE, PAGELIMIT, SEARCHORDER,
            '',                 // category, number|string, if string, try to find using key, can be null
            'ALL',              // type, DEPRECATED
            'OWN',              // profileId, (NUMBER | OWN | ALL | *)
            null,               // minPrice
            null,               // maxPrice
            '',                 // country, string, can be null
            '',                 // shippingDestination, string, can be null
            '',                 // searchString, string, can be null
            false,              // flagged, boolean, can be null
            true                // withRelated
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(1);
        expect(result[0].hash).toBe(listingItemTemplate.ListingItems[0].hash);
    });

    test('Should searchBy ALL ListingItems when profileid = ALL', async () => {

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand,
            PAGE, PAGELIMIT, SEARCHORDER,
            '',                 // category, number|string, if string, try to find using key, can be null
            'ALL',              // type, DEPRECATED
            'ALL',              // profileId, (NUMBER | OWN | ALL | *)
            null,               // minPrice
            null,               // maxPrice
            '',                 // country, string, can be null
            '',                 // shippingDestination, string, can be null
            '',                 // searchString, string, can be null
            false,              // flagged, boolean, can be null
            true                // withRelated
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(2);
        expect(result[0].hash).toBe(listingItemTemplate.ListingItems[0].hash);
        expect(result[1].hash).toBe(listingItem.hash);
    });

    test('Should searchBy ALL ListingItems when profileId = *', async () => {

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand,
            PAGE, PAGELIMIT, SEARCHORDER,
            '',                 // category, number|string, if string, try to find using key, can be null
            'ALL',              // type, DEPRECATED
            '*',                // profileId, (NUMBER | OWN | ALL | *)
            null,               // minPrice
            null,               // maxPrice
            '',                 // country, string, can be null
            '',                 // shippingDestination, string, can be null
            '',                 // searchString, string, can be null
            false,              // flagged, boolean, can be null
            true                // withRelated
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(2);
        expect(result[0].hash).toBe(listingItemTemplate.ListingItems[0].hash);
        expect(result[1].hash).toBe(listingItem.hash);
    });

    test('Should searchBy only first ListingItem using pagination and setting pageLimit to 1', async () => {

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand,
            PAGE, 1, SEARCHORDER,
            '',                 // category, number|string, if string, try to find using key, can be null
            'ALL',              // type, DEPRECATED
            '*',                // profileId, (NUMBER | OWN | ALL | *)
            null,               // minPrice
            null,               // maxPrice
            '',                 // country, string, can be null
            '',                 // shippingDestination, string, can be null
            '',                 // searchString, string, can be null
            false,              // flagged, boolean, can be null
            true                // withRelated
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(1);
        expect(result[0].hash).toBe(listingItemTemplate.ListingItems[0].hash);

    });

    test('Should searchBy the second ListingItem using pagination and setting page to 1 with pageLimit set to 1', async () => {

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand,
            1, 1, SEARCHORDER,
            '',                 // category, number|string, if string, try to find using key, can be null
            'ALL',              // type, DEPRECATED
            '*',                // profileId, (NUMBER | OWN | ALL | *)
            null,               // minPrice
            null,               // maxPrice
            '',                 // country, string, can be null
            '',                 // shippingDestination, string, can be null
            '',                 // searchString, string, can be null
            false,              // flagged, boolean, can be null
            true                // withRelated
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(1);
        expect(result[0].hash).toBe(listingItem.hash);
    });

    test('Should return empty ListingItems array if invalid pagination', async () => {

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand,
            2, 1, SEARCHORDER,
            '',                 // category, number|string, if string, try to find using key, can be null
            'ALL',              // type, DEPRECATED
            '*',                // profileId, (NUMBER | OWN | ALL | *)
            null,               // minPrice
            null,               // maxPrice
            '',                 // country, string, can be null
            '',                 // shippingDestination, string, can be null
            '',                 // searchString, string, can be null
            false,              // flagged, boolean, can be null
            true                // withRelated
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(0);
    });

    test('Should searchBy ListingItems by category.key', async () => {

        const itemCount = listingItem.ItemInformation.ItemCategory.key
            === listingItemTemplate.ListingItems[0].ItemInformation.ItemCategory.key
            ? 2 : 1;

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand,
            PAGE, PAGELIMIT, SEARCHORDER,
            listingItem.ItemInformation.ItemCategory.key, // category, number|string, if string, try to find using key, can be null
            'ALL',              // type, DEPRECATED
            '*',                // profileId, (NUMBER | OWN | ALL | *)
            null,               // minPrice
            null,               // maxPrice
            '',                 // country, string, can be null
            '',                 // shippingDestination, string, can be null
            '',                 // searchString, string, can be null
            false,              // flagged, boolean, can be null
            true                // withRelated
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(itemCount);
        expect(result[0].ItemInformation.ItemCategory.key).toBe(listingItem.ItemInformation.ItemCategory.key);
    });

    test('Should searchBy ListingItems by category.id', async () => {
        log.debug('listingItem.ItemInformation: ', JSON.stringify(listingItem.ItemInformation, null, 2));
        log.debug('listingItemTemplate.ListingItems[0].ItemInformation: ', JSON.stringify(listingItemTemplate.ListingItems[0].ItemInformation, null, 2));

        const itemCount = listingItem.ItemInformation.ItemCategory.id
            === listingItemTemplate.ListingItems[0].ItemInformation.ItemCategory.id
            ? 2 : 1;

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand,
            PAGE, PAGELIMIT, SEARCHORDER,
            listingItem.ItemInformation.ItemCategory.id, // category, number|string, if string, try to find using key, can be null
            'ALL',              // type, DEPRECATED
            '*',                // profileId, (NUMBER | OWN | ALL | *)
            null,               // minPrice
            null,               // maxPrice
            '',                 // country, string, can be null
            '',                 // shippingDestination, string, can be null
            '',                 // searchString, string, can be null
            false,              // flagged, boolean, can be null
            true                // withRelated
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        // log.debug('params:', JSON.stringify(params, null, 2));
        // log.debug('result[0].ItemInformation.ItemCategory.id:', result[0].ItemInformation.ItemCategory.id);
        // log.debug('result:', JSON.stringify(result, null, 2));

        expect(result.length).toBe(itemCount);
        expect(result[0].ItemInformation.ItemCategory.id).toBe(listingItem.ItemInformation.ItemCategory.id);

    });

    test('Should searchBy ListingItems by searchString', async () => {
        const res = await testUtil.rpc(itemCommand, [itemSearchCommand,
            PAGE, PAGELIMIT, SEARCHORDER,
            '',                 // category, number|string, if string, try to find using key, can be null
            'ALL',              // type, DEPRECATED
            'ALL',              // profileId, (NUMBER | OWN | ALL | *)
            null,               // minPrice
            null,               // maxPrice
            '',                 // country, string, can be null
            '',                 // shippingDestination, string, can be null
            listingItem.ItemInformation.title.substr(0, 10), // searchString, string, can be null
            false,              // flagged, boolean, can be null
            true                // withRelated
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(1);
        expect(result[0].hash).toBe(listingItem.hash);

    });

    test('Should return two ListingItems when searching by price', async () => {

        const minPrice = listingItem.PaymentInformation.ItemPrice.basePrice
            < listingItemTemplate.ListingItems[0].PaymentInformation.ItemPrice.basePrice
            ? listingItem.PaymentInformation.ItemPrice.basePrice - 0.0001
            : listingItemTemplate.ListingItems[0].PaymentInformation.ItemPrice.basePrice - 0.0001;

        const maxPrice = listingItem.PaymentInformation.ItemPrice.basePrice
            > listingItemTemplate.ListingItems[0].PaymentInformation.ItemPrice.basePrice
            ? listingItem.PaymentInformation.ItemPrice.basePrice + 0.0001
            : listingItemTemplate.ListingItems[0].PaymentInformation.ItemPrice.basePrice + 0.0001;

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand,
            PAGE, PAGELIMIT, SEARCHORDER,
            '',                 // category, number|string, if string, try to find using key, can be null
            'ALL',              // type, DEPRECATED
            'ALL',              // profileId, (NUMBER | OWN | ALL | *)
            minPrice,           // minPrice
            maxPrice,           // maxPrice
            '',                 // country, string, can be null
            '',                 // shippingDestination, string, can be null
            '',                 // searchString, string, can be null
            false,              // flagged, boolean, can be null
            true                // withRelated
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(2);
    });

    test('Should return one ListingItem when searching by price', async () => {

        const minPrice = listingItem.PaymentInformation.ItemPrice.basePrice
            < listingItemTemplate.ListingItems[0].PaymentInformation.ItemPrice.basePrice
            ? listingItem.PaymentInformation.ItemPrice.basePrice + 0.0001
            : listingItemTemplate.ListingItems[0].PaymentInformation.ItemPrice.basePrice + 0.0001;

        const maxPrice = listingItem.PaymentInformation.ItemPrice.basePrice
            > listingItemTemplate.ListingItems[0].PaymentInformation.ItemPrice.basePrice
            ? listingItem.PaymentInformation.ItemPrice.basePrice + 0.0001
            : listingItemTemplate.ListingItems[0].PaymentInformation.ItemPrice.basePrice + 0.0001;

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand,
            PAGE, PAGELIMIT, SEARCHORDER,
            '',                 // category, number|string, if string, try to find using key, can be null
            'ALL',              // type, DEPRECATED
            'ALL',              // profileId, (NUMBER | OWN | ALL | *)
            minPrice,           // minPrice
            maxPrice,           // maxPrice
            '',                 // country, string, can be null
            '',                 // shippingDestination, string, can be null
            '',                 // searchString, string, can be null
            false,              // flagged, boolean, can be null
            true                // withRelated
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(1);
    });

    test('Should return no ListingItems when searching using invalid price range', async () => {

        const minPrice = 1000.0001;
        const maxPrice = 1000.0002;

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand,
            PAGE, PAGELIMIT, SEARCHORDER,
            '',                 // category, number|string, if string, try to find using key, can be null
            'ALL',              // type, DEPRECATED
            'ALL',              // profileId, (NUMBER | OWN | ALL | *)
            minPrice,           // minPrice
            maxPrice,           // maxPrice
            '',                 // country, string, can be null
            '',                 // shippingDestination, string, can be null
            '',                 // searchString, string, can be null
            false,              // flagged, boolean, can be null
            true                // withRelated
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(0);
    });

    test('Should return ListingItems without related', async () => {

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand,
            PAGE, PAGELIMIT, SEARCHORDER,
            '',                 // category, number|string, if string, try to find using key, can be null
            'ALL',              // type, DEPRECATED
            '*',                // profileId, (NUMBER | OWN | ALL | *)
            null,               // minPrice
            null,               // maxPrice
            '',                 // country, string, can be null
            '',                 // shippingDestination, string, can be null
            '',                 // searchString, string, can be null
            false,              // flagged, boolean, can be null
            false               // withRelated
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(2);
        expect(result[0].hash).toBe(listingItemTemplate.ListingItems[0].hash);
        expect(result[0].ItemInformation).toBeUndefined();
        expect(result[0].PaymentInformation).toBeUndefined();
        expect(result[0].MessagingInformation).toBeUndefined();
        expect(result[0].ListingItemObjects).toBeUndefined();
        expect(result[0].Bids).toBeUndefined();
        expect(result[0].Market).toBeUndefined();
    });

    test('Should searchBy ListingItems by country (ItemLocation)', async () => {

        const itemCount = listingItem.ItemInformation.ItemLocation.country
        === listingItemTemplate.ListingItems[0].ItemInformation.ItemLocation.country
            ? 2 : 1;

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand,
            PAGE, PAGELIMIT, SEARCHORDER,
            '',                 // category, number|string, if string, try to find using key, can be null
            'ALL',              // type, DEPRECATED
            '*',                // profileId, (NUMBER | OWN | ALL | *)
            null,               // minPrice
            null,               // maxPrice
            listingItem.ItemInformation.ItemLocation.country, // country, string, can be null
            '',                 // shippingDestination, string, can be null
            '',                 // searchString, string, can be null
            false,              // flagged, boolean, can be null
            true                // withRelated
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(itemCount);
        expect(result[0].ItemInformation.ItemLocation.country).toBe(listingItem.ItemInformation.ItemLocation.country);
    });

    test('Should searchBy ListingItem by ShippingDestination', async () => {

        const shippingDestinationsForItem1: resources.ShippingDestination[] = listingItem.ItemInformation.ShippingDestinations;
        const shippingDestinationsThatShip = _.filter(shippingDestinationsForItem1, (o: resources.ShippingDestination) => {
            return o.shippingAvailability === ShippingAvailability.SHIPS;
        });

        const shippingDestination = shippingDestinationsThatShip[0].country;

        const shippingDestinationsForItem2: resources.ShippingDestination[] = listingItemTemplate.ListingItems[0].ItemInformation.ShippingDestinations;
        const shippingDestinationsThatShipToTheSamePlace = _.filter(shippingDestinationsForItem2, (o: resources.ShippingDestination) => {
            return o.shippingAvailability === ShippingAvailability.SHIPS
                && o.country === shippingDestination;
        });

        const itemCount = 1 + shippingDestinationsThatShipToTheSamePlace.length;

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand,
            PAGE, PAGELIMIT, SEARCHORDER,
            '',                 // category, number|string, if string, try to find using key, can be null
            'ALL',              // type, DEPRECATED
            '*',                // profileId, (NUMBER | OWN | ALL | *)
            null,               // minPrice
            null,               // maxPrice
            '',                 // country, string, can be null
            shippingDestination, // shippingDestination, string, can be null
            '',                 // searchString, string, can be null
            false,              // flagged, boolean, can be null
            true                // withRelated
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(itemCount);
        expect(result[0].ItemInformation.ShippingDestinations[0].country).toBe(shippingDestination);
    });

    test('Should searchBy ListingItem by ShippingDestination, min-maxPrice and searchString', async () => {

        const shippingDestinationsForItem1: resources.ShippingDestination[] = listingItem.ItemInformation.ShippingDestinations;
        const shippingDestinationsThatShip = _.filter(shippingDestinationsForItem1, (o: resources.ShippingDestination) => {
            return o.shippingAvailability === ShippingAvailability.SHIPS;
        });

        const shippingDestination = shippingDestinationsThatShip[0].country;

        const shippingDestinationsForItem2: resources.ShippingDestination[] = listingItemTemplate.ListingItems[0].ItemInformation.ShippingDestinations;
        const shippingDestinationsThatShipToTheSamePlace = _.filter(shippingDestinationsForItem2, (o: resources.ShippingDestination) => {
            return o.shippingAvailability === ShippingAvailability.SHIPS
                && o.country === shippingDestination;
        });

        const itemCount = 1 + shippingDestinationsThatShipToTheSamePlace.length;

        const minPrice = listingItem.PaymentInformation.ItemPrice.basePrice
            < listingItemTemplate.ListingItems[0].PaymentInformation.ItemPrice.basePrice
            ? listingItem.PaymentInformation.ItemPrice.basePrice - 0.0001
            : listingItemTemplate.ListingItems[0].PaymentInformation.ItemPrice.basePrice - 0.0001;

        const maxPrice = listingItem.PaymentInformation.ItemPrice.basePrice
            > listingItemTemplate.ListingItems[0].PaymentInformation.ItemPrice.basePrice
            ? listingItem.PaymentInformation.ItemPrice.basePrice + 0.0001
            : listingItemTemplate.ListingItems[0].PaymentInformation.ItemPrice.basePrice + 0.0001;

        const searchString = listingItem.ItemInformation.title.substr(0, 10);

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand,
            PAGE, PAGELIMIT, SEARCHORDER,
            '',                 // category, number|string, if string, try to find using key, can be null
            'ALL',              // type, DEPRECATED
            '*',                // profileId, (NUMBER | OWN | ALL | *)
            minPrice,           // minPrice
            maxPrice,           // maxPrice
            '',                 // country, string, can be null
            shippingDestination, // shippingDestination, string, can be null
            searchString,       // searchString, string, can be null
            false,              // flagged, boolean, can be null
            true                // withRelated
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(itemCount);

    });

    test('Should find all ListingItems when using no searchBy criteria', async () => {

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand,
            PAGE, PAGELIMIT, SEARCHORDER,
            '',                 // category, number|string, if string, try to find using key, can be null
            'ALL',              // type, DEPRECATED
            '*',                // profileId, (NUMBER | OWN | ALL | *)
            null,               // minPrice
            null,               // maxPrice
            '',                 // country, string, can be null
            '',                 // shippingDestination, string, can be null
            '',                 // searchString, string, can be null
            false,              // flagged, boolean, can be null
            true                // withRelated
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(2);
    });

    test('Should searchBy for flagged listing items', async () => {
        // flag item
        let res = await testUtil.rpc(itemCommand, [itemFlagCommand,
            listingItem.id,
            defaultProfile.id
        ]);
        // make sure we got the expected result from posting the proposal
        const result: any = res.getBody()['result'];
        expect(result.result).toBe('Sent.');

        res = await testUtil.rpc(itemCommand, [itemSearchCommand,
            PAGE, PAGELIMIT, SEARCHORDER,
            '',                 // category, number|string, if string, try to find using key, can be null
            'ALL',              // type, DEPRECATED
            '*',                // profileId, (NUMBER | OWN | ALL | *)
            null,               // minPrice
            null,               // maxPrice
            '',                 // country, string, can be null
            '',                 // shippingDestination, string, can be null
            '',                 // searchString, string, can be null
            true,               // flagged, boolean, can be null
            true                // withRelated
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const resMain: any = res.getBody()['result'];

        expect(resMain.length).toBe(1);
        expect(resMain[0].hash).toBe(listingItem.hash);
    });

});
