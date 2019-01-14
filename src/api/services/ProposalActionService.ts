// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import { inject, named} from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets, Events } from '../../constants';
import { ProposalCreateRequest } from '../requests/ProposalCreateRequest';
import { SmsgService } from './SmsgService';
import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { EventEmitter } from 'events';
import * as resources from 'resources';
import { MarketplaceEvent } from '../messages/MarketplaceEvent';
import { ProposalMessageType } from '../enums/ProposalMessageType';
import { ProposalFactory } from '../factories/ProposalFactory';
import { ProposalService } from './ProposalService';
import { ProposalResultService } from './ProposalResultService';
import { ProposalOptionResultService } from './ProposalOptionResultService';
import { CoreRpcService } from './CoreRpcService';
import { MessageException } from '../exceptions/MessageException';
import { SmsgSendResponse } from '../responses/SmsgSendResponse';
import { ProposalType } from '../enums/ProposalType';
import { ProposalMessage } from '../messages/ProposalMessage';
import { ListingItemService } from './ListingItemService';
import { VoteFactory } from '../factories/VoteFactory';
import { SmsgMessageStatus } from '../enums/SmsgMessageStatus';
import { SmsgMessageService } from './SmsgMessageService';
import { VoteService } from './VoteService';
import { ItemVote } from '../enums/ItemVote';
import { FlaggedItemService } from './FlaggedItemService';
import { FlaggedItemCreateRequest } from '../requests/FlaggedItemCreateRequest';
import { FlaggedItem } from '../models/FlaggedItem';
import { VoteMessageType } from '../enums/VoteMessageType';
import { ProfileService } from './ProfileService';

export class ProposalActionService {

    public log: LoggerType;

    constructor(@inject(Types.Factory) @named(Targets.Factory.ProposalFactory) private proposalFactory: ProposalFactory,
                @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
                @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
                @inject(Types.Service) @named(Targets.Service.ListingItemService) public listingItemService: ListingItemService,
                @inject(Types.Service) @named(Targets.Service.ProposalService) public proposalService: ProposalService,
                @inject(Types.Service) @named(Targets.Service.ProposalResultService) public proposalResultService: ProposalResultService,
                @inject(Types.Service) @named(Targets.Service.ProposalOptionResultService) public proposalOptionResultService: ProposalOptionResultService,
                @inject(Types.Service) @named(Targets.Service.SmsgMessageService) private smsgMessageService: SmsgMessageService,
                @inject(Types.Factory) @named(Targets.Factory.VoteFactory) private voteFactory: VoteFactory,
                @inject(Types.Service) @named(Targets.Service.VoteService) private voteService: VoteService,
                @inject(Types.Service) @named(Targets.Service.FlaggedItemService) private flaggedItemService: FlaggedItemService,
                @inject(Types.Service) @named(Targets.Service.ProfileService) private profileService: ProfileService,
                @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter,
                @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType) {
        this.log = new Logger(__filename);
        this.configureEventListeners();
    }

    /**
     * create ProposalMessage (of type MP_PROPOSAL_ADD) and post it
     *
     * @param {ProposalType} proposalType
     * @param {string} proposalTitle
     * @param {string} proposalDescription
     * @param {number} blockStart
     * @param {number} blockEnd
     * @param {number} daysRetention
     * @param {string[]} options
     * @param {"resources".Profile} senderProfile
     * @param {"resources".Market} marketplace
     * @param {string} itemHash
     * @param {boolean} estimateFee
     * @returns {Promise<SmsgSendResponse>}
     */
    public async send(proposalTitle: string, proposalDescription: string,
                      daysRetention: number, options: string[],
                      senderProfile: resources.Profile, marketplace: resources.Market, itemHash: string | null = null,
                      estimateFee: boolean = false): Promise<SmsgSendResponse> {

        const proposalMessage = await this.proposalFactory.getMessage(
            ProposalMessageType.MP_PROPOSAL_ADD,
            proposalTitle,
            proposalDescription,
            options,
            senderProfile,
            itemHash
        );

        // Create a proposal request with no smsgMessage data: when the smsgMessage for this proposal is received, the relevant smsgMessage data will be updated
        const proposalCreateRequest: ProposalCreateRequest = await this.proposalFactory.getModel(proposalMessage);
        if (proposalCreateRequest.type === ProposalType.ITEM_VOTE) {
            // this.log.debug('send(), proposalCreateRequest: ', JSON.stringify(proposalCreateRequest, null, 2));
            await this.processItemVoteProposal(proposalCreateRequest);
        }

        const msg: MarketplaceMessage = {
            version: process.env.MARKETPLACE_VERSION,
            mpaction: proposalMessage
        };

        const paidMessage = proposalMessage.type === ProposalType.PUBLIC_VOTE;
        return this.smsgService.smsgSend(senderProfile.address, marketplace.address, msg, paidMessage, daysRetention, estimateFee);
    }

