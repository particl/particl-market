// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { CommentCategory } from '../../../src/api/enums/CommentCategory';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { MessageException } from '../../../src/api/exceptions/MessageException';

describe('CommentPostCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const commentCommand = Commands.COMMENT_ROOT.commandName;
    const commentPostCommand = Commands.COMMENT_POST.commandName;
    const commentSearchCommand = Commands.COMMENT_SEARCH.commandName;

    let profile: resources.Profile;
    let market: resources.Market;

    let listingItem: resources.ListingItemTemplate;

    let sent = false;

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


    test('Should fail because missing identityId', async () => {
        const response: any = await testUtil.rpc(commentCommand, [commentPostCommand]);
        response.expectJson();
        response.expectStatusCode(404);
        expect(response.error.error.message).toBe(new MissingParamException('identityId').getMessage());
    });


    test('Should fail because missing commentType', async () => {
        const response: any = await testUtil.rpc(commentCommand, [commentPostCommand,
            market.Identity.id
        ]);
        response.expectJson();
        response.expectStatusCode(404);
        expect(response.error.error.message).toBe(new MissingParamException('commentType').getMessage());
    });


    test('Should fail because missing receiver', async () => {
        const response: any = await testUtil.rpc(commentCommand, [commentPostCommand,
            market.Identity.id,
            CommentCategory.LISTINGITEM_QUESTION_AND_ANSWERS
        ]);
        response.expectJson();
        response.expectStatusCode(404);
        expect(response.error.error.message).toBe(new MissingParamException('receiver').getMessage());
    });


    test('Should fail because missing target', async () => {
        const response: any = await testUtil.rpc(commentCommand, [commentPostCommand,
            market.Identity.id,
            CommentCategory.LISTINGITEM_QUESTION_AND_ANSWERS,
            market.receiveAddress
        ]);
        response.expectJson();
        response.expectStatusCode(404);
        expect(response.error.error.message).toBe(new MissingParamException('target').getMessage());
    });


    test('Should fail because missing message', async () => {
        const response: any = await testUtil.rpc(commentCommand, [commentPostCommand,
            market.Identity.id,
            CommentCategory.LISTINGITEM_QUESTION_AND_ANSWERS,
            market.receiveAddress,
            listingItem.hash
        ]);
        response.expectJson();
        response.expectStatusCode(404);
        expect(response.error.error.message).toBe(new MissingParamException('message').getMessage());
    });


    test('Should fail because invalid identityId', async () => {
        const response: any = await testUtil.rpc(commentCommand, [commentPostCommand,
            true,
            CommentCategory.LISTINGITEM_QUESTION_AND_ANSWERS,
            market.receiveAddress,
            listingItem.hash,
            'THIS_IS_THE_MESSAGE'
        ]);
        response.expectJson();
        response.expectStatusCode(400);
        expect(response.error.error.message).toBe(new InvalidParamException('identityId', 'number').getMessage());
    });


    test('Should fail because invalid commentType', async () => {
        const response: any = await testUtil.rpc(commentCommand, [commentPostCommand,
            market.Identity.id,
            true,
            market.receiveAddress,
            listingItem.hash,
            'THIS_IS_THE_MESSAGE'
        ]);
        response.expectJson();
        response.expectStatusCode(400);
        expect(response.error.error.message).toBe(new InvalidParamException('commentType', 'string').getMessage());
    });


    test('Should fail because invalid commentType', async () => {
        const response: any = await testUtil.rpc(commentCommand, [commentPostCommand,
            market.Identity.id,
            'ALSO_INVALID_TYPE',
            market.receiveAddress,
            listingItem.hash,
            'THIS_IS_THE_MESSAGE'
        ]);
        response.expectJson();
        response.expectStatusCode(400);
        expect(response.error.error.message).toBe(new InvalidParamException('commentType', 'CommentType').getMessage());
    });


    test('Should fail because invalid receiver', async () => {
        const response: any = await testUtil.rpc(commentCommand, [commentPostCommand,
            market.Identity.id,
            CommentCategory.LISTINGITEM_QUESTION_AND_ANSWERS,
            true,
            listingItem.hash,
            'THIS_IS_THE_MESSAGE'
        ]);
        response.expectJson();
        response.expectStatusCode(400);
        expect(response.error.error.message).toBe(new InvalidParamException('receiver', 'string').getMessage());
    });


    test('Should fail because invalid target', async () => {
        const response: any = await testUtil.rpc(commentCommand, [commentPostCommand,
            market.Identity.id,
            CommentCategory.LISTINGITEM_QUESTION_AND_ANSWERS,
            market.receiveAddress,
            true,
            'THIS_IS_THE_MESSAGE'
        ]);
        response.expectJson();
        response.expectStatusCode(400);
        expect(response.error.error.message).toBe(new InvalidParamException('target', 'string').getMessage());
    });


    test('Should fail because invalid message', async () => {
        const response: any = await testUtil.rpc(commentCommand, [commentPostCommand,
            market.Identity.id,
            CommentCategory.LISTINGITEM_QUESTION_AND_ANSWERS,
            market.receiveAddress,
            listingItem.hash,
            true
        ]);
        response.expectJson();
        response.expectStatusCode(400);
        expect(response.error.error.message).toBe(new InvalidParamException('message', 'string').getMessage());
    });


    test('Should fail because invalid parentCommentHash', async () => {
        const response: any = await testUtil.rpc(commentCommand, [commentPostCommand,
            market.Identity.id,
            CommentCategory.LISTINGITEM_QUESTION_AND_ANSWERS,
            market.receiveAddress,
            listingItem.hash,
            'THIS_IS_THE_MESSAGE',
            true
        ]);
        response.expectJson();
        response.expectStatusCode(400);
        expect(response.error.error.message).toBe(new InvalidParamException('parentCommentHash', 'string').getMessage());
    });


    test('Should fail because Identity not found', async () => {
        const response: any = await testUtil.rpc(commentCommand, [commentPostCommand,
            0,
            CommentCategory.LISTINGITEM_QUESTION_AND_ANSWERS,
            market.receiveAddress,
            listingItem.hash,
            'THIS_IS_THE_MESSAGE'
        ]);
        response.expectJson();
        response.expectStatusCode(404);
        expect(response.error.error.message).toBe(new ModelNotFoundException('Identity').getMessage());
    });


    test('Should fail because Market not found', async () => {
        const response: any = await testUtil.rpc(commentCommand, [commentPostCommand,
            market.Identity.id,
            CommentCategory.LISTINGITEM_QUESTION_AND_ANSWERS,
            market.receiveAddress + 'NO_MATCH',
            listingItem.hash,
            'THIS_IS_THE_MESSAGE'
        ]);
        response.expectJson();
        response.expectStatusCode(404);
        expect(response.error.error.message).toBe(new ModelNotFoundException('Market').getMessage());
    });


    test('Should fail because ListingItem not found', async () => {
        const response: any = await testUtil.rpc(commentCommand, [commentPostCommand,
            market.Identity.id,
            CommentCategory.LISTINGITEM_QUESTION_AND_ANSWERS,
            market.receiveAddress,
            listingItem.hash + 'NO_MATCH',
            'THIS_IS_THE_MESSAGE'
        ]);
        response.expectJson();
        response.expectStatusCode(404);
        expect(response.error.error.message).toBe(new ModelNotFoundException('ListingItem').getMessage());
    });


    test('Should fail because Comment not found', async () => {
        const response: any = await testUtil.rpc(commentCommand, [commentPostCommand,
            market.Identity.id,
            CommentCategory.LISTINGITEM_QUESTION_AND_ANSWERS,
            market.receiveAddress,
            listingItem.hash,
            'THIS_IS_THE_MESSAGE',
            'INVALID_PARENT_COMMENT_HASH'
        ]);
        response.expectJson();
        response.expectStatusCode(404);
        expect(response.error.error.message).toBe(new ModelNotFoundException('Comment').getMessage());
    });


    test('Should fail because empty message', async () => {
        const response: any = await testUtil.rpc(commentCommand, [commentPostCommand,
            market.Identity.id,
            CommentCategory.LISTINGITEM_QUESTION_AND_ANSWERS,
            market.receiveAddress,
            listingItem.hash,
            ''
        ]);
        response.expectJson();
        response.expectStatusCode(404);
        expect(response.error.error.message).toBe(new MessageException('The Comment text cannot be empty.').getMessage());
    });


    test('Should fail because too long message', async () => {
        const response: any = await testUtil.rpc(commentCommand, [commentPostCommand,
            market.Identity.id,
            CommentCategory.LISTINGITEM_QUESTION_AND_ANSWERS,
            market.receiveAddress,
            listingItem.hash,
            '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890'
            + '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890'
            + '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890'
            + '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890'
            + '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890'
            + '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890'
            + '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890'
            + '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890'
            + '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890'
            + '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890'
            + '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890'
        ]);
        response.expectJson();
        response.expectStatusCode(404);
        expect(response.error.error.message).toBe(new MessageException('The maximum length for the Comment text cannot exceed 1000 characters.').getMessage());
    });


    test('Should create a Comment of type LISTINGITEM_QUESTION_AND_ANSWERS', async () => {

        const response: any = await testUtil.rpc(commentCommand, [commentPostCommand,
            market.Identity.id,
            CommentCategory.LISTINGITEM_QUESTION_AND_ANSWERS,
            market.receiveAddress,
            listingItem.hash,
            'Comment Message'
        ]);
        response.expectJson();
        response.expectStatusCode(200);
        const result: any = response.getBody()['result'];
        expect(result.result).toEqual('Sent.');
        sent = result.result === 'Sent.';

        expect(sent).toBeTruthy();

    });

});
