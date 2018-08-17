// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { rpc, api } from '../lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { EscrowType } from '../../../src/api/enums/EscrowType';
import { Currency } from '../../../src/api/enums/Currency';
import { CryptocurrencyAddressType } from '../../../src/api/enums/CryptocurrencyAddressType';
import { PaymentType } from '../../../src/api/enums/PaymentType';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import {GenerateListingItemParams} from '../../../src/api/requests/params/GenerateListingItemParams';
import * as resources from 'resources';
import {GenerateListingItemTemplateParams} from '../../../src/api/requests/params/GenerateListingItemTemplateParams';

describe('EscrowRemoveCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const escrowCommand = Commands.ESCROW_ROOT.commandName;
    const escrowRemoveCommand = Commands.ESCROW_REMOVE.commandName;

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

    test('Should destroy Escrow', async () => {
        const destroyDataRes: any = await rpc(escrowCommand, [escrowRemoveCommand, createdListingItemTemplate.id]);
        destroyDataRes.expectJson();
        destroyDataRes.expectStatusCode(200);
    });

    test('Should fail destroy Escrow because already been destroyed', async () => {
        const destroyDataRes: any = await rpc(escrowCommand, [escrowRemoveCommand, createdListingItemTemplate.id]);
        destroyDataRes.expectJson();
        destroyDataRes.expectStatusCode(404);
    });
});
