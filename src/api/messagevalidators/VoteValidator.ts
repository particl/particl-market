// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { ValidationException } from '../exceptions/ValidationException';
import { ActionMessageValidatorInterface } from './ActionMessageValidatorInterface';
import { MessageException } from '../exceptions/MessageException';
import { GovernanceAction } from '../enums/GovernanceAction';
import { VoteMessage } from '../messages/action/VoteMessage';
import { inject, named } from 'inversify';
import { Targets, Types } from '../../constants';
import { ProposalService } from '../services/model/ProposalService';
import {ActionDirection} from '../enums/ActionDirection';

/**
 *
 */
export class VoteValidator implements ActionMessageValidatorInterface {

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.ProposalService) public proposalService: ProposalService
    ) {
    }

    public async validateMessage(message: MarketplaceMessage, direction: ActionDirection): Promise<boolean> {
        if (!message.version) {
            throw new MessageException('version: missing');
        }

        if (!message.action) {
            throw new MessageException('action: missing');
        }

        if (!message.action.type) {
            throw new MessageException('action.type: missing');
        }

        if (message.action.type !== GovernanceAction.MPA_VOTE) {
            throw new ValidationException('Invalid action type.', ['Accepting only ' + GovernanceAction.MPA_VOTE]);
        }

        // TODO: check required message fields exists

        return true;
    }

    public async validateSequence(message: MarketplaceMessage, direction: ActionDirection): Promise<boolean> {
        // MPA_PROPOSAL_ADD should exists
        // -> (msg.action as MPA_VOTE).proposalHash is the hash of Proposal
        return await this.proposalService.findOneByHash((message.action as VoteMessage).proposalHash, true)
            .then( () => true)
            .catch( () => false);
    }
}
