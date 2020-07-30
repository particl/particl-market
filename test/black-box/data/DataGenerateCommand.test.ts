// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { GenerateProfileParams } from '../../../src/api/requests/testdata/GenerateProfileParams';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemParams } from '../../../src/api/requests/testdata/GenerateListingItemParams';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';

describe('DataGenerateCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const dataCommand = Commands.DATA_ROOT.commandName;
    const dataGenerateCommand = Commands.DATA_GENERATE.commandName;

    const WITH_RELATED = true;

    beforeAll(async () => {
        await testUtil.cleanDb();

    });

    test('Should generate fail to generate anything because invalid model', async () => {
        const generateListingItemParams = new GenerateListingItemParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            true,   // generateShippingDestinations
            true,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            true    // generateListingItemObjects
        ]).toParamsArray();

        const res = await testUtil.rpc(dataCommand, [dataGenerateCommand,
            'INVALID',
            1,
            WITH_RELATED
        ].concat(generateListingItemParams));

        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('model', 'CreatableModel').getMessage());
    });

    test('Should generate fail to generate anything because invalid amount', async () => {
        const generateListingItemParams = new GenerateListingItemParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            true,   // generateShippingDestinations
            true,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            true    // generateListingItemObjects
        ]).toParamsArray();

        const res = await testUtil.rpc(dataCommand, [dataGenerateCommand,
            CreatableModel.LISTINGITEM,
            -1,
            WITH_RELATED
        ].concat(generateListingItemParams));

        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('amount', 'number').getMessage());
    });

    test('Should generate fail to generate anything because invalid amount', async () => {
        const generateListingItemParams = new GenerateListingItemParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            true,   // generateShippingDestinations
            true,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            true    // generateListingItemObjects
        ]).toParamsArray();

        const res = await testUtil.rpc(dataCommand, [dataGenerateCommand,
            CreatableModel.LISTINGITEM,
            'INVALID',
            WITH_RELATED
        ].concat(generateListingItemParams));

        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('amount', 'number').getMessage());
    });

    test('Should generate fail to generate anything because invalid withRelated', async () => {
        const generateListingItemParams = new GenerateListingItemParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            true,   // generateShippingDestinations
            true,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            true    // generateListingItemObjects
        ]).toParamsArray();

        const res = await testUtil.rpc(dataCommand, [dataGenerateCommand,
            CreatableModel.LISTINGITEM,
            1,
            'INVALID'
        ].concat(generateListingItemParams));

        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe(new InvalidParamException('withRelated', 'boolean').getMessage());
    });

    test('Should generate one ListingItem with no related data', async () => {

        const generateListingItemParams = new GenerateListingItemParams([
            false,   // generateItemInformation
            false,   // generateItemLocation
            false,   // generateShippingDestinations
            false,   // generateItemImages
            false,   // generatePaymentInformation
            false,   // generateEscrow
            false,   // generateItemPrice
            false,   // generateMessagingInformation
            false    // generateListingItemObjects
        ]).toParamsArray();

        const res = await testUtil.rpc(dataCommand, [dataGenerateCommand,
            CreatableModel.LISTINGITEM,
            1,
            WITH_RELATED
        ].concat(generateListingItemParams));

        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(1);
        expect(result[0].ItemInformation).toMatchObject({});
        expect(result[0].PaymentInformation).toMatchObject({});
        expect(result[0].MessagingInformation).toHaveLength(0);
        expect(result[0].ListingItemObjects).toHaveLength(0);

    });

    test('Should generate one ListingItem with ItemInformation', async () => {

        const generateListingItemParams = new GenerateListingItemParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            false,   // generateShippingDestinations
            false,   // generateItemImages
            false,   // generatePaymentInformation
            false,   // generateEscrow
            false,   // generateItemPrice
            false,   // generateMessagingInformation
            false    // generateListingItemObjects
        ]).toParamsArray();

        const res = await testUtil.rpc(dataCommand, [dataGenerateCommand,
            CreatableModel.LISTINGITEM,
            1,
            WITH_RELATED
        ].concat(generateListingItemParams));

        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result).toHaveLength(1);
        expect(result[0].ItemInformation.id).toBeDefined();
        expect(result[0].ItemInformation.ShippingDestinations).toHaveLength(0);
        expect(result[0].ItemInformation.ItemImages).toHaveLength(0);
        expect(result[0].PaymentInformation).toMatchObject({});
        expect(result[0].MessagingInformation).toHaveLength(0);
        expect(result[0].ListingItemObjects).toHaveLength(0);

    });

    test('Should generate one ListingItem with ItemInformation, ShippingDestinations and ItemImages', async () => {

        const generateListingItemParams = new GenerateListingItemParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            true,   // generateShippingDestinations
            true,   // generateItemImages
            false,   // generatePaymentInformation
            false,   // generateEscrow
            false,   // generateItemPrice
            false,   // generateMessagingInformation
            false    // generateListingItemObjects
        ]).toParamsArray();

        const res = await testUtil.rpc(dataCommand, [dataGenerateCommand,
            CreatableModel.LISTINGITEM,
            1,
            WITH_RELATED
        ].concat(generateListingItemParams));

        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result).toHaveLength(1);
        expect(result[0].ItemInformation.id).toBeDefined();
        expect(result[0].ItemInformation.ShippingDestinations).not.toHaveLength(0);
        expect(result[0].ItemInformation.ItemImages).not.toHaveLength(0);
        expect(result[0].PaymentInformation).toMatchObject({});
        expect(result[0].MessagingInformation).toHaveLength(0);
        expect(result[0].ListingItemObjects).toHaveLength(0);

    });

    test('Should generate one ListingItem with ItemInformation, ShippingDestinations, ItemImages and PaymentInformation', async () => {

        const generateListingItemParams = new GenerateListingItemParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            true,   // generateShippingDestinations
            true,   // generateItemImages
            true,   // generatePaymentInformation
            false,   // generateEscrow
            false,   // generateItemPrice
            false,   // generateMessagingInformation
            false    // generateListingItemObjects
        ]).toParamsArray();

        const res = await testUtil.rpc(dataCommand, [dataGenerateCommand,
            CreatableModel.LISTINGITEM,
            1,
            WITH_RELATED
        ].concat(generateListingItemParams));

        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result).toHaveLength(1);
        expect(result[0].ItemInformation.id).toBeDefined();
        expect(result[0].ItemInformation.ShippingDestinations).not.toHaveLength(0);
        expect(result[0].ItemInformation.ItemImages).not.toHaveLength(0);
        expect(result[0].PaymentInformation.id).toBeDefined();
        expect(result[0].MessagingInformation).toHaveLength(0);
        expect(result[0].ListingItemObjects).toHaveLength(0);

    });

    test('Should generate one ListingItem with ItemInformation, ShippingDestinations, ItemImages, PaymentInformation and Escrow', async () => {

        const generateListingItemParams = new GenerateListingItemParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            true,   // generateShippingDestinations
            true,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            false,   // generateItemPrice
            false,   // generateMessagingInformation
            false    // generateListingItemObjects
        ]).toParamsArray();

        const res = await testUtil.rpc(dataCommand, [dataGenerateCommand,
            CreatableModel.LISTINGITEM,
            1,
            WITH_RELATED
        ].concat(generateListingItemParams));

        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result).toHaveLength(1);
        expect(result[0].ItemInformation.id).toBeDefined();
        expect(result[0].ItemInformation.ShippingDestinations).not.toHaveLength(0);
        expect(result[0].ItemInformation.ItemImages).not.toHaveLength(0);
        expect(result[0].PaymentInformation.id).toBeDefined();
        expect(result[0].PaymentInformation.Escrow.id).toBeDefined();
        expect(result[0].MessagingInformation).toHaveLength(0);
        expect(result[0].ListingItemObjects).toHaveLength(0);

    });

    test('Should generate one ListingItem with ItemInformation, ShippingDestinations, ItemImages, PaymentInformation, Escrow and ItemPrice', async () => {

        const generateListingItemParams = new GenerateListingItemParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            true,   // generateShippingDestinations
            true,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            false,   // generateMessagingInformation
            false    // generateListingItemObjects
        ]).toParamsArray();

        const res = await testUtil.rpc(dataCommand, [dataGenerateCommand,
            CreatableModel.LISTINGITEM,
            1,
            WITH_RELATED
        ].concat(generateListingItemParams));

        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result).toHaveLength(1);
        expect(result[0].ItemInformation.id).toBeDefined();
        expect(result[0].ItemInformation.ShippingDestinations).not.toHaveLength(0);
        expect(result[0].ItemInformation.ItemImages).not.toHaveLength(0);
        expect(result[0].PaymentInformation.id).toBeDefined();
        expect(result[0].PaymentInformation.Escrow.id).toBeDefined();
        expect(result[0].PaymentInformation.ItemPrice.id).toBeDefined();
        expect(result[0].MessagingInformation).toHaveLength(0);
        expect(result[0].ListingItemObjects).toHaveLength(0);

    });

    test('Should generate one ListingItem with ItemInformation, ShippingDestinations, ItemImages, PaymentInformation, Escrow, ' +
        'ItemPrice and MessagingInformation', async () => {

        const generateListingItemParams = new GenerateListingItemParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            true,   // generateShippingDestinations
            true,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            false    // generateListingItemObjects
        ]).toParamsArray();

        const res = await testUtil.rpc(dataCommand, [dataGenerateCommand,
            CreatableModel.LISTINGITEM,
            1,
            WITH_RELATED
        ].concat(generateListingItemParams));

        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result).toHaveLength(1);
        expect(result[0].ItemInformation.id).toBeDefined();
        expect(result[0].ItemInformation.ShippingDestinations).not.toHaveLength(0);
        expect(result[0].ItemInformation.ItemImages).not.toHaveLength(0);
        expect(result[0].PaymentInformation.id).toBeDefined();
        expect(result[0].PaymentInformation.Escrow.id).toBeDefined();
        expect(result[0].PaymentInformation.ItemPrice.id).toBeDefined();
        expect(result[0].MessagingInformation).not.toHaveLength(0);
        expect(result[0].ListingItemObjects).toHaveLength(0);

    });

    test('Should generate one ListingItem with ItemInformation, ShippingDestinations, ItemImages, PaymentInformation, Escrow, ' +
        'ItemPrice, MessagingInformation and ListingItemObjects', async () => {

        const generateListingItemParams = new GenerateListingItemParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            true,   // generateShippingDestinations
            true,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            true    // generateListingItemObjects
        ]).toParamsArray();

        const res = await testUtil.rpc(dataCommand, [dataGenerateCommand,
            CreatableModel.LISTINGITEM,
            1,
            WITH_RELATED
        ].concat(generateListingItemParams));

        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result).toHaveLength(1);
        expect(result[0].ItemInformation.id).toBeDefined();
        expect(result[0].ItemInformation.ShippingDestinations).not.toHaveLength(0);
        expect(result[0].ItemInformation.ItemImages).not.toHaveLength(0);
        expect(result[0].PaymentInformation.id).toBeDefined();
        expect(result[0].PaymentInformation.Escrow.id).toBeDefined();
        expect(result[0].PaymentInformation.ItemPrice.id).toBeDefined();
        expect(result[0].MessagingInformation).not.toHaveLength(0);
        expect(result[0].ListingItemObjects).not.toHaveLength(0);

    });
});
