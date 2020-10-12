// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { ValidationException } from '../exceptions/ValidationException';
import { ActionMessageValidatorInterface } from './ActionMessageValidatorInterface';
import { MessageException } from '../exceptions/MessageException';
import { GovernanceAction } from '../enums/GovernanceAction';
import { ActionDirection } from '../enums/ActionDirection';
import { MissingParamException } from '../exceptions/MissingParamException';
import { ProposalAddMessage } from '../messages/action/ProposalAddMessage';


export class ProposalAddValidator implements ActionMessageValidatorInterface {

    constructor() {
        //
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

        if (message.action.type !== GovernanceAction.MPA_PROPOSAL_ADD) {
            throw new ValidationException('Invalid action type.', ['Accepting only ' + GovernanceAction.MPA_PROPOSAL_ADD]);
        }

        const actionMessage = message.action as ProposalAddMessage;

        if (_.isEmpty(actionMessage.category)) {
            throw new MessageException('action.category: missing');
        }
        if (_.isEmpty(actionMessage.submitter)) {
            throw new MessageException('action.submitter: missing');
        }
        if (_.isEmpty(actionMessage.title)) {
            throw new MessageException('action.title: missing');
        }
        if (_.isEmpty(actionMessage.description)) {
            throw new MessageException('action.description: missing');
        }
        if (_.isEmpty(actionMessage.options)) {
            throw new MessageException('action.options: missing');
        }
        if (actionMessage.options.length < 2) {
            throw new MessageException('action.options: min 2 options needed');
        }

        return true;
    }

    public async validateSequence(message: MarketplaceMessage, direction: ActionDirection): Promise<boolean> {
        return true;
    }
}
