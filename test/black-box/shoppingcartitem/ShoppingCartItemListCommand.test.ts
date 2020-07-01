// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';

describe('ShoppingCartItemListCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const shoppingCartCommand = Commands.SHOPPINGCART_ROOT.commandName;
    const shoppingCartAddCommand = Commands.SHOPPINGCART_ADD.commandName;

    const shoppingCartItemCommand = Commands.SHOPPINGCARTITEM_ROOT.commandName;
    const shoppingCartItemListCommand = Commands.SHOPPINGCARTITEM_LIST.commandName;
    const shoppingCartItemAddCommand = Commands.SHOPPINGCARTITEM_ADD.commandName;

    let profile: resources.Profile;
    let market: resources.Market;

    let shoppingCart1: resources.ShoppingCart;
    let shoppingCart2: resources.ShoppingCart;
    let listingItem1: resources.ListingItem;
    let listingItem2: resources.ListingItem;

    beforeAll(async () => {
        await testUtil.cleanDb();

        profile = await testUtil.getDefaultProfile();
        expect(profile.id).toBeDefined();
        market = await testUtil.getDefaultMarket(profile.id);
        expect(market.id).toBeDefined();

        shoppingCart1 = profile.ShoppingCart[0];

        let res = await testUtil.rpc(shoppingCartCommand, [shoppingCartAddCommand,
            profile.id,
            'SECOND_SHOPPING_CART'
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        shoppingCart2 = res.getBody()['result'];

        // create ListingItemTemplate
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,           // generateItemInformation
            true,           // generateItemLocation
            true,           // generateShippingDestinations
            false,          // generateItemImages
            true,           // generatePaymentInformation
            true,           // generateEscrow
            true,           // generateItemPrice
            true,           // generateMessagingInformation
            false,          // generateListingItemObjects
            false,          // generateObjectDatas
            profile.id,     // profileId
            true,           // generateListingItem
            market.id       // soldOnMarketId
        ]).toParamsArray();

        const listingItemTemplates: resources.ListingItemTemplate[] = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE,
            2,
            true,
            generateListingItemTemplateParams
        );

        listingItem1 = listingItemTemplates[0].ListingItems[0];
        listingItem2 = listingItemTemplates[1].ListingItems[0];


        // add listingItem to shoppingCart1
        res = await testUtil.rpc(shoppingCartItemCommand, [shoppingCartItemAddCommand,
            shoppingCart1.id,
            listingItem1.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        // add second listingItem to shoppingCart2
        res = await testUtil.rpc(shoppingCartItemCommand, [shoppingCartItemAddCommand,
            shoppingCart2.id,
            listingItem2.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

    });

    test('Should fail because missing shoppingCartId', async () => {
        const res = await testUtil.rpc(shoppingCartItemCommand, [shoppingCartItemListCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('id').getMessage());
    });

    test('Should fail because invalid shoppingCartId', async () => {

        const res = await testUtil.rpc(shoppingCartItemCommand, [shoppingCartItemListCommand,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('id', 'number').getMessage());
    });

    test('Should fail because missing ShoppingCart', async () => {
        const res: any = await testUtil.rpc(shoppingCartItemCommand, [shoppingCartItemListCommand,
            0
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('ShoppingCart').getMessage());
    });

    test('Should list ShoppingCartItems in the ShoppingCart 1', async () => {
        const res = await testUtil.rpc(shoppingCartItemCommand, [shoppingCartItemListCommand,
            shoppingCart1.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(1);
    });

    test('Should list ShoppingCartItems in the ShoppingCart 2', async () => {
        const res = await testUtil.rpc(shoppingCartItemCommand, [shoppingCartItemListCommand,
            shoppingCart2.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(1);
    });

});
