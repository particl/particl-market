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
import { ProfileService } from '../../src/api/services/model/ProfileService';
import { MarketService } from '../../src/api/services/model/MarketService';
import { ListingItemService } from '../../src/api/services/model/ListingItemService';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { TestDataGenerateRequest } from '../../src/api/requests/testdata/TestDataGenerateRequest';
import { FlaggedItemService } from '../../src/api/services/model/FlaggedItemService';
import { ProposalService } from '../../src/api/services/model/ProposalService';
import { GenerateProposalParams } from '../../src/api/requests/testdata/GenerateProposalParams';
import { FlaggedItemCreateRequest } from '../../src/api/requests/model/FlaggedItemCreateRequest';
import { FlaggedItem } from '../../src/api/models/FlaggedItem';
import { FlaggedItemUpdateRequest } from '../../src/api/requests/model/FlaggedItemUpdateRequest';
import { GenerateListingItemTemplateParams } from '../../src/api/requests/testdata/GenerateListingItemTemplateParams';

describe('FlaggedItem', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let flaggedItemService: FlaggedItemService;
    let profileService: ProfileService;
    let marketService: MarketService;
    let listingItemService: ListingItemService;
    let proposalService: ProposalService;

    let profile: resources.Profile;
    let market: resources.Market;

    let listingItem: resources.ListingItem;
    let proposal: resources.Proposal;
    let flaggedItem: resources.FlaggedItem;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        flaggedItemService = app.IoC.getNamed<FlaggedItemService>(Types.Service, Targets.Service.model.FlaggedItemService);
        proposalService = app.IoC.getNamed<ProposalService>(Types.Service, Targets.Service.model.ProposalService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.model.ListingItemService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        profile = await profileService.getDefault().then(value => value.toJSON());
        market = await marketService.getDefaultForProfile(profile.id).then(value => value.toJSON());

        const generateParams = new GenerateListingItemTemplateParams([
            true,       // generateItemInformation
            true,       // generateItemLocation
            false,      // generateShippingDestinations
            false,      // generateItemImages
            false,      // generatePaymentInformation
            false,      // generateEscrow
            false,      // generateItemPrice
            false,      // generateMessagingInformation
            false,      // generateListingItemObjects
            false,      // generateObjectDatas
            profile.id, // profileId
            true,       // generateListingItem
            market.id   // marketId
        ]).toParamsArray();
        const listingItemTemplates = await testDataService.generate({
            model: CreatableModel.LISTINGITEMTEMPLATE,
            amount: 1,
            withRelated: true,
            generateParams
        } as TestDataGenerateRequest);
        listingItem = listingItemTemplates[0].ListingItems[0];

        // create Proposal
        const generateProposalParams = new GenerateProposalParams([
            false,                                      // generateListingItemTemplate
            false,                                      // generateListingItem
            listingItem.hash,                    // listingItemHash,
            false,                                      // generatePastProposal,
            0,                                          // voteCount
            profile.address                      // submitter
        ]).toParamsArray();

        const proposals = await testDataService.generate({
            model: CreatableModel.PROPOSAL,             // what to generate
            amount: 1,                                  // how many to generate
            withRelated: true,                          // return model
            generateParams: generateProposalParams      // what kind of data to generate
        } as TestDataGenerateRequest);
        proposal = proposals[0];

    });


    test('Should throw ValidationException because invalid request body', async () => {
        expect.assertions(1);
        await flaggedItemService.create({} as FlaggedItemCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new FlaggedItem', async () => {
        const testData = {
            listing_item_id: listingItem.id,
            proposal_id: proposal.id,
            reason: 'I AM SO OFFENDED BY THIS'
        } as FlaggedItemCreateRequest;

        const flaggedItemModel: FlaggedItem = await flaggedItemService.create(testData);
        flaggedItem = flaggedItemModel.toJSON();

        expect(flaggedItem.Proposal.id).toBe(proposal.id);
        expect(flaggedItem.ListingItem.id).toBe(listingItem.id);
    });

    test('Should list FlaggedItems with our newly created one', async () => {
        const flaggedItemCollection = await flaggedItemService.findAll();
        const flaggedItems = flaggedItemCollection.toJSON();
        expect(flaggedItems.length).toBe(1);
    });

    test('Should return one FlaggedItem', async () => {
        const flaggedItemModel: FlaggedItem = await flaggedItemService.findOne(flaggedItem.id);
        const result: resources.FlaggedItem = flaggedItemModel.toJSON();
        expect(result.Proposal.id).toBe(flaggedItem.Proposal.id);
        expect(result.ListingItem.id).toBe(listingItem.id);
    });

    test('Should throw ValidationException because there is no reason', async () => {
        expect.assertions(1);
        const testData = {} as FlaggedItemUpdateRequest;

        await flaggedItemService.update(flaggedItem.id, testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should update the FlaggedItem', async () => {
        const testData = {
            reason: 'REASON'
        } as FlaggedItemUpdateRequest;

        const flaggedItemModel: FlaggedItem = await flaggedItemService.update(flaggedItem.id, testData);
        const result: resources.FlaggedItem = flaggedItemModel.toJSON();

        // test the values
        expect(result.Proposal.id).toBe(flaggedItem.Proposal.id);
        expect(result.ListingItem.id).toBe(flaggedItem.ListingItem.id);

        flaggedItem = result;
    });

    test('Should delete the FlaggedItem', async () => {
        expect.assertions(1);
        await flaggedItemService.destroy(flaggedItem.id);
        await flaggedItemService.findOne(flaggedItem.id).catch(e =>
            expect(e).toEqual(new NotFoundException(flaggedItem.id))
        );
    });

});
