// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
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
import { Profile } from '../models/Profile';
import { MarketService } from './MarketService';
import { VoteActionService } from './VoteActionService';
import { ProposalOptionService } from './ProposalOptionService';
import { VoteCreateRequest } from '../requests/VoteCreateRequest';
import { ProposalUpdateRequest } from '../requests/ProposalUpdateRequest';
import { Proposal } from '../models/Proposal';

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
                @inject(Types.Service) @named(Targets.Service.MarketService) private marketService: MarketService,
                @inject(Types.Service) @named(Targets.Service.VoteActionService) private voteActionService: VoteActionService,
                @inject(Types.Service) @named(Targets.Service.ProposalOptionService) private proposalOptionService: ProposalOptionService,
                @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter,
                @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType) {
        this.log = new Logger(__filename);
        this.configureEventListeners();
    }

    /**
     * creates ProposalMessage (of type MP_PROPOSAL_ADD) and post it
     *
     * - send():
     *   - create ProposalMessage
     *   - processProposal(), creates the Proposal locally
     *   - post ProposalMessage
     *   - if ProposalType.ITEM_VOTE:
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
            ProposalMessageType.MP_PROPOSAL_ADD,
            proposalTitle,
            proposalDescription,
            options,
            senderProfile,
            itemHash
        );

        const msg: MarketplaceMessage = {
            version: process.env.MARKETPLACE_VERSION,
            mpaction: proposalMessage
        };

        // if were here to estimate the fee, then do it now.
        const paidMessage = proposalMessage.type === ProposalType.PUBLIC_VOTE;
        if (estimateFee) {
            return await this.smsgService.smsgSend(senderProfile.address, marketplace.address, msg, paidMessage, daysRetention, estimateFee);
        }

        // first we create a ProposalCreateRequest with no smsgMessage data.
        // later, when the smsgMessage for this proposal is received,
        // the relevant smsgMessage data will be updated
        const proposalCreateRequest: ProposalCreateRequest = await this.proposalFactory.getModel(proposalMessage);

        // processProposal "processes" the Proposal, creating or updating the Proposal.
        // called from send() and processProposalReceivedEvent()
        const proposal: resources.Proposal = await this.processProposal(proposalCreateRequest);

        // proposal is processed, so we can now send it
        const result = await this.smsgService.smsgSend(senderProfile.address, marketplace.address, msg, paidMessage, daysRetention, estimateFee);

        if (ProposalType.ITEM_VOTE === proposalCreateRequest.type) {
            // if the Proposal is of type ITEM_VOTE, we also need to send votes for the ListingItems removal
            const proposalOption: resources.ProposalOption | undefined = _.find(proposal.ProposalOptions, (o: resources.ProposalOption) => {
                return o.description === ItemVote.REMOVE.toString();
            });
            if (!proposalOption) {
                this.log.debug('ProposalOption ' + ItemVote.REMOVE.toString() + ' not found.');
                throw new MessageException('ProposalOption ' + ItemVote.REMOVE.toString() + ' not found.');
            }

            // vote sends the VoteMessages from each of senderProfiles addresses
            await this.voteActionService.vote(senderProfile, marketplace, proposal, proposalOption);

            // ProposalResult will be calculated after votes have been sent...
        }

        if (proposalCreateRequest.type !== ProposalType.ITEM_VOTE
            && proposalCreateRequest.type !== ProposalType.PUBLIC_VOTE) {
            throw new MessageException(`Unknown type of proposal = ${proposalCreateRequest.type}.`);
        }

        return result;
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
     *          add relation to listing
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

        let weAreTheProposer = false;
        const profilesCollection: Bookshelf.Collection<Profile> = await this.profileService.findAll();
        const profiles: resources.Profile[] = profilesCollection.toJSON();
        for (const profile of profiles) {
            if (profile.address === proposalMessage.submitter) {
                this.log.debug(`profile.Address (${profile.address}) === proposalMessage.submitter (${proposalMessage.submitter})`);
                weAreTheProposer = true;
                break;
            }
        }

        if (weAreTheProposer) {
            this.log.debug('This proposal should have already been created locally. Skipping.');
        } else {
            let proposal: resources.Proposal;
            if (proposalCreateRequest.type === ProposalType.ITEM_VOTE) {
                /*
                 * If proposal was created locally, just retreive it.
                 */
                 const tmpProposal = await this.proposalService.findOneByHash(proposalCreateRequest.hash);
                 proposal = tmpProposal.toJSON();
                 if (!proposal) {
                     this.log.error('processProposalReceivedEvent(): Proposal not found.');
                     throw new MessageException('processProposalReceivedEvent(): Proposal not found.');
                 }
            } else { // else (ProposalType.PUBLIC_VOTE)
                // Create the proposal
                const createdProposalModel = await this.proposalService.create(proposalCreateRequest);
                proposal = createdProposalModel.toJSON();
            }
            // finally, create ProposalResult, vote and recalculate proposalresult
            let proposalResult: any = this.proposalResultService.findOneByProposalHash(proposal.hash);
            if (!proposalResult) {
                proposalResult = await this.proposalService.createFirstProposalResult(proposal);
            }
            proposalResult = await this.proposalService.recalculateProposalResult(proposal);

            // this.log.debug('createdProposal:', JSON.stringify(proposal, null, 2));
            return SmsgMessageStatus.PROCESSED;
        }
        return SmsgMessageStatus.PROCESSED;
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
     *   - createFirstProposalResult(proposal), make sure empty ProposalResult is created/exists
     *   - if ProposalType.ITEM_VOTE:
     *     - create the FlaggedItem if not created yet
     *
     * @param proposalRequest
     */
    private async processProposal(proposalRequest: ProposalCreateRequest | ProposalUpdateRequest): Promise<resources.Proposal> {

        const proposalModel: Proposal = await this.proposalService.findOneByItemHash(proposalRequest.item)
            .catch(async reason => {
                // proposal doesnt exist yet, so we need to create it.
                const createdProposalModel = await this.proposalService.create(proposalRequest);
                const createdProposal: resources.Proposal = createdProposalModel.toJSON();
                // this.log.debug('processProposal(), createdProposal:', JSON.stringify(createdProposal, null, 2));

                if (ProposalType.ITEM_VOTE === createdProposal.type) {
                    // in case of ITEM_VOTE, we also need to create the FlaggedItem
                    await this.createFlaggedItemForProposal(createdProposal);
                }

                // create the first ProposalResult
                await this.proposalService.createFirstProposalResult(createdProposal);
                return await this.proposalService.findOne(createdProposal.id);
            });

        let proposal: resources.Proposal = proposalModel.toJSON();
        if (proposalRequest.postedAt !== Number.MAX_SAFE_INTEGER && (proposalRequest.postedAt < proposal.postedAt)) {
            // means processProposal was called from processProposalReceivedEvent() and we should update the Proposal data
            const updatedProposalModel = await this.proposalService.update(proposal.id, proposalRequest);
            proposal = updatedProposalModel.toJSON();
        } else {
            // called from send(), we already saved the Proposal so nothing needs to be done
        }

        return proposal;
    }

}
