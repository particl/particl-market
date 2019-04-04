// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

// tslint:disable:max-line-length
import * from 'jest';
import * as resources from 'resources';
import { Logger as LoggerType } from '../../src/core/Logger';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Commands } from '../../src/api/commands/CommandEnumType';
import { GenerateListingItemTemplateParams } from '../../src/api/requests/params/GenerateListingItemTemplateParams';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { SearchOrder } from '../../src/api/enums/SearchOrder';
import { ProposalCategory } from 'ProposalCategory.ts';
import { ItemVote } from '../../src/api/enums/ItemVote';
import { GenerateProfileParams } from '../../src/api/requests/params/GenerateProfileParams';
import {SmsgSendResponse} from '../../src/api/responses/SmsgSendResponse';
// tslint:enable:max-line-length

describe('Happy ListingItem Vote Flow', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    // const testUtilNode0 = new BlackBoxTestUtil(0);
    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtilNode1 = new BlackBoxTestUtil(randomBoolean ? 0 : 1);
    const testUtilNode2 = new BlackBoxTestUtil(randomBoolean ? 1 : 0);
    // const testUtilNode1 = new BlackBoxTestUtil(0);
    // const testUtilNode2 = new BlackBoxTestUtil(1);

    const proposalCommand = Commands.PROPOSAL_ROOT.commandName;
    const proposalListCommand = Commands.PROPOSAL_LIST.commandName;
    const proposalGetCommand = Commands.PROPOSAL_GET.commandName;
    const proposalResultCommand = Commands.PROPOSAL_RESULT.commandName;
    const voteCommand = Commands.VOTE_ROOT.commandName;
    const votePostCommand = Commands.VOTE_POST.commandName;
    const voteGetCommand = Commands.VOTE_GET.commandName;
    const daemonCommand = Commands.DAEMON_ROOT.commandName;
    const templateCommand = Commands.TEMPLATE_ROOT.commandName;
    const templatePostCommand = Commands.TEMPLATE_POST.commandName;
    const templateGetCommand = Commands.TEMPLATE_GET.commandName;
    const listingItemCommand = Commands.ITEM_ROOT.commandName;
    const listingItemGetCommand = Commands.ITEM_GET.commandName;
    const listingItemFlagCommand = Commands.ITEM_FLAG.commandName;

    let profileNode1: resources.Profile;
    let profileNode2: resources.Profile;
    let marketNode1: resources.Market;
    let marketNode2: resources.Market;
    let voterProfileNode1: resources.Profile;
    let voterProfileNode2: resources.Profile;

    let listingItemTemplateNode1: resources.ListingItemTemplate;
    let listingItemNode1: resources.ListingItem;
    let listingItemNode2: resources.ListingItem;
    let proposalNode1: resources.Proposal;
    let proposalNode2: resources.Proposal;
    let voteNode1: resources.Vote;
    let voteNode2: resources.Vote;
    let proposalResultNode1: resources.ProposalResult;

    let testTimeStamp = new Date().getTime();

    const DAYS_RETENTION = 2;
    let sent = false;
    let vote1AddressCount;
    let vote2AddressCount;

    beforeAll(async () => {

        // await testUtilNode0.cleanDb();
        await testUtilNode1.cleanDb();
        await testUtilNode2.cleanDb();

        profileNode1 = await testUtilNode1.getDefaultProfile();
        profileNode2 = await testUtilNode2.getDefaultProfile();
        expect(profileNode1.id).toBeDefined();
        expect(profileNode2.id).toBeDefined();
        log.debug('profileNode1.id: ', profileNode1.id);
        log.debug('profileNode2.id: ', profileNode2.id);

        // generate a couple of profiles for voting
        const generateProfileParams = new GenerateProfileParams([
            false,
            false
        ]).toParamsArray();

        let profiles = await testUtilNode1.generateData(
            CreatableModel.PROFILE,
            1,
            true,
            generateProfileParams
        ) as resources.Profile[];
        voterProfileNode1 = profiles[0];

        profiles = await testUtilNode2.generateData(
            CreatableModel.PROFILE,
            1,
            true,
            generateProfileParams
        ) as resources.Profile[];
        voterProfileNode2 = profiles[0];

        marketNode1 = await testUtilNode1.getDefaultMarket();
        marketNode2 = await testUtilNode2.getDefaultMarket();
        expect(marketNode1.id).toBeDefined();
        expect(marketNode2.id).toBeDefined();
        log.debug('marketNode1: ', JSON.stringify(marketNode1, null, 2));
        log.debug('marketNode2: ', JSON.stringify(marketNode2, null, 2));

        // generate listingitemtemplate
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,               // generateItemInformation
            true,               // generateItemLocation
            true,               // generateShippingDestinations
            false,              // generateItemImages
            true,               // generatePaymentInformation
            true,               // generateEscrow
            true,               // generateItemPrice
            true,               // generateMessagingInformation
            false,              // generateListingItemObjects
            false,              // generateObjectDatas
            profileNode1.id,    // profileId
            false,              // generateListingItem
            marketNode1.id,     // marketId
            null                // categoryId
        ]).toParamsArray();
        const listingItemTemplates = await testUtilNode1.generateData(
            CreatableModel.LISTINGITEMTEMPLATE,     // what to generate
            1,                              // how many to generate
            true,                        // return model
            generateListingItemTemplateParams       // what kind of data to generate
        ) as resources.ListingItemTemplates[];
        listingItemTemplateNode1 = listingItemTemplates[0];
        expect(listingItemTemplateNode1.id).toBeDefined();
        expect(listingItemTemplateNode1.hash).toBeDefined();

        // we should be also able to get the same template
        const response: any = await testUtilNode1.rpc(templateCommand, [templateGetCommand, listingItemTemplateNode1.id]);
        response.expectJson();
        response.expectStatusCode(200);
        const result: resources.ListingItemTemplate = response.getBody()['result'];
        expect(result.hash).toBe(listingItemTemplateNode1.hash);

    });

    test('Should post ListingItemTemplate to the default marketplace', async () => {

        log.debug('========================================================================================');
        log.debug('Node1 POSTS MPA_LISTING_ADD');
        log.debug('========================================================================================');

        await testUtilNode1.waitFor(5);

        const response: any = await testUtilNode1.rpc(templateCommand, [
            templatePostCommand,
            listingItemTemplateNode1.id,
            DAYS_RETENTION,
            marketNode1.id
        ]);
        response.expectJson();
        response.expectStatusCode(200);

        // make sure we got the expected result from posting the template
        const result: any = response.getBody()['result'];
        sent = result.result === 'Sent.';
        if (!sent) {
            log.debug(JSON.stringify(result, null, 2));
        }
        expect(result.result).toEqual('Sent.');

        log.debug('==[ post ListingItemTemplate /// seller -> marketplace ]================================');
        log.debug('result.msgid: ' + result.msgid);
        log.debug('item.id: ' + listingItemTemplateNode1.id);
        log.debug('item.hash: ' + listingItemTemplateNode1.hash);
        log.debug('item.title: ' + listingItemTemplateNode1.ItemInformation.title);
        log.debug('item.desc: ' + listingItemTemplateNode1.ItemInformation.shortDescription);
        log.debug('item.category: [' + listingItemTemplateNode1.ItemInformation.ItemCategory.id + '] '
            + listingItemTemplateNode1.ItemInformation.ItemCategory.name);
        log.debug('========================================================================================');

    });

    test('Should have created ListingItem on node1', async () => {

        expect(sent).toBeTruthy();

        log.debug('========================================================================================');
        log.debug('Node1 RECEIVES MPA_LISTING_ADD');
        log.debug('========================================================================================');

        // wait for some time to make sure it's received
        await testUtilNode1.waitFor(10);

        const response: any = await testUtilNode1.rpcWaitFor(
            listingItemCommand,
            [listingItemGetCommand, listingItemTemplateNode1.hash],
            8 * 60,
            200,
            'hash',
            listingItemTemplateNode1.hash
        );
        response.expectJson();
        response.expectStatusCode(200);

        const result: resources.ListingItem = response.getBody()['result'];
        expect(result.hash).toBe(listingItemTemplateNode1.hash);
        expect(result.ListingItemTemplate.hash).toBe(listingItemTemplateNode1.hash);

        // store ListingItem for later tests
        listingItemNode1 = result;

        log.debug('==> Node1 received MPA_LISTING_ADD.');

    }, 600000); // timeout to 600s

    test('Should have received ListingItem on node2', async () => {

        expect(listingItemNode1).toBeDefined();

        log.debug('========================================================================================');
        log.debug('Node2 RECEIVES MPA_LISTING_ADD');
        log.debug('========================================================================================');

        await testUtilNode2.waitFor(5);

        const response: any = await testUtilNode2.rpcWaitFor(
            listingItemCommand,
            [listingItemGetCommand, listingItemTemplateNode1.hash],
            8 * 60,
            200,
            'hash',
            listingItemTemplateNode1.hash
        );
        response.expectJson();
        response.expectStatusCode(200);

        const result: resources.ListingItem = response.getBody()['result'];
        expect(result.hash).toBe(listingItemTemplateNode1.hash);

        // store ListingItem for later tests
        listingItemNode2 = result;

        log.debug('==> Node2 received MPA_LISTING_ADD.');

    }, 600000); // timeout to 600s

    test('Should report ListingItem from node2', async () => {

        expect(listingItemNode1).toBeDefined();
        expect(listingItemNode2).toBeDefined();

        log.debug('========================================================================================');
        log.debug('Node2 FLAGS LISTINGITEM / POSTS MPA_PROPOSAL_ADD');
        log.debug('========================================================================================');

        await testUtilNode2.waitFor(5);

        const response: any = await testUtilNode2.rpc(listingItemCommand, [
            listingItemFlagCommand,
            listingItemNode2.hash,
            profileNode2.id,
            'reason for reporting'
        ]);
        response.expectJson();
        response.expectStatusCode(200);

        const result: any = response.getBody()['result'];
        sent = result.result === 'Sent.';
        if (!sent) {
            log.debug(JSON.stringify(result, null, 2));
        }
        expect(result.result).toEqual('Sent.');
        log.debug('==> Node2 sent MPA_PROPOSAL_ADD.');
    });

    test('Should have created Proposal on node2', async () => {

        expect(sent).toBeTruthy();
        expect(listingItemNode1).toBeDefined();
        expect(listingItemNode2).toBeDefined();

        log.debug('========================================================================================');
        log.debug('Node2 RECEIVES MPA_PROPOSAL_ADD');
        log.debug('========================================================================================');

        await testUtilNode2.waitFor(5);

        const response = await testUtilNode2.rpcWaitFor(proposalCommand,
            [proposalListCommand, '*', '*', 'ITEM_VOTE'],
            30 * 60,            // maxSeconds
            200,            // waitForStatusCode
            '[0].item',  // property name
            listingItemTemplateNode1.hash,  // value
            '='
        );
        response.expectJson();
        response.expectStatusCode(200);

        const result: resources.Proposal = response.getBody()['result'][0];
        log.debug('result: ', JSON.stringify(result, null, 2));
        expect(result.title).toBe(listingItemNode2.hash);

        // store Proposal for later tests
        proposalNode2 = result;

    }, 600000); // timeout to 600s

    test('Should have received Proposal on node1', async () => {

        expect(sent).toBeTruthy();
        expect(listingItemNode1).toBeDefined();
        expect(listingItemNode2).toBeDefined();

        log.debug('========================================================================================');
        log.debug('Node1 RECEIVES MPA_PROPOSAL_ADD');
        log.debug('========================================================================================');

        await testUtilNode1.waitFor(5);

        let res = await testUtilNode1.rpcWaitFor(proposalCommand,
            [proposalGetCommand, proposalNode2.hash],
            30 * 60,        // maxSeconds
            200,       // waitForStatusCode
            'hash', // property name
            proposalNode2.hash         // value
        );
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Proposal = res.getBody()['result'];
        log.debug('proposal:', JSON.stringify(result, null, 2));

        expect(result.title).toBe(listingItemNode1.hash);
        expect(result.description).toBe('reason for reporting');

        // ListingItem should have a relation to FlaggedItem with a relation to previously received Proposal
        res = await testUtilNode1.rpc(listingItemCommand, [listingItemGetCommand, listingItemNode1.hash]);
        res.expectJson();
        res.expectStatusCode(200);
        const listingItem: resources.ListingItem = res.getBody()['result'];
        // log.debug('listingItem:', JSON.stringify(listingItem, null, 2));

        expect(listingItem.FlaggedItem.Proposal.id).toBe(result.id);

        // store proposalNode1 for later tests
        proposalNode1 = result;

        log.debug('==> Node1 received MPA_PROPOSAL_ADD.');

    }, 600000); // timeout to 600s

    test('Should have received Proposal on node2', async () => {

        expect(listingItemNode1).toBeDefined();
        expect(listingItemNode2).toBeDefined();
        expect(proposalNode1).toBeDefined();

        log.debug('========================================================================================');
        log.debug('Node2 RECEIVES MPA_PROPOSAL_ADD');
        log.debug('========================================================================================');

        await testUtilNode2.waitFor(5);

        let res = await testUtilNode2.rpcWaitFor(proposalCommand,
            [proposalGetCommand, proposalNode1.hash],
            30 * 60,             // maxSeconds
            200,            // waitForStatusCode
            'hash',      // property name
            proposalNode1.hash              // value
        );
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Proposal = res.getBody()['result'];
        expect(result.title).toBe(proposalNode1.title);
        expect(result.description).toBe(proposalNode1.description);
        expect(result.ProposalOptions[0].description).toBe(proposalNode1.ProposalOptions[0].description);
        expect(result.ProposalOptions[1].description).toBe(proposalNode1.ProposalOptions[1].description);

        log.debug('proposal:', JSON.stringify(result, null, 2));

        // Proposal should have a minimum of two ProposalResults
        expect(result.ProposalResults.length).toBeGreaterThanOrEqual(2);
        expect(result.ProposalResults[1].ProposalOptionResults.length).toBe(2);
        expect(result.ProposalResults[1].ProposalOptionResults[0].weight).toBe(0);
        expect(result.ProposalResults[1].ProposalOptionResults[0].voters).toBe(0);
        expect(result.ProposalResults[1].ProposalOptionResults[1].ProposalOption.description).toBe(ItemVote.REMOVE);
        expect(result.ProposalResults[1].ProposalOptionResults[1].weight).toBeGreaterThan(0);
        expect(result.ProposalResults[1].ProposalOptionResults[1].voters).toBeGreaterThan(0);

        // ListingItem should have a relation to FlaggedItem with a relation to previously received Proposal
        res = await testUtilNode2.rpc(listingItemCommand, [listingItemGetCommand, listingItemNode2.hash]);
        res.expectJson();
        res.expectStatusCode(200);
        const listingItem: resources.ListingItem = res.getBody()['result'];
        // log.debug('listingItem:', JSON.stringify(listingItem, null, 2));

        expect(listingItem.FlaggedItem.Proposal.id).toBe(result.id);

        // store Proposal for later tests
        proposalNode2 = result;

        log.debug('==> Node2 received MPA_PROPOSAL_ADD.');

    }, 600000); // timeout to 600s

    test('Should post Vote from node1', async () => {

        expect(listingItemNode1).toBeDefined();
        expect(listingItemNode2).toBeDefined();
        expect(proposalNode1).toBeDefined();
        expect(proposalNode2).toBeDefined();

        log.debug('========================================================================================');
        log.debug('Node1 POSTS MPA_VOTE (ItemVote.KEEP)');
        log.debug('========================================================================================');

        const response: any = await testUtilNode1.rpc(voteCommand, [
            votePostCommand,
            voterProfileNode1.id,
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

        expect(listingItemNode1).toBeDefined();
        expect(listingItemNode2).toBeDefined();
        expect(proposalNode1).toBeDefined();
        expect(proposalNode2).toBeDefined();

        log.debug('========================================================================================');
        log.debug('Node1 RECEIVES MPA_VOTE (confirm with: vote get)');
        log.debug('========================================================================================');

        await testUtilNode1.waitFor(3);

        const response: any = await testUtilNode1.rpcWaitFor(
            voteCommand,
            [voteGetCommand, voterProfileNode1.id, proposalNode1.hash],
            8 * 60,
            200,
            'ProposalOption.optionId',
            proposalNode1.ProposalOptions[0].optionId
        );
        response.expectJson();
        response.expectStatusCode(200);

        const result: resources.Vote = response.getBody()['result'];
        expect(result.postedAt).toBeGreaterThan(testTimeStamp);
        expect(result.receivedAt).toBeGreaterThan(testTimeStamp);
        expect(result.expiredAt).toBeGreaterThan(testTimeStamp);
        expect(result.weight).toBeGreaterThan(0);
        expect(result.ProposalOption.optionId).toBe(proposalNode1.ProposalOptions[0].optionId);

        voteNode1 = result;

    });

    test('Should have created ProposalResults after receiving Vote1 on node1', async () => {

        expect(sent).toBeTruthy();

        expect(listingItemNode1).toBeDefined();
        expect(listingItemNode2).toBeDefined();
        expect(proposalNode1).toBeDefined();
        expect(proposalNode2).toBeDefined();
        expect(voteNode1).toBeDefined();

        log.debug('========================================================================================');
        log.debug('Node1 ProposalResults recalculated');
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
        expect(result.ProposalOptionResults[0].voters).toBe(vote1AddressCount);
        expect(result.ProposalOptionResults[0].weight).toBe(voteNode1.weight);
        expect(result.ProposalOptionResults[1].voters).toBeGreaterThan(0);
        expect(result.ProposalOptionResults[1].weight).toBeGreaterThan(0);

        proposalResultNode1 = result;

    });

    test('Should have created ProposalResults after receiving Vote1 on node2', async () => {

        expect(listingItemNode1).toBeDefined();
        expect(listingItemNode2).toBeDefined();
        expect(proposalNode1).toBeDefined();
        expect(proposalNode2).toBeDefined();
        expect(voteNode1).toBeDefined();
        expect(proposalResultNode1).toBeDefined();

        log.debug('========================================================================================');
        log.debug('Node2 RECEIVES MPA_VOTE (confirm with: proposal result)');
        log.debug('========================================================================================');

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

        const result: any = response.getBody()['result'];
        expect(result.ProposalOptionResults[0].voters).toBe(vote1AddressCount);
        expect(result.ProposalOptionResults[0].weight).toBe(voteNode1.weight);
        expect(result.ProposalOptionResults[1].voters).toBeGreaterThan(0);
        expect(result.ProposalOptionResults[1].weight).toBeGreaterThan(0);
    });

    test('Should post Vote2 from node2 (voter2)', async () => {

        expect(listingItemNode1).toBeDefined();
        expect(listingItemNode2).toBeDefined();
        expect(proposalNode1).toBeDefined();
        expect(proposalNode2).toBeDefined();
        expect(voteNode1).toBeDefined();
        expect(proposalResultNode1).toBeDefined();

        log.debug('========================================================================================');
        log.debug('Node2 POSTS MPA_VOTE (default profile)');
        log.debug('========================================================================================');

        const response: any = await testUtilNode2.rpc(voteCommand, [
            votePostCommand,
            voterProfileNode2.id,
            proposalNode2.hash,
            proposalNode2.ProposalOptions[1].optionId
        ]);
        response.expectJson();
        response.expectStatusCode(200);

        const result: any = response.getBody()['result'];
        vote2AddressCount = result.msgids.length;
        expect(vote2AddressCount).toBeGreaterThan(0);

        sent = result.result === 'Sent.';
        if (!sent) {
            log.debug(JSON.stringify(result, null, 2));
        }
        expect(result.result).toEqual('Sent.');

        // update testTimeStamp
        testTimeStamp = new Date().getTime();
    });

    test('Should have updated Vote2 on node2', async () => {

        expect(listingItemNode1).toBeDefined();
        expect(listingItemNode2).toBeDefined();
        expect(proposalNode1).toBeDefined();
        expect(proposalNode2).toBeDefined();
        expect(voteNode1).toBeDefined();
        expect(proposalResultNode1).toBeDefined();

        log.debug('========================================================================================');
        log.debug('Node2 RECEIVES MPA_VOTE (confirm with: vote get)');
        log.debug('========================================================================================');

        await testUtilNode2.waitFor(3);

        const response: any = await testUtilNode2.rpcWaitFor(
            voteCommand,
            [voteGetCommand, voterProfileNode2.id, proposalNode2.hash],
            8 * 60,
            200,
            'ProposalOption.optionId',
            proposalNode1.ProposalOptions[1].optionId
        );
        response.expectJson();
        response.expectStatusCode(200);

        const result: resources.Vote = response.getBody()['result'];
        expect(result.postedAt).toBeGreaterThan(testTimeStamp);
        expect(result.receivedAt).toBeGreaterThan(testTimeStamp);
        expect(result.expiredAt).toBeGreaterThan(testTimeStamp);
        expect(result.weight).toBeGreaterThan(0);
        expect(result.ProposalOption.optionId).toBe(proposalNode1.ProposalOptions[1].optionId);

        voteNode2 = result;
    });

    test('Should receive Vote2 on node1', async () => {

        expect(listingItemNode1).toBeDefined();
        expect(listingItemNode2).toBeDefined();
        expect(proposalNode1).toBeDefined();
        expect(proposalNode2).toBeDefined();
        expect(voteNode1).toBeDefined();
        expect(voteNode2).toBeDefined();
        expect(proposalResultNode1).toBeDefined();

        log.debug('========================================================================================');
        log.debug('Node1 RECEIVES MPA_VOTE (confirm with: proposal result)');
        log.debug('========================================================================================');

        const response: any = await testUtilNode1.rpcWaitFor(
            proposalCommand,
            [proposalResultCommand, proposalNode1.hash],
            8 * 60,
            200,
            'ProposalOptionResults[1].voters',
            vote2AddressCount,
            '='

        );
        response.expectJson();
        response.expectStatusCode(200);

        const result: any = response.getBody()['result'];
        expect(result).hasOwnProperty('Proposal');
        expect(result).hasOwnProperty('ProposalOptionResults');
        expect(result.ProposalOptionResults[0].voters).toBe(vote1AddressCount);
        expect(result.ProposalOptionResults[0].weight).toBe(voteNode1.weight);
        expect(result.ProposalOptionResults[1].voters).toBe(vote2AddressCount);
        expect(result.ProposalOptionResults[1].weight).toBe(voteNode2.weight);
    });


    test('Should post Vote2 again from node2 changing the vote optionId', async () => {

        expect(listingItemNode1).toBeDefined();
        expect(listingItemNode2).toBeDefined();
        expect(proposalNode1).toBeDefined();
        expect(proposalNode2).toBeDefined();
        expect(voteNode1).toBeDefined();
        expect(voteNode2).toBeDefined();
        expect(proposalResultNode1).toBeDefined();

        log.debug('========================================================================================');
        log.debug('Node2 POSTS MPA_VOTE (voter2)');
        log.debug('========================================================================================');

        const response: any = await testUtilNode2.rpc(voteCommand, [
            votePostCommand,
            voterProfileNode2.id,
            proposalNode2.hash,
            proposalNode2.ProposalOptions[0].optionId
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

    test('Receive Vote2 on node2 again', async () => {

        expect(sent).toBeTruthy();

        expect(listingItemNode1).toBeDefined();
        expect(listingItemNode2).toBeDefined();
        expect(proposalNode1).toBeDefined();
        expect(proposalNode2).toBeDefined();
        expect(voteNode1).toBeDefined();
        expect(voteNode2).toBeDefined();
        expect(proposalResultNode1).toBeDefined();

        log.debug('========================================================================================');
        log.debug('Node2 RECEIVES MPA_VOTE (confirm with: proposal result)');
        log.debug('========================================================================================');

        // lets wait for some time to receive the vote otherwise rpcWaitFor will return the previous result
        await testUtilNode2.waitFor(5);

        const response: any = await testUtilNode2.rpcWaitFor(
            proposalCommand,
            [proposalResultCommand, proposalNode2.hash],
            8 * 60,
            200,
            'ProposalOptionResults[0].voters',
            vote1AddressCount + vote2AddressCount,
            '='
        );
        response.expectJson();
        response.expectStatusCode(200);

        const result: any = response.getBody()['result'];
        expect(result.ProposalOptionResults[0].voters).toBe(vote1AddressCount + vote2AddressCount);
        expect(result.ProposalOptionResults[0].weight).toBe(voteNode1.weight + voteNode2.weight);
        expect(result.ProposalOptionResults[1].voters).toBe(0);
        expect(result.ProposalOptionResults[1].weight).toBe(0);
    });

});
