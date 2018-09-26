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
import { ProposalResult } from '../../src/api/models/ProposalResult';
import { ProposalResultService } from '../../src/api/services/ProposalResultService';
import { ProposalResultCreateRequest } from '../../src/api/requests/ProposalResultCreateRequest';
import { ProposalResultUpdateRequest } from '../../src/api/requests/ProposalResultUpdateRequest';
import { ProposalService } from '../../src/api/services/ProposalService';
import { ProposalType } from '../../src/api/enums/ProposalType';
import { ProposalCreateRequest } from '../../src/api/requests/ProposalCreateRequest';
import { Proposal } from '../../src/api/models/Proposal';
import * as resources from 'resources';
import {TestDataGenerateRequest} from '../../src/api/requests/TestDataGenerateRequest';
import {GenerateProposalParams} from '../../src/api/requests/params/GenerateProposalParams';
import {CreatableModel} from '../../src/api/enums/CreatableModel';
import {GenerateListingItemParams} from '../../src/api/requests/params/GenerateListingItemParams';
import {ProfileService} from '../../src/api/services/ProfileService';
import {MarketService} from '../../src/api/services/MarketService';

describe('ProposalResult', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let proposalResultService: ProposalResultService;
    let proposalService: ProposalService;
    let profileService: ProfileService;
    let marketService: MarketService;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;
    let createdListingItem: resources.ListingItem;
    let createdProposal: resources.Proposal;
    let createdProposalResult: resources.ProposalResult;

    const testData = {
        block: 1
    } as ProposalResultCreateRequest;

    const testDataUpdated = {
        block: 2
    } as ProposalResultUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        proposalResultService = app.IoC.getNamed<ProposalResultService>(Types.Service, Targets.Service.ProposalResultService);
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
            2,                                          // voteCount
            defaultProfile.address                      // submitter
        ]).toParamsArray();

        const proposals = await testDataService.generate({
            model: CreatableModel.PROPOSAL,             // what to generate
            amount: 1,                                  // how many to generate
            withRelated: true,                          // return model
            generateParams: generateProposalParams      // what kind of data to generate
        } as TestDataGenerateRequest);
        createdProposal = proposals[0];

    });

    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await proposalResultService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should throw ValidationException because we want to create a empty proposal result', async () => {
        expect.assertions(1);
        await proposalResultService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new ProposalResult', async () => {

        testData.proposal_id = createdProposal.id;

        const proposalResultModel: ProposalResult = await proposalResultService.create(testData);
        createdProposalResult = proposalResultModel.toJSON();

        // test the values
        expect(createdProposalResult.Proposal).toBeDefined();
        expect(createdProposalResult.Proposal.id).toBe(createdProposal.id);
        expect(createdProposalResult.block).toBe(testData.block);
    });

    test('Should list ProposalResults with our newly created one', async () => {
        const proposalResultCollection = await proposalResultService.findAll();
        const proposalResult = proposalResultCollection.toJSON();
        // log.debug('proposalResult:', JSON.stringify(proposalResult, null, 2));
        expect(proposalResult.length).toBe(2);
    });

    test('Should list all ProposalResults by proposalHash', async () => {
        const proposalResultCollection = await proposalResultService.findAllByProposalHash(createdProposal.hash, true);
        const proposalResult = proposalResultCollection.toJSON();

        log.debug('proposalResult:', JSON.stringify(proposalResult, null, 2));
        expect(proposalResult.length).toBe(2);
        createdProposalResult = proposalResult[0];

        const result = proposalResult[0];
        expect(result.Proposal).toBeDefined();
        expect(result.Proposal.id).toBe(createdProposal.id);
        expect(proposalResult[0].id).toBeGreaterThan(proposalResult[1].id);

    });

    test('Should return one ProposalResult by proposalHash', async () => {
        const proposalResultModel: ProposalResult = await proposalResultService.findOneByProposalHash(createdProposal.hash);
        const result = proposalResultModel.toJSON();
        expect(result.Proposal).toBeDefined();
        expect(result.Proposal.id).toBe(createdProposal.id);
        expect(result.id).toBe(createdProposalResult.id);

    });

    test('Should return one ProposalResult', async () => {
        const proposalResultModel: ProposalResult = await proposalResultService.findOne(createdProposalResult.id);
        const result = proposalResultModel.toJSON();

        expect(result.Proposal).toBeDefined();
        expect(result.Proposal.id).toBe(createdProposal.id);
        expect(result.block).toBe(testData.block);
    });

    test('Should update the ProposalResult', async () => {
        const proposalResultModel: ProposalResult = await proposalResultService.update(createdProposalResult.id, testDataUpdated);
        const result = proposalResultModel.toJSON();

        expect(result.Proposal).toBeDefined();
        expect(result.Proposal.id).toBe(createdProposal.id);
        expect(result.block).toBe(testDataUpdated.block);
    });

    test('Should delete the ProposalResult', async () => {
        expect.assertions(1);
        await proposalResultService.destroy(createdProposalResult.id);
        await proposalResultService.findOne(createdProposalResult.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdProposalResult.id))
        );
    });

});
