import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { Vote } from '../../src/api/models/Vote';

import { VoteService } from '../../src/api/services/VoteService';

describe('Vote', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let voteService: VoteService;

    let createdId;

    const testData = {
        proposalOptionId: undefined, // TODO: Add test value
        voter: undefined, // TODO: Add test value
        block: undefined, // TODO: Add test value
        weight: undefined // TODO: Add test value
    };

    const testDataUpdated = {
        proposalOptionId: undefined, // TODO: Add test value
        voter: undefined, // TODO: Add test value
        block: undefined, // TODO: Add test value
        weight: undefined // TODO: Add test value
    };

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        voteService = app.IoC.getNamed<VoteService>(Types.Service, Targets.Service.VoteService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();
    });

    afterAll(async () => {
        //
    });

    /*
    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await voteService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });
    */

    test('Should create a new vote', async () => {
        // testData['related_id'] = 0;
        const voteModel: Vote = await voteService.create(testData);
        createdId = voteModel.Id;

        const result = voteModel.toJSON();

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.proposalOptionId).toBe(testData.proposalOptionId);
        expect(result.voter).toBe(testData.voter);
        expect(result.block).toBe(testData.block);
        expect(result.weight).toBe(testData.weight);
    });

    test('Should throw ValidationException because we want to create a empty vote', async () => {
        expect.assertions(1);
        await voteService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list votes with our new create one', async () => {
        const voteCollection = await voteService.findAll();
        const vote = voteCollection.toJSON();
        expect(vote.length).toBe(1);

        const result = vote[0];

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.proposalOptionId).toBe(testData.proposalOptionId);
        expect(result.voter).toBe(testData.voter);
        expect(result.block).toBe(testData.block);
        expect(result.weight).toBe(testData.weight);
    });

    test('Should return one vote', async () => {
        const voteModel: Vote = await voteService.findOne(createdId);
        const result = voteModel.toJSON();

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.proposalOptionId).toBe(testData.proposalOptionId);
        expect(result.voter).toBe(testData.voter);
        expect(result.block).toBe(testData.block);
        expect(result.weight).toBe(testData.weight);
    });

    /*
    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await voteService.update(createdId, testDataUpdated).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });
    */

    test('Should update the vote', async () => {
        // testDataUpdated['related_id'] = 0;
        const voteModel: Vote = await voteService.update(createdId, testDataUpdated);
        const result = voteModel.toJSON();

        // test the values
        // expect(result.value).toBe(testDataUpdated.value);
        expect(result.proposalOptionId).toBe(testDataUpdated.proposalOptionId);
        expect(result.voter).toBe(testDataUpdated.voter);
        expect(result.block).toBe(testDataUpdated.block);
        expect(result.weight).toBe(testDataUpdated.weight);
    });

    test('Should delete the vote', async () => {
        expect.assertions(1);
        await voteService.destroy(createdId);
        await voteService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

});
