// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import * as _ from 'lodash';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { EscrowType } from 'omp-lib/dist/interfaces/omp-enums';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';
import { ModelNotModifiableException } from '../../../src/api/exceptions/ModelNotModifiableException';

describe('EscrowUpdateCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const escrowCommand = Commands.ESCROW_ROOT.commandName;
    const escrowUpdateCommand = Commands.ESCROW_UPDATE.commandName;
    const templateCommand = Commands.TEMPLATE_ROOT.commandName;
    const templatePostCommand = Commands.TEMPLATE_POST.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;
    let listingItemTemplate: resources.ListingItemTemplate;

    beforeAll(async () => {
        await testUtil.cleanDb();
        defaultProfile = await testUtil.getDefaultProfile();
        defaultMarket = await testUtil.getDefaultMarket();

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,               // generateItemInformation
            true,               // generateItemLocation
            true,               // generateShippingDestinations
            false,              // generateItemImages
            true,               // generatePaymentInformation
            true,               // generateEscrow
            true,               // generateItemPrice
            true,               // generateMessagingInformation
            false,              // generateListingItemObjects
            false,              // generateObjectDatas
            defaultProfile.id,  // profileId
            false,              // generateListingItem
            defaultMarket.id    // marketId
        ]).toParamsArray();

        const listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplate[];

        listingItemTemplate = listingItemTemplates[0];
    });

    test('Should fail to update Escrow because of missing listingItemTemplateId', async () => {
        const res: any = await testUtil.rpc(escrowCommand, [escrowUpdateCommand]);
        res.expectJson();
        expect(res.error.error.message).toBe(new MissingParamException('listingItemTemplateId').getMessage());
    });

    test('Should fail to update Escrow because of missing escrowType', async () => {
        const testData = [escrowUpdateCommand,
            listingItemTemplate.id
        ];
        const res: any = await testUtil.rpc(escrowCommand, testData);
        res.expectJson();
        expect(res.error.error.message).toBe(new MissingParamException('escrowType').getMessage());
    });

    test('Should fail to update Escrow because of missing buyerRatio', async () => {
        const testData = [escrowUpdateCommand,
            listingItemTemplate.id,
            EscrowType.MAD_CT
        ];
        const res: any = await testUtil.rpc(escrowCommand, testData);
        res.expectJson();
        expect(res.error.error.message).toBe(new MissingParamException('buyerRatio').getMessage());
    });

    test('Should fail to update Escrow because of missing sellerRatio', async () => {
        const testData = [escrowUpdateCommand,
            listingItemTemplate.id,
            EscrowType.MAD_CT,
            100
        ];
        const res: any = await testUtil.rpc(escrowCommand, testData);
        res.expectJson();
        expect(res.error.error.message).toBe(new MissingParamException('sellerRatio').getMessage());
    });

    test('Should fail to update Escrow because of invalid listingItemTemplateId', async () => {
        const testData = [escrowUpdateCommand,
            'not a number',
            EscrowType.MAD_CT,
            100,
            100
        ];

        const res: any = await testUtil.rpc(escrowCommand, testData);
        res.expectJson();
        expect(res.error.error.message).toBe(new InvalidParamException('listingItemTemplateId', 'number').getMessage());
    });

    test('Should fail to update Escrow because of invalid escrowType', async () => {
        const testData = [escrowUpdateCommand,
            listingItemTemplate.id,
            0,
            100,
            100
        ];

        const res: any = await testUtil.rpc(escrowCommand, testData);
        res.expectJson();
        expect(res.error.error.message).toBe(new InvalidParamException('escrowType', 'string').getMessage());
    });

    test('Should fail to update Escrow because of invalid buyerRatio', async () => {
        const testData = [escrowUpdateCommand,
            listingItemTemplate.id,
            EscrowType.MAD_CT,
            'invalid',
            100
        ];

        const res: any = await testUtil.rpc(escrowCommand, testData);
        res.expectJson();
        expect(res.error.error.message).toBe(new InvalidParamException('buyerRatio', 'number').getMessage());
    });

    test('Should fail to update Escrow because of invalid sellerRatio', async () => {
        const testData = [escrowUpdateCommand,
            listingItemTemplate.id,
            EscrowType.MAD_CT,
            100,
            'invalid'
        ];

        const res: any = await testUtil.rpc(escrowCommand, testData);
        res.expectJson();
        expect(res.error.error.message).toBe(new InvalidParamException('sellerRatio', 'number').getMessage());
    });

    test('Should fail to update Escrow because of a non-existent ListingItemTemplate', async () => {
        const testData = [escrowUpdateCommand,
            1000000000,
            EscrowType.MAD_CT,
            100,
            100
        ];

        const res: any = await testUtil.rpc(escrowCommand, testData);
        res.expectJson();
        expect(res.error.error.message).toBe(new ModelNotFoundException('ListingItemTemplate').getMessage());
    });

    test('Should fail to update Escrow because it doesnt exist', async () => {

        // create ListingItemTemplate
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            false,   // generateItemInformation
            false,   // generateItemLocation
            false,   // generateShippingDestinations
            false,  // generateItemImages
            true,   // generatePaymentInformation
            false,   // generateEscrow
            false,   // generateItemPrice
            false,   // generateMessagingInformation
            false,  // generateListingItemObjects
            false,  // generateObjectDatas
            defaultProfile.id, // profileId
            false,  // generateListingItem
            defaultMarket.id   // marketId
        ]).toParamsArray();

        const templatesWithoutEscrow: resources.ListingItemTemplate[] = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE,
            1,
            true,
            generateListingItemTemplateParams
        );

        const testData = [escrowUpdateCommand,
            templatesWithoutEscrow[0].id,
            EscrowType.MAD_CT,
            100,
            100
        ];

        const res: any = await testUtil.rpc(escrowCommand, testData);
        res.expectJson();
        expect(res.error.error.message).toBe(new ModelNotFoundException('Escrow').getMessage());
    });

    test('Should update Escrow', async () => {

        const testData = [escrowUpdateCommand,
            listingItemTemplate.id,
            EscrowType.MAD_CT,
            100,
            100
        ];

        const res: any = await testUtil.rpc(escrowCommand, testData);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.type).toBe(testData[2]);
        expect(result.Ratio.buyer).toBe(testData[3]);
        expect(result.Ratio.seller).toBe(testData[4]);
    });

    test('Should not be able to update Escrow because ListingItemTemplate is not modifiable', async () => {

        // create ListingItemTemplate with ListingItem
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            true,   // generateShippingDestinations
            false,  // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            false,  // generateListingItemObjects
            false,  // generateObjectDatas
            defaultProfile.id, // profileId
            true,  // generateListingItem
            defaultMarket.id   // marketId
        ]).toParamsArray();

        const listingItemTemplates: resources.ListingItemTemplate[] = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE,
            2,
            true,
            generateListingItemTemplateParams
        );
        listingItemTemplate = listingItemTemplates[0];

        const res = await testUtil.rpc(escrowCommand, [escrowUpdateCommand,
            listingItemTemplate.id,
            EscrowType.MAD_CT,
            100,
            100
        ]);
        res.expectJson();
        expect(res.error.error.message).toBe(new ModelNotModifiableException('ListingItemTemplate').getMessage());
    });


});
