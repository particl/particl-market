// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';

describe('ShoppingCartItemRemoveCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const shoppingCartItemCommand = Commands.SHOPPINGCARTITEM_ROOT.commandName;
    const shoppingCartItemRemoveCommand = Commands.SHOPPINGCARTITEM_REMOVE.commandName;
    const shoppingCartItemAddCommand = Commands.SHOPPINGCARTITEM_ADD.commandName;
    const shoppingCartItemListCommand = Commands.SHOPPINGCARTITEM_LIST.commandName;

    let profile: resources.Profile;
    let market: resources.Market;

    let shoppingCart: resources.ShoppingCart;
    let listingItem1: resources.ListingItem;
    let listingItem2: resources.ListingItem;
    let shoppingCartItem1: resources.ShoppingCart;
    let shoppingCartItem2: resources.ShoppingCart;

    beforeAll(async () => {
        await testUtil.cleanDb();

        profile = await testUtil.getDefaultProfile();
        expect(profile.id).toBeDefined();
        market = await testUtil.getDefaultMarket(profile.id);
        expect(market.id).toBeDefined();

        shoppingCart = market.Identity.ShoppingCarts[0];

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
        let res = await testUtil.rpc(shoppingCartItemCommand, [shoppingCartItemAddCommand,
            shoppingCart.id,
            listingItem1.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        // add second listingItem to shoppingCart2
        res = await testUtil.rpc(shoppingCartItemCommand, [shoppingCartItemAddCommand,
            shoppingCart.id,
            listingItem2.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        res = await testUtil.rpc(shoppingCartItemCommand, [shoppingCartItemListCommand,
            shoppingCart.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.ShoppingCartItem[] = res.getBody()['result'];
        expect(result).toHaveLength(2);

        shoppingCartItem1 = result[0];
        shoppingCartItem2 = result[1];

    });

    test('Should fail because missing shoppingCartId', async () => {
        const res = await testUtil.rpc(shoppingCartItemCommand, [shoppingCartItemRemoveCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('id').getMessage());
    });

    test('Should fail because invalid shoppingCartId', async () => {

        const res = await testUtil.rpc(shoppingCartItemCommand, [shoppingCartItemRemoveCommand,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('id', 'number').getMessage());
    });

    test('Should fail because missing ShoppingCartItem', async () => {
        const res: any = await testUtil.rpc(shoppingCartItemCommand, [shoppingCartItemRemoveCommand,
            0
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('ShoppingCartItem').getMessage());
    });

    test('Should remove ShoppingCartItem from ShoppingCart', async () => {
        let res = await testUtil.rpc(shoppingCartItemCommand, [shoppingCartItemRemoveCommand,
            shoppingCartItem1.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        res = await testUtil.rpc(shoppingCartItemCommand, [shoppingCartItemListCommand,
            shoppingCart.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.ShoppingCartItem[] = res.getBody()['result'];
        expect(result).toHaveLength(1);
    });

    test('Should remove last ShoppingCartItem from ShoppingCart', async () => {
        let res = await testUtil.rpc(shoppingCartItemCommand, [shoppingCartItemRemoveCommand,
            shoppingCartItem2.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        res = await testUtil.rpc(shoppingCartItemCommand, [shoppingCartItemListCommand,
            shoppingCart.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.ShoppingCartItem[] = res.getBody()['result'];
        expect(result).toHaveLength(0);

    });

});
