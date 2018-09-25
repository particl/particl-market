// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import {inject, named} from 'inversify';
import {Logger as LoggerType} from '../../core/Logger';
import {Types, Core, Targets, Events} from '../../constants';
import {Proposal} from '../models/Proposal';
import {ProposalCreateRequest} from '../requests/ProposalCreateRequest';
import {ProposalResultCreateRequest} from '../requests/ProposalResultCreateRequest';
import {ProposalOptionResultCreateRequest} from '../requests/ProposalOptionResultCreateRequest';

import {SmsgService} from './SmsgService';
import {MarketplaceMessage} from '../messages/MarketplaceMessage';
import {EventEmitter} from 'events';
import * as resources from 'resources';
import {MarketplaceEvent} from '../messages/MarketplaceEvent';
import {ProposalMessageType} from '../enums/ProposalMessageType';
import {ProposalFactory} from '../factories/ProposalFactory';
import {ProposalService} from './ProposalService';
import {ProposalResultService} from './ProposalResultService';
import {ProposalOptionResultService} from './ProposalOptionResultService';
import {CoreRpcService} from './CoreRpcService';
import {MessageException} from '../exceptions/MessageException';
import {SmsgSendResponse} from '../responses/SmsgSendResponse';
import {ProposalType} from '../enums/ProposalType';
import {ProposalMessage} from '../messages/ProposalMessage';
import {ListingItemService} from './ListingItemService';
import {MarketService} from './MarketService';
import {VoteMessageType} from '../enums/VoteMessageType';
import {ProfileService} from './ProfileService';
import {VoteFactory} from '../factories/VoteFactory';
import {SmsgMessageStatus} from '../enums/SmsgMessageStatus';
import {SmsgMessageService} from './SmsgMessageService';

import {VoteService} from './VoteService';
import {VoteCreateRequest} from '../requests/VoteCreateRequest';
import {VoteActionService} from './VoteActionService';
import {ProposalResult} from '../models/ProposalResult';
import {ItemVote} from '../enums/ItemVote';

export class ProposalActionService {

    public log: LoggerType;

