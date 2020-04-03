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
import { ProposalOptionService } from '../../src/api/services/model/ProposalOptionService';
import { ProposalOptionCreateRequest } from '../../src/api/requests/model/ProposalOptionCreateRequest';
import { ProposalOptionUpdateRequest } from '../../src/api/requests/model/ProposalOptionUpdateRequest';
import { ProposalService } from '../../src/api/services/model/ProposalService';
import { ProfileService } from '../../src/api/services/model/ProfileService';
import { MarketService } from '../../src/api/services/model/MarketService';
import { ItemVote } from '../../src/api/enums/ItemVote';
import { ListingItemService } from '../../src/api/services/model/ListingItemService';
import { ListingItemTemplateService } from '../../src/api/services/model/ListingItemTemplateService';

describe('ProposalOption', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let proposalService: ProposalService;
    let proposalOptionService: ProposalOptionService;
    let profileService: ProfileService;
    let marketService: MarketService;
    let listingItemService: ListingItemService;
    let listingItemTemplateService: ListingItemTemplateService;

    let bidderMarket: resources.Market;
    let bidderProfile: resources.Profile;
    let sellerProfile: resources.Profile;
    let sellerMarket: resources.Market;
    let listingItem: resources.ListingItem;
    let listingItemTemplate: resources.ListingItemTemplate;

    let proposal: resources.Proposal;
    let proposalOption: resources.ProposalOption;

    const testData = {
        optionId: 0,
        description: ItemVote.REMOVE + '',
        hash: Faker.random.uuid()
    } as ProposalOptionCreateRequest;

    const testDataUpdated = {
        optionId: 1,
        description: ItemVote.KEEP + '',
        hash: Faker.random.uuid()
    } as ProposalOptionUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        proposalService = app.IoC.getNamed<ProposalService>(Types.Service, Targets.Service.model.ProposalService);
        proposalOptionService = app.IoC.getNamed<ProposalOptionService>(Types.Service, Targets.Service.model.ProposalOptionService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.model.ListingItemService);
        listingItemTemplateService = app.IoC.getNamed<ListingItemTemplateService>(Types.Service, Targets.Service.model.ListingItemTemplateService);

        bidderProfile = await profileService.getDefault().then(value => value.toJSON());
        bidderMarket = await marketService.getDefaultForProfile(bidderProfile.id).then(value => value.toJSON());

        sellerProfile = await testDataService.generateProfile();
        sellerMarket = await marketService.getDefaultForProfile(sellerProfile.id).then(value => value.toJSON());

        listingItem = await testDataService.generateListingItemWithTemplate(sellerProfile, bidderMarket);
        listingItemTemplate = await listingItemTemplateService.findOne(listingItem.ListingItemTemplate.id).then(value => value.toJSON());

        proposal = await testDataService.generateProposal(listingItem.id, bidderMarket, false);

    });

    test('Should throw ValidationException because we want to create a empty ProposalOption', async () => {
        expect.assertions(1);
        await proposalOptionService.create({} as ProposalOptionCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await proposalOptionService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new ProposalOption', async () => {

        log.debug('proposal: ', JSON.stringify(proposal, null, 2));

        testData.proposal_id = proposal.id;

        proposalOption = await proposalOptionService.create(testData).then(value => value.toJSON());
        const result: resources.ProposalOption = proposalOption;

        expect(result.Proposal.id).toBe(proposal.id);
        expect(result.optionId).toBe(testData.optionId);
        expect(result.description).toBe(testData.description);
        expect(result.hash).toBe(testData.hash);

        proposal = await proposalService.findOne(proposal.id).then(value => value.toJSON());
        expect(proposal.ProposalOptions.length).toBe(1);

    });

    test('Should list ProposalOptions with our newly created one', async () => {
        const proposalOptions: resources.ProposalOption[] = await proposalOptionService.findAll().then(value => value.toJSON());
        expect(proposalOptions.length).toBe(1);

        const result = proposalOptions[0];
        expect(result.id).toBe(proposalOption.id);
        expect(result.optionId).toBe(proposalOption.optionId);
        expect(result.description).toBe(proposalOption.description);
    });

    test('Should return one ProposalOption', async () => {
        proposalOption = await proposalOptionService.findOne(proposalOption.id).then(value => value.toJSON());
        const result: resources.ProposalOption = proposalOption;

        expect(result.Proposal).toBeDefined();
        expect(result.Proposal.id).toBe(proposal.id);
        expect(result.optionId).toBe(testData.optionId);
        expect(result.description).toBe(testData.description);
    });

    test('Should delete the ProposalOption', async () => {
        expect.assertions(1);
        await proposalOptionService.destroy(proposalOption.id);
        await proposalOptionService.findOne(proposalOption.id).catch(e =>
            expect(e).toEqual(new NotFoundException(proposalOption.id))
        );
    });

});
