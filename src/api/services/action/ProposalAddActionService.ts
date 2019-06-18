// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Core, Targets, Types } from '../../../constants';
import { ProposalCreateRequest } from '../../requests/model/ProposalCreateRequest';
import { SmsgService } from '../SmsgService';
import { MarketplaceMessage } from '../../messages/MarketplaceMessage';
import { EventEmitter } from 'events';
import { MarketplaceMessageEvent } from '../../messages/MarketplaceMessageEvent';
import { ProposalService } from '../model/ProposalService';
import { MessageException } from '../../exceptions/MessageException';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';
import { ProposalCategory } from '../../enums/ProposalCategory';
import { ProposalAddMessage } from '../../messages/action/ProposalAddMessage';
import { ListingItemService } from '../model/ListingItemService';
import { SmsgMessageStatus } from '../../enums/SmsgMessageStatus';
import { SmsgMessageService } from '../model/SmsgMessageService';
import { ItemVote } from '../../enums/ItemVote';
import { FlaggedItemService } from '../model/FlaggedItemService';
import { FlaggedItemCreateRequest } from '../../requests/model/FlaggedItemCreateRequest';
import { FlaggedItem } from '../../models/FlaggedItem';
import { VoteActionService } from './VoteActionService';
import { ProposalAddMessageFactory } from '../../factories/message/ProposalAddMessageFactory';
import { ProposalFactory } from '../../factories/model/ProposalFactory';
import { ompVersion } from 'omp-lib/dist/omp';
import { GovernanceAction } from '../../enums/GovernanceAction';
import { ProposalCreateParams } from '../../factories/model/ModelCreateParams';
import { ProposalAddMessageCreateParams } from '../../requests/message/ProposalAddMessageCreateParams';
import { BaseActionService } from './BaseActionService';
import { SmsgMessageFactory } from '../../factories/model/SmsgMessageFactory';
import { ProposalAddRequest } from '../../requests/action/ProposalAddRequest';
import { ProposalAddValidator } from '../../messages/validator/ProposalAddValidator';
import { VoteRequest } from '../../requests/action/VoteRequest';

export class ProposalAddActionService extends BaseActionService {

