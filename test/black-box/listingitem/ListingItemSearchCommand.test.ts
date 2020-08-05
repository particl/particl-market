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
    const testUtilSellerNode = new BlackBoxTestUtil(randomBoolean ? 0 : 1);
    const testUtilBuyerNode = new BlackBoxTestUtil(randomBoolean ? 1 : 0);

    const listingItemCommand = Commands.ITEM_ROOT.commandName;
    const listingItemSearchCommand = Commands.ITEM_SEARCH.commandName;
    const listingItemGetCommand = Commands.ITEM_GET.commandName;
    const templateCommand = Commands.TEMPLATE_ROOT.commandName;
    const templatePostCommand = Commands.TEMPLATE_POST.commandName;

    let sellerProfile: resources.Profile;
    let sellerMarket: resources.Market;
    let buyerProfile: resources.Profile;
    let buyerMarket: resources.Market;

    let listingItemTemplateOnSellerNode: resources.ListingItemTemplate;
    let listingItem: resources.ListingItem;
    let listingItemReceivedOnBuyerNode: resources.ListingItem;

    const PAGE = 0;
    const PAGE_LIMIT = 10;
    const SEARCHORDER = SearchOrder.ASC;
    const LISTINGITEM_SEARCHORDERFIELD = ListingItemSearchOrderField.CREATED_AT;
    const DAYS_RETENTION = 1;
    let sent = false;

    beforeAll(async () => {
        await testUtilSellerNode.cleanDb();

        sellerProfile = await testUtilSellerNode.getDefaultProfile();
        expect(sellerProfile.id).toBeDefined();
        sellerMarket = await testUtilSellerNode.getDefaultMarket(sellerProfile.id);
        expect(sellerMarket.id).toBeDefined();

        buyerProfile = await testUtilBuyerNode.getDefaultProfile();
        buyerMarket = await testUtilBuyerNode.getDefaultMarket(buyerProfile.id);
        expect(buyerProfile.id).toBeDefined();
        expect(buyerMarket.id).toBeDefined();

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
            sellerProfile.id, // profileId
            true,       // generateListingItem
            sellerMarket.id   // marketId
        ]).toParamsArray();

        const listingItemTemplates = await testUtilSellerNode.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplate[];

        listingItemTemplateOnSellerNode = listingItemTemplates[0];
        // log.debug('listingItemTemplate:', JSON.stringify(createdListingItemTemplate, null, 2));

        // expect template is related to correct profile and ListingItem posted to correct market
        expect(listingItemTemplateOnSellerNode.Profile.id).toBe(sellerProfile.id);
        expect(listingItemTemplateOnSellerNode.ListingItems[0].market).toBe(sellerMarket.receiveAddress);

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

        const listingItems = await testUtilSellerNode.generateData(
            CreatableModel.LISTINGITEM,         // what to generate
            1,                          // how many to generate
            true,                    // return model
            generateListingItemParams           // what kind of data to generate
        ) as resources.ListingItem[];

        listingItem = listingItems[0];
    });


    test('Should fail because missing market', async () => {

        const res = await testUtilSellerNode.rpc(listingItemCommand, [listingItemSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, LISTINGITEM_SEARCHORDERFIELD
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('market').getMessage());
    });

    test('Should search by market', async () => {

        const res = await testUtilSellerNode.rpc(listingItemCommand, [listingItemSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, LISTINGITEM_SEARCHORDERFIELD,
            sellerMarket.receiveAddress
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.ListingItem[] = res.getBody()['result'];
        log.debug('result:', JSON.stringify(result, null, 2));

        expect(result.length).toBe(2);
        expect(result[0].hash).toBe(listingItemTemplateOnSellerNode.ListingItems[0].hash);
    });

    test('Should fail because invalid category', async () => {

        const res = await testUtilSellerNode.rpc(listingItemCommand, [listingItemSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, LISTINGITEM_SEARCHORDERFIELD,
            sellerMarket.receiveAddress,
            ''  // should be string[] or number[]
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('categories', 'number[] | string[]').getMessage());
    });

    test('Should fail because mixed types of categories', async () => {

        const res = await testUtilSellerNode.rpc(listingItemCommand, [listingItemSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, LISTINGITEM_SEARCHORDERFIELD,
            sellerMarket.receiveAddress,
            ['string', 0]  // should be string[] or number[]
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('categories', 'number[] | string[]').getMessage());
    });

    test('Should search by market and categories (using ids)', async () => {

        const res = await testUtilSellerNode.rpc(listingItemCommand, [listingItemSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, LISTINGITEM_SEARCHORDERFIELD,
            sellerMarket.receiveAddress,
            [listingItemTemplateOnSellerNode.ListingItems[0].ItemInformation.ItemCategory.id, listingItem.ItemInformation.ItemCategory.id]
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(2);
        expect(result[0].hash).toBe(listingItemTemplateOnSellerNode.ListingItems[0].hash);
    });

    test('Should search by market and categories (using keys)', async () => {

        const res = await testUtilSellerNode.rpc(listingItemCommand, [listingItemSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, LISTINGITEM_SEARCHORDERFIELD,
            sellerMarket.receiveAddress,
            [listingItemTemplateOnSellerNode.ListingItems[0].ItemInformation.ItemCategory.key, listingItem.ItemInformation.ItemCategory.key]
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(2);
        expect(result[0].hash).toBe(listingItemTemplateOnSellerNode.ListingItems[0].hash);
    });

    test('Should fail because invalid seller', async () => {

        const res = await testUtilSellerNode.rpc(listingItemCommand, [listingItemSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, LISTINGITEM_SEARCHORDERFIELD,
            sellerMarket.receiveAddress,
            [listingItemTemplateOnSellerNode.ListingItems[0].ItemInformation.ItemCategory.key, listingItem.ItemInformation.ItemCategory.key],
            true
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('seller', 'string').getMessage());
    });

    test('Should search by market and categories (using keys) and seller', async () => {

        const res = await testUtilSellerNode.rpc(listingItemCommand, [listingItemSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, LISTINGITEM_SEARCHORDERFIELD,
            sellerMarket.receiveAddress,
            [listingItemTemplateOnSellerNode.ListingItems[0].ItemInformation.ItemCategory.key, listingItem.ItemInformation.ItemCategory.key],
            listingItem.seller
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(2);
        expect(result[0].hash).toBe(listingItemTemplateOnSellerNode.ListingItems[0].hash);
    });

    test('Should search by market and seller', async () => {

        const res = await testUtilSellerNode.rpc(listingItemCommand, [listingItemSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, LISTINGITEM_SEARCHORDERFIELD,
            sellerMarket.receiveAddress,
            [],
            listingItem.seller
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(2);
        expect(result[0].hash).toBe(listingItemTemplateOnSellerNode.ListingItems[0].hash);
    });

    test('Should fail because invalid minPrice', async () => {

        const res = await testUtilSellerNode.rpc(listingItemCommand, [listingItemSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, LISTINGITEM_SEARCHORDERFIELD,
            sellerMarket.receiveAddress,
            [listingItemTemplateOnSellerNode.ListingItems[0].ItemInformation.ItemCategory.key, listingItem.ItemInformation.ItemCategory.key],
            listingItem.seller,
            -1
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('minPrice').getMessage());
    });

    test('Should search by market and minPrice', async () => {

        const res = await testUtilSellerNode.rpc(listingItemCommand, [listingItemSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, LISTINGITEM_SEARCHORDERFIELD,
            sellerMarket.receiveAddress,
            [],
            '*',
            0
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(2);
        expect(result[0].hash).toBe(listingItemTemplateOnSellerNode.ListingItems[0].hash);
    });

    test('Should fail because invalid maxPrice', async () => {

        const res = await testUtilSellerNode.rpc(listingItemCommand, [listingItemSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, LISTINGITEM_SEARCHORDERFIELD,
            sellerMarket.receiveAddress,
            [listingItemTemplateOnSellerNode.ListingItems[0].ItemInformation.ItemCategory.key, listingItem.ItemInformation.ItemCategory.key],
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
            = (listingItemTemplateOnSellerNode.ListingItems[0].PaymentInformation.ItemPrice.basePrice > listingItem.PaymentInformation.ItemPrice.basePrice)
            ? listingItemTemplateOnSellerNode.ListingItems[0].PaymentInformation.ItemPrice.basePrice + 1
            : listingItem.PaymentInformation.ItemPrice.basePrice + 1;

        const lowestBasePrice
            = (listingItemTemplateOnSellerNode.ListingItems[0].PaymentInformation.ItemPrice.basePrice < listingItem.PaymentInformation.ItemPrice.basePrice)
            ? listingItemTemplateOnSellerNode.ListingItems[0].PaymentInformation.ItemPrice.basePrice - 1
            : listingItem.PaymentInformation.ItemPrice.basePrice - 1;

        const res = await testUtilSellerNode.rpc(listingItemCommand, [listingItemSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, LISTINGITEM_SEARCHORDERFIELD,
            sellerMarket.receiveAddress,
            [],
            '*',
            lowestBasePrice,
            largestBasePrice
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(2);
        expect(result[0].hash).toBe(listingItemTemplateOnSellerNode.ListingItems[0].hash);
    });

    test('Should fail because invalid country', async () => {

        const res = await testUtilSellerNode.rpc(listingItemCommand, [listingItemSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, LISTINGITEM_SEARCHORDERFIELD,
            sellerMarket.receiveAddress,
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

        const res = await testUtilSellerNode.rpc(listingItemCommand, [listingItemSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, LISTINGITEM_SEARCHORDERFIELD,
            sellerMarket.receiveAddress,
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
        // log.debug('country1: ', listingItemTemplate.ListingItems[0].ItemInformation.ItemLocation.country);
        // log.debug('country2: ', listingItem.ItemInformation.ItemLocation.country);
        const isSameCountry = (listingItemTemplateOnSellerNode.ListingItems[0].ItemInformation.ItemLocation.country
            === listingItem.ItemInformation.ItemLocation.country);

        const res = await testUtilSellerNode.rpc(listingItemCommand, [listingItemSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, LISTINGITEM_SEARCHORDERFIELD,
            sellerMarket.receiveAddress,
            [],
            '*',
            undefined,
            undefined,
            listingItemTemplateOnSellerNode.ListingItems[0].ItemInformation.ItemLocation.country
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(isSameCountry ? 2 : 1);
        expect(result[0].hash).toBe(listingItemTemplateOnSellerNode.ListingItems[0].hash);
    });

    test('Should fail because invalid shippingDestination', async () => {

        const res = await testUtilSellerNode.rpc(listingItemCommand, [listingItemSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, LISTINGITEM_SEARCHORDERFIELD,
            sellerMarket.receiveAddress,
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

    test('Should fail because shippingDestination code not found', async () => {

        const res = await testUtilSellerNode.rpc(listingItemCommand, [listingItemSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, LISTINGITEM_SEARCHORDERFIELD,
            sellerMarket.receiveAddress,
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

    test('Should search by market and shippingDestination', async () => {
        const country = listingItemTemplateOnSellerNode.ListingItems[0].ItemInformation.ItemLocation.country;
        const shippingDestination = listingItemTemplateOnSellerNode.ListingItems[0].ItemInformation.ShippingDestinations[0].country;
        // log.debug('country: ', country);
        // log.debug('shippingDestination: ', shippingDestination);

        const hasSameShippingDestination = _.includes(listingItem.ItemInformation.ShippingDestinations, shippingDestination);

        const res = await testUtilSellerNode.rpc(listingItemCommand, [listingItemSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, LISTINGITEM_SEARCHORDERFIELD,
            sellerMarket.receiveAddress,
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
        expect(result[0].hash).toBe(listingItemTemplateOnSellerNode.ListingItems[0].hash);
    });

    test('Should search by market and country and shippingDestination', async () => {
        const country = listingItemTemplateOnSellerNode.ListingItems[0].ItemInformation.ItemLocation.country;
        const shippingDestination = listingItemTemplateOnSellerNode.ListingItems[0].ItemInformation.ShippingDestinations[0].country;
        // log.debug('country: ', country);
        // log.debug('shippingDestination: ', shippingDestination);

        const isSameCountry = (listingItemTemplateOnSellerNode.ListingItems[0].ItemInformation.ItemLocation.country
            === listingItem.ItemInformation.ItemLocation.country);
        const hasSameShippingDestination = _.includes(listingItem.ItemInformation.ShippingDestinations, shippingDestination);

        const res = await testUtilSellerNode.rpc(listingItemCommand, [listingItemSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, LISTINGITEM_SEARCHORDERFIELD,
            sellerMarket.receiveAddress,
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
        expect(result[0].hash).toBe(listingItemTemplateOnSellerNode.ListingItems[0].hash);
    });

    test('Should fail because invalid searchString', async () => {

        const res = await testUtilSellerNode.rpc(listingItemCommand, [listingItemSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, LISTINGITEM_SEARCHORDERFIELD,
            sellerMarket.receiveAddress,
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
        const res = await testUtilSellerNode.rpc(listingItemCommand, [listingItemSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, LISTINGITEM_SEARCHORDERFIELD,
            sellerMarket.receiveAddress,
            [],
            '*',
            undefined,
            undefined,
            undefined,
            undefined,
            listingItemTemplateOnSellerNode.ListingItems[0].ItemInformation.title.substr(0, 10)
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(1);
        expect(result[0].hash).toBe(listingItemTemplateOnSellerNode.ListingItems[0].hash);
    });

    test('Should search by market and shortDescription searchString', async () => {
        const res = await testUtilSellerNode.rpc(listingItemCommand, [listingItemSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, LISTINGITEM_SEARCHORDERFIELD,
            sellerMarket.receiveAddress,
            [],
            '*',
            undefined,
            undefined,
            undefined,
            undefined,
            listingItemTemplateOnSellerNode.ListingItems[0].ItemInformation.shortDescription.substr(0, 5)
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBeGreaterThan(0);
        expect(result[0].hash).toBe(listingItemTemplateOnSellerNode.ListingItems[0].hash);
    });

    test('Should search by market and longDescription searchString', async () => {
        const res = await testUtilSellerNode.rpc(listingItemCommand, [listingItemSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, LISTINGITEM_SEARCHORDERFIELD,
            sellerMarket.receiveAddress,
            [],
            '*',
            undefined,
            undefined,
            undefined,
            undefined,
            listingItemTemplateOnSellerNode.ListingItems[0].ItemInformation.longDescription.substr(0, 10)
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBeGreaterThan(0);
        expect(result[0].hash).toBe(listingItemTemplateOnSellerNode.ListingItems[0].hash);
    });

    test('Should search by market and hash searchString', async () => {
        const res = await testUtilSellerNode.rpc(listingItemCommand, [listingItemSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, LISTINGITEM_SEARCHORDERFIELD,
            sellerMarket.receiveAddress,
            [],
            '*',
            undefined,
            undefined,
            undefined,
            undefined,
            listingItemTemplateOnSellerNode.ListingItems[0].hash
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(1);
        expect(result[0].hash).toBe(listingItemTemplateOnSellerNode.ListingItems[0].hash);
    });

    test('Should fail because invalid flagged', async () => {

        const res = await testUtilSellerNode.rpc(listingItemCommand, [listingItemSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, LISTINGITEM_SEARCHORDERFIELD,
            sellerMarket.receiveAddress,
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
        const res = await testUtilSellerNode.rpc(listingItemCommand, [listingItemSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, LISTINGITEM_SEARCHORDERFIELD,
            sellerMarket.receiveAddress,
            [],
            '*',
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(2);
        expect(result[0].hash).toBe(listingItemTemplateOnSellerNode.ListingItems[0].hash);
    });

    test('Should fail because invalid hash', async () => {

        const res = await testUtilSellerNode.rpc(listingItemCommand, [listingItemSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, LISTINGITEM_SEARCHORDERFIELD,
            sellerMarket.receiveAddress,
            [],
            '*',
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('listingItemHash', 'string').getMessage());
    });

    test('Should search by market and hash', async () => {
        const res = await testUtilSellerNode.rpc(listingItemCommand, [listingItemSearchCommand,
            PAGE, PAGE_LIMIT, SEARCHORDER, LISTINGITEM_SEARCHORDERFIELD,
            sellerMarket.receiveAddress,
            [],
            '*',
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            listingItem.hash
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(1);
        expect(result[0].hash).toBe(listingItem.hash);

        log.debug('listingItem:', JSON.stringify(listingItem, null, 2));
        log.debug('result[0].PaymentInformation:', JSON.stringify(result[0].PaymentInformation, null, 2));

        expect(result[0].PaymentInformation.id).toBe(listingItem.PaymentInformation.id);
        expect(result[0].PaymentInformation.type).toBe(listingItem.PaymentInformation.type);
        expect(result[0].PaymentInformation.Escrow.type).toBe(listingItem.PaymentInformation.Escrow.type);
        expect(result[0].PaymentInformation.Escrow.Ratio.buyer).toBe(listingItem.PaymentInformation.Escrow.Ratio.buyer);
        expect(result[0].PaymentInformation.Escrow.Ratio.seller).toBe(listingItem.PaymentInformation.Escrow.Ratio.seller);
        expect(result[0].PaymentInformation.Escrow.releaseType).toBe(listingItem.PaymentInformation.Escrow.releaseType);
        expect(result[0].PaymentInformation.ItemPrice.currency).toBe(listingItem.PaymentInformation.ItemPrice.currency);
        expect(result[0].PaymentInformation.ItemPrice.basePrice).toBe(listingItem.PaymentInformation.ItemPrice.basePrice);
        expect(result[0].PaymentInformation.ItemPrice.ShippingPrice.domestic).toBe(listingItem.PaymentInformation.ItemPrice.ShippingPrice.domestic);
        expect(result[0].PaymentInformation.ItemPrice.ShippingPrice.international).toBe(listingItem.PaymentInformation.ItemPrice.ShippingPrice.international);
        expect(result[0].PaymentInformation.ItemPrice.CryptocurrencyAddress.type).toBe(listingItem.PaymentInformation.ItemPrice.CryptocurrencyAddress.type);
        expect(result[0].PaymentInformation.ItemPrice.CryptocurrencyAddress.address)
            .toBe(listingItem.PaymentInformation.ItemPrice.CryptocurrencyAddress.address);
    });

    test('Should post ListingItem from SELLER node', async () => {

        log.debug('========================================================================================');
        log.debug('SELLER POSTS MPA_LISTING_ADD');
        log.debug('========================================================================================');

        await testUtilSellerNode.waitFor(5);
        expect(listingItemTemplateOnSellerNode.id).toBeDefined();

        // Post ListingItemTemplate to create ListingItem
        const res = await testUtilSellerNode.rpc(templateCommand, [templatePostCommand,
            listingItemTemplateOnSellerNode.id,
            DAYS_RETENTION
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        // make sure we got the expected result from posting the template
        const result: any = res.getBody()['result'];
        sent = result.result === 'Sent.';
        if (!sent) {
            log.debug(JSON.stringify(result, null, 2));
        }
        expect(result.result).toBe('Sent.');
        // expect(result.txid).toBeDefined();
        // expect(result.fee).toBeGreaterThan(0);

        log.debug('==> ListingItemTemplate posted.');

    }, 600000); // timeout to 600s

    test('Should have received ListingItem (MPA_LISTING_ADD) on BUYER node, ListingItem is created', async () => {

        // sending should have succeeded for this test to work
        expect(sent).toBeTruthy();

        log.debug('========================================================================================');
        log.debug('BUYER RECEIVES MPA_LISTING_ADD posted from sellers node, ListingItem is created');
        log.debug('========================================================================================');

        let response: any = await testUtilBuyerNode.rpcWaitFor(
            listingItemCommand,
            [listingItemSearchCommand,
                PAGE, PAGE_LIMIT, SEARCHORDER, LISTINGITEM_SEARCHORDERFIELD,
                buyerMarket.receiveAddress,
                [],
                '*',
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                listingItemTemplateOnSellerNode.hash
            ],
            15 * 60,
            200,
            '[0].hash',
            listingItemTemplateOnSellerNode.hash
        );
        response.expectJson();
        response.expectStatusCode(200);

        const results: resources.ListingItem[] = response.getBody()['result'];

        log.debug('results:', JSON.stringify(results, null, 2));

        expect(results.length).toBe(1);
        expect(results[0].hash).toBe(listingItemTemplateOnSellerNode.hash);

        expect(results[0].PaymentInformation.type).toBe(listingItemTemplateOnSellerNode.PaymentInformation.type);
        expect(results[0].PaymentInformation.Escrow.type).toBe(listingItemTemplateOnSellerNode.PaymentInformation.Escrow.type);
        expect(results[0].PaymentInformation.Escrow.Ratio.buyer).toBe(listingItemTemplateOnSellerNode.PaymentInformation.Escrow.Ratio.buyer);
        expect(results[0].PaymentInformation.Escrow.Ratio.seller).toBe(listingItemTemplateOnSellerNode.PaymentInformation.Escrow.Ratio.seller);
        expect(results[0].PaymentInformation.Escrow.releaseType).toBe(listingItemTemplateOnSellerNode.PaymentInformation.Escrow.releaseType);
        expect(results[0].PaymentInformation.ItemPrice.currency).toBe(listingItemTemplateOnSellerNode.PaymentInformation.ItemPrice.currency);
        expect(results[0].PaymentInformation.ItemPrice.basePrice).toBe(listingItemTemplateOnSellerNode.PaymentInformation.ItemPrice.basePrice);
        expect(results[0].PaymentInformation.ItemPrice.ShippingPrice.domestic)
            .toBe(listingItemTemplateOnSellerNode.PaymentInformation.ItemPrice.ShippingPrice.domestic);
        expect(results[0].PaymentInformation.ItemPrice.ShippingPrice.international)
            .toBe(listingItemTemplateOnSellerNode.PaymentInformation.ItemPrice.ShippingPrice.international);
        expect(results[0].PaymentInformation.ItemPrice.CryptocurrencyAddress.type)
            .toBe(listingItemTemplateOnSellerNode.PaymentInformation.ItemPrice.CryptocurrencyAddress.type);
        expect(results[0].PaymentInformation.ItemPrice.CryptocurrencyAddress.address)
            .toBe(listingItemTemplateOnSellerNode.PaymentInformation.ItemPrice.CryptocurrencyAddress.address);

        await testUtilBuyerNode.waitFor(5);

        response = await testUtilBuyerNode.rpc(listingItemCommand, [listingItemGetCommand,
            results[0].id
        ]);
        response.expectJson();
        response.expectStatusCode(200);

        const result: resources.ListingItem = response.getBody()['result'];
        expect(result).toBeDefined();
        expect(result.hash).toBe(listingItemTemplateOnSellerNode.hash);

        log.debug('==> BUYER received MPA_LISTING_ADD.');
    }, 600000); // timeout to 600s

});
