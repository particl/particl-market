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
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';

describe('CommentGetCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const commentCommand = Commands.COMMENT_ROOT.commandName;
    const commentGetCommand = Commands.COMMENT_GET.commandName;

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
        log.debug('comment: ', JSON.stringify(comment, null, 2));
    });


    test('Should fail because missing id|hash', async () => {
        const response: any = await testUtil.rpc(commentCommand, [commentGetCommand]);
        response.expectJson();
        response.expectStatusCode(404);
        expect(response.error.error.message).toBe(new MissingParamException('id|hash').getMessage());
    });


    test('Should fail because invalid id|hash', async () => {
        const response: any = await testUtil.rpc(commentCommand, [commentGetCommand,
            true
        ]);
        response.expectJson();
        response.expectStatusCode(400);
        expect(response.error.error.message).toBe(new InvalidParamException('id|hash', 'number|string').getMessage());
    });


    test('Should fail because not found by hash', async () => {
        const response: any = await testUtil.rpc(commentCommand, [commentGetCommand,
            'NOTFOUND'
        ]);
        response.expectJson();
        response.expectStatusCode(404);
        expect(response.error.error.message).toBe(new ModelNotFoundException('Comment').getMessage());
    });


    test('Should fail because not found by id', async () => {
        const response: any = await testUtil.rpc(commentCommand, [commentGetCommand,
            0
        ]);
        response.expectJson();
        response.expectStatusCode(404);
        expect(response.error.error.message).toBe(new ModelNotFoundException('Comment').getMessage());
    });


    test('Should return Comment by id', async () => {
        const response = await testUtil.rpc(commentCommand, [commentGetCommand,
            comment.id
        ]);
        response.expectJson();
        response.expectStatusCode(200);
        const result: resources.Comment = response.getBody()['result'];

        expect(result.sender).toBe(comment.sender);
        expect(result.generatedAt).toBe(comment.generatedAt);
        expect(result.target).toBe(comment.target);
        expect(result.receiver).toBe(comment.receiver);
        expect(result.message).toBe(comment.message);
        expect(result.type).toBe(comment.type);
        expect(result.hash).toBe(comment.hash);
    });


    test('Should return Comment by hash', async () => {
        const response = await testUtil.rpc(commentCommand, [commentGetCommand,
            comment.hash
        ]);
        response.expectJson();
        response.expectStatusCode(200);
        const result: resources.Comment = response.getBody()['result'];

        expect(result.sender).toBe(comment.sender);
        expect(result.generatedAt).toBe(comment.generatedAt);
        expect(result.target).toBe(comment.target);
        expect(result.receiver).toBe(comment.receiver);
        expect(result.message).toBe(comment.message);
        expect(result.type).toBe(comment.type);
        expect(result.hash).toBe(comment.hash);
    });

});
