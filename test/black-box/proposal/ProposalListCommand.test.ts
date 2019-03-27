// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

// tslint:disable:max-line-length
import * from 'jest';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import * as resources from 'resources';
import { GenerateProposalParams } from '../../../src/api/requests/params/GenerateProposalParams';
import { ProposalCategory } from '../../../src/api/enums/ProposalCategory';
// tslint:enable:max-line-length

describe('ProposalListCommand', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const testUtil = new BlackBoxTestUtil();
    const proposalCommand = Commands.PROPOSAL_ROOT.commandName;
    const proposalListCommand = Commands.PROPOSAL_LIST.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;

    let pastProposals: resources.Proposal[];
    let activeProposals: resources.Proposal[];

    const testTimeStamp = new Date().getTime();

    beforeAll(async () => {
        await testUtil.cleanDb();

        // get default profile and market
        defaultProfile = await testUtil.getDefaultProfile();
        defaultMarket = await testUtil.getDefaultMarket();

        const generatePastProposalParams = new GenerateProposalParams([
            false,                  // generateListingItemTemplate
            false,                  // generateListingItem
            null,                   // listingItemHash,
            true,                   // generatePastProposal,
            0,                      // voteCount
            defaultProfile.address  // submitter

        ]).toParamsArray();

        // generate past proposals
        pastProposals = await testUtil.generateData(
            CreatableModel.PROPOSAL,    // what to generate
            2,                  // how many to generate
            true,            // return model
            generatePastProposalParams      // what kind of data to generate
        ) as resources.Proposal[];

        const generateActiveProposalParams = new GenerateProposalParams([
            false,                  // generateListingItemTemplate
            false,                  // generateListingItem
            null,                   // listingItemHash,
            false,                  // generatePastProposal,
            0,                      // voteCount
            defaultProfile.address  // submitter
        ]).toParamsArray();

        // generate active proposals
        activeProposals = await testUtil.generateData(
            CreatableModel.PROPOSAL,        // what to generate
            1,                      // how many to generate
            true,               // return model
            generateActiveProposalParams    // what kind of data to generate
        ) as resources.Proposal[];

    });

    test('Should list all Proposals', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalListCommand, '*', '*']);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        // log.debug('result:', JSON.stringify(result, null, 2));
        expect(result).toHaveLength(3);
    });

    test('Should list past Proposals', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalListCommand, '*', testTimeStamp]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        // log.debug('result:', JSON.stringify(result, null, 2));
        expect(result).toHaveLength(2);
    });

    test('Should list active Proposals', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalListCommand, testTimeStamp, '*']);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        // log.debug('result:', JSON.stringify(result, null, 2));
        expect(result).toHaveLength(1);
    });

    test('Should list 3 Proposals with category PUBLIC_VOTE', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalListCommand, '*', '*', ProposalCategory.PUBLIC_VOTE]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(3);
    });

    test('Should not list any Proposals with category ITEM_VOTE', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalListCommand, '*', '*', ProposalCategory.ITEM_VOTE]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(0);
    });


});
