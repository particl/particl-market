// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { Vote } from '../../src/api/models/Vote';
import { VoteService } from '../../src/api/services/VoteService';
import { VoteCreateRequest } from '../../src/api/requests/VoteCreateRequest';
import { VoteUpdateRequest } from '../../src/api/requests/VoteUpdateRequest';
import { ProposalType } from '../../src/api/enums/ProposalType';
import { ProposalCreateRequest } from '../../src/api/requests/ProposalCreateRequest';
import { Proposal } from '../../src/api/models/Proposal';
import { ProposalService } from '../../src/api/services/ProposalService';
import * as resources from 'resources';
import {ProfileService} from '../../src/api/services/ProfileService';
import {MarketService} from '../../src/api/services/MarketService';
import {TestDataGenerateRequest} from '../../src/api/requests/TestDataGenerateRequest';
import {GenerateProposalParams} from '../../src/api/requests/params/GenerateProposalParams';
import {GenerateListingItemParams} from '../../src/api/requests/params/GenerateListingItemParams';
import {CreatableModel} from '../../src/api/enums/CreatableModel';

describe('Vote', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let voteService: VoteService;
    let proposalService: ProposalService;
    let profileService: ProfileService;
    let marketService: MarketService;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;
    let createdProposal: resources.Proposal;
    let createdListingItem: resources.ListingItem;
    let createdVote: resources.Vote;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        voteService = app.IoC.getNamed<VoteService>(Types.Service, Targets.Service.VoteService);
        proposalService = app.IoC.getNamed<ProposalService>(Types.Service, Targets.Service.ProposalService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.ProfileService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.MarketService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        // get default profile
        const defaultProfileModel = await profileService.getDefault();
        defaultProfile = defaultProfileModel.toJSON();

        // get default market
        const defaultMarketModel = await marketService.getDefault();
        defaultMarket = defaultMarketModel.toJSON();

        // create ListingItems
        const generateListingItemParams = new GenerateListingItemParams([
            true,                                       // generateItemInformation
            true,                                       // generateShippingDestinations
            false,                                      // generateItemImages
            true,                                       // generatePaymentInformation
            true,                                       // generateEscrow
            true,                                       // generateItemPrice
            true,                                       // generateMessagingInformation
            true,                                       // generateListingItemObjects
            false,                                      // generateObjectDatas
            null,                                       // listingItemTemplateHash
            defaultProfile.address                      // seller
        ]).toParamsArray();

        const listingItems = await testDataService.generate({
            model: CreatableModel.LISTINGITEM,          // what to generate
            amount: 1,                                  // how many to generate
            withRelated: true,                          // return model
            generateParams: generateListingItemParams   // what kind of data to generate
        } as TestDataGenerateRequest);
        createdListingItem = listingItems[0];

        // create Proposal
        const generateProposalParams = new GenerateProposalParams([
            false,                                      // generateListingItemTemplate
            false,                                      // generateListingItem
            createdListingItem.hash,                    // listingItemHash,
            false,                                      // generatePastProposal,
            20,                                         // voteCount
            defaultProfile.address                      // submitter
        ]).toParamsArray();

        const proposals = await testDataService.generate({
            model: CreatableModel.PROPOSAL,             // what to generate
            amount: 1,                                  // how many to generate
            withRelated: true,                          // return model
            generateParams: generateProposalParams      // what kind of data to generate
        } as TestDataGenerateRequest);
        createdProposal = proposals[0];

        log.debug('createdProposal:', JSON.stringify(createdProposal, null, 2));

    });

    afterAll(async () => {
        //
    });

    test('Should throw ValidationException because there is no related_id', async () => {
        const testData = {
            voter: defaultProfile.address,
            block: 2,
            weight: 2
        } as VoteCreateRequest;

        expect.assertions(1);
        await voteService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should throw ValidationException because we want to create a empty vote', async () => {
        expect.assertions(1);
        await voteService.create({} as VoteCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new Vote', async () => {
        const testData = {
            proposal_option_id: createdProposal.ProposalOptions[0].id,
            voter: defaultProfile.address,
            block: 1,
            weight: 1
        } as VoteCreateRequest;

        const voteModel: Vote = await voteService.create(testData);
        createdVote = voteModel.toJSON();
        const result = createdVote;

        expect(result.ProposalOption.id).toBe(createdProposal.ProposalOptions[0].id);
        expect(result.voter).toBe(testData.voter);
        expect(result.block).toBe(testData.block);
        expect(result.weight).toBe(testData.weight);
    });

    test('Should list Votes with our newly created one', async () => {
        const voteCollection = await voteService.findAll();
        const vote = voteCollection.toJSON();
        expect(vote.length).toBe(21); // 20 + the one created

        const result = vote[20];
        expect(result.voter).toBe(createdVote.voter);
        expect(result.block).toBe(createdVote.block);
        expect(result.weight).toBe(createdVote.weight);
    });

    test('Should return one Vote', async () => {
        const voteModel: Vote = await voteService.findOne(createdVote.id);
        const result = voteModel.toJSON();

        expect(result.ProposalOption).toBeDefined();
        expect(result.ProposalOption.id).toBe(createdProposal.ProposalOptions[0].id);
        expect(result.voter).toBe(createdVote.voter);
        expect(result.block).toBe(createdVote.block);
        expect(result.weight).toBe(createdVote.weight);
    });

    test('Should get a Vote by proposalId and voterAddress', async () => {

        const voteModel: Vote = await voteService.findOneByVoterAndProposalId(createdVote.voter, createdProposal.id);
        const result = voteModel.toJSON();

        // test the values
        expect(result.ProposalOption.id).toBe(createdProposal.ProposalOptions[0].id);
        expect(result.ProposalOption.optionId).toBe(createdProposal.ProposalOptions[0].optionId);
        expect(result.voter).toBe(createdVote.voter);
        expect(result.block).toBe(createdVote.block);
        expect(result.weight).toBe(createdVote.weight);
    });

    test('Should update the Vote', async () => {

        const testDataUpdated = {
            voter: defaultProfile.address,
            block: 3,
            weight: 3
        } as VoteUpdateRequest;

        const voteModel: Vote = await voteService.update(createdVote.id, testDataUpdated);
        const result = voteModel.toJSON();

        expect(result.ProposalOption.id).toBe(createdProposal.ProposalOptions[0].id);
        expect(result.voter).toBe(testDataUpdated.voter);
        expect(result.block).toBe(testDataUpdated.block);
        expect(result.weight).toBe(testDataUpdated.weight);
    });

    test('Should delete the vote', async () => {
        expect.assertions(1);
        await voteService.destroy(createdVote.id);
        await voteService.findOne(createdVote.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdVote.id))
        );
    });

});