    constructor(
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
        @inject(Types.Service) @named(Targets.Service.model.SmsgMessageService) public smsgMessageService: SmsgMessageService,
        @inject(Types.Factory) @named(Targets.Factory.model.SmsgMessageFactory) public smsgMessageFactory: SmsgMessageFactory,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter,

        @inject(Types.Factory) @named(Targets.Factory.message.ProposalAddMessageFactory) private proposalMessageFactory: ProposalAddMessageFactory,
        @inject(Types.Factory) @named(Targets.Factory.model.ProposalFactory) private proposalFactory: ProposalFactory,
        @inject(Types.Factory) @named(Targets.Factory.message.ProposalAddMessageFactory) private proposalAddMessageFactory: ProposalAddMessageFactory,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.model.ProposalService) public proposalService: ProposalService,
        @inject(Types.Service) @named(Targets.Service.model.FlaggedItemService) private flaggedItemService: FlaggedItemService,
        @inject(Types.Service) @named(Targets.Service.action.VoteActionService) private voteActionService: VoteActionService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(smsgService, smsgMessageService, smsgMessageFactory);
        this.log = new Logger(__filename);
    }

    /**
     * create the MarketplaceMessage to which is to be posted to the network
     *
     * @param params
     */
    public async createMessage(params: ProposalAddRequest): Promise<MarketplaceMessage> {

        const actionMessage: ProposalAddMessage = await this.proposalAddMessageFactory.get({
            title: params.title,
            description: params.description,
            options: params.options,
            sender: params.sender,
            category: params.category,
            itemHash: params.itemHash
        } as ProposalAddMessageCreateParams);

        return {
            version: ompVersion(),
            action: actionMessage
        } as MarketplaceMessage;
    }

    /**
     * validate the MarketplaceMessage to which is to be posted to the network
     *
     * @param marketplaceMessage
     */
    public async validateMessage(marketplaceMessage: MarketplaceMessage): Promise<boolean> {
        return ProposalAddValidator.isValid(marketplaceMessage);
    }

    /**
     * called before post is executed and message is sent
     *
     * @param params
     * @param marketplaceMessage
     */
    public async beforePost(params: ProposalAddRequest, marketplaceMessage: MarketplaceMessage): Promise<MarketplaceMessage> {

        if (!params.sendParams.estimateFee) {
            // processProposal "processes" the Proposal, creating or updating the Proposal.
            // called from both beforePost() and onEvent()
            await this.processProposal(marketplaceMessage.action as ProposalAddMessage);
        } else {
            // if we're just estimating the price, dont save the Proposal
        }

        return marketplaceMessage;
    }

    /**
     * called after post is executed and message is sent
     *
     * @param params
     * @param marketplaceMessage
     * @param smsgSendResponse
     */
    public async afterPost(params: ProposalAddRequest, marketplaceMessage: MarketplaceMessage, smsgSendResponse: SmsgSendResponse): Promise<SmsgSendResponse> {

        if (smsgSendResponse.msgid) {
            const proposal: resources.Proposal = await this.proposalService.updateMsgId(marketplaceMessage.action.hash, smsgSendResponse.msgid)
                .then(value => value.toJSON());

            this.log.debug('afterPost(), proposal: ', JSON.stringify(proposal, null, 2));

            // if the Proposal is of category ITEM_VOTE, we also need to send votes for the ListingItems removal
            if (ProposalCategory.ITEM_VOTE === proposal.category) {

                const proposalOption: resources.ProposalOption | undefined = _.find(proposal.ProposalOptions, (o: resources.ProposalOption) => {
                    return o.description === ItemVote.REMOVE;
                });
                if (!proposalOption) {
                    const error = new MessageException('ProposalOption ' + ItemVote.REMOVE + ' not found.');
                    this.log.error(error.getMessage());
                    throw error;
                }

                const postRequest = {
                    sendParams: params.sendParams,
                    sender: params.sender,
                    market: params.market,
                    proposal,
                    proposalOption
                } as VoteRequest;

                // send the VoteMessages from each of senderProfiles addresses
                const voteSmsgSendResponse = await this.voteActionService.vote(postRequest);

                // ProposalResult will be calculated after each vote has been sent...
            }

        } else {
            throw new MessageException('Failed to set Proposal msgid');
        }

        return smsgSendResponse;
    }

    /**
     *
     * @param proposal
     */
    public async createFlaggedItemForProposal(proposal: resources.Proposal): Promise<resources.FlaggedItem> {
        const listingItem: resources.ListingItem = await this.listingItemService.findOneByHash(proposal.title).then(value => value.toJSON());

        const flaggedItemCreateRequest = {
            listing_item_id: listingItem.id,
            proposal_id: proposal.id,
            reason: proposal.description
        } as FlaggedItemCreateRequest;

        return await this.flaggedItemService.create(flaggedItemCreateRequest).then(value => value.toJSON());
    }

    /**
     * processProposal "processes" the Proposal, creating or updating the Proposal.
     * called from send() and processProposalReceivedEvent(), meaning before the ProposalAddMessage is sent
     * and after the ProposalAddMessage is received.
     *
     * - private processProposal():
     *   - save/update proposal locally (update: add the fields from smsgmessage)
     *   - createEmptyProposalResult(proposal), make sure empty ProposalResult is created/exists
     *   - if ProposalCategory.ITEM_VOTE:
     *     - create the FlaggedItem if not created yet
     *
     * @param proposalAddMessage
     * @param smsgMessage
     */
    public async processProposal(proposalAddMessage: ProposalAddMessage, smsgMessage?: resources.SmsgMessage): Promise<resources.Proposal> {

        // this.log.debug('processProposal(), proposalAddMessage: ', JSON.stringify(proposalAddMessage, null, 2));

        // processProposal "processes" the Proposal, creating or updating the Proposal.
        // called from both beforePost() and onEvent()

        // when called from beforePost() we create a ProposalCreateRequest with no smsgMessage data.
        // later, when the smsgMessage for this proposal is received in onEvent(),
        // we call this again and the relevant smsgMessage data will be updated and included in the model
        const proposalRequest: ProposalCreateRequest = await this.proposalFactory.get({} as ProposalCreateParams, proposalAddMessage, smsgMessage);

        this.log.debug('processProposal(), proposalAddMessage.hash: ', proposalAddMessage.hash);
        this.log.debug('processProposal(), proposalRequest.hash: ', proposalRequest.hash);

        let proposal: resources.Proposal = await this.proposalService.findOneByHash(proposalRequest.hash)
            .then(value => value.toJSON())
            .catch(async reason => {

                // proposal doesnt exist yet, so we need to create it.
                const createdProposal: resources.Proposal = await this.proposalService.create(proposalRequest).then(value => value.toJSON());
                if (ProposalCategory.ITEM_VOTE === createdProposal.category) {

                    this.log.debug('processProposal(), creating FlaggedItem for Proposal:', JSON.stringify(createdProposal, null, 2));

                    // in case of ITEM_VOTE, we also need to create the FlaggedItem
                    const flaggedItem: resources.FlaggedItem = await this.createFlaggedItemForProposal(createdProposal);
                    this.log.debug('processProposal(), flaggedItem:', JSON.stringify(flaggedItem, null, 2));
                }

                // create the first ProposalResult
                await this.proposalService.createEmptyProposalResult(createdProposal);
                return await this.proposalService.findOne(createdProposal.id).then(value => value.toJSON());
            });

        // this.log.debug('processProposal(), proposal: ', JSON.stringify(proposal, null, 2));
        // this.log.debug('processProposal(), proposalRequest: ', JSON.stringify(proposalRequest, null, 2));
        // this.log.debug('processProposal(), Number.MAX_SAFE_INTEGER: ', Number.MAX_SAFE_INTEGER);
        // this.log.debug('processProposal(), proposalRequest.postedAt: ', proposalRequest.postedAt);

        if (proposalRequest.postedAt !== Number.MAX_SAFE_INTEGER) {
            // means processProposal was called from onEvent() and we should update the Proposal data
            proposal = await this.proposalService.updateTimes(proposal.id, proposalRequest.timeStart, proposalRequest.postedAt, proposalRequest.receivedAt,
                proposalRequest.expiredAt).then(value => value.toJSON());
            this.log.debug('processProposal(), proposal updated');
        } else {
            // called from send(), we already created the Proposal so nothing else needs to be done
        }

        // this.log.debug('processProposal(), proposal:', JSON.stringify(proposal, null, 2));
        return proposal;
    }

}
