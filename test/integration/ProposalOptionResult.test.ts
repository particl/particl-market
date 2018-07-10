import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { ProposalOptionResult } from '../../src/api/models/ProposalOptionResult';

import { ProposalOptionResultService } from '../../src/api/services/ProposalOptionResultService';

describe('ProposalOptionResult', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let proposalOptionResultService: ProposalOptionResultService;

    let createdId;

    const testData = {
        proposalResultId: undefined, // TODO: Add test value
        proposalOptionId: undefined, // TODO: Add test value
        weight: undefined, // TODO: Add test value
        voterCount: undefined // TODO: Add test value
    };

    const testDataUpdated = {
        proposalResultId: undefined, // TODO: Add test value
        proposalOptionId: undefined, // TODO: Add test value
        weight: undefined, // TODO: Add test value
        voterCount: undefined // TODO: Add test value
    };

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        proposalOptionResultService = app.IoC.getNamed<ProposalOptionResultService>(Types.Service, Targets.Service.ProposalOptionResultService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();
    });

    afterAll(async () => {
        //
    });

    /*
    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await proposalOptionResultService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });
    */

    test('Should create a new proposal option result', async () => {
        // testData['related_id'] = 0;
        const proposalOptionResultModel: ProposalOptionResult = await proposalOptionResultService.create(testData);
        createdId = proposalOptionResultModel.Id;

        const result = proposalOptionResultModel.toJSON();

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.proposalResultId).toBe(testData.proposalResultId);
        expect(result.proposalOptionId).toBe(testData.proposalOptionId);
        expect(result.weight).toBe(testData.weight);
        expect(result.voterCount).toBe(testData.voterCount);
    });

    test('Should throw ValidationException because we want to create a empty proposal option result', async () => {
        expect.assertions(1);
        await proposalOptionResultService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list proposal option results with our new create one', async () => {
        const proposalOptionResultCollection = await proposalOptionResultService.findAll();
        const proposalOptionResult = proposalOptionResultCollection.toJSON();
        expect(proposalOptionResult.length).toBe(1);

        const result = proposalOptionResult[0];

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.proposalResultId).toBe(testData.proposalResultId);
        expect(result.proposalOptionId).toBe(testData.proposalOptionId);
        expect(result.weight).toBe(testData.weight);
        expect(result.voterCount).toBe(testData.voterCount);
    });

    test('Should return one proposal option result', async () => {
        const proposalOptionResultModel: ProposalOptionResult = await proposalOptionResultService.findOne(createdId);
        const result = proposalOptionResultModel.toJSON();

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.proposalResultId).toBe(testData.proposalResultId);
        expect(result.proposalOptionId).toBe(testData.proposalOptionId);
        expect(result.weight).toBe(testData.weight);
        expect(result.voterCount).toBe(testData.voterCount);
    });

    /*
    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await proposalOptionResultService.update(createdId, testDataUpdated).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });
    */

    test('Should update the proposal option result', async () => {
        // testDataUpdated['related_id'] = 0;
        const proposalOptionResultModel: ProposalOptionResult = await proposalOptionResultService.update(createdId, testDataUpdated);
        const result = proposalOptionResultModel.toJSON();

        // test the values
        // expect(result.value).toBe(testDataUpdated.value);
        expect(result.proposalResultId).toBe(testDataUpdated.proposalResultId);
        expect(result.proposalOptionId).toBe(testDataUpdated.proposalOptionId);
        expect(result.weight).toBe(testDataUpdated.weight);
        expect(result.voterCount).toBe(testDataUpdated.voterCount);
    });

    test('Should delete the proposal option result', async () => {
        expect.assertions(1);
        await proposalOptionResultService.destroy(createdId);
        await proposalOptionResultService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

});
