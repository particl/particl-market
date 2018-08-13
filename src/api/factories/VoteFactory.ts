import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { VoteMessage } from '../messages/VoteMessage';
import { VoteMessageType } from '../enums/VoteMessageType';
import * as resources from 'resources';
import {VoteCreateRequest} from '../requests/VoteCreateRequest';
import {VoteUpdateRequest} from '../requests/VoteUpdateRequest';
import {ProposalOptionService} from '../services/ProposalOptionService';

export class VoteFactory {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ProposalOptionService) public proposalOptionService: ProposalOptionService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     *
     * @param {VoteMessageType} voteMessageType
     * @param {string} itemHash
     * @param {IdValuePair[]} idValuePairObjects
     * @returns {Promise<VoteMessage>}
     */
    public async getMessage(voteMessageType: VoteMessageType, proposal: resources.Proposal, proposalOption: resources.ProposalOption,
                            senderProfile: resources.Profile, currentBlock: number): Promise<VoteMessage> {

        const proposalHash = proposal.hash;
        const optionId = proposalOption.optionId;
        const voter = senderProfile.address;
        const block = currentBlock;
        const weight = 1;

        return {
            action: voteMessageType,
            proposalHash,
            optionId,
            voter,
            block,
            weight
        } as VoteMessage;
    }

    /**
     *
     * @param {VoteMessage} voteMessage
     * @param {"resources".Proposal} proposal
     * @param {number} block
     * @param {number} weight
     * @param {boolean} create
     * @returns {Promise<VoteCreateRequest | VoteUpdateRequest>}
     */
    public async getModel(voteMessage: VoteMessage, proposal: resources.Proposal, block: number, weight: number,
                          create: boolean): Promise<VoteCreateRequest | VoteUpdateRequest> {

        const voteRequest = {
            voter: voteMessage.voter,
            block,
            weight
        } as VoteCreateRequest;

        const option = await this.proposalOptionService.findOneByProposalAndOptionId(proposal.id, voteMessage.optionId);
        voteRequest.proposal_option_id = option.id;
        if (create) {
            return voteRequest as VoteCreateRequest;
        } else {
            return voteRequest as VoteUpdateRequest;
        }
    }

}
