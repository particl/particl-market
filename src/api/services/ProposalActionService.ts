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

        return this.smsgService.smsgSend(senderProfile.address, marketplace.address, msg, true, daysRetention, estimateFee);
    }

    /**
     * process received ProposalMessage
     * - create Proposal
     *
     * @param {MarketplaceEvent} event
     * @returns {Promise<module:resources.Bid>}
     */
    public async processProposalReceivedEvent(event: MarketplaceEvent): Promise<SmsgMessageStatus> {

        const smsgMessage: resources.SmsgMessage = event.smsgMessage;
        const marketplaceMessage: MarketplaceMessage = event.marketplaceMessage;
        const proposalMessage: ProposalMessage = marketplaceMessage.mpaction as ProposalMessage;

        // create the proposal
        const proposalCreateRequest = await this.proposalFactory.getModel(proposalMessage);

        const currentBlock = await this.coreRpcService.getBlockCount();
        // TODO: Validation??
        // - sanity check for proposal start/end blocks vs current one

        // TODO: needs to be rewritten

        let proposal: resources.Proposal;
        let proposalResultModel: ProposalResult;
        let proposalResult: resources.ProposalResult;
        let tmpProposalModel: Proposal = await this.proposalService.findOneByItemHash(proposalCreateRequest.item).catch();

        if (tmpProposalModel) {
            proposal = tmpProposalModel.toJSON();
            // We have a proposal for this item already.
            if (proposal.createdAt < smsgMessage.createdAt) {
                try {
                    // This is an older proposal, but for some reaason we received it *after*.
                    // Replace the existing proposal.
                    proposalResultModel = await this.proposalResultService.findOneByProposalHash(proposal.hash);
                    proposalResult = proposalResultModel.toJSON();

                    tmpProposalModel = await this.proposalService.update(proposal.id, proposalCreateRequest);
                    proposal = tmpProposalModel.toJSON();

                    // TODO: this wont work, ProposalResult allready exists
                    proposalResult = await this.createProposalResult(proposal);
                } catch (ex) {
                    this.log.warn(ex);
                    return SmsgMessageStatus.WAITING;
                }
            }
            /* else {
              // This proposal is newer than the existing one, so don't overwrite anything.
              // [this is done after this block] Just register vote, that is,
              //  unless the submitter has already voted on this proposal.
            } */
            proposalResultModel = await this.proposalResultService.findOneByProposalHash(proposal.hash);
            proposalResult = proposalResultModel.toJSON();

        } else {
            try {
                // Completely new proposal, not a duplicate, add it to our database.
                tmpProposalModel = await this.proposalService.create(proposalCreateRequest);
                proposal = tmpProposalModel.toJSON();
            } catch (ex) {
                this.log.warn(ex);
                return SmsgMessageStatus.WAITING;
            }
            proposalResult = await this.createProposalResult(proposal);
        }
        // If the proposal is an ITEM_VOTE,
        // Vote on the proposal, that is, unless the submitter has already voted on this proposal.
        if (proposal.type === ProposalType.ITEM_VOTE) {
            await this.listingItemService.findOneByHash(proposal.item)
                .then(async listingItemModel => {
                    const listingItem = listingItemModel.toJSON();
                    await this.listingItemService.updateProposalRelation(listingItem.id, proposal.hash);

                    // get the market and vote
                    await this.marketService.findByAddress(marketplaceMessage.market || '')
                        .then(async marketModel => {
                            // const market = marketModel.toJSON();
                            // await this.voteForListingItemProposal(proposal, market);
                            let proposalOption: resources.ProposalOption | null = null;
                            for (const i in proposal.ProposalOptions) {
                                if (i) {
                                    const tmpProposalOption = proposal.ProposalOptions[i];
                                    if (tmpProposalOption.description === 'REMOVE') {
                                        proposalOption = tmpProposalOption;
                                    }
                                }
                            }
                            if (!proposalOption) {
                                this.log.warn('ItemVote received that doesn\'t have REMOVE option.');
                                throw new MessageException('ItemVote received that doesn\'t have REMOVE option.');
                            }
                            const voteRequest: VoteCreateRequest = {
                                proposal_option_id: proposalOption.id,
                                voter: proposal.submitter,
                                block: currentBlock,
                                weight: 1
                            } as VoteCreateRequest;
                            const vote = await this.voteService.create(voteRequest);
                            proposalResult = await this.voteActionService.updateProposalResult(proposalResult.id);
                        });
                })
                .catch(reason => {
                    this.log.warn('received Proposal, but theres no ListingItem for it yet...');
                });
        }
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

    /**
     * TODO: duplicate in ListingItemActionService
     *
     * @param {"resources".ProposalResult} proposalResult
     * @returns {Promise<boolean>}
     */
    private async voteForListingItemProposal(proposal: resources.Proposal, market: resources.Market): Promise<boolean> {

        // todo: remove this later
        const profileModel = await this.profileService.getDefault();
        const profile: resources.Profile = profileModel.toJSON();

        const proposalOption = _.find(proposal.ProposalOptions, (option: resources.ProposalOption) => {
            return option.optionId === 1;
        });

        if (proposalOption) {
            const currentBlock: number = await this.coreRpcService.getBlockCount();
            const voteMessage = await this.voteFactory.getMessage(VoteMessageType.MP_VOTE, proposal, proposalOption,
                profile, currentBlock);

            const msg: MarketplaceMessage = {
                version: process.env.MARKETPLACE_VERSION,
                mpaction: voteMessage
            };

            const smsgSendResponse: SmsgSendResponse = await this.smsgService.smsgSend(profile.address, market.address, msg, false);
            return smsgSendResponse.error === undefined ? false : true;
        } else {
            throw new MessageException('Could not find ProposalOption to vote for.');
        }
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
