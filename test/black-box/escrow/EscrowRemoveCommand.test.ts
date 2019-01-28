// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import * as resources from 'resources';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/params/GenerateListingItemTemplateParams';
import {Logger as LoggerType} from '../../../src/core/Logger';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { NotFoundException } from '../../../src/api/exceptions/NotFoundException';

describe('EscrowRemoveCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const escrowCommand = Commands.ESCROW_ROOT.commandName;
    const escrowRemoveCommand = Commands.ESCROW_REMOVE.commandName;
    const templateCommand = Commands.TEMPLATE_ROOT.commandName;
    const templateGetCommand = Commands.TEMPLATE_GET.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;
    let createdListingItemTemplate: resources.ListingItemTemplate;

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

        createdListingItemTemplate = listingItemTemplates[0];

    });

    test('Should fail destroy Escrow because missing listingItemTemplateId', async () => {
        const res: any = await testUtil.rpc(escrowCommand, [escrowRemoveCommand,
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('listingItemTemplateId').getMessage());
    });

    test('Should fail destroy Escrow because missing listingItemTemplateId', async () => {
        const res: any = await testUtil.rpc(escrowCommand, [escrowRemoveCommand,
            null
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new InvalidParamException('listingItemTemplateId', 'number').getMessage());
    });

    test('Should fail destroy Escrow because invalid listingItemTemplateId', async () => {
        const res: any = await testUtil.rpc(escrowCommand, [escrowRemoveCommand,
            -1
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new InvalidParamException('listingItemTemplateId', 'number').getMessage());
    });

    test('Should fail destroy Escrow because invalid listingItemTemplateId', async () => {
        const res: any = await testUtil.rpc(escrowCommand, [escrowRemoveCommand,
            'INVALLID'
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new InvalidParamException('listingItemTemplateId', 'number').getMessage());
    });

    test('Should destroy Escrow', async () => {
        // Check escrow exists.
        const res0: any = await testUtil.rpc(templateCommand, [templateGetCommand, createdListingItemTemplate.id]);
        res0.expectJson();
        res0.expectStatusCode(200);
        const result0: any = res0.getBody()['result'];
        expect(result0.PaymentInformation.Escrow).not.toBeNull();
        expect(result0.PaymentInformation.Escrow).not.toBeUndefined();
        expect(result0.PaymentInformation.Escrow).not.toEqual({});

        // Destroy escrow.
        const res1: any = await testUtil.rpc(escrowCommand, [escrowRemoveCommand, createdListingItemTemplate.id]);
        res1.expectJson();
        res1.expectStatusCode(200);

        // Check escrow no longer exists.
        const res2: any = await testUtil.rpc(templateCommand, [templateGetCommand, createdListingItemTemplate.id]);
        res2.expectJson();
        res2.expectStatusCode(200);
        const result2: any = res2.getBody()['result'];
        // throw new Error('result2.PaymentInformation.Escrow = ' + JSON.stringify(result2.PaymentInformation.Escrow, null, 2));
        expect(result2.PaymentInformation.Escrow).toEqual({});
    });

    test('Should fail destroy Escrow because already been destroyed', async () => {
        const res: any = await testUtil.rpc(escrowCommand, [escrowRemoveCommand, createdListingItemTemplate.id]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new NotFoundException(createdListingItemTemplate.id).getMessage();
    });
});
