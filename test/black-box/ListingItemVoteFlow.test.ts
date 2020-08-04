// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { Logger as LoggerType } from '../../src/core/Logger';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Commands } from '../../src/api/commands/CommandEnumType';
import { GenerateListingItemTemplateParams } from '../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { ItemVote } from '../../src/api/enums/ItemVote';
import { SmsgSendResponse } from '../../src/api/responses/SmsgSendResponse';
import { SearchOrder } from '../../src/api/enums/SearchOrder';
import { ListingItemSearchOrderField } from '../../src/api/enums/SearchOrderField';
import { ProposalCategory } from '../../src/api/enums/ProposalCategory';
import { CombinedVote } from '../../src/api/services/action/VoteActionService';

describe('Happy ListingItem Vote Flow', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtilSellerNode = new BlackBoxTestUtil(randomBoolean ? 0 : 1);
    const testUtilBuyerNode = new BlackBoxTestUtil(randomBoolean ? 1 : 0);

    const proposalCommand = Commands.PROPOSAL_ROOT.commandName;
    const proposalListCommand = Commands.PROPOSAL_LIST.commandName;
    const proposalGetCommand = Commands.PROPOSAL_GET.commandName;
    const proposalResultCommand = Commands.PROPOSAL_RESULT.commandName;
    const voteCommand = Commands.VOTE_ROOT.commandName;
    const votePostCommand = Commands.VOTE_POST.commandName;
    const voteGetCommand = Commands.VOTE_GET.commandName;
    const templateCommand = Commands.TEMPLATE_ROOT.commandName;
    const templatePostCommand = Commands.TEMPLATE_POST.commandName;
    const templateGetCommand = Commands.TEMPLATE_GET.commandName;
    const listingItemCommand = Commands.ITEM_ROOT.commandName;
    const listingItemGetCommand = Commands.ITEM_GET.commandName;
    const listingItemFlagCommand = Commands.ITEM_FLAG.commandName;
    const listingItemSearchCommand = Commands.ITEM_SEARCH.commandName;

    let sellerProfile: resources.Profile;
    let buyerProfile: resources.Profile;
    let sellerMarket: resources.Market;
    let buyerMarket: resources.Market;

    let listingItemTemplateOnSellerNode: resources.ListingItemTemplate;
    let listingItemReceivedOnSellerNode: resources.ListingItem;
    let listingItemReceivedOnBuyerNode: resources.ListingItem;

    let proposalReceivedOnSellerNode: resources.Proposal;
    let proposalReceivedOnBuyerNode: resources.Proposal;
    let sellerCombinedVote: CombinedVote;
    let buyerCombinedVote: CombinedVote;

    let proposalResultOnSellerNode: resources.ProposalResult;

    let testTimeStamp = new Date().getTime();

    const PAGE = 0;
    const PAGE_LIMIT = 10;
    const SEARCHORDER = SearchOrder.ASC;
    const LISTINGITEM_SEARCHORDERFIELD = ListingItemSearchOrderField.CREATED_AT;
    const DAYS_RETENTION = 2;

    let sent = false;

    let timeOfFlagging = 0;
    let sellerVoteAddressCount;
    let vote2AddressCount;

    beforeAll(async () => {

        await testUtilSellerNode.cleanDb();
        await testUtilBuyerNode.cleanDb();

        sellerProfile = await testUtilSellerNode.getDefaultProfile();
        buyerProfile = await testUtilBuyerNode.getDefaultProfile();
        expect(sellerProfile.id).toBeDefined();
        expect(buyerProfile.id).toBeDefined();
        log.debug('sellerProfile.id: ', sellerProfile.id);
        log.debug('buyerProfile.id: ', buyerProfile.id);

        sellerMarket = await testUtilSellerNode.getDefaultMarket(sellerProfile.id);
        buyerMarket = await testUtilBuyerNode.getDefaultMarket(buyerProfile.id);
        expect(sellerMarket.id).toBeDefined();
        expect(buyerMarket.id).toBeDefined();
        log.debug('sellerMarket: ', JSON.stringify(sellerMarket, null, 2));
        log.debug('buyerMarket: ', JSON.stringify(buyerMarket, null, 2));

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
            sellerProfile.id,   // profileId
            false,              // generateListingItem
            sellerMarket.id,    // marketId
            null                // categoryId
        ]).toParamsArray();

        const listingItemTemplates = await testUtilSellerNode.generateData(
            CreatableModel.LISTINGITEMTEMPLATE,     // what to generate
            1,                              // how many to generate
            true,                        // return model
            generateListingItemTemplateParams       // what kind of data to generate
        ) as resources.ListingItemTemplates[];

        listingItemTemplateOnSellerNode = listingItemTemplates[0];
        expect(listingItemTemplateOnSellerNode.id).toBeDefined();

    });


    test('Should unlock the possibly locked outputs left from other tests', async () => {
        await testUtilSellerNode.unlockLockedOutputs(sellerMarket.Identity.wallet);
        await testUtilBuyerNode.unlockLockedOutputs(buyerMarket.Identity.wallet);
    }, 600000); // timeout to 600s


    test('===> MPA_LISTING_ADD <==================================================================', async () => {
        expect(true).toBe(true);
    }, 600000); // timeout to 600s


    test('Should post MPA_LISTING_ADD from SELLER node', async () => {

        log.debug('========================================================================================');
        log.debug('SELLER POSTS MPA_LISTING_ADD');
        log.debug('========================================================================================');

        await testUtilSellerNode.waitFor(5);
        expect(listingItemTemplateOnSellerNode.id).toBeDefined();

        const res = await testUtilSellerNode.rpc(templateCommand, [templatePostCommand,
            listingItemTemplateOnSellerNode.id,
            DAYS_RETENTION
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        // make sure we got the expected result from posting the template
        const result: any = res.getBody()['result'];
        sent = result.result === 'Sent.';
        if (!sent) {
            log.debug(JSON.stringify(result, null, 2));
        }
        expect(result.result).toBe('Sent.');
        expect(result.txid).toBeDefined();
        expect(result.fee).toBeGreaterThan(0);

        log.debug('==[ posted ListingItemTemplate /// seller -> market ]================================');
        log.debug('result.msgid: ' + result.msgid);
        log.debug('item.id: ' + listingItemTemplateOnSellerNode.id);
        log.debug('item.hash: ' + listingItemTemplateOnSellerNode.hash);
        log.debug('item.title: ' + listingItemTemplateOnSellerNode.ItemInformation.title);
        log.debug('item.desc: ' + listingItemTemplateOnSellerNode.ItemInformation.shortDescription);
        log.debug('item.category: [' + listingItemTemplateOnSellerNode.ItemInformation.ItemCategory.id + '] '
            + listingItemTemplateOnSellerNode.ItemInformation.ItemCategory.name);
        log.debug('========================================================================================');
    });


    test('Should have updated ListingItemTemplate hash on SELLER node', async () => {
        // sending should have succeeded for this test to work
        expect(sent).toBeTruthy();

        const res: any = await testUtilSellerNode.rpc(templateCommand, [templateGetCommand,
            listingItemTemplateOnSellerNode.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        listingItemTemplateOnSellerNode = res.getBody()['result'];
        expect(listingItemTemplateOnSellerNode.hash).toBeDefined();
    });


    test('Should have received MPA_LISTING_ADD on BUYER node', async () => {

        // sending should have succeeded for this test to work
        expect(sent).toBeTruthy();

        log.debug('========================================================================================');
        log.debug('BUYER RECEIVES MPA_LISTING_ADD');
        log.debug('========================================================================================');

        const response: any = await testUtilBuyerNode.rpcWaitFor(listingItemCommand, [listingItemSearchCommand,
                PAGE, PAGE_LIMIT, SEARCHORDER, LISTINGITEM_SEARCHORDERFIELD,
                buyerMarket.receiveAddress,
                [],
                '*',
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                listingItemTemplateOnSellerNode.hash
            ],
            15 * 60,
            200,
            '[0].hash',
            listingItemTemplateOnSellerNode.hash
        );
        response.expectJson();
        response.expectStatusCode(200);

        const results: resources.ListingItem[] = response.getBody()['result'];
        expect(results.length).toBe(1);
        expect(results[0].hash).toBe(listingItemTemplateOnSellerNode.hash);

        // store ListingItem for later tests
        listingItemReceivedOnBuyerNode = results[0];

        log.debug('==> BUYER received MPA_LISTING_ADD.');

    }, 600000); // timeout to 600s


    test('Should have received MPA_LISTING_ADD on SELLER node', async () => {

        expect(sent).toBeTruthy();
        expect(listingItemReceivedOnBuyerNode).toBeDefined();

        log.debug('========================================================================================');
        log.debug('SELLER RECEIVES MPA_LISTING_ADD');
        log.debug('========================================================================================');

        const response: any = await testUtilSellerNode.rpcWaitFor(
            listingItemCommand,
            [listingItemSearchCommand,
                PAGE, PAGE_LIMIT, SEARCHORDER, LISTINGITEM_SEARCHORDERFIELD,
                buyerMarket.receiveAddress,
                [],
                '*',
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                listingItemTemplateOnSellerNode.hash
            ],
            15 * 60,
            200,
            '[0].hash',
            listingItemTemplateOnSellerNode.hash
        );

        const results: resources.ListingItem[] = response.getBody()['result'];
        expect(results.length).toBe(1);
        expect(results[0].hash).toBe(listingItemTemplateOnSellerNode.hash);

        // store ListingItem for later tests
        listingItemReceivedOnSellerNode = results[0];

        log.debug('==> SELLER received MPA_LISTING_ADD.');

    }, 600000); // timeout to 600s


    test('===> MPA_PROPOSAL_ADD <=================================================================', async () => {
        expect(true).toBe(true);
    }, 600000); // timeout to 600s


    test('Should post MPA_PROPOSAL_ADD from BUYER node', async () => {

        expect(listingItemReceivedOnSellerNode).toBeDefined();
        expect(listingItemReceivedOnBuyerNode).toBeDefined();

        log.debug('========================================================================================');
        log.debug('BUYER FLAGS LISTINGITEM / POSTS MPA_PROPOSAL_ADD');
        log.debug('========================================================================================');

        timeOfFlagging = Date.now();
        await testUtilBuyerNode.waitFor(2);

        const response: any = await testUtilBuyerNode.rpc(listingItemCommand, [listingItemFlagCommand,
            listingItemReceivedOnBuyerNode.id,
            buyerMarket.Identity.id,
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
        log.debug('==> BUYER sent MPA_PROPOSAL_ADD.');
    });


    test('Should have created Proposal on BUYER node', async () => {

        expect(sent).toBeTruthy();
        expect(listingItemReceivedOnSellerNode).toBeDefined();
        expect(listingItemReceivedOnBuyerNode).toBeDefined();

        log.debug('========================================================================================');
        log.debug('BUYER RECEIVES MPA_PROPOSAL_ADD');
        log.debug('========================================================================================');

        await testUtilBuyerNode.waitFor(2);

        const response = await testUtilBuyerNode.rpcWaitFor(proposalCommand, [proposalListCommand,
                timeOfFlagging,
                '*',
                ProposalCategory.ITEM_VOTE
            ],
            30 * 60,                    // maxSeconds
            200,                    // waitForStatusCode
            '[0].target',        // property name
            listingItemTemplateOnSellerNode.hash,   // value
            '='
        );
        response.expectJson();
        response.expectStatusCode(200);

        const result: resources.Proposal = response.getBody()['result'][0];
        // log.debug('result: ', JSON.stringify(result, null, 2));
        expect(result.target).toBe(listingItemReceivedOnBuyerNode.hash);
        expect(result.ProposalOptions.length).toBe(2);

        // Proposal should have a minimum of two ProposalResults
        expect(result.ProposalResults.length).toBeGreaterThanOrEqual(1);
        expect(result.FlaggedItem.ListingItem.id).toBe(listingItemReceivedOnBuyerNode.id);

        proposalReceivedOnBuyerNode = result;

    }, 600000); // timeout to 600s

/*
    test('Should have flagged ListingItem on BUYER node', async () => {

        expect(listingItemReceivedOnSellerNode).toBeDefined();
        expect(listingItemReceivedOnBuyerNode).toBeDefined();
        expect(proposalReceivedOnBuyerNode.FlaggedItem.ListingItem).toBeDefined();

        await testUtilBuyerNode.waitFor(2);

        // ListingItem should have a relation to FlaggedItem with a relation to previously received Proposal
        const res = await testUtilBuyerNode.rpc(listingItemCommand, [listingItemGetCommand,
            listingItemReceivedOnBuyerNode.id,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.ListingItem = res.getBody()['result'];
        expect(result.FlaggedItem.Proposal.id).toBe(proposalReceivedOnBuyerNode.id);

        listingItemReceivedOnBuyerNode = result;

        log.debug('==> ListingItem flagged on BUYER node.');

    }, 600000); // timeout to 600s


    test('Should have received Proposal on SELLER node', async () => {

        expect(sent).toBeTruthy();
        expect(listingItemReceivedOnSellerNode).toBeDefined();
        expect(listingItemReceivedOnBuyerNode.FlaggedItem.Proposal).toBeDefined();
        expect(proposalReceivedOnBuyerNode.FlaggedItem.ListingItem).toBeDefined();

        log.debug('========================================================================================');
        log.debug('SELLER RECEIVES MPA_PROPOSAL_ADD');
        log.debug('========================================================================================');

        await testUtilSellerNode.waitFor(5);

        const res = await testUtilSellerNode.rpcWaitFor(proposalCommand, [proposalGetCommand,
                proposalReceivedOnBuyerNode.hash
            ],
            30 * 60,                // maxSeconds
            200,               // waitForStatusCode
            'hash',         // property name
            proposalReceivedOnBuyerNode.hash    // value
        );
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Proposal = res.getBody()['result'];
        // log.debug('proposal:', JSON.stringify(result, null, 2));
        expect(result.target).toBe(listingItemReceivedOnSellerNode.hash);
        expect(result.description).toBe('reason for reporting');
        expect(result.FlaggedItem.ListingItem.id).toBe(listingItemReceivedOnSellerNode.id);
        expect(result.ProposalOptions.length).toBe(2);

        // Proposal should have a minimum of two ProposalResults
        expect(result.ProposalResults.length).toBeGreaterThanOrEqual(1);

        proposalReceivedOnSellerNode = result;

        log.debug('==> SELLER received MPA_PROPOSAL_ADD.');

    }, 600000); // timeout to 600s


    test('Should have flagged ListingItem on SELLER node', async () => {

        expect(listingItemReceivedOnSellerNode).toBeDefined();
        expect(listingItemReceivedOnBuyerNode.FlaggedItem.Proposal).toBeDefined();
        expect(proposalReceivedOnBuyerNode.FlaggedItem.ListingItem).toBeDefined();
        expect(proposalReceivedOnSellerNode.FlaggedItem.ListingItem).toBeDefined();

        await testUtilBuyerNode.waitFor(2);

        // ListingItem should have a relation to FlaggedItem with a relation to previously received Proposal
        const res = await testUtilSellerNode.rpc(listingItemCommand, [listingItemGetCommand,
            listingItemReceivedOnSellerNode.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.ListingItem = res.getBody()['result'];
        expect(result.FlaggedItem.Proposal.id).toBe(proposalReceivedOnSellerNode.id);

        listingItemReceivedOnSellerNode = result;

        log.debug('==> SELLER flagged ListingItem.');

    }, 600000); // timeout to 600s


    test('===> MPA_VOTE <=========================================================================', async () => {
        expect(true).toBe(true);
    }, 600000); // timeout to 600s


    test('Should post MPA_VOTE from SELLER node', async () => {

        expect(listingItemReceivedOnSellerNode.FlaggedItem.Proposal).toBeDefined();
        expect(listingItemReceivedOnBuyerNode.FlaggedItem.Proposal).toBeDefined();
        expect(proposalReceivedOnBuyerNode.FlaggedItem.ListingItem).toBeDefined();
        expect(proposalReceivedOnSellerNode.FlaggedItem.ListingItem).toBeDefined();

        // vote to KEEP
        expect(proposalReceivedOnSellerNode.ProposalOptions[0].description).toBe(ItemVote.KEEP);

        log.debug('========================================================================================');
        log.debug('SELLER POSTS MPA_VOTE (ItemVote.KEEP)');
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


    test('Should have created MPA_VOTE on SELLER node', async () => {

        expect(sent).toBeTruthy();
        expect(sellerVoteAddressCount).toBeGreaterThan(0);

        expect(listingItemReceivedOnSellerNode.FlaggedItem.Proposal).toBeDefined();
        expect(listingItemReceivedOnBuyerNode.FlaggedItem.Proposal).toBeDefined();
        expect(proposalReceivedOnBuyerNode.FlaggedItem.ListingItem).toBeDefined();
        expect(proposalReceivedOnSellerNode.FlaggedItem.ListingItem).toBeDefined();

        log.debug('========================================================================================');
        log.debug('SELLER CREATED MPA_VOTE (confirm with: vote get)');
        log.debug('========================================================================================');

        await testUtilSellerNode.waitFor(3);

        const response: any = await testUtilSellerNode.rpcWaitFor(voteCommand, [voteGetCommand,
                sellerMarket.id,
                proposalReceivedOnSellerNode.hash,
            ],
            8 * 60,
            200,
            'votedProposalOption.optionId',
            proposalReceivedOnSellerNode.ProposalOptions[0].optionId
        );
        response.expectJson();
        response.expectStatusCode(200);

        const result: CombinedVote = response.getBody()['result'];
        expect(result.postedAt).toBeGreaterThan(testTimeStamp);
        expect(result.receivedAt).toBeGreaterThan(testTimeStamp);
        expect(result.expiredAt).toBeGreaterThan(testTimeStamp);
        expect(result.weight).toBeGreaterThan(0);
        expect(result.votedProposalOption.optionId).toBe(proposalReceivedOnSellerNode.ProposalOptions[0].optionId);
        expect(result.votedProposalOption.description).toBe(ItemVote.KEEP.toString());

        sellerCombinedVote = result;

        log.debug('sellerCombinedVote: ', JSON.stringify(sellerCombinedVote,  null, 2));
    });


    test('Should have calculated ProposalResults on SELLER node', async () => {

        expect(sent).toBeTruthy();
        expect(sellerVoteAddressCount).toBeGreaterThan(0);

        expect(listingItemReceivedOnSellerNode.FlaggedItem.Proposal).toBeDefined();
        expect(listingItemReceivedOnBuyerNode.FlaggedItem.Proposal).toBeDefined();
        expect(proposalReceivedOnBuyerNode.FlaggedItem.ListingItem).toBeDefined();
        expect(proposalReceivedOnSellerNode.FlaggedItem.ListingItem).toBeDefined();
        expect(sellerCombinedVote).toBeDefined();

        await testUtilSellerNode.waitFor(2);

        log.debug('========================================================================================');
        log.debug('SELLER ProposalResults recalculated');
        log.debug('========================================================================================');
        log.debug('sellerVoteAddressCount: ', sellerVoteAddressCount);

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

        log.debug('result.ProposalOptionResults ', JSON.stringify(result.ProposalOptionResults, null, 2));

        log.debug('sellerVoteAddressCount: ', sellerVoteAddressCount);
        log.debug('result.ProposalOptionResults[0].voters: ', result.ProposalOptionResults[0].voters);
        log.debug('sellerCombinedVote.weight: ', sellerCombinedVote.weight);
        log.debug('result.ProposalOptionResults[0].weight: ', result.ProposalOptionResults[0].weight);

        expect(result.ProposalOptionResults[0].voters).toBe(sellerVoteAddressCount);
        expect(result.ProposalOptionResults[0].weight).toBeGreaterThan(0);
        expect(result.ProposalOptionResults[1].voters).toBe(0);
        expect(result.ProposalOptionResults[1].weight).toBe(0);

        proposalResultOnSellerNode = result;

        log.debug('proposalResultOnSellerNode: ', JSON.stringify(proposalResultOnSellerNode,  null, 2));

    }, 600000); // timeout to 600s
/*
    test('Should have created ProposalResults after receiving Vote1 on node2', async () => {

        expect(listingItemReceivedOnSellerNode).toBeDefined();
        expect(listingItemReceivedOnBuyerNode).toBeDefined();
        expect(proposalReceivedOnSellerNode).toBeDefined();
        expect(proposalReceivedOnBuyerNode).toBeDefined();
        expect(sellerCombinedVote).toBeDefined();
        expect(proposalResultOnSellerNode).toBeDefined();

        await testUtilSellerNode.waitFor(10);

        log.debug('========================================================================================');
        log.debug('Node2 RECEIVES MPA_VOTE (confirm with: proposal result)');
        log.debug('========================================================================================');

        const response: any = await testUtilBuyerNode.rpcWaitFor(
            proposalCommand,
            [proposalResultCommand, proposalReceivedOnBuyerNode.hash],
            8 * 60,
            200,
            'ProposalOptionResults[0].voters',
            sellerVoteAddressCount,
            '='
        );
        response.expectJson();
        response.expectStatusCode(200);

        const result: resources.ProposalResult = response.getBody()['result'];

        log.debug('sellerVoteAddressCount: ', sellerVoteAddressCount);
        log.debug('result.ProposalOptionResults[0].voters: ', result.ProposalOptionResults[0].voters);
        log.debug('sellerCombinedVote.weight: ', sellerCombinedVote.weight);
        log.debug('result.ProposalOptionResults[0].weight: ', result.ProposalOptionResults[0].weight);

        expect(result.ProposalOptionResults[0].voters).toBe(sellerVoteAddressCount);
        expect(result.ProposalOptionResults[0].weight).toBe(sellerCombinedVote.weight);
        expect(result.ProposalOptionResults[1].voters).toBe(0);
        expect(result.ProposalOptionResults[1].weight).toBe(0);
    }, 600000); // timeout to 600s

    test('Should post Vote2 from node2 (voter2)', async () => {

        expect(listingItemReceivedOnSellerNode).toBeDefined();
        expect(listingItemReceivedOnBuyerNode).toBeDefined();
        expect(proposalReceivedOnSellerNode).toBeDefined();
        expect(proposalReceivedOnBuyerNode).toBeDefined();
        expect(sellerCombinedVote).toBeDefined();
        expect(proposalResultOnSellerNode).toBeDefined();

        log.debug('========================================================================================');
        log.debug('Node2 POSTS MPA_VOTE (default profile)');
        log.debug('========================================================================================');

        const response: any = await testUtilBuyerNode.rpc(voteCommand, [
            votePostCommand,
            voterProfileNode2.id,
            proposalReceivedOnBuyerNode.hash,
            proposalReceivedOnBuyerNode.ProposalOptions[1].optionId
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

        expect(listingItemReceivedOnSellerNode).toBeDefined();
        expect(listingItemReceivedOnBuyerNode).toBeDefined();
        expect(proposalReceivedOnSellerNode).toBeDefined();
        expect(proposalReceivedOnBuyerNode).toBeDefined();
        expect(sellerCombinedVote).toBeDefined();
        expect(proposalResultOnSellerNode).toBeDefined();

        log.debug('========================================================================================');
        log.debug('Node2 RECEIVES MPA_VOTE (confirm with: vote get)');
        log.debug('========================================================================================');

        await testUtilBuyerNode.waitFor(5);

        const response: any = await testUtilBuyerNode.rpcWaitFor(
            voteCommand,
            [voteGetCommand, voterProfileNode2.id, proposalReceivedOnBuyerNode.hash],
            8 * 60,
            200,
            'ProposalOption.optionId',
            proposalReceivedOnSellerNode.ProposalOptions[1].optionId
        );
        response.expectJson();
        response.expectStatusCode(200);

        const result: resources.Vote = response.getBody()['result'];
        expect(result.postedAt).toBeGreaterThan(testTimeStamp);
        expect(result.receivedAt).toBeGreaterThan(testTimeStamp);
        expect(result.expiredAt).toBeGreaterThan(testTimeStamp);
        expect(result.weight).toBeGreaterThan(0);
        expect(result.ProposalOption.optionId).toBe(proposalReceivedOnSellerNode.ProposalOptions[1].optionId);

        voteNode2 = result;
    });

    test('Should receive Vote2 on node1', async () => {

        expect(listingItemReceivedOnSellerNode).toBeDefined();
        expect(listingItemReceivedOnBuyerNode).toBeDefined();
        expect(proposalReceivedOnSellerNode).toBeDefined();
        expect(proposalReceivedOnBuyerNode).toBeDefined();
        expect(sellerCombinedVote).toBeDefined();
        expect(voteNode2).toBeDefined();
        expect(proposalResultOnSellerNode).toBeDefined();

        await testUtilBuyerNode.waitFor(5);

        log.debug('========================================================================================');
        log.debug('Node1 RECEIVES MPA_VOTE (confirm with: proposal result)');
        log.debug('========================================================================================');

        const response: any = await testUtilSellerNode.rpcWaitFor(
            proposalCommand,
            [proposalResultCommand, proposalReceivedOnSellerNode.hash],
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
        expect(result.ProposalOptionResults[0].voters).toBe(sellerVoteAddressCount);
        expect(result.ProposalOptionResults[0].weight).toBe(sellerCombinedVote.weight);
        expect(result.ProposalOptionResults[1].voters).toBe(vote2AddressCount);
        expect(result.ProposalOptionResults[1].weight).toBe(voteNode2.weight);
    }, 600000); // timeout to 600s


    test('Should post Vote2 again from node2 changing the vote optionId', async () => {

        expect(listingItemReceivedOnSellerNode).toBeDefined();
        expect(listingItemReceivedOnBuyerNode).toBeDefined();
        expect(proposalReceivedOnSellerNode).toBeDefined();
        expect(proposalReceivedOnBuyerNode).toBeDefined();
        expect(sellerCombinedVote).toBeDefined();
        expect(voteNode2).toBeDefined();
        expect(proposalResultOnSellerNode).toBeDefined();

        log.debug('========================================================================================');
        log.debug('Node2 POSTS MPA_VOTE (voter2)');
        log.debug('========================================================================================');

        const response: any = await testUtilBuyerNode.rpc(voteCommand, [
            votePostCommand,
            voterProfileNode2.id,
            proposalReceivedOnBuyerNode.hash,
            proposalReceivedOnBuyerNode.ProposalOptions[0].optionId
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

        expect(listingItemReceivedOnSellerNode).toBeDefined();
        expect(listingItemReceivedOnBuyerNode).toBeDefined();
        expect(proposalReceivedOnSellerNode).toBeDefined();
        expect(proposalReceivedOnBuyerNode).toBeDefined();
        expect(sellerCombinedVote).toBeDefined();
        expect(voteNode2).toBeDefined();
        expect(proposalResultOnSellerNode).toBeDefined();

        await testUtilBuyerNode.waitFor(5);

        log.debug('========================================================================================');
        log.debug('Node2 RECEIVES MPA_VOTE (confirm with: proposal result)');
        log.debug('========================================================================================');

        // lets wait for some time to receive the vote otherwise rpcWaitFor will return the previous result
        await testUtilBuyerNode.waitFor(5);

        const response: any = await testUtilBuyerNode.rpcWaitFor(
            proposalCommand,
            [proposalResultCommand, proposalReceivedOnBuyerNode.hash],
            8 * 60,
            200,
            'ProposalOptionResults[0].voters',
            sellerVoteAddressCount + vote2AddressCount,
            '='
        );
        response.expectJson();
        response.expectStatusCode(200);

        const result: any = response.getBody()['result'];
        expect(result.ProposalOptionResults[0].voters).toBe(sellerVoteAddressCount + vote2AddressCount);
        expect(result.ProposalOptionResults[0].weight).toBe(sellerCombinedVote.weight + voteNode2.weight);
        expect(result.ProposalOptionResults[1].voters).toBe(0);
        expect(result.ProposalOptionResults[1].weight).toBe(0);
    }, 600000); // timeout to 600s
*/
});
