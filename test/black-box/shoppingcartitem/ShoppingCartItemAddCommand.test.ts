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
import { MessageException } from '../../../src/api/exceptions/MessageException';

describe('ShoppingCartItemAddCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const shoppingCartItemCommand = Commands.SHOPPINGCARTITEM_ROOT.commandName;
    const shoppingCartItemAddCommand = Commands.SHOPPINGCARTITEM_ADD.commandName;

    let profile: resources.Profile;
    let market: resources.Market;

    let shoppingCart: resources.ShoppingCart;
    let listingItem1: resources.ListingItem;
    let listingItem2: resources.ListingItem;

    beforeAll(async () => {
        await testUtil.cleanDb();

        profile = await testUtil.getDefaultProfile();
        expect(profile.id).toBeDefined();
        market = await testUtil.getDefaultMarket(profile.id);
        expect(market.id).toBeDefined();

        shoppingCart = profile.ShoppingCart[0];

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
        listingItem2 = listingItemTemplates[0].ListingItems[0];

    });

    test('Should fail because missing cartId', async () => {
        const res: any = await testUtil.rpc(shoppingCartItemCommand, [shoppingCartItemAddCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('cartId').getMessage());
    });

    test('Should fail because missing listingItemId', async () => {
        const res: any = await testUtil.rpc(shoppingCartItemCommand, [shoppingCartItemAddCommand,
            shoppingCart.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('listingItemId').getMessage());
    });

    test('Should fail because invalid cartId', async () => {
        const res = await testUtil.rpc(shoppingCartItemCommand, [shoppingCartItemAddCommand,
            false,
            listingItem1.id
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('cartId', 'number').getMessage());
    });

    test('Should fail because invalid listingItemId', async () => {
        const res = await testUtil.rpc(shoppingCartItemCommand, [shoppingCartItemAddCommand,
            shoppingCart.id,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('listingItemId', 'number').getMessage());
    });

    test('Should fail because missing ShoppingCart', async () => {
        const res = await testUtil.rpc(shoppingCartItemCommand, [shoppingCartItemAddCommand,
            0,
            listingItem1.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('ShoppingCart').getMessage());
    });

    test('Should fail because missing ListingItem', async () => {
        const res = await testUtil.rpc(shoppingCartItemCommand, [shoppingCartItemAddCommand,
            shoppingCart.id,
            0
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('ListingItem').getMessage());
    });

    test('Should add ListingItem to ShoppingCart', async () => {
        const res = await testUtil.rpc(shoppingCartItemCommand, [shoppingCartItemAddCommand,
            shoppingCart.id,
            listingItem1.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.ShoppingCartItem = res.getBody()['result'];
        expect(result.ShoppingCart.id).toBe(shoppingCart.id);
        expect(result.ListingItem.id).toBe(listingItem1.id);
    });

    test('Should fail because ListingItem already added', async () => {
        const res = await testUtil.rpc(shoppingCartItemCommand, [shoppingCartItemAddCommand,
            shoppingCart.id,
            listingItem1.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MessageException(`ListingItem already added to ShoppingCart`).getMessage());
    });

});
