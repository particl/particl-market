// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

// tslint:disable:max-line-length
import * from 'jest';
import * as resources from 'resources';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateProposalParams } from '../../../src/api/requests/testdata/GenerateProposalParams';
import { ProposalCategory } from '../../../src/api/enums/ProposalCategory';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { SearchOrder } from '../../../src/api/enums/SearchOrder';
// tslint:enable:max-line-length

describe('ProposalListCommand', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const proposalCommand = Commands.PROPOSAL_ROOT.commandName;
    const proposalListCommand = Commands.PROPOSAL_LIST.commandName;

    let profile: resources.Profile;
    let market: resources.Market;

    let pastProposals: resources.Proposal[];
    let activeProposals: resources.Proposal[];


    beforeAll(async () => {
        await testUtil.cleanDb();

        profile = await testUtil.getDefaultProfile();
        expect(profile.id).toBeDefined();
        market = await testUtil.getDefaultMarket(profile.id);
        expect(market.id).toBeDefined();

    });


    test('Should generate some old Proposals', async () => {
        const generatePastProposalParams = new GenerateProposalParams([
            undefined,                  // listingItemId,
            true,                       // generatePastProposal,
            0,                          // voteCount
            market.Identity.address,    // submitter
            market.receiveAddress,      // market
            false,                      // generateOptions
            false                       // generateResults
        ]).toParamsArray();

        pastProposals = await testUtil.generateData(
            CreatableModel.PROPOSAL,    // what to generate
            2,                  // how many to generate
            true,            // return model
            generatePastProposalParams      // what kind of data to generate
        ) as resources.Proposal[];
    });


    test('Should generate some active Proposals', async () => {
        const generateActiveProposalParams = new GenerateProposalParams([
            undefined,                  // listingItemId,
            false,                      // generatePastProposal,
            0,                          // voteCount
            market.Identity.address,    // submitter
            market.receiveAddress,      // market
            false,                      // generateOptions
            false                       // generateResults
        ]).toParamsArray();

        activeProposals = await testUtil.generateData(
            CreatableModel.PROPOSAL,        // what to generate
            1,                      // how many to generate
            true,               // return model
            generateActiveProposalParams    // what kind of data to generate
        ) as resources.Proposal[];
    });


    test('Should fail because invalid timeStart', async () => {
        const response: any = await testUtil.rpc(proposalCommand, [proposalListCommand,
            true,
            '*',
            ProposalCategory.PUBLIC_VOTE,
            null,
            SearchOrder.ASC
        ]);
        response.expectJson();
        response.expectStatusCode(400);
        expect(response.error.error.message).toBe(new InvalidParamException('timeStart', 'number|*').getMessage());
    });


    test('Should fail because invalid timeEnd', async () => {
        const response: any = await testUtil.rpc(proposalCommand, [proposalListCommand,
            '*',
            true,
            ProposalCategory.PUBLIC_VOTE,
            null,
            SearchOrder.ASC
        ]);
        response.expectJson();
        response.expectStatusCode(400);
        expect(response.error.error.message).toBe(new InvalidParamException('timeEnd', 'number|*').getMessage());
    });


    test('Should fail because invalid proposalCategory', async () => {
        const response: any = await testUtil.rpc(proposalCommand, [proposalListCommand,
            '*',
            '*',
            true,
            null,
            SearchOrder.ASC
        ]);
        response.expectJson();
        response.expectStatusCode(400);
        expect(response.error.error.message).toBe(new InvalidParamException('proposalCategory', 'string').getMessage());
    });


    test('Should fail because invalid proposalCategory', async () => {
        const response: any = await testUtil.rpc(proposalCommand, [proposalListCommand,
            '*',
            '*',
            'INVALID',
            null,
            SearchOrder.ASC
        ]);
        response.expectJson();
        response.expectStatusCode(400);
        expect(response.error.error.message).toBe(new InvalidParamException('proposalCategory', 'ProposalCategory').getMessage());
    });


    test('Should fail because invalid market', async () => {
        const response: any = await testUtil.rpc(proposalCommand, [proposalListCommand,
            '*',
            '*',
            ProposalCategory.PUBLIC_VOTE,
            true,
            SearchOrder.ASC
        ]);
        response.expectJson();
        response.expectStatusCode(400);
        expect(response.error.error.message).toBe(new InvalidParamException('marketId', 'number').getMessage());
    });


    test('Should list all Proposals', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalListCommand,
            undefined,
            '*'
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const results: resources.Proposal[] = res.getBody()['result'];
        // log.debug('result:', JSON.stringify(result, null, 2));
        expect(results).toHaveLength(3);
    });


    test('Should list past Proposals', async () => {
        const testTimeStamp = Date.now();

        const res: any = await testUtil.rpc(proposalCommand, [proposalListCommand,
            '*',
            testTimeStamp
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const results: resources.Proposal[] = res.getBody()['result'];
        for (const proposal of results) {
            log.debug('proposal.expiredAt: ' + proposal.expiredAt + ' < ' + testTimeStamp + ' = ' + (proposal.expiredAt < testTimeStamp));
        }

        expect(results).toHaveLength(2);
    });


    test('Should list active Proposals', async () => {
        const testTimeStamp = Date.now();

        const res: any = await testUtil.rpc(proposalCommand, [proposalListCommand,
            testTimeStamp,
            null
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const results: resources.Proposal[] = res.getBody()['result'];
        // log.debug('result:', JSON.stringify(result, null, 2));
        expect(results).toHaveLength(1);
    });


    test('Should list 3 Proposals with category PUBLIC_VOTE', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalListCommand,
            '*',
            '*',
            ProposalCategory.PUBLIC_VOTE
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const results: resources.Proposal[] = res.getBody()['result'];
        expect(results).toHaveLength(3);
    });


    test('Should list 3 Proposals with category PUBLIC_VOTE', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalListCommand,
            null,
            undefined,
            ProposalCategory.PUBLIC_VOTE
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const results: resources.Proposal[] = res.getBody()['result'];
        expect(results).toHaveLength(3);
    });


    test('Should not list any Proposals with category ITEM_VOTE', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalListCommand,
            '*',
            '*',
            ProposalCategory.ITEM_VOTE
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const results: resources.Proposal[] = res.getBody()['result'];
        expect(results).toHaveLength(0);
    });

});
