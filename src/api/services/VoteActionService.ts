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

export class VoteActionService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.VoteRepository) public voteRepo: VoteRepository,
        @inject(Types.Factory) @named(Targets.Factory.VoteFactory) private voteFactory: VoteFactory,
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
        @inject(Types.Service) @named(Targets.Service.VoteService) public voteService: VoteService,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.configureEventListeners();
    }

    public async send( proposal: resources.Proposal, proposalOption: resources.ProposalOption,
                       senderProfile: resources.Profile, marketplace: resources.Market): Promise<SmsgSendResponse> {

        // TODO: create proper VoteMessage
        // TODO: then implement the factory method to create the message
        // const voteMessage = await this.voteFactory.getMessage(VoteMessageType.MP_VOTE, [ data ]);

        const msg: MarketplaceMessage = {
            version: process.env.MARKETPLACE_VERSION,
            mpaction: {} // voteMessage
        } as MarketplaceMessage;

        return this.smsgService.smsgSend(senderProfile.address, marketplace.address, msg, true);

    }

    /**
     * process received ProposalMessage
     * - save ActionMessage
     * - create Proposal
     *
     * @param {MarketplaceEvent} event
     * @returns {Promise<module:resources.Bid>}
     */
    public async processVoteReceivedEvent(event: MarketplaceEvent): Promise<Vote> {
        const receivedMpaction: any = event.marketplaceMessage.mpaction;
        const receivedVotes: VoteCreateRequest[] = receivedMpaction.objects;
        const receivedVote: VoteCreateRequest = receivedVotes[0];

        // TODO: Validation, if needed

        // TODO: Ignore vote if we're past the final block of the proposal

        const createdProposal: Vote = await this.voteService.create(receivedVote);

        /*
         * TODO: Update the proposal result stuff.
         */

        return createdProposal;
    }

    private configureEventListeners(): void {
        this.eventEmitter.on(Events.VoteReceivedEvent, async (event) => {
            await this.processVoteReceivedEvent(event);
        });
    }
}
