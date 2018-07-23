import * as Bookshelf from 'bookshelf';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets, Events } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { ProposalRepository } from '../repositories/ProposalRepository';
import { Proposal } from '../models/Proposal';
import { ProposalCreateRequest } from '../requests/ProposalCreateRequest';
import { ProposalUpdateRequest } from '../requests/ProposalUpdateRequest';
import { ProposalResultCreateRequest } from '../requests/ProposalResultCreateRequest';
import { ProposalOptionResultCreateRequest } from '../requests/ProposalOptionResultCreateRequest';

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
import { ProposalService } from '../services/ProposalService';
import { ProposalOptionService } from '../services/ProposalOptionService';
import { VoteService } from '../services/VoteService';
import { ProposalResultService } from '../services/ProposalResultService';
import { ProposalOptionResultService } from '../services/ProposalOptionResultService';
import { CoreRpcService } from '../services/CoreRpcService';
import { MessageException } from '../exceptions/MessageException';
import { ObjectHash } from '../../core/helpers/ObjectHash';
import { HashableObjectType } from '../../api/enums/HashableObjectType';
import {SmsgSendResponse} from '../responses/SmsgSendResponse';
import {ProposalType} from '../enums/ProposalType';

export class ProposalActionService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.ProposalRepository) public proposalRepo: ProposalRepository,
        @inject(Types.Factory) @named(Targets.Factory.ProposalFactory) private proposalFactory: ProposalFactory,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
        @inject(Types.Service) @named(Targets.Service.ProposalService) public proposalService: ProposalService,
        @inject(Types.Service) @named(Targets.Service.ProposalOptionService) public proposalOptionService: ProposalOptionService,
        @inject(Types.Service) @named(Targets.Service.ProposalResultService) public proposalResultService: ProposalResultService,
        @inject(Types.Service) @named(Targets.Service.VoteService) public voteService: VoteService,
        @inject(Types.Service) @named(Targets.Service.ProposalOptionResultService) public proposalOptionResultService: ProposalOptionResultService,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
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
     * @param {string[]} options
     * @param {"resources".Profile} senderProfile
     * @param {"resources".Market} marketplace
     * @returns {Promise<SmsgSendResponse>}
     */
    public async send(proposalType: ProposalType, proposalTitle: string, proposalDescription: string, blockStart: number, blockEnd: number,
                      options: string[], senderProfile: resources.Profile, marketplace: resources.Market): Promise<SmsgSendResponse> {

        const proposalMessage = await this.proposalFactory.getMessage(ProposalMessageType.MP_PROPOSAL_ADD, proposalType,
            proposalTitle, proposalDescription, blockStart, blockEnd, options, senderProfile);

        const msg: MarketplaceMessage = {
            version: process.env.MARKETPLACE_VERSION,
            mpaction: proposalMessage
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
    public async processProposalReceivedEvent(event: MarketplaceEvent): Promise<Proposal> {
        const receivedMpaction: any = event.marketplaceMessage.mpaction;
        const receivedProposals: any = receivedMpaction.objects;
        const receivedProposal: ProposalCreateRequest = receivedProposals[0];
        const receivedProposalHash = receivedProposal.hash;
        delete receivedProposal.hash;
        const receivedProposalRealHash = ObjectHash.getHash(receivedProposal, HashableObjectType.PROPOSAL_CREATEREQUEST, false);
        if (receivedProposalHash !== receivedProposalRealHash) {
            throw new MessageException(`Received proposal hash <${receivedProposalHash}> doesn't match actual hash <${receivedProposalRealHash}>.`);
        }

        const createdProposal: Proposal = await this.proposalService.create(receivedProposal);

        /*
         * Set up the proposal result stuff for later.
         */
        const blockCount = this.coreRpcService.getblockcount();
        this.log.debug('processProposalReceivedEvent.blockCount = ' + JSON.stringify(blockCount, null, 2));
        const currentBlock = 1; // TODO: get actual current block

        const proposalResult = await this.proposalResultService.create({
            block: currentBlock,
            proposalId: createdProposal.id
        } as ProposalResultCreateRequest);
        this.log.debug('processProposalReceivedEvent.proposalResult = ' + JSON.stringify(proposalResult, null, 2));

        const options: any = createdProposal.ProposalOptions;
        for (let option of options) {
            const votes = await this.voteService.findForOption(option.id);
            const proposalOptionResult = this.proposalOptionResultService.create({
                weight: votes.length,
                proposalOptionId: option.id,
                proposalResultId: proposalResult.id
            } as ProposalOptionResultCreateRequest);
            this.log.debug('processProposalReceivedEvent.proposalOptionResult = ' + JSON.stringify(proposalOptionResult, null, 2));
        }

        return createdProposal;
    }

    private configureEventListeners(): void {
        this.eventEmitter.on(Events.ProposalReceivedEvent, async (event) => {
            await this.processProposalReceivedEvent(event);
        });
    }
}
