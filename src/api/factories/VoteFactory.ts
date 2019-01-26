// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { VoteMessage } from '../messages/VoteMessage';
import { VoteMessageType } from '../enums/VoteMessageType';
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
     * @param proposalHash
     * @param proposalOptionHash
     * @param voter
     * @param signature
     * @returns {Promise<VoteMessage>}
     */
    public async getMessage(voteMessageType: VoteMessageType, proposalHash: string, proposalOptionHash: string,
                            voter: string, signature: string): Promise<VoteMessage> {

        const voteMessage = {
            action: voteMessageType,
            proposalHash,
            proposalOptionHash,
            signature,
            voter
        } as VoteMessage;

        return voteMessage;
    }

    /**
     *
     * @param {VoteMessage} voteMessage
     * @param proposalOption
     * @param {number} weight
     * @param create
     * @param smsgMessage
     * @returns {Promise<VoteCreateRequest | VoteUpdateRequest>}
     */
    public async getModel(voteMessage: VoteMessage, proposalOption: resources.ProposalOption, weight: number,
                          create: boolean, smsgMessage?: resources.SmsgMessage): Promise<VoteCreateRequest | VoteUpdateRequest> {

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

        if (create) {
            return {
                proposal_option_id: proposalOption.id,
                signature: voteMessage.signature,
                voter: voteMessage.voter,
                weight,
                ...smsgData
            } as VoteCreateRequest;
        } else {
            return {
                proposal_option_id: proposalOption.id,
                signature: voteMessage.signature,
                voter: voteMessage.voter,
                weight,
                ...smsgData
            } as VoteUpdateRequest;
        }
    }

}
