// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { ProposalOptionResult } from '../../src/api/models/ProposalOptionResult';
import { ProposalOptionResultService } from '../../src/api/services/model/ProposalOptionResultService';
import { ProposalOptionResultCreateRequest } from '../../src/api/requests/model/ProposalOptionResultCreateRequest';
import { ProposalService } from '../../src/api/services/model/ProposalService';
import { ProposalResultService } from '../../src/api/services/model/ProposalResultService';
import { ProfileService } from '../../src/api/services/model/ProfileService';
import { MarketService } from '../../src/api/services/model/MarketService';
import { ProposalOptionCreateRequest } from '../../src/api/requests/model/ProposalOptionCreateRequest';
import { ProposalOptionService } from '../../src/api/services/model/ProposalOptionService';
import { ProposalOptionResultUpdateRequest } from '../../src/api/requests/model/ProposalOptionResultUpdateRequest';
import { ListingItemService } from '../../src/api/services/model/ListingItemService';
import { ListingItemTemplateService } from '../../src/api/services/model/ListingItemTemplateService';
import { FlaggedItemService } from '../../src/api/services/model/FlaggedItemService';
import { DefaultMarketService } from '../../src/api/services/DefaultMarketService';

describe('ProposalOptionResult', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let defaultMarketService: DefaultMarketService;
    let proposalService: ProposalService;
    let proposalResultService: ProposalResultService;
    let proposalOptionService: ProposalOptionService;
    let proposalOptionResultService: ProposalOptionResultService;
    let profileService: ProfileService;
    let marketService: MarketService;
    let listingItemService: ListingItemService;
    let listingItemTemplateService: ListingItemTemplateService;
    let flaggedItemService: FlaggedItemService;

    let bidderMarket: resources.Market;
    let bidderProfile: resources.Profile;
    let sellerProfile: resources.Profile;
    let sellerMarket: resources.Market;
    let listingItem: resources.ListingItem;
    let listingItemTemplate: resources.ListingItemTemplate;
    let proposal: resources.Proposal;
    let proposalResult: resources.ProposalResult;
    let proposalOption: resources.ProposalOption;
    let proposalOptionResult: resources.ProposalOptionResult;

    const voteCount = 10;
    const newVoteCount = 5;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        defaultMarketService = app.IoC.getNamed<DefaultMarketService>(Types.Service, Targets.Service.DefaultMarketService);
        proposalService = app.IoC.getNamed<ProposalService>(Types.Service, Targets.Service.model.ProposalService);
        proposalResultService = app.IoC.getNamed<ProposalResultService>(Types.Service, Targets.Service.model.ProposalResultService);
        proposalOptionService = app.IoC.getNamed<ProposalOptionService>(Types.Service, Targets.Service.model.ProposalOptionService);
        proposalOptionResultService = app.IoC.getNamed<ProposalOptionResultService>(Types.Service, Targets.Service.model.ProposalOptionResultService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.model.ListingItemService);
        listingItemTemplateService = app.IoC.getNamed<ListingItemTemplateService>(Types.Service, Targets.Service.model.ListingItemTemplateService);
        flaggedItemService = app.IoC.getNamed<FlaggedItemService>(Types.Service, Targets.Service.model.FlaggedItemService);

        bidderProfile = await profileService.getDefault().then(value => value.toJSON());
        bidderMarket = await defaultMarketService.getDefaultForProfile(bidderProfile.id).then(value => value.toJSON());

        sellerProfile = await testDataService.generateProfile();
        sellerMarket = await defaultMarketService.getDefaultForProfile(sellerProfile.id).then(value => value.toJSON());

        listingItem = await testDataService.generateListingItemWithTemplate(sellerProfile, bidderMarket);
        listingItemTemplate = await listingItemTemplateService.findOne(listingItem.ListingItemTemplate.id).then(value => value.toJSON());

        proposal = await testDataService.generateProposal(listingItem.id, bidderMarket, true, true, voteCount);

        const lastResultIndex = proposal.ProposalResults.length - 1;
        proposalResult = await proposalResultService.findOne(proposal.ProposalResults[lastResultIndex].id).then(value => value.toJSON());

    });

    test('Should throw ValidationException because there is no related_id', async () => {
        const testData = {
            weight: 1,
            voters: 1
        } as ProposalOptionResultCreateRequest;

        expect.assertions(1);
        await proposalOptionResultService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should throw ValidationException because we want to create a empty proposal option result', async () => {
        expect.assertions(1);
        await proposalOptionResultService.create({} as ProposalOptionResultCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new ProposalOptionResult', async () => {

        // first add new ProposalOption
        const proposalOptionCreateRequest = {
            proposal_id: proposal.id,
            optionId: 2,
            description: 'REMOVE_MAYBE',
            hash: 'hash'
        } as ProposalOptionCreateRequest;

        proposalOption = await proposalOptionService.create(proposalOptionCreateRequest).then(value => value.toJSON());

        // then add new ProposalOptionResult
        const testData = {
            proposal_result_id: proposalResult.id,
            proposal_option_id: proposalOption.id,
            weight: 5,
            voters: 5
        } as ProposalOptionResultCreateRequest;

        const result = await proposalOptionResultService.create(testData).then(value => value.toJSON());

        // test the values
        expect(result.ProposalResult.id).toBe(proposalResult.id);
        expect(result.ProposalOption.id).toBe(proposalOption.id);
        expect(result.weight).toBe(testData.weight);
        expect(result.voters).toBe(testData.voters);

        proposalOptionResult = result;
    });

    test('Should list ProposalOptionResults with the newly create one', async () => {
        const proposalOptionResults = await proposalOptionResultService.findAll().then(value => value.toJSON());

        // testDataService.generate creates first 2 empty results,
        // then recalculates and generates 2 more, +1 generated here === 5
        expect(proposalOptionResults.length).toBe(5);

        // log.debug('proposalOptionResults:', JSON.stringify(proposalOptionResults, null, 2));

        const resultWeights = proposalOptionResults[0].weight + proposalOptionResults[1].weight + proposalOptionResults[2].weight
            + proposalOptionResults[3].weight + proposalOptionResults[4].weight;
        expect(resultWeights).toBe(voteCount + newVoteCount);
    });

    test('Should return one ProposalOptionResult', async () => {
        const result: resources.ProposalOptionResult = await proposalOptionResultService.findOne(proposalOptionResult.id).then(value => value.toJSON());

        expect(result.ProposalResult.id).toBe(proposalResult.id);
        expect(result.ProposalOption.id).toBe(proposalOption.id);
        expect(result.weight).toBe(proposalOptionResult.weight);
        expect(result.voters).toBe(proposalOptionResult.voters);
    });

    test('Should update the ProposalOptionResult', async () => {

        const testDataUpdated = {
            proposal_result_id: proposalOptionResult.ProposalResult.id,
            proposal_option_id: proposalOptionResult.ProposalOption.id,
            weight: 15,
            voters: 15
        } as ProposalOptionResultUpdateRequest;

        const result: resources.ProposalOptionResult = await proposalOptionResultService.update(proposalOptionResult.id, testDataUpdated)
            .then(value => value.toJSON());

        // test the values
        expect(result.ProposalResult.id).toBe(proposalResult.id);
        expect(result.ProposalOption.id).toBe(proposalOption.id);
        expect(result.weight).toBe(testDataUpdated.weight);
        expect(result.voters).toBe(testDataUpdated.voters);

        proposalOptionResult = result;
    });

    test('shouldRemoveFlaggedItem should return correct result', async () => {
        // log.debug('proposal: ', JSON.stringify(proposal, null, 2));

        proposalResult = await proposalResultService.findLatestByProposalHash(proposal.hash, true).then(value => value.toJSON());

        // log.debug('proposalResult: ', JSON.stringify(proposalResult, null, 2));

        const flaggedItem: resources.FlaggedItem = await flaggedItemService.findOne(proposal.FlaggedItems[0].id).then(value => value.toJSON());

        proposalResult.ProposalOptionResults[1].weight = 1000 * 100000000; // vote weights are in satoshis
        let shouldRemove: boolean = await proposalResultService.shouldRemoveFlaggedItem(proposalResult, flaggedItem);
        expect(shouldRemove).toBeFalsy();

        proposalResult.ProposalOptionResults[1].weight = 10000 * 100000000; // vote weights are in satoshis
        shouldRemove = await proposalResultService.shouldRemoveFlaggedItem(proposalResult, flaggedItem);
        expect(shouldRemove).toBeTruthy();
    });

    test('Should delete the ProposalOptionResult', async () => {
        expect.assertions(1);
        await proposalOptionResultService.destroy(proposalOptionResult.id);
        await proposalOptionResultService.findOne(proposalOptionResult.id).catch(e =>
            expect(e).toEqual(new NotFoundException(proposalOptionResult.id))
        );
    });

});
