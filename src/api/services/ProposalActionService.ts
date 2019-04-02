// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named} from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets, Events } from '../../constants';
import { ProposalCreateRequest } from '../requests/ProposalCreateRequest';
import { SmsgService } from './SmsgService';
import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { EventEmitter } from 'events';
import { MarketplaceEvent } from '../messages/MarketplaceEvent';
import { ProposalFactory } from '../factories/ProposalFactory';
import { ProposalService } from './ProposalService';
import { MessageException } from '../exceptions/MessageException';
import { SmsgSendResponse } from '../responses/SmsgSendResponse';
import { ProposalCategory } from '../enums/ProposalCategory';
import { ProposalMessage } from '../messages/actions/ProposalMessage';
import { ListingItemService } from './ListingItemService';
import { SmsgMessageStatus } from '../enums/SmsgMessageStatus';
import { SmsgMessageService } from './SmsgMessageService';
import { ItemVote } from '../enums/ItemVote';
import { FlaggedItemService } from './FlaggedItemService';
import { FlaggedItemCreateRequest } from '../requests/FlaggedItemCreateRequest';
import { FlaggedItem } from '../models/FlaggedItem';
import { VoteActionService } from './VoteActionService';
import { Proposal } from '../models/Proposal';
import { ompVersion } from 'omp-lib/dist/omp';
import { GovernanceAction } from '../enums/GovernanceAction';

export class ProposalActionService {

    public log: LoggerType;

    constructor(@inject(Types.Factory) @named(Targets.Factory.ProposalFactory) private proposalFactory: ProposalFactory,
                @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
                @inject(Types.Service) @named(Targets.Service.ListingItemService) public listingItemService: ListingItemService,
                @inject(Types.Service) @named(Targets.Service.ProposalService) public proposalService: ProposalService,
                @inject(Types.Service) @named(Targets.Service.SmsgMessageService) private smsgMessageService: SmsgMessageService,
                @inject(Types.Service) @named(Targets.Service.FlaggedItemService) private flaggedItemService: FlaggedItemService,
                @inject(Types.Service) @named(Targets.Service.VoteActionService) private voteActionService: VoteActionService,
                @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter,
                @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType) {
        this.log = new Logger(__filename);
        this.configureEventListeners();
    }

    /**
     * creates ProposalMessage (of category MP_PROPOSAL_ADD) and post it
     *
     * - send():
     *   - create ProposalMessage
     *   - processProposal(), creates the Proposal locally
     *   - post ProposalMessage
     *   - if ProposalCategory.ITEM_VOTE:
     *     - post the votes, voteActionService.vote( profile )
     *
     * @param {string} proposalTitle
     * @param {string} proposalDescription
     * @param {number} daysRetention
     * @param {string[]} options
     * @param {"resources".Profile} senderProfile
     * @param {"resources".Market} marketplace
     * @param {string} itemHash
     * @param {boolean} estimateFee
     * @returns {Promise<SmsgSendResponse>}
     */
    public async send(proposalTitle: string, proposalDescription: string, daysRetention: number, options: string[],
                      senderProfile: resources.Profile, marketplace: resources.Market, itemHash?: string | undefined,
                      estimateFee: boolean = false): Promise<SmsgSendResponse> {

        const proposalMessage = await this.proposalFactory.getMessage(
            GovernanceAction.MP_PROPOSAL_ADD,
            proposalTitle,
            proposalDescription,
            options,
            senderProfile,
            itemHash
        );

        const msg = {
            version: ompVersion(),
            mpaction: proposalMessage
        } as MarketplaceMessage;

        // if were here to estimate the fee, then do it now.
        const paidMessage = proposalMessage.category === ProposalCategory.PUBLIC_VOTE;
        if (estimateFee) {
            return await this.smsgService.smsgSend(senderProfile.address, marketplace.address, msg, paidMessage, daysRetention, estimateFee);
        }

        // processProposal "processes" the Proposal, creating or updating the Proposal.
        // called from send() and processProposalReceivedEvent()
        const proposal: resources.Proposal = await this.processProposal(proposalMessage);

        // proposal is processed, so we can now send it
        const result = await this.smsgService.smsgSend(senderProfile.address, marketplace.address, msg, paidMessage, daysRetention, estimateFee);

        if (ProposalCategory.ITEM_VOTE === proposal.category) {
            // if the Proposal is of category ITEM_VOTE, we also need to send votes for the ListingItems removal
            const proposalOption: resources.ProposalOption | undefined = _.find(proposal.ProposalOptions, (o: resources.ProposalOption) => {
                return o.description === ItemVote.REMOVE.toString();
            });
            if (!proposalOption) {
                this.log.debug('ProposalOption ' + ItemVote.REMOVE.toString() + ' not found.');
                throw new MessageException('ProposalOption ' + ItemVote.REMOVE.toString() + ' not found.');
            }

            // send the VoteMessages from each of senderProfiles addresses
            const smsgSendResponse = await this.voteActionService.vote(senderProfile, marketplace, proposal, proposalOption);
            result.msgids = smsgSendResponse.msgids;
            // ProposalResult will be calculated after votes have been sent...
        }

        return result;
    }

