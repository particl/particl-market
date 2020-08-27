// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * from 'jest';
import * as Faker from 'faker';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { GenerateSmsgMessageParams } from '../../../src/api/requests/testdata/GenerateSmsgMessageParams';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { SmsgMessageStatus } from '../../../src/api/enums/SmsgMessageStatus';
import { ActionDirection } from '../../../src/api/enums/ActionDirection';
import { ListingItemAddMessageCreateParams } from '../../../src/api/requests/message/ListingItemAddMessageCreateParams';
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { ListingItemAddRequest } from '../../../src/api/requests/action/ListingItemAddRequest';
import { SmsgSendParams } from '../../../src/api/requests/action/SmsgSendParams';


describe('SmsgRemoveCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const smsgCommand = Commands.SMSG_ROOT.commandName;
    const smsgRemoveCommand = Commands.SMSG_REMOVE.commandName;

    let profile: resources.Profile;
    let market: resources.Market;

    let listingItemTemplate: resources.ListingItemTemplate;
    let smsgMessages: resources.SmsgMessage[];
    let randomCategory: resources.ItemCategory;

    const DAYS_RETENTION = 7;

    beforeAll(async () => {
        await testUtil.cleanDb();

        profile = await testUtil.getDefaultProfile();
        expect(profile.id).toBeDefined();
        market = await testUtil.getDefaultMarket(profile.id);
        expect(market.id).toBeDefined();

        randomCategory = await testUtil.getRandomCategory();

        // generate ListingItemTemplate
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,                           // generateItemInformation
            true,                           // generateItemLocation
            true,                           // generateShippingDestinations
            false,                          // generateItemImages
            true,                           // generatePaymentInformation
            true,                           // generateEscrow
            true,                           // generateItemPrice
            true,                           // generateMessagingInformation
            false,                          // generateListingItemObjects
            false,                          // generateObjectDatas
            profile.id,                     // profileId
            true,                           // generateListingItem
            market.id,                      // soldOnMarketId
            randomCategory.id               // categoryId
        ]).toParamsArray();

        const listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplate[];
        listingItemTemplate = listingItemTemplates[0];
    });


    test('Should generate SmsgMessages (MPA_LISTING_ADD) based on the ListingItemTemplate', async () => {

        // generate SmsgMessage (MPA_LISTING_ADD) based on the ListingItemTemplate
        const messageParams = {
            sendParams: {
                wallet: market.Identity.wallet
            } as SmsgSendParams,
            listingItem: listingItemTemplate,
            signature: Faker.random.uuid(),
            imagesWithData: false,
            sellerAddress: market.Identity.address
        };

        const generateSmsgMessageParams = new GenerateSmsgMessageParams([
            MPAction.MPA_LISTING_ADD,               // type
            SmsgMessageStatus.PROCESSED,            // status
            ActionDirection.INCOMING,               // direction
            true,                                   // read
            true,                                   // paid
            Date.now(),                             // received
            Date.now() - (24 * 60 * 60 * 1000),     // sent
            Date.now() + (5 * 24 * 60 * 60 * 1000), // expiration
            DAYS_RETENTION,                         // daysretention
            market.publishAddress,                  // from
            market.receiveAddress,                  // to
            messageParams                           // messageParams
            // text
        ]).toParamsArray();

        smsgMessages = await testUtil.generateData(
            CreatableModel.SMSGMESSAGE,             // what to generate
            2,                              // how many to generate
            true,                       // return model
            generateSmsgMessageParams               // what kind of data to generate
        ) as resources.SmsgMessage[];

        // log.debug('smsgMessages: ', JSON.stringify(smsgMessages, null, 2));
    });


    test('Should fail because missing msgid', async () => {
        const res = await testUtil.rpc(smsgCommand, [smsgRemoveCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('msgid').getMessage());
    });


    test('Should fail because invalid msgid', async () => {
        const res = await testUtil.rpc(smsgCommand, [smsgRemoveCommand,
            false
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('msgid', 'string').getMessage());
    });


    test('Should remove using smsgMessage.msgid', async () => {
        const res = await testUtil.rpc(smsgCommand, [smsgRemoveCommand,
            smsgMessages[0].msgid
        ]);
        res.expectJson();
        res.expectStatusCode(200);
    });


    test('Should fail because already removed', async () => {
        const res = await testUtil.rpc(smsgCommand, [smsgRemoveCommand,
            smsgMessages[0].msgid
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('SmsgMessage').getMessage());
    });

});
