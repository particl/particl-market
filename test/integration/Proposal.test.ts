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
import { HashableObjectType } from '../../src/api/enums/HashableObjectType';
import { ObjectHash } from '../../src/core/helpers/ObjectHash';
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

    const testData = {
        submitter: 'pasdfasfsdfad',
        type: ProposalType.PUBLIC_VOTE,
        title:  'proposal x title',
        description: 'proposal to x',
        expiryTime: 4,
        postedAt: new Date().getTime(),
        expiredAt: new Date().getTime() + 100000000,
        receivedAt: new Date().getTime()
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
        description: 'proposal to y'
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
        createdId = proposalModel.Id;
        const result = proposalModel.toJSON();

        expect(result.submitter).toBe(testData.submitter);
        expect(result.postedAt).toBe(testData.postedAt);
        expect(result.expiredAt).toBe(testData.expiredAt);
        expect(result.type).toBe(testData.type);
        expect(result.title).toBe(testData.title);
        expect(result.description).toBe(testData.description);

        createdId = result.id;
        // todo: should test that creating proposal with options works too..
    });

    test('Should list Proposals with our newly created one', async () => {
        const proposalCollection = await proposalService.findAll();
        const proposal = proposalCollection.toJSON();
        expect(proposal.length).toBe(1);

        const result = proposal[0];
        expect(result.submitter).toBe(testData.submitter);
        expect(result.postedAt).toBe(testData.postedAt);
        expect(result.expiredAt).toBe(testData.expiredAt);
        expect(result.submitter).toBe(testData.submitter);
        expect(result.type).toBe(testData.type);
        expect(result.title).toBe(testData.title);
        expect(result.description).toBe(testData.description);
    });

    test('Should return one Proposal', async () => {
        const proposalModel: Proposal = await proposalService.findOne(createdId);
        const result = proposalModel.toJSON();

        expect(result.submitter).toBe(testData.submitter);
        expect(result.postedAt).toBe(testData.postedAt);
        expect(result.expiredAt).toBe(testData.expiredAt);
        expect(result.submitter).toBe(testData.submitter);
        expect(result.type).toBe(testData.type);
        expect(result.title).toBe(testData.title);
        expect(result.description).toBe(testData.description);
    });

    test('Should update the Proposal', async () => {
        testDataUpdated.expiryTime = 4;
        testDataUpdated.postedAt = new Date().getTime();
        testDataUpdated.expiredAt = new Date().getTime() + 100000000;
        testDataUpdated.receivedAt = new Date().getTime();

        const proposalModel: Proposal = await proposalService.update(createdId, testDataUpdated);
        const result = proposalModel.toJSON();

        expect(result.submitter).toBe(testDataUpdated.submitter);
        expect(result.postedAt).toBe(testDataUpdated.postedAt);
        expect(result.expiredAt).toBe(testDataUpdated.expiredAt);
        expect(result.submitter).toBe(testDataUpdated.submitter);
        expect(result.type).toBe(testDataUpdated.type);
        expect(result.title).toBe(testDataUpdated.title);
        expect(result.description).toBe(testDataUpdated.description);
    });

    test('Should delete the Proposal', async () => {
        expect.assertions(1);
        await proposalService.destroy(createdId);
        await proposalService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

    test('Should create a new Proposal with ProposalOptions', async () => {

        testData.options = testDataOptions;

        const proposalModel: Proposal = await proposalService.create(testData);
        createdId = proposalModel.Id;

        const result = proposalModel.toJSON();

        expect(result.submitter).toBe(testData.submitter);
        expect(result.postedAt).toBe(testData.postedAt);
        expect(result.expiredAt).toBe(testData.expiredAt);
        expect(result.type).toBe(testData.type);
        expect(result.title).toBe(testData.title);
        expect(result.description).toBe(testData.description);

        expect(result.ProposalOptions).toBeDefined();
        expect(result.ProposalOptions).toHaveLength(3);
    });

    test('Should create another Proposal with different postedAt and expiredAt', async () => {

        testData.options = testDataOptions;
        testData.expiryTime = 1;
        testData.title = 'A new title otherwise we get an SQL UNIQUE constraint error because of proposal.hash being same.';
        testData.postedAt = new Date().getTime() + 1010;
        testData.expiredAt = new Date().getTime() + 1015;
        testData.receivedAt = new Date().getTime() + 1010;

        const proposalModel: Proposal = await proposalService.create(testData);
        createdId = proposalModel.Id;

        const result = proposalModel.toJSON();

        expect(result.submitter).toBe(testData.submitter);
        expect(result.postedAt).toBe(testData.postedAt);
        expect(result.expiredAt).toBe(testData.expiredAt);
        expect(result.type).toBe(testData.type);
        expect(result.title).toBe(testData.title);
        expect(result.description).toBe(testData.description);

        expect(result.ProposalOptions).toBeDefined();
        expect(result.ProposalOptions).toHaveLength(3);
    });

    test('Should search Proposals open after postedAt time', async () => {

        const searchParams = {
            startTime: testData.postedAt, // TODO: Fix me
            endTime: '*',
            order: SearchOrder.ASC,
            type: ProposalType.PUBLIC_VOTE
        } as ProposalSearchParams;

        const proposalCollection = await proposalService.searchBy(searchParams, true);
        const proposals = proposalCollection.toJSON();
        expect(proposals).toHaveLength(1);
    });

    test('Should search Proposals open after postedAt time + 10', async () => {

        const searchParams = {
            startTime: testData.postedAt + 10, // TODO: Fix me
            endTime: '*',
            order: SearchOrder.ASC,
            type: ProposalType.PUBLIC_VOTE
        } as ProposalSearchParams;

        const proposalCollection = await proposalService.searchBy(searchParams, true);
        const proposals = proposalCollection.toJSON();
        expect(proposals).toHaveLength(0);
    });

    test('Should search Proposals closed before or at expiredAt - 10', async () => {

        const searchParams = {
            startTime: '*',
            endTime: testData.expiredAt - 10, // TODO: Fix me
            order: SearchOrder.ASC,
            type: ProposalType.PUBLIC_VOTE
        } as ProposalSearchParams;

        const proposalCollection = await proposalService.searchBy(searchParams, true);
        const proposals = proposalCollection.toJSON();
        expect(proposals).toHaveLength(0);
    });

    test('Should search Proposals closed before or at expiredAt', async () => {

        const searchParams = {
            startTime: '*',
            endTime: testData.expiredAt + 10, // TODO: Fix me
            order: SearchOrder.ASC,
            type: ProposalType.PUBLIC_VOTE
        } as ProposalSearchParams;

        const proposalCollection = await proposalService.searchBy(searchParams, true);
        const proposals = proposalCollection.toJSON();
        expect(proposals).toHaveLength(1);
    });

    test('Should search Proposals closed before or at expiredAt + 10', async () => {

        const searchParams = {
            startTime: '*',
            endTime: testData.expiredAt + 10, // TODO: Fix me
            order: SearchOrder.ASC,
            type: ProposalType.PUBLIC_VOTE
        } as ProposalSearchParams;

        const proposalCollection = await proposalService.searchBy(searchParams, true);
        const proposals = proposalCollection.toJSON();
        expect(proposals).toHaveLength(1);
    });

    test('Should create another Proposal with type ITEM_VOTE', async () => {

        testData.type = ProposalType.ITEM_VOTE;

        const proposalModel: Proposal = await proposalService.create(testData);
        createdId = proposalModel.Id;

        const result = proposalModel.toJSON();

        expect(result.submitter).toBe(testData.submitter);
        expect(result.postedAt).toBe(testData.postedAt);
        expect(result.expiredAt).toBe(testData.expiredAt);
        expect(result.type).toBe(testData.type);
        expect(result.title).toBe(testData.title);
        expect(result.description).toBe(testData.description);

        expect(result.ProposalOptions).toBeDefined();
        expect(result.ProposalOptions).toHaveLength(3);
    });

    test('Should search Proposals with type ITEM_VOTE', async () => {

        const searchParams = {
            startTime: '*',
            endTime: '*',
            order: SearchOrder.ASC,
            type: ProposalType.ITEM_VOTE
        } as ProposalSearchParams;

        const proposalCollection = await proposalService.searchBy(searchParams, true);
        const proposals = proposalCollection.toJSON();
        expect(proposals).toHaveLength(1);
    });

});