    /**
     * process received ProposalMessage:
     *   - this.processProposal()
     *   - don't create votes, votes are created when they arrive
     *   - flaggeditem and initial ProposalResult are created in processProposal
     *
     * @param {MarketplaceEvent} event
     * @returns {Promise<module:resources.Bid>}
     */
    public async processProposalReceivedEvent(event: MarketplaceEvent): Promise<SmsgMessageStatus> {
        const smsgMessage: resources.SmsgMessage = event.smsgMessage;
        const marketplaceMessage: MarketplaceMessage = event.marketplaceMessage;
        const proposalMessage: ProposalMessage = marketplaceMessage.mpaction as ProposalMessage;

        // processProposal will create or update the Proposal
        return await this.processProposal(proposalMessage, smsgMessage)
            .then(value => {
                this.log.debug('==> PROCESSED PROPOSAL: ', value.hash);
                return SmsgMessageStatus.PROCESSED;
            })
            .catch(reason => {
                this.log.debug('==> PROPOSAL PROCESSING FAILED: ', reason);
                return SmsgMessageStatus.PROCESSING_FAILED;
            });
    }

    /**
     *
     * @param proposal
     */
    public async createFlaggedItemForProposal(proposal: resources.Proposal): Promise<resources.FlaggedItem> {
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
     * processProposal "processes" the Proposal, creating or updating the Proposal.
     * called from send() and processProposalReceivedEvent(), meaning before the ProposalMessage is sent
     * and after the ProposalMessage is received.
     *
     * - private processProposal():
     *   - save/update proposal locally (update: add the fields from smsgmessage)
     *   - createEmptyProposalResult(proposal), make sure empty ProposalResult is created/exists
     *   - if ProposalCategory.ITEM_VOTE:
     *     - create the FlaggedItem if not created yet
     *
     * @param proposalMessage
     * @param smsgMessage
     */
    private async processProposal(proposalMessage: ProposalMessage, smsgMessage?: resources.SmsgMessage): Promise<resources.Proposal> {

        // when called from send() we create a ProposalCreateRequest with no smsgMessage data.
        // later, when the smsgMessage for this proposal is received,
        // the relevant smsgMessage data will be updated and included in the request
        const proposalRequest: ProposalCreateRequest = await this.proposalFactory.getModel(proposalMessage, smsgMessage);
        const proposalModel: Proposal = await this.proposalService.findOneByHash(proposalRequest.hash)
            .catch(async reason => {
                // proposal doesnt exist yet, so we need to create it.
                const createdProposal: resources.Proposal = await this.proposalService.create(proposalRequest)
                    .then(value => value.toJSON());

                if (ProposalCategory.ITEM_VOTE === createdProposal.category) {
                    // in case of ITEM_VOTE, we also need to create the FlaggedItem
                    const flaggedItem: resources.FlaggedItem = await this.createFlaggedItemForProposal(createdProposal);
                    // this.log.debug('processProposal(), flaggedItem:', JSON.stringify(flaggedItem, null, 2));
                }

                // create the first ProposalResult
                await this.proposalService.createEmptyProposalResult(createdProposal);
                return await this.proposalService.findOne(createdProposal.id);
            });

        let proposal: resources.Proposal = proposalModel.toJSON();

        // this.log.debug('processProposal(), proposalRequest.postedAt: ', proposalRequest.postedAt);
        // this.log.debug('processProposal(), Number.MAX_SAFE_INTEGER: ', Number.MAX_SAFE_INTEGER);
        if (proposalRequest.postedAt !== Number.MAX_SAFE_INTEGER/*|| (proposalRequest.postedAt < proposal.postedAt)*/) {
            // means processProposal was called from processProposalReceivedEvent() and we should update the Proposal data
            const updatedProposalModel = await this.proposalService.update(proposal.id, proposalRequest);
            proposal = updatedProposalModel.toJSON();
            // this.log.debug('processProposal(), proposal updated');
        } else {
            // called from send(), we already created the Proposal so nothing needs to be done
        }

        // this.log.debug('processProposal(), proposal:', JSON.stringify(proposal, null, 2));
        return proposal;
    }

}
