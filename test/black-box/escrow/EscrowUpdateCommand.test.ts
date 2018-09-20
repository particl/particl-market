// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { EscrowType } from '../../../src/api/enums/EscrowType';
import { Currency } from '../../../src/api/enums/Currency';
import { CryptocurrencyAddressType } from '../../../src/api/enums/CryptocurrencyAddressType';
import { PaymentType } from '../../../src/api/enums/PaymentType';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import {GenerateListingItemTemplateParams} from '../../../src/api/requests/params/GenerateListingItemTemplateParams';
import * as resources from 'resources';
import { Logger as LoggerType } from '../../../src/core/Logger';

describe('EscrowUpdateCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const escrowCommand = Commands.ESCROW_ROOT.commandName;
    const escrowUpdateCommand = Commands.ESCROW_UPDATE.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;
    let createdListingItemTemplate: resources.ListingItemTemplate;

    beforeAll(async () => {
        await testUtil.cleanDb();
        defaultProfile = await testUtil.getDefaultProfile();
        defaultMarket = await testUtil.getDefaultMarket();

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
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

    test('Should update Escrow', async () => {

        const testData = {
            type: EscrowType.NOP,
            ratio: {
                buyer: 1000,
                seller: 1000
            }
        };

        const res: any = await testUtil.rpc(escrowCommand, [escrowUpdateCommand,
            createdListingItemTemplate.id,
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
    });
});
