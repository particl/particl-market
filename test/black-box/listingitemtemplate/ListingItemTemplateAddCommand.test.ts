// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { EscrowType, SaleType } from 'omp-lib/dist/interfaces/omp-enums';
import { Cryptocurrency } from 'omp-lib/dist/interfaces/crypto';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';

describe('ListingItemTemplateAddCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const templateCommand = Commands.TEMPLATE_ROOT.commandName;
    const templateAddCommand = Commands.TEMPLATE_ADD.commandName;
    const categoryCommand = Commands.CATEGORY_ROOT.commandName;
    const categoryListCommand = Commands.CATEGORY_LIST.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;
    let rootCategory: resources.ItemCategory;

    beforeAll(async () => {
        await testUtil.cleanDb();

        // get default profile and market
        defaultProfile = await testUtil.getDefaultProfile();
        defaultMarket = await testUtil.getDefaultMarket();

        const categoryResult = await testUtil.rpc(categoryCommand, [categoryListCommand]);
        categoryResult.expectJson();
        categoryResult.expectStatusCode(200);
        rootCategory = categoryResult.getBody()['result'];
    });

    test('Should fail to add because missing profileId', async () => {
        const res = await testUtil.rpc(templateCommand, [templateAddCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('profileId').getMessage());
    });

    test('Should fail to add because missing title', async () => {
        const res = await testUtil.rpc(templateCommand, [templateAddCommand,
            defaultProfile.id               // [0]: profile_id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('title').getMessage());
    });

    test('Should fail to add because missing shortDescription', async () => {
        const res = await testUtil.rpc(templateCommand, [templateAddCommand,
            defaultProfile.id,              // [0]: profile_id
            'Test Title',                   // [1]: title
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('shortDescription').getMessage());
    });

    test('Should fail to add because missing longDescription', async () => {
        const res = await testUtil.rpc(templateCommand, [templateAddCommand,
            defaultProfile.id,              // [0]: profile_id
            'Test Title',                   // [1]: title
            'test short description'        // [2]: short description
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('longDescription').getMessage());
    });

    test('Should fail to add because missing categoryId', async () => {
        const res = await testUtil.rpc(templateCommand, [templateAddCommand,
            defaultProfile.id,              // [0]: profile_id
            'Test Title',                   // [1]: title
            'test short description',       // [2]: short description
            'Long description'              // [3]: long description
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('categoryId').getMessage());
    });

    test('Should fail to add because missing saleType', async () => {
        const res = await testUtil.rpc(templateCommand, [templateAddCommand,
            defaultProfile.id,              // [0]: profile_id
            'Test Title',                   // [1]: title
            'test short description',       // [2]: short description
            'Long description',             // [3]: long description
            rootCategory.id                 // [4]: categoryID
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('saleType').getMessage());
    });

    test('Should fail to add because missing currency', async () => {
        const res = await testUtil.rpc(templateCommand, [templateAddCommand,
            defaultProfile.id,              // [0]: profile_id
            'Test Title',                   // [1]: title
            'test short description',       // [2]: short description
            'Long description',             // [3]: long description
            rootCategory.id,                // [4]: categoryID
            SaleType.SALE                   // [5]: sale type
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('currency').getMessage());
    });

    test('Should fail to add because missing basePrice', async () => {
        const res = await testUtil.rpc(templateCommand, [templateAddCommand,
            defaultProfile.id,              // [0]: profile_id
            'Test Title',                   // [1]: title
            'test short description',       // [2]: short description
            'Long description',             // [3]: long description
            rootCategory.id,                // [4]: categoryID
            SaleType.SALE,                  // [5]: sale type
            Cryptocurrency.PART             // [6]: currency
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('basePrice').getMessage());
    });

    test('Should fail to add because missing domesticShippingPrice', async () => {
        const res = await testUtil.rpc(templateCommand, [templateAddCommand,
            defaultProfile.id,              // [0]: profile_id
            'Test Title',                   // [1]: title
            'test short description',       // [2]: short description
            'Long description',             // [3]: long description
            rootCategory.id,                // [4]: categoryID
            SaleType.SALE,                  // [5]: sale type
            Cryptocurrency.PART,            // [6]: currency
            10                              // [7]: base price
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('domesticShippingPrice').getMessage());
    });

    test('Should fail to add because missing internationalShippingPrice', async () => {
        const res = await testUtil.rpc(templateCommand, [templateAddCommand,
            defaultProfile.id,              // [0]: profile_id
            'Test Title',                   // [1]: title
            'test short description',       // [2]: short description
            'Long description',             // [3]: long description
            rootCategory.id,                // [4]: categoryID
            SaleType.SALE,                  // [5]: sale type
            Cryptocurrency.PART,            // [6]: currency
            10,                             // [7]: base price
            20                              // [8]: domestic shipping price
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('internationalShippingPrice').getMessage());
    });

    test('Should fail to add because invalid type of profileId', async () => {

        const res = await testUtil.rpc(templateCommand, [templateAddCommand,
            'INVALID',                      // [0]: profile_id
            'Test Title',                   // [1]: title
            'test short description',       // [2]: short description
            'Long description',             // [3]: long description
            rootCategory.id,                // [4]: categoryID
            SaleType.SALE,                  // [5]: sale type
            Cryptocurrency.PART,            // [6]: currency
            10,                             // [7]: base price
            20,                             // [8]: domestic shipping price
            30                              // [9]: international shipping price
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('profileId', 'number').getMessage());
    });

    test('Should fail to add because invalid type of title', async () => {

        const res = await testUtil.rpc(templateCommand, [templateAddCommand,
            defaultProfile.id,              // [0]: profile_id
            0,                              // [1]: title
            'test short description',       // [2]: short description
            'Long description',             // [3]: long description
            rootCategory.id,                // [4]: categoryID
            SaleType.SALE,                  // [5]: sale type
            Cryptocurrency.PART,            // [6]: currency
            10,                             // [7]: base price
            20,                             // [8]: domestic shipping price
            30                              // [9]: international shipping price
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('title', 'string').getMessage());
    });

    test('Should fail to add because invalid type of shortDescription', async () => {

        const res = await testUtil.rpc(templateCommand, [templateAddCommand,
            defaultProfile.id,              // [0]: profile_id
            'Test Title',                   // [1]: title
            0,                              // [2]: short description
            'Long description',             // [3]: long description
            rootCategory.id,                // [4]: categoryID
            SaleType.SALE,                  // [5]: sale type
            Cryptocurrency.PART,            // [6]: currency
            10,                             // [7]: base price
            20,                             // [8]: domestic shipping price
            30                              // [9]: international shipping price
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('shortDescription', 'string').getMessage());
    });

    test('Should fail to add because invalid type of longDescription', async () => {

        const res = await testUtil.rpc(templateCommand, [templateAddCommand,
            defaultProfile.id,              // [0]: profile_id
            'Test Title',                   // [1]: title
            'test short description',       // [2]: short description
            0,                              // [3]: long description
            rootCategory.id,                // [4]: categoryID
            SaleType.SALE,                  // [5]: sale type
            Cryptocurrency.PART,            // [6]: currency
            10,                             // [7]: base price
            20,                             // [8]: domestic shipping price
            30                              // [9]: international shipping price
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('longDescription', 'string').getMessage());
    });

    test('Should fail to add because invalid type of categoryId', async () => {

        const res = await testUtil.rpc(templateCommand, [templateAddCommand,
            defaultProfile.id,              // [0]: profile_id
            'Test Title',                   // [1]: title
            'test short description',       // [2]: short description
            'Long description',             // [3]: long description
            'INVALID',                      // [4]: categoryID
            SaleType.SALE,                  // [5]: sale type
            Cryptocurrency.PART,            // [6]: currency
            10,                             // [7]: base price
            20,                             // [8]: domestic shipping price
            30                              // [9]: international shipping price
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('categoryId', 'number').getMessage());
    });

/*
// TODO: saleType is hardcoded for now

    test('Should fail to add because invalid type of saleType', async () => {

        const res = await testUtil.rpc(templateCommand, [templateAddCommand,
            defaultProfile.id,              // [0]: profile_id
            'Test Title',                   // [1]: title
            'test short description',       // [2]: short description
            'Long description',             // [3]: long description
            rootCategory.id,                // [4]: categoryID
            'INVALID',                      // [5]: sale type
            Cryptocurrency.PART,            // [6]: currency
            10,                             // [7]: base price
            20,                             // [8]: domestic shipping price
            30                              // [9]: international shipping price
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('saleType', 'string').getMessage());
    });
*/

/*
// TODO: currency is hardcoded for now

    test('Should fail to add because invalid type of currency', async () => {

        const res = await testUtil.rpc(templateCommand, [templateAddCommand,
            defaultProfile.id,              // [0]: profile_id
            'Test Title',                   // [1]: title
            'test short description',       // [2]: short description
            'Long description',             // [3]: long description
            rootCategory.id,                // [4]: categoryID
            SaleType.SALE,                  // [5]: sale type
            'INVALID',                      // [6]: currency
            10,                             // [7]: base price
            20,                             // [8]: domestic shipping price
            30                              // [9]: international shipping price
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('currency', 'string').getMessage());
    });
*/

    test('Should fail to add because invalid type of basePrice', async () => {

        const res = await testUtil.rpc(templateCommand, [templateAddCommand,
            defaultProfile.id,              // [0]: profile_id
            'Test Title',                   // [1]: title
            'test short description',       // [2]: short description
            'Long description',             // [3]: long description
            rootCategory.id,                // [4]: categoryID
            SaleType.SALE,                  // [5]: sale type
            Cryptocurrency.PART,            // [6]: currency
            'INVALID',                      // [7]: base price
            20,                             // [8]: domestic shipping price
            30                              // [9]: international shipping price
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('basePrice', 'number').getMessage());
    });

    test('Should fail to add because invalid type of domesticShippingPrice', async () => {

        const res = await testUtil.rpc(templateCommand, [templateAddCommand,
            defaultProfile.id,              // [0]: profile_id
            'Test Title',                   // [1]: title
            'test short description',       // [2]: short description
            'Long description',             // [3]: long description
            rootCategory.id,                // [4]: categoryID
            SaleType.SALE,                  // [5]: sale type
            Cryptocurrency.PART,            // [6]: currency
            10,                             // [7]: base price
            'INVALID',                      // [8]: domestic shipping price
            30                              // [9]: international shipping price
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('domesticShippingPrice', 'number').getMessage());
    });

    test('Should fail to add because invalid type of internationalShippingPrice', async () => {

        const res = await testUtil.rpc(templateCommand, [templateAddCommand,
            defaultProfile.id,              // [0]: profile_id
            'Test Title',                   // [1]: title
            'test short description',       // [2]: short description
            'Long description',             // [3]: long description
            rootCategory.id,                // [4]: categoryID
            SaleType.SALE,                  // [5]: sale type
            Cryptocurrency.PART,            // [6]: currency
            10,                             // [7]: base price
            20,                             // [8]: domestic shipping price
            'INVALID'                       // [9]: international shipping price
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('internationalShippingPrice', 'number').getMessage());
    });

/*
// TODO: escrowType is hardcoded for now

    test('Should fail to add because invalid type of escrowType', async () => {

        const res = await testUtil.rpc(templateCommand, [templateAddCommand,
            defaultProfile.id,              // [0]: profile_id
            'Test Title',                   // [1]: title
            'test short description',       // [2]: short description
            'Long description',             // [3]: long description
            rootCategory.id,                // [4]: categoryID
            SaleType.SALE,                  // [5]: sale type
            Cryptocurrency.PART,            // [6]: currency
            10,                             // [7]: base price
            20,                             // [8]: domestic shipping price
            30,                             // [9]: international shipping price
            'INVALID',                      // [10]: escrowType, (optional) default EscrowType.MAD_CT
            100,                            // [11]: buyerRatio, (optional) default 100
            100                             // [12]: sellerRatio, (optional) default 100
            //                              // TODO: [13]: parent_listing_item_template_id (optional)
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('escrowType', 'string').getMessage());
    });
*/

    test('Should fail to add because invalid type of buyerRatio', async () => {

        const res = await testUtil.rpc(templateCommand, [templateAddCommand,
            defaultProfile.id,              // [0]: profile_id
            'Test Title',                   // [1]: title
            'test short description',       // [2]: short description
            'Long description',             // [3]: long description
            rootCategory.id,                // [4]: categoryID
            SaleType.SALE,                  // [5]: sale type
            Cryptocurrency.PART,            // [6]: currency
            10,                             // [7]: base price
            20,                             // [8]: domestic shipping price
            30,                             // [9]: international shipping price
            EscrowType.MAD_CT,              // [10]: escrowType, (optional) default EscrowType.MAD_CT
            'INVALID',                      // [11]: buyerRatio, (optional) default 100
            100                             // [12]: sellerRatio, (optional) default 100
            //                              // TODO: [13]: parent_listing_item_template_id (optional)
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('buyerRatio', 'number').getMessage());
    });

    test('Should fail to add because invalid type of sellerRatio', async () => {

        const res = await testUtil.rpc(templateCommand, [templateAddCommand,
            defaultProfile.id,              // [0]: profile_id
            'Test Title',                   // [1]: title
            'test short description',       // [2]: short description
            'Long description',             // [3]: long description
            rootCategory.id,                // [4]: categoryID
            SaleType.SALE,                  // [5]: sale type
            Cryptocurrency.PART,            // [6]: currency
            10,                             // [7]: base price
            20,                             // [8]: domestic shipping price
            30,                             // [9]: international shipping price
            EscrowType.MAD_CT,              // [10]: escrowType, (optional) default EscrowType.MAD_CT
            100,                            // [11]: buyerRatio, (optional) default 100
            'INVALID'                       // [12]: sellerRatio, (optional) default 100
            //                              // TODO: [13]: parent_listing_item_template_id (optional)
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('sellerRatio', 'number').getMessage());
    });

    test('Should fail to add because Profile not found', async () => {

        const res = await testUtil.rpc(templateCommand, [templateAddCommand,
            0,                              // [0]: profile_id
            'Test Title',                   // [1]: title
            'test short description',       // [2]: short description
            'Long description',             // [3]: long description
            rootCategory.id,                // [4]: categoryID
            SaleType.SALE,                  // [5]: sale type
            Cryptocurrency.PART,            // [6]: currency
            10,                             // [7]: base price
            20,                             // [8]: domestic shipping price
            30,                             // [9]: international shipping price
            EscrowType.MAD_CT,              // [10]: escrowType, (optional) default EscrowType.MAD_CT
            100,                            // [11]: buyerRatio, (optional) default 100
            100                             // [12]: sellerRatio, (optional) default 100
            //                              // TODO: [13]: parent_listing_item_template_id (optional)
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('Profile').getMessage());
    });

    test('Should create a new ListingItemTemplate with minimum params', async () => {

        const testData = [
            templateAddCommand,
            defaultProfile.id,              // [0]: profile_id
            'Test Title',                   // [1]: title
            'test short description',       // [2]: short description
            'Long description',             // [3]: long description
            rootCategory.id,                // [4]: categoryID
            SaleType.SALE,                  // [5]: sale type
            Cryptocurrency.PART,            // [6]: currency
            10,                             // [7]: base price
            20,                             // [8]: domestic shipping price
            30                              // [9]: international shipping price
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

    });

    test('Should create a new ListingItemTemplate with Escrow data', async () => {

        const testData = [
            templateAddCommand,
            defaultProfile.id,              // [0]: profile_id
            'Test Title 2',                 // [1]: title
            'test short description 2',     // [2]: short description
            'Long description 2',           // [3]: long description
            rootCategory.id,                    // [4]: categoryID
            SaleType.SALE,                  // [5]: payment type
            Cryptocurrency.PART,            // [6]: currency
            1,                              // [7]: base price
            2,                              // [8]: domestic shipping price
            3,                              // [9]: international shipping price
            EscrowType.MAD_CT,              // [10]: escrow type
            100,                            // [11]: buyerRatio
            100                             // [12]: sellerRatio
        ];

        const res = await testUtil.rpc(templateCommand, testData);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.ListingItemTemplate = res.getBody()['result'];
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
        expect(result.PaymentInformation.Escrow.type).toBe(testData[11]);
        expect(result.PaymentInformation.Escrow.Ratio.buyer).toBe(testData[12]);
        expect(result.PaymentInformation.Escrow.Ratio.seller).toBe(testData[13]);

    });


});
