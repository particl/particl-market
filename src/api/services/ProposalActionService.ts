import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets, Events } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { ProposalRepository } from '../repositories/ProposalRepository';
import { Proposal } from '../models/Proposal';
import { ProposalCreateRequest } from '../requests/ProposalCreateRequest';
import { ProposalUpdateRequest } from '../requests/ProposalUpdateRequest';

import { SmsgService } from '../services/SmsgService';
import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { ProposalMessage } from '../messages/ProposalMessage';
import { DatabaseException } from '../exceptions/DatabaseException';
import { Profile } from '../models/Profile';
import { Market } from '../models/Market';
import { EventEmitter } from 'events';
import * as resources from 'resources';
import { MarketplaceEvent } from '../messages/MarketplaceEvent';
import { ProposalMessageType } from '../enums/ProposalMessageType';
import { ProposalFactory } from '../factories/ProposalFactory';

export class ProposalActionService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.ProposalRepository) public proposalRepo: ProposalRepository,
         @inject(Types.Factory) @named(Targets.Factory.ProposalFactory) private proposalFactory: ProposalFactory,
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.configureEventListeners();
    }

    @validate()
    public async send( @request(ProposalCreateRequest) data: ProposalCreateRequest, senderProfile: Profile, marketplace: Market): Promise<Proposal> {
        const senderProfileJson = senderProfile.toJSON();
        const marketplaceJson = marketplace.toJSON();

        const proposalMessage = await this.proposalFactory.getMessage(ProposalMessageType.MP_PROPOSAL_ADD, [ data ]);
        try {
            const msg: MarketplaceMessage = {
                version: process.env.MARKETPLACE_VERSION,
                mpaction: proposalMessage
            } as MarketplaceMessage;
            this.smsgService.smsgSend(senderProfileJson.address, marketplaceJson.address, msg, true);
            return Proposal.forge<Proposal>(data); // TODO: replace this
        } catch (error) {
            throw new DatabaseException('Could not create the proposal!', error);
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
    public async processProposalReceivedEvent(event: MarketplaceEvent): Promise<resources.Proposal> {
        this.log.debug('processProposalReceivedEvent, event= ' + JSON.stringify(event, null, 2));
        return {} as resources.Proposal;
    }

    private configureEventListeners(): void {
        this.eventEmitter.on(Events.ProposalReceivedEvent, async (event) => {
            await this.processProposalReceivedEvent(event);
        });
    }
}
