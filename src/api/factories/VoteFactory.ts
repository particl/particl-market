// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { VoteMessage } from '../messages/VoteMessage';
import { VoteMessageType } from '../enums/VoteMessageType';
import * as resources from 'resources';
import { VoteCreateRequest } from '../requests/VoteCreateRequest';
import { VoteUpdateRequest } from '../requests/VoteUpdateRequest';
import { ProposalOptionService } from '../services/ProposalOptionService';

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
     * @param proposal
     * @param proposalOption
     * @param voter
     * @returns {Promise<VoteMessage>}
     */
    public async getMessage(voteMessageType: VoteMessageType, proposal: resources.Proposal, proposalOption: resources.ProposalOption,
                            senderAddress: string): Promise<VoteMessage> {

        const proposalHash = proposal.hash;
        const optionId = proposalOption.optionId;
        const voter = senderAddress;
        const weight = 1;

        return {
            action: voteMessageType,
            proposalHash,
            optionId,
            voter
        } as VoteMessage;
    }

    /**
     *
     * @param {VoteMessage} voteMessage
     * @param {"resources".Proposal} proposal
     * @param proposalOption
     * @param {number} weight
     * @param {boolean} create
     * @param smsgMessage
     * @returns {Promise<VoteCreateRequest | VoteUpdateRequest>}
     */
    public async getModel(voteMessage: VoteMessage, proposal: resources.Proposal, proposalOption: resources.ProposalOption,
                          weight: number, create: boolean, smsgMessage?: resources.SmsgMessage): Promise<VoteCreateRequest | VoteUpdateRequest> {

        const smsgData: any = {
            postedAt: Number.MAX_SAFE_INTEGER,
            receivedAt: Number.MAX_SAFE_INTEGER,
            expiredAt: Number.MAX_SAFE_INTEGER
        };

        if (smsgMessage) {
            smsgData.postedAt = smsgMessage.sent;
            smsgData.receivedAt = smsgMessage.received;
            smsgData.expiredAt = smsgMessage.expiration;
        }

        const voteRequest = {
            proposal_option_id: proposalOption.id,
            voter: voteMessage.voter,
            oldWeight: weight,
            ...smsgData
        } as VoteCreateRequest;

        // this.log.debug('getModel(), voteRequest:', JSON.stringify(voteRequest, null, 2));

        return voteRequest;
    }

}
