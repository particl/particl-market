// tslint:disable:max-line-length
import { rpc, api } from '../lib/api';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/params/GenerateListingItemTemplateParams';
import * as resources from 'resources';
import {GenerateProposalParams} from '../../../src/api/requests/params/GenerateProposalParams';
// tslint:enable:max-line-length

describe('ProposalResultCommand', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const testUtil = new BlackBoxTestUtil();
    const proposalCommand = Commands.PROPOSAL_ROOT.commandName;
    const proposalResultCommand = Commands.PROPOSAL_RESULT.commandName;
    const daemonCommand = Commands.DAEMON_ROOT.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;

    let proposal: resources.Proposal;

    let currentBlock: 0;
    const voteCount = 50;

    beforeAll(async () => {
        await testUtil.cleanDb();

        // get default profile
        defaultProfile = await testUtil.getDefaultProfile();
        log.debug('defaultProfile: ', defaultProfile);

        // fetch default market
        defaultMarket = await testUtil.getDefaultMarket();

        const generateProposalParams = new GenerateProposalParams([
            false,   // generateListingItemTemplate
            false,   // generateListingItem
            null,   // listingItemHash,
            false,  // generatePastProposal,
            voteCount       // voteCount
        ]).toParamsArray();

        // generate proposals
        const proposals = await testUtil.generateData(
            CreatableModel.PROPOSAL,    // what to generate
            1,                  // how many to generate
            true,            // return model
            generateProposalParams      // what kind of data to generate
        ) as resources.Proposal[];

        proposal = proposals[0];

        const res: any = await rpc(daemonCommand, ['getblockcount']);
        currentBlock = res.getBody()['result'];
        log.debug('currentBlock:', currentBlock);


    });

    test('Should return ProposalResult', async () => {
        const res: any = await rpc(proposalCommand, [proposalResultCommand, proposal.hash]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];

        log.debug('result:', JSON.stringify(result, null, 2));
        expect(result).hasOwnProperty('Proposal');
        expect(result).hasOwnProperty('ProposalOptionResults');

        expect(result.block).toBe(currentBlock);
        expect(result.ProposalOptionResults[0].voters).toBeGreaterThan(0);
        expect(result.ProposalOptionResults[0].weight).toBeGreaterThan(0);
        expect(result.ProposalOptionResults[0].voters + result.ProposalOptionResults[1].voters).toBe(voteCount);

    });

});
