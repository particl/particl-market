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
import { SearchOrder } from '../../../src/api/enums/SearchOrder';
import { ListingItemSearchOrderField } from '../../../src/api/enums/SearchOrderField';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { CountryCodeNotFoundException } from '../../../src/api/exceptions/CountryCodeNotFoundException';

describe('ListingItemSearchCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const itemCommand = Commands.ITEM_ROOT.commandName;
    const itemSearchCommand = Commands.ITEM_SEARCH.commandName;

    let profile: resources.Profile;
    let market: resources.Market;

    let listingItemTemplate: resources.ListingItemTemplate;
    let listingItem: resources.ListingItem;

    beforeAll(async () => {
        await testUtil.cleanDb();

        profile = await testUtil.getDefaultProfile();
        expect(profile.id).toBeDefined();
        market = await testUtil.getDefaultMarket(profile.id);
        expect(market.id).toBeDefined();

        // generate ListingItemTemplate with ListingItem
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,       // generateItemInformation
            true,       // generateItemLocation
            true,       // generateShippingDestinations
            false,      // generateItemImages
            true,       // generatePaymentInformation
            true,       // generateEscrow
            true,       // generateItemPrice
            true,       // generateMessagingInformation
            false,      // generateListingItemObjects
            false,      // generateObjectDatas
            profile.id, // profileId
            true,       // generateListingItem
            market.id   // marketId
        ]).toParamsArray();

        const listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplate[];

        listingItemTemplate = listingItemTemplates[0];
        // log.debug('listingItemTemplate:', JSON.stringify(createdListingItemTemplate, null, 2));

        // expect template is related to correct profile and ListingItem posted to correct market
        expect(listingItemTemplate.Profile.id).toBe(profile.id);
        expect(listingItemTemplate.ListingItems[0].market).toBe(market.receiveAddress);

        // generate ListingItem without a ListingItemTemplate
        const generateListingItemParams = new GenerateListingItemParams([
            true,       // generateItemInformation
            true,       // generateItemLocation
            true,       // generateShippingDestinations
            false,      // generateItemImages
            true,       // generatePaymentInformation
            true,       // generateEscrow
            true,       // generateItemPrice
            true,       // generateMessagingInformation
            true,       // generateListingItemObjects
            true        // generateObjectDatas
                        // listingItemTemplateHash
                        // seller
                        // categoryId
                        // soldOnMarketId
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
    const SEARCHORDERFILED = ListingItemSearchOrderField.CREATED_AT;


    test('Should fail because missing market', async () => {

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand,
            PAGE, PAGELIMIT, SEARCHORDER, SEARCHORDERFILED
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('market').getMessage());
    });

    test('Should search by market', async () => {

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand,
            PAGE, PAGELIMIT, SEARCHORDER, SEARCHORDERFILED,
            market.receiveAddress
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(2);
        expect(result[0].hash).toBe(listingItemTemplate.ListingItems[0].hash);
    });

    test('Should fail because invalid category', async () => {

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand,
            PAGE, PAGELIMIT, SEARCHORDER, SEARCHORDERFILED,
            market.receiveAddress,
            ''  // should be string[] or number[]
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('categories', 'number[] | string[]').getMessage());
    });

    test('Should fail because mixed types of categories', async () => {

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand,
            PAGE, PAGELIMIT, SEARCHORDER, SEARCHORDERFILED,
            market.receiveAddress,
            ['string', 0]  // should be string[] or number[]
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('categories', 'number[] | string[]').getMessage());
    });

    test('Should search by market and categories (using ids)', async () => {

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand,
            PAGE, PAGELIMIT, SEARCHORDER, SEARCHORDERFILED,
            market.receiveAddress,
            [listingItemTemplate.ListingItems[0].ItemInformation.ItemCategory.id, listingItem.ItemInformation.ItemCategory.id]
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(2);
        expect(result[0].hash).toBe(listingItemTemplate.ListingItems[0].hash);
    });

    test('Should search by market and categories (using keys)', async () => {

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand,
            PAGE, PAGELIMIT, SEARCHORDER, SEARCHORDERFILED,
            market.receiveAddress,
            [listingItemTemplate.ListingItems[0].ItemInformation.ItemCategory.key, listingItem.ItemInformation.ItemCategory.key]
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(2);
        expect(result[0].hash).toBe(listingItemTemplate.ListingItems[0].hash);
    });

    test('Should fail because invalid seller', async () => {

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand,
            PAGE, PAGELIMIT, SEARCHORDER, SEARCHORDERFILED,
            market.receiveAddress,
            [listingItemTemplate.ListingItems[0].ItemInformation.ItemCategory.key, listingItem.ItemInformation.ItemCategory.key],
            true
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('seller', 'string').getMessage());
    });

    test('Should search by market and categories (using keys) and seller', async () => {

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand,
            PAGE, PAGELIMIT, SEARCHORDER, SEARCHORDERFILED,
            market.receiveAddress,
            [listingItemTemplate.ListingItems[0].ItemInformation.ItemCategory.key, listingItem.ItemInformation.ItemCategory.key],
            listingItem.seller
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(2);
        expect(result[0].hash).toBe(listingItemTemplate.ListingItems[0].hash);
    });

    test('Should search by market and seller', async () => {

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand,
            PAGE, PAGELIMIT, SEARCHORDER, SEARCHORDERFILED,
            market.receiveAddress,
            [],
            listingItem.seller
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(2);
        expect(result[0].hash).toBe(listingItemTemplate.ListingItems[0].hash);
    });

    test('Should fail because invalid minPrice', async () => {

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand,
            PAGE, PAGELIMIT, SEARCHORDER, SEARCHORDERFILED,
            market.receiveAddress,
            [listingItemTemplate.ListingItems[0].ItemInformation.ItemCategory.key, listingItem.ItemInformation.ItemCategory.key],
            listingItem.seller,
            -1
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('minPrice').getMessage());
    });

    test('Should search by market and minPrice', async () => {

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand,
            PAGE, PAGELIMIT, SEARCHORDER, SEARCHORDERFILED,
            market.receiveAddress,
            [],
            '*',
            0
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(2);
        expect(result[0].hash).toBe(listingItemTemplate.ListingItems[0].hash);
    });

    test('Should fail because invalid maxPrice', async () => {

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand,
            PAGE, PAGELIMIT, SEARCHORDER, SEARCHORDERFILED,
            market.receiveAddress,
            [listingItemTemplate.ListingItems[0].ItemInformation.ItemCategory.key, listingItem.ItemInformation.ItemCategory.key],
            listingItem.seller,
            0,
            -1
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('maxPrice').getMessage());
    });

    test('Should search by market and between minPrice and maxPrice', async () => {

        const largestBasePrice
            = (listingItemTemplate.ListingItems[0].PaymentInformation.ItemPrice.basePrice > listingItem.PaymentInformation.ItemPrice.basePrice)
            ? listingItemTemplate.ListingItems[0].PaymentInformation.ItemPrice.basePrice + 1
            : listingItem.PaymentInformation.ItemPrice.basePrice + 1;

        const lowestBasePrice
            = (listingItemTemplate.ListingItems[0].PaymentInformation.ItemPrice.basePrice < listingItem.PaymentInformation.ItemPrice.basePrice)
            ? listingItemTemplate.ListingItems[0].PaymentInformation.ItemPrice.basePrice - 1
            : listingItem.PaymentInformation.ItemPrice.basePrice - 1;

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand,
            PAGE, PAGELIMIT, SEARCHORDER, SEARCHORDERFILED,
            market.receiveAddress,
            [],
            '*',
            lowestBasePrice,
            largestBasePrice
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(2);
        expect(result[0].hash).toBe(listingItemTemplate.ListingItems[0].hash);
    });

    test('Should fail because invalid country', async () => {

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand,
            PAGE, PAGELIMIT, SEARCHORDER, SEARCHORDERFILED,
            market.receiveAddress,
            [],
            '*',
            undefined,
            undefined,
            1
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('country', 'string').getMessage());
    });

    test('Should fail because country code not found', async () => {

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand,
            PAGE, PAGELIMIT, SEARCHORDER, SEARCHORDERFILED,
            market.receiveAddress,
            [],
            '*',
            undefined,
            undefined,
            'INVALID'
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new CountryCodeNotFoundException('INVALID').getMessage());
    });

    test('Should search by market and country', async () => {
        log.debug('country1: ', listingItemTemplate.ListingItems[0].ItemInformation.ItemLocation.country);
        log.debug('country2: ', listingItem.ItemInformation.ItemLocation.country);
        const isSameCountry = (listingItemTemplate.ListingItems[0].ItemInformation.ItemLocation.country === listingItem.ItemInformation.ItemLocation.country);

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand,
            PAGE, PAGELIMIT, SEARCHORDER, SEARCHORDERFILED,
            market.receiveAddress,
            [],
            '*',
            undefined,
            undefined,
            listingItemTemplate.ListingItems[0].ItemInformation.ItemLocation.country
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(isSameCountry ? 2 : 1);
        expect(result[0].hash).toBe(listingItemTemplate.ListingItems[0].hash);
    });

    test('Should fail because invalid shipping destination', async () => {

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand,
            PAGE, PAGELIMIT, SEARCHORDER, SEARCHORDERFILED,
            market.receiveAddress,
            [],
            '*',
            undefined,
            undefined,
            undefined,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('shippingDestination', 'string').getMessage());
    });

    test('Should fail because shipping destination code not found', async () => {

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand,
            PAGE, PAGELIMIT, SEARCHORDER, SEARCHORDERFILED,
            market.receiveAddress,
            [],
            '*',
            undefined,
            undefined,
            undefined,
            'NOT_FOUND'
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new CountryCodeNotFoundException('NOT_FOUND').getMessage());
    });

    test('Should search by market and shipping destination', async () => {
        const country = listingItemTemplate.ListingItems[0].ItemInformation.ItemLocation.country;
        const shippingDestination = listingItemTemplate.ListingItems[0].ItemInformation.ShippingDestinations[0].country;
        log.debug('country: ', country);
        log.debug('shippingDestination: ', shippingDestination);

        const hasSameShippingDestination = _.includes(listingItem.ItemInformation.ShippingDestinations, shippingDestination);

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand,
            PAGE, PAGELIMIT, SEARCHORDER, SEARCHORDERFILED,
            market.receiveAddress,
            [],
            '*',
            undefined,
            undefined,
            undefined,
            shippingDestination
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(hasSameShippingDestination ? 2 : 1);
        expect(result[0].hash).toBe(listingItemTemplate.ListingItems[0].hash);
    });

    test('Should search by market and country and shipping destination', async () => {
        const country = listingItemTemplate.ListingItems[0].ItemInformation.ItemLocation.country;
        const shippingDestination = listingItemTemplate.ListingItems[0].ItemInformation.ShippingDestinations[0].country;
        log.debug('country: ', country);
        log.debug('shippingDestination: ', shippingDestination);

        const isSameCountry = (listingItemTemplate.ListingItems[0].ItemInformation.ItemLocation.country === listingItem.ItemInformation.ItemLocation.country);
        const hasSameShippingDestination = _.includes(listingItem.ItemInformation.ShippingDestinations, shippingDestination);

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand,
            PAGE, PAGELIMIT, SEARCHORDER, SEARCHORDERFILED,
            market.receiveAddress,
            [],
            '*',
            undefined,
            undefined,
            country,
            shippingDestination
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(hasSameShippingDestination || isSameCountry ? 2 : 1);
        expect(result[0].hash).toBe(listingItemTemplate.ListingItems[0].hash);
    });

    test('Should fail because invalid searchString', async () => {

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand,
            PAGE, PAGELIMIT, SEARCHORDER, SEARCHORDERFILED,
            market.receiveAddress,
            [],
            '*',
            undefined,
            undefined,
            undefined,
            undefined,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('searchString', 'string').getMessage());
    });

    test('Should search by market and title searchString', async () => {
        const res = await testUtil.rpc(itemCommand, [itemSearchCommand,
            PAGE, PAGELIMIT, SEARCHORDER, SEARCHORDERFILED,
            market.receiveAddress,
            [],
            '*',
            null,
            null,
            null,
            null,
            listingItemTemplate.ListingItems[0].ItemInformation.title.substr(0, 10)
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(1);
        expect(result[0].hash).toBe(listingItemTemplate.ListingItems[0].hash);
    });

    test('Should search by market and shortDescription searchString', async () => {
        const res = await testUtil.rpc(itemCommand, [itemSearchCommand,
            PAGE, PAGELIMIT, SEARCHORDER, SEARCHORDERFILED,
            market.receiveAddress,
            [],
            '*',
            null,
            null,
            null,
            null,
            listingItemTemplate.ListingItems[0].ItemInformation.shortDescription.substr(0, 5)
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBeGreaterThan(0);
        expect(result[0].hash).toBe(listingItemTemplate.ListingItems[0].hash);
    });

    test('Should search by market and longDescription searchString', async () => {
        const res = await testUtil.rpc(itemCommand, [itemSearchCommand,
            PAGE, PAGELIMIT, SEARCHORDER, SEARCHORDERFILED,
            market.receiveAddress,
            [],
            '*',
            null,
            null,
            null,
            null,
            listingItemTemplate.ListingItems[0].ItemInformation.longDescription.substr(0, 10)
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBeGreaterThan(0);
        expect(result[0].hash).toBe(listingItemTemplate.ListingItems[0].hash);
    });

    test('Should search by market and hash searchString', async () => {
        const res = await testUtil.rpc(itemCommand, [itemSearchCommand,
            PAGE, PAGELIMIT, SEARCHORDER, SEARCHORDERFILED,
            market.receiveAddress,
            [],
            '*',
            null,
            null,
            null,
            null,
            listingItemTemplate.ListingItems[0].hash
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(1);
        expect(result[0].hash).toBe(listingItemTemplate.ListingItems[0].hash);
    });

    test('Should fail because invalid flagged', async () => {

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand,
            PAGE, PAGELIMIT, SEARCHORDER, SEARCHORDERFILED,
            market.receiveAddress,
            [],
            '*',
            undefined,
            undefined,
            undefined,
            undefined,
            null,
            'INVALID'
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('flagged', 'boolean').getMessage());
    });

    test('Should search by market and flagged', async () => {
        const res = await testUtil.rpc(itemCommand, [itemSearchCommand,
            PAGE, PAGELIMIT, SEARCHORDER, SEARCHORDERFILED,
            market.receiveAddress,
            [],
            '*',
            null,
            null,
            null,
            null,
            null,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(2);
        expect(result[0].hash).toBe(listingItemTemplate.ListingItems[0].hash);
    });

    test('Should fail because invalid hash', async () => {

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand,
            PAGE, PAGELIMIT, SEARCHORDER, SEARCHORDERFILED,
            market.receiveAddress,
            [],
            '*',
            undefined,
            undefined,
            undefined,
            undefined,
            null,
            null,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('listingItemHash', 'string').getMessage());
    });

    test('Should search by market and hash', async () => {
        const res = await testUtil.rpc(itemCommand, [itemSearchCommand,
            PAGE, PAGELIMIT, SEARCHORDER, SEARCHORDERFILED,
            market.receiveAddress,
            [],
            '*',
            null,
            null,
            null,
            null,
            null,
            null,
            listingItemTemplate.ListingItems[0].hash
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(1);
        expect(result[0].hash).toBe(listingItemTemplate.ListingItems[0].hash);
    });


});
