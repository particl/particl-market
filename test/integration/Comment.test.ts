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

    let createdComment: resources.Comment;


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
            parentCommentId: 1,
            hash: Faker.random.uuid(),
            sender: senderMarket.Identity.address,
            receiver: receiverMarket.receiveAddress,
            type: CommentType.LISTINGITEM_QUESTION_AND_ANSWERS + '',
            target: listingItem.hash,
            message: Faker.random.words(),
            postedAt: new Date().getTime(),
            receivedAt: new Date().getTime(),
            expiredAt: new Date().getTime() + 1000000
        } as CommentCreateRequest;

        testData.hash = ConfigurableHasher.hash(testData, new HashableCommentCreateRequestConfig());

        createdComment = await commentService.create(testData).then(value => value.toJSON());
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

        const comments: resources.Comment[] = await commentService.findAll().then(value => value.toJSON());
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
        const result: resources.Comment = await commentService.findOne(createdComment.id).then(value => value.toJSON());

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
            message: 'update'
        } as CommentUpdateRequest;

        const result: resources.Comment = await commentService.update(createdComment.id, testDataUpdated).then(value => value.toJSON());

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
