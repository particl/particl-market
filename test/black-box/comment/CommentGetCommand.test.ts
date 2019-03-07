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

describe('VoteGetCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const commentCommand = Commands.COMMENT_ROOT.commandName;
    const commentGetCommand = Commands.COMMENT_GET.commandName;
    const commentPostCommand = Commands.COMMENT_POST.commandName;

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
    });

    test('Should fail to return a Comment because invalid id', async () => {
        const invalidId = -1;
        const response: any = await testUtil.rpc(commentCommand, [
            commentGetCommand,
            invalidId
        ]);
        response.expectJson();
        response.expectStatusCode(404);
        expect(response.error.error.message).toBe(new NotFoundException(invalidId).getMessage());
    });

    test('Should fail to return a Comment because null id', async () => {
        const invalidId = null;
        const response: any = await testUtil.rpc(commentCommand, [
            commentGetCommand,
            invalidId
        ]);
        response.expectJson();
        response.expectStatusCode(404);
        expect(response.error.error.message).toBe(new NotFoundException(invalidId).getMessage());
    });

    test('Should fail to return a Comment because non-existent id', async () => {
        const nonExistentId = 1;
        const response: any = await testUtil.rpc(commentCommand, [
            commentGetCommand,
            nonExistentId
        ]);
        response.expectJson();
        response.expectStatusCode(404);
        expect(response.error.error.message).toBe(new NotFoundException(nonExistentId).getMessage());
    });

    test('Should fail to return a Comment because non-existent hash', async () => {
        const invalidHash = 'THIS_ISNT_OUR_HASH';
        const response: any = await testUtil.rpc(commentCommand, [
            commentGetCommand,
            invalidHash
        ]);
        response.expectJson();
        response.expectStatusCode(404);
        expect(response.error.error.message).toBe(new NotFoundException(invalidHash).getMessage());
    });

    test('Should create a Comment of type PRIVATE_CHAT', async () => {
        // post a vote
        const response: any = await testUtil.rpc(commentCommand, [
            commentPostCommand,
            defaultMarket.id,
            defaultProfile.id,
            CommentType.PRIVATE_CHAT,
            defaultProfile.address,
            commentMessagePrivateChat
        ]);
        response.expectJson();
        response.expectStatusCode(200);
        const result: any = response.getBody()['result'];
        expect(result.result).toEqual('Sent.');
        sent = result.result === 'Sent.';
        createdCommentPrivateChat = result;

        throw new MessageException('ASD ' + JSON.stringify(createdCommentPrivateChat, null, 2))

        expect(sent).toBeTruthy();
    });

    test('Should create a Comment of type LISTINGITEM_QUESTION_AND_ANSWERS', async () => {
        // post a vote
        const response: any = await testUtil.rpc(commentCommand, [
            commentPostCommand,
            defaultMarket.id,
            defaultProfile.id,
            CommentType.LISTINGITEM_QUESTION_AND_ANSWERS,
            createdListingItemHash,
            commentMessageListingItemQandA
        ]);
        response.expectJson();
        response.expectStatusCode(200);
        const result: any = response.getBody()['result'];
        expect(result.result).toEqual('Sent.');
        sent = result.result === 'Sent.';
        createdCommentListingItemQandA = result;

        expect(sent).toBeTruthy();

        // wait for some time to make sure vote is received
        await testUtil.waitFor(5);
    });

    test('Should return a Comment specified by id', async () => {
        // comment get (<commentId> | <commendHash>)
        const response = await testUtil.rpc(
            commentCommand,
            [commentGetCommand, createdCommentPrivateChat.id]
        );
        response.expectJson();
        response.expectStatusCode(200);
        const comment: resources.Vote = response.getBody()['result'];
        throw new MessageException('comment = ' + JSON.stringify(comment, null, 2));
    });

    test('Should return a PRIVATE_CHAT Comment specified by id', async () => {
        // comment get (<commentId> | <commendHash>)
        const response = await testUtil.rpc(
            commentCommand,
            [commentGetCommand, defaultMarket.id, createdCommentPrivateChat.hash]
        );
        response.expectJson();
        response.expectStatusCode(200);
        const comment: resources.Vote = response.getBody()['result'];
        throw new MessageException('comment = ' + JSON.stringify(comment, null, 2));
    });

    /*test('Should return a PRIVATE_CHAT Vote specified by id', async () => {
        // comment get (<commentId> | <commendHash>)
        const response = await testUtil.rpcWaitFor(
            commentCommand,
            [commentGetCommand, createdCommentPrivateChat.id],
            8 * 60,
            200,
            'Comment.hash',
            createdCommentPrivateChat.hash
        );
        response.expectJson();
        response.expectStatusCode(200);
        const comment: resources.Vote = response.getBody()['result'];
        throw new MessageException('comment = ' + JSON.stringify(comment, null, 2));
    });*/
});
