// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import * as resources from 'resources';
import { GenerateProposalParams } from '../../../src/api/requests/params/GenerateProposalParams';

describe('VoteGetCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const voteCommand = Commands.VOTE_ROOT.commandName;
    const voteGetCommand = Commands.VOTE_GET.commandName;
    const votePostCommand = Commands.VOTE_POST.commandName;
    const daemonCommand = Commands.DAEMON_ROOT.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;
    let proposal: resources.Proposal;

    beforeAll(async () => {
        await testUtil.cleanDb();

        // get default profile and market
        defaultProfile = await testUtil.getDefaultProfile();
        defaultMarket = await testUtil.getDefaultMarket();

        const generateProposalParams = new GenerateProposalParams([
            false,   // generateListingItemTemplate
            false,   // generateListingItem
            null,   // listingItemHash,
            false,  // generatePastProposal,
            0       // voteCount
        ]).toParamsArray();

        // generate proposal, no votes
        const proposals = await testUtil.generateData(
            CreatableModel.PROPOSAL,    // what to generate
            1,                  // how many to generate
            true,            // return model
            generateProposalParams      // what kind of data to generate
        ) as resources.Proposal[];
        proposal = proposals[0];

        // post a vote
        const votePostRes: any = await testUtil.rpc(voteCommand, [
            votePostCommand,
            defaultProfile.id,
            proposal.hash,
            proposal.ProposalOptions[0].optionId
        ]);
        votePostRes.expectJson();
        votePostRes.expectStatusCode(200);
        const result: any = votePostRes.getBody()['result'];
        expect(result.result).toEqual('Sent.');

    });

    test('Should return Vote', async () => {
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
        expect(result).hasOwnProperty('ProposalOption');
        expect(result.weight).toBe(1);
        expect(result.voter).toBe(defaultProfile.address);
        expect(result.ProposalOption.optionId).toBe(proposal.ProposalOptions[0].optionId);
    });

    test('Should return Vote with different result after voting again', async () => {

        // post a vote
        const votePostRes: any = await testUtil.rpc(voteCommand, [
            votePostCommand,
            defaultProfile.id,
            proposal.hash,
            proposal.ProposalOptions[1].optionId
        ]);
        votePostRes.expectJson();
        votePostRes.expectStatusCode(200);
        const votePostResult: any = votePostRes.getBody()['result'];
        expect(votePostResult.result).toEqual('Sent.');

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
        expect(result).hasOwnProperty('ProposalOption');
        expect(result.weight).toBe(1);
        expect(result.voter).toBe(defaultProfile.address);
        expect(result.ProposalOption.optionId).toBe(proposal.ProposalOptions[1].optionId);
    });

});
