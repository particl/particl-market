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
// tslint:enable:max-line-length

describe('ProposalGetCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

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

        // Generate a proposal
        const generateProposalsParams = new GenerateProposalParams([
            false,                  // generateListingItemTemplate = true;
            false,                  // generateListingItem = true;
            null,                   // listingItemHash: string;
            false,                  // generatePastProposal = false;
            0,                      // voteCount
            profile.address  // submitter
        ]).toParamsArray();

        // create Proposal for testing
        const proposals = await testUtil.generateData(
            CreatableModel.PROPOSAL,     // what to generate
            1,                           // how many to generate
            true,                        // return model
            generateProposalsParams      // what kind of data to generate
        ) as Proposal[];
        proposal = proposals[0];

    });

    test('Should get the Proposal', async () => {
        const res: any = await  testUtil.rpc(proposalCommand, [proposalGetCommand, proposal.hash]);
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
