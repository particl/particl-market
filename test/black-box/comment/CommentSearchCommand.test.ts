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
    const commentSearchCommand = Commands.COMMENT_SEARCH.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;

    let createdListingItemHash;

    let createdCommentPrivateChat: resources.Comment;
    let createdCommentListingItemQandA: resources.Comment;

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
            false,
            CommentType.LISTINGITEM_QUESTION_AND_ANSWERS,
            defaultProfile.address, // sender
            createdListingItemHash // target
        ]).toParamsArray();

        const commentsQandA = await testUtil.generateData(
            CreatableModel.COMMENT,     // what to generate
            1,                      // how many to generate
            true,                // return model
            generateCommentParamsQandA           // what kind of data to generate
        );
        createdCommentListingItemQandA = commentsQandA[0];

        const generateCommentParamsPrivateChat = new GenerateCommentParams([
            false,
            false,
            false,
            CommentType.PRIVATE_CHAT,
            defaultProfile.address, // sender
            defaultProfile.address // target
        ]).toParamsArray();

        const commentsPrivateChat = await testUtil.generateData(
            CreatableModel.COMMENT,     // what to generate
            1,                      // how many to generate
            true,                // return model
            generateCommentParamsPrivateChat     // what kind of data to generate
        );
        createdCommentPrivateChat = commentsPrivateChat[0];
    });

    // TODO: Negative tests
    // TODO: More thorough testing (especially with orderField)

    test('Should search for a comment of type PRIVATE_CHAT', async () => {
        const response2: any = await testUtil.rpc(commentCommand, [
            commentSearchCommand,
            createdCommentListingItemQandA.marketId,
            0,
            10,
            SearchOrder.DESC,
            'posted_at',
            CommentType.PRIVATE_CHAT
            // TODO: test final search arg
        ]);
        response2.expectJson();
        response2.expectStatusCode(200);
        const result2: any = response2.getBody()['result'];
        expect(result2.length).toBe(1);
        const comment = result2[0];

        // throw new MessageException('createdCommentPrivateChat = ' + JSON.stringify(createdCommentPrivateChat, null, 2))

        expect(comment.Market.id).toBe(createdCommentPrivateChat.marketId);
        expect(comment.sender).toBe(createdCommentPrivateChat.sender);
        expect(comment.target).toBe(createdCommentPrivateChat.target);
        expect(comment.receiver).toBe(createdCommentPrivateChat.receiver);
        expect(comment.message).toBe(createdCommentPrivateChat.message);
        expect(comment.type).toBe(createdCommentPrivateChat.type);
        expect(comment.hash).toBe(createdCommentPrivateChat.hash);
    });

    test('Should search for a comment of type LISTINGITEM_QUESTION_AND_ANSWERS', async () => {
        const response2: any = await testUtil.rpc(commentCommand, [
            commentSearchCommand,
            createdCommentPrivateChat.marketId,
            0,
            10,
            SearchOrder.DESC,
            'posted_at',
            CommentType.LISTINGITEM_QUESTION_AND_ANSWERS
            // TODO: test final search arg
        ]);
        response2.expectJson();
        response2.expectStatusCode(200);
        const result2: any = response2.getBody()['result'];
        expect(result2.length).toBe(1);
        const comment = result2[0];

        expect(comment.Market.id).toBe(createdCommentListingItemQandA.marketId);
        expect(comment.sender).toBe(createdCommentListingItemQandA.sender);
        expect(comment.target).toBe(createdCommentListingItemQandA.target);
        expect(comment.receiver).toBe(createdCommentListingItemQandA.receiver);
        expect(comment.message).toBe(createdCommentListingItemQandA.message);
        expect(comment.type).toBe(createdCommentListingItemQandA.type);
        expect(comment.hash).toBe(createdCommentListingItemQandA.hash);
    });
});
