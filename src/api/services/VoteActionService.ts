import * as Bookshelf from 'bookshelf';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets, Events } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { VoteRepository } from '../repositories/VoteRepository';
import { Vote } from '../models/Vote';
import { VoteCreateRequest } from '../requests/VoteCreateRequest';
import { VoteUpdateRequest } from '../requests/VoteUpdateRequest';

import { SmsgService } from '../services/SmsgService';
import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { ProposalMessage } from '../messages/ProposalMessage';
import { DatabaseException } from '../exceptions/DatabaseException';
import { Profile } from '../models/Profile';
import { Market } from '../models/Market';
import { EventEmitter } from 'events';
import * as resources from 'resources';
import { MarketplaceEvent } from '../messages/MarketplaceEvent';
import { VoteMessageType } from '../enums/VoteMessageType';
import { VoteFactory } from '../factories/VoteFactory';
import { ProposalService } from '../services/ProposalService';
import { ProposalOptionService } from '../services/ProposalOptionService';
import { VoteService } from '../services/VoteService';
import { MessageException } from '../exceptions/MessageException';
import { ObjectHash } from '../../core/helpers/ObjectHash';
import { HashableObjectType } from '../../api/enums/HashableObjectType';

export class VoteActionService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.VoteRepository) public voteRepo: VoteRepository,
        @inject(Types.Factory) @named(Targets.Factory.VoteFactory) private voteFactory: VoteFactory,
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
        @inject(Types.Service) @named(Targets.Service.VoteService) public voteService: VoteService,
        @inject(Types.Service) @named(Targets.Service.ProposalOptionService) public proposalOptionService: ProposalOptionService,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.configureEventListeners();
    }

    @validate()
    public async send( @request(VoteCreateRequest) data: VoteCreateRequest, senderProfile: Profile, marketplace: Market): Promise<Vote> {
        const senderProfileJson = senderProfile.toJSON();
        const marketplaceJson = marketplace.toJSON();

        const voteMessage = await this.voteFactory.getMessage(VoteMessageType.MP_VOTE, [ data ]);
        try {
            const msg: MarketplaceMessage = {
                version: process.env.MARKETPLACE_VERSION,
                mpaction: voteMessage
            } as MarketplaceMessage;
            this.smsgService.smsgSend(senderProfileJson.address, marketplaceJson.address, msg, true);
            return Vote.forge<Vote>(data); // TODO: replace this
        } catch (error) {
            throw new DatabaseException('Could not create the vote!', error);
        }
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

        const createdProposal: Vote = await this.voteService.create(receivedVote);

        return createdProposal;
    }

    private configureEventListeners(): void {
        this.eventEmitter.on(Events.VoteReceivedEvent, async (event) => {
            await this.processVoteReceivedEvent(event);
        });
    }
}
