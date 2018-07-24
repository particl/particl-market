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
import { ProposalOptionResultUpdateRequest } from '../../src/api/requests/ProposalOptionResultUpdateRequest';
import { ProposalService } from '../../src/api/services/ProposalService';
import { ProposalType } from '../../src/api/enums/ProposalType';
import { ProposalCreateRequest } from '../../src/api/requests/ProposalCreateRequest';
import { Proposal } from '../../src/api/models/Proposal';
import * as resources from 'resources';
import { ProposalResultCreateRequest } from '../../src/api/requests/ProposalResultCreateRequest';
import { ProposalResult } from '../../src/api/models/ProposalResult';
import { ProposalResultService } from '../../src/api/services/ProposalResultService';

describe('ProposalOptionResult', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let proposalService: ProposalService;
    let proposalResultService: ProposalResultService;
    let proposalOptionResultService: ProposalOptionResultService;

    let createdId;
    let createdProposal: resources.Proposal;
    let createdProposalResult: resources.ProposalResult;


    const testData = {
        // proposal_result_id: 0,
        // proposal_option_id: 0,
        weight: 1,
        voters: 1
    } as ProposalOptionResultCreateRequest;

    const testDataUpdated = {
        weight: 2,
        voters: 2
    } as ProposalOptionResultUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        proposalService = app.IoC.getNamed<ProposalService>(Types.Service, Targets.Service.ProposalService);
        proposalResultService = app.IoC.getNamed<ProposalResultService>(Types.Service, Targets.Service.ProposalResultService);
        proposalOptionResultService = app.IoC.getNamed<ProposalOptionResultService>(Types.Service, Targets.Service.ProposalOptionResultService);

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

        const proposalModel: Proposal = await proposalService.create(proposalTestData);
        createdProposal = proposalModel.toJSON();

        log.debug('createdProposal:', JSON.stringify(createdProposal, null, 2));

        const proposalResult = {
            proposal_id: createdProposal.id,
            block: 1
        } as ProposalResultCreateRequest;

        const proposalResultModel: ProposalResult = await proposalResultService.create(proposalResult);
        createdProposalResult = proposalResultModel.toJSON();

        log.debug('createdProposalResult:', JSON.stringify(createdProposalResult, null, 2));

    });

    afterAll(async () => {
        //
    });

    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await proposalOptionResultService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should throw ValidationException because we want to create a empty proposal option result', async () => {
        expect.assertions(1);
        await proposalOptionResultService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new ProposalOptionResult', async () => {

        testData.proposal_result_id = createdProposalResult.id;
        testData.proposal_option_id = createdProposal.ProposalOptions[0].id;

        const proposalOptionResultModel: ProposalOptionResult = await proposalOptionResultService.create(testData);
        createdId = proposalOptionResultModel.Id;

        const result = proposalOptionResultModel.toJSON();

        // test the values
        expect(result.ProposalResult).toBeDefined();
        expect(result.ProposalResult.id).toBe(createdProposalResult.id);
        expect(result.ProposalOption).toBeDefined();
        expect(result.ProposalOption.id).toBe(createdProposal.ProposalOptions[0].id);
        expect(result.weight).toBe(testData.weight);
        expect(result.voters).toBe(testData.voters);
    });

    test('Should list ProposalOptionResults with our new create one', async () => {
        const proposalOptionResultCollection = await proposalOptionResultService.findAll();
        const proposalOptionResult = proposalOptionResultCollection.toJSON();
        expect(proposalOptionResult.length).toBe(1);

        const result = proposalOptionResult[0];

        expect(result.weight).toBe(testData.weight);
        expect(result.voters).toBe(testData.voters);
    });

    test('Should return one ProposalOptionResult', async () => {
        const proposalOptionResultModel: ProposalOptionResult = await proposalOptionResultService.findOne(createdId);
        const result = proposalOptionResultModel.toJSON();

        // test the values
        expect(result.ProposalResult).toBeDefined();
        expect(result.ProposalResult.id).toBe(createdProposalResult.id);
        expect(result.ProposalOption).toBeDefined();
        expect(result.ProposalOption.id).toBe(createdProposal.ProposalOptions[0].id);
        expect(result.weight).toBe(testData.weight);
        expect(result.voters).toBe(testData.voters);
    });

    test('Should update the ProposalOptionResult', async () => {
        // testDataUpdated['related_id'] = 0;
        const proposalOptionResultModel: ProposalOptionResult = await proposalOptionResultService.update(createdId, testDataUpdated);
        const result = proposalOptionResultModel.toJSON();

        // test the values
        expect(result.ProposalResult).toBeDefined();
        expect(result.ProposalResult.id).toBe(createdProposalResult.id);
        expect(result.ProposalOption).toBeDefined();
        expect(result.ProposalOption.id).toBe(createdProposal.ProposalOptions[0].id);
        expect(result.weight).toBe(testDataUpdated.weight);
        expect(result.voters).toBe(testDataUpdated.voters);
    });

    test('Should delete the ProposalOptionResult', async () => {
        expect.assertions(1);
        await proposalOptionResultService.destroy(createdId);
        await proposalOptionResultService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

});
