// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { VoteMessage } from '../../messages/action/VoteMessage';
import { VoteCreateRequest } from '../../requests/model/VoteCreateRequest';
import { VoteUpdateRequest } from '../../requests/model/VoteUpdateRequest';
import { ProposalOptionService } from '../../services/model/ProposalOptionService';
import { ModelFactoryInterface } from '../ModelFactoryInterface';
import { VoteCreateParams } from '../ModelCreateParams';


export class VoteFactory implements ModelFactoryInterface {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.ProposalOptionService) public proposalOptionService: ProposalOptionService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     *
     * @param params
     * @returns {Promise<VoteCreateRequest>}
     */
    public async get(params: VoteCreateParams): Promise<VoteCreateRequest | VoteUpdateRequest> {

        const actionMessage: VoteMessage = params.actionMessage;
        const smsgMessage: resources.SmsgMessage = params.smsgMessage!;

        const voteRequest = {
            msgid: params.msgid,
            signature: actionMessage.signature,
            voter: actionMessage.voter,
            postedAt: !_.isNil(smsgMessage) ? smsgMessage.sent : undefined,
            receivedAt: !_.isNil(smsgMessage) ? smsgMessage.received : undefined,
            expiredAt: !_.isNil(smsgMessage) ? smsgMessage.expiration : undefined
        } as VoteCreateRequest || VoteUpdateRequest;

        if (params) {
            voteRequest.proposal_option_id = params.proposalOption.id;
            voteRequest.weight = params.weight;
        }
        return voteRequest;
    }
}
