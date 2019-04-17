// Copyright (c) 2017-2019, The Particl Market developers
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
import { ProposalOption } from '../../src/api/models/ProposalOption';
import { ProposalOptionService } from '../../src/api/services/model/ProposalOptionService';
import { ProposalOptionCreateRequest } from '../../src/api/requests/model/ProposalOptionCreateRequest';
import { ProposalOptionUpdateRequest } from '../../src/api/requests/model/ProposalOptionUpdateRequest';
import { ProposalService } from '../../src/api/services/model/ProposalService';
import { TestDataGenerateRequest } from '../../src/api/requests/testdata/TestDataGenerateRequest';
import { GenerateProposalParams } from '../../src/api/requests/testdata/GenerateProposalParams';
import { GenerateListingItemParams } from '../../src/api/requests/testdata/GenerateListingItemParams';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { ProfileService } from '../../src/api/services/model/ProfileService';
import { MarketService } from '../../src/api/services/model/MarketService';
import { Proposal } from '../../src/api/models/Proposal';
import { ItemVote } from '../../src/api/enums/ItemVote';

describe('ProposalOption', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let proposalService: ProposalService;
    let proposalOptionService: ProposalOptionService;
    let profileService: ProfileService;
    let marketService: MarketService;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;
    let createdListingItem: resources.ListingItem;
    let createdProposal: resources.Proposal;
    let createdProposalOption: resources.ProposalOption;

    const testData = {
        optionId: 2,
        description: ItemVote.REMOVE
    } as ProposalOptionCreateRequest;

    const testDataUpdated = {
        optionId: 3,
        description: ItemVote.KEEP
    } as ProposalOptionUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        proposalService = app.IoC.getNamed<ProposalService>(Types.Service, Targets.Service.model.ProposalService);
        proposalOptionService = app.IoC.getNamed<ProposalOptionService>(Types.Service, Targets.Service.model.ProposalOptionService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);

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
        await proposalOptionService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should throw ValidationException because we want to create a empty ProposalOption', async () => {
        expect.assertions(1);
        await proposalOptionService.create({} as ProposalOptionCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new ProposalOption', async () => {

        testData.proposal_id = createdProposal.id;
        testData.proposalHash = createdProposal.hash;

        const proposalOptionModel: ProposalOption = await proposalOptionService.create(testData);
        createdProposalOption = proposalOptionModel.toJSON();
        const result = createdProposalOption;

        log.debug('ProposalOption, result:', JSON.stringify(result, null, 2));
        log.debug('createdProposal:', JSON.stringify(createdProposal, null, 2));

        expect(result.Proposal.id).toBe(createdProposal.id);
        expect(result.optionId).toBe(testData.optionId);
        expect(result.description).toBe(testData.description);

        const proposalModel: Proposal = await proposalService.findOne(createdProposal.id);
        const proposal: resources.Proposal = proposalModel.toJSON();
        expect(proposal.ProposalOptions.length).toBe(3);

        createdProposal = proposal;
    });

    test('Should list ProposalOptions with our newly created one', async () => {
        const proposalOptionCollection = await proposalOptionService.findAll();
        const proposalOption = proposalOptionCollection.toJSON();
        expect(proposalOption.length).toBe(3);

        const result = proposalOption[2];
        expect(result.id).toBe(createdProposalOption.id);
        expect(result.optionId).toBe(createdProposalOption.optionId);
        expect(result.description).toBe(createdProposalOption.description);
    });

    test('Should return one ProposalOption', async () => {
        const proposalOptionModel: ProposalOption = await proposalOptionService.findOne(createdProposalOption.id);
        const result = proposalOptionModel.toJSON();

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.Proposal).toBeDefined();
        expect(result.Proposal.id).toBe(createdProposal.id);
        expect(result.optionId).toBe(testData.optionId);
        expect(result.description).toBe(testData.description);
    });

    test('Should delete the ProposalOption', async () => {
        expect.assertions(1);
        await proposalOptionService.destroy(createdProposalOption.id);
        await proposalOptionService.findOne(createdProposalOption.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdProposalOption.id))
        );
    });

});
