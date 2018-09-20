// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { MessagingProtocolType } from '../../../src/api/enums/MessagingProtocolType';
import { Commands} from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/params/GenerateListingItemTemplateParams';
import { Logger as LoggerType } from '../../../src/core/Logger';
import * as resources from 'resources';

describe('MessagingInformationUpdateCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const messagingCommand = Commands.MESSAGINGINFORMATION_ROOT.commandName;
    const messagingUpdateCommand = Commands.MESSAGINGINFORMATION_UPDATE.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;

    let listingItemTemplates: resources.ListingItemTemplate[];

    beforeAll(async () => {
        await testUtil.cleanDb();

        // get default profile and market
        defaultProfile = await testUtil.getDefaultProfile();
        defaultMarket = await testUtil.getDefaultMarket();

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateShippingDestinations
            false,  // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            true    // generateListingItemObjects
        ]).toParamsArray();

        // generate listingItemTemplate
        listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplates[];

    });

    const messageInfoData = {
        protocol: MessagingProtocolType.SMSG,
        publicKey: 'publickey2'
    };

    test('Should fail to update MessagingInformation because empty body', async () => {
        const res = await testUtil.rpc(messagingCommand, [messagingUpdateCommand, listingItemTemplates[0].id]);
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('Should fail to update MessagingInformation because invalid protocol', async () => {
        const res = await testUtil.rpc(messagingCommand, [messagingUpdateCommand, listingItemTemplates[0].id, 'test', messageInfoData.publicKey]);
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('Should update the MessagingInformation', async () => {
        const res = await testUtil.rpc(messagingCommand, [messagingUpdateCommand, listingItemTemplates[0].id, messageInfoData.protocol, messageInfoData.publicKey]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.protocol).toBe(messageInfoData.protocol);
        expect(result.publicKey).toBe(messageInfoData.publicKey);
        expect(result.listingItemId).toBe(null);
        expect(result.listingItemTemplateId).toBe(listingItemTemplates[0].id);
    });

    test('Should not update the MessagingInformation that has relation to ListingItem', async () => {

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateShippingDestinations
            false,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            true,    // generateListingItemObjects
            false,
            null,
            true,
            defaultMarket.id
        ]).toParamsArray();

        // generate listingItemTemplate
        listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplates[];

        const res = await testUtil.rpc(messagingCommand, [messagingUpdateCommand, listingItemTemplates[0].id, messageInfoData.protocol, messageInfoData.publicKey]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('MessagingInformation cannot be updated if there is a ListingItem related to ListingItemTemplate.');
    });

});
