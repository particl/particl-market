// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';
import { CombinedVote } from '../../../src/api/services/action/VoteActionService';
import * as Faker from 'faker';


describe('VoteGetCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const voteCommand = Commands.VOTE_ROOT.commandName;
    const voteGetCommand = Commands.VOTE_GET.commandName;
    const votePostCommand = Commands.VOTE_POST.commandName;
    const proposalCommand = Commands.PROPOSAL_ROOT.commandName;
    const proposalPostCommand = Commands.PROPOSAL_POST.commandName;
    const proposalListCommand = Commands.PROPOSAL_LIST.commandName;

    let profile: resources.Profile;
    let market: resources.Market;

    let proposal: resources.Proposal;
    let createdVote: resources.Vote;

    const title = Faker.lorem.words();
    const description = Faker.lorem.paragraph();
    const daysRetention = parseInt(process.env.PAID_MESSAGE_RETENTION_DAYS, 10);
    const options: string[] = [
        'optionA1',
        'optionB2'
    ];

    let sent = false;

    beforeAll(async () => {
        await testUtil.cleanDb();

        profile = await testUtil.getDefaultProfile();
        expect(profile.id).toBeDefined();
        market = await testUtil.getDefaultMarket(profile.id);
        expect(market.id).toBeDefined();

    });


    test('Should post a Proposal', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalPostCommand,
            market.id,
            title,
            description,
            daysRetention,
            false,
            options[0],
            options[1]
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        expect(result.result).toEqual('Sent.');
        sent = result.result === 'Sent.';
        if (!sent) {
            log.debug(JSON.stringify(result, null, 2));
        }
    });


    test('Should fail because missing marketId', async () => {
        const res = await testUtil.rpc(voteCommand, [voteGetCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('marketId').getMessage());
    });


    test('Should fail to get because missing proposalHash', async () => {
        const res = await testUtil.rpc(voteCommand, [voteGetCommand,
            profile.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('proposalHash').getMessage());
    });


    test('Should fail to add because invalid marketId', async () => {
        const res = await testUtil.rpc(voteCommand, [voteGetCommand,
            true,
            'proposal.hash'
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('marketId', 'number').getMessage());
    });


    test('Should fail to add because invalid proposalHash', async () => {
        const res = await testUtil.rpc(voteCommand, [voteGetCommand,
            profile.id,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('proposalHash', 'string').getMessage());
    });


    test('Should fail to add because Market not found', async () => {
        const res = await testUtil.rpc(voteCommand, [voteGetCommand,
            0,
            'proposal.hash'
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('Market').getMessage());
    });


    test('Should fail to add because Proposal not found', async () => {
        const res = await testUtil.rpc(voteCommand, [voteGetCommand,
            market.id,
            'proposal.hash'
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('Proposal').getMessage());
    });


    test('Should receive the posted Proposal', async () => {

        expect(sent).toEqual(true);
        const response = await testUtil.rpcWaitFor(proposalCommand, [proposalListCommand,
                '*',
                '*'
            ],
            30 * 60, // maxSeconds
            200, // waitForStatusCode
            '[0].title', // property name
            title
        );
        response.expectJson();
        response.expectStatusCode(200);
        const result: resources.Proposal = response.getBody()['result'][0];

        expect(result.title).toBe(title);
        expect(result.description).toBe(description);
        expect(result.ProposalOptions[0].description).toBe(options[0]);
        expect(result.ProposalOptions[1].description).toBe(options[1]);

        proposal = result;
    }, 600000); // timeout to 600s

    test('Should return CombinedVote with 0 weight', async () => {
        const res = await testUtil.rpc(voteCommand, [voteGetCommand,
            market.id,
            proposal.hash
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: CombinedVote = res.getBody()['result'];
        expect(result.weight).toBe(0);
        expect(result.count).toBe(0);
        expect(result.proposalOptions[0].description).toBe(options[0]);
        expect(result.proposalOptions[1].description).toBe(options[1]);
    });


    test('Should post a Vote', async () => {
        const response: any = await testUtil.rpc(voteCommand, [votePostCommand,
            market.id,
            proposal.hash,
            proposal.ProposalOptions[0].optionId
        ]);
        response.expectJson();
        response.expectStatusCode(200);
        const result: any = response.getBody()['result'];
        expect(result.result).toEqual('Sent.');
        sent = result.result === 'Sent.';
        expect(sent).toBeTruthy();
    });


    test('Should receive a Vote', async () => {
        expect(sent).toBeTruthy();

        // wait for some time to make sure vote is received
        await testUtil.waitFor(5);

        const response = await testUtil.rpcWaitFor(voteCommand, [voteGetCommand,
                market.id,
                proposal.hash
            ],
            8 * 60,
            200,
            'votedProposalOption.optionId',
            proposal.ProposalOptions[0].optionId
        );
        response.expectJson();
        response.expectStatusCode(200);
        const vote: CombinedVote = response.getBody()['result'];
        createdVote = vote;

        expect(vote.voter).toBe(market.Identity.address);
        expect(vote.votedProposalOption.optionId).toBe(proposal.ProposalOptions[0].optionId);
    });


    test('Should vote again', async () => {
        const response: any = await testUtil.rpc(voteCommand, [votePostCommand,
            market.id,
            proposal.hash,
            proposal.ProposalOptions[1].optionId
        ]);
        response.expectJson();
        response.expectStatusCode(200);
        const result: any = response.getBody()['result'];
        expect(result.result).toEqual('Sent.');
        sent = result.result === 'Sent.';

        expect(sent).toBeTruthy();
    });


    test('Should return different result after voting again', async () => {
        expect(sent).toBeTruthy();

        // wait for some time to make sure vote is received
        await testUtil.waitFor(5);

        const response = await testUtil.rpcWaitFor(voteCommand, [voteGetCommand,
                market.id,
                proposal.hash
            ],
            8 * 60,
            200,
            'votedProposalOption.optionId',
            proposal.ProposalOptions[1].optionId
        );
        response.expectJson();
        response.expectStatusCode(200);

        const vote: CombinedVote = response.getBody()['result'];
        createdVote = vote;
        expect(vote.voter).toBe(market.Identity.address);
        expect(vote.votedProposalOption.optionId).toBe(proposal.ProposalOptions[1].optionId);
        expect(vote.weight).toBe(createdVote.weight);
    });

});
