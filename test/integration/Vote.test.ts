// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import * as Faker from 'faker';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { Vote } from '../../src/api/models/Vote';
import { VoteService } from '../../src/api/services/model/VoteService';
import { VoteCreateRequest } from '../../src/api/requests/model/VoteCreateRequest';
import { VoteUpdateRequest } from '../../src/api/requests/model/VoteUpdateRequest';
import { ProposalService } from '../../src/api/services/model/ProposalService';
import { ProfileService } from '../../src/api/services/model/ProfileService';
import { MarketService } from '../../src/api/services/model/MarketService';
import { ListingItemService } from '../../src/api/services/model/ListingItemService';
import { ListingItemTemplateService } from '../../src/api/services/model/ListingItemTemplateService';
import { DefaultMarketService } from '../../src/api/services/DefaultMarketService';

describe('Vote', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let defaultMarketService: DefaultMarketService;
    let voteService: VoteService;
    let proposalService: ProposalService;
    let profileService: ProfileService;
    let marketService: MarketService;
    let listingItemService: ListingItemService;
    let listingItemTemplateService: ListingItemTemplateService;

    let bidderProfile: resources.Profile;
    let bidderMarket: resources.Market;
    let sellerProfile: resources.Profile;
    let sellerMarket: resources.Market;

    let listingItem: resources.ListingItem;
    let listingItemTemplate: resources.ListingItemTemplate;

    let proposal: resources.Proposal;
    let vote: resources.Vote;


    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        defaultMarketService = app.IoC.getNamed<DefaultMarketService>(Types.Service, Targets.Service.DefaultMarketService);
        voteService = app.IoC.getNamed<VoteService>(Types.Service, Targets.Service.model.VoteService);
        proposalService = app.IoC.getNamed<ProposalService>(Types.Service, Targets.Service.model.ProposalService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.model.ListingItemService);
        listingItemTemplateService = app.IoC.getNamed<ListingItemTemplateService>(Types.Service, Targets.Service.model.ListingItemTemplateService);

        bidderProfile = await profileService.getDefault().then(value => value.toJSON());
        bidderMarket = await defaultMarketService.getDefaultForProfile(bidderProfile.id).then(value => value.toJSON());

        sellerProfile = await testDataService.generateProfile();
        sellerMarket = await defaultMarketService.getDefaultForProfile(sellerProfile.id).then(value => value.toJSON());

        listingItem = await testDataService.generateListingItemWithTemplate(sellerProfile, bidderMarket);
        listingItemTemplate = await listingItemTemplateService.findOne(listingItem.ListingItemTemplate.id).then(value => value.toJSON());

        proposal = await testDataService.generateProposal(listingItem.id, bidderMarket, true, true);

        // log.debug('proposal:', JSON.stringify(proposal, null, 2));

    });

    afterAll(async () => {
        //
    });

    test('Should throw ValidationException because we want to create a empty vote', async () => {
        expect.assertions(1);
        await voteService.create({} as VoteCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new Vote', async () => {
        const testData = {
            msgid: Faker.random.uuid(),
            proposal_option_id: proposal.ProposalOptions[0].id,
            signature: 'signature' + Faker.finance.bitcoinAddress(),
            voter: bidderMarket.Identity.address,
            weight: 1,
            postedAt: Date.now(),
            receivedAt: Date.now(),
            expiredAt: Date.now() + 1000000
        } as VoteCreateRequest;

        // log.debug('testData:', JSON.stringify(testData, null, 2));

        const result: resources.Vote = await voteService.create(testData).then(value => value.toJSON());

        expect(result.ProposalOption.id).toBe(proposal.ProposalOptions[0].id);
        expect(result.voter).toBe(testData.voter);
        expect(result.postedAt).toBe(testData.postedAt);
        expect(result.receivedAt).toBe(testData.receivedAt);
        expect(result.expiredAt).toBe(testData.expiredAt);
        expect(result.weight).toBe(testData.weight);

        vote = result;
    });

    test('Should list Votes with our newly created one', async () => {
        const votes: resources.Vote[] = await voteService.findAll().then(value => value.toJSON());
        expect(votes.length).toBe(1); // 20 + the one created

        const result: resources.Vote = votes[0];
        expect(result.voter).toBe(vote.voter);
        expect(result.block).toBe(vote.block);
        expect(result.weight).toBe(vote.weight);
    });

    test('Should return one Vote', async () => {
        const result: resources.Vote = await voteService.findOne(vote.id).then(value => value.toJSON());

        expect(result.ProposalOption).toBeDefined();
        expect(result.ProposalOption.id).toBe(proposal.ProposalOptions[0].id);
        expect(result.voter).toBe(vote.voter);
        expect(result.block).toBe(vote.block);
        expect(result.weight).toBe(vote.weight);
    });

    test('Should get a Vote by proposalId and voterAddress', async () => {

        const result: resources.Vote = await voteService.findOneByVoterAndProposalId(vote.voter, proposal.id).then(value => value.toJSON());

        expect(result.ProposalOption.id).toBe(proposal.ProposalOptions[0].id);
        expect(result.ProposalOption.optionId).toBe(proposal.ProposalOptions[0].optionId);
        expect(result.voter).toBe(vote.voter);
        expect(result.block).toBe(vote.block);
        expect(result.weight).toBe(vote.weight);
    });

    test('Should update the Vote', async () => {

        const testDataUpdated = {
            voter: bidderMarket.Identity.address,
            weight: 3,
            postedAt: Date.now(),
            receivedAt: Date.now(),
            expiredAt: Date.now() + 1000000
        } as VoteUpdateRequest;

        const result: resources.Vote = await voteService.update(vote.id, testDataUpdated).then(value => value.toJSON());

        expect(result.ProposalOption.id).toBe(proposal.ProposalOptions[0].id);
        expect(result.voter).toBe(testDataUpdated.voter);
        expect(result.postedAt).toBe(testDataUpdated.postedAt);
        expect(result.receivedAt).toBe(testDataUpdated.receivedAt);
        expect(result.expiredAt).toBe(testDataUpdated.expiredAt);
        expect(result.weight).toBe(testDataUpdated.weight);
    });

    test('Should delete the vote', async () => {
        expect.assertions(1);
        await voteService.destroy(vote.id);
        await voteService.findOne(vote.id).catch(e =>
            expect(e).toEqual(new NotFoundException(vote.id))
        );
    });

});
