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
import { SaleType} from 'omp-lib/dist/interfaces/omp-enums';
import { CryptoAddressType, Cryptocurrency } from 'omp-lib/dist/interfaces/crypto';
import { ModelNotModifiableException } from '../../../src/api/exceptions/ModelNotModifiableException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import {MissingParamException} from '../../../src/api/exceptions/MissingParamException';
import {ModelNotFoundException} from '../../../src/api/exceptions/ModelNotFoundException';

describe('PaymentInformationUpdateCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const paymentInformationCommand =  Commands.PAYMENTINFORMATION_ROOT.commandName;
    const paymentInformationUpdateCommand =  Commands.PAYMENTINFORMATION_UPDATE.commandName;
    const templateCommand = Commands.TEMPLATE_ROOT.commandName;
    const templatePostCommand = Commands.TEMPLATE_POST.commandName;

    let profile: resources.Profile;
    let market: resources.Market;

    let listingItemTemplate: resources.ListingItemTemplate;

    const testData = {
        type: SaleType.SALE,
        itemPrice: {
            currency: Cryptocurrency.PART,
            basePrice: 1,
            shippingPrice: {
                domestic: 2,
                international: 3
            },
            cryptocurrencyAddress: {
                type: CryptoAddressType.STEALTH,
                address: 'This is NEW address.'
            }
        }
    };

    beforeAll(async () => {
        await testUtil.cleanDb();

        profile = await testUtil.getDefaultProfile();
        expect(profile.id).toBeDefined();
        market = await testUtil.getDefaultMarket(profile.id);
        expect(market.id).toBeDefined();

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
            false,          // generateListingItem
            market.id       // soldOnMarketId
        ]).toParamsArray();

        const listingItemTemplates: resources.ListingItemTemplate[] = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE,
            1,
            true,
            generateListingItemTemplateParams
        );
        listingItemTemplate = listingItemTemplates[0];
    });

    test('Should fail because missing listingItemTemplateId', async () => {
        const res: any = await testUtil.rpc(paymentInformationCommand, [paymentInformationUpdateCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('listingItemTemplateId').getMessage());
    });

    test('Should fail because missing saleType', async () => {
        const res: any = await testUtil.rpc(paymentInformationCommand, [paymentInformationUpdateCommand,
            listingItemTemplate.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('saleType').getMessage());
    });

    test('Should fail because missing currency', async () => {
        const res: any = await testUtil.rpc(paymentInformationCommand, [paymentInformationUpdateCommand,
            listingItemTemplate.id,
            SaleType.SALE
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('currency').getMessage());
    });

    test('Should fail because missing basePrice', async () => {
        const res: any = await testUtil.rpc(paymentInformationCommand, [paymentInformationUpdateCommand,
            listingItemTemplate.id,
            SaleType.SALE,
            Cryptocurrency.PART
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('basePrice').getMessage());
    });

    test('Should fail because missing domesticShippingPrice', async () => {
        const res: any = await testUtil.rpc(paymentInformationCommand, [paymentInformationUpdateCommand,
            listingItemTemplate.id,
            SaleType.SALE,
            Cryptocurrency.PART,
            100
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('domesticShippingPrice').getMessage());
    });

    test('Should fail because missing internationalShippingPrice', async () => {
        const res: any = await testUtil.rpc(paymentInformationCommand, [paymentInformationUpdateCommand,
            listingItemTemplate.id,
            SaleType.SALE,
            Cryptocurrency.PART,
            100,
            200
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('internationalShippingPrice').getMessage());
    });

    test('Should fail because invalid listingItemTemplateId', async () => {
        const res: any = await testUtil.rpc(paymentInformationCommand, [paymentInformationUpdateCommand,
            false,
            SaleType.SALE,
            Cryptocurrency.PART,
            100,
            200,
            300
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(new InvalidParamException('listingItemTemplateId', 'number').getMessage());
    });

    test('Should fail because invalid saleType', async () => {
        const res: any = await testUtil.rpc(paymentInformationCommand, [paymentInformationUpdateCommand,
            listingItemTemplate.id,
            false,
            Cryptocurrency.PART,
            100,
            200,
            300
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('saleType', 'SaleType').getMessage());
    });

    test('Should fail because invalid currency', async () => {
        const res: any = await testUtil.rpc(paymentInformationCommand, [paymentInformationUpdateCommand,
            listingItemTemplate.id,
            SaleType.SALE,
            false,
            100,
            200,
            300
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('currency', 'Cryptocurrency').getMessage());
    });

    test('Should fail because invalid basePrice', async () => {
        const res: any = await testUtil.rpc(paymentInformationCommand, [paymentInformationUpdateCommand,
            listingItemTemplate.id,
            SaleType.SALE,
            Cryptocurrency.PART,
            false,
            200,
            300
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('basePrice', 'number').getMessage());
    });

    test('Should fail because invalid domesticShippingPrice', async () => {
        const res: any = await testUtil.rpc(paymentInformationCommand, [paymentInformationUpdateCommand,
            listingItemTemplate.id,
            SaleType.SALE,
            Cryptocurrency.PART,
            100,
            false,
            300
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('domesticShippingPrice', 'number').getMessage());
    });

    test('Should fail because invalid internationalShippingPrice', async () => {
        const res: any = await testUtil.rpc(paymentInformationCommand, [paymentInformationUpdateCommand,
            listingItemTemplate.id,
            SaleType.SALE,
            Cryptocurrency.PART,
            100,
            200,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('internationalShippingPrice', 'number').getMessage());
    });

    test('Should fail because invalid paymentAddress', async () => {
        const res: any = await testUtil.rpc(paymentInformationCommand, [paymentInformationUpdateCommand,
            listingItemTemplate.id,
            SaleType.SALE,
            Cryptocurrency.PART,
            100,
            200,
            300,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('paymentAddress', 'string').getMessage());
    });

    test('Should fail because missing ListingItemTemplate', async () => {
        const res: any = await testUtil.rpc(paymentInformationCommand, [paymentInformationUpdateCommand,
            0,
            SaleType.SALE,
            Cryptocurrency.PART,
            100,
            200,
            300
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('ListingItemTemplate').getMessage());
    });

    test('Should update PaymentInformation', async () => {

        const res: any = await testUtil.rpc(paymentInformationCommand, [paymentInformationUpdateCommand,
            listingItemTemplate.id,
            testData.type,
            testData.itemPrice.currency,
            testData.itemPrice.basePrice,
            testData.itemPrice.shippingPrice.domestic,
            testData.itemPrice.shippingPrice.international,
            testData.itemPrice.cryptocurrencyAddress.address
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        expect(result.listingItemTemplateId).toBe(listingItemTemplate.id);
        expect(result.type).toBe(testData.type);

        expect(result.ItemPrice.currency).toBe(testData.itemPrice.currency);
        expect(result.ItemPrice.basePrice).toBe(testData.itemPrice.basePrice);

        expect(result.ItemPrice.ShippingPrice.domestic).toBe(testData.itemPrice.shippingPrice.domestic);
        expect(result.ItemPrice.ShippingPrice.international).toBe(testData.itemPrice.shippingPrice.international);
        expect(result.ItemPrice.CryptocurrencyAddress.address).toBe(testData.itemPrice.cryptocurrencyAddress.address);
    });

    test('Should not update the MessagingInformation because the ListingItemTemplate has been published', async () => {

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
            true,          // generateListingItem
            market.id       // soldOnMarketId
        ]).toParamsArray();

        // generate listingItemTemplate
        const listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplates[];
        listingItemTemplate = listingItemTemplates[0];

        const res = await testUtil.rpc(paymentInformationCommand, [paymentInformationUpdateCommand,
            listingItemTemplate.id,
            testData.type,
            testData.itemPrice.currency,
            testData.itemPrice.basePrice,
            testData.itemPrice.shippingPrice.domestic,
            testData.itemPrice.shippingPrice.international,
            testData.itemPrice.cryptocurrencyAddress.address
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new ModelNotModifiableException('ListingItemTemplate').getMessage());
    });

});
