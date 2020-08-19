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
import { GenerateCommentParams } from '../../../src/api/requests/testdata/GenerateCommentParams';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';


describe('CommentGetCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const commentCommand = Commands.COMMENT_ROOT.commandName;
    const commentCountCommand = Commands.COMMENT_COUNT.commandName;

    let profile: resources.Profile;
    let market: resources.Market;

    let listingItem: resources.ListingItem;
    let comment: resources.Comment;

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


    test('Should generate Comment about ListingItem', async () => {

        const generateCommentParams = new GenerateCommentParams([
            false,                                              // generateListingItemTemplate
            false,                                              // generateListingItem
            false,                                              // generatePastComment
            market.Identity.address,                            // sender
            market.receiveAddress,                              // receiver
            CommentType.LISTINGITEM_QUESTION_AND_ANSWERS,       // type
            listingItem.hash                                    // target
        ]).toParamsArray();

        const comments = await testUtil.generateData(
            CreatableModel.COMMENT,     // what to generate
            1,                  // how many to generate
            true,            // return model
            generateCommentParams       // what kind of data to generate
        );
        comment = comments[0];
        // log.debug('comment: ', JSON.stringify(comment, null, 2));
    });


    test('Should fail because missing type', async () => {
        const response = await testUtil.rpc(commentCommand, [commentCountCommand]);
        response.expectJson();
        response.expectStatusCode(404);
        expect(response.error.error.message).toBe(new MissingParamException('type').getMessage());
    });


    test('Should fail because missing target', async () => {
        const response = await testUtil.rpc(commentCommand, [commentCountCommand,
            CommentType.LISTINGITEM_QUESTION_AND_ANSWERS
        ]);
        response.expectJson();
        response.expectStatusCode(404);
        expect(response.error.error.message).toBe(new MissingParamException('target').getMessage());
    });


    test('Should fail because invalid type', async () => {
        const response = await testUtil.rpc(commentCommand, [commentCountCommand,
            false,
            listingItem.hash
        ]);
        response.expectJson();
        response.expectStatusCode(400);
        expect(response.error.error.message).toBe(new InvalidParamException('type', 'CommentType').getMessage());
    });


    test('Should fail because invalid target', async () => {
        const response = await testUtil.rpc(commentCommand, [commentCountCommand,
            CommentType.LISTINGITEM_QUESTION_AND_ANSWERS,
            false
        ]);
        response.expectJson();
        response.expectStatusCode(400);
        expect(response.error.error.message).toBe(new InvalidParamException('target', 'string').getMessage());
    });


    test('Should fail because invalid parentCommentHash', async () => {
        const response = await testUtil.rpc(commentCommand, [commentCountCommand,
            CommentType.LISTINGITEM_QUESTION_AND_ANSWERS,
            listingItem.hash,
            false
        ]);
        response.expectJson();
        response.expectStatusCode(400);
        expect(response.error.error.message).toBe(new InvalidParamException('parentCommentHash', 'string').getMessage());
    });


    test('Should fail because parent Comment not found', async () => {
        const response = await testUtil.rpc(commentCommand, [commentCountCommand,
            CommentType.LISTINGITEM_QUESTION_AND_ANSWERS,
            listingItem.hash,
            comment.hash + 'NOTFOUND'
        ]);
        response.expectJson();
        response.expectStatusCode(404);
        expect(response.error.error.message).toBe(new ModelNotFoundException('Comment').getMessage());
    });


    test('Should return a number of Comments for type and target', async () => {
        const response = await testUtil.rpc(commentCommand, [commentCountCommand,
            CommentType.LISTINGITEM_QUESTION_AND_ANSWERS,
            listingItem.hash
        ]);
        response.expectJson();
        response.expectStatusCode(200);
        const commentCount: number = response.getBody()['result'];

        expect(commentCount).toBe(1);
    });

});
