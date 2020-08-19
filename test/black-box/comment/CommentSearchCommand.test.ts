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

    let listingItem: resources.ListingItem;
    let comments: resources.Comment[];

    const PAGE = 0;
    const PAGE_LIMIT = 10;
    const ORDER = SearchOrder.ASC;
    const ORDER_FIELD = CommentSearchOrderField.ID;

    const numGeneratedComments = 7;

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
            undefined                       // categoryId
        ]).toParamsArray();

        const listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplate[];
        listingItem = listingItemTemplates[0].ListingItems[0];
    });


    test('Should generate Comments about ListingItem', async () => {

        const generateCommentParams = new GenerateCommentParams([
            false,                                              // generateListingItemTemplate
            false,                                              // generateListingItem
            false,                                              // generatePastComment
            market.Identity.address,                            // sender
            market.receiveAddress,                              // receiver
            CommentType.LISTINGITEM_QUESTION_AND_ANSWERS,       // type
            listingItem.hash                                    // target
        ]).toParamsArray();

        comments = await testUtil.generateData(
            CreatableModel.COMMENT,     // what to generate
            numGeneratedComments,       // how many to generate
            true,            // return model
            generateCommentParams       // what kind of data to generate
        );
        // log.debug('comments: ', JSON.stringify(comments, null, 2));
    });


    test('Should fail because missing type', async () => {
        const response = await testUtil.rpc(commentCommand, [commentSearchCommand,
            PAGE, PAGE_LIMIT, ORDER, ORDER_FIELD
        ]);
        response.expectJson();
        response.expectStatusCode(404);
        expect(response.error.error.message).toBe(new MissingParamException('type').getMessage());
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


    test('Should fail because invalid type', async () => {
        const res: any = await testUtil.rpc(commentCommand, [commentSearchCommand,
            PAGE, PAGE_LIMIT, ORDER, ORDER_FIELD,
            true,
            market.receiveAddress
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('type', 'CommentType').getMessage());
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
            listingItem.hash + 'NOTFOUND'
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
            listingItem.hash + 'NOTFOUND'
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MessageException('Only CommentType.LISTINGITEM_QUESTION_AND_ANSWERS is supported.').getMessage());
    });


    test('Should search for a Comments by type and receiver', async () => {
        const res: any = await testUtil.rpc(commentCommand, [commentSearchCommand,
            PAGE, PAGE_LIMIT, ORDER, ORDER_FIELD,
            CommentType.LISTINGITEM_QUESTION_AND_ANSWERS,
            market.receiveAddress
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.length).toBe(comments.length);

        for (let i = 0; i < comments.length; i++) {
            expect(result[i].sender).toBe(comments[i].sender);
            expect(result[i].target).toBe(comments[i].target);
            expect(result[i].receiver).toBe(comments[i].receiver);
            expect(result[i].message).toBe(comments[i].message);
            expect(result[i].type).toBe(comments[i].type);
            expect(result[i].hash).toBe(comments[i].hash);
        }
    });


    test('Should search for a Comments by type, receiver and target', async () => {
        const res: any = await testUtil.rpc(commentCommand, [commentSearchCommand,
            PAGE, PAGE_LIMIT, ORDER, ORDER_FIELD,
            CommentType.LISTINGITEM_QUESTION_AND_ANSWERS,
            market.receiveAddress,
            listingItem.hash
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.length).toBe(comments.length);

        for (let i = 0; i < comments.length; i++) {
            expect(result[i].sender).toBe(comments[i].sender);
            expect(result[i].target).toBe(comments[i].target);
            expect(result[i].receiver).toBe(comments[i].receiver);
            expect(result[i].message).toBe(comments[i].message);
            expect(result[i].type).toBe(comments[i].type);
            expect(result[i].hash).toBe(comments[i].hash);
        }
    });

    // todo: search by parentCommentHash
});
