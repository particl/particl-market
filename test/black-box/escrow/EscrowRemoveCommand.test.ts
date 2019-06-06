// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import * as resources from 'resources';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import {Logger as LoggerType} from '../../../src/core/Logger';
import {EscrowType} from 'omp-lib/dist/interfaces/omp-enums';
import {ModelNotModifiableException} from '../../../src/api/exceptions/ModelNotModifiableException';

describe('EscrowRemoveCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const escrowCommand = Commands.ESCROW_ROOT.commandName;
    const escrowRemoveCommand = Commands.ESCROW_REMOVE.commandName;
    const templateCommand = Commands.TEMPLATE_ROOT.commandName;
    const templatePostCommand = Commands.TEMPLATE_POST.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;
    let listingItemTemplates: resources.ListingItemTemplate[];

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

        listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            2,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplate[];

    });

    test('Should destroy Escrow', async () => {
        const res: any = await testUtil.rpc(escrowCommand, [escrowRemoveCommand, listingItemTemplates[0].id]);
        res.expectJson();
        res.expectStatusCode(200);
    });

    test('Should fail destroy Escrow because already been destroyed', async () => {
        const res: any = await testUtil.rpc(escrowCommand, [escrowRemoveCommand, listingItemTemplates[0].id]);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('Should not be able to destroy Escrow because ListingItemTemplate is not modifiable', async () => {

        let res: any = await testUtil.rpc(templateCommand, [templatePostCommand,
            listingItemTemplates[1].id,
            2,
            defaultMarket.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        // make sure we got the expected result from posting the template
        const result: any = res.getBody()['result'];
        expect(result.result).toBe('Sent.');

        await testUtil.waitFor(5);

        res = await testUtil.rpc(escrowCommand, [escrowRemoveCommand, listingItemTemplates[1].id]);
        res.expectJson();
        expect(res.error.error.message).toBe(new ModelNotModifiableException('ListingItemTemplate').getMessage());
    });

});
