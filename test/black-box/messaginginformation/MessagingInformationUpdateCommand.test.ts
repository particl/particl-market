// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands} from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { MessagingProtocol } from 'omp-lib/dist/interfaces/omp-enums';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { ModelNotModifiableException } from '../../../src/api/exceptions/ModelNotModifiableException';

describe('MessagingInformationUpdateCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const messagingCommand = Commands.MESSAGINGINFORMATION_ROOT.commandName;
    const messagingUpdateCommand = Commands.MESSAGINGINFORMATION_UPDATE.commandName;
    const templateCommand = Commands.TEMPLATE_ROOT.commandName;
    const templatePostCommand = Commands.TEMPLATE_POST.commandName;

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
            false,  // generateListingItem
            defaultMarket.id   // marketId
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
        protocol: MessagingProtocol.SMSG,
        publicKey: 'publickey2'
    };

    test('Should fail to update MessagingInformation because missing protocol', async () => {
        const res = await testUtil.rpc(messagingCommand, [messagingUpdateCommand,
            listingItemTemplates[0].id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('protocol').getMessage());
    });

    test('Should fail to update MessagingInformation because invalid protocol', async () => {
        const res = await testUtil.rpc(messagingCommand, [messagingUpdateCommand,
            listingItemTemplates[0].id,
            'test',
            messageInfoData.publicKey
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('protocol').getMessage());
    });

    test('Should update the MessagingInformation', async () => {
        const res = await testUtil.rpc(messagingCommand, [messagingUpdateCommand,
            listingItemTemplates[0].id,
            messageInfoData.protocol,
            messageInfoData.publicKey
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.protocol).toBe(messageInfoData.protocol);
        expect(result.publicKey).toBe(messageInfoData.publicKey);
        expect(result.listingItemId).toBe(null);
        expect(result.listingItemTemplateId).toBe(listingItemTemplates[0].id);
    });

    test('Should not update the MessagingInformation because the ListingItemTemplate has been published', async () => {

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            true,   // generateShippingDestinations
            false,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            false,    // generateListingItemObjects
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

        // post template
        const daysRetention = 4;
        let res = await testUtil.rpc(templateCommand, [templatePostCommand,
            listingItemTemplates[0].id,
            daysRetention,
            defaultMarket.id
        ]);
        res.expectJson();

        // make sure we got the expected result from posting the template
        const result: any = res.getBody()['result'];
        log.debug('result:', JSON.stringify(result, null, 2));
        const sent = result.result === 'Sent.';
        if (!sent) {
            log.debug(JSON.stringify(result, null, 2));
        }
        expect(result.result).toBe('Sent.');

        res = await testUtil.rpc(messagingCommand, [messagingUpdateCommand,
            listingItemTemplates[0].id,
            messageInfoData.protocol,
            messageInfoData.publicKey
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new ModelNotModifiableException('ListingItemTemplate').getMessage());
    });

});
