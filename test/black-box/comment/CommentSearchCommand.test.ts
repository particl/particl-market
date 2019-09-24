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
import { SearchOrder } from '../../../src/api/enums/SearchOrder';
import { GenerateCommentParams } from '../../../src/api/requests/testdata/GenerateCommentParams';
import { CommentSearchOrderField } from '../../../src/api/enums/SearchOrderField';

describe('VoteGetCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const commentCommand = Commands.COMMENT_ROOT.commandName;
    const commentSearchCommand = Commands.COMMENT_SEARCH.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;

    let createdListingItemHash;

    let createdCommentListingItemQandA;

    const numPerPage = 10;
    const numGeneratedComments = 7;
    const searchResultSize = (numGeneratedComments < numPerPage ? numGeneratedComments : numPerPage);

    beforeAll(async () => {
        await testUtil.cleanDb();

        // get default Profile and Market
        defaultProfile = await testUtil.getDefaultProfile();
        defaultMarket = await testUtil.getDefaultMarket();

        // create ListingItem
        const generateListingItemParams = new GenerateListingItemParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            true,   // generateShippingDestinations
            false,  // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            false   // generateListingItemObjects
        ]).toParamsArray();

        const listingItems = await testUtil.generateData(
            CreatableModel.LISTINGITEM,     // what to generate
            1,                              // how many to generate
            true,                           // return model
            generateListingItemParams       // what kind of data to generate
        );
        createdListingItemHash = listingItems[0].hash;

        const generateCommentParamsQandA = new GenerateCommentParams([
            false,
            false,
            false,
            defaultProfile.address,                         // sender
            defaultMarket.address,                          // receiver
            CommentType.LISTINGITEM_QUESTION_AND_ANSWERS,   // type
            createdListingItemHash                          // target
        ]).toParamsArray();

        createdCommentListingItemQandA = await testUtil.generateData(
            CreatableModel.COMMENT,         // what to generate
            numGeneratedComments,           // how many to generate
            true,                           // return model
            generateCommentParamsQandA      // what kind of data to generate
        ) as resources.Comment[];

    });

    // TODO: Negative tests
    // TODO: More thorough testing (especially with orderField)

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
            0,
            10,
            SearchOrder.DESC,
            CommentSearchOrderField.MESSAGE,
            CommentType.LISTINGITEM_QUESTION_AND_ANSWERS,
            createdListingItemHash,
            false
        ]);
        response2.expectJson();
        response2.expectStatusCode(200);
        const result2: any = response2.getBody()['result'];
        expect(result2.length).toBe(searchResultSize);

        for (let i = 0; i < searchResultSize; ++i) {
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
            0,
            10,
            SearchOrder.ASC,
            CommentSearchOrderField.MESSAGE,
            CommentType.LISTINGITEM_QUESTION_AND_ANSWERS,
            createdListingItemHash,
            false
        ]);
        response3.expectJson();
        response3.expectStatusCode(200);
        const result3: any = response3.getBody()['result'];
        expect(result3.length).toBe(searchResultSize);

        for (let i = 0; i < searchResultSize; ++i) {
            const j = createdCommentListingItemQandA.length - i - 1;
            expect(result3[i].sender).toBe(createdCommentListingItemQandA[j].sender);
            expect(result3[i].target).toBe(createdCommentListingItemQandA[j].target);
            expect(result3[i].receiver).toBe(createdCommentListingItemQandA[j].receiver);
            expect(result3[i].message).toBe(createdCommentListingItemQandA[j].message);
            expect(result3[i].type).toBe(createdCommentListingItemQandA[j].type);
            expect(result3[i].hash).toBe(createdCommentListingItemQandA[j].hash);
        }
    });
});
