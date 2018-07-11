import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { ProposalRepository } from '../repositories/ProposalRepository';
import { Proposal } from '../models/Proposal';
import { ProposalCreateRequest } from '../requests/ProposalCreateRequest';
import { ProposalUpdateRequest } from '../requests/ProposalUpdateRequest';

import { SmsgService } from '../services/SmsgService';
import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { DatabaseException } from '../exceptions/DatabaseException';
import { Profile } from '../models/Profile';
import { Market } from '../models/Market';

export class ProposalActionService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.ProposalRepository) public proposalRepo: ProposalRepository,
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    @validate()
    public async send( @request(ProposalCreateRequest) data: ProposalCreateRequest, senderProfile: Profile, marketplace: Market): Promise<Proposal> {
        const senderProfileJson = senderProfile.toJSON();
        const marketplaceJson = marketplace.toJSON();
        try {
            const msg: MarketplaceMessage = {

            } as MarketplaceMessage;
            this.smsgService.smsgSend(senderProfileJson.address, marketplaceJson.address, msg, true);
            return Proposal.forge<Proposal>(data); // TODO: replace this
        } catch (error) {
            throw new DatabaseException('Could not create the proposal!', error);
        }
    }
}