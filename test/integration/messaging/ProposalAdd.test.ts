// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import * as Faker from 'faker';
import { app } from '../../../src/app';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { Types, Targets } from '../../../src/constants';
import { TestUtil } from '../lib/TestUtil';
import { TestDataService } from '../../../src/api/services/TestDataService';
import { MarketService } from '../../../src/api/services/model/MarketService';
import { ProfileService } from '../../../src/api/services/model/ProfileService';
import { SmsgSendParams } from '../../../src/api/requests/action/SmsgSendParams';
import { ProposalCategory } from '../../../src/api/enums/ProposalCategory';
import { ProposalAddRequest } from '../../../src/api/requests/action/ProposalAddRequest';
import { ProposalAddActionService } from '../../../src/api/services/action/ProposalAddActionService';
import { SmsgSendResponse } from '../../../src/api/responses/SmsgSendResponse';
import { SmsgMessageService } from '../../../src/api/services/model/SmsgMessageService';
import { ActionDirection } from '../../../src/api/enums/ActionDirection';
import { ProposalService } from '../../../src/api/services/model/ProposalService';
import { ProposalAddActionListener } from '../../../src/api/listeners/action/ProposalAddActionListener';
import { MarketplaceMessage } from '../../../src/api/messages/MarketplaceMessage';
import { MarketplaceMessageEvent } from '../../../src/api/messages/MarketplaceMessageEvent';
import { SmsgMessageFactory } from '../../../src/api/factories/model/SmsgMessageFactory';
import { SmsgMessageStatus } from '../../../src/api/enums/SmsgMessageStatus';
import { GovernanceAction } from '../../../src/api/enums/GovernanceAction';
import { CoreMessageProcessor } from '../../../src/api/messageprocessors/CoreMessageProcessor';
import { CoreSmsgMessage } from '../../../src/api/messages/CoreSmsgMessage';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { TestDataGenerateRequest } from '../../../src/api/requests/testdata/TestDataGenerateRequest';
import { GenerateListingItemParams } from '../../../src/api/requests/testdata/GenerateListingItemParams';
import { ItemVote } from '../../../src/api/enums/ItemVote';
import { VoteService } from '../../../src/api/services/model/VoteService';
import { VoteActionListener } from '../../../src/api/listeners/action/VoteActionListener';


describe('ProposalAddActionListener', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let marketService: MarketService;
    let profileService: ProfileService;
    let smsgMessageService: SmsgMessageService;
    let proposalService: ProposalService;
    let voteService: VoteService;
    let proposalAddActionService: ProposalAddActionService;
    let proposalAddActionListener: ProposalAddActionListener;
    let voteActionListener: VoteActionListener;
    let smsgMessageFactory: SmsgMessageFactory;
    let coreMessageProcessor: CoreMessageProcessor;

    let market: resources.Market;
    let profile: resources.Profile;

    let smsgMessage: resources.SmsgMessage;
    let smsgMessageVotes: resources.SmsgMessage[] = [];

    let proposal: resources.Proposal;
    let listingItem: resources.ListingItem;

    // tslint:disable:max-line-length
    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);
        smsgMessageService = app.IoC.getNamed<SmsgMessageService>(Types.Service, Targets.Service.model.SmsgMessageService);
        proposalService = app.IoC.getNamed<ProposalService>(Types.Service, Targets.Service.model.ProposalService);
        voteService = app.IoC.getNamed<VoteService>(Types.Service, Targets.Service.model.VoteService);

        proposalAddActionService = app.IoC.getNamed<ProposalAddActionService>(Types.Service, Targets.Service.action.ProposalAddActionService);
        coreMessageProcessor = app.IoC.getNamed<CoreMessageProcessor>(Types.MessageProcessor, Targets.MessageProcessor.CoreMessageProcessor);

        proposalAddActionListener = app.IoC.getNamed<ProposalAddActionListener>(Types.Listener, Targets.Listener.action.ProposalAddActionListener);
        voteActionListener = app.IoC.getNamed<VoteActionListener>(Types.Listener, Targets.Listener.action.VoteActionListener);
        smsgMessageFactory = app.IoC.getNamed<SmsgMessageFactory>(Types.Factory, Targets.Factory.model.SmsgMessageFactory);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        // get default profile + market
        profile = await profileService.getDefault().then(value => value.toJSON());
        market = await marketService.getDefaultForProfile(profile.id).then(value => value.toJSON());

    });
    // tslint:enable:max-line-length

