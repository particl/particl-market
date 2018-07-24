import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets, Events } from '../../constants';
import { VoteRepository } from '../repositories/VoteRepository';
import { Vote } from '../models/Vote';
import { VoteCreateRequest } from '../requests/VoteCreateRequest';
import { SmsgService } from './SmsgService';
import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { EventEmitter } from 'events';
import * as resources from 'resources';
import { MarketplaceEvent } from '../messages/MarketplaceEvent';
import { VoteFactory } from '../factories/VoteFactory';
import { VoteService } from './VoteService';
import { SmsgSendResponse } from '../responses/SmsgSendResponse';
import { VoteMessageType } from '../enums/VoteMessageType';
import { CoreRpcService } from './CoreRpcService';
import { MessageException } from '../exceptions/MessageException';
import { VoteMessage } from '../messages/VoteMessage';
import { ProposalService } from './ProposalService';
import { VoteUpdateRequest } from '../requests/VoteUpdateRequest';
import { ProposalResultService } from './ProposalResultService';
import { ProposalResultUpdateRequest } from '../requests/ProposalResultUpdateRequest';
import { ProposalOptionResultUpdateRequest } from '../requests/ProposalOptionResultUpdateRequest';
import { ProposalOptionService } from './ProposalOptionService';
import { ProposalOptionResultService } from './ProposalOptionResultService';

export class VoteActionService {

    public log: LoggerType;

    constructor(
        @inject(Types.Factory) @named(Targets.Factory.VoteFactory) private voteFactory: VoteFactory,
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Service) @named(Targets.Service.ProposalService) public proposalService: ProposalService,
        @inject(Types.Service) @named(Targets.Service.ProposalOptionService) public proposalOptionService: ProposalOptionService,
        @inject(Types.Service) @named(Targets.Service.ProposalResultService) public proposalResultService: ProposalResultService,
        @inject(Types.Service) @named(Targets.Service.ProposalOptionResultService) public proposalOptionResultService: ProposalOptionResultService,
        @inject(Types.Service) @named(Targets.Service.VoteService) public voteService: VoteService,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.configureEventListeners();
    }

    /**
     * 
     * @param {"resources".Proposal} proposal
     * @param {"resources".ProposalOption} proposalOption
     * @param {"resources".Profile} senderProfile
     * @param {"resources".Market} marketplace
     * @returns {Promise<SmsgSendResponse>}
     */
    public async send( proposal: resources.Proposal, proposalOption: resources.ProposalOption,
                       senderProfile: resources.Profile, marketplace: resources.Market): Promise<SmsgSendResponse> {

        const currentBlock: number = await this.coreRpcService.getBlockCount();
        const voteMessage = await this.voteFactory.getMessage(VoteMessageType.MP_VOTE, proposal, proposalOption,
            senderProfile, currentBlock);

        const msg: MarketplaceMessage = {
            version: process.env.MARKETPLACE_VERSION,
            mpaction: voteMessage
        };

        return this.smsgService.smsgSend(senderProfile.address, marketplace.address, msg, false);
    }

    /**
     * process received VoteMessage
     * - save ActionMessage
     * - create Proposal
     *
     * @param {MarketplaceEvent} event
     * @returns {Promise<module:resources.Bid>}
     */
    public async processVoteReceivedEvent(event: MarketplaceEvent): Promise<resources.Vote> {

        this.log.debug('Received event:', event);

        event.smsgMessage.received = new Date().toISOString();

        const message = event.marketplaceMessage;
        if (!message.mpaction || !message.mpaction.item) {   // ACTIONEVENT
            throw new MessageException('Missing mpaction.');
        }

        const voteMessage: VoteMessage = event.marketplaceMessage.mpaction as VoteMessage;
        if (voteMessage.voter !== event.smsgMessage.from) {
            throw new MessageException('Voter does not match with sender.');
        }
        // TODO: Validation??

        // get proposal and ignore vote if we're past the final block of the proposal
        const proposalModel = await this.proposalService.findOneByHash(voteMessage.proposalHash);
        const proposal: resources.Proposal = proposalModel.toJSON();

        const currentBlock: number = await this.coreRpcService.getBlockCount();

        if (voteMessage && proposal.blockEnd >= currentBlock) {
            const createdVote = await this.createOrUpdateVote(voteMessage, proposal, currentBlock, 1);
            this.log.debug('createdVote:', JSON.stringify(createdVote, null, 2));

            const proposalResult: resources.ProposalResult = await this.updateProposalResult(proposal.ProposalResult.id);
            // TODO: do whatever else needs to be done

            // todo: return ActionMessages from all actionservice.process functions
            return createdVote;
        } else {
            throw new MessageException('Missing VoteMessage');
        }
    }

    /**
     *
     * @param {number} proposalResultId
     * @returns {Promise<"resources".ProposalResult>}
     */
    private async updateProposalResult(proposalResultId: number): Promise<resources.ProposalResult> {

        const currentBlock: number = await this.coreRpcService.getBlockCount();

        // get the proposal
        // const proposalModel = await this.proposalService.findOne(proposalId);
        // const proposal = proposalModel.toJSON();

        let proposalResultModel = await this.proposalResultService.findOne(proposalResultId);
        let proposalResult = proposalResultModel.toJSON();

        // first update the block in ProposalResult
        proposalResultModel = await this.proposalResultService.update(proposalResult.id, {
            block: currentBlock
        } as ProposalResultUpdateRequest);
        proposalResult = proposalResultModel.toJSON();

        // then loop through ProposalOptionResults and update values
        for (const proposalOptionResult of proposalResult.ProposalOptionResults) {
            // get the votes
            const proposalOptionModel = await this.proposalOptionService.findOne(proposalOptionResult.ProposalOption.id);
            const proposalOption = proposalOptionModel.toJSON();

            // update
            this.proposalOptionResultService.update(proposalOptionResult.id, {
                weight: proposalOption.Votes.length,
                voters: proposalOption.Votes.length
            } as ProposalOptionResultUpdateRequest);
        }

        proposalResultModel = await this.proposalResultService.findOne(proposalResult.id);
        return proposalResultModel.toJSON();
    }

    /**
     *
     * @param {VoteMessage} voteMessage
     * @param {"resources".Proposal} proposal
     * @param {number} currentBlock
     * @param {number} weight
     * @returns {Promise<"resources".Vote>}
     */
    private async createOrUpdateVote(voteMessage: VoteMessage, proposal: resources.Proposal, currentBlock: number,
                                     weight: number): Promise<resources.Vote> {

        const lastVoteModel = await this.voteService.findOneByVoterAndProposal(voteMessage.voter, proposal.id);
        const lastVote: resources.Vote = lastVoteModel.toJSON();
        const create: boolean = lastVote == null;

        // create a vote
        const voteRequest = await this.voteFactory.getModel(voteMessage, proposal, currentBlock, weight, create);

        let voteModel;
        if (create) {
            voteModel = await this.voteService.create(voteRequest as VoteCreateRequest);
        } else {
            voteModel = await this.voteService.update(lastVote.id, voteRequest as VoteUpdateRequest);
        }
        const vote = voteModel.toJSON();
        return vote;
    }

    private configureEventListeners(): void {
        this.eventEmitter.on(Events.VoteReceivedEvent, async (event) => {
            await this.processVoteReceivedEvent(event);
        });
    }
}
