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

        expect(sent).toBeTruthy();

        // wait for some time to make sure vote is received
        // await testUtil.waitFor(5);

        const response2: any = await testUtil.rpc(commentCommand, [
            commentSearchCommand,
            defaultMarket.id,
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

        expect(comment.Market.id).toBe(defaultMarket.id);
        expect(comment.sender).toBe(defaultProfile.address);
        expect(comment.receiver).toBe(defaultProfile.address);
        expect(comment.target).toBe('N/A');
        expect(comment.message).toBe(commentMessagePrivateChat);
        expect(comment.type).toBe(CommentType.PRIVATE_CHAT);
    });

    // TODO: Negative tests

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

        expect(sent).toBeTruthy();

        // wait for some time to make sure vote is received
        // await testUtil.waitFor(5);

        const response2: any = await testUtil.rpc(commentCommand, [
            commentSearchCommand,
            defaultMarket.id,
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

        expect(comment.Market.id).toBe(defaultMarket.id);
        expect(comment.sender).toBe(defaultProfile.address);
        expect(comment.target).toBe(createdListingItemHash);
        expect(comment.receiver).toBe(defaultMarket.address);
        expect(comment.message).toBe(commentMessageListingItemQandA);
        expect(comment.type).toBe(CommentType.LISTINGITEM_QUESTION_AND_ANSWERS);
    });
});
