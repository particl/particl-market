// Copyright (c) 2017-2019, The Particl Market developers
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
import { ProposalOptionResult } from '../../src/api/models/ProposalOptionResult';
import { ProposalOptionResultService } from '../../src/api/services/ProposalOptionResultService';
import { ProposalOptionResultCreateRequest } from '../../src/api/requests/ProposalOptionResultCreateRequest';
import { ProposalService } from '../../src/api/services/ProposalService';
import * as resources from 'resources';
import { ProposalResultService } from '../../src/api/services/ProposalResultService';
import { ProfileService } from '../../src/api/services/ProfileService';
import { MarketService } from '../../src/api/services/MarketService';
import { TestDataGenerateRequest } from '../../src/api/requests/TestDataGenerateRequest';
import { GenerateProposalParams } from '../../src/api/requests/params/GenerateProposalParams';
import { GenerateListingItemParams } from '../../src/api/requests/params/GenerateListingItemParams';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { ProposalOptionCreateRequest } from '../../src/api/requests/ProposalOptionCreateRequest';
import { ProposalOption } from '../../src/api/models/ProposalOption';
import { ProposalOptionService } from '../../src/api/services/ProposalOptionService';
import { ProposalOptionResultUpdateRequest } from '../../src/api/requests/ProposalOptionResultUpdateRequest';

describe('ProposalOptionResult', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let proposalService: ProposalService;
    let proposalResultService: ProposalResultService;
    let proposalOptionService: ProposalOptionService;
    let proposalOptionResultService: ProposalOptionResultService;
    let profileService: ProfileService;
    let marketService: MarketService;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;
    let createdProposal: resources.Proposal;
    let createdProposalResult: resources.ProposalResult;
    let createdListingItem: resources.ListingItem;
    let createdProposalOption: resources.ProposalOption;
    let createdProposalOptionResult: resources.ProposalOptionResult;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        proposalService = app.IoC.getNamed<ProposalService>(Types.Service, Targets.Service.ProposalService);
        proposalResultService = app.IoC.getNamed<ProposalResultService>(Types.Service, Targets.Service.ProposalResultService);
        proposalOptionService = app.IoC.getNamed<ProposalOptionService>(Types.Service, Targets.Service.ProposalOptionService);
        proposalOptionResultService = app.IoC.getNamed<ProposalOptionResultService>(Types.Service, Targets.Service.ProposalOptionResultService);
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

        // log.debug('proposals: ', JSON.stringify(proposals, null, 2));

        const proposalResultModel = await proposalResultService.findOne(createdProposal.ProposalResults[0].id);
        createdProposalResult = proposalResultModel.toJSON();
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

        // first add new proposalOption
        const proposalOptionCreateRequest = {
            proposal_id: createdProposal.id,
            proposalHash: createdProposal.hash,
            optionId: 2,
            description: 'REMOVE_MAYBE'
        } as ProposalOptionCreateRequest;

        const proposalOptionModel: ProposalOption = await proposalOptionService.create(proposalOptionCreateRequest);
        createdProposalOption = proposalOptionModel.toJSON();

        // then add new proposaloptionresult
        const testData = {
            proposal_result_id: createdProposalResult.id,
            proposal_option_id: createdProposalOption.id,
            weight: 5,
            voters: 5
        } as ProposalOptionResultCreateRequest;

        const proposalOptionResultModel: ProposalOptionResult = await proposalOptionResultService.create(testData);
        createdProposalOptionResult = proposalOptionResultModel.toJSON();
        const result = createdProposalOptionResult;

        // test the values
        expect(result.ProposalResult.id).toBe(createdProposalResult.id);
        expect(result.ProposalOption.id).toBe(createdProposalOption.id);
        expect(result.weight).toBe(testData.weight);
        expect(result.voters).toBe(testData.voters);
    });

    test('Should list ProposalOptionResults with our new create one', async () => {
        const proposalOptionResultCollection = await proposalOptionResultService.findAll();
        const proposalOptionResult = proposalOptionResultCollection.toJSON();
        expect(proposalOptionResult.length).toBe(3);

        const resultWeights = proposalOptionResult[0].weight + proposalOptionResult[1].weight + proposalOptionResult[2].weight;
        expect(resultWeights).toBe(25); // 20 votes originally + 5
    });

    test('Should return one ProposalOptionResult', async () => {
        const proposalOptionResultModel: ProposalOptionResult = await proposalOptionResultService.findOne(createdProposalOptionResult.id);
        const result = proposalOptionResultModel.toJSON();

        expect(result.ProposalResult.id).toBe(createdProposalResult.id);
        expect(result.ProposalOption.id).toBe(createdProposalOption.id);
        expect(result.weight).toBe(createdProposalOptionResult.weight);
        expect(result.voters).toBe(createdProposalOptionResult.voters);
    });

    test('Should update the ProposalOptionResult', async () => {

        const testDataUpdated = {
            weight: 15,
            voters: 15
        } as ProposalOptionResultUpdateRequest;

        const proposalOptionResultModel: ProposalOptionResult = await proposalOptionResultService.update(
            createdProposalOptionResult.id, testDataUpdated);
        createdProposalOptionResult = proposalOptionResultModel.toJSON();
        const result = createdProposalOptionResult;

        // test the values
        expect(result.ProposalResult.id).toBe(createdProposalResult.id);
        expect(result.ProposalOption.id).toBe(createdProposalOption.id);
        expect(result.weight).toBe(testDataUpdated.weight);
        expect(result.voters).toBe(testDataUpdated.voters);
    });

    test('Should delete the ProposalOptionResult', async () => {
        expect.assertions(1);
        await proposalOptionResultService.destroy(createdProposalOptionResult.id);
        await proposalOptionResultService.findOne(createdProposalOptionResult.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdProposalOptionResult.id))
        );
    });

});
