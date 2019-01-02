// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';

import { PaymentType } from '../../../src/api/enums/PaymentType';
import { Currency } from '../../../src/api/enums/Currency';
import { Logger as LoggerType } from '../../../src/core/Logger';
import * as resources from 'resources';

describe('ListingItemTemplateAddCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const templateCommand = Commands.TEMPLATE_ROOT.commandName;
    const templateAddCommand = Commands.TEMPLATE_ADD.commandName;
    const categoryCommand = Commands.CATEGORY_ROOT.commandName;
    const categoryAddCommand = Commands.CATEGORY_ADD.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;
    let category: resources.ItemCategory;

    beforeAll(async () => {
        await testUtil.cleanDb();

        // get default profile and market
        defaultProfile = await testUtil.getDefaultProfile();
        defaultMarket = await testUtil.getDefaultMarket();

        // todo: test with existing category, not a custom one
        const categoryResult = await testUtil.rpc(categoryCommand, [categoryAddCommand, 'templateCategory', 'category for Template', 'cat_ROOT']);
        categoryResult.expectJson();
        categoryResult.expectStatusCode(200);
        category = categoryResult.getBody()['result'];


    });

    test('Should create a new ListingItemTemplate with Profile + ItemInformation + PaymentInformation', async () => {

        const testData = [
            templateAddCommand,
            defaultProfile.id,              // [0]: profile_id
            'Test Title',                   // [1]: title
            'test short description',       // [2]: short description
            'Long description',             // [3]: long description
            category.id,              // [4]: categoryID
            PaymentType.SALE,               // [5]: payment type
            Currency.PARTICL,               // [6]: currency
            10.1234,                        // [7]: base price
            2.12341234,                     // [8]: domestic shipping price
            1.12341234,                     // [9]: international shipping price
            'Pasfdasfzcxvcvzcxvcxzvsfadf4'  // [11]: payment address
        ];

        const res = await testUtil.rpc(templateCommand, testData);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        expect(result).hasOwnProperty('Profile');
        expect(result).hasOwnProperty('ItemInformation');
        expect(result).hasOwnProperty('PaymentInformation');
        expect(result).hasOwnProperty('MessagingInformation');
        expect(result).hasOwnProperty('ListingItemObjects');
        expect(result).hasOwnProperty('ListingItems');
        expect(result.Profile.id).toBe(testData[1]);
        expect(result.ItemInformation.title).toBe(testData[2]);
        expect(result.ItemInformation.shortDescription).toBe(testData[3]);
        expect(result.ItemInformation.longDescription).toBe(testData[4]);
        expect(result.ItemInformation.ItemCategory.id).toBe(testData[5]);
        expect(result.PaymentInformation.type).toBe(testData[6]);
        expect(result.PaymentInformation.ItemPrice.currency).toBe(testData[7]);
        expect(result.PaymentInformation.ItemPrice.basePrice).toBe(testData[8]);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.domestic).toBe(testData[9]);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.international).toBe(testData[10]);
        expect(result.PaymentInformation.ItemPrice.CryptocurrencyAddress.address).toBe(testData[11]);

    });

    test('Should create a new ListingItemTemplate with Profile + ItemInformation + PaymentInformation without CryptocurrencyAddress', async () => {

        const testData = [
            templateAddCommand,
            defaultProfile.id,              // [0]: profile_id
            'Test Title 2',                 // [1]: title
            'test short description 2',     // [2]: short description
            'Long description 2',           // [3]: long description
            category.id,                    // [4]: categoryID
            PaymentType.SALE,               // [5]: payment type
            Currency.PARTICL,               // [6]: currency
            10.1234,                        // [7]: base price
            2.12341234,                     // [8]: domestic shipping price
            1.12341234                      // [9]: international shipping price
        ];

        const res = await testUtil.rpc(templateCommand, testData);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        expect(result.Profile.id).toBe(testData[1]);
        expect(result.ItemInformation.title).toBe(testData[2]);
        expect(result.ItemInformation.shortDescription).toBe(testData[3]);
        expect(result.ItemInformation.longDescription).toBe(testData[4]);
        expect(result.ItemInformation.ItemCategory.id).toBe(testData[5]);
        expect(result.PaymentInformation.type).toBe(testData[6]);
        expect(result.PaymentInformation.ItemPrice.currency).toBe(testData[7]);
        expect(result.PaymentInformation.ItemPrice.basePrice).toBe(testData[8]);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.domestic).toBe(testData[9]);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.international).toBe(testData[10]);
        expect(result.PaymentInformation.ItemPrice.CryptocurrencyAddress).not.toBeDefined();

    });

    test('Should fail because we want to create an empty ItemTemplate', async () => {
        const testData = [templateAddCommand];
        const res = await testUtil.rpc(templateCommand, testData);
        res.expectJson();
        res.expectStatusCode(404);
    });

});