    /**
     * process received ProposalMessage:
     *
     *  if item_vote
     *      if proposal exists
     *          update to use the one that was sent first
     *      else
     *          create Proposal
     *      add vote
     *      if listingitem exists && no relation
     *          add relation to listingitem
     *  else (ProposalType.PUBLIC_VOTE)
     *      create Proposal
     *  create ProposalResult
     *
     * @param {MarketplaceEvent} event
     * @returns {Promise<module:resources.Bid>}
     */
    public async processProposalReceivedEvent(event: MarketplaceEvent): Promise<SmsgMessageStatus> {

        const smsgMessage: resources.SmsgMessage = event.smsgMessage;
        const marketplaceMessage: MarketplaceMessage = event.marketplaceMessage;
        const proposalMessage: ProposalMessage = marketplaceMessage.mpaction as ProposalMessage;

        const proposalCreateRequest: ProposalCreateRequest = await this.proposalFactory.getModel(proposalMessage, smsgMessage);

        let proposal: resources.Proposal;

        if (proposalCreateRequest.type === ProposalType.ITEM_VOTE) {
            proposal = await this.processItemVoteProposal(proposalCreateRequest);

        } else { // else (ProposalType.PUBLIC_VOTE)

            const createdProposalModel = await this.proposalService.create(proposalCreateRequest);
            proposal = createdProposalModel.toJSON();

            // finally, create ProposalResult
            const proposalResult: resources.ProposalResult = await this.proposalService.createProposalResult(proposal);
        }


        // this.log.debug('createdProposal:', JSON.stringify(proposal, null, 2));

        return SmsgMessageStatus.PROCESSED;
    }

    /**
     *
     * @param {module:resources.Proposal} proposal
     * @returns {Promise<module:resources.FlaggedItem>}
     */
    public async createFlaggedItemForProposal(proposal: resources.Proposal): Promise<resources.FlaggedItem> {
        // if listingitem exists && theres no relation -> add relation to listingitem

        const listingItemModel = await this.listingItemService.findOneByHash(proposal.title);
        const listingItem: resources.ListingItem = listingItemModel.toJSON();

        const flaggedItemCreateRequest = {
            listing_item_id: listingItem.id,
            proposal_id: proposal.id,
            reason: proposal.description
        } as FlaggedItemCreateRequest;

        const flaggedItemModel: FlaggedItem = await this.flaggedItemService.create(flaggedItemCreateRequest);
        return flaggedItemModel.toJSON();
    }

    /**
     *
     * @param {module:resources.Proposal} createdProposal
     * @param {ItemVote} itemVote
     * @returns {Promise<module:resources.Vote>}
     */
    private async createVote(createdProposal: resources.Proposal, itemVote: ItemVote): Promise<resources.Vote> {

        const proposalOption = _.find(createdProposal.ProposalOptions, (option: resources.ProposalOption) => {
            return option.description === itemVote;
        });

        // this.log.debug('proposalOption:', JSON.stringify(proposalOption, null, 2));

        if (!proposalOption) {
            this.log.warn('ItemVote received that doesn\'t have REMOVE option.');
            throw new MessageException('ItemVote received that doesn\'t have REMOVE option.');
        }

        const voteWeight = 1;
        const voteMessage = await this.voteFactory.getMessage(VoteMessageType.MP_VOTE, createdProposal, proposalOption, createdProposal.submitter);
        const voteRequest = await this.voteFactory.getModel(voteMessage, createdProposal, proposalOption, voteWeight, false);

        const createdVoteModel = await this.voteService.create(voteRequest);
        return createdVoteModel.toJSON();
    }