    constructor(@inject(Types.Factory) @named(Targets.Factory.ProposalFactory) private proposalFactory: ProposalFactory,
                @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
                @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
                @inject(Types.Service) @named(Targets.Service.ListingItemService) public listingItemService: ListingItemService,
                @inject(Types.Service) @named(Targets.Service.MarketService) public marketService: MarketService,
                @inject(Types.Service) @named(Targets.Service.ProposalService) public proposalService: ProposalService,
                @inject(Types.Service) @named(Targets.Service.ProposalResultService) public proposalResultService: ProposalResultService,
                @inject(Types.Service) @named(Targets.Service.ProposalOptionResultService) public proposalOptionResultService: ProposalOptionResultService,
                @inject(Types.Service) @named(Targets.Service.ProfileService) public profileService: ProfileService,
                @inject(Types.Service) @named(Targets.Service.SmsgMessageService) private smsgMessageService: SmsgMessageService,
                @inject(Types.Factory) @named(Targets.Factory.VoteFactory) private voteFactory: VoteFactory,
                @inject(Types.Service) @named(Targets.Service.VoteService) private voteService: VoteService,
                @inject(Types.Service) @named(Targets.Service.VoteActionService) private voteActionService: VoteActionService,
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
                      blockStart: number, blockEnd: number, daysRetention: number, options: string[],
                      senderProfile: resources.Profile, marketplace: resources.Market, itemHash: string | null = null,
                      estimateFee: boolean = false): Promise<SmsgSendResponse> {

        const proposalMessage = await this.proposalFactory.getMessage(
            ProposalMessageType.MP_PROPOSAL_ADD,
            proposalTitle,
            proposalDescription,
            blockStart,
            blockEnd,
            options,
            senderProfile,
            itemHash
        );

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
        let vote: resources.Vote;

        if (proposalCreateRequest.type === ProposalType.ITEM_VOTE) {

            proposal = await this.proposalService.findOneByItemHash(proposalCreateRequest.item)
                .then(async existingProposalModel => {
                    // proposal exists
                    const existingProposal: resources.Proposal = existingProposalModel.toJSON();
                    if (proposalCreateRequest.postedAt < existingProposal.postedAt) { // update to use the one that was sent first
                        // incoming was posted before the existing -> update existing with incoming data
                        const updatedProposalModel = await this.proposalService.update(existingProposal.id, proposalCreateRequest);
                        return updatedProposalModel.toJSON();
                    } else {
                        return existingProposal;
                    }
                })
                .catch(async reason => {
                    // proposal doesnt exist -> create Proposal
                    const createdProposalModel = await this.proposalService.create(proposalCreateRequest);
                    return createdProposalModel.toJSON();
                });

            vote = await this.createVote(proposal, ItemVote.REMOVE);
            // this.log.debug('createdVote:', JSON.stringify(vote, null, 2));

        } else { // else (ProposalType.PUBLIC_VOTE)

            const createdProposalModel = await this.proposalService.create(proposalCreateRequest);
            proposal = createdProposalModel.toJSON();
        }

        // finally, create ProposalResult
        const proposalResult: resources.ProposalResult = await this.createProposalResult(proposal);

        // this.log.debug('createdProposal:', JSON.stringify(proposal, null, 2));
        // this.log.debug('proposalResult:', JSON.stringify(proposalResult, null, 2));

        // if listingitem exists && theres no relation -> add relation to listingitem
        await this.listingItemService.findOneByHash(proposal.title)
            .then(async listingItemModel => {
                const listingItem: resources.ListingItem = listingItemModel.toJSON();
                if (_.isEmpty(listingItem.Proposal)) {
                    await this.listingItemService.updateProposalRelation(listingItem.id, proposal.hash);
                }
            });

        return SmsgMessageStatus.PROCESSED;
    }

    /**
     * creates empty ProposalResult for the Proposal
     *
     * @param {"resources".Proposal} proposal
     * @returns {Promise<"resources".ProposalResult>}
     */
    public async createProposalResult(proposal: resources.Proposal): Promise<resources.ProposalResult> {
        const currentBlock: number = await this.coreRpcService.getBlockCount();

        let proposalResultModel = await this.proposalResultService.create({
            block: currentBlock,
            proposal_id: proposal.id
        } as ProposalResultCreateRequest);
        const proposalResult = proposalResultModel.toJSON();

        // this.log.debug('proposalResult: ', JSON.stringify(proposalResult));

        const proposalOptions: any = proposal.ProposalOptions;
        for (const proposalOption of proposalOptions) {
            const proposalOptionResult = await this.proposalOptionResultService.create({
                weight: 0,
                voters: 0,
                proposal_option_id: proposalOption.id,
                proposal_result_id: proposalResult.id
            } as ProposalOptionResultCreateRequest);
            // this.log.debug('processProposalReceivedEvent.proposalOptionResult = ' + JSON.stringify(proposalOptionResult, null, 2));
        }

        proposalResultModel = await this.proposalResultService.findOne(proposalResult.id);
        return proposalResultModel.toJSON();
    }

    private async createVote(createdProposal: resources.Proposal, itemVote: ItemVote): Promise<resources.Vote> {

        const currentBlock = await this.coreRpcService.getBlockCount();

        // after creating, updating or fetching existing proposal -> add vote
        const proposalOption = _.find(createdProposal.ProposalOptions, (option: resources.ProposalOption) => {
            return option.description === itemVote;
        });

        if (!proposalOption) {
            this.log.warn('ItemVote received that doesn\'t have REMOVE option.');
            throw new MessageException('ItemVote received that doesn\'t have REMOVE option.');
        }

        const voteRequest: VoteCreateRequest = {
            proposal_option_id: proposalOption.id,
            voter: createdProposal.submitter,
            block: currentBlock,
            weight: 1
        } as VoteCreateRequest;
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

}
