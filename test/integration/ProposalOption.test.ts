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

describe('ProposalOption', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let proposalOptionService: ProposalOptionService;
    let proposalService: ProposalService;

    let createdProposalId;
    let createdId;

    const testData = {
        optionId: 0,
        description: 'Yes'
    } as ProposalOptionCreateRequest;

    const testDataUpdated = {
        optionId: 0,
        description: 'No'
    } as ProposalOptionUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        proposalService = app.IoC.getNamed<ProposalService>(Types.Service, Targets.Service.ProposalService);
        proposalOptionService = app.IoC.getNamed<ProposalOptionService>(Types.Service, Targets.Service.ProposalOptionService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        // create proposal
        const testData = {
            submitter: 'psubmitter',
            blockStart: 1000,
            blockEnd: 1010,
            hash: 'asdf',
            type: ProposalType.PUBLIC_VOTE,
            description: 'proposal to x'
        } as ProposalCreateRequest;

        const proposalModel: Proposal = await proposalService.create(testData);
        createdProposalId = proposalModel.Id;

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

        testData.proposal_id = createdProposalId;

        const proposalOptionModel: ProposalOption = await proposalOptionService.create(testData);
        createdId = proposalOptionModel.Id;

        const result = proposalOptionModel.toJSON();

        // test the values
        expect(result.Proposal).toBeDefined();
        expect(result.optionId).toBe(testData.optionId);
        expect(result.description).toBe(testData.description);
    });

    test('Should list proposal options with our new create one', async () => {
        const proposalOptionCollection = await proposalOptionService.findAll();
        const proposalOption = proposalOptionCollection.toJSON();
        expect(proposalOption.length).toBe(1);

        const result = proposalOption[0];

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.proposalId).toBe(testData.proposalId);
        expect(result.optionId).toBe(testData.optionId);
        expect(result.description).toBe(testData.description);
        expect(result.hash).toBe(testData.hash);
    });

    test('Should return one proposal option', async () => {
        const proposalOptionModel: ProposalOption = await proposalOptionService.findOne(createdId);
        const result = proposalOptionModel.toJSON();

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.proposalId).toBe(testData.proposalId);
        expect(result.optionId).toBe(testData.optionId);
        expect(result.description).toBe(testData.description);
        expect(result.hash).toBe(testData.hash);
    });

    /*
    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await proposalOptionService.update(createdId, testDataUpdated).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });
    */

    test('Should update the proposal option', async () => {
        // testDataUpdated['related_id'] = 0;
        const proposalOptionModel: ProposalOption = await proposalOptionService.update(createdId, testDataUpdated);
        const result = proposalOptionModel.toJSON();

        // test the values
        // expect(result.value).toBe(testDataUpdated.value);
        expect(result.proposalId).toBe(testDataUpdated.proposalId);
        expect(result.optionId).toBe(testDataUpdated.optionId);
        expect(result.description).toBe(testDataUpdated.description);
        expect(result.hash).toBe(testDataUpdated.hash);
    });

    test('Should delete the proposal option', async () => {
        expect.assertions(1);
        await proposalOptionService.destroy(createdId);
        await proposalOptionService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

});
