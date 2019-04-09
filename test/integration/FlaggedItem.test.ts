// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { app } from '../../src/app';
import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { ProfileService } from '../../src/api/services/model/ProfileService';
import { MarketService } from '../../src/api/services/model/MarketService';
import { ListingItemService } from '../../src/api/services/model/ListingItemService';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import * as resources from 'resources';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { GenerateListingItemParams } from '../../src/api/requests/params/GenerateListingItemParams';
import { TestDataGenerateRequest } from '../../src/api/requests/TestDataGenerateRequest';
import { FlaggedItemService } from '../../src/api/services/model/FlaggedItemService';
import { ProposalService } from '../../src/api/services/model/ProposalService';
import { GenerateProposalParams } from '../../src/api/requests/params/GenerateProposalParams';
import { FlaggedItemCreateRequest } from '../../src/api/requests/FlaggedItemCreateRequest';
import { FlaggedItem } from '../../src/api/models/FlaggedItem';
import { FlaggedItemUpdateRequest } from '../../src/api/requests/FlaggedItemUpdateRequest';

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

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;

    let createdListingItem: resources.ListingItem;
    let createdProposal: resources.Proposal;
    let createdFlaggedItem: resources.FlaggedItem;

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

        // get default profile
        defaultProfile = await profileService.getDefault().then(value => value.toJSON());

        // get default market
        defaultMarket = await marketService.getDefault().then(value => value.toJSON());

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
            0,                                          // voteCount
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


    test('Should throw ValidationException because invalid request body', async () => {
        expect.assertions(1);
        await flaggedItemService.create({} as FlaggedItemCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new FlaggedItem', async () => {
        const testData = {
            listing_item_id: createdListingItem.id,
            proposal_id: createdProposal.id,
            reason: 'I AM SO OFFENDED BY THIS'
        } as FlaggedItemCreateRequest;

        const flaggedItemModel: FlaggedItem = await flaggedItemService.create(testData);
        createdFlaggedItem = flaggedItemModel.toJSON();

        expect(createdFlaggedItem.Proposal.id).toBe(createdProposal.id);
        expect(createdFlaggedItem.ListingItem.id).toBe(createdListingItem.id);
    });

    test('Should list FlaggedItems with our newly created one', async () => {
        const flaggedItemCollection = await flaggedItemService.findAll();
        const flaggedItems = flaggedItemCollection.toJSON();
        expect(flaggedItems.length).toBe(1);
    });

    test('Should return one FlaggedItem', async () => {
        const flaggedItemModel: FlaggedItem = await flaggedItemService.findOne(createdFlaggedItem.id);
        const result: resources.FlaggedItem = flaggedItemModel.toJSON();
        expect(result.Proposal.id).toBe(createdFlaggedItem.Proposal.id);
        expect(result.ListingItem.id).toBe(createdListingItem.id);
    });

    test('Should throw ValidationException because there is no reason', async () => {
        expect.assertions(1);
        const testData = {} as FlaggedItemUpdateRequest;

        await flaggedItemService.update(createdFlaggedItem.id, testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should update the FlaggedItem', async () => {
        const testData = {
            reason: 'REASON'
        } as FlaggedItemUpdateRequest;

        const flaggedItemModel: FlaggedItem = await flaggedItemService.update(createdFlaggedItem.id, testData);
        const result: resources.FlaggedItem = flaggedItemModel.toJSON();

        // test the values
        expect(result.Proposal.id).toBe(createdFlaggedItem.Proposal.id);
        expect(result.ListingItem.id).toBe(createdFlaggedItem.ListingItem.id);

        createdFlaggedItem = result;
    });

    test('Should delete the FlaggedItem', async () => {
        expect.assertions(1);
        await flaggedItemService.destroy(createdFlaggedItem.id);
        await flaggedItemService.findOne(createdFlaggedItem.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdFlaggedItem.id))
        );
    });

});
