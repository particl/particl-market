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
    const voteCommand = Commands.VOTE_ROOT.commandName;
    const votePostCommand = Commands.VOTE_POST.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;

    let proposal: resources.ListingItemTemplate;

    let currentBlock: 0;

    beforeAll(async () => {
        await testUtil.cleanDb();

        // get default profile
        defaultProfile = await testUtil.getDefaultProfile();
        log.debug('defaultProfile: ', defaultProfile);

        // fetch default market
        defaultMarket = await testUtil.getDefaultMarket();

        const generatePastProposalParams = new GenerateProposalParams([
            true,   // generateListingItemTemplate
            true,   // generateListingItem
            null,   // listingItemHash,
            false,  // generatePastProposal,
            5       // voteCount
        ]).toParamsArray();

        // generate past proposals
        const proposals = await testUtil.generateData(
            CreatableModel.PROPOSAL,    // what to generate
            1,                  // how many to generate
            true,            // return model
            generatePastProposalParams      // what kind of data to generate
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
        expect(result).toHaveLength(2);

        expect(result.result).toBe('Sent.');
        expect(result.txid).toBeDefined();
        expect(result.fee).toBeGreaterThan(0);


    });



});
