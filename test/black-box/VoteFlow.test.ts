// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as Faker from 'faker';
import * as resources from 'resources';
import { Logger as LoggerType } from '../../src/core/Logger';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Commands } from '../../src/api/commands/CommandEnumType';
import {SmsgSendResponse} from '../../src/api/responses/SmsgSendResponse';

describe('Happy Vote Flow', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtilNode1 = new BlackBoxTestUtil(randomBoolean ? 0 : 1);
    const testUtilNode2 = new BlackBoxTestUtil(randomBoolean ? 1 : 0);
    // const testUtilNode1 = new BlackBoxTestUtil(0);
    // const testUtilNode2 = new BlackBoxTestUtil(1);

    const proposalCommand = Commands.PROPOSAL_ROOT.commandName;
    const proposalPostCommand = Commands.PROPOSAL_POST.commandName;
    const proposalListCommand = Commands.PROPOSAL_LIST.commandName;
    const proposalGetCommand = Commands.PROPOSAL_GET.commandName;
    const proposalResultCommand = Commands.PROPOSAL_RESULT.commandName;
    const voteCommand = Commands.VOTE_ROOT.commandName;
    const votePostCommand = Commands.VOTE_POST.commandName;
    const voteGetCommand = Commands.VOTE_GET.commandName;
    const daemonCommand = Commands.DAEMON_ROOT.commandName;

    let profileNode1: resources.Profile;
    let profileNode2: resources.Profile;
    let marketNode1: resources.Market;
    let marketNode2: resources.Market;

    let proposalNode1: resources.Proposal;
    let proposalNode2: resources.Proposal;
    let vote1Node1: resources.Vote;
    let vote2Node2: resources.Vote;
    let vote1AddressCount: number;
    let vote2AddressCount: number;

    const estimateFee = false;
    const daysRetention = 3;
    const testStartTimeStamp = new Date().getTime();

    const proposalTitle = Faker.lorem.words();
    const proposalDescription = Faker.lorem.paragraph();

    let sent = false;

    beforeAll(async () => {

        // await testUtilNode0.cleanDb();
        await testUtilNode1.cleanDb();
        await testUtilNode2.cleanDb();

        profileNode1 = await testUtilNode1.getDefaultProfile();
        profileNode2 = await testUtilNode2.getDefaultProfile();
        expect(profileNode1.id).toBeDefined();
        expect(profileNode2.id).toBeDefined();
        log.debug('profileNode1: ', profileNode1.address);
        log.debug('profileNode2: ', profileNode2.address);

        marketNode1 = await testUtilNode1.getDefaultMarket();
        marketNode2 = await testUtilNode2.getDefaultMarket();
        expect(marketNode1.id).toBeDefined();
        expect(marketNode2.id).toBeDefined();
        log.debug('marketNode1: ', JSON.stringify(marketNode1, null, 2));
        log.debug('marketNode2: ', JSON.stringify(marketNode2, null, 2));

    });

    test('Should post Proposal from node1', async () => {

        log.debug('========================================================================================');
        log.debug('Node1 POSTS MP_PROPOSAL_ADD');
        log.debug('========================================================================================');

        await testUtilNode1.waitFor(5);

        const response: any = await testUtilNode1.rpc(proposalCommand, [proposalPostCommand,
            profileNode1.id,
            proposalTitle,
            proposalDescription,
            daysRetention,
            estimateFee,
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

    test('Should have created Proposal on node1', async () => {

        expect(sent).toBeTruthy();

        log.debug('========================================================================================');
        log.debug('Node1 RECEIVES MP_PROPOSAL_ADD');
        log.debug('========================================================================================');

        await testUtilNode1.waitFor(5);

        const response = await testUtilNode1.rpcWaitFor(proposalCommand,
            [proposalListCommand, '*', '*'],
            30 * 60,            // maxSeconds
            200,            // waitForStatusCode
            '[0].title', // property name
            proposalTitle                   // value
        );
        response.expectJson();
        response.expectStatusCode(200);

        const result: resources.Proposal = response.getBody()['result'][0];
        expect(result.title).toBe(proposalTitle);
        expect(result.description).toBe(proposalDescription);

        // store Proposal for later tests
        proposalNode1 = result;

    }, 600000); // timeout to 600s

    test('Should have created Proposal on node2', async () => {

        expect(sent).toBeTruthy();

        log.debug('========================================================================================');
        log.debug('Node2 RECEIVES MP_PROPOSAL_ADD');
        log.debug('========================================================================================');

        await testUtilNode2.waitFor(5);

        const response = await testUtilNode2.rpcWaitFor(proposalCommand,
            [proposalGetCommand, proposalNode1.hash],
            30 * 60,        // maxSeconds
            200,       // waitForStatusCode
            'hash', // property name
            proposalNode1.hash         // value
        );
        response.expectJson();
        response.expectStatusCode(200);

        const result: resources.Proposal = response.getBody()['result'];
        expect(result.title).toBe(proposalNode1.title);
        expect(result.description).toBe(proposalNode1.description);
        expect(result.timeStart).toBeGreaterThan(testStartTimeStamp);
        expect(result.receivedAt).toBeGreaterThan(testStartTimeStamp);
        expect(result.postedAt).toBeGreaterThan(testStartTimeStamp);
        expect(result.expiredAt).toBeGreaterThan(testStartTimeStamp);

        log.debug('proposal: ', JSON.stringify(result, null, 2));
        expect(result.ProposalOptions[0].description).toBe(proposalNode1.ProposalOptions[0].description);
        expect(result.ProposalOptions[1].description).toBe(proposalNode1.ProposalOptions[1].description);

        // store Proposal for later tests
        proposalNode2 = result;

    }, 600000); // timeout to 600s

    test('Should post Votes from node1', async () => {

        expect(sent).toBeTruthy();
        sent = false;

        log.debug('========================================================================================');
        log.debug('Vote1 - Node1 POSTS MP_VOTE_ADD (default profile)');
        log.debug('========================================================================================');

        const response: any = await testUtilNode1.rpc(voteCommand, [
            votePostCommand,
            profileNode1.id,
            proposalNode1.hash,
            proposalNode1.ProposalOptions[0].optionId
        ]);
        response.expectJson();
        response.expectStatusCode(200);

        const result: any = response.getBody()['result'];
        vote1AddressCount = result.msgids.length;
        expect(vote1AddressCount).toBeGreaterThan(0);

        sent = result.result === 'Sent.';
        if (!sent) {
            log.debug(JSON.stringify(result, null, 2));
        }
        expect(result.result).toEqual('Sent.');

    });

    test('Should have created Votes on node1', async () => {

        expect(sent).toBeTruthy();
        expect(vote1AddressCount).toBeGreaterThan(0);

        log.debug('========================================================================================');
        log.debug('Vote1 - Node1 RECEIVES MP_VOTE_ADD (confirm with: vote get)');
        log.debug('========================================================================================');
        log.debug('vote1AddressCount: ', vote1AddressCount);

        await testUtilNode1.waitFor(3);

        const response: any = await testUtilNode1.rpcWaitFor(voteCommand,
            [voteGetCommand, profileNode1.id, proposalNode1.hash],
            8 * 60,
            200,
            'ProposalOption.optionId',
            proposalNode1.ProposalOptions[0].optionId,
            '='
        );
        response.expectJson();
        response.expectStatusCode(200);

        const result: resources.Vote = response.getBody()['result'];
        vote1Node1 = result;
        expect(result).hasOwnProperty('ProposalOption');
        expect(result.postedAt).toBeGreaterThan(testStartTimeStamp);
        expect(result.receivedAt).toBeGreaterThan(testStartTimeStamp);
        expect(result.expiredAt).toBeGreaterThan(testStartTimeStamp);
        expect(result.weight).toBeGreaterThan(0);
        expect(result.ProposalOption.optionId).toBe(proposalNode1.ProposalOptions[0].optionId);
    }, 600000); // timeout to 600s

    test('Should have created ProposalResults after receiving Vote1 on node1', async () => {

        expect(sent).toBeTruthy();

        log.debug('========================================================================================');
        log.debug('Vote1 - Node1 ProposalResults');
        log.debug('========================================================================================');
        log.debug('vote1AddressCount: ', vote1AddressCount);

        const response: any = await testUtilNode1.rpcWaitFor(
            proposalCommand,
            [proposalResultCommand, proposalNode1.hash],
            8 * 60,
            200,
            'ProposalOptionResults[0].voters',
            vote1AddressCount,
            '='
        );
        response.expectJson();
        response.expectStatusCode(200);

        const result: resources.ProposalResult = response.getBody()['result'];
        expect(result).hasOwnProperty('Proposal');
        expect(result).hasOwnProperty('ProposalOptionResults');
        expect(result.ProposalOptionResults[0].voters).toBe(vote1AddressCount);
        expect(result.ProposalOptionResults[0].weight).toBe(vote1Node1.weight);
    }, 600000); // timeout to 600s

    test('Should have created ProposalResults after receiving Vote1 on node2', async () => {

        expect(sent).toBeTruthy();

        log.debug('========================================================================================');
        log.debug('Vote1 - Node2 RECEIVES MP_VOTE_ADD (confirm with: proposal result)');
        log.debug('========================================================================================');
        log.debug('vote1AddressCount: ', vote1AddressCount);

        const response: any = await testUtilNode2.rpcWaitFor(
            proposalCommand,
            [proposalResultCommand, proposalNode2.hash],
            8 * 60,
            200,
            'ProposalOptionResults[0].voters',
            vote1AddressCount,
            '='
        );
        response.expectJson();
        response.expectStatusCode(200);

        const result: resources.ProposalResult = response.getBody()['result'];
        expect(result).hasOwnProperty('Proposal');
        expect(result).hasOwnProperty('ProposalOptionResults');
        expect(result.ProposalOptionResults[0].voters).toBe(vote1AddressCount);
        expect(result.ProposalOptionResults[0].weight).toBe(vote1Node1.weight);
    }, 600000); // timeout to 600s

    test('Should post Vote1 again from node1', async () => {

        expect(sent).toBeTruthy();

        log.debug('========================================================================================');
        log.debug('Vote1 - Node1 POSTS MP_VOTE_ADD with different optionId');
        log.debug('========================================================================================');

        const response: any = await testUtilNode1.rpc(voteCommand, [
            votePostCommand,
            profileNode1.id,
            proposalNode1.hash,
            proposalNode1.ProposalOptions[1].optionId
        ]);
        response.expectJson();
        response.expectStatusCode(200);

        const result: any = response.getBody()['result'];
        expect(result.msgids.length).toBe(vote1AddressCount); // same addresses should still be voting

        vote1AddressCount = result.msgids.length;
        expect(vote1AddressCount).toBeGreaterThan(0);

        sent = result.result === 'Sent.';
        if (!sent) {
            log.debug(JSON.stringify(result, null, 2));
        }
        expect(result.result).toEqual('Sent.');
    });

    test('Should have recreated ProposalResults after receiving Vote1 on node1', async () => {

        expect(sent).toBeTruthy();

        log.debug('========================================================================================');
        log.debug('Vote1 - Node1 ProposalResults');
        log.debug('========================================================================================');

        const response: any = await testUtilNode1.rpcWaitFor(
            proposalCommand,
            [proposalResultCommand, proposalNode1.hash],
            8 * 60,
            200,
            'ProposalOptionResults[1].voters',
            vote1AddressCount,
            '='
        );
        response.expectJson();
        response.expectStatusCode(200);

        const result: resources.ProposalResult = response.getBody()['result'];
        expect(result).hasOwnProperty('Proposal');
        expect(result).hasOwnProperty('ProposalOptionResults');
        expect(result.ProposalOptionResults[0].voters).toBe(0);
        expect(result.ProposalOptionResults[0].weight).toBe(0);
        expect(result.ProposalOptionResults[1].voters).toBe(vote1AddressCount);
        expect(result.ProposalOptionResults[1].weight).toBe(vote1Node1.weight);
    }, 600000); // timeout to 600s

    test('Should post Vote2 from node2', async () => {

        expect(sent).toBeTruthy();

        log.debug('========================================================================================');
        log.debug('Vote2 - Node2 POSTS MP_VOTE_ADD (default profile)');
        log.debug('========================================================================================');

        const response: any = await testUtilNode2.rpc(voteCommand, [
            votePostCommand,
            profileNode2.id,
            proposalNode2.hash,
            proposalNode2.ProposalOptions[0].optionId
        ]);
        response.expectJson();
        response.expectStatusCode(200);

        const result: any = response.getBody()['result'];
        vote2AddressCount = result.msgids.length;
        sent = result.result === 'Sent.';
        if (!sent) {
            log.debug(JSON.stringify(result, null, 2));
        }
        expect(result.result).toEqual('Sent.');

    });

    test('Should have created Vote2 on node2', async () => {

        expect(sent).toBeTruthy();

        log.debug('========================================================================================');
        log.debug('Vote2 - Node2 RECEIVES MP_VOTE_ADD (confirm with: vote get)');
        log.debug('========================================================================================');
        log.debug('vote1AddressCount: ', vote1AddressCount);
        log.debug('vote2AddressCount: ', vote2AddressCount);

        await testUtilNode2.waitFor(3);

        const response: any = await testUtilNode2.rpcWaitFor(
            voteCommand,
            [voteGetCommand, profileNode2.id, proposalNode2.hash],
            8 * 60,
            200,
            'ProposalOption.optionId',
            proposalNode2.ProposalOptions[0].optionId,
            '='
        );
        response.expectJson();
        response.expectStatusCode(200);

        const result: resources.Vote = response.getBody()['result'];
        vote2Node2 = result;
        expect(result).hasOwnProperty('ProposalOption');
        expect(result.receivedAt).toBeGreaterThan(testStartTimeStamp);
        expect(result.postedAt).toBeGreaterThan(testStartTimeStamp);
        expect(result.expiredAt).toBeGreaterThan(testStartTimeStamp);
        expect(result.weight).toBeGreaterThan(0);
        expect(result.voter).toBe(profileNode2.address);
        expect(result.ProposalOption.optionId).toBe(proposalNode2.ProposalOptions[0].optionId);
    }, 600000); // timeout to 600s

    test('Should have updated ProposalResults after receiving Vote2 on node2', async () => {

        expect(sent).toBeTruthy();

        log.debug('========================================================================================');
        log.debug('Vote2 - Node2 ProposalResults');
        log.debug('========================================================================================');
        log.debug('vote1AddressCount: ', vote1AddressCount);
        log.debug('vote2AddressCount: ', vote2AddressCount);

        const response: any = await testUtilNode2.rpcWaitFor(
            proposalCommand,
            [proposalResultCommand, proposalNode1.hash],
            8 * 60,
            200,
            'ProposalOptionResults[0].voters',
            vote2AddressCount,
            '='
        );
        response.expectJson();
        response.expectStatusCode(200);

        const result: resources.ProposalResult = response.getBody()['result'];
        expect(result).hasOwnProperty('Proposal');
        expect(result).hasOwnProperty('ProposalOptionResults');
        expect(result.ProposalOptionResults[0].voters).toBe(vote2AddressCount);
        expect(result.ProposalOptionResults[0].weight).toBe(vote2Node2.weight);
        expect(result.ProposalOptionResults[1].voters).toBe(vote1AddressCount);
        expect(result.ProposalOptionResults[1].weight).toBe(vote1Node1.weight);
    }, 600000); // timeout to 600s

    test('Should have updated ProposalResults after receiving Vote2 on node1', async () => {

        expect(sent).toBeTruthy();

        log.debug('========================================================================================');
        log.debug('Vote2 - Node1 RECEIVES MP_VOTE_ADD (confirm with: proposal result)');
        log.debug('========================================================================================');
        log.debug('vote1AddressCount: ', vote1AddressCount);
        log.debug('vote2AddressCount: ', vote2AddressCount);

        const response: any = await testUtilNode1.rpcWaitFor(
            proposalCommand,
            [proposalResultCommand, proposalNode1.hash],
            8 * 60,
            200,
            'ProposalOptionResults[0].voters',
             vote2AddressCount,
            '='
        );
        response.expectJson();
        response.expectStatusCode(200);

        const result: resources.ProposalResult = response.getBody()['result'];
        expect(result).hasOwnProperty('Proposal');
        expect(result).hasOwnProperty('ProposalOptionResults');
        expect(result.ProposalOptionResults[0].voters).toBe(vote2AddressCount);
        expect(result.ProposalOptionResults[0].weight).toBe(vote2Node2.weight);
        expect(result.ProposalOptionResults[1].voters).toBe(vote1AddressCount);
        expect(result.ProposalOptionResults[1].weight).toBe(vote1Node1.weight);
    }, 600000); // timeout to 600s

    // right now we have 2 votes for optionId=0 on both nodes
    // default profiles on both nodes have voted

    test('Should post Vote2 again from node2 to change the vote optionId', async () => {

        expect(sent).toBeTruthy();

        log.debug('========================================================================================');
        log.debug('Vote2 repost - Node2 POSTS MP_VOTE_ADD (default profile)');
        log.debug('========================================================================================');

        const response: any = await testUtilNode2.rpc(voteCommand, [
            votePostCommand,
            profileNode2.id,
            proposalNode2.hash,
            proposalNode2.ProposalOptions[1].optionId
        ]);
        response.expectJson();
        response.expectStatusCode(200);

        const result: SmsgSendResponse = response.getBody()['result'];
        sent = result.result === 'Sent.';
        if (!sent) {
            log.debug(JSON.stringify(result, null, 2));
        }
        expect(result.result).toEqual('Sent.');

    });

    test('Should have updated ProposalResults after receiving reposted Vote2 on node2', async () => {

        expect(sent).toBeTruthy();

        log.debug('========================================================================================');
        log.debug('Vote2 repost - Node2 RECEIVES MP_VOTE_ADD (confirm with: proposal result)');
        log.debug('========================================================================================');

        // lets wait for some time to receive the vote otherwise rpcWaitFor will return the previous result
        await testUtilNode2.waitFor(5);

        const response: any = await testUtilNode2.rpcWaitFor(
            proposalCommand,
            [proposalResultCommand, proposalNode2.hash],
            8 * 60,
            200,
            'ProposalOptionResults[0].voters',
            0,
            '='
        );
        response.expectJson();
        response.expectStatusCode(200);

        const result: resources.ProposalResult = response.getBody()['result'];
        expect(result).hasOwnProperty('Proposal');
        expect(result).hasOwnProperty('ProposalOptionResults');
        expect(result.ProposalOptionResults[0].voters).toBe(0);
        expect(result.ProposalOptionResults[0].weight).toBe(0);
        expect(result.ProposalOptionResults[1].voters).toBe(vote1AddressCount + vote2AddressCount);
        expect(result.ProposalOptionResults[1].weight).toBe(vote1Node1.weight + vote2Node2.weight);
    }, 600000); // timeout to 600s

    test('Should have updated ProposalResults after receiving reposted Vote2 on node1', async () => {

        expect(sent).toBeTruthy();

        log.debug('========================================================================================');
        log.debug('Vote2 - Node1 ProposalResults');
        log.debug('========================================================================================');

        const response: any = await testUtilNode1.rpcWaitFor(
            proposalCommand,
            [proposalResultCommand, proposalNode1.hash],
            8 * 60,
            200,
            'ProposalOptionResults[0].voters',
            0,
            '='
        );
        response.expectJson();
        response.expectStatusCode(200);

        const result: resources.ProposalResult = response.getBody()['result'];
        expect(result).hasOwnProperty('Proposal');
        expect(result).hasOwnProperty('ProposalOptionResults');
        expect(result.ProposalOptionResults[0].voters).toBe(0);
        expect(result.ProposalOptionResults[0].weight).toBe(0);
        expect(result.ProposalOptionResults[1].voters).toBe(vote1AddressCount + vote2AddressCount);
        expect(result.ProposalOptionResults[1].weight).toBe(vote1Node1.weight + vote2Node2.weight);
    }, 600000); // timeout to 600s

});
