// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemParams } from '../../../src/api/requests/testdata/GenerateListingItemParams';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { MarketType } from '../../../src/api/enums/MarketType';
import { PrivateKey, Networks } from 'particl-bitcore-lib';
import { MessageException } from '../../../src/api/exceptions/MessageException';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';

describe('ItemCategoryRemoveCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const categoryCommand = Commands.CATEGORY_ROOT.commandName;
    const categoryAddCommand = Commands.CATEGORY_ADD.commandName;
    const categoryListCommand = Commands.CATEGORY_LIST.commandName;
    const categoryRemoveCommand = Commands.CATEGORY_REMOVE.commandName;
    const marketCommand = Commands.MARKET_ROOT.commandName;
    const marketAddCommand = Commands.MARKET_ADD.commandName;

    let market: resources.Market;
    let profile: resources.Profile;
    let storefront: resources.Market;

    let defaultRootCategory: resources.ItemCategory;
    let storefrontRootCategory: resources.ItemCategory;
    let customStorefrontCategory: resources.ItemCategory;

    const storeFrontAdminData = {
        name: 'TEST-2',
        type: MarketType.STOREFRONT_ADMIN,
        receiveKey: 'receiveKey',
        publishKey: 'publishKey'
        // receiveKey !== publishKey
    };

    beforeAll(async () => {
        await testUtil.cleanDb();

        profile = await testUtil.getDefaultProfile();
        expect(profile.id).toBeDefined();
        market = await testUtil.getDefaultMarket(profile.id);
        expect(market.id).toBeDefined();

        const res = await testUtil.rpc(categoryCommand, [categoryListCommand]);
        res.expectJson();
        res.expectStatusCode(200);
        defaultRootCategory = res.getBody()['result'];

        const network = Networks.testnet;
        let privateKey: PrivateKey = PrivateKey.fromRandom(Networks.testnet);

        privateKey = PrivateKey.fromRandom(network);
        storeFrontAdminData.receiveKey = privateKey.toWIF();
        privateKey = PrivateKey.fromRandom(network);
        storeFrontAdminData.publishKey = privateKey.toWIF();    // but different
        storeFrontAdminData.name = storeFrontAdminData.receiveKey;
    });


    test('Should create a new storefront (STOREFRONT_ADMIN)', async () => {
        const res = await testUtil.rpc(marketCommand, [marketAddCommand,
            profile.id,
            storeFrontAdminData.name,
            storeFrontAdminData.type,
            storeFrontAdminData.receiveKey,
            storeFrontAdminData.publishKey,
            market.Identity.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.Market = res.getBody()['result'];
        expect(result.name).toBe(storeFrontAdminData.name);
        expect(result.type).toBe(storeFrontAdminData.type);
        expect(result.receiveKey).toBe(storeFrontAdminData.receiveKey);
        expect(result.receiveAddress).toBeDefined();
        expect(result.publishKey).toBe(storeFrontAdminData.publishKey);
        expect(result.publishAddress).toBeDefined();
        expect(result.receiveKey).not.toBe(result.publishKey);

        storefront = result;
    });


    test('Should create custom ItemCategory on the new storefront', async () => {

        let res = await testUtil.rpc(categoryCommand, [categoryListCommand,
            storefront.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        storefrontRootCategory = res.getBody()['result'];

        res = await testUtil.rpc(categoryCommand, [categoryAddCommand,
            storefront.id,
            'customcategoryname',
            'description',
            storefrontRootCategory.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        customStorefrontCategory = res.getBody()['result'];

        expect(customStorefrontCategory.name).toBe('customcategoryname');
        expect(customStorefrontCategory.description).toBe('description');
        expect(customStorefrontCategory.ParentItemCategory.id).toBe(storefrontRootCategory.id);
    });


    test('Should fail because missing categoryId', async () => {
        const res = await testUtil.rpc(categoryCommand, [categoryRemoveCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('categoryId').getMessage());
    });

    test('Should fail because invalid categoryId', async () => {
        const res = await testUtil.rpc(categoryCommand, [categoryRemoveCommand,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('categoryId', 'number').getMessage());
    });

    test('Should not delete ItemCategory because not found', async () => {
        const res = await testUtil.rpc(categoryCommand, [categoryRemoveCommand,
            0
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('ItemCategory').getMessage());
    });


    test('Should not delete default ItemCategory', async () => {
        const res = await testUtil.rpc(categoryCommand, [categoryRemoveCommand,
            defaultRootCategory.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MessageException('Default ItemCategory cannot be removed.').getMessage());
    });


    test('Should delete the ItemCategory', async () => {
        const res = await testUtil.rpc(categoryCommand, [categoryRemoveCommand,
            customStorefrontCategory.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
    });


    test('Should create new custom ItemCategory on the new storefront', async () => {

        let res = await testUtil.rpc(categoryCommand, [categoryListCommand,
            storefront.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        storefrontRootCategory = res.getBody()['result'];

        res = await testUtil.rpc(categoryCommand, [categoryAddCommand,
            storefront.id,
            'customcategoryname2',
            'description2',
            storefrontRootCategory.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        customStorefrontCategory = res.getBody()['result'];

        expect(customStorefrontCategory.name).toBe('customcategoryname2');
        expect(customStorefrontCategory.description).toBe('description2');
        expect(customStorefrontCategory.ParentItemCategory.id).toBe(storefrontRootCategory.id);
    });


    test('Should create new ListingItem having custom ItemCategory on the new storefront', async () => {

        const generateListingItemParams = new GenerateListingItemParams([
            true,                           // generateItemInformation
            true,                           // generateItemLocation
            true,                           // generateShippingDestinations
            false,                          // generateItemImages
            true,                           // generatePaymentInformation
            true,                           // generateEscrow
            true,                           // generateItemPrice
            true,                           // generateMessagingInformation
            false,                          // generateListingItemObjects
            false,                          // generateObjectDatas
            null,                           // listingItemTemplateHash
            null,                           // seller
            customStorefrontCategory.id     // categoryId
        ]).toParamsArray();

        const listingItems = await testUtil.generateData(
            CreatableModel.LISTINGITEM,     // what to generate
            1,                      // how many to generate
            true,                // return model
            generateListingItemParams       // what kind of data to generate
        );
    });


    test('Should not delete the ItemCategory if there is a ListingItem related with ItemCategory', async () => {
        const res = await testUtil.rpc(categoryCommand, [categoryRemoveCommand,
            customStorefrontCategory.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MessageException(`ItemCategory associated with ListingItem cannot be deleted.`).getMessage());
    });


    test('Should create new ListingItemTemplate having custom ItemCategory on the new storefront', async () => {

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,                           // generateItemInformation
            true,                           // generateItemLocation
            true,                           // generateShippingDestinations
            false,                          // generateItemImages
            true,                           // generatePaymentInformation
            true,                           // generateEscrow
            true,                           // generateItemPrice
            true,                           // generateMessagingInformation
            false,                          // generateListingItemObjects
            false,                          // generateObjectDatas
            profile.id,                     // profileId
            true,                           // generateListingItem
            storefront.id,                  // soldOnMarketId
            customStorefrontCategory.id     // categoryId
        ]).toParamsArray();

        const listingItemTemplates: resources.ListingItemTemplate[] = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE,
            1,
            true,
            generateListingItemTemplateParams
        );
    });


    test('Should not delete the ItemCategory if there is a ListingItemTemplate related with ItemCategory', async () => {
        const res = await testUtil.rpc(categoryCommand, [categoryRemoveCommand,
            customStorefrontCategory.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MessageException(`ItemCategory associated with ListingItemTemplate cannot be deleted.`).getMessage());
    });

});
