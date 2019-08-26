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
import { GenerateCommentParams } from '../../../src/api/requests/testdata/GenerateCommentParams';
import { GenerateListingItemParams } from '../../../src/api/requests/testdata/GenerateListingItemParams';
import {ModelNotFoundException} from '../../../src/api/exceptions/ModelNotFoundException';
import {MissingParamException} from '../../../src/api/exceptions/MissingParamException';
import {InvalidParamException} from '../../../src/api/exceptions/InvalidParamException';

describe('CommentGetCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const commentCommand = Commands.COMMENT_ROOT.commandName;
    const commentCountCommand = Commands.COMMENT_COUNT.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;

    let createdListingItemHash;

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
            false,  // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            false   // generateListingItemObjects
        ]).toParamsArray();

        // create listing item for testing
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

        const commentsQandA = await testUtil.generateData(
            CreatableModel.COMMENT,     // what to generate
            1,                  // how many to generate
            true,            // return model
            generateCommentParamsQandA  // what kind of data to generate
        );
        createdCommentListingItemQandA = commentsQandA[0];

    });

    test('Should fail to return a number of Comments because missing type', async () => {
        // comment get (<commentId> | <commendHash>)
        const response = await testUtil.rpc(commentCommand, [commentCountCommand]);
        response.expectJson();
        response.expectStatusCode(404);
        expect(response.error.error.message).toBe(new MissingParamException('type').getMessage());
    });

    test('Should fail to return a number of Comments because missing target', async () => {
        // comment get (<commentId> | <commendHash>)
        const response = await testUtil.rpc(commentCommand, [commentCountCommand,
                CommentType.LISTINGITEM_QUESTION_AND_ANSWERS
            ]
        );
        response.expectJson();
        response.expectStatusCode(404);
        expect(response.error.error.message).toBe(new MissingParamException('target').getMessage());
    });

    test('Should fail to return a number of Comments because invalid type', async () => {
        // comment get (<commentId> | <commendHash>)
        const response = await testUtil.rpc(commentCommand, [commentCountCommand,
                false,
                createdListingItemHash
            ]
        );
        response.expectJson();
        response.expectStatusCode(400);
        expect(response.error.error.message).toBe(new InvalidParamException('type', 'CommentType').getMessage());
    });

    test('Should fail to return a number of Comments because invalid target', async () => {
        // comment get (<commentId> | <commendHash>)
        const response = await testUtil.rpc(commentCommand, [commentCountCommand,
                CommentType.LISTINGITEM_QUESTION_AND_ANSWERS,
                false
            ]
        );
        response.expectJson();
        response.expectStatusCode(400);
        expect(response.error.error.message).toBe(new InvalidParamException('target', 'string').getMessage());
    });

    test('Should fail to return a number of Comments because invalid parentHash', async () => {
        // comment get (<commentId> | <commendHash>)
        const response = await testUtil.rpc(commentCommand, [commentCountCommand,
                CommentType.LISTINGITEM_QUESTION_AND_ANSWERS,
                createdListingItemHash,
                false
            ]
        );
        response.expectJson();
        response.expectStatusCode(400);
        expect(response.error.error.message).toBe(new InvalidParamException('parentHash', 'string').getMessage());
    });

    test('Should return a number of Comments for type and target', async () => {
        const response = await testUtil.rpc(
            commentCommand, [commentCountCommand,
                CommentType.LISTINGITEM_QUESTION_AND_ANSWERS,
                createdListingItemHash
            ]
        );
        response.expectJson();
        response.expectStatusCode(200);
        const commentCount: number = response.getBody()['result'];

        expect(commentCount).toBe(1);
    });

    // TODO: add test with parentHash

});
