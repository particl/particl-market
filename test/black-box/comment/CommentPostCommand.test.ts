// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { CommentType } from '../../../src/api/enums/CommentType';
import { GenerateListingItemParams } from '../../../src/api/requests/testdata/GenerateListingItemParams';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { SearchOrder } from '../../../src/api/enums/SearchOrder';
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';

describe('CommentPostCommand', () => {
    // TODO: Test with multiple instances, sender / receiver, local / remote

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const commentCommand = Commands.COMMENT_ROOT.commandName;
    const commentPostCommand = Commands.COMMENT_POST.commandName;
    const commentSearchCommand = Commands.COMMENT_SEARCH.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;

    let createdListingItemHash;

    let sent = false;

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
            1,                              // how many to generate
            true,                           // return model
            generateListingItemParams       // what kind of data to generate
        );
        createdListingItemHash = listingItems[0].hash;
    });

    test('Should fail to create a Comment of type LISTINGITEM_QUESTION_AND_ANSWERS because invalid profileId', async () => {
        const invalidProfileId = -1;
        // post a comment
        const response: any = await testUtil.rpc(commentCommand, [
            commentPostCommand,
            invalidProfileId,
            defaultMarket.receiveAddress,
            CommentType.LISTINGITEM_QUESTION_AND_ANSWERS,
            createdListingItemHash,
            'Invalid profile id'
        ]);
        response.expectJson();
        response.expectStatusCode(404);
        expect(response.error.error.message).toBe(new ModelNotFoundException('Profile').getMessage());
    });

    test('Should fail to create a Comment of type LISTINGITEM_QUESTION_AND_ANSWERS because invalid profileId', async () => {
        const invalidProfileId = 99;
        // post a comment
        const response: any = await testUtil.rpc(commentCommand, [
            commentPostCommand,
            invalidProfileId,
            defaultMarket.receiveAddress,
            CommentType.LISTINGITEM_QUESTION_AND_ANSWERS,
            createdListingItemHash,
            'Invalid profile id'
        ]);
        response.expectJson();
        response.expectStatusCode(404);
        expect(response.error.error.message).toBe(new ModelNotFoundException('Profile').getMessage());
    });

    test('Should fail to create a Comment of type LISTINGITEM_QUESTION_AND_ANSWERS because invalid profileId', async () => {
        const invalidProfileId = 'INVALID_PROFILE_ID';
        // post a comment
        const response: any = await testUtil.rpc(commentCommand, [
            commentPostCommand,
            invalidProfileId,
            defaultMarket.receiveAddress,
            CommentType.LISTINGITEM_QUESTION_AND_ANSWERS,
            createdListingItemHash,
            'Invalid profile id'
        ]);
        response.expectJson();
        response.expectStatusCode(400);
        expect(response.error.error.message).toBe(new InvalidParamException('profileId', 'number').getMessage());
    });


    test('Should fail to create a Comment of type LISTINGITEM_QUESTION_AND_ANSWERS because invalid profileId', async () => {
        const invalidProfileId = null;
        // post a comment
        const response: any = await testUtil.rpc(commentCommand, [
            commentPostCommand,
            invalidProfileId,
            defaultMarket.receiveAddress,
            CommentType.LISTINGITEM_QUESTION_AND_ANSWERS,
            createdListingItemHash,
            'Invalid profile id'
        ]);
        response.expectJson();
        response.expectStatusCode(400);
        expect(response.error.error.message).toBe(new InvalidParamException('profileId', 'number').getMessage());
    });

    test('Should fail to create a Comment of type LISTINGITEM_QUESTION_AND_ANSWERS because invalid type', async () => {
        const invalidCommentType = 'INVALID_COMMENT_TYPE';
        // post a comment
        const response: any = await testUtil.rpc(commentCommand, [
            commentPostCommand,
            defaultProfile.id,
            defaultMarket.receiveAddress,
            invalidCommentType,
            createdListingItemHash,
            'Invalid comment type'
        ]);
        response.expectJson();
        response.expectStatusCode(400);
        expect(response.error.error.message).toBe(new InvalidParamException('type', 'CommentType').getMessage());
    });

    test('Should fail to create a Comment of type LISTINGITEM_QUESTION_AND_ANSWERS because invalid type', async () => {
        const invalidCommentType = -1;
        // post a comment
        const response: any = await testUtil.rpc(commentCommand, [
            commentPostCommand,
            defaultProfile.id,
            defaultMarket.receiveAddress,
            invalidCommentType,
            createdListingItemHash,
            'Invalid comment type'
        ]);
        response.expectJson();
        response.expectStatusCode(400);
        expect(response.error.error.message).toBe(new InvalidParamException('type', 'CommentType').getMessage());
    });

    test('Should fail to create a Comment of type LISTINGITEM_QUESTION_AND_ANSWERS because invalid type', async () => {
        const invalidCommentType = 1;
        // post a comment
        const response: any = await testUtil.rpc(commentCommand, [
            commentPostCommand,
            defaultProfile.id,
            defaultMarket.receiveAddress,
            invalidCommentType,
            createdListingItemHash,
            'Invalid comment type'
        ]);
        response.expectJson();
        response.expectStatusCode(400);
        expect(response.error.error.message).toBe(new InvalidParamException('type', 'CommentType').getMessage());
    });

    test('Should fail to create a Comment of type LISTINGITEM_QUESTION_AND_ANSWERS because invalid type', async () => {
        const invalidCommentType = null;
        // post a comment
        const response: any = await testUtil.rpc(commentCommand, [
            commentPostCommand,
            defaultProfile.id,
            defaultMarket.receiveAddress,
            invalidCommentType,
            createdListingItemHash,
            'Invalid comment type'
        ]);
        response.expectJson();
        response.expectStatusCode(400);
        expect(response.error.error.message).toBe(new InvalidParamException('type', 'CommentType').getMessage());
    });

    test('Should fail to create a Comment of type LISTINGITEM_QUESTION_AND_ANSWERS because invalid target', async () => {
        const invalidTarget = -1;
        // post a comment
        const response: any = await testUtil.rpc(commentCommand, [
            commentPostCommand,
            defaultProfile.id,
            defaultMarket.receiveAddress,
            CommentType.LISTINGITEM_QUESTION_AND_ANSWERS,
            invalidTarget,
            'Invalid comment target'
        ]);
        response.expectJson();
        response.expectStatusCode(400);
        expect(response.error.error.message).toBe(new InvalidParamException('target', 'string').getMessage());
    });

    test('Should fail to create a Comment of type LISTINGITEM_QUESTION_AND_ANSWERS because invalid target', async () => {
        const invalidTarget = 1;
        // post a comment
        const response: any = await testUtil.rpc(commentCommand, [
            commentPostCommand,
            defaultProfile.id,
            defaultMarket.receiveAddress,
            CommentType.LISTINGITEM_QUESTION_AND_ANSWERS,
            invalidTarget,
            'Invalid comment target'
        ]);
        response.expectJson();
        response.expectStatusCode(400);
        expect(response.error.error.message).toBe(new InvalidParamException('target', 'string').getMessage());
    });

    test('Should fail to create a Comment of type LISTINGITEM_QUESTION_AND_ANSWERS because invalid target', async () => {
        const invalidTarget = null;
        // post a comment
        const response: any = await testUtil.rpc(commentCommand, [
            commentPostCommand,
            defaultProfile.id,
            defaultMarket.receiveAddress,
            CommentType.LISTINGITEM_QUESTION_AND_ANSWERS,
            invalidTarget,
            'Invalid comment target'
        ]);
        response.expectJson();
        response.expectStatusCode(400);
        expect(response.error.error.message).toBe(new InvalidParamException('target', 'string').getMessage());
    });

    test('Should fail to create a Comment of type LISTINGITEM_QUESTION_AND_ANSWERS because invalid target', async () => {
        const invalidTarget = 'INVALID_TARGET';
        // post a comment
        const response: any = await testUtil.rpc(commentCommand, [
            commentPostCommand,
            defaultProfile.id,
            defaultMarket.receiveAddress,
            CommentType.LISTINGITEM_QUESTION_AND_ANSWERS,
            invalidTarget,
            'Invalid comment target'
        ]);
        response.expectJson();
        response.expectStatusCode(404);
        expect(response.error.error.message).toBe('Listing Item not found.');
    });

    test('Should fail to create a Comment of type LISTINGITEM_QUESTION_AND_ANSWERS because invalid message', async () => {
        const invalidMessage = -1;
        // post a comment
        const response: any = await testUtil.rpc(commentCommand, [
            commentPostCommand,
            defaultProfile.id,
            defaultMarket.receiveAddress,
            CommentType.LISTINGITEM_QUESTION_AND_ANSWERS,
            createdListingItemHash,
            invalidMessage
        ]);
        response.expectJson();
        response.expectStatusCode(400);
        expect(response.error.error.message).toBe(new InvalidParamException('message', 'string').getMessage());
    });

    test('Should fail to create a Comment of type LISTINGITEM_QUESTION_AND_ANSWERS because invalid message', async () => {
        const invalidMessage = null;
        // post a comment
        const response: any = await testUtil.rpc(commentCommand, [
            commentPostCommand,
            defaultProfile.id,
            defaultMarket.receiveAddress,
            CommentType.LISTINGITEM_QUESTION_AND_ANSWERS,
            createdListingItemHash,
            invalidMessage
        ]);
        response.expectJson();
        response.expectStatusCode(400);
        expect(response.error.error.message).toBe(new InvalidParamException('message', 'string').getMessage());
    });

    test('Should create a Comment of type LISTINGITEM_QUESTION_AND_ANSWERS', async () => {
        // post a comment
        const response: any = await testUtil.rpc(commentCommand, [
            commentPostCommand,
            defaultProfile.id,
            defaultMarket.receiveAddress,
            CommentType.LISTINGITEM_QUESTION_AND_ANSWERS,
            createdListingItemHash,
            'Comment Message'
        ]);
        response.expectJson();
        response.expectStatusCode(200);
        const result: any = response.getBody()['result'];
        expect(result.result).toEqual('Sent.');
        sent = result.result === 'Sent.';

        expect(sent).toBeTruthy();

        // wait for some time to make sure vote is received
        await testUtil.waitFor(5);

        const response2: any = await testUtil.rpc(commentCommand, [
            commentSearchCommand,
            0,
            10,
            SearchOrder.DESC,
            'posted_at',
            CommentType.LISTINGITEM_QUESTION_AND_ANSWERS,
            createdListingItemHash,
            false
        ]);
        response2.expectJson();
        response2.expectStatusCode(200);
        const result2: any = response2.getBody()['result'];
        expect(result2.length).toBe(1);
        const comment = result2[0];

        expect(comment.sender).toBe(defaultProfile.address);
        expect(comment.receiver).toBe(defaultMarket.receiveAddress);
        expect(comment.target).toBe(createdListingItemHash);
        expect(comment.message).toBe('Comment Message');
        expect(comment.type).toBe(CommentType.LISTINGITEM_QUESTION_AND_ANSWERS);
    });

});
