// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import * as Faker from 'faker';
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
import { ListingItemTemplateService } from '../../src/api/services/model/ListingItemTemplateService';
import { DefaultMarketService } from '../../src/api/services/DefaultMarketService';
import { CommentSearchParams} from '../../src/api/requests/search/CommentSearchParams';

describe('Comment', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let defaultMarketService: DefaultMarketService;
    let commentService: CommentService;
    let profileService: ProfileService;
    let marketService: MarketService;
    let listingItemTemplateService: ListingItemTemplateService;

    let senderProfile: resources.Profile;
    let senderMarket: resources.Market;
    let receiverProfile: resources.Profile;
    let receiverMarket: resources.Market;

    let listingItem: resources.ListingItem;
    let listingItemTemplate: resources.ListingItemTemplate;

    let comment: resources.Comment;


    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        defaultMarketService = app.IoC.getNamed<DefaultMarketService>(Types.Service, Targets.Service.DefaultMarketService);
        commentService = app.IoC.getNamed<CommentService>(Types.Service, Targets.Service.model.CommentService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);
        listingItemTemplateService = app.IoC.getNamed<ListingItemTemplateService>(Types.Service, Targets.Service.model.ListingItemTemplateService);

        senderProfile = await profileService.getDefault().then(value => value.toJSON());
        senderMarket = await defaultMarketService.getDefaultForProfile(senderProfile.id).then(value => value.toJSON());

        receiverProfile = await testDataService.generateProfile();
        receiverMarket = await defaultMarketService.getDefaultForProfile(receiverProfile.id).then(value => value.toJSON());

        listingItem = await testDataService.generateListingItemWithTemplate(receiverProfile, senderMarket);
        listingItemTemplate = await listingItemTemplateService.findOne(listingItem.ListingItemTemplate.id).then(value => value.toJSON());

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
            msgid: Faker.random.uuid(),
            // parent_comment_id: 1,
            sender: senderMarket.Identity.address,
            receiver: receiverMarket.receiveAddress,
            type: CommentType.LISTINGITEM_QUESTION_AND_ANSWERS + '',
            target: listingItem.hash,
            message: Faker.lorem.paragraph(2),
            postedAt: Date.now(),
            receivedAt: Date.now(),
            expiredAt: Date.now() + 1000000
        } as CommentCreateRequest;

        testData.hash = ConfigurableHasher.hash(testData, new HashableCommentCreateRequestConfig());

        const result: resources.Comment = await commentService.create(testData).then(value => value.toJSON());

        // todo: write tests for comments having parent comments
        expect(result.sender).toBe(testData.sender);
        expect(result.receiver).toBe(testData.receiver);
        expect(result.target).toBe(testData.target);
        expect(result.message).toBe(testData.message);
        expect(result.type).toBe(testData.type);
        expect(result.postedAt).toBe(testData.postedAt);
        expect(result.receivedAt).toBe(testData.receivedAt);
        expect(result.expiredAt).toBe(testData.expiredAt);

        comment = result;
    });

    test('Should create a Comment reply', async () => {

        const testData = {
            msgid: Faker.random.uuid(),
            parent_comment_id: comment.id,
            sender: senderMarket.Identity.address,
            receiver: receiverMarket.receiveAddress,
            type: CommentType.LISTINGITEM_QUESTION_AND_ANSWERS + '',
            target: listingItem.hash,
            message: Faker.lorem.paragraph(2),
            postedAt: Date.now(),
            receivedAt: Date.now(),
            expiredAt: Date.now() + 1000000
        } as CommentCreateRequest;

        testData.hash = ConfigurableHasher.hash({
            ...testData,
            parentCommentHash: comment.hash
        }, new HashableCommentCreateRequestConfig());

        const result: resources.Comment = await commentService.create(testData).then(value => value.toJSON());
        expect(result.ParentComment.id).toBe(comment.id);
    });

    test('Should list all Comments with our new create one', async () => {

        const comments: resources.Comment[] = await commentService.findAll().then(value => value.toJSON());
        expect(comments.length).toBe(2);

        const result: resources.Comment = comments[0];
        expect(result.hash).toBe(comment.hash);
        expect(result.sender).toBe(comment.sender);
        expect(result.receiver).toBe(comment.receiver);
        expect(result.target).toBe(comment.target);
        expect(result.message).toBe(comment.message);
        expect(result.type).toBe(comment.type);
        expect(result.postedAt).toBe(comment.postedAt);
        expect(result.receivedAt).toBe(comment.receivedAt);
        expect(result.expiredAt).toBe(comment.expiredAt);
    });

    test('Should return one Comment', async () => {
        const result: resources.Comment = await commentService.findOne(comment.id).then(value => value.toJSON());

        expect(result.sender).toBe(comment.sender);
        expect(result.receiver).toBe(comment.receiver);
        expect(result.target).toBe(comment.target);
        expect(result.message).toBe(comment.message);
        expect(result.type).toBe(comment.type);
        expect(result.postedAt).toBe(comment.postedAt);
        expect(result.receivedAt).toBe(comment.receivedAt);
        expect(result.expiredAt).toBe(comment.expiredAt);
    });

    test('Should update the Comment', async () => {
        const testDataUpdated = {
            sender: 'update',
            receiver: 'update',
            target: 'update',
            message: 'update'
        } as CommentUpdateRequest;

        const result: resources.Comment = await commentService.update(comment.id, testDataUpdated).then(value => value.toJSON());

        expect(result.sender).toBe(testDataUpdated.sender);
        expect(result.receiver).toBe(testDataUpdated.receiver);
        expect(result.target).toBe(testDataUpdated.target);
        expect(result.message).toBe(testDataUpdated.message);
        expect(result.type).toBe(comment.type);
        expect(result.postedAt).toBe(comment.postedAt);
        expect(result.receivedAt).toBe(comment.receivedAt);
        expect(result.expiredAt).toBe(comment.expiredAt);
    });

    test('Should delete (CASCADE) the Comments', async () => {
        expect.assertions(2);

        await commentService.destroy(comment.id);
        await commentService.findOne(comment.id).catch(e =>
            expect(e).toEqual(new NotFoundException(comment.id))
        );
        const comments: resources.Comment[] = await commentService.findAll().then(value => value.toJSON());
        expect(comments.length).toBe(0);
    });

    test('Should count the messages', async () => {

        const testData = {
            msgid: Faker.random.uuid(),
            // parent_comment_id: 1,
            sender: senderMarket.Identity.address,
            receiver: receiverMarket.receiveAddress,
            type: CommentType.LISTINGITEM_QUESTION_AND_ANSWERS,
            target: listingItem.hash,
            message: Faker.lorem.paragraph(2),
            postedAt: Date.now(),
            receivedAt: Date.now(),
            expiredAt: Date.now() + 1000000
        } as CommentCreateRequest;
        testData.hash = ConfigurableHasher.hash(testData, new HashableCommentCreateRequestConfig());
        comment = await commentService.create(testData).then(value => value.toJSON());

        // reply
        testData.msgid = Faker.random.uuid();
        testData.message = Faker.lorem.paragraph(2);
        testData.hash = ConfigurableHasher.hash({
            ...testData,
            parentCommentHash: comment.hash
        }, new HashableCommentCreateRequestConfig());
        await commentService.create(testData).then(value => value.toJSON());

        const count = await commentService.count({
            type: CommentType.LISTINGITEM_QUESTION_AND_ANSWERS
        } as CommentSearchParams);
        expect(count).toBe(2);
    });
});
