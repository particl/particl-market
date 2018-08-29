// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

// tslint:disable:max-line-length
import * from 'jest';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import * as Faker from 'faker';
import * as resources from 'resources';
import { GenerateProposalParams } from '../../../src/api/requests/params/GenerateProposalParams';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
// tslint:enable:max-line-length

describe('VotePostCommand', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 100 * process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const testUtil = new BlackBoxTestUtil();
    const voteCommand = Commands.VOTE_ROOT.commandName;
    const votePostCommand = Commands.VOTE_POST.commandName;
    const voteGetCommand = Commands.VOTE_GET.commandName;
    const proposalGetCommand = Commands.PROPOSAL_GET.commandName;
    const daemonCommand = Commands.DAEMON_ROOT.commandName;

    let defaultProfile: resources.Profile;
    let proposal: resources.Proposal;
    let currentBlock: number;

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

        // get current block
        const currentBlockRes: any = await testUtil.rpc(daemonCommand, ['getblockcount']);
        currentBlockRes.expectStatusCode(200);
        currentBlock = currentBlockRes.getBody()['result'];
        log.debug('currentBlock:', currentBlock);
    });

    test('Should fail to post a vote because it has too few args (0)', async () => {
        const response: any = await testUtil.rpc(voteCommand, [votePostCommand]);
        response.expectJson();
        response.expectStatusCode(404);
    });

    test('Should fail to post a vote because it has too few args (1)', async () => {
        const response: any = await testUtil.rpc(voteCommand, [
            votePostCommand,
            defaultProfile.id
        ]);
        response.expectJson();
        response.expectStatusCode(404);
    });

    test('Should fail to post a vote because it has too few args (2)', async () => {
        const response: any = await testUtil.rpc(voteCommand, [
            votePostCommand,
            defaultProfile.id,
            proposal.hash
        ]);
        response.expectJson();
        response.expectStatusCode(404);
    });

    test('Should fail to post a vote because it has an invalid (string) arg (profileId)', async () => {

        const invalidProfileId = 'invalid profile id';
        const response: any = await testUtil.rpc(voteCommand, [
            votePostCommand,
            invalidProfileId,
            proposal.hash,
            proposal.ProposalOptions[0].optionId
        ]);
        response.expectJson();
        response.expectStatusCode(404);
    });

    test('Should fail to post a vote because it has an invalid (non-existent) arg (profileId)', async () => {
        const invalidProfileId = 9999999999999999;

        const response: any = await testUtil.rpc(voteCommand, [
            votePostCommand,
            invalidProfileId,
            proposal.hash,
            proposal.ProposalOptions[0].optionId
        ]);
        response.expectJson();
        response.expectStatusCode(404);
    });

    test('Should fail to post a vote because it has an invalid (non-existent) arg (proposalHash)', async () => {
        const invalidProposalHash = 'Invalid proposalHash';

        const response: any = await testUtil.rpc(voteCommand, [
            votePostCommand,
            defaultProfile.id,
            invalidProposalHash,
            proposal.ProposalOptions[0].optionId
        ]);
        response.expectJson();
        response.expectStatusCode(404);

    });

    test('Should fail to post a vote because it has an invalid (non-numeric) arg (proposalOptionId)', async () => {

        const invalidProposalOptionId = 'Invalid proposal optionId';
        const response: any = await testUtil.rpc(voteCommand, [
            votePostCommand,
            defaultProfile.id,
            proposal.hash,
            invalidProposalOptionId
        ]);
        response.expectJson();
        response.expectStatusCode(404);
    });

    test('Should fail to post a vote because it has an invalid (non-existent) arg (proposalOptionId)', async () => {
        const invalidProposalOptionId = 999999999999999999;

        const response: any = await testUtil.rpc(voteCommand, [
            votePostCommand,
            defaultProfile.id,
            proposal.hash,
            invalidProposalOptionId
        ]);
        response.expectJson();
        response.expectStatusCode(404);
    });

    test('Should post a Vote', async () => {

        const response: any = await testUtil.rpc(voteCommand, [
            votePostCommand,
            defaultProfile.id,
            proposal.hash,
            proposal.ProposalOptions[0].optionId
        ]);
        response.expectJson();
        response.expectStatusCode(200);
        const result: any = response.getBody()['result'];
        expect(result.result).toEqual('Sent.');
    });

    test('Should find the posted Vote', async () => {
        // wait for some time to make sure vote is received
        await testUtil.waitFor(5);

        const voteGetRes: any = await testUtil.rpcWaitFor(
            voteCommand,
            [voteGetCommand, defaultProfile.id, proposal.hash],
            8 * 60,
            200,
            'ProposalOption.optionId',
            proposal.ProposalOptions[0].optionId
        );
        voteGetRes.expectJson();
        voteGetRes.expectStatusCode(200);

        const result: resources.Vote = voteGetRes.getBody()['result'];
        log.debug('result:', JSON.stringify(result, null, 2));

        expect(result).hasOwnProperty('ProposalOption');
        expect(result.block).toBe(currentBlock);
        expect(result.weight).toBe(1);
        expect(result.voter).toBe(defaultProfile.address);
        expect(result.ProposalOption.optionId).toBe(proposal.ProposalOptions[0].optionId);
    });

    test('Should post a new Vote with different optionId', async () => {

        const response: any = await testUtil.rpc(voteCommand, [
            votePostCommand,
            defaultProfile.id,
            proposal.hash,
            proposal.ProposalOptions[1].optionId
        ]);
        response.expectJson();
        response.expectStatusCode(200);
        const result: any = response.getBody()['result'];
        expect(result.result).toEqual('Sent.');
    });

    test('Should find the updated vote with different optionI', async () => {
        // wait for some time to make sure vote is received
        await testUtil.waitFor(5);

        const voteGetRes: any = await testUtil.rpcWaitFor(
            voteCommand,
            [voteGetCommand, defaultProfile.id, proposal.hash],
            8 * 60,
            200,
            'ProposalOption.optionId',
            proposal.ProposalOptions[1].optionId
        );
        voteGetRes.expectJson();
        voteGetRes.expectStatusCode(200);

        const result: resources.Vote = voteGetRes.getBody()['result'];
        log.debug('result:', JSON.stringify(result, null, 2));

        expect(result).hasOwnProperty('ProposalOption');
        expect(result.block).toBe(currentBlock);
        expect(result.weight).toBe(1);
        expect(result.voter).toBe(defaultProfile.address);
        expect(result.ProposalOption.optionId).toBe(proposal.ProposalOptions[1].optionId);

    }, 600000); // timeout to 600s
});
