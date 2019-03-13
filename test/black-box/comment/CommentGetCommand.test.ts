// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateProposalParams } from '../../../src/api/requests/params/GenerateProposalParams';
import {CommentType} from '../../../src/api/enums/CommentType';
import {GenerateListingItemParams} from '../../../src/api/requests/params/GenerateListingItemParams';
import {MessageException} from '../../../src/api/exceptions/MessageException';
import {NotFoundException} from '../../../src/api/exceptions/NotFoundException';
import {InvalidParamException} from '../../../src/api/exceptions/InvalidParamException';
import {SearchOrder} from '../../../src/api/enums/SearchOrder';
import {GenerateCommentParams} from '../../../src/api/requests/params/GenerateCommentParams';

describe('VoteGetCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const commentCommand = Commands.COMMENT_ROOT.commandName;
    const commentGetCommand = Commands.COMMENT_GET.commandName;
    const commentPostCommand = Commands.COMMENT_POST.commandName;
    const commentSearchCommand = Commands.COMMENT_SEARCH.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;

    let createdListingItemHash;

    let createdCommentPrivateChat: resources.Comment;
    let createdCommentListingItemQandA: resources.Comment;

    let sent = false;

    const commentMessagePrivateChat = 'TEST_PRIVATE_CHAT_#1';
    const commentMessageListingItemQandA = 'TEST_LISTING_ITEM_QANDA_#1';


    beforeAll(async () => {
        await testUtil.cleanDb();

        // get default profile and market
        defaultProfile = await testUtil.getDefaultProfile();
        defaultMarket = await testUtil.getDefaultMarket();

        // create listing item
        const generateListingItemParams = new GenerateListingItemParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            true,   // generateShippingDestinations
            false,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            false    // generateListingItemObjects
        ]).toParamsArray();

        // create listing item for testing
        const listingItems = await testUtil.generateData(
            CreatableModel.LISTINGITEM,     // what to generate
            1,                      // how many to generate
            true,                // return model
            generateListingItemParams           // what kind of data to generate
        );
        createdListingItemHash = listingItems[0].hash;

        const generateCommentParamsQandA = new GenerateCommentParams([
            false,
            false,
            createdListingItemHash,
            false,
            CommentType.LISTINGITEM_QUESTION_AND_ANSWERS,
            defaultProfile.address,
            defaultProfile.address
        ]).toParamsArray();

        const commentsQandA = await testUtil.generateData(
            CreatableModel.COMMENT,     // what to generate
            1,                      // how many to generate
            true,                // return model
            generateCommentParamsQandA           // what kind of data to generate
        );
        createdCommentPrivateChat = commentsQandA[0];

        const generateCommentParamsPrivateChat = new GenerateCommentParams([
            false,
            false,
            null,
            false,
            CommentType.PRIVATE_CHAT,
            defaultProfile.address,
            defaultProfile.address
        ]).toParamsArray();

        const commentsPrivateChat = await testUtil.generateData(
            CreatableModel.COMMENT,     // what to generate
            1,                      // how many to generate
            true,                // return model
            generateCommentParamsPrivateChat     // what kind of data to generate
        );
        createdCommentPrivateChat = commentsPrivateChat[0];
    });

    test('Should fail to return a Comment because invalid marketId', async () => {
        const invalidId = -1;
        const response: any = await testUtil.rpc(commentCommand, [
            commentGetCommand,
            invalidId
        ]);
        response.expectJson();
        response.expectStatusCode(404);
        expect(response.error.error.message).toBe(new NotFoundException(invalidId).getMessage());
    });

    test('Should fail to return a Comment because null marketId', async () => {
        const invalidId = null;
        const response: any = await testUtil.rpc(commentCommand, [
            commentGetCommand,
            invalidId
        ]);
        response.expectJson();
        response.expectStatusCode(404);
        expect(response.error.error.message).toBe(new InvalidParamException('commentId|marketId', 'number').getMessage());
    });

    test('Should fail to return a Comment because non-existent marketId', async () => {
        const nonExistentId = 1;
        const response: any = await testUtil.rpc(commentCommand, [
            commentGetCommand,
            nonExistentId
        ]);
        response.expectJson();
        response.expectStatusCode(404);
        expect(response.error.error.message).toBe(new NotFoundException(nonExistentId).getMessage());
    });

    test('Should fail to return a Comment because invalid id', async () => {
        const invalidId = 'THIS_ISNT_OUR_HASH';
        const response: any = await testUtil.rpc(commentCommand, [
            commentGetCommand,
            invalidId
        ]);
        response.expectJson();
        response.expectStatusCode(404);
        expect(response.error.error.message).toBe(new InvalidParamException('commentId|marketId', 'number').getMessage());
    });

    test('Should fail to return a Comment because non-existent hash', async () => {
        const invalidHash = 'THIS_ISNT_OUR_HASH';
        const response: any = await testUtil.rpc(commentCommand, [
            commentGetCommand,
            defaultMarket.id,
            invalidHash
        ]);
        response.expectJson();
        response.expectStatusCode(404);
        expect(response.error.error.message).toBe(new NotFoundException(invalidHash).getMessage());
    });

    test('Should return a PRIVATE_CHAT Comment specified by id', async () => {
        // comment get (<commentId> | <commendHash>)
        const response = await testUtil.rpc(
            commentCommand,
            [commentGetCommand, createdCommentPrivateChat.id]
        );
        response.expectJson();
        response.expectStatusCode(200);
        const comment: resources.Comment = response.getBody()['result'];

        expect(comment.Market.id).toBe(createdCommentPrivateChat.id);
        expect(comment.sender).toBe(createdCommentPrivateChat.sender);
        expect(comment.target).toBe(createdCommentPrivateChat.target);
        expect(comment.receiver).toBe(createdCommentPrivateChat.receiver);
        expect(comment.message).toBe(createdCommentPrivateChat.message);
        expect(comment.type).toBe(createdCommentPrivateChat.type);
        expect(comment.hash).toBe(createdCommentPrivateChat.hash);
    });

    test('Should return a PRIVATE_CHAT Comment specified by id', async () => {
        // comment get (<commentId> | <commendHash>)
        const response = await testUtil.rpc(
            commentCommand,
            [commentGetCommand, defaultMarket.id, createdCommentPrivateChat.hash]
        );
        response.expectJson();
        response.expectStatusCode(200);
        const comment: resources.comment = response.getBody()['result'];

        expect(comment.Market.id).toBe(createdCommentPrivateChat.id);
        expect(comment.sender).toBe(createdCommentPrivateChat.sender);
        expect(comment.target).toBe(createdCommentPrivateChat.target);
        expect(comment.receiver).toBe(createdCommentPrivateChat.receiver);
        expect(comment.message).toBe(createdCommentPrivateChat.message);
        expect(comment.type).toBe(createdCommentPrivateChat.type);
        expect(comment.hash).toBe(createdCommentPrivateChat.hash);
    });

    test('Should return a LISTINGITEM_QUESTION_AND_ANSWERS Comment specified by id', async () => {
        // comment get (<commentId> | <commendHash>)
        const response = await testUtil.rpc(
            commentCommand,
            [commentGetCommand, createdCommentListingItemQandA.id]
        );
        response.expectJson();
        response.expectStatusCode(200);
        const comment: resources.Comment = response.getBody()['result'];

        expect(comment.Market.id).toBe(createdCommentListingItemQandA.id);
        expect(comment.sender).toBe(createdCommentListingItemQandA.sender);
        expect(comment.target).toBe(createdCommentListingItemQandA.target);
        expect(comment.receiver).toBe(createdCommentListingItemQandA.receiver);
        expect(comment.message).toBe(createdCommentListingItemQandA.message);
        expect(comment.type).toBe(createdCommentListingItemQandA.type);
        expect(comment.hash).toBe(createdCommentListingItemQandA.hash);
    });

    test('Should return a LISTINGITEM_QUESTION_AND_ANSWERS Comment specified by id', async () => {
        // comment get (<commentId> | <commendHash>)
        const response = await testUtil.rpc(
            commentCommand,
            [commentGetCommand, defaultMarket.id, createdCommentListingItemQandA.hash]
        );
        response.expectJson();
        response.expectStatusCode(200);
        const comment: resources.comment = response.getBody()['result'];

        expect(comment.Market.id).toBe(createdCommentListingItemQandA.id);
        expect(comment.sender).toBe(createdCommentListingItemQandA.sender);
        expect(comment.target).toBe(createdCommentListingItemQandA.target);
        expect(comment.receiver).toBe(createdCommentListingItemQandA.receiver);
        expect(comment.message).toBe(createdCommentListingItemQandA.message);
        expect(comment.type).toBe(createdCommentListingItemQandA.type);
        expect(comment.hash).toBe(createdCommentListingItemQandA.hash);
    });
});
