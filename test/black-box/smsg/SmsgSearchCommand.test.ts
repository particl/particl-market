// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { SearchOrder } from '../../../src/api/enums/SearchOrder';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { ListingItemAddMessageCreateParams } from '../../../src/api/requests/message/ListingItemAddMessageCreateParams';
import { GenerateSmsgMessageParams } from '../../../src/api/requests/testdata/GenerateSmsgMessageParams';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { SmsgMessageStatus } from '../../../src/api/enums/SmsgMessageStatus';
import { ActionDirection } from '../../../src/api/enums/ActionDirection';
import { SmsgMessageSearchOrderField } from '../../../src/api/enums/SearchOrderField';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';

describe('SmsgSearchCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);  // SELLER

    const smsgCommand = Commands.SMSG_ROOT.commandName;
    const smsgSearchCommand = Commands.SMSG_SEARCH.commandName;

    let profile: resources.Profile;
    let market: resources.Market;

    let listingItemTemplate: resources.ListingItemTemplate;
    let smsgMessages: resources.SmsgMessage[];

    const PAGE = 0;
    const PAGE_LIMIT = 10;
    const ORDER = SearchOrder.ASC;
    const ORDER_FIELD = SmsgMessageSearchOrderField.RECEIVED;
    const DAYS_RETENTION = 7;

    beforeAll(async () => {
        await testUtil.cleanDb();

        // get seller and buyer profiles
        profile = await testUtil.getDefaultProfile();
        expect(profile.id).toBeDefined();
        log.debug('profile: ', profile.address);

        // get seller and buyer markets
        market = await testUtil.getDefaultMarket();
        expect(market.id).toBeDefined();
        log.debug('market: ', JSON.stringify(market, null, 2));

        // generate ListingItemTemplate
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
            profile.id,         // profileId
            false,              // generateListingItem
            market.id           // marketId
        ]).toParamsArray();

        const listingItemTemplatesOnSellerNode: resources.ListingItemTemplate[] = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE,     // what to generate
            1,                              // how many to generate
            true,                       // return model
            generateListingItemTemplateParams       // what kind of data to generate
        ) as resources.ListingItemTemplates[];
        listingItemTemplate = listingItemTemplatesOnSellerNode[0];
        expect(listingItemTemplate.id).toBeDefined();

        const messageParams = {
            listingItem: listingItemTemplate
        } as ListingItemAddMessageCreateParams;

        // generate SmsgMessage (MPA_LISTING_ADD) based on the ListingItemTemplate
        const generateSmsgMessageParams = new GenerateSmsgMessageParams([
            MPAction.MPA_LISTING_ADD,               // type
            SmsgMessageStatus.PROCESSED,            // status
            ActionDirection.INCOMING,               // direction
            false,                                  // read
            true,                                   // paid
            Date.now(),                             // received
            Date.now() - (24 * 60 * 60 * 1000),     // sent
            Date.now() + (5 * 24 * 60 * 60 * 1000), // expiration
            DAYS_RETENTION,                         // daysretention
            profile.address,                        // from
            market.address,                         // to
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

    test('Should search SmsgMessages without any params', async () => {
        const res: any = await testUtil.rpc(smsgCommand, [smsgSearchCommand,
            PAGE, PAGE_LIMIT, ORDER, ORDER_FIELD
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(2);
    });

    test('Should fail to search SmsgMessages because invalid type', async () => {
        const res: any = await testUtil.rpc(smsgCommand, [smsgSearchCommand,
            PAGE, PAGE_LIMIT, ORDER, ORDER_FIELD,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('type', 'ActionMessageTypes[]').getMessage());
    });

    test('Should search SmsgMessages using single type', async () => {
        const res: any = await testUtil.rpc(smsgCommand, [smsgSearchCommand,
            PAGE, PAGE_LIMIT, ORDER, ORDER_FIELD,
            [MPAction.MPA_LISTING_ADD]
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(2);
    });

    test('Should search SmsgMessages using multiple types', async () => {
        const res: any = await testUtil.rpc(smsgCommand, [smsgSearchCommand,
            PAGE, PAGE_LIMIT, ORDER, ORDER_FIELD,
            [MPAction.MPA_LISTING_ADD, MPAction.MPA_BID]
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(2);
    });

    test('Should search SmsgMessages using * as type', async () => {
        const res: any = await testUtil.rpc(smsgCommand, [smsgSearchCommand,
            PAGE, PAGE_LIMIT, ORDER, ORDER_FIELD,
            '*'
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(2);
    });

    test('Should fail to search SmsgMessages because invalid status', async () => {
        const res: any = await testUtil.rpc(smsgCommand, [smsgSearchCommand,
            PAGE, PAGE_LIMIT, ORDER, ORDER_FIELD,
            [MPAction.MPA_LISTING_ADD, MPAction.MPA_BID],
            true
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('status', 'SmsgMessageStatus').getMessage());

    });

    test('Should search SmsgMessages using type and status', async () => {
        const res: any = await testUtil.rpc(smsgCommand, [smsgSearchCommand,
            PAGE, PAGE_LIMIT, ORDER, ORDER_FIELD,
            [MPAction.MPA_LISTING_ADD, MPAction.MPA_BID],
            SmsgMessageStatus.PROCESSED
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(2);
    });

    test('Should search SmsgMessages using type and * as status', async () => {
        const res: any = await testUtil.rpc(smsgCommand, [smsgSearchCommand,
            PAGE, PAGE_LIMIT, ORDER, ORDER_FIELD,
            [MPAction.MPA_LISTING_ADD, MPAction.MPA_BID],
            '*'
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(2);
    });

    test('Should fail to search SmsgMessages because invalid direction', async () => {
        const res: any = await testUtil.rpc(smsgCommand, [smsgSearchCommand,
            PAGE, PAGE_LIMIT, ORDER, ORDER_FIELD,
            [MPAction.MPA_LISTING_ADD, MPAction.MPA_BID],
            SmsgMessageStatus.PROCESSED,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('direction', 'ActionDirection').getMessage());
    });

    test('Should search SmsgMessages using type and status and direction', async () => {
        const res: any = await testUtil.rpc(smsgCommand, [smsgSearchCommand,
            PAGE, PAGE_LIMIT, ORDER, ORDER_FIELD,
            [MPAction.MPA_LISTING_ADD, MPAction.MPA_BID],
            SmsgMessageStatus.PROCESSED,
            ActionDirection.INCOMING
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(2);
    });

    test('Should search SmsgMessages using type and status and * as direction', async () => {
        const res: any = await testUtil.rpc(smsgCommand, [smsgSearchCommand,
            PAGE, PAGE_LIMIT, ORDER, ORDER_FIELD,
            [MPAction.MPA_LISTING_ADD, MPAction.MPA_BID],
            SmsgMessageStatus.PROCESSED,
            '*'
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(2);
    });

    test('Should fail to search SmsgMessages because invalid age', async () => {
        const res: any = await testUtil.rpc(smsgCommand, [smsgSearchCommand,
            PAGE, PAGE_LIMIT, ORDER, ORDER_FIELD,
            [MPAction.MPA_LISTING_ADD, MPAction.MPA_BID],
            SmsgMessageStatus.PROCESSED,
            ActionDirection.INCOMING,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('age', 'number').getMessage());

    });

    test('Should search SmsgMessages using type and status and direction and age', async () => {
        const res: any = await testUtil.rpc(smsgCommand, [smsgSearchCommand,
            PAGE, PAGE_LIMIT, ORDER, ORDER_FIELD,
            [MPAction.MPA_LISTING_ADD, MPAction.MPA_BID],
            SmsgMessageStatus.PROCESSED,
            ActionDirection.INCOMING,
            1
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(2);
    });

    test('Should search SmsgMessages using type and status and direction and undefined age', async () => {
        const res: any = await testUtil.rpc(smsgCommand, [smsgSearchCommand,
            PAGE, PAGE_LIMIT, ORDER, ORDER_FIELD,
            [MPAction.MPA_LISTING_ADD, MPAction.MPA_BID],
            SmsgMessageStatus.PROCESSED,
            ActionDirection.INCOMING,
            undefined
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(2);
    });

    test('Should fail to search SmsgMessages because invalid msgid', async () => {
        const res: any = await testUtil.rpc(smsgCommand, [smsgSearchCommand,
            PAGE, PAGE_LIMIT, ORDER, ORDER_FIELD,
            [MPAction.MPA_LISTING_ADD, MPAction.MPA_BID],
            SmsgMessageStatus.PROCESSED,
            ActionDirection.INCOMING,
            1,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('msgid', 'string').getMessage());

    });

    test('Should search SmsgMessages using type and status and direction and age and msgid', async () => {
        const res: any = await testUtil.rpc(smsgCommand, [smsgSearchCommand,
            PAGE, PAGE_LIMIT, ORDER, ORDER_FIELD,
            [MPAction.MPA_LISTING_ADD, MPAction.MPA_BID],
            SmsgMessageStatus.PROCESSED,
            ActionDirection.INCOMING,
            1,
            smsgMessages[1].msgid
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(1);

    });

});
