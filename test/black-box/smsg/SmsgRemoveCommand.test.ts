// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { GenerateSmsgMessageParams } from '../../../src/api/requests/testdata/GenerateSmsgMessageParams';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { SmsgMessageStatus } from '../../../src/api/enums/SmsgMessageStatus';
import { ActionDirection } from '../../../src/api/enums/ActionDirection';
import { ListingItemAddMessageCreateParams } from '../../../src/api/requests/message/ListingItemAddMessageCreateParams';
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';

describe('SmsgRemoveCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const smsgCommand = Commands.SMSG_ROOT.commandName;
    const smsgRemoveCommand = Commands.SMSG_REMOVE.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;

    let listingItemTemplate: resources.ListingItemTemplate;
    let smsgMessages: resources.SmsgMessage[];

    beforeAll(async () => {
        await testUtil.cleanDb();

        // get default profile and market
        defaultProfile = await testUtil.getDefaultProfile();
        defaultMarket = await testUtil.getDefaultMarket();

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,               // generateItemInformation
            true,               // generateItemLocation
            true,               // generateShippingDestinations
            true,               // generateItemImages
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

        // generate ListingItemTemplate
        const listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplate[];
        listingItemTemplate = listingItemTemplates[0];

        const messageParams = {
            listingItem: listingItemTemplate
        } as ListingItemAddMessageCreateParams;

        // generate SmsgMessage (MPA_LISTING_ADD) based on the ListingItemTemplate
        const generateSmsgMessageParams = new GenerateSmsgMessageParams([
            MPAction.MPA_LISTING_ADD,               // type
            SmsgMessageStatus.NEW,                  // status
            ActionDirection.INCOMING,               // direction
            false,                                  // read
            true,                                   // paid
            Date.now(),                             // received
            Date.now() - (24 * 60 * 60 * 1000),     // sent
            Date.now() + (5 * 24 * 60 * 60 * 1000), // expiration
            7,                                      // daysretention
            defaultProfile.address,                 // from
            defaultMarket.address,                  // to
            messageParams                           // messageParams
            // text
        ]).toParamsArray();

        smsgMessages = await testUtil.generateData(
            CreatableModel.SMSGMESSAGE,             // what to generate
            2,                              // how many to generate
            true,                       // return model
            generateSmsgMessageParams               // what kind of data to generate
        ) as resources.SmsgMessage[];

    });

    test('Should remove SmsgMessage using smsgMessage.id', async () => {
        const res = await testUtil.rpc(smsgCommand, [smsgRemoveCommand,
            smsgMessages[0].id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
    });

    test('Should remove SmsgMessage using smsgMessage.msgid', async () => {
        const res = await testUtil.rpc(smsgCommand, [smsgRemoveCommand,
            smsgMessages[1].msgid
        ]);
        res.expectJson();
        res.expectStatusCode(200);
    });

    test('Should fail to remove SmsgMessage using smsgMessage.id because its already removed', async () => {
        const res = await testUtil.rpc(smsgCommand, [smsgRemoveCommand,
            smsgMessages[0].id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('SmsgMessage').getMessage());
    });

    test('Should fail to remove SmsgMessage using smsgMessage.msgid because its already removed', async () => {
        const res = await testUtil.rpc(smsgCommand, [smsgRemoveCommand,
            smsgMessages[1].msgid
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('SmsgMessage').getMessage());
    });

});
