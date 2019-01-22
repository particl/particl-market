// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { GenerateProposalParams } from '../../../src/api/requests/params/GenerateProposalParams';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';

describe('VotePostCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = 100 * process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const voteCommand = Commands.VOTE_ROOT.commandName;
    const votePostCommand = Commands.VOTE_POST.commandName;
    const voteGetCommand = Commands.VOTE_GET.commandName;

    let defaultProfile: resources.Profile;
    let proposal: resources.Proposal;
    let sent = false;

    beforeAll(async () => {
        await testUtil.cleanDb();

        defaultProfile = await testUtil.getDefaultProfile();

        const generateProposalParams = new GenerateProposalParams([
            false,                      // generateListingItemTemplate
            false,                      // generateListingItem
            null,                       // listingItemHash,
            false,                      // generatePastProposal,
            0,                          // voteCount
            defaultProfile.address      // submitter
        ]).toParamsArray();

        // generate proposals
        const proposals = await testUtil.generateData(
            CreatableModel.PROPOSAL,    // what to generate
            1,                  // how many to generate
            true,            // return model
            generateProposalParams      // what kind of data to generate
        ) as resources.Proposal[];

        proposal = proposals[0];

    });

    test('Should fail to post a Vote because missing profileId', async () => {
        const res: any = await testUtil.rpc(voteCommand, [votePostCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('profileId').getMessage());
    });

    test('Should fail to post a Vote because missing proposalHash', async () => {
        const res: any = await testUtil.rpc(voteCommand, [
            votePostCommand,
            defaultProfile.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('proposalHash').getMessage());
    });

    test('Should fail to post a Vote because missing proposalOptionId', async () => {
        const res: any = await testUtil.rpc(voteCommand, [
            votePostCommand,
            defaultProfile.id,
            proposal.hash
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('proposalOptionId').getMessage());
    });

    test('Should fail to post a Vote because invalid type of profileId', async () => {

        const invalidProfileId = 'invalid-profile-id';
        const res: any = await testUtil.rpc(voteCommand, [
            votePostCommand,
            invalidProfileId,
            proposal.hash,
            proposal.ProposalOptions[0].optionId
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new InvalidParamException('profileId', 'number').getMessage());
    });

    test('Should fail to post a Vote because invalid type of proposalHash', async () => {
        const invalidProposalHash = 999999999999;

        const res: any = await testUtil.rpc(voteCommand, [
            votePostCommand,
            defaultProfile.id,
            invalidProposalHash,
            proposal.ProposalOptions[0].optionId
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new InvalidParamException('proposalHash', 'string').getMessage());

    });

    test('Should fail to post a Vote because invalid type of proposalOptionId', async () => {

        const invalidProposalOptionId = 'invalid-proposal-option-id';
        const res: any = await testUtil.rpc(voteCommand, [
            votePostCommand,
            defaultProfile.id,
            proposal.hash,
            invalidProposalOptionId
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new InvalidParamException('proposalOptionId', 'number').getMessage());
    });

    test('Should fail to post a Vote because Profile not found', async () => {
        const invalidProfileId = 0;

        const res: any = await testUtil.rpc(voteCommand, [
            votePostCommand,
            invalidProfileId,
            proposal.hash,
            proposal.ProposalOptions[0].optionId
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('Profile').getMessage());
    });

    test('Should fail to post a Vote because Proposal not found', async () => {
        const res: any = await testUtil.rpc(voteCommand, [
            votePostCommand,
            defaultProfile.id,
            proposal.hash + 'notfound',
            proposal.ProposalOptions[0].optionId
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('Proposal').getMessage());
    });

    test('Should fail to post a Vote because ProposalOption not found', async () => {
        const invalidProposalOptionId = 999999;

        const res: any = await testUtil.rpc(voteCommand, [
            votePostCommand,
            defaultProfile.id,
            proposal.hash,
            invalidProposalOptionId
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('ProposalOption not found.');
    });

    test('Should post a Vote', async () => {

        const res: any = await testUtil.rpc(voteCommand, [
            votePostCommand,
            defaultProfile.id,
            proposal.hash,
            proposal.ProposalOptions[0].optionId
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const results: any = res.getBody()['result'];
        log.debug('results: ', JSON.stringify(results, null, 2));
        expect(results[0].result).toEqual('Sent.');
        sent = results[0].result === 'Sent.';
    });

    test('Should find the posted Vote locally immediately after posting', async () => {
        expect(sent).toBeTruthy();

        // wait for some time to make sure vote is received
        await testUtil.waitFor(5);

        const res: any = await testUtil.rpc(voteCommand, [
            voteGetCommand,
            defaultProfile.id,
            proposal.hash
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.Vote = res.getBody()['result'];

        log.debug('vote: ', JSON.stringify(result, null, 2));
        expect(result).hasOwnProperty('ProposalOption');
        expect(result.weight).toBeGreaterThan(1);
        expect(result.voter).toBe(defaultProfile.address);
        expect(result.ProposalOption.optionId).toBe(proposal.ProposalOptions[0].optionId);
    }, 600000); // timeout to 600s

    test('Should post a new Vote with different optionId', async () => {
        const res: any = await testUtil.rpc(voteCommand, [
            votePostCommand,
            defaultProfile.id,
            proposal.hash,
            proposal.ProposalOptions[1].optionId
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const results: any = res.getBody()['result'];
        log.debug('results: ', JSON.stringify(results, null, 2));
        expect(results[0].result).toEqual('Sent.');
        sent = results[0].result === 'Sent.';
    });

    test('Should find the updated Vote with different optionI', async () => {
        expect(sent).toBeTruthy();
        // wait for some time to make sure vote is received
        await testUtil.waitFor(5);

        const res: any = await testUtil.rpc(voteCommand, [
            voteGetCommand,
            defaultProfile.id,
            proposal.hash
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.Vote = res.getBody()['result'];

        log.debug('vote updated: ', JSON.stringify(result, null, 2));
        expect(result).hasOwnProperty('ProposalOption');
        expect(result.weight).toBeGreaterThan(1);
        expect(result.voter).toBe(defaultProfile.address);
        expect(result.ProposalOption.optionId).toBe(proposal.ProposalOptions[1].optionId);

    }, 600000); // timeout to 600s
});
