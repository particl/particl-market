// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as Faker from 'faker';
import * as resources from 'resources';
import { Logger as LoggerType } from '../../src/core/Logger';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Commands } from '../../src/api/commands/CommandEnumType';
import { CombinedVote } from '../../src/api/services/action/VoteActionService';
import { ProposalCategory } from '../../src/api/enums/ProposalCategory';

describe('Happy Vote Flow', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtilSellerNode = new BlackBoxTestUtil(randomBoolean ? 0 : 1);
    const testUtilBuyerNode = new BlackBoxTestUtil(randomBoolean ? 1 : 0);

    const proposalCommand = Commands.PROPOSAL_ROOT.commandName;
    const proposalPostCommand = Commands.PROPOSAL_POST.commandName;
    const proposalListCommand = Commands.PROPOSAL_LIST.commandName;
    const proposalGetCommand = Commands.PROPOSAL_GET.commandName;
    const proposalResultCommand = Commands.PROPOSAL_RESULT.commandName;
    const voteCommand = Commands.VOTE_ROOT.commandName;
    const votePostCommand = Commands.VOTE_POST.commandName;
    const voteGetCommand = Commands.VOTE_GET.commandName;

    let sellerProfile: resources.Profile;
    let buyerProfile: resources.Profile;
    let sellerMarket: resources.Market;
    let buyerMarket: resources.Market;

    let proposalReceivedOnSellerNode: resources.Proposal;
    let proposalReceivedOnBuyerNode: resources.Proposal;

    let sellerCombinedVote: CombinedVote;
    let buyerCombinedVote: CombinedVote;

    let proposalResultOnSellerNode: resources.ProposalResult;
    let proposalResultOnBuyerNode: resources.ProposalResult;

    let sellerVoteAddressCount: number;
    let buyerVoteAddressCount: number;

    const estimateFee = false;
    const DAYS_RETENTION = 1;
    const testStartTimeStamp = Date.now();

    const proposalTitle = Faker.lorem.words();
    const proposalDescription = Faker.lorem.paragraph();

    let sent = false;

    beforeAll(async () => {

        await testUtilSellerNode.cleanDb();
        await testUtilBuyerNode.cleanDb();

        sellerProfile = await testUtilSellerNode.getDefaultProfile();
        buyerProfile = await testUtilBuyerNode.getDefaultProfile();
        expect(sellerProfile.id).toBeDefined();
        expect(buyerProfile.id).toBeDefined();
        log.debug('sellerProfile: ', sellerProfile.address);
        log.debug('buyerProfile: ', buyerProfile.address);

        sellerMarket = await testUtilSellerNode.getDefaultMarket(sellerProfile.id);
        buyerMarket = await testUtilBuyerNode.getDefaultMarket(buyerProfile.id);
        expect(sellerMarket.id).toBeDefined();
        expect(buyerMarket.id).toBeDefined();
        log.debug('sellerMarket: ', JSON.stringify(sellerMarket, null, 2));
        log.debug('buyerMarket: ', JSON.stringify(buyerMarket, null, 2));

    });


    test('Should unlock the possibly locked outputs left from other tests', async () => {
        await testUtilSellerNode.unlockLockedOutputs(sellerMarket.Identity.wallet);
        await testUtilBuyerNode.unlockLockedOutputs(buyerMarket.Identity.wallet);
    }, 600000); // timeout to 600s


    test('===> MPA_PROPOSAL_ADD <=================================================================', async () => {
        expect(true).toBe(true);
    }, 600000); // timeout to 600s


    test('Should post MPA_PROPOSAL_ADD from BUYER node', async () => {

        log.debug('========================================================================================');
        log.debug('BUYER POSTS MPA_PROPOSAL_ADD');
        log.debug('========================================================================================');

        await testUtilSellerNode.waitFor(5);

        const response: any = await testUtilSellerNode.rpc(proposalCommand, [proposalPostCommand,
            sellerMarket.id,
            proposalTitle,
            proposalDescription,
            DAYS_RETENTION,
            estimateFee,            // false
            'YES',
            'NO'
        ]);
        response.expectJson();
        response.expectStatusCode(200);

        const result: any = response.getBody()['result'];
        sent = result.result === 'Sent.';
        if (!sent) {
            log.debug(JSON.stringify(result, null, 2));
        }
        expect(result.result).toEqual('Sent.');
    });


    test('Should have created Proposal on BUYER node', async () => {

        expect(sent).toBeTruthy();

        log.debug('========================================================================================');
        log.debug('BUYER RECEIVES MPA_PROPOSAL_ADD');
        log.debug('========================================================================================');

        await testUtilBuyerNode.waitFor(2);

        const response = await testUtilBuyerNode.rpcWaitFor(proposalCommand, [proposalListCommand,
                '*',
                '*',
                ProposalCategory.PUBLIC_VOTE
            ],
            30 * 60,                // maxSeconds
            200,                // waitForStatusCode
            '[0].title',     // property name
            proposalTitle,                       // value
            '='
        );
        response.expectJson();
        response.expectStatusCode(200);

        const result: resources.Proposal = response.getBody()['result'][0];
        expect(result.title).toBe(proposalTitle);
        expect(result.description).toBe(proposalDescription);
        expect(result.ProposalOptions.length).toBe(2);

        proposalReceivedOnBuyerNode = result;

    }, 600000); // timeout to 600s


    test('Should have received Proposal on SELLER node', async () => {

        expect(sent).toBeTruthy();
        expect(proposalReceivedOnBuyerNode).toBeDefined();

        log.debug('========================================================================================');
        log.debug('SELLER RECEIVES MPA_PROPOSAL_ADD');
        log.debug('========================================================================================');

        await testUtilSellerNode.waitFor(5);

        const response = await testUtilSellerNode.rpcWaitFor(proposalCommand, [proposalGetCommand,
                proposalReceivedOnBuyerNode.hash
            ],
            30 * 60,                // maxSeconds
            200,                // waitForStatusCode
            'hash',          // property name
            proposalReceivedOnBuyerNode.hash    // value
        );
        response.expectJson();
        response.expectStatusCode(200);

        const result: resources.Proposal = response.getBody()['result'];
        expect(result.title).toBe(proposalReceivedOnBuyerNode.title);
        expect(result.description).toBe(proposalReceivedOnBuyerNode.description);
        expect(result.timeStart).toBeGreaterThan(testStartTimeStamp);
        expect(result.receivedAt).toBeGreaterThan(testStartTimeStamp);
        expect(result.postedAt).toBeGreaterThan(testStartTimeStamp);
        expect(result.expiredAt).toBeGreaterThan(testStartTimeStamp);
        expect(result.ProposalOptions[0].description).toBe(proposalReceivedOnBuyerNode.ProposalOptions[0].description);
        expect(result.ProposalOptions[1].description).toBe(proposalReceivedOnBuyerNode.ProposalOptions[1].description);

        log.debug('proposal: ', JSON.stringify(result, null, 2));

        // store Proposal for later tests
        proposalReceivedOnSellerNode = result;

    }, 600000); // timeout to 600s


    test('===> SELLER VOTES <=====================================================================', async () => {
        expect(true).toBe(true);
    }, 600000); // timeout to 600s


    test('Should post MPA_VOTE from SELLER node', async () => {

        expect(sent).toBeTruthy();
        expect(proposalReceivedOnBuyerNode).toBeDefined();
        expect(proposalReceivedOnSellerNode).toBeDefined();
        sent = false;

        log.debug('========================================================================================');
        log.debug('SELLER POSTS MPA_VOTE');
        log.debug('========================================================================================');

        const response: any = await testUtilSellerNode.rpc(voteCommand, [votePostCommand,
            sellerMarket.id,
            proposalReceivedOnSellerNode.hash,
            proposalReceivedOnSellerNode.ProposalOptions[0].optionId
        ]);
        response.expectJson();
        response.expectStatusCode(200);

        const result: any = response.getBody()['result'];
        sellerVoteAddressCount = result.msgids.length;
        expect(sellerVoteAddressCount).toBeGreaterThan(0);

        sent = result.result === 'Sent.';
        if (!sent) {
            log.debug(JSON.stringify(result, null, 2));
        }
        expect(result.result).toEqual('Sent.');

    });

    test('Should have created SELLER Votes on SELLER node', async () => {

        expect(sent).toBeTruthy();
        expect(proposalReceivedOnBuyerNode).toBeDefined();
        expect(proposalReceivedOnSellerNode).toBeDefined();
        expect(sellerVoteAddressCount).toBeGreaterThan(0);

        log.debug('========================================================================================');
        log.debug('SELLER RECEIVES MPA_VOTE');
        log.debug('========================================================================================');

        await testUtilSellerNode.waitFor(3);

        const response: any = await testUtilSellerNode.rpcWaitFor(voteCommand, [voteGetCommand,
                sellerMarket.id,
                proposalReceivedOnSellerNode.hash
            ],
            8 * 60,
            200,
            'votedProposalOption.optionId',
            proposalReceivedOnSellerNode.ProposalOptions[0].optionId,
            '='
        );
        response.expectJson();
        response.expectStatusCode(200);

        const result: CombinedVote = response.getBody()['result'];
        expect(result.postedAt).toBeGreaterThan(testStartTimeStamp);
        expect(result.receivedAt).toBeGreaterThan(testStartTimeStamp);
        expect(result.expiredAt).toBeGreaterThan(testStartTimeStamp);
        expect(result.weight).toBeGreaterThan(0);
        expect(result.votedProposalOption.optionId).toBe(proposalReceivedOnSellerNode.ProposalOptions[0].optionId);

        sellerCombinedVote = result;
        // log.debug('sellerCombinedVote: ', JSON.stringify(sellerCombinedVote, null, 2));

    }, 600000); // timeout to 600s


    test('Should have calculated ProposalResults on SELLER node', async () => {

        expect(sent).toBeTruthy();
        expect(proposalReceivedOnBuyerNode).toBeDefined();
        expect(proposalReceivedOnSellerNode).toBeDefined();
        expect(sellerVoteAddressCount).toBeGreaterThan(0);
        expect(sellerCombinedVote.weight).toBeGreaterThan(0);
        expect(sellerCombinedVote.votedProposalOption.optionId).toBe(proposalReceivedOnSellerNode.ProposalOptions[0].optionId);

        log.debug('========================================================================================');
        log.debug('SELLER node ProposalResults');
        log.debug('========================================================================================');

        const response: any = await testUtilSellerNode.rpcWaitFor(proposalCommand, [proposalResultCommand,
                proposalReceivedOnSellerNode.hash
            ],
            8 * 60,
            200,
            'ProposalOptionResults[0].voters',
            sellerVoteAddressCount,
            '='
        );
        response.expectJson();
        response.expectStatusCode(200);

        const result: resources.ProposalResult = response.getBody()['result'];
        // log.debug('result: ', JSON.stringify(result, null, 2));
        expect(result.ProposalOptionResults[0].voters).toBe(sellerVoteAddressCount);
        expect(result.ProposalOptionResults[0].weight).toBe(sellerCombinedVote.weight);

        proposalResultOnSellerNode = result;

    }, 600000); // timeout to 600s


    test('Should have calculated ProposalResults on BUYER node', async () => {

        expect(sent).toBeTruthy();
        expect(proposalReceivedOnBuyerNode).toBeDefined();
        expect(proposalReceivedOnSellerNode).toBeDefined();
        expect(sellerVoteAddressCount).toBeGreaterThan(0);
        expect(sellerCombinedVote.weight).toBeGreaterThan(0);
        expect(sellerCombinedVote.votedProposalOption.optionId).toBe(proposalReceivedOnSellerNode.ProposalOptions[0].optionId);
        expect(proposalResultOnSellerNode.ProposalOptionResults[0].weight).toBe(sellerCombinedVote.weight);
        expect(proposalResultOnSellerNode.ProposalOptionResults[1].weight).toBe(0);

        log.debug('========================================================================================');
        log.debug('BUYER node ProposalResults');
        log.debug('========================================================================================');

        const response: any = await testUtilBuyerNode.rpcWaitFor(proposalCommand, [proposalResultCommand,
                proposalReceivedOnBuyerNode.hash
            ],
            8 * 60,
            200,
            'ProposalOptionResults[0].voters',
            sellerVoteAddressCount,
            '='
        );
        response.expectJson();
        response.expectStatusCode(200);

        const result: resources.ProposalResult = response.getBody()['result'];
        expect(result.ProposalOptionResults[0].voters).toBe(sellerVoteAddressCount);
        expect(result.ProposalOptionResults[0].weight).toBe(sellerCombinedVote.weight);

        proposalResultOnBuyerNode = result;

    }, 600000); // timeout to 600s


    test('===> SELLER VOTES AGAIN <===============================================================', async () => {
        expect(true).toBe(true);
    }, 600000); // timeout to 600s


    test('Should post MPA_VOTE from SELLER node again', async () => {

        expect(sent).toBeTruthy();
        expect(proposalReceivedOnBuyerNode).toBeDefined();
        expect(proposalReceivedOnSellerNode).toBeDefined();
        expect(sellerVoteAddressCount).toBeGreaterThan(0);
        expect(sellerCombinedVote.weight).toBeGreaterThan(0);
        expect(sellerCombinedVote.votedProposalOption.optionId).toBe(proposalReceivedOnSellerNode.ProposalOptions[0].optionId);
        expect(proposalResultOnSellerNode.ProposalOptionResults[0].weight).toBe(sellerCombinedVote.weight);
        expect(proposalResultOnSellerNode.ProposalOptionResults[1].weight).toBe(0);
        expect(proposalResultOnBuyerNode.ProposalOptionResults[0].weight).toBe(sellerCombinedVote.weight);
        expect(proposalResultOnBuyerNode.ProposalOptionResults[1].weight).toBe(0);

        log.debug('========================================================================================');
        log.debug('SELLER POSTS MPA_VOTE AGAIN');
        log.debug('========================================================================================');

        const response: any = await testUtilSellerNode.rpc(voteCommand, [votePostCommand,
            sellerMarket.id,
            proposalReceivedOnSellerNode.hash,
            proposalReceivedOnSellerNode.ProposalOptions[1].optionId
        ]);
        response.expectJson();
        response.expectStatusCode(200);

        const result: any = response.getBody()['result'];
        expect(result.msgids.length).toBe(sellerVoteAddressCount); // same addresses should still be voting
        expect(sellerVoteAddressCount).toBeGreaterThan(0);

        sent = result.result === 'Sent.';
        if (!sent) {
            log.debug(JSON.stringify(result, null, 2));
        }
        expect(result.result).toEqual('Sent.');
    });


    test('Should have updated SELLER Votes on SELLER node', async () => {

        expect(sent).toBeTruthy();
        expect(proposalReceivedOnBuyerNode).toBeDefined();
        expect(proposalReceivedOnSellerNode).toBeDefined();
        expect(sellerVoteAddressCount).toBeGreaterThan(0);
        expect(sellerCombinedVote.weight).toBeGreaterThan(0);
        expect(sellerCombinedVote.votedProposalOption.optionId).toBe(proposalReceivedOnSellerNode.ProposalOptions[0].optionId);
        expect(proposalResultOnSellerNode.ProposalOptionResults[0].weight).toBe(sellerCombinedVote.weight);
        expect(proposalResultOnSellerNode.ProposalOptionResults[1].weight).toBe(0);
        expect(proposalResultOnBuyerNode.ProposalOptionResults[0].weight).toBe(sellerCombinedVote.weight);
        expect(proposalResultOnBuyerNode.ProposalOptionResults[1].weight).toBe(0);

        log.debug('========================================================================================');
        log.debug('SELLER RECEIVES MPA_VOTE');
        log.debug('========================================================================================');

        await testUtilSellerNode.waitFor(3);

        const response: any = await testUtilSellerNode.rpcWaitFor(voteCommand, [voteGetCommand,
                sellerMarket.id,
                proposalReceivedOnSellerNode.hash
            ],
            8 * 60,
            200,
            'votedProposalOption.optionId',
            proposalReceivedOnSellerNode.ProposalOptions[1].optionId,
            '='
        );
        response.expectJson();
        response.expectStatusCode(200);

        const result: CombinedVote = response.getBody()['result'];
        expect(result.postedAt).toBeGreaterThan(testStartTimeStamp);
        expect(result.receivedAt).toBeGreaterThan(testStartTimeStamp);
        expect(result.expiredAt).toBeGreaterThan(testStartTimeStamp);
        expect(result.weight).toBeGreaterThan(0);
        expect(result.voter).toBe(sellerMarket.Identity.address);
        expect(result.votedProposalOption.optionId).toBe(proposalReceivedOnSellerNode.ProposalOptions[1].optionId);

        sellerCombinedVote = result;
        // log.debug('sellerCombinedVote: ', JSON.stringify(sellerCombinedVote, null, 2));

    }, 600000); // timeout to 600s


    test('Should have recalculated ProposalResults on SELLER node', async () => {

        expect(sent).toBeTruthy();
        expect(proposalReceivedOnBuyerNode).toBeDefined();
        expect(proposalReceivedOnSellerNode).toBeDefined();
        expect(sellerVoteAddressCount).toBeGreaterThan(0);
        expect(sellerCombinedVote.weight).toBeGreaterThan(0);
        expect(sellerCombinedVote.votedProposalOption.optionId).toBe(proposalReceivedOnSellerNode.ProposalOptions[1].optionId);
        expect(proposalResultOnSellerNode.ProposalOptionResults[0].weight).toBe(sellerCombinedVote.weight);
        expect(proposalResultOnSellerNode.ProposalOptionResults[1].weight).toBe(0);
        expect(proposalResultOnBuyerNode.ProposalOptionResults[0].weight).toBe(sellerCombinedVote.weight);
        expect(proposalResultOnBuyerNode.ProposalOptionResults[1].weight).toBe(0);

        log.debug('========================================================================================');
        log.debug('SELLER node ProposalResults');
        log.debug('========================================================================================');

        const response: any = await testUtilSellerNode.rpcWaitFor(proposalCommand, [proposalResultCommand,
                proposalReceivedOnSellerNode.hash
            ],
            8 * 60,
            200,
            'ProposalOptionResults[1].voters',
            sellerVoteAddressCount,
            '='
        );
        response.expectJson();
        response.expectStatusCode(200);

        const result: resources.ProposalResult = response.getBody()['result'];
        expect(result.ProposalOptionResults[0].voters).toBe(0);
        expect(result.ProposalOptionResults[0].weight).toBe(0);
        expect(result.ProposalOptionResults[1].voters).toBe(sellerVoteAddressCount);
        expect(result.ProposalOptionResults[1].weight).toBe(sellerCombinedVote.weight);

        proposalResultOnSellerNode = result;

    }, 600000); // timeout to 600s


    test('Should have recalculated ProposalResults on BUYER node', async () => {

        expect(sent).toBeTruthy();
        expect(proposalReceivedOnBuyerNode).toBeDefined();
        expect(proposalReceivedOnSellerNode).toBeDefined();
        expect(sellerVoteAddressCount).toBeGreaterThan(0);
        expect(sellerCombinedVote.weight).toBeGreaterThan(0);
        expect(sellerCombinedVote.votedProposalOption.optionId).toBe(proposalReceivedOnSellerNode.ProposalOptions[1].optionId);
        expect(proposalResultOnSellerNode.ProposalOptionResults[0].weight).toBe(0);
        expect(proposalResultOnSellerNode.ProposalOptionResults[1].weight).toBe(sellerCombinedVote.weight);
        expect(proposalResultOnBuyerNode.ProposalOptionResults[0].weight).toBe(sellerCombinedVote.weight);
        expect(proposalResultOnBuyerNode.ProposalOptionResults[1].weight).toBe(0);

        log.debug('========================================================================================');
        log.debug('BUYER node ProposalResults');
        log.debug('========================================================================================');

        const response: any = await testUtilBuyerNode.rpcWaitFor(proposalCommand, [proposalResultCommand,
                proposalReceivedOnBuyerNode.hash
            ],
            8 * 60,
            200,
            'ProposalOptionResults[1].voters',
            sellerVoteAddressCount,
            '='
        );
        response.expectJson();
        response.expectStatusCode(200);

        const result: resources.ProposalResult = response.getBody()['result'];
        expect(result.ProposalOptionResults[0].voters).toBe(0);
        expect(result.ProposalOptionResults[0].weight).toBe(0);
        expect(result.ProposalOptionResults[1].voters).toBe(sellerVoteAddressCount);
        expect(result.ProposalOptionResults[1].weight).toBe(sellerCombinedVote.weight);

        proposalResultOnBuyerNode = result;

    }, 600000); // timeout to 600s


    test('===> BUYER VOTES <======================================================================', async () => {
        expect(true).toBe(true);
    }, 600000); // timeout to 600s


    test('Should post MPA_VOTE from BUYER node', async () => {

        expect(sent).toBeTruthy();
        expect(proposalReceivedOnBuyerNode).toBeDefined();
        expect(proposalReceivedOnSellerNode).toBeDefined();
        expect(sellerVoteAddressCount).toBeGreaterThan(0);
        expect(sellerCombinedVote.weight).toBeGreaterThan(0);
        expect(sellerCombinedVote.votedProposalOption.optionId).toBe(proposalReceivedOnSellerNode.ProposalOptions[1].optionId);
        expect(proposalResultOnSellerNode.ProposalOptionResults[0].weight).toBe(0);
        expect(proposalResultOnSellerNode.ProposalOptionResults[1].weight).toBe(sellerCombinedVote.weight);
        expect(proposalResultOnBuyerNode.ProposalOptionResults[0].weight).toBe(0);
        expect(proposalResultOnBuyerNode.ProposalOptionResults[1].weight).toBe(sellerCombinedVote.weight);

        log.debug('========================================================================================');
        log.debug('BUYER POSTS MPA_VOTE ');
        log.debug('========================================================================================');

        const response: any = await testUtilBuyerNode.rpc(voteCommand, [votePostCommand,
            buyerMarket.id,
            proposalReceivedOnBuyerNode.hash,
            proposalReceivedOnBuyerNode.ProposalOptions[0].optionId
        ]);
        response.expectJson();
        response.expectStatusCode(200);

        const result: any = response.getBody()['result'];
        buyerVoteAddressCount = result.msgids.length;
        sent = result.result === 'Sent.';
        if (!sent) {
            log.debug(JSON.stringify(result, null, 2));
        }
        expect(result.result).toEqual('Sent.');

    });


    test('Should have created BUYER Votes on BUYER node', async () => {

        expect(sent).toBeTruthy();
        expect(proposalReceivedOnBuyerNode).toBeDefined();
        expect(proposalReceivedOnSellerNode).toBeDefined();
        expect(sellerVoteAddressCount).toBeGreaterThan(0);
        expect(sellerCombinedVote.weight).toBeGreaterThan(0);
        expect(sellerCombinedVote.votedProposalOption.optionId).toBe(proposalReceivedOnSellerNode.ProposalOptions[1].optionId);
        expect(proposalResultOnSellerNode.ProposalOptionResults[0].weight).toBe(0);
        expect(proposalResultOnSellerNode.ProposalOptionResults[1].weight).toBe(sellerCombinedVote.weight);
        expect(proposalResultOnBuyerNode.ProposalOptionResults[0].weight).toBe(0);
        expect(proposalResultOnBuyerNode.ProposalOptionResults[1].weight).toBe(sellerCombinedVote.weight);

        log.debug('========================================================================================');
        log.debug('SELLER RECEIVES MPA_VOTE');
        log.debug('========================================================================================');
        log.debug('sellerVoteAddressCount: ', sellerVoteAddressCount);
        log.debug('buyerVoteAddressCount: ', buyerVoteAddressCount);

        await testUtilBuyerNode.waitFor(3);

        const response: any = await testUtilBuyerNode.rpcWaitFor(voteCommand, [voteGetCommand,
                buyerMarket.id,
                proposalReceivedOnBuyerNode.hash
            ],
            8 * 60,
            200,
            'votedProposalOption.optionId',
            proposalReceivedOnBuyerNode.ProposalOptions[0].optionId,
            '='
        );
        response.expectJson();
        response.expectStatusCode(200);

        const result: resources.Vote = response.getBody()['result'];
        expect(result.receivedAt).toBeGreaterThan(testStartTimeStamp);
        expect(result.postedAt).toBeGreaterThan(testStartTimeStamp);
        expect(result.expiredAt).toBeGreaterThan(testStartTimeStamp);
        expect(result.weight).toBeGreaterThan(0);
        expect(result.voter).toBe(buyerMarket.Identity.address);
        expect(result.votedProposalOption.optionId).toBe(proposalReceivedOnBuyerNode.ProposalOptions[0].optionId);

        buyerCombinedVote = result;

    }, 600000); // timeout to 600s


    test('Should have calculated ProposalResults on BUYER node', async () => {

        expect(sent).toBeTruthy();
        expect(proposalReceivedOnBuyerNode).toBeDefined();
        expect(proposalReceivedOnSellerNode).toBeDefined();
        expect(sellerVoteAddressCount).toBeGreaterThan(0);
        expect(sellerCombinedVote.weight).toBeGreaterThan(0);
        expect(sellerCombinedVote.votedProposalOption.optionId).toBe(proposalReceivedOnSellerNode.ProposalOptions[1].optionId);
        expect(proposalResultOnSellerNode.ProposalOptionResults[0].weight).toBe(0);
        expect(proposalResultOnSellerNode.ProposalOptionResults[1].weight).toBe(sellerCombinedVote.weight);
        expect(proposalResultOnBuyerNode.ProposalOptionResults[0].weight).toBe(0);
        expect(proposalResultOnBuyerNode.ProposalOptionResults[1].weight).toBe(sellerCombinedVote.weight);
        expect(buyerCombinedVote.weight).toBeGreaterThan(0);
        expect(buyerCombinedVote.votedProposalOption.optionId).toBe(proposalReceivedOnBuyerNode.ProposalOptions[0].optionId);

        log.debug('========================================================================================');
        log.debug('BUYER node ProposalResults');
        log.debug('========================================================================================');
        log.debug('sellerVoteAddressCount: ', sellerVoteAddressCount);
        log.debug('buyerVoteAddressCount: ', buyerVoteAddressCount);

        const response: any = await testUtilBuyerNode.rpcWaitFor(proposalCommand, [proposalResultCommand,
                proposalReceivedOnSellerNode.hash
            ],
            8 * 60,
            200,
            'ProposalOptionResults[0].voters',
            buyerVoteAddressCount,
            '='
        );
        response.expectJson();
        response.expectStatusCode(200);

        const result: resources.ProposalResult = response.getBody()['result'];
        expect(result.ProposalOptionResults[0].voters).toBe(buyerVoteAddressCount);
        expect(result.ProposalOptionResults[0].weight).toBe(buyerCombinedVote.weight);
        expect(result.ProposalOptionResults[1].voters).toBe(sellerVoteAddressCount);
        expect(result.ProposalOptionResults[1].weight).toBe(sellerCombinedVote.weight);

        proposalResultOnBuyerNode = result;
    }, 600000); // timeout to 600s


    test('Should have calculated ProposalResults on SELLER node', async () => {

        expect(sent).toBeTruthy();
        expect(proposalReceivedOnBuyerNode).toBeDefined();
        expect(proposalReceivedOnSellerNode).toBeDefined();
        expect(sellerVoteAddressCount).toBeGreaterThan(0);
        expect(sellerCombinedVote.weight).toBeGreaterThan(0);
        expect(sellerCombinedVote.votedProposalOption.optionId).toBe(proposalReceivedOnSellerNode.ProposalOptions[1].optionId);
        expect(proposalResultOnSellerNode.ProposalOptionResults[0].weight).toBe(0);
        expect(proposalResultOnSellerNode.ProposalOptionResults[1].weight).toBe(sellerCombinedVote.weight);
        expect(proposalResultOnBuyerNode.ProposalOptionResults[0].weight).toBe(buyerCombinedVote.weight);
        expect(proposalResultOnBuyerNode.ProposalOptionResults[1].weight).toBe(sellerCombinedVote.weight);
        expect(buyerCombinedVote.weight).toBeGreaterThan(0);
        expect(buyerCombinedVote.votedProposalOption.optionId).toBe(proposalReceivedOnBuyerNode.ProposalOptions[0].optionId);

        log.debug('========================================================================================');
        log.debug('BUYER node ProposalResults');
        log.debug('========================================================================================');
        log.debug('sellerVoteAddressCount: ', sellerVoteAddressCount);
        log.debug('buyerVoteAddressCount: ', buyerVoteAddressCount);

        const response: any = await testUtilSellerNode.rpcWaitFor(proposalCommand, [proposalResultCommand,
                proposalReceivedOnSellerNode.hash
            ],
            8 * 60,
            200,
            'ProposalOptionResults[0].voters',
             buyerVoteAddressCount,
            '='
        );
        response.expectJson();
        response.expectStatusCode(200);

        const result: resources.ProposalResult = response.getBody()['result'];
        expect(result.ProposalOptionResults[0].voters).toBe(buyerVoteAddressCount);
        expect(result.ProposalOptionResults[0].weight).toBe(buyerCombinedVote.weight);
        expect(result.ProposalOptionResults[1].voters).toBe(sellerVoteAddressCount);
        expect(result.ProposalOptionResults[1].weight).toBe(sellerCombinedVote.weight);

        proposalResultOnSellerNode = result;

    }, 600000); // timeout to 600s

});
