// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { GenerateProposalParams } from '../../../src/api/requests/testdata/GenerateProposalParams';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';
import {CombinedVote} from '../../../src/api/services/action/VoteActionService';

describe('VotePostCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = 100 * process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    // todo: some weird shit happening on node 1, when calling vote post and then vote get afterwards
    // it seems to return different amount of outputs on getWalletAddressInfos()

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const voteCommand = Commands.VOTE_ROOT.commandName;
    const votePostCommand = Commands.VOTE_POST.commandName;
    const voteGetCommand = Commands.VOTE_GET.commandName;

    let profile: resources.Profile;
    let market: resources.Market;

    let proposal: resources.Proposal;
    let vote: resources.Vote;

    let sent = false;

    beforeAll(async () => {
        await testUtil.cleanDb();

        // get default profile and market
        profile = await testUtil.getDefaultProfile();
        expect(profile.id).toBeDefined();
        market = await testUtil.getDefaultMarket(profile.id);
        expect(market.id).toBeDefined();

        const generateActiveProposalParams = new GenerateProposalParams([
            undefined,                  // listingItemId,
            false,                      // generatePastProposal,
            0,                          // voteCount
            market.Identity.address,    // submitter
            market.receiveAddress,      // market
            true,                       // generateOptions
            false                       // generateResults
        ]).toParamsArray();

        // generate active proposals
        const proposals = await testUtil.generateData(
            CreatableModel.PROPOSAL,        // what to generate
            1,                      // how many to generate
            true,               // return model
            generateActiveProposalParams    // what kind of data to generate
        ) as resources.Proposal[];

        proposal = proposals[0];
        log.debug('proposal: ', JSON.stringify(proposal, null, 2));
    });


    test('Should fail because missing marketId', async () => {
        const res: any = await testUtil.rpc(voteCommand, [votePostCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('marketId').getMessage());
    });


    test('Should fail because missing proposalHash', async () => {
        const res: any = await testUtil.rpc(voteCommand, [votePostCommand,
            market.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('proposalHash').getMessage());
    });


    test('Should fail missing proposalOptionId', async () => {
        const res: any = await testUtil.rpc(voteCommand, [votePostCommand,
            market.id,
            proposal.hash
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('proposalOptionId').getMessage());
    });


    test('Should fail because invalid marketId', async () => {
        const res: any = await testUtil.rpc(voteCommand, [votePostCommand,
            true,
            proposal.hash,
            proposal.ProposalOptions[0].optionId
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('marketId', 'number').getMessage());
    });


    test('Should fail because invalid proposalHash', async () => {
        const res: any = await testUtil.rpc(voteCommand, [votePostCommand,
            market.id,
            true,
            proposal.ProposalOptions[0].optionId
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('proposalHash', 'string').getMessage());

    });


    test('Should fail because invalid proposalOptionId', async () => {
        const res: any = await testUtil.rpc(voteCommand, [votePostCommand,
            market.id,
            proposal.hash,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('proposalOptionId', 'number').getMessage());
    });


    test('Should fail because Market not found', async () => {
        const res: any = await testUtil.rpc(voteCommand, [votePostCommand,
            0,
            proposal.hash,
            proposal.ProposalOptions[0].optionId
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('Market').getMessage());
    });


    test('Should fail because Proposal not found', async () => {
        const res: any = await testUtil.rpc(voteCommand, [votePostCommand,
            market.id,
            proposal.hash + 'NOTFOUND',
            proposal.ProposalOptions[0].optionId
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('Proposal').getMessage());
    });


    test('Should fail because ProposalOption not found', async () => {
        const res: any = await testUtil.rpc(voteCommand, [votePostCommand,
            market.id,
            proposal.hash,
            999999
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('ProposalOption not found.');
    });


    test('Should post a Vote', async () => {
        const res: any = await testUtil.rpc(voteCommand, [votePostCommand,
            market.id,
            proposal.hash,
            proposal.ProposalOptions[0].optionId
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.Vote = res.getBody()['result'];
        log.debug('result: ', JSON.stringify(result, null, 2));
        expect(result.result).toEqual('Sent.');
        sent = result.result === 'Sent.';
    });


    test('Should find the posted Vote locally immediately after posting', async () => {
        expect(sent).toBeTruthy();

        // wait for some time to make sure vote is saved
        await testUtil.waitFor(5);

        const res: any = await testUtil.rpc(voteCommand, [voteGetCommand,
            market.id,
            proposal.hash
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: CombinedVote = res.getBody()['result'];
        vote = result;

        log.debug('vote: ', JSON.stringify(result, null, 2));
        expect(result.voter).toBe(market.Identity.address);
        expect(result.votedProposalOption.optionId).toBe(proposal.ProposalOptions[0].optionId);
    }, 600000); // timeout to 600s


    test('Should post a new Vote with different optionId', async () => {
        const res: any = await testUtil.rpc(voteCommand, [votePostCommand,
            market.id,
            proposal.hash,
            proposal.ProposalOptions[1].optionId
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.Vote = res.getBody()['result'];
        log.debug('result: ', JSON.stringify(result, null, 2));
        expect(result.result).toEqual('Sent.');
        sent = result.result === 'Sent.';
    });


    test('Should find the updated Vote with different optionId', async () => {
        expect(sent).toBeTruthy();
        // wait for some time to make sure vote is received
        await testUtil.waitFor(5);

        const res: any = await testUtil.rpc(voteCommand, [voteGetCommand,
            market.id,
            proposal.hash
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.Vote = res.getBody()['result'];

        log.debug('vote updated: ', JSON.stringify(result, null, 2));
        log.debug('vote: ', JSON.stringify(result, null, 2));
        expect(result.voter).toBe(market.Identity.address);
        expect(result.weight).toBe(vote.weight);
        expect(result.votedProposalOption.optionId).toBe(proposal.ProposalOptions[1].optionId);

    }, 600000); // timeout to 600s


});