/*
    test('Should create and post MPA_PROPOSAL_ADD (PUBLIC_VOTE)', async () => {
        log.debug('===================================================================================');
        log.debug('create and post MPA_PROPOSAL_ADD (PUBLIC_VOTE), create Proposal');
        log.debug('===================================================================================');

        const fromAddress = profile.address;            // send from the default profile address
        const toAddress = market.receiveAddress;        // send to the default market address
        const paid = true;                              // paid message
        const daysRetention = 1;                        // days retention
        const estimateFee = false;                      // estimate fee

        // create a ProposalAddRequest, sendParams skipping the actual send
        const postRequest = {
            sendParams: new SmsgSendParams(fromAddress, toAddress, paid, daysRetention, estimateFee),
            sender: profile,
            market,
            category: ProposalCategory.PUBLIC_VOTE, // type should always be PUBLIC_VOTE when using this command
            title: Faker.lorem.words(),
            description: Faker.lorem.paragraph(),
            options: ['YES', 'NO', 'MAYBE']
        } as ProposalAddRequest;

        const smsgSendResponse: SmsgSendResponse = await proposalAddActionService.post(postRequest)
            .catch(reason => {
                log.debug('ERROR: ', reason);
                throw reason;
            });
        log.debug('smsgSendResponse: ', JSON.stringify(smsgSendResponse, null, 2));
        expect(smsgSendResponse.result).toBe('Sent.');
        expect(smsgSendResponse.msgid).toBeDefined();
        expect(smsgSendResponse.txid).toBeDefined();
        expect(smsgSendResponse.fee).toBeDefined();

        // at this point:
        // - outgoing SmsgMessage should have been saved and sent
        // - Proposal updated with the msgid should exist
        // - first ProposalResult should exist
        // - there is no FlaggedItem since ProposalCategory is PUBLIC_VOTE

        smsgMessage = await smsgMessageService.findOneByMsgId(smsgSendResponse.msgid!, ActionDirection.OUTGOING).then(value => value.toJSON());
        // log.debug('smsgMessage: ', JSON.stringify(smsgMessage, null, 2));
        expect(smsgMessage.msgid).toBe(smsgSendResponse.msgid);
        expect(smsgMessage.direction).toBe(ActionDirection.OUTGOING);
        expect(smsgMessage.type).toBe(GovernanceAction.MPA_PROPOSAL_ADD);
        expect(smsgMessage.status).toBe(SmsgMessageStatus.SENT);

        proposal = await proposalService.findOneByMsgId(smsgSendResponse.msgid!).then(value => value.toJSON());
        // log.debug('proposal: ', JSON.stringify(proposal, null, 2));
        expect(proposal.msgid).toBe(smsgSendResponse.msgid);
        expect(proposal.ProposalResults.length).toBe(1);
        expect(proposal.ProposalResults[0].ProposalOptionResults.length).toBe(3);
        expect(proposal.FlaggedItem).toEqual({});
    });

    test('Should process the previous MPA_PROPOSAL_ADD (PUBLIC_VOTE) and create SmsgMessage', async () => {

        log.debug('===================================================================================');
        log.debug('process MPA_PROPOSAL_ADD (PUBLIC_VOTE) and create SmsgMessage');
        log.debug('===================================================================================');

        const coreSmsgMessage = {
            msgid: smsgMessage.msgid,
            version: smsgMessage.version,
            location: 'incoming',
            read: false,
            paid: true,
            payloadsize: smsgMessage.payloadsize,
            received: smsgMessage.received,
            sent: smsgMessage.sent,
            expiration: smsgMessage.expiration,
            daysretention: smsgMessage.daysretention,
            from: smsgMessage.from,
            to: smsgMessage.to,
            text: smsgMessage.text
        } as CoreSmsgMessage;

        await coreMessageProcessor.process([coreSmsgMessage]);

        // once the coremessage is processed:
        // - SmsgMessage status and direction should have been updated (actually a new message is created with direction === INCOMING)

        smsgMessage = await smsgMessageService.findOneByMsgId(smsgMessage.msgid!, ActionDirection.INCOMING).then(value => value.toJSON());
        // log.debug('smsgMessage: ', JSON.stringify(smsgMessage, null, 2));
        expect(smsgMessage.direction).toBe(ActionDirection.INCOMING);
        expect(smsgMessage.type).toBe(GovernanceAction.MPA_PROPOSAL_ADD);
        expect(smsgMessage.status).toBe(SmsgMessageStatus.NEW);
    });

    test('Should process the SmsgMessage (ProposalAddMessage) (PUBLIC_VOTE)', async () => {

        log.debug('===================================================================================');
        log.debug('process SmsgMessage (ProposalAddMessage), update Proposal');
        log.debug('===================================================================================');

        const marketplaceMessage: MarketplaceMessage = await smsgMessageFactory.getMarketplaceMessage(smsgMessage).then(value => value);
        const marketplaceEvent: MarketplaceMessageEvent = {
            smsgMessage,
            marketplaceMessage
        };

        await proposalAddActionListener.act(marketplaceEvent);

        // once the smsgmessage is processed:
        // - SmsgMessage status should have been updated
        // - Proposals receivedAt, postedAt, expiredAt should have been updated
        // - no new empty ProposalResult should have been added
        // - still no FlaggedItem since ProposalCategory is PUBLIC_VOTE

        smsgMessage = await smsgMessageService.findOneByMsgId(smsgMessage.msgid!, ActionDirection.INCOMING).then(value => value.toJSON());
        // log.debug('smsgMessage: ', JSON.stringify(smsgMessage, null, 2));
        expect(smsgMessage.direction).toBe(ActionDirection.INCOMING);
        expect(smsgMessage.type).toBe(GovernanceAction.MPA_PROPOSAL_ADD);
        expect(smsgMessage.status).toBe(SmsgMessageStatus.PROCESSED);

        const updatedProposal: resources.Proposal = await proposalService.findOneByMsgId(smsgMessage.msgid!).then(value => value.toJSON());
        // log.debug('proposal: ', JSON.stringify(proposal, null, 2));
        expect(updatedProposal.msgid).toBe(smsgMessage.msgid);
        expect(updatedProposal.timeStart).not.toBe(Number.MAX_SAFE_INTEGER);
        expect(updatedProposal.postedAt).not.toBe(Number.MAX_SAFE_INTEGER);
        expect(updatedProposal.receivedAt).not.toBe(Number.MAX_SAFE_INTEGER);
        expect(updatedProposal.expiredAt).not.toBe(Number.MAX_SAFE_INTEGER);

        expect(updatedProposal.ProposalResults.length).toBe(1);
        expect(updatedProposal.ProposalResults[0].ProposalOptionResults.length).toBe(3);
        expect(updatedProposal.FlaggedItem).toEqual({});
    });

    test('Should process the SmsgMessage (ProposalAddMessage) (PUBLIC_VOTE) sent from another node (Proposal doesnt exist yet)', async () => {

        log.debug('===================================================================================');
        log.debug('remove the existing Proposal and set SmsgMessage.status to NEW, process SmsgMessage again, creating Proposal');
        log.debug('===================================================================================');

        // update the messagestatus and remove the existing proposal ss
        await smsgMessageService.updateSmsgMessageStatus(smsgMessage.id, SmsgMessageStatus.NEW);
        await proposalService.destroy(proposal.id);

        const marketplaceMessage: MarketplaceMessage = await smsgMessageFactory.getMarketplaceMessage(smsgMessage).then(value => value);
        const marketplaceEvent: MarketplaceMessageEvent = {
            smsgMessage,
            marketplaceMessage
        };

        await proposalAddActionListener.act(marketplaceEvent);

        // once the smsgmessage is processed:
        // - SmsgMessage status should have been updated
        // - new Proposal should have been created
        // - first ProposalResult should exist
        // - no FlaggedItem since ProposalCategory is PUBLIC_VOTE

        smsgMessage = await smsgMessageService.findOneByMsgId(smsgMessage.msgid!, ActionDirection.INCOMING).then(value => value.toJSON());
        // log.debug('smsgMessage: ', JSON.stringify(smsgMessage, null, 2));
        expect(smsgMessage.direction).toBe(ActionDirection.INCOMING);
        expect(smsgMessage.type).toBe(GovernanceAction.MPA_PROPOSAL_ADD);
        expect(smsgMessage.status).toBe(SmsgMessageStatus.PROCESSED);

        const updatedProposal: resources.Proposal = await proposalService.findOneByMsgId(smsgMessage.msgid!).then(value => value.toJSON());
        // log.debug('proposal: ', JSON.stringify(proposal, null, 2));
        expect(updatedProposal.msgid).toBe(smsgMessage.msgid);
        expect(updatedProposal.timeStart).not.toBe(Number.MAX_SAFE_INTEGER);
        expect(updatedProposal.postedAt).not.toBe(Number.MAX_SAFE_INTEGER);
        expect(updatedProposal.receivedAt).not.toBe(Number.MAX_SAFE_INTEGER);
        expect(updatedProposal.expiredAt).not.toBe(Number.MAX_SAFE_INTEGER);

        expect(updatedProposal.ProposalResults.length).toBe(1);
        expect(updatedProposal.ProposalResults[0].ProposalOptionResults.length).toBe(3);
        expect(updatedProposal.FlaggedItem).toEqual({});
    });
*/
    test('Should create and post MPA_PROPOSAL_ADD (ITEM_VOTE)', async () => {

        log.debug('===================================================================================');
        log.debug('create and post MPA_PROPOSAL_ADD (ITEM_VOTE), create Proposal');
        log.debug('===================================================================================');

        // first create the listingitem to flag
        // create ListingItems
        const generateListingItemParams = new GenerateListingItemParams([
            true,                                       // generateItemInformation
            true,                                       // generateItemLocation
            true,                                       // generateShippingDestinations
            false,                                      // generateItemImages
            true,                                       // generatePaymentInformation
            true,                                       // generateEscrow
            true,                                       // generateItemPrice
            true,                                       // generateMessagingInformation
            true,                                       // generateListingItemObjects
            false,                                      // generateObjectDatas
            null,                                       // listingItemTemplateHash
            profile.address                      // seller
        ]).toParamsArray();

        const listingItems = await testDataService.generate({
            model: CreatableModel.LISTINGITEM,          // what to generate
            amount: 1,                                  // how many to generate
            withRelated: true,                          // return model
            generateParams: generateListingItemParams   // what kind of data to generate
        } as TestDataGenerateRequest);
        listingItem = listingItems[0];

        // now we have the listingitem, we can post the msg to flag it

        const fromAddress = profile.address;            // send from the default profile address
        const toAddress = market.receiveAddress;        // send to the default market address
        const paid = false;                             // paid message
        const daysRetention = 1;                        // days retention
        const estimateFee = false;                      // estimate fee

        const options: string[] = [ItemVote.KEEP, ItemVote.REMOVE];

        // create a ProposalAddRequest, sendParams skipping the actual send
        const postRequest = {
            sendParams: new SmsgSendParams(fromAddress, toAddress, paid, daysRetention, estimateFee),
            sender: profile,
            market,
            category: ProposalCategory.ITEM_VOTE,
            title: listingItem.hash,
            description: 'I WANT THIS GONE',
            options,
            itemHash: listingItem.hash
        } as ProposalAddRequest;

        const smsgSendResponse: SmsgSendResponse = await proposalAddActionService.post(postRequest);
        log.debug('smsgSendResponse: ', JSON.stringify(smsgSendResponse, null, 2));
        expect(smsgSendResponse.result).toBe('Sent.');
        expect(smsgSendResponse.msgid).toBeDefined();
        expect(smsgSendResponse.msgids).toBeDefined();
        expect(smsgSendResponse.msgids!.length).toBeGreaterThan(0);

        // at this point:
        // - outgoing SmsgMessage (MPA_PROPOSAL_ADD) should have been saved and sent
        // - outgoing SmsgMessages (MPA_VOTE) should have been saved and sent
        // - Proposal updated with the msgid should exist
        // - Proposal should have a relation to FlaggedItem since ProposalCategory is PUBLIC_VOTE
        // - first ProposalResult should exist having weight 0
        // - second ProposalResult should exist having weight larger than 0
        // - Votes updated with the msgid should exist
        // - Votes should have a relation to Proposal

        smsgMessage = await smsgMessageService.findOneByMsgId(smsgSendResponse.msgid!, ActionDirection.OUTGOING).then(value => value.toJSON());
        // log.debug('smsgMessage: ', JSON.stringify(smsgMessage, null, 2));
        expect(smsgMessage.msgid).toBe(smsgSendResponse.msgid);
        expect(smsgMessage.direction).toBe(ActionDirection.OUTGOING);
        expect(smsgMessage.type).toBe(GovernanceAction.MPA_PROPOSAL_ADD);
        expect(smsgMessage.status).toBe(SmsgMessageStatus.SENT);

        for (const voteMsgid of smsgSendResponse.msgids!) {
            const smsgMessageVote: resources.SmsgMessage = await smsgMessageService.findOneByMsgId(voteMsgid, ActionDirection.OUTGOING)
                .then(value => value.toJSON());
            expect(smsgMessageVote.msgid).toBe(voteMsgid);
            expect(smsgMessageVote.direction).toBe(ActionDirection.OUTGOING);
            expect(smsgMessageVote.type).toBe(GovernanceAction.MPA_VOTE);
            expect(smsgMessageVote.status).toBe(SmsgMessageStatus.SENT);

            smsgMessageVotes.push(smsgMessageVote);
        }

        proposal = await proposalService.findOneByMsgId(smsgSendResponse.msgid!).then(value => value.toJSON());
        log.debug('proposal: ', JSON.stringify(proposal, null, 2));
        expect(proposal.msgid).toBe(smsgSendResponse.msgid);
        expect(proposal.ProposalResults.length).toBeGreaterThan(2);
        expect(proposal.ProposalResults[0].ProposalOptionResults.length).toBe(2);
        expect(proposal.ProposalResults[0].ProposalOptionResults[0].weight).toBe(0);
        expect(proposal.ProposalResults[0].ProposalOptionResults[1].weight).toBe(0);
        expect(proposal.ProposalResults[1].ProposalOptionResults[0].weight).toBe(0);
        expect(proposal.ProposalResults[1].ProposalOptionResults[1].weight).toBeGreaterThan(0);
        expect(proposal.FlaggedItem.listingItemId).toEqual(listingItem.id);
        expect(proposal.FlaggedItem.reason).toEqual(postRequest.description);

        for (const voteMsgid of smsgSendResponse.msgids!) {
            const vote: resources.Vote = await voteService.findOneByMsgId(voteMsgid).then(value => value.toJSON());
            log.debug('vote: ', JSON.stringify(vote, null, 2));
            expect(vote.ProposalOption.id).toBeDefined();
            expect(vote.ProposalOption.Proposal.id).toBeDefined();
            expect(vote.ProposalOption.Proposal.FlaggedItem.id).toBeDefined();
            expect(vote.ProposalOption.Proposal.FlaggedItem.ListingItem.id).toBeDefined();
        }

    });

    test('Should process the previous MPA_PROPOSAL_ADD (ITEM_VOTE) and create SmsgMessage', async () => {

        log.debug('===================================================================================');
        log.debug('process MPA_PROPOSAL_ADD (ITEM_VOTE) and create SmsgMessage');
        log.debug('===================================================================================');

        const coreSmsgMessage = {
            msgid: smsgMessage.msgid,
            version: smsgMessage.version,
            location: 'incoming',
            read: false,
            paid: true,
            payloadsize: smsgMessage.payloadsize,
            received: smsgMessage.received,
            sent: smsgMessage.sent,
            expiration: smsgMessage.expiration,
            daysretention: smsgMessage.daysretention,
            from: smsgMessage.from,
            to: smsgMessage.to,
            text: smsgMessage.text
        } as CoreSmsgMessage;

        await coreMessageProcessor.process([coreSmsgMessage]);

        // once the coremessage is processed:
        // - SmsgMessage status and direction should have been updated (actually a new message is created with direction === INCOMING)

        smsgMessage = await smsgMessageService.findOneByMsgId(smsgMessage.msgid!, ActionDirection.INCOMING).then(value => value.toJSON());
        // log.debug('smsgMessage: ', JSON.stringify(smsgMessage, null, 2));
        expect(smsgMessage.direction).toBe(ActionDirection.INCOMING);
        expect(smsgMessage.type).toBe(GovernanceAction.MPA_PROPOSAL_ADD);
        expect(smsgMessage.status).toBe(SmsgMessageStatus.NEW);
    });

    test('Should process the MPA_VOTE(s) and create SmsgMessage(s) (ProposalAddMessage/VoteMessage)', async () => {

        log.debug('===================================================================================');
        log.debug('process MPA_VOTE(s) and create SmsgMessage(s)');
        log.debug('===================================================================================');

        const incomingSmsgMessageVotes: resources.SmsgMessage[] = [];

        for (let smsgMessageVote of smsgMessageVotes) {
            const coreSmsgMessage = {
                msgid: smsgMessageVote.msgid,
                version: smsgMessageVote.version,
                location: 'incoming',
                read: false,
                paid: true,
                payloadsize: smsgMessageVote.payloadsize,
                received: smsgMessageVote.received,
                sent: smsgMessageVote.sent,
                expiration: smsgMessageVote.expiration,
                daysretention: smsgMessageVote.daysretention,
                from: smsgMessageVote.from,
                to: smsgMessageVote.to,
                text: smsgMessageVote.text
            } as CoreSmsgMessage;

            await coreMessageProcessor.process([coreSmsgMessage]);

            // once the coremessage is processed:
            // - SmsgMessage status and direction should have been updated (actually a new message is created with direction === INCOMING)

            smsgMessageVote = await smsgMessageService.findOneByMsgId(smsgMessageVote.msgid!, ActionDirection.INCOMING).then(value => value.toJSON());
            log.debug('smsgMessage: ', JSON.stringify(smsgMessage, null, 2));
            expect(smsgMessageVote.direction).toBe(ActionDirection.INCOMING);
            expect(smsgMessageVote.type).toBe(GovernanceAction.MPA_VOTE);
            expect(smsgMessageVote.status).toBe(SmsgMessageStatus.NEW);

            incomingSmsgMessageVotes.push(smsgMessageVote);
        }

        // smsgMessageVotes contains the sent smsgs, need to replace those with the incoming...
        smsgMessageVotes = incomingSmsgMessageVotes;
    });

    test('Should process the SmsgMessage (ProposalAddMessage) (ITEM_VOTE)', async () => {

        log.debug('===================================================================================');
        log.debug('process SmsgMessage, update Proposal');
        log.debug('===================================================================================');

        const marketplaceMessage: MarketplaceMessage = await smsgMessageFactory.getMarketplaceMessage(smsgMessage).then(value => value);
        const marketplaceEvent: MarketplaceMessageEvent = {
            smsgMessage,
            marketplaceMessage
        };

        await proposalAddActionListener.act(marketplaceEvent);

        // once the smsgmessage is processed:
        // - SmsgMessage status should have been updated
        // - Proposals receivedAt, postedAt, expiredAt should have been updated
        // - no new ProposalResults should have been added (there should be two)
        // - Proposal should have a relation to FlaggedItem since ProposalCategory is PUBLIC_VOTE
        // - first ProposalResult should exist having weight 0
        // - second ProposalResult should exist having weight larger than 0

        smsgMessage = await smsgMessageService.findOneByMsgId(smsgMessage.msgid!, ActionDirection.INCOMING).then(value => value.toJSON());
        // log.debug('smsgMessage: ', JSON.stringify(smsgMessage, null, 2));
        expect(smsgMessage.direction).toBe(ActionDirection.INCOMING);
        expect(smsgMessage.type).toBe(GovernanceAction.MPA_PROPOSAL_ADD);
        expect(smsgMessage.status).toBe(SmsgMessageStatus.PROCESSED);

        const updatedProposal: resources.Proposal = await proposalService.findOneByMsgId(smsgMessage.msgid!).then(value => value.toJSON());
        // log.debug('proposal: ', JSON.stringify(proposal, null, 2));
        expect(updatedProposal.msgid).toBe(smsgMessage.msgid);
        expect(updatedProposal.timeStart).not.toBe(Number.MAX_SAFE_INTEGER);
        expect(updatedProposal.postedAt).not.toBe(Number.MAX_SAFE_INTEGER);
        expect(updatedProposal.receivedAt).not.toBe(Number.MAX_SAFE_INTEGER);
        expect(updatedProposal.expiredAt).not.toBe(Number.MAX_SAFE_INTEGER);

        expect(updatedProposal.ProposalResults.length).toBeGreaterThan(2);
        expect(updatedProposal.ProposalResults[0].ProposalOptionResults.length).toBe(2);
        expect(updatedProposal.ProposalResults[0].ProposalOptionResults[0].weight).toBe(0);
        expect(updatedProposal.ProposalResults[0].ProposalOptionResults[1].weight).toBe(0);
        expect(updatedProposal.ProposalResults[1].ProposalOptionResults[0].weight).toBe(0);
        expect(updatedProposal.ProposalResults[1].ProposalOptionResults[1].weight).toBeGreaterThan(0);
        expect(updatedProposal.FlaggedItem.listingItemId).toEqual(listingItem.id);

    });

    test('Should process the SmsgMessages (VoteMessage)', async () => {

        log.debug('===================================================================================');
        log.debug('process SmsgMessage, update Votes');
        log.debug('===================================================================================');

        let removeWeight = 0;
        let keepWeight = 0;
        let voteCount = 0;

        for (const smsgMessageVote of smsgMessageVotes) {
            voteCount++;

            const marketplaceMessage: MarketplaceMessage = await smsgMessageFactory.getMarketplaceMessage(smsgMessageVote).then(value => value);
            const marketplaceEvent: MarketplaceMessageEvent = {
                smsgMessage: smsgMessageVote,
                marketplaceMessage
            };

            await voteActionListener.act(marketplaceEvent);

            // once the smsgmessage is processed:
            // - SmsgMessage status should have been updated
            // - Votes receivedAt, postedAt, expiredAt should have been updated
            // - new ProposalResult should be calculated after each Vote
            // - first ProposalResult should exist having weight 0
            // - second ProposalResult should exist having weight larger than 0

            const updatedVoteSmsgMessage = await smsgMessageService.findOneByMsgId(smsgMessageVote.msgid!, ActionDirection.INCOMING)
                .then(value => value.toJSON());
            // log.debug('smsgMessage: ', JSON.stringify(updatedVoteSmsgMessage, null, 2));
            expect(updatedVoteSmsgMessage.direction).toBe(ActionDirection.INCOMING);
            expect(updatedVoteSmsgMessage.type).toBe(GovernanceAction.MPA_VOTE);
            expect(updatedVoteSmsgMessage.status).toBe(SmsgMessageStatus.PROCESSED);

            const vote: resources.Vote = await voteService.findOneByMsgId(smsgMessageVote.msgid).then(value => value.toJSON());
            // log.debug('vote: ', JSON.stringify(vote, null, 2));
            expect(vote.postedAt).not.toBe(Number.MAX_SAFE_INTEGER);
            expect(vote.receivedAt).not.toBe(Number.MAX_SAFE_INTEGER);
            expect(vote.expiredAt).not.toBe(Number.MAX_SAFE_INTEGER);
            expect(vote.ProposalOption.id).toBeDefined();
            expect(vote.ProposalOption.Proposal.id).toBeDefined();
            expect(vote.ProposalOption.Proposal.FlaggedItem.id).toBeDefined();
            expect(vote.ProposalOption.Proposal.FlaggedItem.ListingItem.id).toBeDefined();

            // calculate the total weights
            removeWeight = ItemVote.REMOVE === vote.ProposalOption.description ? removeWeight + vote.weight : removeWeight;
            keepWeight = ItemVote.KEEP === vote.ProposalOption.description ? keepWeight + vote.weight : keepWeight;

        }

        proposal = await proposalService.findOneByMsgId(smsgMessage.msgid!).then(value => value.toJSON());

        // first ProposalResults created when ProposalAddMessage is posted and Proposal is created
        // second ProposalResults created when ProposalAddMessage is received and Proposal is updated
        // third ProposalResults created when Vote is received

        // expect(proposal.ProposalResults.length).toBe(2 + smsgMessageVotes.length);
        expect(proposal.ProposalResults[0].ProposalOptionResults.length).toBe(2);
        expect(proposal.ProposalResults[0].ProposalOptionResults[1].weight).toBe(0);
        expect(proposal.ProposalResults[proposal.ProposalResults.length - 1].ProposalOptionResults[1].weight).toBe(removeWeight);

    });

    // TODO: remove proposal and votes and then process incoming proposal and votes
    // TODO: process votes coming from external addresses

});
