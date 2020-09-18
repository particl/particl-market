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

describe('ShoppingCartClearCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const shoppingCartCommand = Commands.SHOPPINGCART_ROOT.commandName;
    const shoppingCartClearCommand = Commands.SHOPPINGCART_CLEAR.commandName;
    const cartItemCommand = Commands.SHOPPINGCARTITEM_ROOT.commandName;
    const cartItemAddCommand = Commands.SHOPPINGCARTITEM_ADD.commandName;
    const cartItemListCommand = Commands.SHOPPINGCARTITEM_LIST.commandName;

    let profile: resources.Profile;
    let market: resources.Market;
    let shoppingCart: resources.ShoppingCart;

    let listingItem1: resources.ListingItem;
    let listingItem2: resources.ListingItem;

    beforeAll(async () => {
        await testUtil.cleanDb();

        // get default profile and market
        profile = await testUtil.getDefaultProfile();
        expect(profile.id).toBeDefined();
        market = await testUtil.getDefaultMarket(profile.id);
        expect(market.id).toBeDefined();

        shoppingCart = market.Identity.ShoppingCarts[0];

        // generate ListingItemTemplate with ListingItem
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,                   // generateItemInformation
            true,                   // generateItemLocation
            true,                   // generateShippingDestinations
            false,                  // generateImages
            true,                   // generatePaymentInformation
            true,                   // generateEscrow
            true,                   // generateItemPrice
            false,                  // generateMessagingInformation
            false,                  // generateListingItemObjects
            false,                  // generateObjectDatas
            profile.id,             // profileId
            true,                   // generateListingItem
            market.id               // soldOnMarketId
        ]).toParamsArray();

        const listingItemTemplates: resources.ListingItemTemplate[] = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE,
            2,
            true,
            generateListingItemTemplateParams
        );

        listingItem1 = listingItemTemplates[0].ListingItems[0];
        listingItem2 = listingItemTemplates[1].ListingItems[0];

        // add listingItem to shoppingCart
        let res = await testUtil.rpc(cartItemCommand, [cartItemAddCommand,
            shoppingCart.id,
            listingItem1.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        // add second listingItem to shoppingCart
        res = await testUtil.rpc(cartItemCommand, [cartItemAddCommand,
            shoppingCart.id,
            listingItem2.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

    });

    test('Should fail because missing shoppingCartId', async () => {
        const res: any = await testUtil.rpc(shoppingCartCommand, [shoppingCartClearCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('cartId').getMessage());
    });

    test('Should fail because invalid shoppingCartId', async () => {
        const res = await testUtil.rpc(shoppingCartCommand, [shoppingCartClearCommand,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('cartId', 'number').getMessage());
    });

    test('Should fail because missing ShoppingCart', async () => {
        const res: any = await testUtil.rpc(shoppingCartCommand, [shoppingCartClearCommand,
            0
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('ShoppingCart').getMessage());
    });

    test('Should clear ShoppingCart', async () => {
        let res = await testUtil.rpc(shoppingCartCommand, [shoppingCartClearCommand,
            shoppingCart.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        // check whether ShoppingCart was cleared or not
        res = await testUtil.rpc(cartItemCommand, [cartItemListCommand, shoppingCart.id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(0);
    });

});
