import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { Proposal } from '../../src/api/models/Proposal';

import { ProposalService } from '../../src/api/services/ProposalService';

describe('Proposal', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let proposalService: ProposalService;

    let createdId;

    const testData = {
        submitter: undefined, // TODO: Add test value
        blockStart: undefined, // TODO: Add test value
        blockEnd: undefined, // TODO: Add test value
        createdAt: undefined, // TODO: Add test value
        submitter: undefined, // TODO: Add test value
        hash: undefined, // TODO: Add test value
        type: undefined, // TODO: Add test value
        description: undefined // TODO: Add test value
    };

    const testDataUpdated = {
        submitter: undefined, // TODO: Add test value
        blockStart: undefined, // TODO: Add test value
        blockEnd: undefined, // TODO: Add test value
        createdAt: undefined, // TODO: Add test value
        submitter: undefined, // TODO: Add test value
        hash: undefined, // TODO: Add test value
        type: undefined, // TODO: Add test value
        description: undefined // TODO: Add test value
    };

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        proposalService = app.IoC.getNamed<ProposalService>(Types.Service, Targets.Service.ProposalService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();
    });

    afterAll(async () => {
        //
    });

    /*
    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await proposalService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });
    */

    test('Should create a new proposal', async () => {
        // testData['related_id'] = 0;
        const proposalModel: Proposal = await proposalService.create(testData);
        createdId = proposalModel.Id;

        const result = proposalModel.toJSON();

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.submitter).toBe(testData.submitter);
        expect(result.blockStart).toBe(testData.blockStart);
        expect(result.blockEnd).toBe(testData.blockEnd);
        expect(result.createdAt).toBe(testData.createdAt);
        expect(result.submitter).toBe(testData.submitter);
        expect(result.hash).toBe(testData.hash);
        expect(result.type).toBe(testData.type);
        expect(result.description).toBe(testData.description);
    });

    test('Should throw ValidationException because we want to create a empty proposal', async () => {
        expect.assertions(1);
        await proposalService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list proposals with our new create one', async () => {
        const proposalCollection = await proposalService.findAll();
        const proposal = proposalCollection.toJSON();
        expect(proposal.length).toBe(1);

        const result = proposal[0];

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.submitter).toBe(testData.submitter);
        expect(result.blockStart).toBe(testData.blockStart);
        expect(result.blockEnd).toBe(testData.blockEnd);
        expect(result.createdAt).toBe(testData.createdAt);
        expect(result.submitter).toBe(testData.submitter);
        expect(result.hash).toBe(testData.hash);
        expect(result.type).toBe(testData.type);
        expect(result.description).toBe(testData.description);
    });

    test('Should return one proposal', async () => {
        const proposalModel: Proposal = await proposalService.findOne(createdId);
        const result = proposalModel.toJSON();

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.submitter).toBe(testData.submitter);
        expect(result.blockStart).toBe(testData.blockStart);
        expect(result.blockEnd).toBe(testData.blockEnd);
        expect(result.createdAt).toBe(testData.createdAt);
        expect(result.submitter).toBe(testData.submitter);
        expect(result.hash).toBe(testData.hash);
        expect(result.type).toBe(testData.type);
        expect(result.description).toBe(testData.description);
    });

    /*
    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await proposalService.update(createdId, testDataUpdated).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });
    */

    test('Should update the proposal', async () => {
        // testDataUpdated['related_id'] = 0;
        const proposalModel: Proposal = await proposalService.update(createdId, testDataUpdated);
        const result = proposalModel.toJSON();

        // test the values
        // expect(result.value).toBe(testDataUpdated.value);
        expect(result.submitter).toBe(testDataUpdated.submitter);
        expect(result.blockStart).toBe(testDataUpdated.blockStart);
        expect(result.blockEnd).toBe(testDataUpdated.blockEnd);
        expect(result.createdAt).toBe(testDataUpdated.createdAt);
        expect(result.submitter).toBe(testDataUpdated.submitter);
        expect(result.hash).toBe(testDataUpdated.hash);
        expect(result.type).toBe(testDataUpdated.type);
        expect(result.description).toBe(testDataUpdated.description);
    });

    test('Should delete the proposal', async () => {
        expect.assertions(1);
        await proposalService.destroy(createdId);
        await proposalService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

});