    private configureEventListeners(): void {
        this.log.info('Configuring EventListeners ');

        this.eventEmitter.on(Events.ProposalReceivedEvent, async (event) => {
            this.log.debug('Received event:', JSON.stringify(event, null, 2));
            await this.processProposalReceivedEvent(event)
                .then(async status => {
                    await this.smsgMessageService.updateSmsgMessageStatus(event.smsgMessage, status);
                })
                .catch(async reason => {
                    this.log.error('PROCESSING ERROR: ', reason);
                    await this.smsgMessageService.updateSmsgMessageStatus(event.smsgMessage, SmsgMessageStatus.PARSING_FAILED);
                });
        });
    }

    /**
     * TODO: naming of this function doesnt make sense
     *
     * @param proposalCreateRequest
     */
    private async processItemVoteProposal(proposalCreateRequest: ProposalCreateRequest): Promise<resources.Proposal> {
        const proposal: resources.Proposal = await this.proposalService.findOneByItemHash(proposalCreateRequest.item)
            .then(async existingProposalModel => {
                // Proposal already exists (for some unexplicable reason), so we use it
                // this same function is called from send() and from processProposalReceivedEvent
                // => if the proposal is yours, it's allready created in send
                const existingProposal: resources.Proposal = existingProposalModel.toJSON();
                if (proposalCreateRequest.postedAt
                    && (proposalCreateRequest.postedAt < existingProposal.postedAt)) {
                    // update to use the one that was sent first
                    // incoming was posted before the existing -> update existing with incoming data
                    // TODO: WTF there should always be just one incoming?
                    // + the one created locally in send should not have postedAt field!!
                    const updatedProposalModel = await this.proposalService.update(existingProposal.id, proposalCreateRequest);
                    return updatedProposalModel.toJSON();
                } else {
                    return existingProposal;
                }
            })
            .catch(async reason => {
                // this.log.debug('processItemVoteProposal(): proposal doesnt exist -> create Proposal');
                // proposal doesnt exist -> create Proposal
                let createdProposalModel = await this.proposalService.create(proposalCreateRequest);
                const createdProposal = createdProposalModel.toJSON();
                // this.log.debug('processItemVoteProposal(), createdProposal:', JSON.stringify(createdProposal, null, 2));

                // also create the FlaggedItem
                const flaggedItem = await this.createFlaggedItemForProposal(createdProposal);
                // this.log.debug('processItemVoteProposal(), flaggedItem:', JSON.stringify(flaggedItem, null, 2));

                createdProposalModel = await this.proposalService.findOne(createdProposal.id);
                return createdProposalModel.toJSON();
            });

        // proposal is now either updated or created...
        // this.log.debug('processItemVoteProposal(), final proposal:', JSON.stringify(proposal, null, 2));

        // finally, create ProposalResult, vote and recalculate proposalresult
        let proposalResult: resources.ProposalResult = await this.proposalResultService.findOneByProposalHash(proposal.hash)
            .then(proposalResultModel => proposalResultModel.toJSON())
            .catch(async reason => {
                const createdProposalResult: resources.ProposalResult = await this.proposalService.createProposalResult(proposal);
                return createdProposalResult;
            });

        const hasVoted: boolean = await this.voteService.findOneByVoterAndProposalId(proposal.submitter, proposal.id)
            .then(vote => true)
            .catch(reason => false);
        if (!hasVoted) {
            const vote: resources.Vote = await this.createVote(proposal, ItemVote.REMOVE);
        }
        proposalResult = await this.proposalService.recalculateProposalResult(proposal);
        return proposal;

    }
}
