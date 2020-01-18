// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { ValidationException } from '../exceptions/ValidationException';
import { ActionMessageValidatorInterface } from './ActionMessageValidatorInterface';
import { MessageException } from '../exceptions/MessageException';
import { CommentAction } from '../enums/CommentAction';
import { ActionDirection } from '../enums/ActionDirection';

/**
 *
 */
export class CommentAddValidator implements ActionMessageValidatorInterface {

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

        if (message.action.type !== CommentAction.MPA_COMMENT_ADD) {
            throw new ValidationException('Invalid action type.', ['Accepting only ' + CommentAction.MPA_COMMENT_ADD]);
        }

        // TODO: check required fields exists
        return true;
    }

    public async validateSequence(message: MarketplaceMessage, direction: ActionDirection): Promise<boolean> {
        return true;
    }
}
