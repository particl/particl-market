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
import { ProposalService } from '../../src/api/services/model/ProposalService';
import { ProposalCreateRequest } from '../../src/api/requests/model/ProposalCreateRequest';
import { ProposalUpdateRequest } from '../../src/api/requests/model/ProposalUpdateRequest';
import { ProposalOptionCreateRequest } from '../../src/api/requests/model/ProposalOptionCreateRequest';
import { ProposalSearchParams } from '../../src/api/requests/search/ProposalSearchParams';
import { SearchOrder } from '../../src/api/enums/SearchOrder';
import { ProposalCategory } from '../../src/api/enums/ProposalCategory';
import { ConfigurableHasher } from 'omp-lib/dist/hasher/hash';
import { HashableProposalAddMessageConfig } from '../../src/api/factories/hashableconfig/message/HashableProposalAddMessageConfig';
import { HashableProposalAddField, HashableProposalOptionField } from '../../src/api/factories/hashableconfig/HashableField';
import { HashableProposalOptionMessageConfig } from '../../src/api/factories/hashableconfig/message/HashableProposalOptionMessageConfig';
import { DefaultMarketService } from '../../src/api/services/DefaultMarketService';
import { ProfileService } from '../../src/api/services/model/ProfileService';


describe('Proposal', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let proposalService: ProposalService;
    let profileService: ProfileService;
    let defaultMarketService: DefaultMarketService;

    let profile: resources.Profile;
    let market: resources.Market;

    let proposal1: resources.Proposal;
    let proposal2: resources.Proposal;
    let proposal3: resources.Proposal;
    let proposal4: resources.Proposal;

    const time = Date.now();

    const testData = {
        submitter: 'partaddress',
        msgid: 'msgid11111',
        market: 'marketreceiveaddress',
        category: ProposalCategory.PUBLIC_VOTE,
        target:  'targethashforproposal',
        title:  'proposal x title',
        description: 'proposal x description',
        timeStart: time,
        postedAt: time,
        receivedAt: time + 10,
        expiredAt: time + 100
    } as ProposalCreateRequest;

    const testDataOptions = [{
        optionId: 0,
        description: 'one',
        hash: 'hash'
    }, {
        optionId: 1,
        description: 'two',
        hash: 'hash'
    }, {
        optionId: 2,
        description: 'three',
        hash: 'hash'
    }] as ProposalOptionCreateRequest[];

    const testDataUpdated = {
        submitter: 'UPDATE',
        msgid: 'msgid22222',
        market: 'marketreceiveaddress',
        category: ProposalCategory.PUBLIC_VOTE,
        target:  'targethashforproposal',
        title:  'proposal y title',
        description: 'proposal to y',
        hash: '',
        timeStart: time + 200,
        postedAt: time + 200,
        receivedAt: time + 210,
        expiredAt: time + 300
    };


    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        proposalService = app.IoC.getNamed<ProposalService>(Types.Service, Targets.Service.model.ProposalService);

        defaultMarketService = app.IoC.getNamed<DefaultMarketService>(Types.Service, Targets.Service.DefaultMarketService);
        proposalService = app.IoC.getNamed<ProposalService>(Types.Service, Targets.Service.model.ProposalService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);

        profile = await profileService.getDefault().then(value => value.toJSON());
        market = await defaultMarketService.getDefaultForProfile(profile.id).then(value => value.toJSON());

    });

    test('Should throw ValidationException because we want to create a empty Proposal', async () => {
        expect.assertions(1);
        await proposalService.create({} as ProposalCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new Proposal without ProposalOptions', async () => {

        const result: resources.Proposal = await proposalService.create(addHashToCreateRequests(testData)).then(value => value.toJSON());

        expect(result.category).toBe(testData.category);
        expect(result.title).toBe(testData.title);
        expect(result.description).toBe(testData.description);
        expect(result.submitter).toBe(testData.submitter);
        expect(result.timeStart).toBe(testData.timeStart);
        expect(result.postedAt).toBe(testData.postedAt);
        expect(result.receivedAt).toBe(testData.receivedAt);
        expect(result.expiredAt).toBe(testData.expiredAt);

        proposal1 = result;

    });

    test('Should list Proposals with our newly created one', async () => {
        const proposals: resources.Proposal[] = await proposalService.findAll().then(value => value.toJSON());
        expect(proposals.length).toBe(1);

        const result = proposals[0];
        expect(result.category).toBe(testData.category);
        expect(result.title).toBe(testData.title);
        expect(result.description).toBe(testData.description);
        expect(result.submitter).toBe(testData.submitter);
        expect(result.timeStart).toBe(testData.timeStart);
        expect(result.postedAt).toBe(testData.postedAt);
        expect(result.receivedAt).toBe(testData.receivedAt);
        expect(result.expiredAt).toBe(testData.expiredAt);
    });

    test('Should return one Proposal', async () => {
        const result: resources.Proposal = await proposalService.findOne(proposal1.id).then(value => value.toJSON());

        expect(result.category).toBe(testData.category);
        expect(result.title).toBe(testData.title);
        expect(result.description).toBe(testData.description);
        expect(result.submitter).toBe(testData.submitter);
        expect(result.timeStart).toBe(testData.timeStart);
        expect(result.postedAt).toBe(testData.postedAt);
        expect(result.receivedAt).toBe(testData.receivedAt);
        expect(result.expiredAt).toBe(testData.expiredAt);
    });

    test('Should update the Proposal', async () => {
        const result: resources.Proposal = await proposalService.update(proposal1.id, addHashToCreateRequests(testDataUpdated)).then(value => value.toJSON());

        expect(result.category).toBe(testDataUpdated.category);
        expect(result.title).toBe(testDataUpdated.title);
        expect(result.description).toBe(testDataUpdated.description);
        expect(result.submitter).toBe(testDataUpdated.submitter);
        expect(result.timeStart).toBe(testDataUpdated.timeStart);
        expect(result.postedAt).toBe(testDataUpdated.postedAt);
        expect(result.receivedAt).toBe(testDataUpdated.receivedAt);
        expect(result.expiredAt).toBe(testDataUpdated.expiredAt);
        proposal1 = result;

        // log.debug('first proposal: ', JSON.stringify(result, null, 2));
    });

    test('Should create a new Proposal with ProposalOptions', async () => {

        testData.timeStart = time;
        testData.postedAt = time;
        testData.receivedAt = time + 10;
        testData.expiredAt = time + 50;

        testData.options = testDataOptions;

        const result: resources.Proposal = await proposalService.create(addHashToCreateRequests(testData, testDataOptions)).then(value => value.toJSON());
        expect(result.category).toBe(testData.category);
        expect(result.title).toBe(testData.title);
        expect(result.description).toBe(testData.description);
        expect(result.submitter).toBe(testData.submitter);
        expect(result.timeStart).toBe(testData.timeStart);
        expect(result.postedAt).toBe(testData.postedAt);
        expect(result.receivedAt).toBe(testData.receivedAt);
        expect(result.expiredAt).toBe(testData.expiredAt);

        expect(result.ProposalOptions).toBeDefined();
        expect(result.ProposalOptions).toHaveLength(3);

        proposal2 = result;
    });

    test('Should create another Proposal with different timeStart and expiredAt', async () => {

        testData.options = testDataOptions;
        testData.title = 'A new title otherwise we get an SQL UNIQUE constraint error because of proposal.hash being same.';
        testData.timeStart = time + 100;
        testData.postedAt = time + 100;
        testData.receivedAt = time + 110;
        testData.expiredAt = time + 150;

        const result: resources.Proposal = await proposalService.create(addHashToCreateRequests(testData, testDataOptions)).then(value => value.toJSON());

        expect(result.category).toBe(testData.category);
        expect(result.title).toBe(testData.title);
        expect(result.description).toBe(testData.description);
        expect(result.submitter).toBe(testData.submitter);
        expect(result.timeStart).toBe(testData.timeStart);
        expect(result.postedAt).toBe(testData.postedAt);
        expect(result.receivedAt).toBe(testData.receivedAt);
        expect(result.expiredAt).toBe(testData.expiredAt);

        expect(result.ProposalOptions).toBeDefined();
        expect(result.ProposalOptions).toHaveLength(3);

        proposal3 = result;
    });

    test('Should find one Proposal ending after time + 151', async () => {

        // proposal1.expiredAt: time + 300 (after update)
        // proposal2.expiredAt: time + 50
        // proposal3.expiredAt: time + 150
        expect(proposal1.expiredAt).toBe(time + 300);
        expect(proposal2.expiredAt).toBe(time + 50);
        expect(proposal3.expiredAt).toBe(time + 150);

        const searchParams = {
            timeStart: time + 151,
            // timeEnd: '*',
            order: SearchOrder.ASC,
            category: ProposalCategory.PUBLIC_VOTE
        } as ProposalSearchParams;

        const proposals: resources.Proposal[] = await proposalService.search(searchParams, true)
            .then(value => value.toJSON());
        expect(proposals).toHaveLength(1);
    });

    test('Should find no Proposals ending after time + 301', async () => {

        // proposal1.expiredAt: time + 300 (after update)
        // proposal2.expiredAt: time + 50
        // proposal3.expiredAt: time + 150
        expect(proposal1.expiredAt).toBe(time + 300);
        expect(proposal2.expiredAt).toBe(time + 50);
        expect(proposal3.expiredAt).toBe(time + 150);

        const searchParams = {
            timeStart: time + 301,
            // timeEnd: '*',
            order: SearchOrder.ASC,
            category: ProposalCategory.PUBLIC_VOTE
        } as ProposalSearchParams;

        const proposals: resources.Proposal[] = await proposalService.search(searchParams, true)
            .then(value => value.toJSON());
        expect(proposals).toHaveLength(0);
    });

    test('Should find two Proposals ending before time + 151', async () => {

        // proposal1.expiredAt: time + 300 (after update)
        // proposal2.expiredAt: time + 50
        // proposal3.expiredAt: time + 150
        expect(proposal1.expiredAt).toBe(time + 300);
        expect(proposal2.expiredAt).toBe(time + 50);
        expect(proposal3.expiredAt).toBe(time + 150);

        const searchParams = {
            // timeStart: '*',
            timeEnd: time + 151,
            order: SearchOrder.ASC,
            category: ProposalCategory.PUBLIC_VOTE
        } as ProposalSearchParams;

        const proposals: resources.Proposal[] = await proposalService.search(searchParams, true)
            .then(value => value.toJSON());
        expect(proposals).toHaveLength(2);
    });

    test('Should find one Proposal ending before or at time + 50', async () => {

        // proposal1.expiredAt: time + 300 (after update)
        // proposal2.expiredAt: time + 50
        // proposal3.expiredAt: time + 150
        expect(proposal1.expiredAt).toBe(time + 300);
        expect(proposal2.expiredAt).toBe(time + 50);
        expect(proposal3.expiredAt).toBe(time + 150);

        const searchParams = {
            // timeStart: '*',
            timeEnd: time + 50,
            order: SearchOrder.ASC,
            category: ProposalCategory.PUBLIC_VOTE
        } as ProposalSearchParams;

        const proposals: resources.Proposal[] = await proposalService.search(searchParams, true)
            .then(value => value.toJSON());
        expect(proposals).toHaveLength(1);
    });

    test('Should find three Proposals starting and ending between 0 and time + 301', async () => {

        // proposal1.expiredAt: time + 300 (after update)
        // proposal2.expiredAt: time + 50
        // proposal3.expiredAt: time + 150
        expect(proposal1.expiredAt).toBe(time + 300);
        expect(proposal2.expiredAt).toBe(time + 50);
        expect(proposal3.expiredAt).toBe(time + 150);

        const searchParams = {
            timeStart: 0,
            timeEnd: time + 301,
            order: SearchOrder.ASC,
            category: ProposalCategory.PUBLIC_VOTE
        } as ProposalSearchParams;

        const proposals: resources.Proposal[] = await proposalService.search(searchParams, true)
            .then(value => value.toJSON());
        expect(proposals).toHaveLength(3);
    });

    test('Should create another Proposal with category ITEM_VOTE', async () => {

        testData.category = ProposalCategory.ITEM_VOTE;
        testData.title = 'Changing the title again.';

        const result: resources.Proposal = await proposalService.create(addHashToCreateRequests(testData, testDataOptions)).then(value => value.toJSON());

        expect(result.category).toBe(testData.category);
        expect(result.title).toBe(testData.title);
        expect(result.description).toBe(testData.description);
        expect(result.submitter).toBe(testData.submitter);
        expect(result.timeStart).toBe(testData.timeStart);
        expect(result.postedAt).toBe(testData.postedAt);
        expect(result.receivedAt).toBe(testData.receivedAt);
        expect(result.expiredAt).toBe(testData.expiredAt);

        expect(result.ProposalOptions).toBeDefined();
        expect(result.ProposalOptions).toHaveLength(3);

        proposal4 = result;
    });

    test('Should delete the Proposal', async () => {
        expect.assertions(1);
        await proposalService.destroy(proposal1.id);
        await proposalService.findOne(proposal1.id).catch(e =>
            expect(e).toEqual(new NotFoundException(proposal1.id))
        );
    });

    test('Should searchBy Proposals with category ITEM_VOTE', async () => {

        const searchParams = {
            // timeStart: '*',
            // timeEnd: '*',
            order: SearchOrder.ASC,
            category: ProposalCategory.ITEM_VOTE
        } as ProposalSearchParams;

        const proposals: resources.Proposal[] = await proposalService.search(searchParams, true)
            .then(value => value.toJSON());
        expect(proposals).toHaveLength(1);
    });

    const addHashToCreateRequests = (proposalCreateRequest: any, optionsCreateRequests?: ProposalOptionCreateRequest[]) => {

        // hash the proposal
        let hashableOptions = '';
        if (optionsCreateRequests) {
            const optionsList: resources.ProposalOption[] = createOptionsList(optionsCreateRequests);
            for (const option of optionsList) {
                hashableOptions = hashableOptions + option.optionId + ':' + option.description + ':';
                option.hash = ConfigurableHasher.hash(option, new HashableProposalOptionMessageConfig([{
                    value: proposalCreateRequest.hash,
                    to: HashableProposalOptionField.PROPOSALOPTION_PROPOSAL_HASH
                }]));
            }
            proposalCreateRequest.options = optionsList;
        }
        proposalCreateRequest.hash = ConfigurableHasher.hash(proposalCreateRequest, new HashableProposalAddMessageConfig([{
            value: hashableOptions,
            to: HashableProposalAddField.PROPOSAL_OPTIONS
        }]));

        // log.debug('proposalCreateRequest: ', JSON.stringify(proposalCreateRequest, null, 2));

        return proposalCreateRequest;
    };

    const createOptionsList = (options: resources.ProposalOptionCreateRequest[]) => {
        const optionsList: ProposalOptionCreateRequest[] = [];

        for (const proposalOption of options) {
            const option = {
                optionId: proposalOption.optionId,
                description: proposalOption.description
            } as ProposalOptionCreateRequest;
            optionsList.push(option);
        }
        optionsList.sort(((a, b) => a.optionId > b.optionId ? 1 : -1));

        return optionsList;
    };

});

