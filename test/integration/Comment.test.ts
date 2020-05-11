// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Targets, Types } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { CommentService } from '../../src/api/services/model/CommentService';
import { CommentCreateRequest } from '../../src/api/requests/model/CommentCreateRequest';
import { CommentUpdateRequest } from '../../src/api/requests/model/CommentUpdateRequest';
import { CommentType } from '../../src/api/enums/CommentType';
import { ProfileService } from '../../src/api/services/model/ProfileService';
import { MarketService } from '../../src/api/services/model/MarketService';
import { ConfigurableHasher } from 'omp-lib/dist/hasher/hash';
import { HashableCommentCreateRequestConfig } from '../../src/api/factories/hashableconfig/createrequest/HashableCommentCreateRequestConfig';

describe('Comment', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let commentService: CommentService;
    let profileService: ProfileService;
    let marketService: MarketService;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;
    let createdComment: resources.Comment;


    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        commentService = app.IoC.getNamed<CommentService>(Types.Service, Targets.Service.model.CommentService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        // get default profile and market
        defaultProfile = await profileService.getDefault().then(value => value.toJSON());
        defaultMarket = await marketService.getDefaultForProfile(defaultProfile.id).then(value => value.toJSON());

    });

    afterAll(async () => {
        //
    });

    test('Should throw ValidationException because we want to create a empty Comment', async () => {
        expect.assertions(1);
        await commentService.create({} as CommentCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new Comment', async () => {

        const testData = {
            sender: defaultProfile.address,
            receiver: defaultMarket.receiveAddress,
            type: CommentType.LISTINGITEM_QUESTION_AND_ANSWERS,
            target: '290be04b41717f4aa4fb27fa83ef16e63aae56bdd060c9bc14efc5cddba3f992',
            message: 'message',
            postedAt: new Date().getTime(),
            receivedAt: new Date().getTime(),
            expiredAt: new Date().getTime() + 1000000
        } as CommentCreateRequest;

        testData.hash = ConfigurableHasher.hash(testData, new HashableCommentCreateRequestConfig());

        createdComment = await commentService.create(testData)
            .then(value => value.toJSON());
        const result: resources.Comment = createdComment;

        // todo: write tests for comments having parent comments
        expect(result.sender).toBe(testData.sender);
        expect(result.receiver).toBe(testData.receiver);
        expect(result.target).toBe(testData.target);
        expect(result.message).toBe(testData.message);
        expect(result.type).toBe(testData.type);
        expect(result.postedAt).toBe(testData.postedAt);
        expect(result.receivedAt).toBe(testData.receivedAt);
        expect(result.expiredAt).toBe(testData.expiredAt);
    });

    test('Should list Comments with our new create one', async () => {

        const comments: resources.Comment[] = await commentService.findAll()
            .then(value => value.toJSON());
        expect(comments.length).toBe(1);

        const result: resources.Comment = comments[0];
        log.debug('result: ', JSON.stringify(result, null, 2));

        expect(result.hash).toBe(createdComment.hash);
        expect(result.sender).toBe(createdComment.sender);
        expect(result.receiver).toBe(createdComment.receiver);
        expect(result.target).toBe(createdComment.target);
        expect(result.message).toBe(createdComment.message);
        expect(result.type).toBe(createdComment.type);
        expect(result.postedAt).toBe(createdComment.postedAt);
        expect(result.receivedAt).toBe(createdComment.receivedAt);
        expect(result.expiredAt).toBe(createdComment.expiredAt);
    });

    test('Should return one Comment', async () => {
        const result: resources.Comment = await commentService.findOne(createdComment.id)
            .then(value => value.toJSON());

        expect(result.sender).toBe(createdComment.sender);
        expect(result.receiver).toBe(createdComment.receiver);
        expect(result.target).toBe(createdComment.target);
        expect(result.message).toBe(createdComment.message);
        expect(result.type).toBe(createdComment.type);
        expect(result.postedAt).toBe(createdComment.postedAt);
        expect(result.receivedAt).toBe(createdComment.receivedAt);
        expect(result.expiredAt).toBe(createdComment.expiredAt);
    });

    test('Should update the Comment', async () => {
        const testDataUpdated = {
            sender: 'update',
            receiver: 'update',
            target: 'update',
            message: 'update',
        } as CommentUpdateRequest;

        const result: resources.Comment = await commentService.update(createdComment.id, testDataUpdated)
            .then(value => value.toJSON());

        expect(result.sender).toBe(testDataUpdated.sender);
        expect(result.receiver).toBe(testDataUpdated.receiver);
        expect(result.target).toBe(testDataUpdated.target);
        expect(result.message).toBe(testDataUpdated.message);
        expect(result.type).toBe(createdComment.type);
        expect(result.postedAt).toBe(createdComment.postedAt);
        expect(result.receivedAt).toBe(createdComment.receivedAt);
        expect(result.expiredAt).toBe(createdComment.expiredAt);
    });

    test('Should delete the Comment', async () => {
        expect.assertions(1);
        await commentService.destroy(createdComment.id);
        await commentService.findOne(createdComment.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdComment.id))
        );
    });

});
