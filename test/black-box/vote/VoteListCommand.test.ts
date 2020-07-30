// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateProposalParams } from '../../../src/api/requests/testdata/GenerateProposalParams';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';

describe('VoteListCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const voteCommand = Commands.VOTE_ROOT.commandName;
    const voteListCommand = Commands.VOTE_LIST.commandName;
    const votePostCommand = Commands.VOTE_POST.commandName;

    let profile: resources.Profile;
    let market: resources.Market;
    let proposal: resources.Proposal;

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


    test('Should post a Vote', async () => {
        const res: any = await testUtil.rpc(voteCommand, [votePostCommand,
            market.id,
            proposal.hash,
            proposal.ProposalOptions[0].optionId
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.Vote = res.getBody()['result'];
        expect(result.result).toEqual('Sent.');
        sent = result.result === 'Sent.';
    });


    test('Should fail to get because missing proposalHash', async () => {
        const res = await testUtil.rpc(voteCommand, [voteListCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('proposalHash').getMessage());
    });


    test('Should fail to add because invalid proposalHash', async () => {
        const res = await testUtil.rpc(voteCommand, [voteListCommand,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('proposalHash', 'string').getMessage());
    });


    test('Should fail to add because Proposal not found', async () => {
        const res = await testUtil.rpc(voteCommand, [voteListCommand,
            proposal.hash + 'NOTFOUND'
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('Proposal').getMessage());
    });


    test('Should list Votes', async () => {
        const res: any = await testUtil.rpc(voteCommand, [voteListCommand,
            proposal.hash
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        log.debug('result:', JSON.stringify(result, null, 2));
        expect(result.length).toBeGreaterThan(0);
    });

});
