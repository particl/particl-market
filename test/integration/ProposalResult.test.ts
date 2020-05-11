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
import { ProposalResult } from '../../src/api/models/ProposalResult';
import { ProposalResultService } from '../../src/api/services/model/ProposalResultService';
import { ProposalResultCreateRequest } from '../../src/api/requests/model/ProposalResultCreateRequest';
import { ProposalResultUpdateRequest } from '../../src/api/requests/model/ProposalResultUpdateRequest';
import { ProposalService } from '../../src/api/services/model/ProposalService';
import { TestDataGenerateRequest } from '../../src/api/requests/testdata/TestDataGenerateRequest';
import { GenerateProposalParams } from '../../src/api/requests/testdata/GenerateProposalParams';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { GenerateListingItemParams } from '../../src/api/requests/testdata/GenerateListingItemParams';
import { ProfileService } from '../../src/api/services/model/ProfileService';
import { MarketService } from '../../src/api/services/model/MarketService';

describe('ProposalResult', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let proposalResultService: ProposalResultService;
    let proposalService: ProposalService;
    let profileService: ProfileService;
    let marketService: MarketService;

    let profile: resources.Profile;
    let market: resources.Market;
    let listingItem: resources.ListingItem;
    let proposal: resources.Proposal;
    let proposalResult: resources.ProposalResult;

    const testData = {
        calculatedAt: new Date().getTime()
    } as ProposalResultCreateRequest;

    const testDataUpdated = {
        calculatedAt: testData.calculatedAt + 1000
    } as ProposalResultUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        proposalResultService = app.IoC.getNamed<ProposalResultService>(Types.Service, Targets.Service.model.ProposalResultService);
        proposalService = app.IoC.getNamed<ProposalService>(Types.Service, Targets.Service.model.ProposalService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        // get default profile + market
        profile = await profileService.getDefault().then(value => value.toJSON());
        market = await marketService.getDefaultForProfile(profile.id).then(value => value.toJSON());

        // create ListingItems
        const generateListingItemParams = new GenerateListingItemParams([
            true,                                       // generateItemInformation
            true,                                       // generateItemLocation
            true,                                       // generateShippingDestinations
            false,                                      // generateItemImages
            true,                                       // generatePaymentInformation
            true,                                       // generateEscrow
            true,                                       // generateItemPrice
            true,                                       // generateMessagingInformation
            true,                                       // generateListingItemObjects
            false,                                      // generateObjectDatas
            null,                                       // listingItemTemplateHash
            profile.address                      // seller
        ]).toParamsArray();

        const listingItems = await testDataService.generate({
            model: CreatableModel.LISTINGITEM,          // what to generate
            amount: 1,                                  // how many to generate
            withRelated: true,                          // return model
            generateParams: generateListingItemParams   // what kind of data to generate
        } as TestDataGenerateRequest);
        listingItem = listingItems[0];

        // create Proposal
        const generateProposalParams = new GenerateProposalParams([
            false,                                      // generateListingItemTemplate
            false,                                      // generateListingItem
            listingItem.hash,                           // listingItemHash,
            false,                                      // generatePastProposal,
            2,                                          // voteCount
            profile.address                             // submitter
        ]).toParamsArray();

        const proposals = await testDataService.generate({
            model: CreatableModel.PROPOSAL,             // what to generate
            amount: 1,                                  // how many to generate
            withRelated: true,                          // return model
            generateParams: generateProposalParams      // what kind of data to generate
        } as TestDataGenerateRequest);
        proposal = proposals[0];

    });

    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await proposalResultService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should throw ValidationException because we want to create a empty proposal result', async () => {
        expect.assertions(1);
        await proposalResultService.create({} as ProposalResultCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('shouldRemoveListingItem should return correct result', async () => {
        proposalResult = await proposalResultService.findLatestByProposalHash(proposal.hash, true).then(value => value.toJSON());

        log.debug('proposalResult: ', JSON.stringify(proposalResult, null, 2));
        proposalResult.ProposalOptionResults[1].weight = 1000 * 100000000; // vote weights are in satoshis
        let shouldRemove: boolean = await proposalResultService.shouldRemoveListingItem(proposalResult, listingItem);
        expect(shouldRemove).toBeFalsy();

        proposalResult.ProposalOptionResults[1].weight = 10000 * 100000000; // vote weights are in satoshis
        shouldRemove = await proposalResultService.shouldRemoveListingItem(proposalResult, listingItem);
        expect(shouldRemove).toBeTruthy();
    });

    test('Should create a new ProposalResult without ProposalOptions', async () => {

        testData.proposal_id = proposal.id;

        proposalResult = await proposalResultService.create(testData).then(value => value.toJSON());

        // test the values
        expect(proposalResult.Proposal).toBeDefined();
        expect(proposalResult.Proposal.id).toBe(proposal.id);
        expect(proposalResult.calculatedAt).toBe(testData.calculatedAt);
    });

    test('Should list ProposalResults with our newly created one', async () => {
        const proposalResults: resources.ProposalResult[] = await proposalResultService.findAll().then(value => value.toJSON());

        // testDataService.generate creates first 1 empty result, then 1 when recalculating result
        expect(proposalResults.length).toBe(3);
    });

    test('Should list all ProposalResults by proposalHash', async () => {
        const proposalResults: resources.ProposalResult[] = await proposalResultService.findAllByProposalHash(proposal.hash, true)
            .then(value => value.toJSON());

        // log.debug('proposalResults:', JSON.stringify(proposalResults, null, 2));
        expect(proposalResults.length).toBe(3);
        proposalResult = proposalResults[0];

        const result: resources.ProposalResult = proposalResults[0];
        expect(result.Proposal).toBeDefined();
        expect(result.Proposal.id).toBe(proposal.id);
    });

    test('Should return latest ProposalResult by proposalHash', async () => {
        const result: resources.ProposalResult = await proposalResultService.findLatestByProposalHash(proposal.hash).then(value => value.toJSON());
        expect(result.Proposal).toBeDefined();
        expect(result.Proposal.id).toBe(proposal.id);
        expect(result.id).toBe(proposalResult.id);

    });

    test('Should return one ProposalResult', async () => {
        const result: resources.ProposalResult = await proposalResultService.findOne(proposalResult.id).then(value => value.toJSON());

        expect(result.Proposal).toBeDefined();
        expect(result.Proposal.id).toBe(proposal.id);
        expect(result.calculatedAt).toBe(testData.calculatedAt);
    });

    test('Should update the ProposalResult', async () => {
        const result: resources.ProposalResult = await proposalResultService.update(proposalResult.id, testDataUpdated)
            .then(value => value.toJSON());

        expect(result.Proposal).toBeDefined();
        expect(result.Proposal.id).toBe(proposal.id);
        expect(result.calculatedAt).toBe(testData.calculatedAt);
    });

    test('Should delete the ProposalResult', async () => {
        expect.assertions(1);
        await proposalResultService.destroy(proposalResult.id);
        await proposalResultService.findOne(proposalResult.id).catch(e =>
            expect(e).toEqual(new NotFoundException(proposalResult.id))
        );
    });

});
