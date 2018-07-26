import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets, Events } from '../../constants';
import { Proposal } from '../models/Proposal';
import { ProposalCreateRequest } from '../requests/ProposalCreateRequest';
import { ProposalResultCreateRequest } from '../requests/ProposalResultCreateRequest';
import { ProposalOptionResultCreateRequest } from '../requests/ProposalOptionResultCreateRequest';

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
import { ObjectHash } from '../../core/helpers/ObjectHash';
import { HashableObjectType } from '../enums/HashableObjectType';
import {SmsgSendResponse} from '../responses/SmsgSendResponse';
import {ProposalType} from '../enums/ProposalType';
import {ProposalMessage} from '../messages/ProposalMessage';

export class ProposalActionService {

    public log: LoggerType;

    constructor(
        @inject(Types.Factory) @named(Targets.Factory.ProposalFactory) private proposalFactory: ProposalFactory,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
        @inject(Types.Service) @named(Targets.Service.ProposalService) public proposalService: ProposalService,
        @inject(Types.Service) @named(Targets.Service.ProposalResultService) public proposalResultService: ProposalResultService,
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
        };

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
    public async processProposalReceivedEvent(event: MarketplaceEvent): Promise<resources.Proposal> {

        this.log.debug('Received event:', event);

        const message = event.marketplaceMessage;
        if (!message.mpaction) {
            throw new MessageException('Missing mpaction.');
        }

        const proposalMessage: ProposalMessage = event.marketplaceMessage.mpaction as ProposalMessage;

        // create the proposal
        const proposalCreateRequest = await this.proposalFactory.getModel(proposalMessage);
        let createdProposalModel: Proposal = await this.proposalService.create(proposalCreateRequest);
        const createdProposal: resources.Proposal = createdProposalModel.toJSON();

        // TODO: Validation??
        // - sanity check for proposal start/end blocks vs current one

        // Set up the proposal result stuff for later.
        const proposalResult = await this.createProposalResult(createdProposal);

        createdProposalModel = await this.proposalService.findOne(createdProposal.id);
        return createdProposalModel.toJSON();
    }

    /**
     * creates empty ProposalResult for the Proposal
     *
     * @param {"resources".Proposal} proposal
     * @returns {Promise<"resources".ProposalResult>}
     */
    private async createProposalResult(proposal: resources.Proposal): Promise<resources.ProposalResult> {
        const currentBlock: number = await this.coreRpcService.getBlockCount();

        let proposalResultModel = await this.proposalResultService.create({
            block: currentBlock,
            proposal_id: proposal.id
        } as ProposalResultCreateRequest);
        const proposalResult = proposalResultModel.toJSON();

        const proposalOptions: any = proposal.ProposalOptions;
        for (const proposalOption of proposalOptions) {
            const proposalOptionResult = this.proposalOptionResultService.create({
                weight: 0,
                voters: 0,
                proposal_option_id: proposalOption.id,
                proposal_result_id: proposalResult.id
            } as ProposalOptionResultCreateRequest);
            this.log.debug('processProposalReceivedEvent.proposalOptionResult = ' + JSON.stringify(proposalOptionResult, null, 2));
        }

        proposalResultModel = await this.proposalResultService.findOne(proposalResult.id);
        return proposalResultModel.toJSON();
    }

    private configureEventListeners(): void {
        this.eventEmitter.on(Events.ProposalReceivedEvent, async (event) => {
            await this.processProposalReceivedEvent(event);
        });
    }
}
