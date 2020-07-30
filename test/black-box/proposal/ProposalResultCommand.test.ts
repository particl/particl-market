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

describe('ProposalResultCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const proposalCommand = Commands.PROPOSAL_ROOT.commandName;
    const proposalResultCommand = Commands.PROPOSAL_RESULT.commandName;

    let profile: resources.Profile;
    let market: resources.Market;

    let proposal: resources.Proposal;

    const testTimeStamp = Date.now();
    const voteCount = 50;

    beforeAll(async () => {
        await testUtil.cleanDb();

        profile = await testUtil.getDefaultProfile();
        expect(profile.id).toBeDefined();
        market = await testUtil.getDefaultMarket(profile.id);
        expect(market.id).toBeDefined();

        const generateActiveProposalParams = new GenerateProposalParams([
            undefined,                  // listingItemId,
            false,                      // generatePastProposal,
            voteCount,                  // voteCount
            market.Identity.address,    // submitter
            market.receiveAddress,      // market
            true,                       // generateOptions
            true                        // generateResults
        ]).toParamsArray();

        // generate active proposals
        const proposals = await testUtil.generateData(
            CreatableModel.PROPOSAL,        // what to generate
            1,                      // how many to generate
            true,                // return model
            generateActiveProposalParams    // what kind of data to generate
        ) as resources.Proposal[];
        proposal = proposals[0];
    });


    test('Should fail because missing proposalHash', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalResultCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('proposalHash').getMessage());
    });


    test('Should fail because invalid proposalHash', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalResultCommand,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('proposalHash', 'string').getMessage());
    });


    test('Should return ProposalResult', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalResultCommand,
            proposal.hash
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.ProposalResult = res.getBody()['result'];

        expect(result.calculatedAt).toBeGreaterThan(testTimeStamp);
        expect(result.ProposalOptionResults[0].voters).toBeGreaterThan(0);
        expect(result.ProposalOptionResults[0].weight).toBeGreaterThan(0);
        expect(result.ProposalOptionResults[0].voters + result.ProposalOptionResults[1].voters).toBe(voteCount);
    });

});
