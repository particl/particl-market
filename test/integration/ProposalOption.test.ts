import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { ProposalOption } from '../../src/api/models/ProposalOption';

import { ProposalOptionService } from '../../src/api/services/ProposalOptionService';
import { ProposalOptionCreateRequest } from '../../src/api/requests/ProposalOptionCreateRequest';
import { ProposalOptionUpdateRequest } from '../../src/api/requests/ProposalOptionUpdateRequest';
import { ProposalType } from '../../src/api/enums/ProposalType';
import { ProposalCreateRequest } from '../../src/api/requests/ProposalCreateRequest';
import { Proposal } from '../../src/api/models/Proposal';
import { ProposalService } from '../../src/api/services/ProposalService';
import * as resources from 'resources';
import {ObjectHash} from '../../src/core/helpers/ObjectHash';
import {HashableObjectType} from '../../src/api/enums/HashableObjectType';

describe('ProposalOption', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let proposalOptionService: ProposalOptionService;
    let proposalService: ProposalService;

    let createdProposal: resources.Proposal;
    let createdProposalOption: resources.ProposalOption;

    const testData = {
        optionId: 0,
        // hash: 'asdf',
        description: 'Yes'
    } as ProposalOptionCreateRequest;

    const testDataUpdated = {
        optionId: 0,
        // hash: 'asdf',
        description: 'No'
    } as ProposalOptionUpdateRequest;

    let testDataHash;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        proposalService = app.IoC.getNamed<ProposalService>(Types.Service, Targets.Service.ProposalService);
        proposalOptionService = app.IoC.getNamed<ProposalOptionService>(Types.Service, Targets.Service.ProposalOptionService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        // create proposal
        const proposalTestData = {
            submitter: 'psubmitter',
            blockStart: 1000,
            blockEnd: 1010,
            // hash: 'asdf',
            type: ProposalType.PUBLIC_VOTE,
            title: 'titlex',
            description: 'proposal to x',
            options: [testData]
        } as ProposalCreateRequest;

        const proposalModel: Proposal = await proposalService.create(proposalTestData, true);
        createdProposal = proposalModel.toJSON();

    });

    afterAll(async () => {
        //
    });

    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await proposalOptionService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should throw ValidationException because we want to create a empty proposal option', async () => {
        expect.assertions(1);
        await proposalOptionService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new proposal option', async () => {

        testData.proposal_id = createdProposal.id;
        testData.proposalHash = createdProposal.hash;
        testDataHash = ObjectHash.getHash(testData, HashableObjectType.PROPOSALOPTION_CREATEREQUEST);

        const proposalOptionModel: ProposalOption = await proposalOptionService.create(testData);
        createdProposalOption = proposalOptionModel.toJSON();

        const result = proposalOptionModel.toJSON();

        log.debug('ProposalOption, result:', JSON.stringify(result, null, 2));
        log.debug('createdProposal:', JSON.stringify(createdProposal, null, 2));

        // test the values
        expect(result.Proposal).toBeDefined();
        expect(result.Proposal.id).toBe(createdProposal.id);
        expect(result.optionId).toBe(testData.optionId);
        expect(result.description).toBe(testData.description);
        expect(result.hash).toBe(testDataHash);
    });

    test('Should list proposal options with our new create one', async () => {
        const proposalOptionCollection = await proposalOptionService.findAll();
        const proposalOption = proposalOptionCollection.toJSON();
        expect(proposalOption.length).toBe(1);

        const result = proposalOption[0];

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.id).toBe(createdProposalOption.id);
        expect(result.optionId).toBe(testData.optionId);
        expect(result.description).toBe(testData.description);
        expect(result.hash).toBe(testDataHash);
    });

    test('Should return one proposal option', async () => {
        const proposalOptionModel: ProposalOption = await proposalOptionService.findOne(createdProposalOption.id);
        const result = proposalOptionModel.toJSON();

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.Proposal).toBeDefined();
        expect(result.Proposal.id).toBe(createdProposal.id);
        expect(result.optionId).toBe(testData.optionId);
        expect(result.description).toBe(testData.description);
        expect(result.hash).toBe(testDataHash);
    });

/*
    update not needed, to be able to update, we'd need to update also the Proposal

    test('Should update the proposal option', async () => {
        // testDataUpdated['related_id'] = 0;
        const proposalOptionModel: ProposalOption = await proposalOptionService.update(createdProposalOption.id, testDataUpdated);
        const result = proposalOptionModel.toJSON();

        testDataHash = ObjectHash.getHash(testDataUpdated, HashableObjectType.PROPOSALOPTION_CREATEREQUEST);

        // test the values
        // expect(result.value).toBe(testDataUpdated.value);
        expect(result.Proposal).toBeDefined();
        expect(result.Proposal.id).toBe(createdProposal.id);
        expect(result.optionId).toBe(testDataUpdated.optionId);
        expect(result.description).toBe(testDataUpdated.description);
        expect(result.hash).toBe(testDataHash);
    });
*/
    test('Should delete the proposal option', async () => {
        expect.assertions(1);
        await proposalOptionService.destroy(createdProposalOption.id);
        await proposalOptionService.findOne(createdProposalOption.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdProposalOption.id))
        );
    });

});
