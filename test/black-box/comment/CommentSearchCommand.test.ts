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
import {message} from '../../../src/core/api/Validate';

describe('VoteGetCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const commentCommand = Commands.COMMENT_ROOT.commandName;
    const commentSearchCommand = Commands.COMMENT_SEARCH.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;

    let createdListingItemHash;

    let createdCommentPrivateChat;
    let createdCommentListingItemQandA;

    const numPerPage = 10;
    const numGeneratedComments = 7;
    const searchResultSize = (numGeneratedComments < numPerPage ? numGeneratedComments : numPerPage);

    let createdCommentPrivateChatTarget;
    let createdCommentListingItemQandATarget;

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

        createdCommentListingItemQandATarget = createdListingItemHash;
        const generateCommentParamsQandA = new GenerateCommentParams([
            false,
            false,
            false,
            CommentType.LISTINGITEM_QUESTION_AND_ANSWERS,
            defaultProfile.address, // sender
            createdCommentListingItemQandATarget // target
        ]).toParamsArray();

        createdCommentListingItemQandA = await testUtil.generateData(
            CreatableModel.COMMENT,     // what to generate
            numGeneratedComments,                     // how many to generate
            true,                // return model
            generateCommentParamsQandA           // what kind of data to generate
        ) as resources.Comment[];

        createdCommentPrivateChatTarget = 'N/A';
        const generateCommentParamsPrivateChat = new GenerateCommentParams([
            false,
            false,
            false,
            CommentType.PRIVATE_CHAT,
            defaultProfile.address, // sender
            // createdCommentPrivateChatTarget // target
        ]).toParamsArray();

        createdCommentPrivateChat = await testUtil.generateData(
            CreatableModel.COMMENT,     // what to generate
            numGeneratedComments,                      // how many to generate
            true,                // return model
            generateCommentParamsPrivateChat     // what kind of data to generate
        ) as resources.Comment[];
    });

    // TODO: Negative tests
    // TODO: More thorough testing (especially with orderField)

    test('Should search for a comment of type PRIVATE_CHAT DESC', async () => {
        createdCommentPrivateChat.sort((a: resources.Comment, b: resources.Comment) => {
            if (a.message <= b.message) {
                return 1;
            } else {
                return -1;
            }
        });

        const response2: any = await testUtil.rpc(commentCommand, [
            commentSearchCommand,
            createdCommentPrivateChat[0].marketId,
            0,
            numPerPage,
            SearchOrder.DESC,
            'message',
            CommentType.PRIVATE_CHAT,
            createdCommentPrivateChatTarget
        ]);
        response2.expectJson();
        response2.expectStatusCode(200);
        const result2: any = response2.getBody()['result'];
        expect(result2.length).toBe(searchResultSize);

        for (let i = 0; i < searchResultSize; ++i) {
            expect(result2[i].Market.id).toBe(createdCommentPrivateChat[i].marketId);
            expect(result2[i].sender).toBe(createdCommentPrivateChat[i].sender);
            expect(result2[i].target).toBe(createdCommentPrivateChat[i].target);
            expect(result2[i].receiver).toBe(createdCommentPrivateChat[i].receiver);
            expect(result2[i].message).toBe(createdCommentPrivateChat[i].message);
            expect(result2[i].type).toBe(createdCommentPrivateChat[i].type);
            expect(result2[i].hash).toBe(createdCommentPrivateChat[i].hash);
        }
    });

    test('Should search for a comment of type PRIVATE_CHAT ASC', async () => {
        const response3: any = await testUtil.rpc(commentCommand, [
            commentSearchCommand,
            createdCommentPrivateChat[0].marketId,
            0,
            10,
            SearchOrder.ASC,
            'message',
            CommentType.PRIVATE_CHAT,
            createdCommentPrivateChatTarget
        ]);
        response3.expectJson();
        response3.expectStatusCode(200);
        const result3: any = response3.getBody()['result'];
        expect(result3.length).toBe(searchResultSize);

        for (let i = 0; i < searchResultSize; ++i) {
            const j = createdCommentPrivateChat.length - i - 1;
            expect(result3[i].Market.id).toBe(createdCommentPrivateChat[j].marketId);
            expect(result3[i].sender).toBe(createdCommentPrivateChat[j].sender);
            expect(result3[i].target).toBe(createdCommentPrivateChat[j].target);
            expect(result3[i].receiver).toBe(createdCommentPrivateChat[j].receiver);
            expect(result3[i].message).toBe(createdCommentPrivateChat[j].message);
            expect(result3[i].type).toBe(createdCommentPrivateChat[j].type);
            expect(result3[i].hash).toBe(createdCommentPrivateChat[j].hash);
        }
    });

    test('Should search for a comment of type LISTINGITEM_QUESTION_AND_ANSWERS DESC', async () => {
        createdCommentListingItemQandA.sort((a, b) => {
            if (a.message <= b.message) {
                return 1;
            } else {
                return -1;
            }
        });

        const response2: any = await testUtil.rpc(commentCommand, [
            commentSearchCommand,
            createdCommentListingItemQandA[0].marketId,
            0,
            10,
            SearchOrder.DESC,
            'message',
            CommentType.LISTINGITEM_QUESTION_AND_ANSWERS,
            createdCommentListingItemQandATarget
        ]);
        response2.expectJson();
        response2.expectStatusCode(200);
        const result2: any = response2.getBody()['result'];
        expect(result2.length).toBe(searchResultSize);

        for (let i = 0; i < searchResultSize; ++i) {
            expect(result2[i].Market.id).toBe(createdCommentListingItemQandA[i].marketId);
            expect(result2[i].sender).toBe(createdCommentListingItemQandA[i].sender);
            expect(result2[i].target).toBe(createdCommentListingItemQandA[i].target);
            expect(result2[i].receiver).toBe(createdCommentListingItemQandA[i].receiver);
            expect(result2[i].message).toBe(createdCommentListingItemQandA[i].message);
            expect(result2[i].type).toBe(createdCommentListingItemQandA[i].type);
            expect(result2[i].hash).toBe(createdCommentListingItemQandA[i].hash);
        }
    });

    test('Should search for a comment of type LISTINGITEM_QUESTION_AND_ANSWERS ASC', async () => {
        const response3: any = await testUtil.rpc(commentCommand, [
            commentSearchCommand,
            createdCommentListingItemQandA[0].marketId,
            0,
            10,
            SearchOrder.ASC,
            'message',
            CommentType.LISTINGITEM_QUESTION_AND_ANSWERS,
            createdCommentListingItemQandATarget
        ]);
        response3.expectJson();
        response3.expectStatusCode(200);
        const result3: any = response3.getBody()['result'];
        expect(result3.length).toBe(searchResultSize);

        for (let i = 0; i < searchResultSize; ++i) {
            const j = createdCommentListingItemQandA.length - i - 1;
            expect(result3[i].Market.id).toBe(createdCommentListingItemQandA[j].marketId);
            expect(result3[i].sender).toBe(createdCommentListingItemQandA[j].sender);
            expect(result3[i].target).toBe(createdCommentListingItemQandA[j].target);
            expect(result3[i].receiver).toBe(createdCommentListingItemQandA[j].receiver);
            expect(result3[i].message).toBe(createdCommentListingItemQandA[j].message);
            expect(result3[i].type).toBe(createdCommentListingItemQandA[j].type);
            expect(result3[i].hash).toBe(createdCommentListingItemQandA[j].hash);
        }
    });

    // TODO: test final search arg
});
