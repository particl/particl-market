// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { EscrowType } from '../../../src/api/enums/EscrowType';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { Logger as LoggerType } from '../../../src/core/Logger';
import * as resources from 'resources';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/params/GenerateListingItemTemplateParams';

describe('EscrowAddCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const escrowCommand = Commands.ESCROW_ROOT.commandName;
    const escrowAddCommand = Commands.ESCROW_ADD.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;
    let listingItemTemplate: resources.ListingItemTemplate;

    beforeAll(async () => {
        await testUtil.cleanDb();

        // get default profile and market
        defaultProfile = await testUtil.getDefaultProfile();
        defaultMarket = await testUtil.getDefaultMarket();

        // create templates
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            true,   // generateShippingDestinations
            false,  // generateItemImages
            true,   // generatePaymentInformation
            false,  // generateEscrow
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
            true,                    // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplate[];

        listingItemTemplate = listingItemTemplates[0];

    });

    test('Should Create new Escrow', async () => {
        const testData = {
            type: EscrowType.MAD,
            ratio: {
                buyer: 100,
                seller: 100
            }
        };

        const res: any = await testUtil.rpc(escrowCommand, [escrowAddCommand,
            listingItemTemplate.id,
            testData.type,
            testData.ratio.buyer,
            testData.ratio.seller
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Escrow = res.getBody()['result'];
        expect(result.type).toBe(testData.type);
        expect(result.Ratio.buyer).toBe(testData.ratio.buyer);
        expect(result.Ratio.seller).toBe(testData.ratio.seller);
    });

    test('Should fail to create Escrow because it allready exists', async () => {
        const testData = {
            type: EscrowType.MAD,
            ratio: {
                buyer: 100,
                seller: 100
            }
        };
        const res: any = await testUtil.rpc(escrowCommand, [escrowAddCommand,
            listingItemTemplate.id,
            testData.type,
            testData.ratio.buyer,
            testData.ratio.seller
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('Escrow allready exists.');

    });
});
