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
import { Proposal } from '../../src/api/models/Proposal';
import { ProposalService } from '../../src/api/services/ProposalService';
import { ProposalType } from '../../src/api/enums/ProposalType';
import { ProposalCreateRequest } from '../../src/api/requests/ProposalCreateRequest';
import { ProposalUpdateRequest } from '../../src/api/requests/ProposalUpdateRequest';
import * as resources from 'resources';
import { ProposalOptionCreateRequest } from '../../src/api/requests/ProposalOptionCreateRequest';
import { ProposalSearchParams } from '../../src/api/requests/ProposalSearchParams';
import { SearchOrder } from '../../src/api/enums/SearchOrder';

describe('Proposal', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let proposalService: ProposalService;

    let createdId;
    let createdProposal1: resources.Proposal;
    let createdProposal2: resources.Proposal;

    const time = new Date().getTime();
    const testData = {
        submitter: 'partaddress',
        type: ProposalType.PUBLIC_VOTE,
        title:  'proposal x title',
        description: 'proposal to x',
        timeStart: time,
        postedAt: time,
        receivedAt: time + 10,
        expiredAt: time + 100
    } as ProposalCreateRequest;

    const testDataOptions = [{
        description: 'one'
    }, {
        description: 'two'
    }, {
        description: 'three'
    }] as ProposalOptionCreateRequest[];

    const testDataUpdated = {
        submitter: 'pqwer',
        type: ProposalType.PUBLIC_VOTE,
        title:  'proposal y title',
        description: 'proposal to y',
        timeStart: time + 200,
        postedAt: time + 200,
        receivedAt: time + 210,
        expiredAt: time + 300
    } as ProposalUpdateRequest;


    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        proposalService = app.IoC.getNamed<ProposalService>(Types.Service, Targets.Service.ProposalService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();
    });

    test('Should throw ValidationException because we want to create a empty Proposal', async () => {
        expect.assertions(1);
        await proposalService.create({} as ProposalCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new Proposal', async () => {

        const proposalModel: Proposal = await proposalService.create(testData);
        const result: resources.Proposal = proposalModel.toJSON();

        expect(result.type).toBe(testData.type);
        expect(result.title).toBe(testData.title);
        expect(result.description).toBe(testData.description);
        expect(result.submitter).toBe(testData.submitter);
        expect(result.timeStart).toBe(testData.timeStart);
        expect(result.postedAt).toBe(testData.postedAt);
        expect(result.receivedAt).toBe(testData.receivedAt);
        expect(result.expiredAt).toBe(testData.expiredAt);

        createdId = result.id;
        // todo: should test that creating proposal with options works too..
    });

    test('Should list Proposals with our newly created one', async () => {
        const proposalsModel = await proposalService.findAll();
        const proposals = proposalsModel.toJSON();
        expect(proposals.length).toBe(1);

        const result = proposals[0];
        expect(result.type).toBe(testData.type);
        expect(result.title).toBe(testData.title);
        expect(result.description).toBe(testData.description);
        expect(result.submitter).toBe(testData.submitter);
        expect(result.timeStart).toBe(testData.timeStart);
        expect(result.postedAt).toBe(testData.postedAt);
        expect(result.receivedAt).toBe(testData.receivedAt);
        expect(result.expiredAt).toBe(testData.expiredAt);
    });

    test('Should return one Proposal', async () => {
        const proposalModel: Proposal = await proposalService.findOne(createdId);
        const result = proposalModel.toJSON();

        expect(result.type).toBe(testData.type);
        expect(result.title).toBe(testData.title);
        expect(result.description).toBe(testData.description);
        expect(result.submitter).toBe(testData.submitter);
        expect(result.timeStart).toBe(testData.timeStart);
        expect(result.postedAt).toBe(testData.postedAt);
        expect(result.receivedAt).toBe(testData.receivedAt);
        expect(result.expiredAt).toBe(testData.expiredAt);
    });

    test('Should update the Proposal', async () => {
        testDataUpdated.postedAt = new Date().getTime();
        testDataUpdated.expiredAt = new Date().getTime() + 100000000;
        testDataUpdated.receivedAt = new Date().getTime();

        const proposalModel: Proposal = await proposalService.update(createdId, testDataUpdated);
        const result = proposalModel.toJSON();

        expect(result.type).toBe(testDataUpdated.type);
        expect(result.title).toBe(testDataUpdated.title);
        expect(result.description).toBe(testDataUpdated.description);
        expect(result.submitter).toBe(testDataUpdated.submitter);
        expect(result.timeStart).toBe(testDataUpdated.timeStart);
        expect(result.postedAt).toBe(testDataUpdated.postedAt);
        expect(result.receivedAt).toBe(testDataUpdated.receivedAt);
        expect(result.expiredAt).toBe(testDataUpdated.expiredAt);

    });

    test('Should delete the Proposal', async () => {
        expect.assertions(1);
        await proposalService.destroy(createdId);
        await proposalService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

    test('Should create a new Proposal with ProposalOptions', async () => {

        testData.timeStart = time;
        testData.postedAt = time;
        testData.receivedAt = time + 10;
        testData.expiredAt = time + 50;

        testData.options = testDataOptions;

        const proposalModel: Proposal = await proposalService.create(testData);
        const result = proposalModel.toJSON();

        expect(result.type).toBe(testData.type);
        expect(result.title).toBe(testData.title);
        expect(result.description).toBe(testData.description);
        expect(result.submitter).toBe(testData.submitter);
        expect(result.timeStart).toBe(testData.timeStart);
        expect(result.postedAt).toBe(testData.postedAt);
        expect(result.receivedAt).toBe(testData.receivedAt);
        expect(result.expiredAt).toBe(testData.expiredAt);

        expect(result.ProposalOptions).toBeDefined();
        expect(result.ProposalOptions).toHaveLength(3);

        createdProposal1 = result;
    });

    test('Should create another Proposal with different timeStart and expiredAt', async () => {

        testData.options = testDataOptions;
        testData.title = 'A new title otherwise we get an SQL UNIQUE constraint error because of proposal.hash being same.';
        testData.timeStart = time + 100;
        testData.postedAt = time + 100;
        testData.receivedAt = time + 110;
        testData.expiredAt = time + 150;

        const proposalModel: Proposal = await proposalService.create(testData);
        const result = proposalModel.toJSON();

        expect(result.type).toBe(testData.type);
        expect(result.title).toBe(testData.title);
        expect(result.description).toBe(testData.description);
        expect(result.submitter).toBe(testData.submitter);
        expect(result.timeStart).toBe(testData.timeStart);
        expect(result.postedAt).toBe(testData.postedAt);
        expect(result.receivedAt).toBe(testData.receivedAt);
        expect(result.expiredAt).toBe(testData.expiredAt);

        expect(result.ProposalOptions).toBeDefined();
        expect(result.ProposalOptions).toHaveLength(3);

        createdProposal2 = result;
    });

    test('Should find one Proposal ending after createdProposal2.timeStart time', async () => {

        const searchParams = {
            timeStart: createdProposal2.postedAt,
            timeEnd: '*',
            order: SearchOrder.ASC,
            type: ProposalType.PUBLIC_VOTE
        } as ProposalSearchParams;

        const proposalCollection = await proposalService.searchBy(searchParams, true);
        const proposals = proposalCollection.toJSON();
        expect(proposals).toHaveLength(1);
    });

    test('Should find no Proposals ending after createdProposal2.expiredAt time + 10', async () => {

        const timeStart = createdProposal2.expiredAt + 10;
        const searchParams = {
            timeStart,
            timeEnd: '*',
            order: SearchOrder.ASC,
            type: ProposalType.PUBLIC_VOTE
        } as ProposalSearchParams;

        const proposalCollection = await proposalService.searchBy(searchParams, true);
        const proposals = proposalCollection.toJSON();
        expect(proposals).toHaveLength(0);
    });

    test('Should find two Proposals ending before or at createdProposal2.expiredAt', async () => {

        const searchParams = {
            timeStart: '*',
            timeEnd: createdProposal2.expiredAt,
            order: SearchOrder.ASC,
            type: ProposalType.PUBLIC_VOTE
        } as ProposalSearchParams;

        const proposalCollection = await proposalService.searchBy(searchParams, true);
        const proposals = proposalCollection.toJSON();
        expect(proposals).toHaveLength(2);
    });

    test('Should find one Proposal ending before or at createdProposal1.expiredAt', async () => {

        const searchParams = {
            timeStart: '*',
            timeEnd: createdProposal1.expiredAt,
            order: SearchOrder.ASC,
            type: ProposalType.PUBLIC_VOTE
        } as ProposalSearchParams;

        const proposalCollection = await proposalService.searchBy(searchParams, true);
        const proposals = proposalCollection.toJSON();
        expect(proposals).toHaveLength(1);
    });

    test('Should find two Proposals starting and ending between createdProposal1.startTime and createdProposal2.expiredAt', async () => {

        const searchParams = {
            timeStart: createdProposal1.startTime,
            timeEnd: createdProposal2.expiredAt,
            order: SearchOrder.ASC,
            type: ProposalType.PUBLIC_VOTE
        } as ProposalSearchParams;

        const proposalCollection = await proposalService.searchBy(searchParams, true);
        const proposals = proposalCollection.toJSON();
        expect(proposals).toHaveLength(2);
    });

    test('Should create another Proposal with type ITEM_VOTE', async () => {

        testData.type = ProposalType.ITEM_VOTE;

        const proposalModel: Proposal = await proposalService.create(testData);
        createdId = proposalModel.Id;

        const result = proposalModel.toJSON();

        expect(result.type).toBe(testData.type);
        expect(result.title).toBe(testData.title);
        expect(result.description).toBe(testData.description);
        expect(result.submitter).toBe(testData.submitter);
        expect(result.timeStart).toBe(testData.timeStart);
        expect(result.postedAt).toBe(testData.postedAt);
        expect(result.receivedAt).toBe(testData.receivedAt);
        expect(result.expiredAt).toBe(testData.expiredAt);

        expect(result.ProposalOptions).toBeDefined();
        expect(result.ProposalOptions).toHaveLength(3);
    });

    test('Should search Proposals with type ITEM_VOTE', async () => {

        const searchParams = {
            timeStart: '*',
            timeEnd: '*',
            order: SearchOrder.ASC, type: ProposalType.ITEM_VOTE
        } as ProposalSearchParams;

        const proposalCollection = await proposalService.searchBy(searchParams, true);
        const proposals = proposalCollection.toJSON();
        expect(proposals).toHaveLength(1);
    });

});
