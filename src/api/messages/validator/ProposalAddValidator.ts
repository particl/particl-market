// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { MarketplaceMessage } from '../MarketplaceMessage';
import { ValidationException } from '../../exceptions/ValidationException';
import { ActionMessageValidatorInterface } from './ActionMessageValidatorInterface';
import { MessageException } from '../../exceptions/MessageException';
import { GovernanceAction } from '../../enums/GovernanceAction';

/**
 *
 */
export class ProposalAddValidator implements ActionMessageValidatorInterface {

    public static isValid(msg: MarketplaceMessage): boolean {
        if (!msg.version) {
            throw new MessageException('version: missing');
        }

        if (!msg.action) {
            throw new MessageException('action: missing');
        }

        if (!msg.action.type) {
            throw new MessageException('action.type: missing');
        }

        if (msg.action.type !== GovernanceAction.MPA_PROPOSAL_ADD) {
            throw new ValidationException('Invalid action type.', ['Accepting only ' + GovernanceAction.MPA_PROPOSAL_ADD]);
        }

        // TODO: check required fields exists
        // TODO: check that there are at least 2 options

        return true;

    }
}
