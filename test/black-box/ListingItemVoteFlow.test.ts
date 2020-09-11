// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * from 'jest';
import * as resources from 'resources';
import { Logger as LoggerType } from '../../src/core/Logger';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Commands } from '../../src/api/commands/CommandEnumType';
import { GenerateListingItemTemplateParams } from '../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { ItemVote } from '../../src/api/enums/ItemVote';
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
    const itemCommand = Commands.ITEM_ROOT.commandName;
    const itemGetCommand = Commands.ITEM_GET.commandName;
    const itemFlagCommand = Commands.ITEM_FLAG.commandName;
    const itemSearchCommand = Commands.ITEM_SEARCH.commandName;

    let sellerProfile: resources.Profile;
    let buyerProfile: resources.Profile;
    let sellerMarket: resources.Market;
    let buyerMarket: resources.Market;

    let listingItemTemplateOnSellerNode: resources.ListingItemTemplate;
    let listingItemReceivedOnSellerNode: resources.ListingItem;
    let listingItemReceivedOnBuyerNode: resources.ListingItem;
    let randomCategoryOnSellerNode: resources.ItemCategory;

    let proposalReceivedOnSellerNode: resources.Proposal;
    let proposalReceivedOnBuyerNode: resources.Proposal;
    let sellerCombinedVote: CombinedVote;
    let buyerCombinedVote: CombinedVote;

    let buyerVotedOption: resources.ProposalOption;
    let sellerVotedOption: resources.ProposalOption;

    let proposalResultOnSellerNode: resources.ProposalResult;
    let proposalResultOnBuyerNode: resources.ProposalResult;

    const PAGE = 0;
    const PAGE_LIMIT = 10;
    const SEARCHORDER = SearchOrder.ASC;
    const LISTINGITEM_SEARCHORDERFIELD = ListingItemSearchOrderField.CREATED_AT;
    const DAYS_RETENTION = 2;

    let sent = false;
    let timeOfFlagging = 0;

    beforeAll(async () => {

        await testUtilSellerNode.cleanDb();
        await testUtilBuyerNode.cleanDb();

        sellerProfile = await testUtilSellerNode.getDefaultProfile();
        buyerProfile = await testUtilBuyerNode.getDefaultProfile();
        expect(sellerProfile.id).toBeDefined();
        expect(buyerProfile.id).toBeDefined();
        // log.debug('sellerProfile.id: ', sellerProfile.id);
        // log.debug('buyerProfile.id: ', buyerProfile.id);

        sellerMarket = await testUtilSellerNode.getDefaultMarket(sellerProfile.id);
        buyerMarket = await testUtilBuyerNode.getDefaultMarket(buyerProfile.id);
        expect(sellerMarket.id).toBeDefined();
        expect(buyerMarket.id).toBeDefined();
        // log.debug('sellerMarket: ', JSON.stringify(sellerMarket, null, 2));
        // log.debug('buyerMarket: ', JSON.stringify(buyerMarket, null, 2));

        randomCategoryOnSellerNode = await testUtilSellerNode.getRandomCategory();

        // generate listingitemtemplate
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,                           // generateItemInformation
            true,                           // generateItemLocation
            true,                           // generateShippingDestinations
            false,                          // generateImages
            true,                           // generatePaymentInformation
            true,                           // generateEscrow
            true,                           // generateItemPrice
            true,                           // generateMessagingInformation
            false,                          // generateListingItemObjects
            false,                          // generateObjectDatas
            sellerProfile.id,               // profileId
            false,                          // generateListingItem
            sellerMarket.id,                // marketId
            randomCategoryOnSellerNode.id   // categoryId
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

        const response: any = await testUtilBuyerNode.rpcWaitFor(itemCommand, [itemSearchCommand,
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

        const response: any = await testUtilSellerNode.rpcWaitFor(itemCommand, [itemSearchCommand,
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


    test('===> BUYER FLAGS LISTINGITEM <==========================================================', async () => {
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

        const response: any = await testUtilBuyerNode.rpc(itemCommand, [itemFlagCommand,
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

        const response: any = await testUtilBuyerNode.rpcWaitFor(proposalCommand, [proposalListCommand,
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


    test('Should have flagged ListingItem on BUYER node', async () => {

        expect(listingItemReceivedOnSellerNode).toBeDefined();
        expect(listingItemReceivedOnBuyerNode).toBeDefined();
        expect(proposalReceivedOnBuyerNode.FlaggedItem.ListingItem).toBeDefined();

        await testUtilBuyerNode.waitFor(2);

        // ListingItem should have a relation to FlaggedItem with a relation to previously received Proposal
        const res = await testUtilBuyerNode.rpc(itemCommand, [itemGetCommand,
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


    test('Should have created BUYER Votes on BUYER node', async () => {

        expect(sent).toBeTruthy();
        expect(listingItemReceivedOnSellerNode).toBeDefined();
        expect(listingItemReceivedOnBuyerNode.FlaggedItem.Proposal).toBeDefined();
        expect(proposalReceivedOnBuyerNode.FlaggedItem.ListingItem).toBeDefined();

        log.debug('========================================================================================');
        log.debug('BUYER RECEIVES MPA_VOTE');
        log.debug('========================================================================================');

        buyerVotedOption = _.find(proposalReceivedOnBuyerNode.ProposalOptions, option => {
            return option.description === ItemVote.REMOVE.toString();
        });

        await testUtilBuyerNode.waitFor(3);

        const response: any = await testUtilBuyerNode.rpcWaitFor(voteCommand, [voteGetCommand,
                buyerMarket.id,
                proposalReceivedOnBuyerNode.hash
            ],
            8 * 60,
            200,
            'votedProposalOption.optionId',
            buyerVotedOption.optionId,
            '='
        );
        response.expectJson();
        response.expectStatusCode(200);

        const result: CombinedVote = response.getBody()['result'];
        expect(result.postedAt).toBeGreaterThan(timeOfFlagging);
        expect(result.receivedAt).toBeGreaterThan(timeOfFlagging);
        expect(result.expiredAt).toBeGreaterThan(timeOfFlagging);
        expect(result.weight).toBeGreaterThan(0);
        expect(result.count).toBeGreaterThan(0);
        expect(result.votedProposalOption.optionId).toBe(buyerVotedOption.optionId);

        buyerCombinedVote = result;
        log.debug('buyerCombinedVote: ', JSON.stringify(buyerCombinedVote, null, 2));

    }, 600000); // timeout to 600s


    test('Should have calculated ProposalResults on BUYER node', async () => {

        expect(sent).toBeTruthy();
        expect(listingItemReceivedOnSellerNode).toBeDefined();
        expect(listingItemReceivedOnBuyerNode.FlaggedItem.Proposal).toBeDefined();
        expect(proposalReceivedOnBuyerNode.FlaggedItem.ListingItem).toBeDefined();
        expect(buyerCombinedVote.count).toBeGreaterThan(0);
        expect(buyerCombinedVote.weight).toBeGreaterThan(0);
        expect(buyerCombinedVote.votedProposalOption.optionId).toBe(buyerVotedOption.optionId);

        log.debug('========================================================================================');
        log.debug('BUYER node ProposalResults');
        log.debug('========================================================================================');

        const response: any = await testUtilBuyerNode.rpcWaitFor(proposalCommand, [proposalResultCommand,
                proposalReceivedOnBuyerNode.hash
            ],
            8 * 60,
            200,
            'ProposalOptionResults[1].voters',
            buyerCombinedVote.count,
            '='
        );
        response.expectJson();
        response.expectStatusCode(200);

        const result: resources.ProposalResult = response.getBody()['result'];
        expect(result.ProposalOptionResults[0].voters).toBe(0);
        expect(result.ProposalOptionResults[1].voters).toBe(buyerCombinedVote.count);
        expect(result.ProposalOptionResults[0].weight).toBe(0);
        expect(result.ProposalOptionResults[1].weight).toBe(buyerCombinedVote.weight);

        proposalResultOnBuyerNode = result;

    }, 600000); // timeout to 600s


    test('Should have received Proposal on SELLER node', async () => {

        expect(sent).toBeTruthy();
        expect(listingItemReceivedOnSellerNode).toBeDefined();
        expect(listingItemReceivedOnBuyerNode.FlaggedItem.Proposal).toBeDefined();
        expect(proposalReceivedOnBuyerNode.FlaggedItem.ListingItem).toBeDefined();
        expect(buyerCombinedVote.count).toBeGreaterThan(0);
        expect(buyerCombinedVote.weight).toBeGreaterThan(0);
        expect(buyerCombinedVote.votedProposalOption.optionId).toBe(buyerVotedOption.optionId);
        expect(proposalResultOnBuyerNode.ProposalOptionResults[0].weight).toBe(0);
        expect(proposalResultOnBuyerNode.ProposalOptionResults[1].weight).toBe(buyerCombinedVote.weight);

        log.debug('========================================================================================');
        log.debug('SELLER RECEIVES MPA_PROPOSAL_ADD');
        log.debug('========================================================================================');

        await testUtilSellerNode.waitFor(5);

        const response: any = await testUtilSellerNode.rpcWaitFor(proposalCommand, [proposalGetCommand,
                proposalReceivedOnBuyerNode.hash
            ],
            30 * 60,                // maxSeconds
            200,               // waitForStatusCode
            'hash',         // property name
            proposalReceivedOnBuyerNode.hash,   // value
            '='
        );
        response.expectJson();
        response.expectStatusCode(200);

        const result: resources.Proposal = response.getBody()['result'];
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

        expect(sent).toBeTruthy();
        expect(listingItemReceivedOnSellerNode).toBeDefined();
        expect(listingItemReceivedOnBuyerNode.FlaggedItem.Proposal).toBeDefined();
        expect(proposalReceivedOnBuyerNode.FlaggedItem.ListingItem).toBeDefined();
        expect(proposalReceivedOnSellerNode.FlaggedItem.ListingItem).toBeDefined();
        expect(buyerCombinedVote.count).toBeGreaterThan(0);
        expect(buyerCombinedVote.weight).toBeGreaterThan(0);
        expect(buyerCombinedVote.votedProposalOption.optionId).toBe(buyerVotedOption.optionId);
        expect(proposalResultOnBuyerNode.ProposalOptionResults[0].weight).toBe(0);
        expect(proposalResultOnBuyerNode.ProposalOptionResults[1].weight).toBe(buyerCombinedVote.weight);

        await testUtilSellerNode.waitFor(2);

        // ListingItem should have a relation to FlaggedItem with a relation to previously received Proposal
        const res = await testUtilSellerNode.rpc(itemCommand, [itemGetCommand,
            listingItemReceivedOnSellerNode.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.ListingItem = res.getBody()['result'];
        expect(result.FlaggedItem.Proposal.id).toBe(proposalReceivedOnSellerNode.id);

        listingItemReceivedOnSellerNode = result;

        log.debug('==> SELLER flagged ListingItem.');

    }, 600000); // timeout to 600s


    test('Should have calculated ProposalResults on SELLER node', async () => {

        expect(sent).toBeTruthy();
        expect(listingItemReceivedOnSellerNode.FlaggedItem.Proposal).toBeDefined();
        expect(listingItemReceivedOnBuyerNode.FlaggedItem.Proposal).toBeDefined();
        expect(proposalReceivedOnBuyerNode.FlaggedItem.ListingItem).toBeDefined();
        expect(proposalReceivedOnSellerNode.FlaggedItem.ListingItem).toBeDefined();
        expect(buyerCombinedVote.count).toBeGreaterThan(0);
        expect(buyerCombinedVote.weight).toBeGreaterThan(0);
        expect(buyerCombinedVote.votedProposalOption.optionId).toBe(buyerVotedOption.optionId);
        expect(proposalResultOnBuyerNode.ProposalOptionResults[0].weight).toBe(0);
        expect(proposalResultOnBuyerNode.ProposalOptionResults[1].weight).toBe(buyerCombinedVote.weight);

        log.debug('========================================================================================');
        log.debug('SELLER node ProposalResults');
        log.debug('========================================================================================');

        const response: any = await testUtilSellerNode.rpcWaitFor(proposalCommand, [proposalResultCommand,
                proposalReceivedOnSellerNode.hash
            ],
            8 * 60,
            200,
            'ProposalOptionResults[1].voters',
            buyerCombinedVote.count,
            '='
        );
        response.expectJson();
        response.expectStatusCode(200);

        const result: resources.ProposalResult = response.getBody()['result'];
        expect(result.ProposalOptionResults[0].voters).toBe(0);
        expect(result.ProposalOptionResults[1].voters).toBe(buyerCombinedVote.count);
        expect(result.ProposalOptionResults[0].weight).toBe(0);
        expect(result.ProposalOptionResults[1].weight).toBe(buyerCombinedVote.weight);

        proposalResultOnSellerNode = result;

    }, 600000); // timeout to 600s


    test('===> SELLER VOTES <=====================================================================', async () => {
        expect(true).toBe(true);
    }, 600000); // timeout to 600s


    test('Should post MPA_VOTE from SELLER node', async () => {

        expect(sent).toBeTruthy();
        expect(listingItemReceivedOnSellerNode.FlaggedItem.Proposal).toBeDefined();
        expect(listingItemReceivedOnBuyerNode.FlaggedItem.Proposal).toBeDefined();
        expect(proposalReceivedOnBuyerNode.FlaggedItem.ListingItem).toBeDefined();
        expect(proposalReceivedOnSellerNode.FlaggedItem.ListingItem).toBeDefined();
        expect(buyerCombinedVote.count).toBeGreaterThan(0);
        expect(buyerCombinedVote.weight).toBeGreaterThan(0);
        expect(buyerCombinedVote.votedProposalOption.optionId).toBe(buyerVotedOption.optionId);
        expect(proposalResultOnBuyerNode.ProposalOptionResults[0].weight).toBe(0);
        expect(proposalResultOnBuyerNode.ProposalOptionResults[1].weight).toBe(buyerCombinedVote.weight);
        expect(proposalResultOnSellerNode.ProposalOptionResults[0].weight).toBe(0);
        expect(proposalResultOnSellerNode.ProposalOptionResults[1].weight).toBe(buyerCombinedVote.weight);

        expect(proposalReceivedOnSellerNode.ProposalOptions[0].description).toBe(ItemVote.KEEP);
        sellerVotedOption = proposalReceivedOnSellerNode.ProposalOptions[0];

        log.debug('========================================================================================');
        log.debug('SELLER POSTS MPA_VOTE (ItemVote.KEEP)');
        log.debug('========================================================================================');

        const response: any = await testUtilSellerNode.rpc(voteCommand, [votePostCommand,
            sellerMarket.id,
            proposalReceivedOnSellerNode.hash,
            sellerVotedOption.optionId
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


    test('Should have created SELLER Votes on SELLER node', async () => {

        expect(sent).toBeTruthy();
        expect(listingItemReceivedOnSellerNode.FlaggedItem.Proposal).toBeDefined();
        expect(listingItemReceivedOnBuyerNode.FlaggedItem.Proposal).toBeDefined();
        expect(proposalReceivedOnBuyerNode.FlaggedItem.ListingItem).toBeDefined();
        expect(proposalReceivedOnSellerNode.FlaggedItem.ListingItem).toBeDefined();
        expect(buyerCombinedVote.count).toBeGreaterThan(0);
        expect(buyerCombinedVote.weight).toBeGreaterThan(0);
        expect(buyerCombinedVote.votedProposalOption.optionId).toBe(buyerVotedOption.optionId);
        expect(proposalResultOnBuyerNode.ProposalOptionResults[0].weight).toBe(0);
        expect(proposalResultOnBuyerNode.ProposalOptionResults[1].weight).toBe(buyerCombinedVote.weight);
        expect(proposalResultOnSellerNode.ProposalOptionResults[0].weight).toBe(0);
        expect(proposalResultOnSellerNode.ProposalOptionResults[1].weight).toBe(buyerCombinedVote.weight);

        log.debug('========================================================================================');
        log.debug('SELLER CREATED MPA_VOTE');
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
        expect(result.postedAt).toBeGreaterThan(timeOfFlagging);
        expect(result.receivedAt).toBeGreaterThan(timeOfFlagging);
        expect(result.expiredAt).toBeGreaterThan(timeOfFlagging);
        expect(result.weight).toBeGreaterThan(0);
        expect(result.votedProposalOption.optionId).toBe(sellerVotedOption.optionId);
        expect(result.votedProposalOption.description).toBe(ItemVote.KEEP.toString());

        sellerCombinedVote = result;

        // log.debug('sellerCombinedVote: ', JSON.stringify(sellerCombinedVote,  null, 2));
    });


    test('Should have recalculated ProposalResults on SELLER node', async () => {

        expect(sent).toBeTruthy();
        expect(listingItemReceivedOnSellerNode.FlaggedItem.Proposal).toBeDefined();
        expect(listingItemReceivedOnBuyerNode.FlaggedItem.Proposal).toBeDefined();
        expect(proposalReceivedOnBuyerNode.FlaggedItem.ListingItem).toBeDefined();
        expect(proposalReceivedOnSellerNode.FlaggedItem.ListingItem).toBeDefined();
        expect(buyerCombinedVote.count).toBeGreaterThan(0);
        expect(buyerCombinedVote.weight).toBeGreaterThan(0);
        expect(buyerCombinedVote.votedProposalOption.optionId).toBe(buyerVotedOption.optionId);
        expect(proposalResultOnBuyerNode.ProposalOptionResults[0].weight).toBe(0);
        expect(proposalResultOnBuyerNode.ProposalOptionResults[1].weight).toBe(buyerCombinedVote.weight);
        expect(proposalResultOnSellerNode.ProposalOptionResults[0].weight).toBe(0);
        expect(proposalResultOnSellerNode.ProposalOptionResults[1].weight).toBe(buyerCombinedVote.weight);
        expect(sellerCombinedVote.count).toBeGreaterThan(0);
        expect(sellerCombinedVote.weight).toBeGreaterThan(0);
        expect(sellerCombinedVote.votedProposalOption.optionId).toBe(sellerVotedOption.optionId);

        await testUtilSellerNode.waitFor(2);

        log.debug('========================================================================================');
        log.debug('SELLER ProposalResults recalculated');
        log.debug('========================================================================================');

        const response: any = await testUtilSellerNode.rpcWaitFor(proposalCommand, [proposalResultCommand,
                proposalReceivedOnSellerNode.hash
            ],
            8 * 60,
            200,
            'ProposalOptionResults[0].voters',
            sellerCombinedVote.count,
            '='
        );
        response.expectJson();
        response.expectStatusCode(200);

        const result: resources.ProposalResult = response.getBody()['result'];
        expect(result.ProposalOptionResults[0].voters).toBe(sellerCombinedVote.count);
        expect(result.ProposalOptionResults[0].weight).toBe(sellerCombinedVote.weight);
        expect(result.ProposalOptionResults[1].voters).toBe(buyerCombinedVote.count);
        expect(result.ProposalOptionResults[1].weight).toBe(buyerCombinedVote.weight);

        proposalResultOnSellerNode = result;

        // log.debug('proposalResultOnSellerNode: ', JSON.stringify(proposalResultOnSellerNode,  null, 2));

    }, 600000); // timeout to 600s


    test('Should have recalculated ProposalResults on BUYER node', async () => {

        expect(sent).toBeTruthy();
        expect(listingItemReceivedOnSellerNode.FlaggedItem.Proposal).toBeDefined();
        expect(listingItemReceivedOnBuyerNode.FlaggedItem.Proposal).toBeDefined();
        expect(proposalReceivedOnBuyerNode.FlaggedItem.ListingItem).toBeDefined();
        expect(proposalReceivedOnSellerNode.FlaggedItem.ListingItem).toBeDefined();
        expect(buyerCombinedVote.count).toBeGreaterThan(0);
        expect(buyerCombinedVote.weight).toBeGreaterThan(0);
        expect(buyerCombinedVote.votedProposalOption.optionId).toBe(buyerVotedOption.optionId);
        expect(proposalResultOnBuyerNode.ProposalOptionResults[0].weight).toBe(0);
        expect(proposalResultOnBuyerNode.ProposalOptionResults[1].weight).toBe(buyerCombinedVote.weight);
        expect(proposalResultOnSellerNode.ProposalOptionResults[0].weight).toBe(sellerCombinedVote.weight);
        expect(proposalResultOnSellerNode.ProposalOptionResults[1].weight).toBe(buyerCombinedVote.weight);
        expect(sellerCombinedVote.count).toBeGreaterThan(0);
        expect(sellerCombinedVote.weight).toBeGreaterThan(0);
        expect(sellerCombinedVote.votedProposalOption.optionId).toBe(sellerVotedOption.optionId);

        await testUtilBuyerNode.waitFor(2);

        log.debug('========================================================================================');
        log.debug('BUYER ProposalResults recalculated');
        log.debug('========================================================================================');

        const response: any = await testUtilBuyerNode.rpcWaitFor(proposalCommand, [proposalResultCommand,
                proposalReceivedOnBuyerNode.hash
            ],
            8 * 60,
            200,
            'ProposalOptionResults[0].voters',
            sellerCombinedVote.count,
            '='
        );
        response.expectJson();
        response.expectStatusCode(200);

        const result: resources.ProposalResult = response.getBody()['result'];

        expect(result.ProposalOptionResults[0].voters).toBe(sellerCombinedVote.count);
        expect(result.ProposalOptionResults[0].weight).toBe(sellerCombinedVote.weight);
        expect(result.ProposalOptionResults[1].voters).toBe(buyerCombinedVote.count);
        expect(result.ProposalOptionResults[1].weight).toBe(buyerCombinedVote.weight);

        proposalResultOnBuyerNode = result;

        log.debug('proposalResultOnBuyerNode: ', JSON.stringify(proposalResultOnBuyerNode,  null, 2));

    }, 600000); // timeout to 600s


    test('===> BUYER REVOTES <====================================================================', async () => {
        expect(true).toBe(true);
    }, 600000); // timeout to 600s


    test('Should repost MPA_VOTE from BUYER node', async () => {

        expect(sent).toBeTruthy();
        expect(listingItemReceivedOnSellerNode.FlaggedItem.Proposal).toBeDefined();
        expect(listingItemReceivedOnBuyerNode.FlaggedItem.Proposal).toBeDefined();
        expect(proposalReceivedOnBuyerNode.FlaggedItem.ListingItem).toBeDefined();
        expect(proposalReceivedOnSellerNode.FlaggedItem.ListingItem).toBeDefined();
        expect(buyerCombinedVote.count).toBeGreaterThan(0);
        expect(buyerCombinedVote.weight).toBeGreaterThan(0);
        expect(buyerCombinedVote.votedProposalOption.optionId).toBe(buyerVotedOption.optionId);
        expect(proposalResultOnBuyerNode.ProposalOptionResults[0].weight).toBe(sellerCombinedVote.weight);
        expect(proposalResultOnBuyerNode.ProposalOptionResults[1].weight).toBe(buyerCombinedVote.weight);
        expect(proposalResultOnSellerNode.ProposalOptionResults[0].weight).toBe(sellerCombinedVote.weight);
        expect(proposalResultOnSellerNode.ProposalOptionResults[1].weight).toBe(buyerCombinedVote.weight);
        expect(sellerCombinedVote.count).toBeGreaterThan(0);
        expect(sellerCombinedVote.weight).toBeGreaterThan(0);
        expect(sellerCombinedVote.votedProposalOption.optionId).toBe(sellerVotedOption.optionId);

        log.debug('========================================================================================');
        log.debug('BUYER REPOSTS MPA_VOTE');
        log.debug('========================================================================================');

        const response: any = await testUtilBuyerNode.rpc(voteCommand, [votePostCommand,
            buyerMarket.id,
            proposalReceivedOnBuyerNode.hash,
            sellerVotedOption.optionId
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


    test('Should have recreated BUYER Votes on BUYER node', async () => {

        expect(listingItemReceivedOnSellerNode.FlaggedItem.Proposal).toBeDefined();
        expect(listingItemReceivedOnBuyerNode.FlaggedItem.Proposal).toBeDefined();
        expect(proposalReceivedOnBuyerNode.FlaggedItem.ListingItem).toBeDefined();
        expect(proposalReceivedOnSellerNode.FlaggedItem.ListingItem).toBeDefined();
        expect(buyerCombinedVote.count).toBeGreaterThan(0);
        expect(buyerCombinedVote.weight).toBeGreaterThan(0);
        expect(buyerCombinedVote.votedProposalOption.optionId).toBe(buyerVotedOption.optionId);
        expect(proposalResultOnBuyerNode.ProposalOptionResults[0].weight).toBe(sellerCombinedVote.weight);
        expect(proposalResultOnBuyerNode.ProposalOptionResults[1].weight).toBe(buyerCombinedVote.weight);
        expect(proposalResultOnSellerNode.ProposalOptionResults[0].weight).toBe(sellerCombinedVote.weight);
        expect(proposalResultOnSellerNode.ProposalOptionResults[1].weight).toBe(buyerCombinedVote.weight);
        expect(sellerCombinedVote.count).toBeGreaterThan(0);
        expect(sellerCombinedVote.weight).toBeGreaterThan(0);
        expect(sellerCombinedVote.votedProposalOption.optionId).toBe(sellerVotedOption.optionId);

        log.debug('========================================================================================');
        log.debug('BUYER RECREATED MPA_VOTE');
        log.debug('========================================================================================');

        await testUtilBuyerNode.waitFor(5);

        const response: any = await testUtilBuyerNode.rpcWaitFor(voteCommand, [voteGetCommand,
                buyerMarket.id,
                proposalReceivedOnBuyerNode.hash
            ],
            8 * 60,
            200,
            'votedProposalOption.optionId',
            sellerVotedOption.optionId,
            '='
        );
        response.expectJson();
        response.expectStatusCode(200);

        const result: resources.Vote = response.getBody()['result'];
        expect(result.postedAt).toBeGreaterThan(timeOfFlagging);
        expect(result.receivedAt).toBeGreaterThan(timeOfFlagging);
        expect(result.expiredAt).toBeGreaterThan(timeOfFlagging);
        expect(result.weight).toBeGreaterThan(0);
        expect(result.votedProposalOption.optionId).toBe(sellerVotedOption.optionId);

    });


    test('Should have recalculated ProposalResults on SELLER node', async () => {

        expect(sent).toBeTruthy();
        expect(listingItemReceivedOnSellerNode.FlaggedItem.Proposal).toBeDefined();
        expect(listingItemReceivedOnBuyerNode.FlaggedItem.Proposal).toBeDefined();
        expect(proposalReceivedOnBuyerNode.FlaggedItem.ListingItem).toBeDefined();
        expect(proposalReceivedOnSellerNode.FlaggedItem.ListingItem).toBeDefined();
        expect(buyerCombinedVote.count).toBeGreaterThan(0);
        expect(buyerCombinedVote.weight).toBeGreaterThan(0);
        expect(buyerCombinedVote.votedProposalOption.optionId).toBe(buyerVotedOption.optionId);
        expect(proposalResultOnBuyerNode.ProposalOptionResults[0].weight).toBe(sellerCombinedVote.weight);
        expect(proposalResultOnBuyerNode.ProposalOptionResults[1].weight).toBe(buyerCombinedVote.weight);
        expect(proposalResultOnSellerNode.ProposalOptionResults[0].weight).toBe(sellerCombinedVote.weight);
        expect(proposalResultOnSellerNode.ProposalOptionResults[1].weight).toBe(buyerCombinedVote.weight);
        expect(sellerCombinedVote.count).toBeGreaterThan(0);
        expect(sellerCombinedVote.weight).toBeGreaterThan(0);
        expect(sellerCombinedVote.votedProposalOption.optionId).toBe(sellerVotedOption.optionId);

        await testUtilSellerNode.waitFor(2);

        log.debug('========================================================================================');
        log.debug('SELLER ProposalResults recalculated');
        log.debug('========================================================================================');

        const response: any = await testUtilSellerNode.rpcWaitFor(proposalCommand, [proposalResultCommand,
                proposalReceivedOnSellerNode.hash
            ],
            8 * 60,
            200,
            'ProposalOptionResults[0].voters',
            buyerCombinedVote.count + sellerCombinedVote.count,
            '='
        );
        response.expectJson();
        response.expectStatusCode(200);

        const result: resources.ProposalResult = response.getBody()['result'];
        expect(result.ProposalOptionResults[0].voters).toBe(buyerCombinedVote.count + sellerCombinedVote.count);
        expect(result.ProposalOptionResults[0].weight).toBe(buyerCombinedVote.weight + sellerCombinedVote.weight);
        expect(result.ProposalOptionResults[1].voters).toBe(0);
        expect(result.ProposalOptionResults[1].weight).toBe(0);

        proposalResultOnSellerNode = result;

        // log.debug('proposalResultOnSellerNode: ', JSON.stringify(proposalResultOnSellerNode,  null, 2));

    }, 600000); // timeout to 600s


    test('Should have recalculated ProposalResults on BUYER node', async () => {

        expect(sent).toBeTruthy();
        expect(listingItemReceivedOnSellerNode.FlaggedItem.Proposal).toBeDefined();
        expect(listingItemReceivedOnBuyerNode.FlaggedItem.Proposal).toBeDefined();
        expect(proposalReceivedOnBuyerNode.FlaggedItem.ListingItem).toBeDefined();
        expect(proposalReceivedOnSellerNode.FlaggedItem.ListingItem).toBeDefined();
        expect(buyerCombinedVote.count).toBeGreaterThan(0);
        expect(buyerCombinedVote.weight).toBeGreaterThan(0);
        expect(buyerCombinedVote.votedProposalOption.optionId).toBe(buyerVotedOption.optionId);
        expect(proposalResultOnBuyerNode.ProposalOptionResults[0].weight).toBe(sellerCombinedVote.weight);
        expect(proposalResultOnBuyerNode.ProposalOptionResults[1].weight).toBe(buyerCombinedVote.weight);
        expect(proposalResultOnSellerNode.ProposalOptionResults[0].weight).toBe(buyerCombinedVote.weight + sellerCombinedVote.weight);
        expect(proposalResultOnSellerNode.ProposalOptionResults[1].weight).toBe(0);
        expect(sellerCombinedVote.count).toBeGreaterThan(0);
        expect(sellerCombinedVote.weight).toBeGreaterThan(0);
        expect(sellerCombinedVote.votedProposalOption.optionId).toBe(sellerVotedOption.optionId);

        await testUtilBuyerNode.waitFor(2);

        log.debug('========================================================================================');
        log.debug('BUYER ProposalResults recalculated');
        log.debug('========================================================================================');

        const response: any = await testUtilBuyerNode.rpcWaitFor(proposalCommand, [proposalResultCommand,
                proposalReceivedOnBuyerNode.hash
            ],
            8 * 60,
            200,
            'ProposalOptionResults[0].voters',
            buyerCombinedVote.count + sellerCombinedVote.count,
            '='
        );
        response.expectJson();
        response.expectStatusCode(200);

        const result: resources.ProposalResult = response.getBody()['result'];
        expect(result.ProposalOptionResults[0].voters).toBe(buyerCombinedVote.count + sellerCombinedVote.count);
        expect(result.ProposalOptionResults[0].weight).toBe(buyerCombinedVote.weight + sellerCombinedVote.weight);
        expect(result.ProposalOptionResults[1].voters).toBe(0);
        expect(result.ProposalOptionResults[1].weight).toBe(0);

        proposalResultOnBuyerNode = result;

        log.debug('proposalResultOnBuyerNode: ', JSON.stringify(proposalResultOnBuyerNode,  null, 2));

    }, 600000); // timeout to 600s

});
