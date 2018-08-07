import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { Profile } from '../../../src/api/models/Profile';
import { Proposal } from '../../../src/api/models/Proposal';
import * as Faker from 'faker';
import * as resources from 'resources';
import { GenerateProposalParams } from '../../../src/api/requests/params/GenerateProposalParams';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';

describe('VotePostCommand', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 100 * process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const testUtil = new BlackBoxTestUtil();
    const voteMethod = Commands.VOTE_ROOT.commandName;
    const votePostSubCommand = Commands.VOTE_POST.commandName;
    const voteGetSubCommand = Commands.VOTE_GET.commandName;
    const proposalGetSubCommand = Commands.PROPOSAL_GET.commandName;
    const daemonMethod = Commands.DAEMON_ROOT.commandName;

    let defaultProfile: Profile;
    let currentBlockNumber;
    let createdProposal: Proposal;
    let createVote: resources.Vote = {};
    let updateVote: resources.Vote = {};

    beforeAll(async () => {
        await testUtil.cleanDb();

        // TODO: defaultProfile might not be the correct one
        defaultProfile = await testUtil.getDefaultProfile();
        {
            const response: any = await testUtil.rpc(daemonMethod, [
                'getblockcount'
            ]);
            response.expectJson();
            response.expectStatusCode(200);
            const result: any = response.getBody()['result'];
            currentBlockNumber = result;
        }

        // Generate a proposal
        const generateProposalsParams = new GenerateProposalParams([
            true, // generateListingItemTemplate = true;
    		true, // generateListingItem = true;
    		null, // listingItemHash: string;
    		false // generatePastProposal = false;
        ]).toParamsArray();

        // create listing item for testing
        const proposals = await testUtil.generateData(
            CreatableModel.PROPOSAL,     // what to generate
            1,                           // how many to generate
            true,                        // return model
        	generateProposalsParams      // what kind of data to generate
        ) as Proposal[];
        createdProposal = proposals[0];
        // log.error('ADSASDDAS = ' + JSON.stringify(createdProposal, null, 2));
    });

    test('Should fail to post a vote because it has too few args (0)', async () => {
        createVote.profileId = defaultProfile.id;
        createVote.address = defaultProfile.address;
        createVote.hash = createdProposal.hash;
        createVote.optionId = createdProposal.ProposalOptions.length - 1;

        updateVote.profileId = createVote.profileId;
        updateVote.address = createVote.address;
        updateVote.hash = createVote.hash;
        updateVote.optionId = createVote.optionId - 1;

        {
            const response: any = await testUtil.rpc(voteMethod, [
                votePostSubCommand
            ]);
            response.expectJson();
            response.expectStatusCode(404);
        }
    });

    test('Should fail to post a vote because it has too few args (1)', async () => {
        {
            const response: any = await testUtil.rpc(voteMethod, [
                votePostSubCommand,
                createVote.profileId
            ]);
            response.expectJson();
            response.expectStatusCode(404);
        }
    });

        test('Should fail to post a vote because it has too few args (2)', async () => {
        {
            const response: any = await testUtil.rpc(voteMethod, [
                votePostSubCommand,
                createVote.profileId,
                createVote.hash
            ]);
            response.expectJson();
            response.expectStatusCode(404);
        }
    });

    test('Should fail to post a vote because it has an invalid (string) arg (profileId)', async () => {
        const invalidProfileId = 'invalid proposal ID';
        {
            const response: any = await testUtil.rpc(voteMethod, [
                votePostSubCommand,
                invalidProfileId,
                createVote.hash,
                createVote.optionId
            ]);
            response.expectJson();
            response.expectStatusCode(404);
        }
    });

    test('Should fail to post a vote because it has an invalid (non-existent) arg (profileId)', async () => {
        const invalidProfileId = 9999999999999999;
        {
            const response: any = await testUtil.rpc(voteMethod, [
                votePostSubCommand,
                invalidProfileId,
                createVote.hash,
                createVote.optionId
            ]);
            response.expectJson();
            response.expectStatusCode(404);
        }
    });

    test('Should fail to post a vote because it has an invalid (non-existent) arg (proposalHash)', async () => {
        const invalidProposalHash = 'Invalid proposalHash';
        {
            const response: any = await testUtil.rpc(voteMethod, [
                votePostSubCommand,
				createVote.profileId,
                invalidProposalHash,
                createVote.optionId
            ]);
            response.expectJson();
            response.expectStatusCode(404);
        }
    });

    test('Should fail to post a vote because it has an invalid (non-numeric) arg (proposalOptionId)', async () => {
        const invalidProposalOptionId = 'Invalid proposalOptionId';
        {
            const response: any = await testUtil.rpc(voteMethod, [
                votePostSubCommand,
                createVote.profileId,
                createVote.hash,
                invalidProposalOptionId
            ]);
            response.expectJson();
            response.expectStatusCode(404);
        }
    });

    test('Should fail to post a vote because it has an invalid (non-existent) arg (proposalOptionId)', async () => {
        const invalidProposalOptionId = 999999999999999999;
        {
            const response: any = await testUtil.rpc(voteMethod, [
                votePostSubCommand,
                createVote.profileId,
                createVote.hash,
                invalidProposalOptionId
            ]);
            response.expectJson();
            response.expectStatusCode(404);
        }
    });

    test('Should post a vote', async () => {
        {
            const response: any = await testUtil.rpc(voteMethod, [
                votePostSubCommand,
                createVote.profileId,
                createVote.hash,
                createVote.optionId
            ]);
            response.expectJson();
            response.expectStatusCode(200);
            const result: any = response.getBody()['result'];
            expect(result.result).toEqual('Sent.');
        }

        const response = await testUtil.rpcWaitFor(voteMethod,
            [
                voteGetSubCommand,
                createVote.profileId,
                createVote.hash
            ],
            30 * 60, // maxSeconds
            200, // waitForStatusCode
            'voter', // property name
            createVote.address // value to match
        );
        response.expectJson();
        const result: any = response.getBody()['result'];
        log.error('result = ' + JSON.stringify(result, null, 2));

        // TODO: validation
        expect(result.voter).toBe(createVote.address);
        expect(result.weight).toBe(1);
        expect(result.ProposalOption.optionId).toBe(createVote.optionId);
        expect(result.ProposalOption.Proposal.hash).toBe(createVote.hash);
    }, 600000); // timeout to 600s

    test('Should update a vote', async () => {
        {
            const response: any = await testUtil.rpc(voteMethod, [
                votePostSubCommand,
                updateVote.profileId,
                updateVote.hash,
                updateVote.optionId
            ]);
            response.expectJson();
            response.expectStatusCode(200);
            const result: any = response.getBody()['result'];
            expect(result.result).toEqual('Sent.');
        }

        // Get created. Check its been updated and matches updated.
        {
	        const response = await testUtil.rpcWaitFor(voteMethod,
	            [
	                voteGetSubCommand,
	                createVote.profileId,
	                createVote.hash
	            ],
	            30 * 60, // maxSeconds
	            200, // waitForStatusCode
	            'ProposalOption.optionId', // property name
	            updateVote.optionId // value to match
	        );
	        response.expectJson();
	        const result: any = response.getBody()['result'];

	        expect(result.voter).toBe(updateVote.address);
	        expect(result.weight).toBe(1);
	        expect(result.ProposalOption.optionId).toBe(updateVote.optionId);
	        expect(result.ProposalOption.Proposal.hash).toBe(updateVote.hash);
	    }

	    // Now try it the other way. Get updated, check it matches updated.
	    {
	        const response = await testUtil.rpcWaitFor(voteMethod,
	            [
	                voteGetSubCommand,
	                updateVote.profileId,
	                updateVote.hash
	            ],
	            30 * 60, // maxSeconds
	            200, // waitForStatusCode
	            'ProposalOption.optionId', // property name
	            updateVote.optionId // value to match
	        );
	        response.expectJson();
	        const result: any = response.getBody()['result'];

	        expect(result.voter).toBe(createVote.address);
	        expect(result.weight).toBe(1);
	        expect(result.ProposalOption.optionId).toBe(updateVote.optionId);
	        expect(result.ProposalOption.Proposal.hash).toBe(createVote.hash);
	    }
    }, 600000); // timeout to 600s
});
