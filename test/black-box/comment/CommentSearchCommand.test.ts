// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { CommentType } from '../../../src/api/enums/CommentType';
import { SearchOrder } from '../../../src/api/enums/SearchOrder';
import { GenerateCommentParams } from '../../../src/api/requests/testdata/GenerateCommentParams';
import { CommentSearchOrderField } from '../../../src/api/enums/SearchOrderField';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';
import { MessageException } from '../../../src/api/exceptions/MessageException';

describe('CommentSearchCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const commentCommand = Commands.COMMENT_ROOT.commandName;
    const commentSearchCommand = Commands.COMMENT_SEARCH.commandName;

    let profile: resources.Profile;
    let market: resources.Market;

    let listingItem1: resources.ListingItem;
    let listingItem2: resources.ListingItem;
    let commentsAboutListingItem1: resources.Comment[];
    let commentsAboutListingItem2: resources.Comment[];

    const PAGE = 0;
    const PAGE_LIMIT = 1000;
    const ORDER = SearchOrder.ASC;
    const ORDER_FIELD = CommentSearchOrderField.ID;

    const COMMENT_AMOUNT = 3;

    beforeAll(async () => {
        await testUtil.cleanDb();

        // get default profile and market
        profile = await testUtil.getDefaultProfile();
        expect(profile.id).toBeDefined();
        market = await testUtil.getDefaultMarket(profile.id);
        expect(market.id).toBeDefined();

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,                           // generateItemInformation
            true,                           // generateItemLocation
            true,                           // generateShippingDestinations
            false,                          // generateImages
            true,                           // generatePaymentInformation
            true,                           // generateEscrow
            true,                           // generateItemPrice
            true,                           // generateMessagingInformation
            false,                          // generateListingItemObjects
            false,                          // generateObjectDatas
            profile.id,                     // profileId
            true,                           // generateListingItem
            market.id,                      // soldOnMarketId
            undefined                       // categoryId
        ]).toParamsArray();

        const listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            2,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplate[];
        listingItem1 = listingItemTemplates[0].ListingItems[0];
        listingItem2 = listingItemTemplates[1].ListingItems[0];
    });


    test('Should generate Comments about ListingItem1', async () => {

        const generateCommentParams = new GenerateCommentParams([
            false,                                              // generateListingItemTemplate
            false,                                              // generateListingItem
            false,                                              // generatePastComment
            market.Identity.address,                            // sender
            market.receiveAddress,                              // receiver
            CommentType.LISTINGITEM_QUESTION_AND_ANSWERS,       // type
            listingItem1.hash                                   // target
        ]).toParamsArray();

        commentsAboutListingItem1 = await testUtil.generateData(
            CreatableModel.COMMENT,     // what to generate
            COMMENT_AMOUNT,             // how many to generate
            true,            // return model
            generateCommentParams       // what kind of data to generate
        );
        // log.debug('commentsAboutListingItem1: ', JSON.stringify(commentsAboutListingItem1, null, 2));
    });


    test('Should generate Comments about ListingItem2', async () => {

        const generateCommentParams = new GenerateCommentParams([
            false,                                              // generateListingItemTemplate
            false,                                              // generateListingItem
            false,                                              // generatePastComment
            market.Identity.address,                            // sender
            market.receiveAddress,                              // receiver
            CommentType.LISTINGITEM_QUESTION_AND_ANSWERS,       // type
            listingItem2.hash                                   // target
        ]).toParamsArray();

        commentsAboutListingItem2 = await testUtil.generateData(
            CreatableModel.COMMENT,     // what to generate
            COMMENT_AMOUNT,             // how many to generate
            true,            // return model
            generateCommentParams       // what kind of data to generate
        );
        // log.debug('commentsAboutListingItem1: ', JSON.stringify(commentsAboutListingItem1, null, 2));
    });


    test('Should fail because missing commentType', async () => {
        const response = await testUtil.rpc(commentCommand, [commentSearchCommand,
            PAGE, PAGE_LIMIT, ORDER, ORDER_FIELD
        ]);
        response.expectJson();
        response.expectStatusCode(404);
        expect(response.error.error.message).toBe(new MissingParamException('commentType').getMessage());
    });


    test('Should fail because missing receiver', async () => {
        const response = await testUtil.rpc(commentCommand, [commentSearchCommand,
            PAGE, PAGE_LIMIT, ORDER, ORDER_FIELD,
            CommentType.LISTINGITEM_QUESTION_AND_ANSWERS
        ]);
        response.expectJson();
        response.expectStatusCode(404);
        expect(response.error.error.message).toBe(new MissingParamException('receiver').getMessage());
    });


    test('Should fail because invalid commentType', async () => {
        const res: any = await testUtil.rpc(commentCommand, [commentSearchCommand,
            PAGE, PAGE_LIMIT, ORDER, ORDER_FIELD,
            true,
            market.receiveAddress
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('commentType', 'string').getMessage());
    });


    test('Should fail because invalid receiver', async () => {
        const res: any = await testUtil.rpc(commentCommand, [commentSearchCommand,
            PAGE, PAGE_LIMIT, ORDER, ORDER_FIELD,
            CommentType.LISTINGITEM_QUESTION_AND_ANSWERS,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('receiver', 'string').getMessage());
    });


    test('Should fail because receiver not found', async () => {
        const res: any = await testUtil.rpc(commentCommand, [commentSearchCommand,
            PAGE, PAGE_LIMIT, ORDER, ORDER_FIELD,
            CommentType.LISTINGITEM_QUESTION_AND_ANSWERS,
            market.receiveAddress + 'NOTFOUND'
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('Market').getMessage());
    });


    test('Should fail because target not found', async () => {
        const res: any = await testUtil.rpc(commentCommand, [commentSearchCommand,
            PAGE, PAGE_LIMIT, ORDER, ORDER_FIELD,
            CommentType.LISTINGITEM_QUESTION_AND_ANSWERS,
            market.receiveAddress,
            listingItem1.hash + 'NOTFOUND'
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('ListingItem').getMessage());
    });


    test('Should fail because type not supported', async () => {
        const res: any = await testUtil.rpc(commentCommand, [commentSearchCommand,
            PAGE, PAGE_LIMIT, ORDER, ORDER_FIELD,
            CommentType.MARKETPLACE_COMMENT,
            market.receiveAddress,
            listingItem1.hash
        ]);
        res.expectJson();
        res.expectStatusCode(404);

        expect(res.error.error.message).toBe(new MessageException('CommentType not supported.').getMessage());
    });


    test('Should search for a Comments by commentType and receiver', async () => {
        const res: any = await testUtil.rpc(commentCommand, [commentSearchCommand,
            PAGE, PAGE_LIMIT, ORDER, ORDER_FIELD,
            CommentType.LISTINGITEM_QUESTION_AND_ANSWERS,
            market.receiveAddress
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.Comment[] = res.getBody()['result'];
        expect(result.length).toBe(COMMENT_AMOUNT * 2);

        const allComments: resources.Comment = commentsAboutListingItem1.concat(commentsAboutListingItem2);

        for (let i = 0; i < COMMENT_AMOUNT; i++) {
            expect(result[i].sender).toBe(allComments[i].sender);
            expect(result[i].receiver).toBe(allComments[i].receiver);
            expect(result[i].type).toBe(allComments[i].type);
        }
    });


    test('Should search for a Comments by type, receiver and target', async () => {
        const res: any = await testUtil.rpc(commentCommand, [commentSearchCommand,
            PAGE, PAGE_LIMIT, ORDER, ORDER_FIELD,
            CommentType.LISTINGITEM_QUESTION_AND_ANSWERS,
            market.receiveAddress,
            listingItem1.hash
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.Comment[] = res.getBody()['result'];
        expect(result.length).toBe(commentsAboutListingItem1.length);

        for (let i = 0; i < COMMENT_AMOUNT; i++) {
            expect(result[i].sender).toBe(commentsAboutListingItem1[i].sender);
            expect(result[i].target).toBe(commentsAboutListingItem1[i].target);
            expect(result[i].receiver).toBe(commentsAboutListingItem1[i].receiver);
            expect(result[i].message).toBe(commentsAboutListingItem1[i].message);
            expect(result[i].type).toBe(commentsAboutListingItem1[i].type);
            expect(result[i].hash).toBe(commentsAboutListingItem1[i].hash);
        }
    });

    // todo: search by parentCommentHash
});
