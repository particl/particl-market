// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import * as Faker from 'faker';
import * as resources from 'resources';
import { GenerateProposalParams } from '../../../src/api/requests/params/GenerateProposalParams';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';

describe('VotePostCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = 100 * process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const voteCommand = Commands.VOTE_ROOT.commandName;
    const votePostCommand = Commands.VOTE_POST.commandName;
    const voteGetCommand = Commands.VOTE_GET.commandName;

    let defaultProfile: resources.Profile;
    let proposal: resources.Proposal;

    beforeAll(async () => {
        await testUtil.cleanDb();

        defaultProfile = await testUtil.getDefaultProfile();

        const generateProposalParams = new GenerateProposalParams([
            false,      // generateListingItemTemplate
            false,      // generateListingItem
            null,       // listingItemHash,
            false,      // generatePastProposal,
            2           // voteCount
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

    test('Should fail to post a Vote because it has too few args (0)', async () => {
        const res: any = await testUtil.rpc(voteCommand, [votePostCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('Missing params.');
    });

    test('Should fail to post a Vote because it has too few args (1)', async () => {
        const res: any = await testUtil.rpc(voteCommand, [
            votePostCommand,
            defaultProfile.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('Missing params.');
    });

    test('Should fail to post a Vote because it has too few args (2)', async () => {
        const res: any = await testUtil.rpc(voteCommand, [
            votePostCommand,
            defaultProfile.id,
            proposal.hash
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('Missing params.');
    });

    test('Should fail to post a Vote because it has an invalid (string) arg (profileId)', async () => {

        const invalidProfileId = 'invalid-profile-id';
        const res: any = await testUtil.rpc(voteCommand, [
            votePostCommand,
            invalidProfileId,
            proposal.hash,
            proposal.ProposalOptions[0].optionId
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('Invalid profileId.');
    });

    test('Should fail to post a Vote because it has an invalid (non-existent) arg (profileId)', async () => {
        const invalidProfileId = 0;

        const res: any = await testUtil.rpc(voteCommand, [
            votePostCommand,
            invalidProfileId,
            proposal.hash,
            proposal.ProposalOptions[0].optionId
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('Entity with identifier 0 does not exist');
    });

    test('Should fail to post a Vote because it has an invalid (non-existent) arg (proposalHash)', async () => {
        const invalidProposalHash = 'invalid-proposal-hash';

        const res: any = await testUtil.rpc(voteCommand, [
            votePostCommand,
            defaultProfile.id,
            invalidProposalHash,
            proposal.ProposalOptions[0].optionId
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('Proposal not found.');

    });

    test('Should fail to post a Vote because it has an invalid (non-numeric) arg (proposalOptionId)', async () => {

        const invalidProposalOptionId = 'invalid-proposal-option-id';
        const res: any = await testUtil.rpc(voteCommand, [
            votePostCommand,
            defaultProfile.id,
            proposal.hash,
            invalidProposalOptionId
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('Invalid proposalOptionId.');
    });

    test('Should fail to post a Vote because it has an invalid (non-existent) arg (proposalOptionId)', async () => {
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
        const result: any = res.getBody()['result'];
        expect(result.result).toEqual('Sent.');
    });

    test('Should find the posted Vote locally immediately after posting', async () => {
        // wait for some time to make sure vote is received
        await testUtil.waitFor(5);

        const res: any = await testUtil.rpcWaitFor(
            voteCommand,
            [voteGetCommand, defaultProfile.id, proposal.hash],
            8 * 60,
            200,
            'ProposalOption.optionId',
            proposal.ProposalOptions[0].optionId
        );
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Vote = res.getBody()['result'];
        // log.debug('result:', JSON.stringify(result, null, 2));

        expect(result).hasOwnProperty('ProposalOption');
        expect(result.weight).toBe(1);
        expect(result.voter).toBe(defaultProfile.address);
        expect(result.ProposalOption.optionId).toBe(proposal.ProposalOptions[0].optionId);
    });

    // TODO: should add a test that posted vote has correct fields after its received/processed

    test('Should post a new Vote with different optionId', async () => {
        const res: any = await testUtil.rpc(voteCommand, [
            votePostCommand,
            defaultProfile.id,
            proposal.hash,
            proposal.ProposalOptions[1].optionId
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.result).toEqual('Sent.');
    });

    test('Should find the updated Vote with different optionI', async () => {
        // wait for some time to make sure vote is received
        await testUtil.waitFor(5);

        const res: any = await testUtil.rpcWaitFor(
            voteCommand,
            [voteGetCommand, defaultProfile.id, proposal.hash],
            8 * 60,
            200,
            'ProposalOption.optionId',
            proposal.ProposalOptions[1].optionId
        );
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Vote = res.getBody()['result'];
        expect(result).hasOwnProperty('ProposalOption');
        expect(result.weight).toBe(1);
        expect(result.voter).toBe(defaultProfile.address);
        expect(result.ProposalOption.optionId).toBe(proposal.ProposalOptions[1].optionId);

    }, 600000); // timeout to 600s
});
