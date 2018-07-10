import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { ProposalResult } from '../../src/api/models/ProposalResult';

import { ProposalResultService } from '../../src/api/services/ProposalResultService';

describe('ProposalResult', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let proposalResultService: ProposalResultService;

    let createdId;

    const testData = {
        proposalId: undefined, // TODO: Add test value
        block: undefined // TODO: Add test value
    };

    const testDataUpdated = {
        proposalId: undefined, // TODO: Add test value
        block: undefined // TODO: Add test value
    };

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        proposalResultService = app.IoC.getNamed<ProposalResultService>(Types.Service, Targets.Service.ProposalResultService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();
    });

    afterAll(async () => {
        //
    });

    /*
    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await proposalResultService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });
    */

    test('Should create a new proposal result', async () => {
        // testData['related_id'] = 0;
        const proposalResultModel: ProposalResult = await proposalResultService.create(testData);
        createdId = proposalResultModel.Id;

        const result = proposalResultModel.toJSON();

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.proposalId).toBe(testData.proposalId);
        expect(result.block).toBe(testData.block);
    });

    test('Should throw ValidationException because we want to create a empty proposal result', async () => {
        expect.assertions(1);
        await proposalResultService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list proposal results with our new create one', async () => {
        const proposalResultCollection = await proposalResultService.findAll();
        const proposalResult = proposalResultCollection.toJSON();
        expect(proposalResult.length).toBe(1);

        const result = proposalResult[0];

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.proposalId).toBe(testData.proposalId);
        expect(result.block).toBe(testData.block);
    });

    test('Should return one proposal result', async () => {
        const proposalResultModel: ProposalResult = await proposalResultService.findOne(createdId);
        const result = proposalResultModel.toJSON();

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.proposalId).toBe(testData.proposalId);
        expect(result.block).toBe(testData.block);
    });

    /*
    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await proposalResultService.update(createdId, testDataUpdated).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });
    */

    test('Should update the proposal result', async () => {
        // testDataUpdated['related_id'] = 0;
        const proposalResultModel: ProposalResult = await proposalResultService.update(createdId, testDataUpdated);
        const result = proposalResultModel.toJSON();

        // test the values
        // expect(result.value).toBe(testDataUpdated.value);
        expect(result.proposalId).toBe(testDataUpdated.proposalId);
        expect(result.block).toBe(testDataUpdated.block);
    });

    test('Should delete the proposal result', async () => {
        expect.assertions(1);
        await proposalResultService.destroy(createdId);
        await proposalResultService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

});
