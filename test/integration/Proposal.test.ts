import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { Proposal } from '../../src/api/models/Proposal';

import { ProposalService } from '../../src/api/services/ProposalService';
import {ProposalType} from '../../src/api/enums/ProposalType';
import {ProposalCreateRequest} from '../../src/api/requests/ProposalCreateRequest';
import {ProposalUpdateRequest} from '../../src/api/requests/ProposalUpdateRequest';
import {HashableObjectType} from '../../src/api/enums/HashableObjectType';
import {ObjectHash} from '../../src/core/helpers/ObjectHash';

describe('Proposal', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let proposalService: ProposalService;

    let createdId;

    const testData = {
        submitter: 'pasdfasfsdfad',
        blockStart: 1000,
        blockEnd: 1010,
        // hash: 'asdf',
        type: ProposalType.PUBLIC_VOTE,
        title:  'proposal x title',
        description: 'proposal to x'
    } as ProposalCreateRequest;

    const testDataUpdated = {
        submitter: 'pqwer',
        blockStart: 1212,
        blockEnd: 1313,
        // hash: 'newhash',
        type: ProposalType.PUBLIC_VOTE,
        title:  'proposal y title',
        description: 'proposal to y'
    } as ProposalUpdateRequest;

    let testDataHash;

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

    test('Should throw ValidationException because we want to create a empty proposal', async () => {
        expect.assertions(1);
        await proposalService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new proposal', async () => {

        testDataHash = ObjectHash.getHash(testData, HashableObjectType.PROPOSAL_CREATEREQUEST);

        const proposalModel: Proposal = await proposalService.create(testData);
        createdId = proposalModel.Id;

        const result = proposalModel.toJSON();

        expect(result.submitter).toBe(testData.submitter);
        expect(result.blockStart).toBe(testData.blockStart);
        expect(result.blockEnd).toBe(testData.blockEnd);
        expect(result.hash).toBe(testDataHash);
        expect(result.type).toBe(testData.type);
        expect(result.title).toBe(testData.title);
        expect(result.description).toBe(testData.description);

        // todo: should test that creating proposal with options works too..
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
        expect(result.submitter).toBe(testData.submitter);
        expect(result.hash).toBe(testDataHash);
        expect(result.type).toBe(testData.type);
        expect(result.title).toBe(testData.title);
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
        expect(result.submitter).toBe(testData.submitter);
        expect(result.hash).toBe(testDataHash);
        expect(result.type).toBe(testData.type);
        expect(result.title).toBe(testData.title);
        expect(result.description).toBe(testData.description);
    });

    test('Should update the proposal', async () => {

        testDataHash = ObjectHash.getHash(testData, HashableObjectType.PROPOSAL_CREATEREQUEST);
        const proposalModel: Proposal = await proposalService.update(createdId, testDataUpdated);
        const result = proposalModel.toJSON();

        // test the values
        expect(result.submitter).toBe(testDataUpdated.submitter);
        expect(result.blockStart).toBe(testDataUpdated.blockStart);
        expect(result.blockEnd).toBe(testDataUpdated.blockEnd);
        expect(result.submitter).toBe(testDataUpdated.submitter);
        expect(result.hash).toBe(testDataHash);
        expect(result.type).toBe(testDataUpdated.type);
        expect(result.title).toBe(testDataUpdated.title);
        expect(result.description).toBe(testDataUpdated.description);

        // todo: should test that updating proposal with options works too..

    });

    test('Should delete the proposal', async () => {
        expect.assertions(1);
        await proposalService.destroy(createdId);
        await proposalService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

});
