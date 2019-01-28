// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { EscrowType } from '../../../src/api/enums/EscrowType';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/params/GenerateListingItemTemplateParams';
import * as resources from 'resources';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { NotFoundException } from '../../../src/api/exceptions/NotFoundException';

describe('EscrowUpdateCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const escrowCommand = Commands.ESCROW_ROOT.commandName;
    const escrowUpdateCommand = Commands.ESCROW_UPDATE.commandName;

    const templateCommand = Commands.TEMPLATE_ROOT.commandName;
    const templateGetCommand = Commands.TEMPLATE_GET.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;
    let listingItemTemplate: resources.ListingItemTemplate;

    const testData = {
        type: EscrowType.NOP,
        ratio: {
            buyer: 1000,
            seller: 1000
        }
    };

    beforeAll(async () => {
        await testUtil.cleanDb();
        defaultProfile = await testUtil.getDefaultProfile();
        defaultMarket = await testUtil.getDefaultMarket();

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            true,   // generateShippingDestinations
            false,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            false,  // generateListingItemObjects
            false,  // generateObjectDatas
            defaultProfile.id, // profileId
            false,   // generateListingItem
            defaultMarket.id  // marketId
        ]).toParamsArray();

        const listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplate[];

        listingItemTemplate = listingItemTemplates[0];
    });

    test('Fail to update escrow because invalid sellerRatio', async () => {
        const res: any = await testUtil.rpc(escrowCommand, [escrowUpdateCommand,
            listingItemTemplate.id,
            testData.type,
            testData.ratio.buyer,
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('sellerRatio').getMessage());
    });

    test('Fail to update escrow because invalid buyerRatio', async () => {
        const res: any = await testUtil.rpc(escrowCommand, [escrowUpdateCommand,
            listingItemTemplate.id,
            testData.type,
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('buyerRatio').getMessage());
    });


    test('Fail to update escrow because invalid escrowType', async () => {
        const res: any = await testUtil.rpc(escrowCommand, [escrowUpdateCommand,
            listingItemTemplate.id,
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('escrowType').getMessage());
    });


    test('Fail to update escrow because invalid listingItemTemplateId', async () => {
        const res: any = await testUtil.rpc(escrowCommand, [escrowUpdateCommand,
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('listingItemTemplateId').getMessage());
    });


    test('Fail to update escrow because missing listingItemTemplateId', async () => {
        const res: any = await testUtil.rpc(escrowCommand, [escrowUpdateCommand,
            null,
            testData.type,
            testData.ratio.buyer,
            testData.ratio.seller
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new InvalidParamException('listingItemTemplateId', 'number').getMessage());
    });

    test('Fail to update escrow because invalid listingItemTemplateId', async () => {
        const res: any = await testUtil.rpc(escrowCommand, [escrowUpdateCommand,
            'INVALID',
            testData.type,
            testData.ratio.buyer,
            testData.ratio.seller
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new InvalidParamException('listingItemTemplateId', 'number').getMessage());
    });

    test('Fail to update escrow because invalid listingItemTemplateId', async () => {
        const res: any = await testUtil.rpc(escrowCommand, [escrowUpdateCommand,
            -1,
            testData.type,
            testData.ratio.buyer,
            testData.ratio.seller
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new InvalidParamException('listingItemTemplateId', 'number').getMessage());
    });

    test('Fail to update escrow because missing escrowType', async () => {
        const res: any = await testUtil.rpc(escrowCommand, [escrowUpdateCommand,
            listingItemTemplate.id,
            null,
            testData.ratio.buyer,
            testData.ratio.seller
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new InvalidParamException('escrowType', 'enum').getMessage());
    });

    test('Fail to update escrow because invalid escrowType', async () => {
        const res: any = await testUtil.rpc(escrowCommand, [escrowUpdateCommand,
            listingItemTemplate.id,
            'INVALID',
            testData.ratio.buyer,
            testData.ratio.seller
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new InvalidParamException('escrowType', 'enum').getMessage());
    });

    test('Fail to update escrow because missing buyerRatio', async () => {
        const res: any = await testUtil.rpc(escrowCommand, [escrowUpdateCommand,
            listingItemTemplate.id,
            testData.type,
            null,
            testData.ratio.seller
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new InvalidParamException('buyerRatio', 'number').getMessage());
    });

    test('Fail to update escrow because invalid buyerRatio', async () => {
        const res: any = await testUtil.rpc(escrowCommand, [escrowUpdateCommand,
            listingItemTemplate.id,
            testData.type,
            'INVALID',
            testData.ratio.seller
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new InvalidParamException('buyerRatio', 'number').getMessage());
    });

    test('Fail to update escrow because invalid buyerRatio', async () => {
        const res: any = await testUtil.rpc(escrowCommand, [escrowUpdateCommand,
            listingItemTemplate.id,
            testData.type,
            -1,
            testData.ratio.seller
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new InvalidParamException('buyerRatio', 'number').getMessage());
    });

    test('Fail to update escrow because missing sellerRatio', async () => {
        const res: any = await testUtil.rpc(escrowCommand, [escrowUpdateCommand,
            listingItemTemplate.id,
            testData.type,
            testData.ratio.buyer,
            null
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new InvalidParamException('sellerRatio', 'number').getMessage());
    });

    test('Fail to update escrow because invalid sellerRatio', async () => {
        const res: any = await testUtil.rpc(escrowCommand, [escrowUpdateCommand,
            listingItemTemplate.id,
            testData.type,
            testData.ratio.buyer,
            'INVALID'
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new InvalidParamException('sellerRatio', 'number').getMessage());
    });

    test('Fail to update escrow because invalid sellerRatio', async () => {
        const res: any = await testUtil.rpc(escrowCommand, [escrowUpdateCommand,
            listingItemTemplate.id,
            testData.type,
            testData.ratio.buyer,
            -1
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new InvalidParamException('sellerRatio', 'number').getMessage());
    });

    test('Should update Escrow', async () => {
        const res: any = await testUtil.rpc(escrowCommand, [escrowUpdateCommand,
            listingItemTemplate.id,
            testData.type,
            testData.ratio.buyer,
            testData.ratio.seller
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.type).toBe(testData.type);
        expect(result.Ratio.buyer).toBe(testData.ratio.buyer);
        expect(result.Ratio.seller).toBe(testData.ratio.seller);

        // Double check the object was updated with the new values.
        const res2: any = await testUtil.rpc(templateCommand, [templateGetCommand,
            listingItemTemplate.id
        ]);
        res2.expectJson();
        res2.expectStatusCode(200);
        const result2: any = res2.getBody()['result'];
        expect(result2.PaymentInformation.Escrow.type).toBe(testData.type);
        expect(result2.PaymentInformation.Escrow.Ratio.buyer).toBe(testData.ratio.buyer);
        expect(result2.PaymentInformation.Escrow.Ratio.seller).toBe(testData.ratio.seller);
    });
});
