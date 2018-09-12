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

describe('ProposalResult', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let proposalResultService: ProposalResultService;
    let proposalService: ProposalService;

    let createdId;
    let createdProposal: resources.Proposal;

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

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        const proposalOptions = [{
            optionId: 0,
            // hash: 'asdf',
            description: 'Yes'
        }, {
            optionId: 1,
            // hash: 'asdf',
            description: 'No'
        }];

        // create proposal
        const proposalTestData = {
            submitter: 'psubmitter',
            blockStart: 1000,
            blockEnd: 1010,
            // hash: 'asdf',
            type: ProposalType.PUBLIC_VOTE,
            title: 'titlex',
            description: 'proposal to x',
            options: proposalOptions
        } as ProposalCreateRequest;

        const proposalModel: Proposal = await proposalService.create(proposalTestData, true);
        createdProposal = proposalModel.toJSON();

    });

    afterAll(async () => {
        //
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
        createdId = proposalResultModel.Id;

        const result = proposalResultModel.toJSON();

        // test the values
        expect(result.Proposal).toBeDefined();
        expect(result.Proposal.id).toBe(createdProposal.id);
        expect(result.block).toBe(testData.block);
    });

    test('Should list ProposalResults with our new create one', async () => {
        const proposalResultCollection = await proposalResultService.findAll();
        const proposalResult = proposalResultCollection.toJSON();
        expect(proposalResult.length).toBe(1);

        const result = proposalResult[0];

        // test the values
        expect(result.Proposal).not.toBeDefined();
        // expect(result.Proposal.id).toBe(createdProposal.id);
        expect(result.block).toBe(testData.block);
    });

    test('Should return one ProposalResult', async () => {
        const proposalResultModel: ProposalResult = await proposalResultService.findOne(createdId);
        const result = proposalResultModel.toJSON();

        // test the values
        expect(result.Proposal).toBeDefined();
        expect(result.Proposal.id).toBe(createdProposal.id);
        expect(result.block).toBe(testData.block);
    });

    test('Should update the ProposalResult', async () => {
        // testDataUpdated['related_id'] = 0;
        const proposalResultModel: ProposalResult = await proposalResultService.update(createdId, testDataUpdated);
        const result = proposalResultModel.toJSON();

        // test the values
        expect(result.Proposal).toBeDefined();
        expect(result.Proposal.id).toBe(createdProposal.id);
        expect(result.block).toBe(testDataUpdated.block);
    });

    test('Should delete the ProposalResult', async () => {
        expect.assertions(1);
        await proposalResultService.destroy(createdId);
        await proposalResultService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

});
