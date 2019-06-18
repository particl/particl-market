// Copyright (c) 2017-2019, The Particl Market developers
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


describe('ProposalAddActionListener', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let marketService: MarketService;
    let profileService: ProfileService;
    let smsgMessageService: SmsgMessageService;
    let proposalService: ProposalService;
    let proposalAddActionService: ProposalAddActionService;
    let proposalAddActionListener: ProposalAddActionListener;
    let smsgMessageFactory: SmsgMessageFactory;
    let coreMessageProcessor: CoreMessageProcessor;

    let defaultMarket: resources.Market;
    let defaultProfile: resources.Profile;

    let smsgMessage: resources.SmsgMessage;
    let proposal: resources.Proposal;

    // tslint:disable:max-line-length
    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);
        smsgMessageService = app.IoC.getNamed<SmsgMessageService>(Types.Service, Targets.Service.model.SmsgMessageService);
        proposalService = app.IoC.getNamed<ProposalService>(Types.Service, Targets.Service.model.ProposalService);

        proposalAddActionService = app.IoC.getNamed<ProposalAddActionService>(Types.Service, Targets.Service.action.ProposalAddActionService);
        coreMessageProcessor = app.IoC.getNamed<CoreMessageProcessor>(Types.MessageProcessor, Targets.MessageProcessor.CoreMessageProcessor);

        proposalAddActionListener = app.IoC.getNamed<ProposalAddActionListener>(Types.Listener, Targets.Listener.action.ProposalAddActionListener);
        smsgMessageFactory = app.IoC.getNamed<SmsgMessageFactory>(Types.Factory, Targets.Factory.model.SmsgMessageFactory);


        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        // get default profile + market
        defaultProfile = await profileService.getDefault().then(value => value.toJSON());
        defaultMarket = await marketService.getDefault().then(value => value.toJSON());

    });
    // tslint:enable:max-line-length

    test('Should create and post ProposalAddMessage (PUBLIC_VOTE)', async () => {

        const fromAddress = defaultProfile.address;     // send from the default profile address
        const toAddress = defaultMarket.address;        // send to the default market address
        const paid = true;                              // paid message
        const daysRetention = 2;                        // days retention
        const estimateFee = false;                      // estimate fee

        // create a ProposalAddRequest, sendParams skipping the actual send
        const postRequest = {
            sendParams: new SmsgSendParams(fromAddress, toAddress, paid, daysRetention, estimateFee),
            sender: defaultProfile,
            market: defaultMarket,
            category: ProposalCategory.PUBLIC_VOTE, // type should always be PUBLIC_VOTE when using this command
            title: Faker.lorem.words(),
            description: Faker.lorem.paragraph(),
            options: ['YES', 'NO', 'MAYBE']
        } as ProposalAddRequest;

        const smsgSendResponse: SmsgSendResponse = await proposalAddActionService.post(postRequest);
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

    test('Should process the previous ProposalAddMessage (PUBLIC_VOTE) and create an SmsgMessage', async () => {

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

    test('Should process the SmsgMessage (PUBLIC_VOTE)', async () => {

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
        log.debug('smsgMessage: ', JSON.stringify(smsgMessage, null, 2));
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

});
