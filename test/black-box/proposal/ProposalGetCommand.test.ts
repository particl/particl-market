// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

// tslint:disable:max-line-length
import * from 'jest';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import * as resources from 'resources';
import { GenerateProposalParams } from '../../../src/api/requests/testdata/GenerateProposalParams';
import { Proposal } from '../../../src/api/models/Proposal';
import {MissingParamException} from '../../../src/api/exceptions/MissingParamException';
import {InvalidParamException} from '../../../src/api/exceptions/InvalidParamException';
// tslint:enable:max-line-length

describe('ProposalGetCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const proposalCommand = Commands.PROPOSAL_ROOT.commandName;
    const proposalGetCommand = Commands.PROPOSAL_GET.commandName;

    let profile: resources.Profile;
    let market: resources.Market;

    let proposal: resources.Proposal;

    beforeAll(async () => {
        await testUtil.cleanDb();

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
        const res: any = await testUtil.rpc(proposalCommand, [proposalGetCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('proposalHash').getMessage());
    });

    test('Should fail because invalid proposalHash', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalGetCommand,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('proposalHash', 'string').getMessage());
    });

    test('Should get the Proposal', async () => {
        const res: any = await  testUtil.rpc(proposalCommand, [proposalGetCommand,
            proposal.hash
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        expect(result.submitter).toBe(proposal.submitter);
        expect(result.blockStart).toBe(proposal.blockStart);
        expect(result.blockEnd).toBe(proposal.blockEnd);
        expect(result.hash).toBe(proposal.hash);
        expect(result.type).toBe(proposal.type);
        expect(result.title).toBe(proposal.title);
        expect(result.description).toBe(proposal.description);
        expect(result.updatedAt).toBe(proposal.updatedAt);
        expect(result.createdAt).toBe(proposal.createdAt);
    });
});
